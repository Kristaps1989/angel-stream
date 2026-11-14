import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import postgres from "postgres";

/**
 * Minimal forward-only migration runner: applies apps/api/migrations/*.sql in
 * file-name order, each in its own transaction, and records applied files in
 * schema_migrations. Safe to run on every deploy.
 */
const MIGRATIONS_DIR = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../migrations",
);
// Arbitrary constant; stops two deploys migrating at the same time.
const MIGRATION_LOCK_ID = 727_001;

export async function migrate(databaseUrl: string): Promise<string[]> {
  const sql = postgres(databaseUrl, { max: 1, onnotice: () => {} });
  const applied: string[] = [];
  try {
    await sql`select pg_advisory_lock(${MIGRATION_LOCK_ID})`;
    await sql`
      create table if not exists schema_migrations (
        name text primary key,
        applied_at timestamptz not null default now()
      )`;
    const done = new Set(
      (await sql<{ name: string }[]>`select name from schema_migrations`).map((row) => row.name),
    );
    const files = (await readdir(MIGRATIONS_DIR)).filter((name) => name.endsWith(".sql")).sort();
    for (const name of files) {
      if (done.has(name)) continue;
      const body = await readFile(path.join(MIGRATIONS_DIR, name), "utf8");
      await sql.begin(async (tx) => {
        await tx.unsafe(body);
        await tx`insert into schema_migrations (name) values (${name})`;
      });
      applied.push(name);
    }
    return applied;
  } finally {
    await sql`select pg_advisory_unlock(${MIGRATION_LOCK_ID})`.catch(() => {});
    await sql.end({ timeout: 5 });
  }
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error("DATABASE_URL is not set");
    process.exit(1);
  }
  const applied = await migrate(databaseUrl);
  console.log(applied.length ? `Applied: ${applied.join(", ")}` : "Nothing to migrate");
}
