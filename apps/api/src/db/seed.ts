import postgres from "postgres";
import { DEFAULT_SETTINGS } from "../settings/defaults.js";

/**
 * Development seed. Idempotent: existing settings and songs are left as they are.
 *
 * Songs are placeholders that point at keys under the `dev/` prefix of our own
 * bucket. Upload Creative Commons tracks there for local testing (SPEC §10).
 * Nothing here references an external streaming service.
 */
const DEV_SONGS = [
  { title: "Test Track 01", artist: "Test Artist A", durationSec: 201, fileKey: "dev/track-01.mp3" },
  { title: "Test Track 02", artist: "Test Artist A", durationSec: 187, fileKey: "dev/track-02.mp3" },
  { title: "Test Track 03", artist: "Test Artist B", durationSec: 224, fileKey: "dev/track-03.mp3" },
  { title: "Test Track 04", artist: "Test Artist B", durationSec: 195, fileKey: "dev/track-04.mp3" },
  { title: "Test Track 05", artist: "Test Artist C", durationSec: 243, fileKey: "dev/track-05.mp3" },
  { title: "Test Track 06", artist: "Test Artist C", durationSec: 178, fileKey: "dev/track-06.mp3" },
  { title: "Test Track 07", artist: "Test Artist D", durationSec: 210, fileKey: "dev/track-07.mp3" },
  { title: "Test Track 08", artist: "Test Artist D", durationSec: 232, fileKey: "dev/track-08.mp3" },
  { title: "Test Track 09", artist: "Test Artist E", durationSec: 199, fileKey: "dev/track-09.mp3" },
  { title: "Test Track 10", artist: "Test Artist E", durationSec: 216, fileKey: "dev/track-10.mp3" },
  { title: "Test Track 11", artist: "Test Artist F", durationSec: 189, fileKey: "dev/track-11.mp3" },
  { title: "Test Track 12", artist: "Test Artist F", durationSec: 205, fileKey: "dev/track-12.mp3" },
];

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error("DATABASE_URL is not set");
  process.exit(1);
}
if (process.env.NODE_ENV === "production") {
  console.error("Refusing to seed in production");
  process.exit(1);
}

const sql = postgres(databaseUrl, { max: 1 });
try {
  for (const [key, value] of Object.entries(DEFAULT_SETTINGS)) {
    await sql`
      insert into settings (key, value) values (${key}, ${sql.json(value)})
      on conflict (key) do nothing`;
  }
  for (const song of DEV_SONGS) {
    await sql`
      insert into songs (title, artist, duration_sec, file_key, tags)
      values (${song.title}, ${song.artist}, ${song.durationSec}, ${song.fileKey}, ${["dev"]})
      on conflict (file_key) do nothing`;
  }
  console.log(`Seeded ${Object.keys(DEFAULT_SETTINGS).length} settings, ${DEV_SONGS.length} songs`);
} finally {
  await sql.end({ timeout: 5 });
}
