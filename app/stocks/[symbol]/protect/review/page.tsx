import { ReviewProtection } from "./review-protection";

export default async function ReviewPage({ params, searchParams }: { params: Promise<{ symbol: string }>; searchParams: Promise<{ coverage?: string }> }) {
  const [{ symbol }, query] = await Promise.all([params, searchParams]);
  const parsed = Number(query.coverage ?? 75); const coverage = Number.isFinite(parsed) ? Math.max(0, Math.min(100, parsed)) : 75;
  return <ReviewProtection symbol={symbol} initialCoverage={coverage} />;
}
