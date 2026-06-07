/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { fetchVillageGraph } from "@/services/village-graph.service";
import dagre from "dagre";
import { useEffect, useMemo, useRef, useState } from "react";
import ReactFlow, {
  Background,
  BackgroundVariant,
  Controls,
  Edge,
  MiniMap,
  Node,
  ReactFlowProvider,
  useReactFlow,
} from "reactflow";
import "reactflow/dist/style.css";

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

type InsightData = {
  village: string;
  alerts: string[];
  drivers: string[];
  interventions: string[];
  recommendations: string[];
  forecast: string[];
  status?: string;
  confidence?: string;
  intent?: string;
};

const NODE_WIDTH = 220;
const NODE_HEIGHT = 80;

function getNodeType(node: GraphNodeResponse): string {
  return node.type ?? "village";
}

const TYPE_STYLES: Record<string, { bg: string; border: string; badge: string }> = {
  village:             { bg: "#1e3a5f", border: "#3b82f6", badge: "#3b82f6" },
  status:              { bg: "#064e3b", border: "#10b981", badge: "#10b981" },
  driver:              { bg: "#451a03", border: "#f59e0b", badge: "#f59e0b" },
  recommendation:      { bg: "#2e1065", border: "#8b5cf6", badge: "#8b5cf6" },
  forecast:            { bg: "#1c1917", border: "#f97316", badge: "#f97316" },
  intervention:        { bg: "#312e81", border: "#818cf8", badge: "#818cf8" },
  alert:               { bg: "#450a0a", border: "#ef4444", badge: "#ef4444" },
  forecast_status:     { bg: "#172554", border: "#38bdf8", badge: "#38bdf8" },
  forecast_confidence: { bg: "#052e16", border: "#22c55e", badge: "#22c55e" },
  forecast_days:       { bg: "#431407", border: "#fb923c", badge: "#fb923c" },
};

function buildLayout(
  rawNodes: GraphNodeResponse[],
  rawEdges: GraphEdgeResponse[],
  highlightedIds: string[] = []
): { nodes: Node[]; edges: Edge[] } {
  const seenIds = new Map<string, number>();

  const mappedNodes: Node[] = rawNodes.map((n) => {
    const count = seenIds.get(n.id) ?? 0;
    seenIds.set(n.id, count + 1);
    const nodeId = count === 0 ? n.id : `${n.id}__${count}`;
    const type = getNodeType(n);
    let style = TYPE_STYLES[type] ?? TYPE_STYLES.village;

    if (type === "alert") {
      const severity = n.severity;
      if (severity === "CRITICAL") style = { bg: "#450a0a", border: "#ef4444", badge: "#ef4444" };
      if (severity === "HIGH")     style = { bg: "#431407", border: "#f97316", badge: "#f97316" };
      if (severity === "MEDIUM")   style = { bg: "#422006", border: "#eab308", badge: "#eab308" };
    }

    const isHighlighted =
      highlightedIds.some(
        (id) =>
          nodeId === id ||
          nodeId.startsWith(`${id}__`)
      );

    return {
      id: nodeId,
      data: { label: n.label, type, tooltip: `${type.toUpperCase()}: ${n.label}` },
      position: { x: 0, y: 0 },
      style: {
        background: style.bg,
        border: isHighlighted ? `3px solid ${style.border}` : `1.5px solid ${style.border}`,
        borderRadius: 8,
        color: "#f1f5f9",
        fontSize: 12,
        fontFamily: "'DM Sans', sans-serif",
        fontWeight: 500,
        padding: "8px 12px",
        width: NODE_WIDTH,
        maxWidth: NODE_WIDTH,
        whiteSpace: "normal" as const,
        wordBreak: "break-word" as const,
        lineHeight: 1.4,
        boxShadow: isHighlighted ? `0 0 24px ${style.border}` : `0 0 12px ${style.border}33`,
      },
    };
  });

  const idMap = new Map<string, string>();
  rawNodes.forEach((n, idx) => {
    if (!idMap.has(n.id)) idMap.set(n.id, mappedNodes[idx].id);
  });

  const mappedEdges: Edge[] = rawEdges.map((e, idx) => {
    const sourceId = idMap.get(e.source) ?? e.source;
    const targetId = idMap.get(e.target) ?? e.target;
    const isHighlighted =
      highlightedIds.some(
        (id) =>
          sourceId === id ||
          targetId === id ||
          sourceId.startsWith(`${id}__`) ||
          targetId.startsWith(`${id}__`)
      );

    return {
      id: `edge-${idx}-${sourceId}-${targetId}`,
      source: sourceId,
      target: targetId,
      label: e.label,
      animated: true,
      style: { stroke: isHighlighted ? "#facc15" : "#475569", strokeWidth: 1.5 },
      labelStyle: {
        fill: "#94a3b8",
        fontWeight: 600,
        fontSize: 10,
        fontFamily: "'DM Sans', sans-serif",
      },
      labelBgStyle: { fill: "#0f172a", fillOpacity: 0.8 },
    };
  });

  const g = new dagre.graphlib.Graph();
  g.setDefaultEdgeLabel(() => ({}));
  g.setGraph({ rankdir: "LR", ranksep: 120, nodesep: 80, marginx: 60, marginy: 60 });
  mappedNodes.forEach((n) => g.setNode(n.id, { width: NODE_WIDTH, height: NODE_HEIGHT }));
  mappedEdges.forEach((e) => g.setEdge(e.source, e.target));
  dagre.layout(g);

  const positionedNodes = mappedNodes.map((n) => {
    const pos = g.node(n.id);
    return { ...n, position: { x: pos.x - NODE_WIDTH / 2, y: pos.y - NODE_HEIGHT / 2 } };
  });

  return { nodes: positionedNodes, edges: mappedEdges };
}

// --- Phase 1: AI & Analytics Helpers ---

const detectIntent = (query: string): string => {
  const q = query.toLowerCase();
  if (q.includes('alert')) return 'alert';
  if (q.includes('forecast')) return 'forecast';
  if (q.includes('intervention')) return 'intervention';
  if (q.includes('recommend')) return 'recommendation';
  return 'summarize';
};

const buildNarrativeFallback = (data: InsightData): string => {
  const alertCount = data.alerts.length;
  let narrative = "";

  // Intent-specific responses
  if (data.intent === 'alert') {
    if (alertCount === 0) {
      return `No active alerts for ${data.village}. The village is currently stable with no immediate concerns.`;
    }
    narrative += `${data.village} has ${alertCount} active alert${alertCount > 1 ? 's' : ''}. `;
    data.alerts.forEach((alert, i) => {
      narrative += `${i + 1}. ${alert}. `;
    });
    if (data.interventions.length > 0) {
      narrative += `Recommended interventions: ${data.interventions.join(', ')}.`;
    }
    return narrative;
  }

  if (data.intent === 'forecast') {
    if (data.forecast.length === 0) {
      return `No forecast data available for ${data.village}.`;
    }
    narrative += `Forecast for ${data.village}: `;
    data.forecast.forEach((f, i) => {
      narrative += `${i + 1}. ${f}. `;
    });
    if (data.confidence) {
      narrative += `Confidence level: ${data.confidence}%.`;
    }
    return narrative;
  }

  if (data.intent === 'intervention') {
    if (data.interventions.length === 0 && data.recommendations.length === 0) {
      return `No specific interventions recommended for ${data.village} at this time.`;
    }
    narrative += `Recommended interventions for ${data.village}:\n`;
    // FIX 1: Removed unused 'i' parameter
    [...data.interventions, ...data.recommendations].forEach((action) => {
      narrative += `• ${action}\n`;
    });
    return narrative.trim();
  }

  // Default summary
  if (data.status) narrative += `${data.village} is currently ${data.status.toUpperCase()}. `;
  else narrative += `${data.village} has been analyzed. `;

  if (alertCount > 0) {
    narrative += `There ${alertCount === 1 ? "is" : "are"} ${alertCount} active alert${alertCount > 1 ? "s" : ""} `;
    if (alertCount === 1) narrative += `indicating ${data.alerts[0].toLowerCase()}. `;
    else narrative += `requiring attention. `;
  }

  if (data.forecast.length > 0) {
    const forecastText = data.forecast[0].toLowerCase();
    if (forecastText.includes("low risk")) narrative += "Forecast models indicate low risk of maternal health complications in the near term. ";
    else if (forecastText.includes("high risk") || forecastText.includes("escalation")) narrative += "Forecast models predict elevated risk levels requiring immediate intervention. ";
    else narrative += `Forecast indicates ${forecastText}. `;
  }

  if (data.drivers.length > 0) {
    const hasPositiveDrivers = data.drivers.some(d => d.toLowerCase().includes("low") || d.toLowerCase().includes("no reported") || d.toLowerCase().includes("stable"));
    if (hasPositiveDrivers) narrative += `Current indicators show ${data.drivers.join(", ").toLowerCase()}. `;
    else narrative += `Key risk factors include ${data.drivers.join(", ").toLowerCase()}. `;
  }

  if (data.interventions.length > 0 || data.recommendations.length > 0) {
    const actions = [...data.interventions, ...data.recommendations];
    if (actions.length > 0) narrative += `Recommended actions include ${actions.join(", ").toLowerCase()}.`;
  }

  if (data.confidence) narrative += ` Confidence level: ${data.confidence}%.`;
  return narrative;
};

const fetchCopilotResponse = async (data: InsightData): Promise<string> => {
  const prompt = `You are a maternal health risk analyst. Analyze this village based on the user's intent: "${data.intent}".

Village: ${data.village}
Status: ${data.status || 'Unknown'}
Alerts: ${data.alerts.join(', ') || 'None'}
Drivers: ${data.drivers.join(', ') || 'None'}
Forecast: ${data.forecast.join(', ') || 'None'}
Interventions: ${data.interventions.join(', ') || 'None'}
Recommendations: ${data.recommendations.join(', ') || 'None'}

Give a concise, professional response under 150 words. Focus on:
1. Risk summary
2. Why the village is risky/not risky
3. Recommended actions`;

  try {
    const res = await fetch('/api/copilot', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...data, prompt }),
    });
    
    if (!res.ok) {
      console.warn('Copilot API returned error status:', res.status);
      throw new Error(`API request failed with status ${res.status}`);
    }
    
    const json = await res.json();
    return json.response || json.message || json.text || json.content || JSON.stringify(json);
  } catch {
    // FIX 2: Removed unused 'error' parameter from catch block
    console.log('Using fallback narrative generator (API unavailable)');
    // Return fallback instead of throwing - ensures demo always works
    return buildNarrativeFallback(data);
  }
};

function GraphInner({
  copilotQuery,
}: {
  copilotQuery?: string;
}) {
  const [rawNodes, setRawNodes] = useState<GraphNodeResponse[]>([]);
  const [rawEdges, setRawEdges] = useState<GraphEdgeResponse[]>([]);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [highlightedNodeIds, setHighlightedNodeIds] = useState<string[]>([]);
  const [aiExplanation, setAiExplanation] = useState<string>("");
  const [riskScore, setRiskScore] = useState(0);
  const [riskLevel, setRiskLevel] = useState<'LOW' | 'MODERATE' | 'HIGH'>('LOW');
  const [loading, setLoading] = useState(true);
  const { fitView } = useReactFlow();
  
  const lastProcessedQuery = useRef<string | null>(null);

  useEffect(() => {
    fetchVillageGraph().then((data) => {
      setRawNodes(data.nodes);
      setRawEdges(data.edges);
      setLoading(false);
    });
  }, []);

  const { nodes, edges } = useMemo(
    () => buildLayout(rawNodes, rawEdges, highlightedNodeIds),
    [rawNodes, rawEdges, highlightedNodeIds]
  );

  useEffect(() => {
    if (!copilotQuery || rawNodes.length === 0 || nodes.length === 0) return;
    if (copilotQuery === lastProcessedQuery.current) return;

    const villageNode = rawNodes.find(
      (n) =>
        n.type === "village" &&
        copilotQuery.toLowerCase().includes(n.label.toLowerCase())
    );

    if (!villageNode) return;

    const mappedVillageNode = nodes.find(
      (n) => 
        String(n.data.label).toLowerCase() === villageNode.label.toLowerCase() && 
        String(n.data.type ?? "village") === "village"
    );

    if (!mappedVillageNode) return;

    const connectedIds = edges.reduce<string[]>(
      (acc, edge) => {
        if (edge.source === mappedVillageNode.id) acc.push(edge.target);
        if (edge.target === mappedVillageNode.id) acc.push(edge.source);
        return acc;
      },
      []
    );

    const ids = [...new Set([mappedVillageNode.id, ...connectedIds])];

    // Collect and categorize connected nodes
    const alerts: string[] = [];
    const drivers: string[] = [];
    const interventions: string[] = [];
    const recommendations: string[] = [];
    const forecast: string[] = [];
    let status = "";
    let confidence = "";

    rawNodes.forEach((node) => {
      if (!ids.includes(node.id)) return;
      switch (node.type) {
        case "alert": alerts.push(node.label); break;
        case "driver": drivers.push(node.label); break;
        case "intervention": interventions.push(node.label); break;
        case "recommendation": recommendations.push(node.label); break;
        case "forecast": forecast.push(node.label); break;
        case "status": status = node.label; break;
        case "forecast_confidence": confidence = node.label; break;
      }
    });

    // Phase 1: Intent Detection & Risk Scoring
    const intent = detectIntent(copilotQuery);
    const calculatedScore = Math.min(100, 
      (alerts.length * 25) + 
      (drivers.length * 10) + 
      (alerts.some(a => a.toLowerCase().includes('critical')) ? 30 : 0) +
      (alerts.some(a => a.toLowerCase().includes('high')) ? 15 : 0)
    );
    const level = calculatedScore < 30 ? 'LOW' : calculatedScore < 70 ? 'MODERATE' : 'HIGH';

    // Update UI immediately for instant feedback
    setHighlightedNodeIds(ids);
    setSelectedNode(mappedVillageNode);
    setAiExplanation("Analyzing risk factors and generating insights...");
    setRiskScore(calculatedScore);
    setRiskLevel(level);

    // Phase 1: Call AI (with automatic fallback)
    fetchCopilotResponse({
      village: villageNode.label,
      alerts,
      drivers,
      interventions,
      recommendations,
      forecast,
      status,
      confidence,
      intent
    }).then((response) => {
      setAiExplanation(response);
    });

    // Zoom to focused nodes
    setTimeout(() => {
      fitView({
        nodes: ids.map((id) => ({ id })),
        padding: 0.4,
        duration: 800,
      });
    }, 150);

    lastProcessedQuery.current = copilotQuery;

  }, [copilotQuery, rawNodes, nodes, edges, fitView]);

  return (
    <div className="relative w-full h-full">
      {loading && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-gradient-to-b from-slate-950/90 to-slate-950/70 backdrop-blur-sm rounded-2xl">
          <div className="flex flex-col items-center gap-6">
            <div className="relative w-16 h-16">
              <div className="absolute inset-0 rounded-full border-2 border-slate-800" />
              <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-sky-400 border-r-sky-400/50 animate-spin" />
              <div className="absolute inset-2 rounded-full border border-sky-500/30 animate-pulse" />
            </div>
            <div className="text-center space-y-1">
              <p className="text-white font-semibold text-sm">Building Knowledge Graph</p>
              <p className="text-slate-400 text-xs">Analyzing relationships and patterns…</p>
            </div>
          </div>
        </div>
      )}

      <ReactFlow
        nodes={nodes}
        edges={edges}
        minZoom={0.2}
        maxZoom={2}
        proOptions={{ hideAttribution: true }}
        onNodeClick={(_, node) => {
          setSelectedNode(node);
          setAiExplanation("");
        }}
      >
        <Background variant={BackgroundVariant.Dots} color="#1e293b" gap={24} size={1.5} />
        <Controls style={{ background: "rgba(15, 23, 42, 0.8)", border: "1px solid rgba(51, 65, 85, 0.4)", borderRadius: 12, backdropFilter: "blur(8px)" }} />
        <MiniMap
          nodeColor={(n) => TYPE_STYLES[String(n.data?.type ?? "village")].border}
          style={{ background: "rgba(15, 23, 42, 0.8)", border: "1px solid rgba(51, 65, 85, 0.4)", borderRadius: 12, backdropFilter: "blur(8px)" }}
          maskColor="rgba(15, 23, 42, 0.6)"
        />
      </ReactFlow>

      {selectedNode && (
        <div className="absolute top-4 right-4 w-96 bg-gradient-to-br from-slate-900/95 to-slate-950/95 border border-slate-700/50 rounded-2xl p-5 shadow-2xl z-20 backdrop-blur-md animate-in fade-in slide-in-from-right-4 max-h-[calc(100vh-160px)] overflow-y-auto">
          <div className="flex justify-between items-start gap-3 mb-4">
            <div className="space-y-1 flex-1">
              <h3 className="font-bold text-white text-lg flex items-center gap-2">
                {aiExplanation ? (
                  <>
                    <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse shadow-[0_0_8px_rgba(56,189,248,0.8)]" />
                    AI Assessment
                  </>
                ) : (
                  "Node Details"
                )}
              </h3>
              <p className="text-slate-400 text-xs">
                {aiExplanation ? "Insights generated from knowledge graph" : "Selected from knowledge graph"}
              </p>
            </div>
            <button
              onClick={() => {
                setSelectedNode(null);
                setHighlightedNodeIds([]);
                setAiExplanation("");
              }}
              className="text-slate-500 hover:text-white transition-colors hover:bg-slate-800/50 w-8 h-8 rounded-lg flex items-center justify-center"
              title="Close"
            >
              ✕
            </button>
          </div>

          <div className="h-px bg-gradient-to-r from-slate-700 via-slate-700/50 to-transparent mb-4" />

          {aiExplanation ? (
            <div className="space-y-4">
              {/* Phase 1: Risk Score Badge */}
              <div className="bg-slate-900/60 rounded-xl p-4 border border-slate-800 flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-[10px] uppercase tracking-widest font-semibold mb-1">Risk Level</p>
                  <p className={`text-2xl font-black tracking-tight ${
                    riskLevel === 'LOW' ? 'text-emerald-400' : 
                    riskLevel === 'MODERATE' ? 'text-amber-400' : 'text-red-400'
                  }`}>
                    {riskLevel} RISK
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-slate-400 text-[10px] uppercase tracking-widest font-semibold mb-1">Score</p>
                  <p className="text-white text-2xl font-black tracking-tight">
                    {riskScore}<span className="text-slate-500 text-sm font-medium">/100</span>
                  </p>
                </div>
              </div>

              {/* AI Narrative */}
              <div className="bg-slate-900/40 rounded-xl p-4 border border-slate-800">
                <p className="text-slate-300 text-sm leading-7 whitespace-pre-line">
                  {aiExplanation}
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                <p className="text-slate-400 text-[10px] uppercase tracking-widest font-semibold">Name</p>
                <p className="text-white font-semibold text-base break-words leading-relaxed">
                  {String(selectedNode.data.label)}
                </p>
              </div>
              <div className="space-y-2">
                <p className="text-slate-400 text-[10px] uppercase tracking-widest font-semibold">Category</p>
                <div className="flex items-center gap-2">
                  <span
                    className="w-3 h-3 rounded-full shadow-lg"
                    style={{
                      background: TYPE_STYLES[String(selectedNode.data.type ?? "village")].border,
                      boxShadow: `0 0 12px ${TYPE_STYLES[String(selectedNode.data.type ?? "village")].border}66`,
                    }}
                  />
                  <p className="text-white font-medium capitalize">
                    {String(selectedNode.data.type)}
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="pt-4 mt-4 border-t border-slate-700/30 text-slate-500 text-xs">
            {aiExplanation ? "Ask another question or click a node" : "Click another node or press Esc to deselect"}
          </div>
        </div>
      )}
    </div>
  );
}

type Props = {
  copilotQuery?: string;
};

export default function VillageKnowledgeGraph({
  copilotQuery,
}: Props) {
  return (
    <div
      style={{ height: "calc(100vh - 120px)", minHeight: 500 }}
      className="w-full rounded-xl overflow-hidden border border-slate-800 bg-slate-950 shadow-2xl"
    >
      <ReactFlowProvider>
        <GraphInner copilotQuery={copilotQuery} />
      </ReactFlowProvider>
    </div>
  );
}