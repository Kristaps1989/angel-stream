# Architecture — Angel Stream POC

This is the intended approach. Check each third-party detail against current
official docs before implementing it.

## Overview

```
Browser (EPL page block + order flow + HLS player)
      │  HTTPS
      ▼
  api  (Node + TypeScript)  ───────────►  Postgres
   │  ▲            │  │  │
   │  │            │  │  └─► Email provider (receipt, T-30 notice)
   │  │            │  └────► ElevenLabs TTS  → greeting audio → object storage
   │  │            └───────► LLM (moderation + Latvian wording)
   │  └── Paysera callback (signed)
   │
   │  GET /internal/next-track        POST /internal/track-started
   ▼
streamer (Liquidsoap) ──► HLS segments ──► CDN / static host ──► Browser player
      ▲
      └── audio files from object storage (songs, greetings, jingle)
```

## Services (Railway)
| Service | What it does |
|---|---|
| `api` | REST API, order flow, Paysera callback, scheduler, jobs, admin page, serves the widget |
| `streamer` | Liquidsoap container: asks `api` for the next item, plays it, outputs HLS |
| `postgres` | Railway Postgres |

Object storage (Cloudflare R2 or S3) holds songs, greeting audio and the jingle.

Notes for Railway:
- Containers restart. All queue state lives in Postgres, never in memory.
- HLS segments should go through a CDN before real listeners arrive; Railway
  bills egress. For the POC, serving segments from the streamer over HTTP is fine.
- Alternative delivery, to keep open: push the streamer's audio to Star FM's
  existing encoder/CDN as one more channel instead of serving HLS ourselves.

## Suggested stack
- `api`: Node 22, TypeScript, Fastify, Drizzle or Prisma, Zod, Vitest.
- Jobs: an in-process scheduler tick (every 30 s) guarded by a Postgres advisory
  lock, so a second instance cannot double-run.
- Frontend: the block and order flow as a small embeddable bundle (vanilla TS or
  Preact) with scoped CSS, so it can be dropped into the existing EPL page.
  Player: `hls.js`, native HLS on Safari.
- `streamer`: Liquidsoap with a dynamic request source that calls
  `GET /internal/next-track`, a fallback playlist for when the API is down, and
  HLS output (AAC, about 128 kbps, 4–6 s segments).

## Data model
```
songs        id, title, artist, duration_sec, file_key, tags[], active
orders       id (uuid), public_token, song_id,
             donor_name, donor_city, recipient, wish,      -- personal, purged
             greeting_text,                                 -- personal, purged
             email,                                         -- personal, purged
             amount_cents, currency,
             status, paysera_ref,
             consent_air_at, consent_age_at, marketing_opt_in,
             created_at, paid_at, planned_start, locked_at,
             notified_at, aired_at, cancelled_at, purge_after
greetings    order_id, audio_key, duration_ms, voice_id, created_at   -- purged
play_log     id, started_at, kind (song|greeting|jingle), song_id, order_id
settings     key, value   -- hourly caps, opening hours, repeat windows, flags
```

Order status:
`draft → pending_payment → paid → ready → locked → aired`
with side exits `rejected` (moderation, before payment), `cancelled`, `expired`
(unpaid after 30 minutes).

`ready` means paid, moderated and audio generated.

## API
Public:
```
GET  /api/now-playing            current song, greeting sender town
GET  /api/availability           open?, slots left today, reason if closed
GET  /api/songs?q=               search, max 8 results
POST /api/greeting-preview       fields → moderated, grammar-fixed on-air text
POST /api/orders                 creates order, returns Paysera redirect URL
GET  /api/orders/:token          status for the thank-you screen
POST /api/orders/:token/cancel   from the email link
ANY  /api/paysera/callback       signed payment notification
```
Internal (shared secret header):
```
GET  /internal/next-track        → { kind, url, orderId? }
POST /internal/track-started     writes play_log, marks order aired
```
Admin (basic auth): `/admin` and its small JSON endpoints.

Rate-limit the public POST endpoints.

## Scheduler
`planQueue(now, readyOrders, playLog, rotation, settings) → PlannedItem[]`

- Pure function, no I/O. Covered by unit tests for every rule in SPEC §5.
- Used three ways: by `/internal/next-track` (take the head), by the lock job
  (anything starting within 30 minutes gets locked and emailed), and by the order
  flow (simulate with the new order to show the time window and remaining slots).
- Locked items keep their order. New orders can only be planned after them.

## Order → air pipeline
1. `POST /api/greeting-preview`: blocklist → LLM moderation → LLM grammar fix →
   returns the on-air text and a short-lived signed token for it.
2. `POST /api/orders`: validates the token, consent and opening hours, reserves a
   slot, stores the order as `pending_payment`, returns the Paysera URL.
3. Callback: verify signature, amount and currency → `paid` (idempotent).
4. Job: generate TTS, measure duration (reject over 15 s and regenerate shorter),
   store audio → `ready`. Send the receipt email.
5. Lock job at T-30: `locked`, send the notice email.
6. Streamer requests the next track: jingle → greeting → song.
   `track-started` marks `aired`.
7. Purge job: after `purge_after`, null the personal columns and delete audio.

## Environment variables
```
DATABASE_URL
PUBLIC_BASE_URL
INTERNAL_SHARED_SECRET
ADMIN_USER / ADMIN_PASSWORD
PAYSERA_PROJECT_ID / PAYSERA_SIGN_PASSWORD / PAYSERA_TEST_MODE
ELEVENLABS_API_KEY / ELEVENLABS_VOICE_ID / ELEVENLABS_MODEL_ID
LLM_API_KEY / LLM_MODEL
EMAIL_API_KEY / EMAIL_FROM
STORAGE_ENDPOINT / STORAGE_BUCKET / STORAGE_ACCESS_KEY / STORAGE_SECRET_KEY
STREAM_PUBLIC_URL            (HLS playlist URL shown to the player)
TZ_DISPLAY=Europe/Riga
```

## Failure behaviour
- API down → streamer plays its fallback playlist; no dead air.
- TTS fails → retry, then play the song with the neutral greeting.
- Email fails → retry with backoff; never block airing on email.
- Paysera callback repeated → no double processing.
- Kill switch on → `/api/availability` reports closed, `next-track` returns
  rotation songs only.
