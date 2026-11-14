-- Angel Stream POC: initial schema.
-- All timestamps are timestamptz (stored in UTC). Money is integer cents.

CREATE TYPE order_status AS ENUM (
  'draft', 'pending_payment', 'paid', 'ready', 'locked', 'aired',
  'rejected', 'cancelled', 'expired'
);

CREATE TYPE play_kind AS ENUM ('song', 'greeting', 'jingle');

CREATE TABLE songs (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title        text NOT NULL,
  artist       text NOT NULL,
  duration_sec integer NOT NULL CHECK (duration_sec > 0),
  -- Object key inside our own storage bucket. Never an external URL.
  file_key     text NOT NULL UNIQUE,
  tags         text[] NOT NULL DEFAULT '{}',
  active       boolean NOT NULL DEFAULT true,
  created_at   timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE orders (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  public_token     text NOT NULL UNIQUE,
  song_id          uuid NOT NULL REFERENCES songs (id),

  -- Personal data: nulled by the purge job after purge_after. Never log.
  donor_name       text CHECK (char_length(donor_name) <= 20),
  donor_city       text CHECK (char_length(donor_city) <= 24),
  recipient        text CHECK (char_length(recipient) <= 24),
  wish             text CHECK (char_length(wish) <= 100),
  greeting_text    text,
  email            text,

  amount_cents     integer NOT NULL CHECK (amount_cents >= 300),
  currency         text NOT NULL DEFAULT 'EUR' CHECK (currency = 'EUR'),

  status           order_status NOT NULL DEFAULT 'draft',
  paysera_ref      text,

  consent_air_at   timestamptz,
  consent_age_at   timestamptz,
  marketing_opt_in boolean NOT NULL DEFAULT false,

  created_at       timestamptz NOT NULL DEFAULT now(),
  paid_at          timestamptz,
  planned_start    timestamptz,
  locked_at        timestamptz,
  notified_at      timestamptz,
  aired_at         timestamptz,
  cancelled_at     timestamptz,
  purge_after      timestamptz
);

-- Scheduler reads paid/ready/locked orders in payment order (first come, first served).
CREATE INDEX orders_queue_idx ON orders (paid_at)
  WHERE status IN ('paid', 'ready', 'locked');
-- Expiry job: unpaid orders older than 30 minutes.
CREATE INDEX orders_pending_idx ON orders (created_at)
  WHERE status = 'pending_payment';
-- Purge job.
CREATE INDEX orders_purge_idx ON orders (purge_after)
  WHERE purge_after IS NOT NULL;

CREATE TABLE greetings (
  order_id    uuid PRIMARY KEY REFERENCES orders (id) ON DELETE CASCADE,
  audio_key   text NOT NULL,
  duration_ms integer NOT NULL CHECK (duration_ms > 0),
  voice_id    text NOT NULL,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE play_log (
  id         bigserial PRIMARY KEY,
  started_at timestamptz NOT NULL DEFAULT now(),
  kind       play_kind NOT NULL,
  song_id    uuid REFERENCES songs (id),
  order_id   uuid REFERENCES orders (id) ON DELETE SET NULL
);

CREATE INDEX play_log_started_idx ON play_log (started_at DESC);

CREATE TABLE settings (
  key        text PRIMARY KEY,
  value      jsonb NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);
