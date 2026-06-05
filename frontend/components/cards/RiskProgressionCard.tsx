type Props = {
  trend: string;
  change: number;
  latestScore: number;
  averageScore: number;
  alert: string;
};

export default function RiskProgressionCard({
  trend,
  change,
  latestScore,
  averageScore,
  alert,
}: Props) {
  return (
    <div className="bg-card border border-border-custom rounded-2xl p-6">
      <h3 className="font-semibold text-lg">
        Risk Progression
      </h3>

      <p className="text-4xl mt-4">
        {trend === "worsening"
          ? "⬆️"
          : trend === "improving"
          ? "⬇️"
          : "➡️"}
      </p>

      <p className="mt-3 text-lg capitalize">
        {trend}
      </p>

      <p className="text-sm text-gray-400 mt-2">
        Change: {change}
      </p>

      <p className="text-sm text-gray-400">
        Latest Score: {latestScore}
      </p>

      <p className="text-sm text-gray-400">
        Average Score: {averageScore}
      </p>

      <div className="mt-4">
        <span className="px-3 py-1 rounded-lg bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 text-sm">
          {alert}
        </span>
      </div>
    </div>
  );
}