// Railway Infrastructure as Code (replaces railway.json/toml, which Railway
// retires on 2026-12-01). Written from the IaC reference; NOT yet planned or
// applied against a real project. Before first use:
//   1. Set GITHUB_REPO below to the real "owner/name".
//   2. Run the Railway CLI's config plan and check the output.
//   3. Confirm how a Dockerfile build is selected for each service (the
//      reference documents github() and image() sources; Railway builds with a
//      Dockerfile when it finds one in the root directory).
import { defineRailway, github, postgres, preserve, project, service, volume } from "railway/iac";

const GITHUB_REPO = "OWNER/angel-stream"; // TODO: real repository
const REGION = "europe-west4"; // EU region, per SPEC §8 "prefer EU hosting"

export default defineRailway(() => {
  const db = postgres("postgres");

  // HLS segments and playlist state; keeps segment numbering across restarts.
  // A service with a volume cannot have replicas — the streamer is single-instance.
  const hls = volume("streamer-hls", { region: REGION, sizeMB: 1024 });

  const api = service("api", {
    source: github(GITHUB_REPO),
    healthcheck: "/healthz",
    replicas: { [REGION]: 1 },
    env: {
      NODE_ENV: "production",
      TZ_DISPLAY: "Europe/Riga",
      DATABASE_URL: db.env.DATABASE_URL,
      // Secrets are set in Railway, never in this file.
      PUBLIC_BASE_URL: preserve(),
      INTERNAL_SHARED_SECRET: preserve(),
      ADMIN_USER: preserve(),
      ADMIN_PASSWORD: preserve(),
    },
  });

  const streamer = service("streamer", {
    source: github(GITHUB_REPO),
    replicas: { [REGION]: 1 },
    volumeMounts: { "/data": hls },
    env: {
      HLS_DIR: "/data/hls",
      INTERNAL_SHARED_SECRET: preserve(),
    },
  });

  return project("angel-stream", {
    resources: [db, api, streamer, hls],
  });
});
