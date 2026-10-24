import { sqliteTable, text, integer, real, index } from "drizzle-orm/sqlite-core";

// Public benchmark posts (ID + US). No secrets, safe to commit.
export const benchmarks = sqliteTable(
  "benchmarks",
  {
    id: text("id").primaryKey(),
    platform: text("platform").notNull(),
    region: text("region").notNull(),
    author: text("author").notNull(),
    handle: text("handle").notNull(),
    followers: integer("followers").default(0).notNull(),
    text: text("text").notNull(),
    hookType: text("hook_type").notNull(),
    cta: text("cta").default("none").notNull(),
    views: integer("views").default(0).notNull(),
    likes: integer("likes").default(0).notNull(),
    reposts: integer("reposts").default(0).notNull(),
    replies: integer("replies").default(0).notNull(),
    engRate: real("eng_rate").default(0).notNull(),
    postedAt: text("posted_at"),
    url: text("url").notNull(),
    scrapedAt: text("scraped_at").notNull(),
  },
  (t) => [
    index("bench_platform_region_idx").on(t.platform, t.region),
    index("bench_eng_idx").on(t.engRate),
  ],
);

// Our own posts across X + Threads + Bluesky for review vs benchmarks.
export const ourPosts = sqliteTable(
  "our_posts",
  {
    id: text("id").primaryKey(),
    platform: text("platform").notNull(),
    pillar: text("pillar").notNull(),
    text: text("text").notNull(),
    url: text("url").notNull(),
    views: integer("views").default(0).notNull(),
    likes: integer("likes").default(0).notNull(),
    reposts: integer("reposts").default(0).notNull(),
    replies: integer("replies").default(0).notNull(),
    engRate: real("eng_rate").default(0).notNull(),
    postedAt: text("posted_at").notNull(),
    benchmarkIds: text("benchmark_ids").default("[]").notNull(),
  },
  (t) => [index("ours_platform_posted_idx").on(t.platform, t.postedAt)],
);
