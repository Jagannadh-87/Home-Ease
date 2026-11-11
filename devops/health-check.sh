#!/usr/bin/env bash
# Waits for the backend to be healthy, then verifies the deployed build number via /api/info.
set -u
URL="${BACKEND_URL:-http://localhost:5000}"
for i in $(seq 1 30); do
  if curl -fsS "$URL/api/health" > /tmp/health.json 2>/dev/null; then
    echo "Health OK: $(cat /tmp/health.json)"; break
  fi
  echo "Waiting for backend ($i/30)..."; sleep 5
  if [ "$i" -eq 30 ]; then echo "Backend did not become healthy"; exit 1; fi
done
INFO=$(curl -fsS "$URL/api/info") || { echo "/api/info failed"; exit 1; }
echo "Build info: $INFO"
if [ -n "${BUILD_NUMBER:-}" ] && ! echo "$INFO" | grep -q "\"buildNumber\":\"$BUILD_NUMBER\""; then
  echo "Deployed build number does not match Jenkins build #$BUILD_NUMBER"; exit 1
fi
curl -fsS -o /dev/null "${FRONTEND_URL:-http://localhost:${FRONTEND_PORT:-80}}/" && echo "Frontend OK"
echo "All health checks passed"
