#!/usr/bin/env bash
# Pull GitHub main onto this VPS and reload the live app.
# Safe to run from systemd on a timer, or by hand: scripts/deploy.sh [--force]
set -euo pipefail

APP_DIR=/var/www/tanzania_safari
BRANCH=main
PM2_APP=tanzania-safari
LOCK_FILE=/var/run/tanzania-safari-deploy.lock
LOG_FILE="$APP_DIR/logs/deploy.log"
SSH_KEY=/root/.ssh/github_tanzania_safari

mkdir -p "$APP_DIR/logs"
exec 9>"$LOCK_FILE"
if ! flock -n 9; then
  echo "[$(date -Is)] skip: deploy already running" >> "$LOG_FILE"
  exit 0
fi

log() {
  echo "[$(date -Is)] $*" | tee -a "$LOG_FILE"
}

cd "$APP_DIR"

export GIT_SSH_COMMAND="ssh -i ${SSH_KEY} -o IdentitiesOnly=yes -o StrictHostKeyChecking=yes"

git fetch origin "$BRANCH"

LOCAL="$(git rev-parse HEAD)"
REMOTE="$(git rev-parse "origin/${BRANCH}")"

if [[ "${1:-}" != "--force" && "$LOCAL" == "$REMOTE" ]]; then
  exit 0
fi

log "Deploy start ${LOCAL:0:8} -> ${REMOTE:0:8}"

git reset --hard "origin/${BRANCH}"

npm install --omit=dev
npm rebuild
npm run build

pm2 reload "$PM2_APP" --update-env

if [[ -d /var/cache/nginx/tanzania_safari ]]; then
  find /var/cache/nginx/tanzania_safari -mindepth 1 -delete || true
fi

log "Deploy complete $(git rev-parse --short HEAD)"
