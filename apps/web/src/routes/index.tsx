import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

import { trpc } from "@/utils/trpc";

export const Route = createFileRoute("/")({
  component: HomeComponent,
});

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border p-3">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="text-xl font-semibold">{value}</div>
    </div>
  );
}

function HomeComponent() {
  const review = useQuery(trpc.growth.review.queryOptions());
  const topID = useQuery(trpc.growth.topBenchmarks.queryOptions({ region: "ID", limit: 5 }));
  const topUS = useQuery(trpc.growth.topBenchmarks.queryOptions({ region: "US", limit: 5 }));
  const ours = useQuery(trpc.growth.ourPosts.queryOptions({ limit: 10 }));

  return (
    <div className="container mx-auto max-w-4xl px-4 py-6">
      <h1 className="mb-1 text-2xl font-bold">Growth dashboard</h1>
      <p className="mb-4 text-sm text-muted-foreground">
        X + Threads + Bluesky vs ID + US benchmarks. Engagement over payout.
      </p>

      <section className="mb-4 rounded-lg border p-4">
        <h2 className="mb-2 font-medium">Review</h2>
        {review.isLoading ? (
          <p className="text-sm">Loading...</p>
        ) : review.data ? (
          <>
            <div className="mb-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
              <Stat label="Ours median" value={`${(review.data.oursMedian * 100).toFixed(2)}%`} />
              <Stat label="Bench median" value={`${(review.data.benchMedian * 100).toFixed(2)}%`} />
              <Stat label="ID median" value={`${(review.data.benchIDMedian * 100).toFixed(2)}%`} />
              <Stat label="US median" value={`${(review.data.benchUSMedian * 100).toFixed(2)}%`} />
            </div>
            <p className="text-sm">{review.data.verdict}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              {review.data.counts.ours} ours vs {review.data.counts.benchmarks} benchmarks
            </p>
          </>
        ) : (
          <p className="text-sm">No data.</p>
        )}
      </section>

      <div className="grid gap-4 md:grid-cols-2">
        <section className="rounded-lg border p-4">
          <h2 className="mb-2 font-medium">Top ID benchmarks</h2>
          <ul className="space-y-2 text-sm">
            {(topID.data ?? []).map((b) => (
              <li key={b.id} className="border-b pb-2">
                <div>{b.text.slice(0, 110)}</div>
                <div className="text-xs text-muted-foreground">
                  {b.handle} · {(b.engRate * 100).toFixed(2)}% · {b.hookType}
                </div>
              </li>
            ))}
          </ul>
        </section>
        <section className="rounded-lg border p-4">
          <h2 className="mb-2 font-medium">Top US benchmarks</h2>
          <ul className="space-y-2 text-sm">
            {(topUS.data ?? []).map((b) => (
              <li key={b.id} className="border-b pb-2">
                <div>{b.text.slice(0, 110)}</div>
                <div className="text-xs text-muted-foreground">
                  {b.handle} · {(b.engRate * 100).toFixed(2)}% · {b.hookType}
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <section className="mt-4 rounded-lg border p-4">
        <h2 className="mb-2 font-medium">Our latest posts</h2>
        <ul className="space-y-2 text-sm">
          {(ours.data ?? []).map((o) => (
            <li key={o.id} className="border-b pb-2">
              <div>{o.text.slice(0, 120)}</div>
              <div className="text-xs text-muted-foreground">
                {o.platform} · {o.pillar} · {(o.engRate * 100).toFixed(2)}% ·{" "}
                <a className="underline" href={o.url} target="_blank" rel="noreferrer">
                  open
                </a>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
