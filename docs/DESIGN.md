# Design — block inside the Eņģeļi pār Latviju page

## Principle
This is one more section on an existing page, not a new page. It must look like
it was always there. Reuse the page's patterns; add none.

Reference files:
- `design/prototype.html` — runnable reference of the block and the order flow.
  Open it in a browser. Match its layout, spacing and copy.
- `design/epl-page-top-reference.png` — the top of the real page, cut from a Figma
  screenshot. This is the visual truth for colours, cards and buttons.
- `design/prototype-source/*.dc.html` — the design-tool source of each screen
  (template syntax, not runnable on its own). Useful for exact inline styles:
  `Main` block, `Order` flow, `Success`, `Email`, `Closed`, `Mobile`, and `Page`
  (the block placed in the full page).
- Figma (view access): "EPL website design", pages "Updates 2026" and "Components".

## Tokens
Colours were estimated from a screenshot and the font is a stand-in.
**Replace them with the exact Figma values before launch.**

| Token | Value | Use |
|---|---|---|
| Page background | `#F7F7F7` | behind cards |
| Card | `#FFFFFF`, radius 14px, shadow `0 4px 24px rgba(0,0,0,.08)` | all cards |
| Ink | `#1D1D1B` | text |
| Muted | `#555555` | secondary text |
| Red | `#E3342F` | large numbers, song title, progress line, step numbers |
| Yellow | `#E8B53B` | primary pill buttons (dark text) |
| Yellow ink | `#8A6300` | text of outline buttons |
| Line | `#E6E6E6` | dividers, 2px progress track |
| Font | Montserrat (stand-in) 400/600/700 | confirm the real font in Figma |

Buttons are pills (radius 999px). Filled yellow = primary action. White with a
1.5px yellow border = secondary. Only one filled button per card.

Layout: content column 980px, card gap 16px, small card width 316px.
Section title: 22px, regular weight, like the page's other section titles.

## The block (desktop)
- Section title: "Pasūti dziesmu ar sveicienu Eņģeļu straumē".
- Left card (316px): headphones icon, "Tagad skan Star FM Eņģeļu straumē",
  song title in large red, artist and greeting town, thin red progress line,
  outline button "Klausīties tiešraidi" / "Apturēt".
- Right card: headline "Velti dziesmu un savu sveicienu – ēterā" (last word red),
  one paragraph, one filled button "Pasūtīt dziesmu", and a two-line note:
  "Aizņem ~1 minūti · 8:00–21:00" / "E-pasts 30 min pirms tavas dziesmas".
- No search field, no song list and no queue on the page.

Placement: directly below "Visas ziedošanas iespējas". That section's free eighth
card becomes "Pasūtot dziesmu Star FM Eņģeļu straumē" with a button that scrolls
to the block.

Mobile (375px): the two cards stack, buttons are full width, minimum tap height 44px.

Closed state: same left card; the right card says "Šodienas sveicieni ir pasūtīti"
and "Pasūtīšana atsāksies rīt 8:00", with an outline button to the other ways to donate.

## Order flow (modal, Typeform style)
- Same modal shell as the page's auction modal: white, radius 16px, about 949px wide.
  Full screen on mobile.
- Thin red progress bar on top. "Eņģeļu straume · 3 no 8 · Pilsēta" and a close button.
- One question per screen, 26px semibold, with a small red "3 →" before it.
- Text answers: borderless input with a 2px yellow underline, 24px text. Focus
  turns the underline red.
- Choice answers: yellow outline pills (recipient, wish) or rows with a letter
  key (songs). Picking a song or a recipient moves on automatically.
- Footer: filled "OK ✓" button with the hint "vai nospied Enter ↵"; up/down
  buttons on the right to move between questions.
- Last screen: amount buttons (3 is preselected), the line "Pietiek ar 3 €.
  Lielāka summa neietekmē laiku – tā vienkārši palīdz vairāk.", consent
  checkboxes, and "Ziedot 3 € ar Paysera".
- Errors appear as one short red line under the answer. Never clear what the
  donor typed.

Accessibility: real `button`, `input`, `label` elements; focus moves to the new
question's field; Escape closes; contrast at least 4.5:1 (use yellow ink
`#8A6300` for text on white, never yellow itself).

## Copy
All UI copy is Latvian and is in `design/prototype.html`. Reuse it verbatim.
Bracketed values such as `[16]` are undecided and must stay configurable.
