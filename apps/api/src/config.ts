import { z } from "zod";

/**
 * Environment configuration. Only the variables needed by the current
 * milestone are required; third-party keys become required in the milestone
 * that first uses them (see .env.example).
 */
const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(3000),
  DATABASE_URL: z.string().min(1),
  PUBLIC_BASE_URL: z.string().url().default("http://localhost:3000"),
  INTERNAL_SHARED_SECRET: z.string().min(1).default("change-me"),
  ADMIN_USER: z.string().min(1).default("admin"),
  ADMIN_PASSWORD: z.string().min(1).default("change-me"),
  TZ_DISPLAY: z.string().min(1).default("Europe/Riga"),
});

export type Config = z.infer<typeof envSchema>;

export function loadConfig(env: NodeJS.ProcessEnv = process.env): Config {
  const parsed = envSchema.safeParse(env);
  if (!parsed.success) {
    const problems = parsed.error.issues
      .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
      .join("; ");
    throw new Error(`Invalid environment: ${problems}`);
  }
  const config = parsed.data;
  if (config.NODE_ENV === "production") {
    for (const key of ["INTERNAL_SHARED_SECRET", "ADMIN_PASSWORD"] as const) {
      if (config[key] === "change-me") {
        throw new Error(`Invalid environment: ${key} must be set in production`);
      }
    }
  }
  return config;
}
