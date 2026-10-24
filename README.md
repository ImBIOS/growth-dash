# growth-dash (private)

Personal growth dashboard: X + Threads + Bluesky posts vs ID + US benchmarks. Engagement over payout.

Stack: Better-T-Stack (Bun, Hono, tRPC, TanStack Router, Tailwind, Drizzle + SQLite). Run with Bun only.

## Pattern credit

Social-listening shape (sources normalize to one schema, SQLite, dashboard) is adapted from [VladUZH/harken](https://github.com/VladUZH/harken) (MIT, FastAPI + SQLite, HN/Reddit/Mastodon/Bluesky). Not a fork: new TypeScript implementation here, scrapers are our agent-browser flows for X/Threads/Bluesky, schema matches our benchmark store.

## Data flow

1. Scraper scheduled task (Mon/Thu 07:00) appends `memories/benchmarks/bench-YYYY-MM-DD.jsonl` (schema in that folder README). Seed copy lives in `data/benchmarks-seed.jsonl`.
2. Import: `DATABASE_URL=file:./local.db bun run db:seed` (reads `data/bench-*.jsonl`, upserts by id, recomputes eng_rate).
3. Dashboard reads SQLite via tRPC `growth` router: `/growth` shows review verdict (ours median vs ID/US medians), top ID/US hooks, latest our posts.

## Dev

```bash
bun install
bun run db:push        # create tables (drizzle, sqlite)
DATABASE_URL=file:./local.db bun run db:seed
bun run dev            # web :3001, api :3000
```

Open `/growth`. `local.db` is gitignored. Never commit session files or `.env`.

## Podman (myrehat-dev)

```bash
podman build -t growth-dash:local -f Containerfile .
podman volume create growth-dash-data
podman run -d --name growth-dash --restart unless-stopped \
  -p 127.0.0.1:3000:3000 -p 127.0.0.1:3001:3001 \
  -e VITE_SERVER_URL=http://localhost:3000 \
  -v growth-dash-data:/app/data growth-dash:local
curl localhost:3000/                                     # OK
curl localhost:3000/trpc/growth.stats                    # {"benchmarks":3,...}
```

Web http://localhost:3001, dashboard http://localhost:3001/growth. Entrypoint runs
`db:push`, idempotent `db:seed`, then dev servers. Data persists in the
`growth-dash-data` volume, never in the image or repo.
