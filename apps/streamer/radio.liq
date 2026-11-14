# Angel Stream — Liquidsoap script (target: Liquidsoap 2.4.x).
#
# M0 placeholder: plays the local fallback playlist and serves HLS over HTTP.
# M5 adds the dynamic request source that asks the API for the next item
# (GET /internal/next-track) and reports starts (POST /internal/track-started).
# NOT yet run against a real Liquidsoap build — verify in M5.

settings.log.stdout.set(true)

hls_dir = environment.get(default="/data/hls", "HLS_DIR")
fallback_dir = environment.get(default="/fallback", "FALLBACK_DIR")
port = int_of_string(default=8080, environment.get(default="8080", "PORT"))

# Files baked into the image or mounted from our own bucket. Never an external
# streaming service.
fallback_music = playlist(mode="randomize", reload_mode="watch", fallback_dir)

# Never dead air: if the playlist is empty or unreadable, play silence.
radio = fallback(track_sensitive=false, [fallback_music, blank()])

aac = %ffmpeg(format="mpegts", %audio(codec="aac", b="128k", channels=2))

# Serves /stream.m3u8 and the segments itself, with CORS headers.
# persist_at + tmpdir on a volume keeps segment numbering across restarts.
output.harbor.hls(
  port=port,
  path="/",
  tmpdir=hls_dir,
  persist_at="state.json",
  segment_duration=4.,
  segments=6,
  segments_overhead=5,
  [("aac", aac)],
  radio
)
