import { ProtectionSuccess } from "./protection-success";

export default async function SuccessPage({ params, searchParams }: { params: Promise<{ symbol: string }>; searchParams: Promise<{ coverage?: string; amount?: string }> }) {
  const [{ symbol }, query] = await Promise.all([params, searchParams]);
  return <ProtectionSuccess symbol={symbol} coverage={Number(query.coverage ?? 75)} amount={Number(query.amount ?? 0)} />;
}
