import RiskCard from "@/components/cards/RiskCard";
import RiskPieChart from "@/components/charts/RiskPieChart";
import DashboardLayout from "@/components/layout/DashboardLayout";

/**
 * DashboardPage Component
 * 
 * Group Project Documentation:
 * Refactored layout colors to use semantic theme properties:
 * 1. Swapped panels (`Recent Alerts`, `AI Insights`) from `bg-zinc-900 border-zinc-800` to `bg-card border-border-custom shadow-premium`.
 * 2. Alert boxes changed from `bg-zinc-950` to `bg-panel border border-border-custom` for high contrast in light mode.
 * 3. Standard text mapped: headers to `text-text-primary`, descriptions/metadata to `text-text-muted`, insights to `text-text-secondary`.
 * 4. Alert levels customized with light/dark variants:
 *    - High risk: `text-red-600 dark:text-red-400`
 *    - Medium risk: `text-amber-600 dark:text-yellow-300`
 */
export default function DashboardPage() {
  return (
    <DashboardLayout>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
       <RiskCard
        title="High Risk Cases"
        count={12}
        color="red"
      />

      <RiskCard
        title="Medium Risk"
        count={28}
        color="yellow"
      />

      <RiskCard
        title="Low Risk"
        count={45}
        color="green"
      />
      </div>

      <div className="mt-10">
        <RiskPieChart />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-10">

  {/* Recent Alerts */}
  <div className="bg-card border border-border-custom rounded-2xl p-6 shadow-premium transition-colors duration-300">

    <h2 className="text-xl font-semibold text-text-primary mb-4 transition-colors duration-300">
      Recent Alerts
    </h2>

    <div className="space-y-4">

      <div className="p-4 bg-panel border border-border-custom rounded-xl transition-all duration-300">
        <p className="text-red-600 dark:text-red-400 font-semibold transition-colors duration-300">
          High BP Detected
        </p>

        <p className="text-text-muted text-sm mt-1 transition-colors duration-300">
          Ayesha Rahman • Dhaka Rural
        </p>
      </div>

      <div className="p-4 bg-panel border border-border-custom rounded-xl transition-all duration-300">
        <p className="text-amber-600 dark:text-yellow-300 font-semibold transition-colors duration-300">
          Low Hemoglobin
        </p>

        <p className="text-text-muted text-sm mt-1 transition-colors duration-300">
          Fatema Noor • Khulna
        </p>
      </div>

    </div>
  </div>

  {/* AI Summary */}
  <div className="bg-card border border-border-custom rounded-2xl p-6 shadow-premium transition-colors duration-300">

    <h2 className="text-xl font-semibold text-text-primary mb-4 transition-colors duration-300">
      AI Insights
    </h2>

    <div className="space-y-4 text-text-secondary transition-colors duration-300">

      <p>
        • 18% increase in hypertension risk cases this week.
      </p>

      <p>
        • Most high-risk patients are from rural villages.
      </p>

      <p>
        • Nutrition deficiencies strongly correlate with anemia.
      </p>

    </div>
  </div>

</div>

    </DashboardLayout>
  );
}