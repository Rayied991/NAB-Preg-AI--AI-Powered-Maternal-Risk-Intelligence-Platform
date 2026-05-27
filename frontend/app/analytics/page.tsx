import DashboardLayout from "@/components/layout/DashboardLayout";

import BPTrendChart from "@/components/charts/BPTrendChart";
import RiskPieChart from "@/components/charts/RiskPieChart";
import VillageAnalyticsChart from "@/components/charts/VillageAnalyticsChart";

/**
 * AnalyticsPage Component
 * 
 * Group Project Documentation:
 * Refactored page headers and subtitles from hardcoded colors to semantic theme classes:
 * - Title heading mapped to `text-text-primary`.
 * - Subtitle description mapped to `text-text-muted`.
 */
export default function AnalyticsPage() {
  return (
    <DashboardLayout>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-text-primary transition-colors duration-300">
          Analytics Dashboard
        </h1>

        <p className="text-text-muted mt-1 transition-colors duration-300">
          AI-powered maternal health intelligence
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RiskPieChart />
        <BPTrendChart />
      </div>

      <div className="mt-6">
        <VillageAnalyticsChart />
      </div>

    </DashboardLayout>
  );
}