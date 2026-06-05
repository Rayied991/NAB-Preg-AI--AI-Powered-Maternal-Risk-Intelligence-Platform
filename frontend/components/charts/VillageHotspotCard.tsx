type Props = {
  village: string;
  status: string;
  high_risk_cases: number;
  medium_risk_cases: number;
};

export default function VillageHotspotCard({
  village,
  status,
  high_risk_cases,
  medium_risk_cases,
}: Props) {
  return (
    <div className="bg-white dark:bg-[#131720]
      border border-gray-200 dark:border-[#1e2535]
      rounded-2xl p-4">

      <h3 className="font-semibold">
        {village}
      </h3>

      <p className="mt-2 text-sm">
        {status === "HOTSPOT"
          ? "🔥 HOTSPOT"
          : status === "WATCHLIST"
          ? "⚠️ WATCHLIST"
          : "✅ STABLE"}
      </p>

      <div className="mt-3 text-sm">
        <p>
          High Risk: {high_risk_cases}
        </p>

        <p>
          Medium Risk: {medium_risk_cases}
        </p>
      </div>
    </div>
  );
}