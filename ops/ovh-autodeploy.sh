#!/usr/bin/env bash
# Autodeploy for the OVH server: every 5 minutes it pulls the newest images from GitHub's container registry (ghcr.io)
# for every dev-perceptric app on the server, and restarts the ones whose image changed. Nothing deploys from GitHub,
# so no SSH keys or GitHub secrets are needed: push to main, GitHub builds the image, the server picks it up.
#
# Which apps: any folder in /docker or /opt whose compose file uses a ghcr.io/dev-perceptric/ image. Moving an app to
# OVH is enough to put it on autodeploy. Apps that are stopped stay stopped. To leave a folder out, put an empty file
# named .no-autodeploy in it.
#
# Run as root on the OVH server (safe to run again):
#   bash <(curl -fsSL https://raw.githubusercontent.com/dev-perceptric/blazed-kitty/main/ops/ovh-autodeploy.sh)
# Logs: docker logs -f autodeploy
set -euo pipefail

D=/docker/autodeploy
mkdir -p "$D" /root/.docker

cat > "$D/run.sh" <<'EOF'
#!/bin/sh
# Runs inside the autodeploy container. /docker and /opt are mounted at the same paths as on the server.
INTERVAL=${INTERVAL:-300}
log() { echo "$(date -u '+%F %T') $*"; }

apps() {
  for dir in /docker/*/ /opt/*/; do
    dir=${dir%/}
    [ -f "$dir/.no-autodeploy" ] && continue
    for name in docker-compose.yml docker-compose.yaml compose.yml compose.yaml web-compose.yml; do
      f="$dir/$name"
      if [ -f "$f" ]; then
        grep -q 'ghcr.io/dev-perceptric/' "$f" && echo "$f"
        break
      fi
    done
  done
}

log "autodeploy started; checking every ${INTERVAL}s"
log "apps: $(apps | xargs -n1 dirname 2>/dev/null | xargs -n1 basename 2>/dev/null | tr '\n' ' ')"
while true; do
  changed=0
  for f in $(apps); do
    dir=$(dirname "$f")
    # Leave stopped apps alone (someone may have stopped one on purpose).
    [ -n "$(docker compose -f "$f" ps -q --status running 2>/dev/null)" ] || continue
    if ! out=$(docker compose -f "$f" pull --quiet --ignore-buildable 2>&1); then
      log "$(basename "$dir"): pull failed: $(echo "$out" | tail -1)"
      continue
    fi
    out=$(docker compose -f "$f" up -d 2>&1)
    if echo "$out" | grep -q 'Recreat'; then
      log "$(basename "$dir"): updated to the newest image"
      changed=1
    fi
  done
  [ "$changed" = 1 ] && docker image prune -f >/dev/null 2>&1
  sleep "$INTERVAL"
done
EOF

cat > "$D/docker-compose.yml" <<'EOF'
# Pulls new ghcr.io/dev-perceptric images every 5 minutes and restarts the apps that changed. See run.sh.
services:
  autodeploy:
    image: docker:27-cli
    container_name: autodeploy
    entrypoint: ["/bin/sh", "/docker/autodeploy/run.sh"]
    restart: unless-stopped
    mem_limit: 128m
    environment:
      - INTERVAL=300
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
      - /docker:/docker
      - /opt:/opt
      - /root/.docker:/root/.docker:ro
    logging:
      driver: json-file
      options:
        max-size: 5m
        max-file: "2"
EOF

cd "$D"
docker compose up -d --force-recreate
sleep 3
echo
docker logs autodeploy 2>&1 | tail -5
echo
echo "Done. autodeploy keeps every dev-perceptric app on this server up to date."
echo "If an app's image is private, log this server into ghcr.io once:"
echo "  docker login ghcr.io -u <your GitHub username>   (password: a GitHub token with read:packages)"
