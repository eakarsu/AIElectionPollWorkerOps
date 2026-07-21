#!/usr/bin/env bash
set -euo pipefail
launcher_root="$(cd "$(dirname "$0")" && pwd)"
root="$launcher_root"
if [ "${NODE_ENV:-}" = test ] && [ -n "${RUNTIME_PROJECT_SOURCE:-}" ] && [ -d "$RUNTIME_PROJECT_SOURCE" ]; then root="$(cd "$RUNTIME_PROJECT_SOURCE" && pwd)"; fi
cd "$root";[ -f "$launcher_root/.env" ]||{ echo "Missing .env; copy .env.example." >&2;exit 1; }
[ -d backend/node_modules ]&&[ -d frontend/node_modules ]||{ echo "Run scripts/bootstrap.sh first." >&2;exit 1; }
export ALLOWED_ORIGINS="${ALLOWED_ORIGINS:-http://127.0.0.1:${FRONTEND_PORT:-3000}}"
export REACT_APP_API_BASE="${REACT_APP_API_BASE:-http://127.0.0.1:${BACKEND_PORT:-3087}/api}"
backend_pid='';frontend_pid='';cleanup(){ [ -z "$backend_pid" ]||kill "$backend_pid" 2>/dev/null||true;[ -z "$frontend_pid" ]||kill "$frontend_pid" 2>/dev/null||true;};trap cleanup EXIT INT TERM
(cd backend&&npm start)&backend_pid=$!;(cd frontend&&BROWSER=none HOST="${FRONTEND_HOST:-127.0.0.1}" PORT="${FRONTEND_PORT:-3000}" npm start)&frontend_pid=$!;wait "$backend_pid" "$frontend_pid"
