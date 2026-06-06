type Props = {
  village: string;
  status: string;
  confidence?: number; // optional in case missing
  forecast: string;
  drivers: string | string[]; // accept array too
  recommendation: string | string[];
};

export default function VillageAIReportCard({
  village,
  status,
  confidence = 0,
  forecast,
  drivers,
  recommendation,
}: Props) {
  // normalize array to string
  const driversText = Array.isArray(drivers) ? drivers.join("; ") : drivers;
  const recommendationText = Array.isArray(recommendation)
    ? recommendation.join("; ")
    : recommendation;

  return (
    <div className="bg-white dark:bg-[#131720] border border-gray-200 dark:border-[#1e2535] rounded-2xl p-5 shadow-sm">
      <h3 className="font-bold text-lg">{village}</h3>

      <div className="mt-3">
        <p>
          <strong>Status:</strong>{" "}
          {status === "HOTSPOT"
            ? "🔥 HOTSPOT"
            : status === "WATCHLIST"
            ? "⚠️ WATCHLIST"
            : "✅ STABLE"}
        </p>

        <p className="mt-2">
          <strong>Confidence:</strong> {confidence}%
        </p>

        <p className="mt-2">
          <strong>Forecast:</strong>
          <br />
          {forecast}
        </p>

        <p className="mt-2">
          <strong>Key Drivers:</strong>
          <br />
          {driversText || "N/A"}
        </p>

        <p className="mt-2">
          <strong>Recommendation:</strong>
          <br />
          {recommendationText || "N/A"}
        </p>
      </div>
    </div>
  );
}