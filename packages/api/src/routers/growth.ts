import { z } from "zod";

import { benchmarks, ourPosts } from "@bts-scaffold2/db";
import { publicProcedure, router } from "../index";

const topInput = z.object({
  region: z.enum(["ID", "US"]).optional(),
  platform: z.enum(["x", "threads", "bluesky"]).optional(),
  limit: z.number().min(1).max(50).default(10),
});

export const growthRouter = router({
  topBenchmarks: publicProcedure.input(topInput).query(async ({ ctx, input }) => {
    const rows = await ctx.db.query.benchmarks.findMany({
      limit: input.limit * 5,
    });
    const filtered = rows.filter(
      (r) =>
        (!input.region || r.region === input.region) &&
        (!input.platform || r.platform === input.platform),
    );
    return filtered.sort((a, b) => b.engRate - a.engRate).slice(0, input.limit);
  }),
  ourPosts: publicProcedure
    .input(z.object({ platform: z.string().optional(), limit: z.number().min(1).max(50).default(20) }))
    .query(async ({ ctx, input }) => {
      const rows = await ctx.db.query.ourPosts.findMany({
        limit: input.limit * 2,
      });
      const filtered = input.platform ? rows.filter((r) => r.platform === input.platform) : rows;
      return filtered
        .sort((a, b) => (a.postedAt < b.postedAt ? 1 : -1))
        .slice(0, input.limit);
    }),
  review: publicProcedure.query(async ({ ctx }) => {
    const [bench, ours] = await Promise.all([
      ctx.db.query.benchmarks.findMany({ limit: 500 }),
      ctx.db.query.ourPosts.findMany({ limit: 200 }),
    ]);
    const med = (xs: number[]) => {
      if (!xs.length) return 0;
      const s = [...xs].sort((a, b) => a - b);
      return s[Math.floor(s.length / 2)] ?? 0;
    };
    const benchRates = bench.map((b) => b.engRate);
    const ourRates = ours.map((o) => o.engRate);
    const byRegion = (region: string) =>
      med(bench.filter((b) => b.region === region).map((b) => b.engRate));
    const top = [...bench].sort((a, b) => b.engRate - a.engRate).slice(0, 5);
    return {
      counts: { benchmarks: bench.length, ours: ours.length },
      oursMedian: med(ourRates),
      benchMedian: med(benchRates),
      benchIDMedian: byRegion("ID"),
      benchUSMedian: byRegion("US"),
      top,
      hooks: [...top.map((t) => ({ id: t.id, hook: t.hookType, text: t.text.slice(0, 120), engRate: t.engRate }))],
      verdict:
        ours.length === 0 || med(ourRates) === 0
          ? "No performance data yet. Post via scheduled tasks, then re-run review."
          : med(ourRates) >= med(benchRates)
            ? "Above benchmark median. Double down on the top pattern and rotate pin to the winner."
            : "Below benchmark median. Rewrite hooks using top 3 benchmark patterns before next posts.",
    };
  }),
  stats: publicProcedure.query(async ({ ctx }) => {
    const [benchIds, ourIds] = await Promise.all([
      ctx.db.select({ id: benchmarks.id }).from(benchmarks),
      ctx.db.select({ id: ourPosts.id }).from(ourPosts),
    ]);
    return { benchmarks: benchIds.length, ours: ourIds.length };
  }),
});
