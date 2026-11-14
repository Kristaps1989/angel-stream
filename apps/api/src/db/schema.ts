import {
  boolean,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  bigserial,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

/**
 * Typed view of the tables. The SQL files in apps/api/migrations are the
 * source of truth for the database; keep this file in step with them.
 * All timestamps are timestamptz and stored in UTC.
 */

export const ORDER_STATUSES = [
  "draft",
  "pending_payment",
  "paid",
  "ready",
  "locked",
  "aired",
  "rejected",
  "cancelled",
  "expired",
] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const PLAY_KINDS = ["song", "greeting", "jingle"] as const;
export type PlayKind = (typeof PLAY_KINDS)[number];

export const orderStatus = pgEnum("order_status", ORDER_STATUSES);
export const playKind = pgEnum("play_kind", PLAY_KINDS);

const ts = (name: string) => timestamp(name, { withTimezone: true, mode: "date" });

export const songs = pgTable("songs", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  artist: text("artist").notNull(),
  durationSec: integer("duration_sec").notNull(),
  // Object key inside our own storage bucket. Never an external URL.
  fileKey: text("file_key").notNull().unique(),
  tags: text("tags").array().notNull().default([]),
  active: boolean("active").notNull().default(true),
  createdAt: ts("created_at").notNull().defaultNow(),
});

export const orders = pgTable("orders", {
  id: uuid("id").primaryKey().defaultRandom(),
  publicToken: text("public_token").notNull().unique(),
  songId: uuid("song_id")
    .notNull()
    .references(() => songs.id),

  // Personal data — nulled by the purge job after purge_after. Never log.
  donorName: text("donor_name"),
  donorCity: text("donor_city"),
  recipient: text("recipient"),
  wish: text("wish"),
  greetingText: text("greeting_text"),
  email: text("email"),

  // Integer cents. Minimum 300 (enforced by a CHECK). Never affects scheduling.
  amountCents: integer("amount_cents").notNull(),
  currency: text("currency").notNull().default("EUR"),

  status: orderStatus("status").notNull().default("draft"),
  payseraRef: text("paysera_ref"),

  consentAirAt: ts("consent_air_at"),
  consentAgeAt: ts("consent_age_at"),
  marketingOptIn: boolean("marketing_opt_in").notNull().default(false),

  createdAt: ts("created_at").notNull().defaultNow(),
  paidAt: ts("paid_at"),
  plannedStart: ts("planned_start"),
  lockedAt: ts("locked_at"),
  notifiedAt: ts("notified_at"),
  airedAt: ts("aired_at"),
  cancelledAt: ts("cancelled_at"),
  purgeAfter: ts("purge_after"),
});

export const greetings = pgTable("greetings", {
  orderId: uuid("order_id")
    .primaryKey()
    .references(() => orders.id, { onDelete: "cascade" }),
  audioKey: text("audio_key").notNull(),
  durationMs: integer("duration_ms").notNull(),
  voiceId: text("voice_id").notNull(),
  createdAt: ts("created_at").notNull().defaultNow(),
});

export const playLog = pgTable("play_log", {
  id: bigserial("id", { mode: "number" }).primaryKey(),
  startedAt: ts("started_at").notNull().defaultNow(),
  kind: playKind("kind").notNull(),
  songId: uuid("song_id").references(() => songs.id),
  orderId: uuid("order_id").references(() => orders.id, { onDelete: "set null" }),
});

export const settings = pgTable("settings", {
  key: text("key").primaryKey(),
  value: jsonb("value").notNull(),
  updatedAt: ts("updated_at").notNull().defaultNow(),
});
