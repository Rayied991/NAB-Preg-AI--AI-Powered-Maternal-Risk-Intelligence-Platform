import BPTrendChart from "@/components/charts/BPTrendChart";
import RiskPieChart from "@/components/charts/RiskPieChart";
import VillageAnalyticsChart from "@/components/charts/VillageAnalyticsChart";
import DashboardLayout from "@/components/layout/DashboardLayout";

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

      {/* ── Page Header ── */}
      <div className="mb-8">
      <p className="text-[11px] font-semibold tracking-widest uppercase text-[#4a7fa8] mb-1">
        Maternal Health AI
      </p>

      <h1 className="text-3xl font-bold text-text-primary transition-colors duration-300">
        Analytics Dashboard
      </h1>

      <p className="text-text-muted mt-1 transition-colors duration-300">
        AI-powered maternal health intelligence
      </p>
    </div>

      {/* ── Top Charts Row ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* Risk Pie Chart */}
        <div className="bg-[#131720] border border-[#1e2535] rounded-2xl p-6">
          <p className="text-[11px] font-semibold tracking-widest uppercase text-[#4a7fa8] mb-4 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21.21 15.89A10 10 0 1 1 8 2.83"/>
              <path d="M22 12A10 10 0 0 0 12 2v10z"/>
            </svg>
            Risk Distribution
          </p>
          <RiskPieChart />
        </div>

        {/* BP Trend Chart */}
        <div className="bg-[#131720] border border-[#1e2535] rounded-2xl p-6">
          <p className="text-[11px] font-semibold tracking-widest uppercase text-[#4a7fa8] mb-4 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
            </svg>
            Blood Pressure Trend
          </p>
          <BPTrendChart />
        </div>

      </div>

      {/* ── Village Analytics ── */}
      <div className="mt-5 mb-8 bg-[#131720] border border-[#1e2535] rounded-2xl p-6">
        <p className="text-[11px] font-semibold tracking-widest uppercase text-[#4a7fa8] mb-4 flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="20" x2="18" y2="10"/>
            <line x1="12" y1="20" x2="12" y2="4"/>
            <line x1="6" y1="20" x2="6" y2="14"/>
          </svg>
          Village-Level Analytics
        </p>
        <VillageAnalyticsChart />
      </div>

    </DashboardLayout>
  );
}