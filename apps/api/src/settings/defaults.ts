import { z } from "zod";

/**
 * Every tunable rule from docs/SPEC.md, with its default. Values live in the
 * `settings` table (one row per key) so staff can change them without a deploy.
 * Items marked [OPEN] in the spec use the stated default and stay configurable.
 */
const hhmm = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/);

export const settingsSchema = z.object({
  // --- Kill switches (hard rule 9) ---
  /** false closes ordering at once. */
  orderingEnabled: z.boolean(),
  /** false stops greetings; music continues. */
  greetingsEnabled: z.boolean(),
  /** false makes the streamer play its own fallback playlist only. */
  streamRequestsEnabled: z.boolean(),

  // --- Opening hours, Europe/Riga (SPEC §3) ---
  orderingOpens: hhmm,
  orderingCloses: hhmm,

  // --- Scheduling (SPEC §5) ---
  /** Greetings air only inside this window, Europe/Riga. [OPEN: latest airing time] */
  greetingsAirFrom: hhmm,
  greetingsAirUntil: hhmm,
  /** Cap per hour of day, index 0–23 (Europe/Riga). Daily capacity is the sum. */
  greetingsPerHour: z.array(z.number().int().min(0)).length(24),
  /** Plain songs required between two greetings. */
  minSongsBetweenGreetings: z.number().int().min(0),
  songRepeatMinutes: z.number().int().min(0),
  artistRepeatMinutes: z.number().int().min(0),
  /** An order is locked (and the email sent) this long before its planned start. */
  lockLeadMinutes: z.number().int().min(0),

  // --- Orders and money (SPEC §3, §6) ---
  minDonationCents: z.number().int().min(300),
  donationOptionsCents: z.array(z.number().int().min(300)).min(1),
  unpaidExpiryMinutes: z.number().int().min(1),

  // --- Greeting (SPEC §4) ---
  greetingMaxAudioMs: z.number().int().min(1000),

  // --- Privacy (SPEC §8) ---
  /** [OPEN: 14 or 16, or parental confirmation] */
  minAge: z.number().int().min(0),
  /** [OPEN: confirm 30 days] */
  retentionDays: z.number().int().min(1),
  /** [OPEN] placeholders until legal provides them. */
  privacyPolicyUrl: z.string(),
  controllerName: z.string(),
});

export type Settings = z.infer<typeof settingsSchema>;

/** 4 greetings per hour in the hours that overlap the 08:30–23:00 airing window. */
const defaultGreetingsPerHour = Array.from({ length: 24 }, (_, hour) =>
  hour >= 8 && hour <= 22 ? 4 : 0,
);

export const DEFAULT_SETTINGS: Settings = {
  orderingEnabled: true,
  greetingsEnabled: true,
  streamRequestsEnabled: true,

  orderingOpens: "08:00",
  orderingCloses: "21:00",

  greetingsAirFrom: "08:30",
  greetingsAirUntil: "23:00",
  greetingsPerHour: defaultGreetingsPerHour,
  minSongsBetweenGreetings: 2,
  songRepeatMinutes: 60,
  artistRepeatMinutes: 20,
  lockLeadMinutes: 30,

  minDonationCents: 300,
  donationOptionsCents: [300, 500, 1000, 2000],
  unpaidExpiryMinutes: 30,

  greetingMaxAudioMs: 15_000,

  minAge: 16,
  retentionDays: 30,
  privacyPolicyUrl: "",
  controllerName: "",
};
