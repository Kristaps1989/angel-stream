import { buildApp } from "./app.js";
import { loadConfig } from "./config.js";
import { createDb } from "./db/client.js";

const config = loadConfig();
const { sql } = createDb(config.DATABASE_URL);

const app = buildApp({
  pingDb: async () => {
    await sql`select 1`;
    return true;
  },
  logLevel: config.NODE_ENV === "test" ? "silent" : "info",
});

const shutdown = async () => {
  await app.close();
  await sql.end({ timeout: 5 });
  process.exit(0);
};
process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);

try {
  await app.listen({ port: config.PORT, host: "0.0.0.0" });
} catch (error) {
  app.log.error(error);
  process.exit(1);
}
