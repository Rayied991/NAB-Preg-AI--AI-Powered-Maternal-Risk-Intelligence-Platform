type Props = {
  village: string;
  status: string;
  confidence: number;
  forecast: string;
  drivers: string;
  recommendation: string;
};

export default function VillageAIReportCard({
  village,
  status,
  confidence,
  forecast,
  drivers,
  recommendation,
}: Props) {
  return (
    <div
      className="
      bg-white dark:bg-[#131720]
      border border-gray-200 dark:border-[#1e2535]
      rounded-2xl
      p-5
      shadow-sm"
    >
      <h3 className="font-bold text-lg">
        {village}
      </h3>

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
          <strong>Confidence:</strong>{" "}
          {confidence}%
        </p>

        <p className="mt-2">
          <strong>Forecast:</strong>
          <br />
          {forecast}
        </p>

        <p className="mt-2">
          <strong>Key Drivers:</strong>
          <br />
          {drivers}
        </p>

        <p className="mt-2">
          <strong>Recommendation:</strong>
          <br />
          {recommendation}
        </p>

      </div>
    </div>
  );
}