# Build from the repository root: docker build -f apps/streamer/Dockerfile .
# Pin to an exact 2.4.x tag once M5 verifies the script against it.
FROM savonet/liquidsoap:v2.4.6

USER root
RUN mkdir -p /data/hls /fallback && chown -R liquidsoap:liquidsoap /data /fallback
USER liquidsoap

COPY apps/streamer/radio.liq /app/radio.liq
# Fallback tracks (our own files) are copied or mounted into /fallback.
COPY apps/streamer/fallback/ /fallback/

ENV HLS_DIR=/data/hls FALLBACK_DIR=/fallback PORT=8080
EXPOSE 8080
CMD ["/app/radio.liq"]
