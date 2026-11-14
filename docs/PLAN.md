# Build plan — Angel Stream POC

Work in order. Each milestone ends with passing tests and something to try.

## M0 — Scaffold
Repo layout (`apps/api`, `apps/widget`, `apps/streamer`), TypeScript, lint, tests,
Postgres schema and migrations, seed script, `.env.example`, Railway config.
Fill in the Commands section of `CLAUDE.md`.

## M1 — Scheduler core
`planQueue` as a pure function with unit tests for every rule in SPEC §5:
greetings per hour, no back-to-back greetings, song and artist repeat windows,
first come first served, locked items, daily capacity, time-window simulation.
No I/O yet.

## M2 — Order flow with fake payment
Widget: the block and the 8-step flow, ported from `design/prototype.html`.
API: songs search, availability, greeting preview (blocklist only for now),
create order, order status. A dev-only "mark as paid" endpoint.
Try: place an order locally and see it in the planned queue.

## M3 — Paysera (test mode)
Redirect to Paysera Checkout, signed callback, idempotency, expiry of unpaid
orders, thank-you screen driven by real status.

## M4 — Moderation and voice
LLM moderation and Latvian grammar fix in the preview endpoint. ElevenLabs TTS
job, duration check, storage upload, neutral-greeting fallback.
Record a short AI-disclosure jingle (TTS is fine for the POC).

## M5 — Stream
Liquidsoap container: dynamic requests from `/internal/next-track`, fallback
playlist, HLS output. `track-started` callback and play log. `hls.js` player in
the block; "Tagad skan" from `/api/now-playing`.
Try: order → pay (test) → hear jingle, greeting and song on the stream.

## M6 — Emails and cancel
Receipt, T-30 lock notice with exact time, cancel link, optional marketing flag.

## M7 — Staff controls
Admin page: queue, remove/skip, pause greetings, kill switch, daily totals.

## M8 — Privacy and hardening
Purge job, no personal data in logs, rate limits, input limits, opening hours and
sold-out state, time-zone tests around midnight and DST, a short runbook.

## Demo checklist
- [ ] Star FM library subset imported (replaces the CC test library)
- [ ] Exact colours and font from Figma applied
- [ ] Paysera project verified, or demo clearly in test mode
- [ ] Voice chosen and approved
- [ ] Open questions in SPEC answered or defaults accepted
