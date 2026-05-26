interface RiskCardProps {
  title: string;
  count: number;
  color: "red" | "yellow" | "green";
}

const colorClasses = {
  red: "text-red-500",
  yellow: "text-yellow-400",
  green: "text-green-500",
};

export default function RiskCard({
  title,
  count,
  color,
}: RiskCardProps) {
  return (
    <div className="bg-zinc-900 rounded-2xl p-6 shadow-lg border border-zinc-800">

      <h2 className="text-lg font-semibold text-zinc-300">
        {title}
      </h2>

      <p
        className={`text-4xl mt-4 font-bold ${colorClasses[color]}`}
      >
        {count}
      </p>
    </div>
  );
}