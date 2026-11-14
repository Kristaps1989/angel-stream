import { describe, expect, it } from "vitest";
import { buildApp } from "./app.js";
import { loadConfig } from "./config.js";
import { PERSONAL_FIELDS, redactPaths } from "./logging.js";
import { DEFAULT_SETTINGS, settingsSchema } from "./settings/defaults.js";

describe("healthz", () => {
  it("returns 200 when the database answers", async () => {
    const app = buildApp({ pingDb: async () => true, logLevel: "silent" });
    const res = await app.inject({ method: "GET", url: "/healthz" });
    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual({ ok: true });
  });

  it("returns 503 when the database is unreachable", async () => {
    const app = buildApp({
      pingDb: async () => {
        throw new Error("down");
      },
      logLevel: "silent",
    });
    const res = await app.inject({ method: "GET", url: "/healthz" });
    expect(res.statusCode).toBe(503);
  });
});

describe("config", () => {
  it("requires DATABASE_URL", () => {
    expect(() => loadConfig({})).toThrow(/DATABASE_URL/);
  });

  it("defaults the display time zone to Europe/Riga", () => {
    expect(loadConfig({ DATABASE_URL: "postgres://x" }).TZ_DISPLAY).toBe("Europe/Riga");
  });

  it("rejects placeholder secrets in production", () => {
    expect(() => loadConfig({ DATABASE_URL: "postgres://x", NODE_ENV: "production" })).toThrow(
      /INTERNAL_SHARED_SECRET/,
    );
  });
});

describe("log redaction", () => {
  it("covers every personal field at the top level and nested", () => {
    for (const field of PERSONAL_FIELDS) {
      expect(redactPaths).toContain(field);
      expect(redactPaths).toContain(`*.${field}`);
    }
  });
});

describe("default settings", () => {
  it("are valid", () => {
    expect(settingsSchema.parse(DEFAULT_SETTINGS)).toEqual(DEFAULT_SETTINGS);
  });

  it("keep the minimum donation at 300 cents and offer it first", () => {
    expect(DEFAULT_SETTINGS.minDonationCents).toBe(300);
    expect(DEFAULT_SETTINGS.donationOptionsCents[0]).toBe(300);
  });

  it("give 4 greetings per hour across the airing window", () => {
    const total = DEFAULT_SETTINGS.greetingsPerHour.reduce((sum, n) => sum + n, 0);
    expect(total).toBe(60);
  });
});
