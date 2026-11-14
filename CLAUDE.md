# Angel Stream (Eņģeļu straume) — project context for Claude Code

## What this is
A proof of concept for Star FM (TV3 Group Latvia). Listeners order a song with a
personal greeting on a dedicated digital radio stream and donate to the charity
campaign "Eņģeļi pār Latviju". The greeting is voiced by an AI voice (ElevenLabs)
and played before the song. The donor gets an email 30 minutes before it airs.

Everything is automated: order form → payment → moderation → voice generation →
scheduling → HLS stream → email.

## Read these first
- `docs/SPEC.md` — product rules. This is the source of truth for behaviour.
- `docs/ARCHITECTURE.md` — services, data model, API, environment variables.
- `docs/DESIGN.md` — how the UI must look and the Latvian copy.
- `docs/PLAN.md` — milestones. Work through them in order.
- `design/prototype.html` — runnable reference of the page block and order flow.

## Hard rules
1. **Music source.** Only files from our own storage bucket. Never download from
   or proxy YouTube or any other streaming service.
2. **Payment truth.** An order is paid only after a Paysera callback whose
   signature has been verified. Never trust the browser redirect.
3. **Personal data.** Store only: first name, town, recipient (a relation such as
   "mammai"), short wish, email. Never log these fields. Never send the email
   address to ElevenLabs or to the LLM. Purge per the retention rule in the spec.
4. **Money** is stored as integer cents. Minimum donation 300. The amount never
   affects scheduling.
5. **Time zone** is `Europe/Riga` for every rule the donor sees (opening hours,
   time windows, emails). Store timestamps in UTC.
6. **UI language** is Latvian. Code, comments and docs are English.
7. **Design.** The block lives inside the existing Eņģeļi pār Latviju page. Use
   the tokens and patterns in `docs/DESIGN.md`. Do not invent new visual patterns,
   gradients, dark panels or a separate landing page.
8. **Scheduler** is deterministic, pure and unit-tested. The LLM is used for
   moderation and greeting wording only, never for choosing what plays.
9. **Kill switch.** Every automated path (orders, greetings, stream requests)
   must respect the settings flags so staff can stop it instantly.

## How to work
- One milestone at a time. At the end of each: tests pass, a short note of what
  changed, and how to try it locally.
- If the spec is silent or contradicts itself, ask before building. Items marked
  `[OPEN]` in the spec need a decision from Kristaps; use the stated default
  and keep it configurable.
- Verify third-party details against current official docs before coding them
  (Paysera Checkout, ElevenLabs API, Liquidsoap, Railway). The notes here describe
  the intended approach and were not written from the live docs.
- Keep secrets in environment variables. Never commit them.

## Commands
Requires Node 22+, pnpm 9 (`corepack enable`), Docker (local Postgres).
Run from the repository root.

| Task | Command |
|---|---|
| Install | `pnpm install` |
| Start local Postgres | `pnpm db:up` (stop: `pnpm db:down`) |
| Apply migrations | `pnpm db:migrate` |
| Seed dev settings and songs | `pnpm db:seed` |
| Run api + widget in watch mode | `pnpm dev` (api :3000, widget :5173) |
| Tests (all packages) | `pnpm test` |
| Tests for one package | `pnpm --filter @angel/api test` |
| Type check | `pnpm typecheck` |
| Lint | `pnpm lint` |
| Format | `pnpm format` |

Layout: `apps/api` (Fastify, scheduler, jobs), `apps/widget` (Preact embed),
`apps/streamer` (Liquidsoap), `.railway/railway.ts` (Railway IaC).

Conventions:
- Database changes are new SQL files in `apps/api/migrations` (forward-only,
  applied in file-name order). Keep `apps/api/src/db/schema.ts` in step.
- Every tunable rule lives in `apps/api/src/settings/defaults.ts` and the
  `settings` table, never as a constant in feature code.
- `console.*` is a lint error in app code; use the Fastify logger, which
  redacts the personal fields listed in `apps/api/src/logging.ts`.
