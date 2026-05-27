interface RiskCardProps {
  title: string;
  count: number;
  color: "red" | "yellow" | "green";
}

/**
 * RiskCard Component
 * 
 * Group Project Documentation:
 * 1. Converted card background from static `bg-zinc-900` to `bg-card`.
 * 2. Swapped card border from `border-zinc-800` to `border-border-custom`.
 * 3. Title text swapped from `text-zinc-300` to semantic `text-text-secondary`.
 * 4. Adjusted yellow status color to use `text-amber-500 dark:text-yellow-400` for high contrast against light backgrounds.
 */
const colorClasses = {
  red: "text-red-500 dark:text-red-400",
  yellow: "text-amber-600 dark:text-yellow-400",
  green: "text-green-600 dark:text-green-400",
};

export default function RiskCard({
  title,
  count,
  color,
}: RiskCardProps) {
  return (
    <div className="bg-card rounded-2xl p-6 shadow-premium border border-border-custom transition-all duration-300">

      <h2 className="text-lg font-semibold text-text-secondary transition-colors duration-300">
        {title}
      </h2>

      <p
        className={`text-4xl mt-4 font-bold ${colorClasses[color]} transition-colors duration-300`}
      >
        {count}
      </p>
    </div>
  );
}