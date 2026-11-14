import Fastify, { type FastifyInstance } from "fastify";
import { redactPaths } from "./logging.js";

export interface AppDeps {
  /** Returns true when the database answers. */
  pingDb: () => Promise<boolean>;
  logLevel?: string;
}

export function buildApp(deps: AppDeps): FastifyInstance {
  const app = Fastify({
    logger: {
      level: deps.logLevel ?? "info",
      redact: { paths: redactPaths, censor: "[redacted]" },
    },
  });

  // Used by Railway's healthcheck. Reports 503 when Postgres is unreachable so
  // a broken deploy is not promoted.
  app.get("/healthz", async (_request, reply) => {
    const dbOk = await deps.pingDb().catch(() => false);
    return reply.code(dbOk ? 200 : 503).send({ ok: dbOk });
  });

  return app;
}
