"use client"
/* eslint-disable @typescript-eslint/no-explicit-any */
import RiskCard from "@/components/cards/RiskCard";
import RiskPieChart from "@/components/charts/RiskPieChart";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { fetchAnalytics } from "@/services/analytics.service";
import { useEffect, useState } from "react";

export default function DashboardPage() {

  const [analytics, setAnalytics] =useState<any>(null);


  useEffect(() => {
    const loadData=async()=>{
      try{
        const data=await fetchAnalytics();
        setAnalytics(data);
      }
      catch(error){
        console.log(error);
      }
    };
    loadData();
  }, []);


  return (
    <DashboardLayout>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
       <RiskCard
        title="High Risk Cases"
        count={analytics?.high_risk || 0}
        color="red"
      />

      <RiskCard
        title="Medium Risk"
        count={analytics?.medium_risk || 0}
        color="yellow"
      />

      <RiskCard
        title="Low Risk"
        count={analytics?.low_risk || 0}
        color="green"
      />
      </div>

      <div className="mt-10">
        <RiskPieChart />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-10">

  {/* Recent Alerts */}
  <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">

    <h2 className="text-xl font-semibold text-white mb-4">
      Recent Alerts
    </h2>

    <div className="space-y-4">

      <div className="p-4 bg-zinc-950 rounded-xl">
        <p className="text-red-400 font-medium">
          High BP Detected
        </p>

        <p className="text-zinc-400 text-sm mt-1">
          Ayesha Rahman • Dhaka Rural
        </p>
      </div>

      <div className="p-4 bg-zinc-950 rounded-xl">
        <p className="text-yellow-300 font-medium">
          Low Hemoglobin
        </p>

        <p className="text-zinc-400 text-sm mt-1">
          Fatema Noor • Khulna
        </p>
      </div>

    </div>
  </div>

  {/* AI Summary */}
  <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">

    <h2 className="text-xl font-semibold text-white mb-4">
      AI Insights
    </h2>

    <div className="space-y-4 text-zinc-300">

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