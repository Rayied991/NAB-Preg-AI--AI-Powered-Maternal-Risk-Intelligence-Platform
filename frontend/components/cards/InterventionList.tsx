"use client";

import { fetchAIInterventions } from "@/services/ai-interventions.service";
import { useEffect, useState } from "react";

type Intervention = {
  id: string;
  village_name: string;
  intervention_type: string;
  message: string;
  created_at: string;
};

export default function InterventionList() {
  const [interventions, setInterventions] = useState<Intervention[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastFetched, setLastFetched] = useState<string>("");
  const [fetchCount, setFetchCount] = useState(0);

  const loadInterventions = async () => {
    setLoading(true);
    try {
      const data = await fetchAIInterventions();
      
      // 🧪 DEBUG: Log what we're getting from the database
      console.log("📥 INTERVENTIONS FETCHED:", data);
      console.log(`📊 Total count: ${data.length}`);
      
      if (data.length > 0) {
        console.log("🆕 Latest intervention:", data[data.length - 1]);
        console.log("📅 Created at:", data[data.length - 1].created_at);
      }
      
      setInterventions(data);
      setLastFetched(new Date().toLocaleTimeString());
      setFetchCount(prev => prev + 1);
    } catch (error) {
      console.error("❌ Error fetching interventions:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // FIX: Disable the strict React Compiler lint rule for this standard data fetch
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadInterventions();
  }, []);

  // 🧪 Manual refresh button handler
  const handleRefresh = () => {
    console.log("🔄 Manual refresh triggered...");
    loadInterventions();
  };

  return (
    <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm dark:shadow-lg max-h-100 overflow-y-auto transition-colors duration-300">
      {/* Header with refresh button */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-slate-800 dark:text-white font-bold text-lg">
          AI Interventions
        </h2>
        <button
          onClick={handleRefresh}
          disabled={loading}
          className="text-xs px-2 py-1 bg-sky-500 hover:bg-sky-600 disabled:bg-slate-400 text-white rounded transition-colors"
          title="Refresh data from database"
        >
          {loading ? "..." : "🔄 Refresh"}
        </button>
      </div>

      {/* 🧪 Debug info */}
      <div className="mb-3 p-2 bg-slate-100 dark:bg-slate-800 rounded text-xs space-y-1">
        <div className="flex justify-between">
          <span className="text-slate-600 dark:text-slate-400">Total records:</span>
          <span className="font-mono font-bold text-slate-800 dark:text-white">
            {interventions.length}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-600 dark:text-slate-400">Fetch count:</span>
          <span className="font-mono font-bold text-slate-800 dark:text-white">
            {fetchCount}
          </span>
        </div>
        {lastFetched && (
          <div className="flex justify-between">
            <span className="text-slate-600 dark:text-slate-400">Last fetched:</span>
            <span className="font-mono text-slate-800 dark:text-white">
              {lastFetched}
            </span>
          </div>
        )}
      </div>

      {loading && interventions.length === 0 ? (
        <div className="flex items-center justify-center py-8">
          <div className="w-6 h-6 border-2 border-slate-300 border-t-sky-500 rounded-full animate-spin" />
        </div>
      ) : interventions.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-slate-600 dark:text-slate-400 text-sm mb-2">
            No interventions yet.
          </p>
          <p className="text-xs text-slate-500">
            💡 Interventions are created when AI reports are generated.
          </p>
          <button
            onClick={handleRefresh}
            className="mt-3 text-xs px-3 py-1.5 bg-sky-500 hover:bg-sky-600 text-white rounded"
          >
            Check Database
          </button>
        </div>
      ) : (
        <ul className="flex flex-col gap-2">
          {interventions.map((i) => (
            <li
              key={i.id}
              className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/50 rounded-md p-2 text-sm text-slate-700 dark:text-white"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <strong className="text-slate-900 dark:text-white">
                    {i.village_name}
                  </strong>
                  <span className="ml-2 text-xs px-1.5 py-0.5 bg-sky-100 dark:bg-sky-900/30 text-sky-700 dark:text-sky-300 rounded">
                    {i.intervention_type}
                  </span>
                </div>
              </div>
              <p className="mt-1 text-slate-600 dark:text-slate-300">
                {i.message}
              </p>
              <span className="text-slate-500 dark:text-slate-400 text-xs block mt-1">
                🕐 {new Date(i.created_at).toLocaleString()}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}