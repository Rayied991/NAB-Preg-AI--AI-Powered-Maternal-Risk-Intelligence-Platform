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
};

type GraphEdgeResponse = {
  source: string;
  target: string;
  label: string;
};

const NODE_WIDTH = 220;
const NODE_HEIGHT = 80;

// Determine node type from label
function getNodeType(n: GraphNodeResponse): string {
  const label = n.label.toLowerCase();
  if (["stable", "hotspot", "watchlist"].includes(label)) return "status";
  if (label.includes("risk") || label.includes("driver")) return "driver";
  if (label.includes("monitor") || label.includes("recommend")) return "recommendation";
  if (label.includes("forecast") || label.includes("predict")) return "forecast";
  return "village";
}

// Node style per type
const TYPE_STYLES: Record<string, { bg: string; border: string; badge: string }> = {
  village:        { bg: "#1e3a5f", border: "#3b82f6", badge: "#3b82f6" },
  status:         { bg: "#064e3b", border: "#10b981", badge: "#10b981" },
  driver:         { bg: "#451a03", border: "#f59e0b", badge: "#f59e0b" },
  recommendation: { bg: "#2e1065", border: "#8b5cf6", badge: "#8b5cf6" },
  forecast:       { bg: "#1c1917", border: "#f97316", badge: "#f97316" },
};

// Build ReactFlow nodes and edges with Dagre layout
function buildLayout(
  rawNodes: GraphNodeResponse[],
  rawEdges: GraphEdgeResponse[]
): { nodes: Node[]; edges: Edge[] } {
  const seenIds = new Map<string, number>();

  // Map nodes
  const mappedNodes: Node[] = rawNodes.map((n) => {
    const count = seenIds.get(n.id) ?? 0;
    seenIds.set(n.id, count + 1);
    const nodeId = count === 0 ? n.id : `${n.id}__${count}`;

    const type = getNodeType(n);
    const style = TYPE_STYLES[type] ?? TYPE_STYLES.village;

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

  // Map original node id → unique id
  const idMap = new Map<string, string>();
  rawNodes.forEach((n, idx) => {
    if (!idMap.has(n.id)) {
      idMap.set(n.id, mappedNodes[idx].id);
    }
  });

  // Map edges
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

  // Dagre auto layout
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
  const [loading, setLoading] = useState(true);
  const { fitView } = useReactFlow();

  useEffect(() => {
    fetchVillageGraph().then((data) => {
      const { nodes: n, edges: e } = buildLayout(
        data.nodes as GraphNodeResponse[],
        data.edges as GraphEdgeResponse[]
      );
      setNodes(n);
      setEdges(e);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    if (!loading) {
      requestAnimationFrame(() => fitView({ padding: 0.2, duration: 400 }));
    }
  }, [loading, fitView]);

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
      <ReactFlow
        nodes={nodes}
        edges={edges}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        minZoom={0.2}
        maxZoom={2}
        proOptions={{ hideAttribution: true }}
      >
        <Background
          variant={BackgroundVariant.Dots}
          color="#1e293b"
          gap={24}
          size={1.5}
        />
        <Controls
          style={{
            background: "#1e293b",
            border: "1px solid #334155",
            borderRadius: 8,
          }}
        />
        <MiniMap
          nodeColor={(n) => TYPE_STYLES[n.data?.type ?? "village"].border}
          style={{
            background: "#0f172a",
            border: "1px solid #1e293b",
            borderRadius: 8,
          }}
          maskColor="#0f172a99"
        />
      </ReactFlow>
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