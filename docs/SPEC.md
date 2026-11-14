# Product spec — Angel Stream POC

Items marked `[OPEN]` are not decided yet. Build the default and keep it configurable.

## 1. Goal
Show, end to end, that a listener can order a song with a greeting, pay, and
hear it on a live stream at the announced time — with no staff involvement.

Scope is a POC: one stream, one voice, test payments first, a small music library.

## 2. Donor flow
1. On the Eņģeļi pār Latviju page the donor sees one block: what is playing now,
   a "Klausīties tiešraidi" button and one "Pasūtīt dziesmu" button.
2. "Pasūtīt dziesmu" opens the order flow, one question per screen (Typeform style):
   1. Song — the only search in the product. Picking a song moves on.
   2. First name.
   3. Town or county.
   4. Who it is for — quick choices or free text. Optional.
   5. Short wish — quick choices or free text, max 100 characters. Optional.
   6. Review — the exact greeting text that will air, the song, the expected time window.
   7. Email — for the notice 30 minutes before.
   8. Donation — 3, 5, 10 or 20 EUR, default 3. Consent checkboxes. Pay button.
3. Payment happens on Paysera's hosted page.
4. After payment the donor sees a thank-you screen with the expected time window.
5. About 30 minutes before airing the donor gets an email with the exact time,
   the greeting text, a listen link and a cancel link.
6. On air: AI-voice jingle → greeting → song.

## 3. Order rules
- Ordering is open 08:00–21:00 Europe/Riga, every day.
- Ordering also closes for the day when the day's greeting slots are sold out.
  The block then shows the closed state ("Šodienas sveicieni ir pasūtīti").
- Minimum donation 3 EUR. A higher amount does not change when the song plays.
  The UI says so.
- One order = one song = one greeting = one play. If five people order the same
  song, each gets their own play with their own greeting.
- The song must exist in the library. No free-text song requests.
- The donor can cancel the greeting until it airs. The donation is not refunded
  automatically `[OPEN: refund policy]`; a cancelled order plays nothing.

## 4. Greeting rules
- Input fields: first name (max 20), town (max 24), recipient (max 24, optional),
  wish (max 100, optional).
- The on-air text is produced on the server from those fields with a fixed template:
  who, from where, for whom, the wish, and a closing thank-you for supporting
  Eņģeļi pār Latviju. An LLM step fixes Latvian grammar (noun cases for the name,
  town and recipient) without adding content.
- The review screen shows exactly the text that will be voiced. The donor approves
  that text, not their raw input.
- Target length 8–12 seconds, hard cap 15 seconds of audio.
- Moderation runs before payment is requested, so a donor is not charged for a
  greeting we will not air:
  - blocklist (insults, politics, advertising, links);
  - LLM check for surnames, phone numbers, addresses, health information,
    hate or harassment, anything about a third party that could embarrass them.
  - If rejected, the form explains why and lets the donor edit.
- A second, cheaper check runs after payment as a safety net. If it fails then,
  the song plays with a neutral greeting (name and town only) and the donor is
  emailed `[OPEN: confirm this fallback]`.
- Every greeting is preceded by a short jingle that says it is voiced by AI.

## 5. Scheduling rules
The scheduler decides when each paid order plays. It is a pure function over the
current queue, the play log and settings.

- At most 1 greeting per 3 songs. Default cap 4 greetings per hour, configurable
  per hour of day (for example 3 in the morning, 6 in the evening).
- Never two greetings back to back. At least 2 plain songs between greetings.
- The same song at most once per 60 minutes (configurable).
- The same artist not within 20 minutes (configurable).
- Orders are served first come, first served by payment time, subject to the
  rules above. An order blocked by the repeat rule is skipped for now, not dropped.
- Songs without a greeting come from a normal rotation of the same library.
- Greetings air between 08:30 and 23:00 `[OPEN: latest airing time]`.
- Daily capacity = sum of hourly caps. When paid + pending orders reach it,
  ordering closes for the day.

### Time promises
- At order time the UI shows a one-hour window ("šodien ~20:00–21:00"), computed
  by simulating the schedule with the new order added.
- 30 minutes before the planned start the order is **locked**: its position no
  longer changes. The email is sent at lock time with the exact planned time.
- The actual start may drift by a few minutes; the email says so.

## 6. Payments (Paysera)
- Paysera Checkout, hosted payment page. Methods: bank link, card, Apple Pay,
  Google Pay — whatever the project has enabled.
- Our server creates the order with its own ID and sends that ID and the amount
  to Paysera. The plain "donate button" (order ID 0) is not enough because the
  callback must identify the song and greeting.
- The callback is the only source of payment truth: verify the signature, check
  amount and currency against the order, answer as Paysera requires, be idempotent.
- Start in Paysera test mode. Going live needs a verified project.
- `[OPEN]` Which legal entity owns the Paysera project and receives the money
  (TV3 Group or the Children's Hospital Foundation).

## 7. Emails
1. Receipt after payment: song, greeting text, time window, cancel link.
2. Notice at lock time (T-30 min): exact time, listen link, cancel link.
3. Moderation fallback notice, if the post-payment check fails.

No marketing email unless the donor ticked the optional box.

## 8. Privacy (GDPR) — requirements for the build
Legal sign-off is still needed; build to these defaults.

- Data collected: first name, town, recipient relation, wish, email, amount,
  consent timestamps. Nothing else. No surnames.
- Consent to air name, town and greeting: explicit checkbox, unticked by default,
  timestamp stored.
- Age confirmation: at least 16 `[OPEN: 14 or 16, or parental confirmation]`.
- Marketing opt-in: separate, optional, unticked.
- Retention: greeting text, audio and email are deleted 30 days after airing
  `[OPEN: confirm 30 days]`. A daily job enforces it. Keep only order ID, amount,
  timestamps and status for accounting.
- Processors: ElevenLabs gets only the greeting text. The LLM gets only the
  greeting fields. The email provider gets the email and message body.
  Prefer EU hosting regions.
- Rights: cancel link in every email; a documented way to delete an order on request.
- Logs must not contain personal fields.
- The privacy policy link and controller name are placeholders until legal
  provides them `[OPEN]`.

## 9. Staff controls
A small password-protected admin page:
- upcoming queue with greeting texts;
- remove or skip an item;
- pause greetings (music continues);
- kill switch: close ordering and stop greetings at once;
- today's totals: orders, euros, greetings aired, greetings rejected.

## 10. Music library for the POC
- Development: Creative Commons tracks (for example Jamendo) so nothing licensed
  sits on a test server.
- Management demo: a small export of Star FM's own licensed library.
- Not YouTube, ever. Swapping libraries must only mean pointing at another bucket
  prefix and re-importing metadata.

## 11. Out of scope for the POC
Bidding or queue jumping, song battles, goal unlocks, sponsor matching, city
competitions, ad-free listening, mobile app integration, FM playout (Zetta/GSelector),
push or SMS notifications.

## 12. Success measures to log
Orders started vs paid, euros raised, average donation, greetings aired, greetings
rejected and why, schedule accuracy (planned vs actual start), listener drop-off in
the 30 seconds after a greeting compared with a normal song change.
