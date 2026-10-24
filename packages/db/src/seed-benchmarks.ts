// Import data/benchmarks-seed.jsonl (or scraper JSONL) into SQLite.
// Usage: bun run db:seed (from repo root, DATABASE_URL must point at the sqlite file)
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { benchmarks } from "./schema/growth";

const url = process.env.DATABASE_URL;
if (!url) throw new Error("Set DATABASE_URL to your sqlite file, e.g. file:./local.db");

const dir = join(import.meta.dir, "..", "..", "..", "data");
const files = readdirSync(dir)
  .filter((f) => f.startsWith("bench-") && f.endsWith(".jsonl"))
  .sort();
if (!files.length) files.push("benchmarks-seed.jsonl");

const db = drizzle({ client: createClient({ url }) });
let n = 0;
for (const f of files) {
  const lines = readFileSync(join(dir, f), "utf8").split("\n").filter(Boolean);
  for (const line of lines) {
    const r = JSON.parse(line);
    const views = r.views || 0;
    await db
      .insert(benchmarks)
      .values({
        id: r.id,
        platform: r.platform,
        region: r.region,
        author: r.author,
        handle: r.handle,
        followers: r.followers || 0,
        text: r.text,
        hookType: r.hook_type || r.hookType || "unknown",
        cta: r.cta || "none",
        views,
        likes: r.likes || 0,
        reposts: r.reposts || 0,
        replies: r.replies || 0,
        engRate: views ? (r.likes + r.reposts + r.replies) / views : 0,
        postedAt: r.posted_at || r.postedAt || null,
        url: r.url,
        scrapedAt: r.scraped_at || r.scrapedAt || new Date().toISOString(),
      })
      .onConflictDoNothing();
    n++;
  }
}
console.log(`seeded ${n} rows from ${files.length} files`);
