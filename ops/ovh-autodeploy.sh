#!/usr/bin/env bash
# Autodeploy for the OVH server: every 5 minutes it pulls the newest images from GitHub's container registry (ghcr.io)
# for every app on the server, and restarts the ones whose image changed. Nothing deploys from GitHub, so no SSH keys
# or GitHub secrets are needed: push to main, GitHub builds the image, the server picks it up.
#
# Which apps: any folder in /docker or /opt whose compose file uses a ghcr.io/dev-perceptric/ or ghcr.io/perceptric/
# image. Moving an app to OVH is enough to put it on autodeploy. Apps that are stopped stay stopped. To leave a folder
# out, put an empty file named .no-autodeploy in it.
#
# Apps that download their code from GitHub when they start (no image to pull): put a file named .autodeploy-git in
# the folder with one line, "<owner>/<repo> <branch> <service> [<service>...]". autodeploy restarts those services
# when the branch gets a new commit. This script sets that up for /docker/morningtelos.
#
# Private images use the server's ghcr.io login (root's, or the sudo user's): sudo docker login ghcr.io
#
# Run on the OVH server (safe to run again):
#   curl -fsSL https://raw.githubusercontent.com/dev-perceptric/blazed-kitty/main/ops/ovh-autodeploy.sh | sudo bash
# Logs: sudo docker logs -f autodeploy
set -euo pipefail

D=/docker/autodeploy
mkdir -p "$D"

# The ghcr.io login autodeploy uses: root's, else the user who ran sudo (that's where `docker login` saves it).
AUTH=/root/.docker
if [ ! -f "$AUTH/config.json" ] && [ -n "${SUDO_USER:-}" ] && [ -f "/home/$SUDO_USER/.docker/config.json" ]; then
  AUTH=/home/$SUDO_USER/.docker
fi
mkdir -p "$AUTH"

# The Morning Telos website downloads its code from GitHub when it starts: restart it when main changes.
if [ -d /docker/morningtelos ] && [ ! -f /docker/morningtelos/.autodeploy-git ]; then
  echo "dev-perceptric/morning-telos main web app watchdog" > /docker/morningtelos/.autodeploy-git
fi

cat > "$D/run.sh" <<'RUN'
#!/bin/sh
# Runs inside the autodeploy container. /docker and /opt are mounted at the same paths as on the server.
INTERVAL=${INTERVAL:-300}
STATE=/docker/autodeploy/state
mkdir -p "$STATE"
log() { echo "$(date -u '+%F %T') $*"; }

compose_file() {
  for name in docker-compose.yml docker-compose.yaml compose.yml compose.yaml web-compose.yml; do
    if [ -f "$1/$name" ]; then echo "$1/$name"; return; fi
  done
}

# Compose files that use one of our images.
apps() {
  for dir in /docker/*/ /opt/*/; do
    dir=${dir%/}
    [ -f "$dir/.no-autodeploy" ] && continue
    f=$(compose_file "$dir")
    [ -n "$f" ] && grep -qE 'ghcr.io/(dev-)?perceptric/' "$f" && echo "$f"
  done
}

# Folders that follow a GitHub branch instead of an image.
git_apps() {
  for g in /docker/*/.autodeploy-git /opt/*/.autodeploy-git; do
    [ -f "$g" ] && [ ! -f "$(dirname "$g")/.no-autodeploy" ] && echo "$g"
  done
}

running() { [ -n "$(docker compose -f "$1" ps -q --status running 2>/dev/null)" ]; }
names() { xargs -n1 dirname 2>/dev/null | xargs -n1 basename 2>/dev/null | tr '\n' ' '; }

check_images() {
  changed=0
  for f in $(apps); do
    name=$(basename "$(dirname "$f")")
    running "$f" || continue   # someone may have stopped it on purpose
    if ! out=$(docker compose -f "$f" pull --quiet --ignore-buildable 2>&1); then
      log "$name: pull failed: $(echo "$out" | tail -1)"
      continue
    fi
    # Restart only when a pulled image is newer than what a container runs. Comparing image IDs on this server
    # (rather than trusting compose to decide) keeps a different compose version from recreating every app.
    stale=0
    for c in $(docker compose -f "$f" ps -q 2>/dev/null); do
      img=$(docker inspect -f '{{.Config.Image}}' "$c" 2>/dev/null)
      [ "$(docker inspect -f '{{.Image}}' "$c" 2>/dev/null)" = "$(docker image inspect -f '{{.Id}}' "$img" 2>/dev/null)" ] || stale=1
    done
    [ "$stale" = 1 ] || continue
    # Let compose finish before reading its output. Piping it into `grep -q` killed compose as soon as it printed
    # "Recreate", after the old container was stopped and before the new one started, leaving apps down.
    out=$(docker compose -f "$f" up -d 2>&1)
    if [ $? -ne 0 ]; then
      log "$name: restart failed: $(echo "$out" | tail -1)"
    elif echo "$out" | grep -q 'Recreat'; then
      log "$name: updated to the newest image"
      changed=1
    fi
  done
  [ "$changed" = 1 ] && docker image prune -f >/dev/null 2>&1
}

check_git() {
  for g in $(git_apps); do
    dir=$(dirname "$g"); name=$(basename "$dir")
    set -- $(head -1 "$g")
    repo=$1; branch=$2; shift 2
    f=$(compose_file "$dir")
    [ -n "$f" ] && running "$f" || continue
    sha=$(wget -qO- --header 'Accept: application/vnd.github.sha' "https://api.github.com/repos/$repo/commits/$branch" 2>/dev/null | head -c 40)
    if [ ${#sha} -ne 40 ]; then log "$name: couldn't read the newest commit of $repo $branch"; continue; fi
    old=$(cat "$STATE/$name.sha" 2>/dev/null)
    echo "$sha" > "$STATE/$name.sha"
    if [ -z "$old" ] || [ "$old" = "$sha" ]; then continue; fi
    if docker compose -f "$f" restart "$@" >/dev/null 2>&1; then
      log "$name: restarted $* for a new commit on $repo $branch ($(echo "$sha" | cut -c1-7))"
    else
      log "$name: restart failed"
    fi
  done
}

log "autodeploy started; checking every ${INTERVAL}s"
log "apps: $(apps | names)"
log "following GitHub: $(git_apps | names)"
while true; do
  check_images
  check_git
  sleep "$INTERVAL"
done
RUN

cat > "$D/docker-compose.yml" <<COMPOSE
# Pulls new ghcr.io/dev-perceptric and ghcr.io/perceptric images every 5 minutes and restarts the apps that changed.
# Written by ops/ovh-autodeploy.sh in the blazed-kitty repo. See run.sh.
services:
  autodeploy:
    image: docker:29-cli
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
      - $AUTH:/root/.docker:ro
    logging:
      driver: json-file
      options:
        max-size: 5m
        max-file: "2"
COMPOSE

cd "$D"
docker compose up -d --force-recreate
sleep 4
echo
docker logs autodeploy 2>&1 | tail -5
echo
if ! grep -q ghcr.io "$AUTH/config.json" 2>/dev/null; then
  echo "No ghcr.io login on this server yet. Private images (ghcr.io/perceptric/...) won't update until you run:"
  echo "  sudo docker login ghcr.io -u <your GitHub username>    (password: a GitHub token with read:packages)"
  echo "and then this script again."
else
  echo "Done. Using the ghcr.io login in $AUTH."
fi
