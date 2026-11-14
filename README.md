# Angel Stream — handoff package for Claude Code

A proof of concept for Star FM and "Eņģeļi pār Latviju": listeners order a song
with an AI-voiced greeting on a digital stream and donate through Paysera.

## What is in here
```
CLAUDE.md                  project context Claude Code reads automatically
docs/SPEC.md               product rules (source of truth)
docs/ARCHITECTURE.md       services, data model, API, environment variables
docs/DESIGN.md             visual rules and tokens for the page block
docs/PLAN.md               milestones M0–M8
design/prototype.html      runnable reference: page block + order flow
design/epl-page-top-reference.png   the real page, for visual matching
design/prototype-source/   design-tool source of every screen
```

## How to start
1. Unzip into an empty folder and run `git init`.
2. Open `design/prototype.html` in a browser to see the target behaviour
   (add `?closed=1` for the closed state).
3. Start Claude Code in the folder and paste the first prompt below.

## First prompt
```
Read CLAUDE.md and everything in docs/. Open design/prototype.html and
design/epl-page-top-reference.png as the UI reference.

Then, before writing code:
1. Summarise the product in ten lines so I can confirm you understood it.
2. List every [OPEN] item in docs/SPEC.md with the default you will use.
3. Check the current official docs for Paysera Checkout, the ElevenLabs
   text-to-speech API (Latvian support and model choice), Liquidsoap HLS output
   and Railway, and tell me anything that conflicts with docs/ARCHITECTURE.md.
4. Propose the repo layout and stack for milestone M0.

Wait for my go-ahead, then do M0 and M1 from docs/PLAN.md.
```

## Accounts and keys you will need
- Railway project (API, streamer, Postgres)
- Paysera project in test mode: project ID and sign password
- ElevenLabs API key and a chosen Latvian-capable voice
- LLM API key (moderation and greeting wording)
- Email provider API key and a sender address
- Object storage bucket (R2 or S3) with the test music library

## Decisions still open
See the `[OPEN]` items in `docs/SPEC.md`: who owns the Paysera project, minimum
age, retention period, refund policy, moderation fallback, latest airing time,
privacy policy text. The UI colours and font are estimates until taken from Figma.
