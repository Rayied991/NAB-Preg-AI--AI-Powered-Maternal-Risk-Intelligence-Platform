// components/cards/TopRiskVillages.tsx
"use client";

import { fetchVillageGraph } from "@/services/village-graph.service";
import { useEffect, useState } from "react";

type GraphNodeResponse = {
  id: string;
  label: string;
  type?: string;
  severity?: string;
};

type GraphEdgeResponse = {
  source: string;
  target: string;
  label: string;
};

type GraphData = {
  nodes: GraphNodeResponse[];
  edges: GraphEdgeResponse[];
};

type VillageRisk = {
  name: string;
  score: number;
  level: 'LOW' | 'MODERATE' | 'HIGH';
};

const calculateRiskScore = (
  alerts: GraphNodeResponse[], 
  drivers: GraphNodeResponse[], 
  forecast: GraphNodeResponse[]
): number => {
  let score = 0;
  
  const criticalAlerts = alerts.filter(a => a.severity === 'CRITICAL').length;
  const highAlerts = alerts.filter(a => a.severity === 'HIGH').length;
  const mediumAlerts = alerts.filter(a => a.severity === 'MEDIUM').length;
  
  score += criticalAlerts * 40;
  score += highAlerts * 20;
  score += mediumAlerts * 10;
  
  if (criticalAlerts === 0 && highAlerts === 0 && mediumAlerts === 0) {
    alerts.forEach(alert => {
      const lower = (alert.label || '').toLowerCase();
      if (lower.includes('critical') || lower.includes('emergency')) score += 40;
      else if (lower.includes('high') || lower.includes('severe')) score += 20;
      else if (lower.includes('medium') || lower.includes('moderate')) score += 10;
      else score += 5;
    });
  }
  
  score += drivers.length * 8;
  
  forecast.forEach(f => {
    const lower = (f.label || '').toLowerCase();
    if (lower.includes('high risk') || lower.includes('escalation') || lower.includes('hotspot')) {
      score += 15;
    } else if (lower.includes('moderate') || lower.includes('increasing')) {
      score += 8;
    }
  });
  
  return Math.min(100, score);
};

export default function TopRiskVillages() {
  const [villages, setVillages] = useState<VillageRisk[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVillageGraph().then((data: GraphData) => {
      const villageNodes = data.nodes.filter((n: GraphNodeResponse) => n.type === 'village');
      
      const risks: VillageRisk[] = villageNodes.map((village: GraphNodeResponse) => {
        const connectedEdges = data.edges.filter(
          (e: GraphEdgeResponse) => e.source === village.id || e.target === village.id
        );
        
        const connectedIds = connectedEdges.map((e: GraphEdgeResponse) => 
          e.source === village.id ? e.target : e.source
        );
        
        const connectedNodes = data.nodes.filter((n: GraphNodeResponse) => connectedIds.includes(n.id));
        
        const alerts = connectedNodes.filter((n: GraphNodeResponse) => n.type === 'alert');
        const drivers = connectedNodes.filter((n: GraphNodeResponse) => n.type === 'driver');
        const forecast = connectedNodes.filter((n: GraphNodeResponse) => 
          n.type === 'forecast' || n.type?.startsWith('forecast_')
        );
        
        const score = calculateRiskScore(alerts, drivers, forecast);
        const level: 'LOW' | 'MODERATE' | 'HIGH' = score < 30 ? 'LOW' : score < 70 ? 'MODERATE' : 'HIGH';
        
        return { name: village.label, score, level };
      });
      
      risks.sort((a, b) => b.score - a.score);
      setVillages(risks.slice(0, 3));
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-slate-800 rounded w-1/2"></div>
          <div className="h-8 bg-slate-800 rounded"></div>
          <div className="h-8 bg-slate-800 rounded"></div>
          <div className="h-8 bg-slate-800 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <div className="relative">
          <div className="absolute inset-0 bg-amber-500/20 rounded-lg blur" />
          <div className="w-3 h-3 rounded-lg bg-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.8)]" />
        </div>
        <div>
          <span className="text-sm font-semibold text-white">Top Risk Villages</span>
          <p className="text-[11px] text-slate-500 mt-0.5">Highest priority monitoring</p>
        </div>
      </div>

      <div className="space-y-2">
        {villages.map((village, idx) => (
          <div
            key={village.name}
            className="flex items-center justify-between p-3 bg-slate-900/40 rounded-lg border border-slate-800/50 hover:border-slate-700/50 transition-all"
          >
            <div className="flex items-center gap-3">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                idx === 0 ? 'bg-red-500/20 text-red-400' :
                idx === 1 ? 'bg-amber-500/20 text-amber-400' :
                'bg-slate-700/50 text-slate-400'
              }`}>
                {idx + 1}
              </div>
              <span className="text-white text-sm font-medium">{village.name}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-xs font-bold ${
                village.level === 'HIGH' ? 'text-red-400' :
                village.level === 'MODERATE' ? 'text-amber-400' :
                'text-emerald-400'
              }`}>
                {village.score}
              </span>
              <div className={`w-2 h-2 rounded-full ${
                village.level === 'HIGH' ? 'bg-red-400' :
                village.level === 'MODERATE' ? 'bg-amber-400' :
                'bg-emerald-400'
              }`} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}