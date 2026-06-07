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

function GraphInner({
  copilotQuery,
}: {
  copilotQuery?: string;
}) {
  const [rawNodes, setRawNodes] = useState<GraphNodeResponse[]>([]);
  const [rawEdges, setRawEdges] = useState<GraphEdgeResponse[]>([]);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [highlightedNodeIds, setHighlightedNodeIds] = useState<string[]>([]);
  const [copilotContext, setCopilotContext] = useState<{
    village: string;
    drivers: string[];
    alerts: string[];
    forecasts: string[];
    interventions: string[];
    recommendations: string[];
    statuses: string[];
  } | null>(null);
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

    const getType = (n: Node) => String(n.data?.type ?? "village");
    const getLabel = (n: Node) => String(n.data?.label ?? "");

    const connectedNodes = nodes.filter(n => ids.includes(n.id));
    const context = {
      village: getLabel(mappedVillageNode),
      drivers: connectedNodes.filter(n => getType(n) === 'driver').map(getLabel),
      alerts: connectedNodes.filter(n => getType(n) === 'alert').map(getLabel),
      forecasts: connectedNodes.filter(n => {
        const t = getType(n);
        return t === 'forecast' || t.startsWith('forecast_');
      }).map(getLabel),
      interventions: connectedNodes.filter(n => getType(n) === 'intervention').map(getLabel),
      recommendations: connectedNodes.filter(n => getType(n) === 'recommendation').map(getLabel),
      statuses: connectedNodes.filter(n => getType(n) === 'status').map(getLabel),
    };

    setCopilotContext(context);
    setHighlightedNodeIds(ids);
    setSelectedNode(mappedVillageNode);

    // FIX 2: Map the string IDs to objects with an 'id' property for fitView
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
          setCopilotContext(null); 
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
                {copilotContext ? (
                  <>
                    <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse shadow-[0_0_8px_rgba(56,189,248,0.8)]" />
                    AI Risk Explanation
                  </>
                ) : (
                  "Node Details"
                )}
              </h3>
              <p className="text-slate-400 text-xs">
                {copilotContext ? "Insights generated from knowledge graph" : "Selected from knowledge graph"}
              </p>
            </div>
            <button
              onClick={() => {
                setSelectedNode(null);
                setHighlightedNodeIds([]);
                setCopilotContext(null);
              }}
              className="text-slate-500 hover:text-white transition-colors hover:bg-slate-800/50 w-8 h-8 rounded-lg flex items-center justify-center"
              title="Close"
            >
              ✕
            </button>
          </div>

          <div className="h-px bg-gradient-to-r from-slate-700 via-slate-700/50 to-transparent mb-4" />

          {copilotContext ? (
            <div className="space-y-5">
              <div className="space-y-2">
                <p className="text-slate-400 text-[10px] uppercase tracking-widest font-semibold">Village</p>
                <p className="text-white font-semibold text-base break-words leading-relaxed flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-sky-400 shadow-[0_0_10px_rgba(56,189,248,0.8)]" />
                  {copilotContext.village}
                </p>
              </div>

              {copilotContext.drivers.length > 0 && (
                <div className="space-y-2">
                  <p className="text-slate-400 text-[10px] uppercase tracking-widest font-semibold flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.8)]" />
                    Risk Drivers
                  </p>
                  <ul className="space-y-1.5">
                    {copilotContext.drivers.map((d, i) => (
                      <li key={i} className="text-slate-300 text-sm flex items-start gap-2">
                        <span className="text-amber-400 mt-1.5 text-xs">▸</span> {d}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {copilotContext.alerts.length > 0 && (
                <div className="space-y-2">
                  <p className="text-slate-400 text-[10px] uppercase tracking-widest font-semibold flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-red-400 shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
                    Active Alerts
                  </p>
                  <ul className="space-y-1.5">
                    {copilotContext.alerts.map((a, i) => (
                      <li key={i} className="text-slate-300 text-sm flex items-start gap-2">
                        <span className="text-red-400 mt-1.5 text-xs">▸</span> {a}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {copilotContext.forecasts.length > 0 && (
                <div className="space-y-2">
                  <p className="text-slate-400 text-[10px] uppercase tracking-widest font-semibold flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-orange-400 shadow-[0_0_8px_rgba(249,115,22,0.8)]" />
                    Forecast
                  </p>
                  <ul className="space-y-1.5">
                    {copilotContext.forecasts.map((f, i) => (
                      <li key={i} className="text-slate-300 text-sm flex items-start gap-2">
                        <span className="text-orange-400 mt-1.5 text-xs">▸</span> {f}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {copilotContext.interventions.length > 0 && (
                <div className="space-y-2">
                  <p className="text-slate-400 text-[10px] uppercase tracking-widest font-semibold flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-indigo-400 shadow-[0_0_8px_rgba(129,140,248,0.8)]" />
                    Interventions
                  </p>
                  <ul className="space-y-1.5">
                    {copilotContext.interventions.map((int, i) => (
                      <li key={i} className="text-slate-300 text-sm flex items-start gap-2">
                        <span className="text-indigo-400 mt-1.5 text-xs">▸</span> {int}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {copilotContext.recommendations.length > 0 && (
                <div className="space-y-2">
                  <p className="text-slate-400 text-[10px] uppercase tracking-widest font-semibold flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-violet-400 shadow-[0_0_8px_rgba(139,92,246,0.8)]" />
                    Recommendations
                  </p>
                  <ul className="space-y-1.5">
                    {copilotContext.recommendations.map((r, i) => (
                      <li key={i} className="text-slate-300 text-sm flex items-start gap-2">
                        <span className="text-violet-400 mt-1.5 text-xs">▸</span> {r}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {copilotContext.statuses.length > 0 && (
                <div className="space-y-2">
                  <p className="text-slate-400 text-[10px] uppercase tracking-widest font-semibold flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                    Status
                  </p>
                  <ul className="space-y-1.5">
                    {copilotContext.statuses.map((s, i) => (
                      <li key={i} className="text-slate-300 text-sm flex items-start gap-2">
                        <span className="text-emerald-400 mt-1.5 text-xs">▸</span> {s}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
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
            {copilotContext ? "Ask another question or click a node" : "Click another node or press Esc to deselect"}
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