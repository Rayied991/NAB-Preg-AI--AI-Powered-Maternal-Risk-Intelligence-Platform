import DashboardLayout from "@/components/layout/DashboardLayout";

import BPTrendChart from "@/components/charts/BPTrendChart";
import RiskPieChart from "@/components/charts/RiskPieChart";
import VillageAnalyticsChart from "@/components/charts/VillageAnalyticsChart";

export default function AnalyticsPage() {
  return (
    <DashboardLayout>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">
          Analytics Dashboard
        </h1>

        <p className="text-zinc-400 mt-1">
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