"use client";

import { fetchVillageGraph } from "@/services/village-graph.service";
import dagre from "dagre";
import { useEffect, useState } from "react";
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

const NODE_FILTERS = [
  { label: "All",             type: null },
  { label: "Alerts",          type: "alert" },
  { label: "Interventions",   type: "intervention" },
  { label: "Forecast",        type: "forecast" },
  { label: "Recommendations", type: "recommendation" },
  { label: "Drivers",         type: "driver" },
  { label: "Status",          type: "status" },
];

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
  rawEdges: GraphEdgeResponse[]
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

    return {
      id: nodeId,
      data: { label: n.label, type, tooltip: `${type.toUpperCase()}: ${n.label}` },
      position: { x: 0, y: 0 },
      style: {
        background: style.bg,
        border: `1.5px solid ${style.border}`,
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
        boxShadow: `0 0 12px ${style.border}33`,
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
    return {
      id: `edge-${idx}-${sourceId}-${targetId}`,
      source: sourceId,
      target: targetId,
      label: e.label,
      animated: true,
      style: { stroke: "#475569", strokeWidth: 1.5 },
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

function GraphInner() {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [filter, setFilter] = useState<string | null>(null);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [loading, setLoading] = useState(true);
  const { fitView } = useReactFlow();

  // 1. Fetch data on mount
  useEffect(() => {
    fetchVillageGraph().then((data) => {
      const { nodes: n, edges: e } = buildLayout(data.nodes, data.edges);
      setNodes(n);
      setEdges(e);
      setLoading(false);
    });
  }, []);

  // 2. Auto-fit on load and filter change
  useEffect(() => {
    if (!loading) {
      const timer = setTimeout(() => {
        fitView({ padding: 0.25, duration: 500 });
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [loading, filter, fitView]);

  // Filtered nodes — villages always included as anchors
  const filteredNodes = filter
    ? nodes.filter((n) => {
        const type = n.data?.type;
        if (type === "village") return true;
        if (filter === "forecast") {
          return (
            type === "forecast" ||
            type === "forecast_status" ||
            type === "forecast_confidence" ||
            type === "forecast_days"
          );
        }
        return type === filter;
      })
    : nodes;

  // Only keep edges where both endpoints are visible
  const filteredEdges = filter
    ? edges.filter(
        (e) =>
          filteredNodes.some((n) => n.id === e.source) &&
          filteredNodes.some((n) => n.id === e.target)
      )
    : edges;

  return (
    <div className="relative w-full h-full">
      {loading && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-slate-950/80 rounded-xl">
          <div className="flex flex-col items-center gap-3">
            <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            <span className="text-slate-400 text-sm font-medium tracking-wide">
              Building graph…
            </span>
          </div>
        </div>
      )}

      {/* Filter Toolbar */}
      <div className="absolute top-4 left-4 z-20 flex flex-wrap gap-2">
        {NODE_FILTERS.map((item) => (
          <button
            key={item.label}
            onClick={() => {
              setFilter(item.type);
              setSelectedNode(null);
              setTimeout(() => {
                fitView({ padding: 0.25, duration: 500 });
              }, 150);
            }}
            className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${
              filter === item.type
                ? "bg-sky-500 border-sky-400 text-white"
                : "bg-slate-900 border-slate-700 text-slate-300 hover:border-slate-500"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* Graph Stats */}
      <div className="absolute top-16 left-4 z-20">
        <span className="text-xs text-slate-400">
          Showing {filteredNodes.length} nodes • {filteredEdges.length} edges
        </span>
      </div>

      <ReactFlow
        nodes={filteredNodes}
        edges={filteredEdges}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        minZoom={0.2}
        maxZoom={2}
        proOptions={{ hideAttribution: true }}
        onNodeClick={(_, node) => setSelectedNode(node)}
      >
        <Background variant={BackgroundVariant.Dots} color="#1e293b" gap={24} size={1.5} />
        <Controls
          style={{ background: "#1e293b", border: "1px solid #334155", borderRadius: 8 }}
        />
        <MiniMap
          nodeColor={(n) => TYPE_STYLES[n.data?.type ?? "village"].border}
          style={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 8 }}
          maskColor="#0f172a99"
        />
      </ReactFlow>

      {/* Node Details Panel */}
      {selectedNode && (
        <div className="absolute top-4 right-4 w-80 bg-slate-900 border border-slate-700 rounded-xl p-4 shadow-xl z-20">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-white">Node Details</h3>
            <button
              onClick={() => setSelectedNode(null)}
              className="text-slate-400 hover:text-white"
            >
              ✕
            </button>
          </div>

          <p className="mt-3 text-slate-300 break-words">
            {String(selectedNode.data.label)}
          </p>

          <div className="mt-4 border-t border-slate-700 pt-3">
            <p className="text-slate-500 text-xs uppercase tracking-wider">Category</p>
            <p className="text-white font-medium mt-1 capitalize">
              {String(selectedNode.data.type)}
            </p>
          </div>

          {selectedNode.data.type === "alert" && (
            <div className="mt-3">
              <span className="px-2 py-1 rounded-full text-xs bg-red-500/20 text-red-400 border border-red-500/30">
                AI Alert
              </span>
            </div>
          )}

          {selectedNode.data.type === "intervention" && (
            <div className="mt-3">
              <span className="px-2 py-1 rounded-full text-xs bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                AI Intervention
              </span>
            </div>
          )}

          {selectedNode.data.type === "forecast" && (
            <div className="mt-3">
              <span className="px-2 py-1 rounded-full text-xs bg-orange-500/20 text-orange-400 border border-orange-500/30">
                Forecast Signal
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function VillageKnowledgeGraph() {
  return (
    <div
      style={{ height: "calc(100vh - 120px)", minHeight: 500 }}
      className="w-full rounded-xl overflow-hidden border border-slate-800 bg-slate-950 shadow-2xl"
    >
      <ReactFlowProvider>
        <GraphInner />
      </ReactFlowProvider>
    </div>
  );
}