#!/bin/sh
# Local dashboard entrypoint: schema, seed, dev servers.
set -e
export DATABASE_URL="${DATABASE_URL:-file:/app/data/local.db}"
export CORS_ORIGIN="${CORS_ORIGIN:-http://localhost:3001}"
export VITE_SERVER_URL="${VITE_SERVER_URL:-http://localhost:3000}"
if [ -z "${BETTER_AUTH_SECRET:-}" ]; then
  export BETTER_AUTH_SECRET="$(bun -e 'console.log([...crypto.getRandomValues(new Uint8Array(32))].map((b)=>b.toString(16).padStart(2,"0")).join(""))')"
  echo "entrypoint: generated ephemeral BETTER_AUTH_SECRET (single-user local dashboard)"
fi
export BETTER_AUTH_URL="${BETTER_AUTH_URL:-http://localhost:3000}"
# push schema directly (turbo needs a TTY, drizzle-kit does not)
(cd packages/db && DATABASE_URL="$DATABASE_URL" bun x drizzle-kit push)
# seed benchmarks (idempotent)
DATABASE_URL="$DATABASE_URL" bun run db:seed || echo "entrypoint: seed skipped/failed, continuing"
exec bun run dev
