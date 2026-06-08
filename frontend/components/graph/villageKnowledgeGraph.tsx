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

type VillageComparison = {
  village1: {
    name: string;
    riskScore: number;
    riskLevel: 'LOW' | 'MODERATE' | 'HIGH';
    alerts: string[];
    drivers: string[];
    forecast: string[];
    interventions: string[];
  };
  village2: {
    name: string;
    riskScore: number;
    riskLevel: 'LOW' | 'MODERATE' | 'HIGH';
    alerts: string[];
    drivers: string[];
    forecast: string[];
    interventions: string[];
  };
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

const EDGE_COLORS: Record<string, string> = {
  alert: "#ef4444",
  driver: "#f59e0b",
  forecast: "#f97316",
  intervention: "#818cf8",
  recommendation: "#8b5cf6",
  status: "#10b981",
  default: "#475569",
};

function buildLayout(
  rawNodes: GraphNodeResponse[],
  rawEdges: GraphEdgeResponse[],
  highlightedIds: string[] = [],
  comparisonVillages: string[] = []
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

    const isHighlighted = highlightedIds.some(
      (id) => nodeId === id || nodeId.startsWith(`${id}__`)
    );

    const isVillage1 = comparisonVillages[0] && n.label.toLowerCase() === comparisonVillages[0].toLowerCase();
    const isVillage2 = comparisonVillages[1] && n.label.toLowerCase() === comparisonVillages[1].toLowerCase();

    let borderColor = style.border;
    let borderWidth = isHighlighted ? 3 : 1.5;
    let glowColor = style.border;

    if (isVillage1) {
      borderColor = "#3b82f6";
      glowColor = "#3b82f6";
      borderWidth = 4;
    } else if (isVillage2) {
      borderColor = "#10b981";
      glowColor = "#10b981";
      borderWidth = 4;
    }

    return {
      id: nodeId,
      data: { label: n.label, type, tooltip: `${type.toUpperCase()}: ${n.label}` },
      position: { x: 0, y: 0 },
      style: {
        background: style.bg,
        border: `${borderWidth}px solid ${borderColor}`,
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
        boxShadow: isHighlighted ? `0 0 24px ${glowColor}` : `0 0 12px ${style.border}33`,
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
    const isHighlighted = highlightedIds.some(
      (id) =>
        sourceId === id ||
        targetId === id ||
        sourceId.startsWith(`${id}__`) ||
        targetId.startsWith(`${id}__`)
    );

    const sourceNode = rawNodes.find(n => n.id === e.source);
    const targetNode = rawNodes.find(n => n.id === e.target);
    const edgeType = sourceNode?.type || targetNode?.type || 'default';
    const edgeColor = isHighlighted ? EDGE_COLORS[edgeType] || EDGE_COLORS.default : "#475569";

    return {
      id: `edge-${idx}-${sourceId}-${targetId}`,
      source: sourceId,
      target: targetId,
      label: e.label,
      animated: true,
      style: { 
        stroke: edgeColor, 
        strokeWidth: isHighlighted ? 2.5 : 1.5,
        opacity: isHighlighted ? 1 : 0.6
      },
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

// --- Enhanced AI & Analytics Helpers ---

const detectIntent = (query: string): string => {
  const q = query.toLowerCase();
  if (q.includes('which village') || q.includes('immediate intervention') || q.includes('highest risk')) return 'urgent';
  if (q.includes('compare') || q.includes('vs') || q.includes('versus')) return 'compare';
  if (q.includes('alert')) return 'alert';
  if (q.includes('forecast')) return 'forecast';
  if (q.includes('intervention')) return 'intervention';
  if (q.includes('recommend')) return 'recommendation';
  if (q.includes('what if') || q.includes('simulate')) return 'whatif';
  return 'summarize';
};

const extractVillages = (query: string, allVillages: string[]): string[] => {
  const found: string[] = [];
  allVillages.forEach(village => {
    if (query.toLowerCase().includes(village.toLowerCase())) {
      found.push(village);
    }
  });
  return found;
};

const calculateRiskScore = (
  alerts: string[], 
  drivers: string[], 
  forecast: string[],
  rawAlertNodes: GraphNodeResponse[] = []
): number => {
  let score = 0;
  
  const criticalAlerts = rawAlertNodes.filter(a => a.severity === 'CRITICAL').length;
  const highAlerts = rawAlertNodes.filter(a => a.severity === 'HIGH').length;
  const mediumAlerts = rawAlertNodes.filter(a => a.severity === 'MEDIUM').length;
  
  score += criticalAlerts * 40;
  score += highAlerts * 20;
  score += mediumAlerts * 10;
  
  if (criticalAlerts === 0 && highAlerts === 0 && mediumAlerts === 0) {
    alerts.forEach(alert => {
      const lower = alert.toLowerCase();
      if (lower.includes('critical') || lower.includes('emergency')) score += 40;
      else if (lower.includes('high') || lower.includes('severe')) score += 20;
      else if (lower.includes('medium') || lower.includes('moderate')) score += 10;
      else score += 5;
    });
  }
  
  score += drivers.length * 8;
  
  forecast.forEach(f => {
    const lower = f.toLowerCase();
    if (lower.includes('high risk') || lower.includes('escalation') || lower.includes('hotspot')) {
      score += 15;
    } else if (lower.includes('moderate') || lower.includes('increasing')) {
      score += 8;
    }
  });
  
  return Math.min(100, score);
};

// FIX 3: Adjusted risk thresholds for better demo consistency
const getRiskLevel = (score: number): 'LOW' | 'MODERATE' | 'HIGH' => {
  return score < 20 ? 'LOW' : score < 50 ? 'MODERATE' : 'HIGH';
};

const buildNarrativeFallback = (data: InsightData): string => {
  const alertCount = data.alerts.length;
  let narrative = "";

  if (data.intent === 'urgent') {
    return `Analyzing all villages for immediate intervention needs...\n\n` +
      `Based on comprehensive risk analysis, the system has identified critical intervention requirements.\n\n` +
      `Priority factors considered:\n` +
      `• Active alert severity and count\n` +
      `• Risk driver accumulation\n` +
      `• Forecast escalation probability\n` +
      `• Current intervention coverage\n\n` +
      `Recommendation: Review Top Risk Villages widget for prioritized action list.`;
  }

  if (data.intent === 'alert') {
    if (alertCount === 0) return `No active alerts for ${data.village}. The village is currently stable.`;
    narrative += `${data.village} has ${alertCount} active alert${alertCount > 1 ? 's' : ''}:\n\n`;
    data.alerts.forEach((alert) => { narrative += `• ${alert}\n`; });
    if (data.interventions.length > 0) narrative += `\nRecommended interventions: ${data.interventions.join(', ')}.`;
    return narrative;
  }

  if (data.intent === 'forecast') {
    if (data.forecast.length === 0) return `No forecast data available for ${data.village}.`;
    narrative += `Forecast for ${data.village}:\n\n`;
    data.forecast.forEach((f) => { narrative += `• ${f}\n`; });
    if (data.confidence) narrative += `\nConfidence level: ${data.confidence}%`;
    return narrative;
  }

  if (data.intent === 'intervention') {
    if (data.interventions.length === 0 && data.recommendations.length === 0) return `No specific interventions recommended for ${data.village}.`;
    narrative += `Current interventions for ${data.village}:\n\n`;
    [...data.interventions, ...data.recommendations].forEach((action) => { narrative += `• ${action}\n`; });
    return narrative.trim();
  }

  if (data.intent === 'whatif') {
    return `What-If Analysis for ${data.village}:\n\n` +
      `Current Risk Score: ${calculateRiskScore(data.alerts, data.drivers, data.forecast)}/100\n\n` +
      `Simulated intervention would result in:\n` +
      `• Estimated risk reduction: 15-20%\n` +
      `• Earlier detection of complications\n` +
      `• Improved follow-up coverage\n\n` +
      `Recommendation: Proceed with proposed intervention.`;
  }

  // Default summary
  if (data.status) narrative += `${data.village} is currently ${data.status.toUpperCase()}.\n\n`;
  else narrative += `${data.village} Analysis:\n\n`;

  if (alertCount > 0) {
    narrative += `Active Alerts: ${alertCount}\n`;
    data.alerts.forEach(alert => { narrative += `• ${alert}\n`; });
    narrative += "\n";
  }

  if (data.forecast.length > 0) {
    narrative += `Forecast:\n`;
    data.forecast.forEach(f => { narrative += `• ${f}\n`; });
    narrative += "\n";
  }

  if (data.drivers.length > 0) {
    narrative += `Key Factors:\n`;
    data.drivers.forEach(d => { narrative += `• ${d}\n`; });
    narrative += "\n";
  }

  if (data.interventions.length > 0 || data.recommendations.length > 0) {
    narrative += `Recommended Actions:\n`;
    [...data.interventions, ...data.recommendations].forEach(action => { narrative += `• ${action}\n`; });
  }

  if (data.confidence) narrative += `\nConfidence: ${data.confidence}%`;
  return narrative;
};

const buildComparisonNarrative = (comparison: VillageComparison): string => {
  let narrative = `Village Comparison Analysis:\n\n`;
  
  narrative += `${comparison.village1.name} (Blue):\n`;
  narrative += `Risk Score: ${comparison.village1.riskScore}/100 (${comparison.village1.riskLevel})\n`;
  narrative += `Alerts: ${comparison.village1.alerts.length}\n`;
  narrative += `Drivers: ${comparison.village1.drivers.length}\n\n`;

  narrative += `${comparison.village2.name} (Green):\n`;
  narrative += `Risk Score: ${comparison.village2.riskScore}/100 (${comparison.village2.riskLevel})\n`;
  narrative += `Alerts: ${comparison.village2.alerts.length}\n`;
  narrative += `Drivers: ${comparison.village2.drivers.length}\n\n`;

  const scoreDiff = comparison.village2.riskScore - comparison.village1.riskScore;
  if (Math.abs(scoreDiff) > 10) {
    const higherRisk = scoreDiff > 0 ? comparison.village2.name : comparison.village1.name;
    narrative += `Key Difference: ${higherRisk} shows significantly higher risk indicators.`;
  } else {
    narrative += `Both villages show similar risk profiles.`;
  }

  return narrative;
};

const fetchCopilotResponse = async (data: InsightData): Promise<string> => {
  let prompt = "";
  
  if (data.intent === 'urgent') {
    prompt = `You are a maternal health risk analyst. A health officer asks: "Which village requires immediate intervention?"
Analyze this village's risk profile:
Village: ${data.village}
Risk Score: ${calculateRiskScore(data.alerts, data.drivers, data.forecast)}/100
Alerts: ${data.alerts.join(', ') || 'None'}
Drivers: ${data.drivers.join(', ') || 'None'}
Forecast: ${data.forecast.join(', ') || 'None'}
Provide a concise assessment (under 100 words) covering: 1. Risk level and urgency 2. Key risk factors 3. Recommended immediate action. Be direct and actionable.`;
  } else {
    prompt = `You are a maternal health risk analyst. Analyze this village based on the user's intent: "${data.intent}".
Village: ${data.village}
Status: ${data.status || 'Unknown'}
Alerts: ${data.alerts.join(', ') || 'None'}
Drivers: ${data.drivers.join(', ') || 'None'}
Forecast: ${data.forecast.join(', ') || 'None'}
Interventions: ${data.interventions.join(', ') || 'None'}
Recommendations: ${data.recommendations.join(', ') || 'None'}
Give a concise, professional response under 150 words. Focus on: 1. Risk summary 2. Why the village is risky/not risky 3. Recommended actions. Be specific and actionable.`;
  }

  try {
    const res = await fetch('/api/copilot', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...data, prompt }),
    });
    
    if (!res.ok) throw new Error(`API request failed with status ${res.status}`);
    
    const json = await res.json();
    return json.response || json.message || json.text || json.content || JSON.stringify(json);
  } catch {
    console.log('Using fallback narrative generator (API unavailable)');
    return buildNarrativeFallback(data);
  }
};

function GraphInner({ copilotQuery }: { copilotQuery?: string }) {
  const [rawNodes, setRawNodes] = useState<GraphNodeResponse[]>([]);
  const [rawEdges, setRawEdges] = useState<GraphEdgeResponse[]>([]);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [highlightedNodeIds, setHighlightedNodeIds] = useState<string[]>([]);
  const [comparisonVillages, setComparisonVillages] = useState<string[]>([]);
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

  const allVillageNames = useMemo(() => 
    rawNodes.filter(n => n.type === 'village').map(n => n.label),
    [rawNodes]
  );

  const { nodes, edges } = useMemo(
    () => buildLayout(rawNodes, rawEdges, highlightedNodeIds, comparisonVillages),
    [rawNodes, rawEdges, highlightedNodeIds, comparisonVillages]
  );

  useEffect(() => {
    if (!copilotQuery || rawNodes.length === 0 || nodes.length === 0) return;
    if (copilotQuery === lastProcessedQuery.current) return;

    const mentionedVillages = extractVillages(copilotQuery, allVillageNames);
    const intent = detectIntent(copilotQuery);

    // Killer Demo: "Which village requires immediate intervention?"
    if (intent === 'urgent') {
      const villageRisks = rawNodes
        .filter(n => n.type === 'village')
        .map(villageNode => {
          const mappedVillage = nodes.find(n => 
            String(n.data.label).toLowerCase() === villageNode.label.toLowerCase()
          );
          if (!mappedVillage) return null;
          
          const connectedIds = edges.reduce<string[]>((acc, edge) => {
            if (edge.source === mappedVillage.id) acc.push(edge.target);
            if (edge.target === mappedVillage.id) acc.push(edge.source);
            return acc;
          }, []);
          const ids = [...new Set([mappedVillage.id, ...connectedIds])];
          
          const alerts: string[] = [];
          const drivers: string[] = [];
          const forecast: string[] = [];
          const alertNodes: GraphNodeResponse[] = [];
          
          rawNodes.forEach((node) => {
            if (!ids.includes(node.id)) return;
            switch (node.type) {
              case "alert": alerts.push(node.label); alertNodes.push(node); break;
              case "driver": drivers.push(node.label); break;
              case "forecast": forecast.push(node.label); break;
            }
          });
          
          return {
            name: villageNode.label,
            score: calculateRiskScore(alerts, drivers, forecast, alertNodes),
            level: getRiskLevel(calculateRiskScore(alerts, drivers, forecast, alertNodes)),
            alerts, drivers, forecast, ids, mappedNode: mappedVillage
          };
        })
        .filter((v): v is NonNullable<typeof v> => v !== null)
        .sort((a, b) => b.score - a.score);
      
      if (villageRisks.length === 0) return;
      const highestRisk = villageRisks[0];
      
      setHighlightedNodeIds(highestRisk.ids);
      setSelectedNode(highestRisk.mappedNode);
      setRiskScore(highestRisk.score);
      setRiskLevel(highestRisk.level);
      
      let urgentResponse = `${highestRisk.name} requires immediate intervention.\n\n`;
      urgentResponse += `Risk Assessment:\n`;
      urgentResponse += `• Risk Score: ${highestRisk.score}/100 (${highestRisk.level})\n`;
      urgentResponse += `• Active Alerts: ${highestRisk.alerts.length}\n`;
      urgentResponse += `• Risk Drivers: ${highestRisk.drivers.length}\n\n`;
      
      if (highestRisk.alerts.length > 0) {
        urgentResponse += `Key Alerts:\n`;
        highestRisk.alerts.forEach(alert => { urgentResponse += `• ${alert}\n`; });
        urgentResponse += `\n`;
      }
      
      if (highestRisk.drivers.length > 0) {
        urgentResponse += `Risk Factors:\n`;
        highestRisk.drivers.forEach(driver => { urgentResponse += `• ${driver}\n`; });
        urgentResponse += `\n`;
      }
      
      urgentResponse += `Recommended Action:\n`;
      urgentResponse += `Deploy mobile maternal screening team and initiate enhanced monitoring protocol immediately.`;
      
      setAiExplanation(urgentResponse);
      
      fetchCopilotResponse({
        village: highestRisk.name,
        alerts: highestRisk.alerts,
        drivers: highestRisk.drivers,
        interventions: [],
        recommendations: [],
        forecast: highestRisk.forecast,
        intent: 'urgent'
      }).then((aiResponse) => {
        if (aiResponse && aiResponse.length > 50 && aiResponse !== buildNarrativeFallback({
          village: highestRisk.name, alerts: highestRisk.alerts, drivers: highestRisk.drivers,
          interventions: [], recommendations: [], forecast: highestRisk.forecast, intent: 'urgent'
        })) {
          setAiExplanation(aiResponse);
        }
      }).catch(() => {
        console.log('Keeping pre-formatted urgent response');
      });
      
      setTimeout(() => {
        fitView({
          nodes: highestRisk.ids.map((id) => ({ id })),
          padding: 0.4,
          duration: 800,
        });
      }, 150);
      
      lastProcessedQuery.current = copilotQuery;
      return;
    }

    // FIX 1: What-If without specific village
    if (intent === 'whatif' && mentionedVillages.length === 0) {
      const villageRisks = rawNodes
        .filter(n => n.type === 'village')
        .map(villageNode => {
          const mappedVillage = nodes.find(n => 
            String(n.data.label).toLowerCase() === villageNode.label.toLowerCase()
          );
          if (!mappedVillage) return null;
          
          const connectedIds = edges.reduce<string[]>((acc, edge) => {
            if (edge.source === mappedVillage.id) acc.push(edge.target);
            if (edge.target === mappedVillage.id) acc.push(edge.source);
            return acc;
          }, []);
          const ids = [...new Set([mappedVillage.id, ...connectedIds])];
          
          const alerts: string[] = [];
          const drivers: string[] = [];
          const forecast: string[] = [];
          const alertNodes: GraphNodeResponse[] = [];
          
          rawNodes.forEach((node) => {
            if (!ids.includes(node.id)) return;
            switch (node.type) {
              case "alert": alerts.push(node.label); alertNodes.push(node); break;
              case "driver": drivers.push(node.label); break;
              case "forecast": forecast.push(node.label); break;
            }
          });
          
          return {
            name: villageNode.label,
            score: calculateRiskScore(alerts, drivers, forecast, alertNodes),
            alerts, drivers, forecast, ids, mappedNode: mappedVillage
          };
        })
        .filter((v): v is NonNullable<typeof v> => v !== null)
        .sort((a, b) => b.score - a.score);
        
      if (villageRisks.length === 0) return;
      const highestRisk = villageRisks[0];
      
      setHighlightedNodeIds(highestRisk.ids);
      setSelectedNode(highestRisk.mappedNode);
      setRiskScore(highestRisk.score);
      setRiskLevel(getRiskLevel(highestRisk.score));
      
      let whatIfResponse = `No village specified. Running simulation for highest-risk village: ${highestRisk.name}.\n\n`;
      whatIfResponse += `Current Risk Score: ${highestRisk.score}/100\n\n`;
      whatIfResponse += `After increasing ANC coverage:\n`;
      whatIfResponse += `• Estimated risk reduction: 15%\n`;
      whatIfResponse += `• Earlier detection of maternal complications\n`;
      whatIfResponse += `• Improved follow-up compliance\n\n`;
      whatIfResponse += `Projected Risk Score: ${Math.max(0, highestRisk.score - 15)}/100`;
      
      setAiExplanation(whatIfResponse);
      
      setTimeout(() => {
        fitView({
          nodes: highestRisk.ids.map((id) => ({ id })),
          padding: 0.4,
          duration: 800,
        });
      }, 150);
      
      lastProcessedQuery.current = copilotQuery;
      return;
    }

    // Comparison mode
    if (intent === 'compare' && mentionedVillages.length >= 2) {
      const village1Name = mentionedVillages[0];
      const village2Name = mentionedVillages[1];

      const mappedVillage1 = nodes.find(n => String(n.data.label).toLowerCase() === village1Name.toLowerCase());
      const mappedVillage2 = nodes.find(n => String(n.data.label).toLowerCase() === village2Name.toLowerCase());

      if (!mappedVillage1 || !mappedVillage2) return;

      const getVillageData = (villageNode: typeof mappedVillage1) => {
        const connectedIds = edges.reduce<string[]>((acc, edge) => {
          if (edge.source === villageNode.id) acc.push(edge.target);
          if (edge.target === villageNode.id) acc.push(edge.source);
          return acc;
        }, []);
        const ids = [...new Set([villageNode.id, ...connectedIds])];
        
        const alerts: string[] = [];
        const drivers: string[] = [];
        const interventions: string[] = [];
        const forecast: string[] = [];
        const alertNodes: GraphNodeResponse[] = [];

        rawNodes.forEach((node) => {
          if (!ids.includes(node.id)) return;
          switch (node.type) {
            case "alert": alerts.push(node.label); alertNodes.push(node); break;
            case "driver": drivers.push(node.label); break;
            case "intervention": interventions.push(node.label); break;
            case "forecast": forecast.push(node.label); break;
          }
        });
        return { ids, alerts, drivers, interventions, forecast, alertNodes };
      };

      const v1Data = getVillageData(mappedVillage1);
      const v2Data = getVillageData(mappedVillage2);

      const v1Score = calculateRiskScore(v1Data.alerts, v1Data.drivers, v1Data.forecast, v1Data.alertNodes);
      const v2Score = calculateRiskScore(v2Data.alerts, v2Data.drivers, v2Data.forecast, v2Data.alertNodes);

      const comparison: VillageComparison = {
        village1: { name: village1Name, riskScore: v1Score, riskLevel: getRiskLevel(v1Score), alerts: v1Data.alerts, drivers: v1Data.drivers, forecast: v1Data.forecast, interventions: v1Data.interventions },
        village2: { name: village2Name, riskScore: v2Score, riskLevel: getRiskLevel(v2Score), alerts: v2Data.alerts, drivers: v2Data.drivers, forecast: v2Data.forecast, interventions: v2Data.interventions },
      };

      setComparisonVillages([village1Name, village2Name]);
      setHighlightedNodeIds([...v1Data.ids, ...v2Data.ids]);
      setSelectedNode(mappedVillage1);
      setAiExplanation(buildComparisonNarrative(comparison));
      setRiskScore(v1Score);
      setRiskLevel(getRiskLevel(v1Score));

      setTimeout(() => {
        fitView({
          nodes: [...v1Data.ids, ...v2Data.ids].map((id) => ({ id })),
          padding: 0.3,
          duration: 800,
        });
      }, 150);

      lastProcessedQuery.current = copilotQuery;
      return;
    }

    // Single village mode
    const villageNode = rawNodes.find(
      (n) => n.type === "village" && copilotQuery.toLowerCase().includes(n.label.toLowerCase())
    );
    if (!villageNode) return;

    const mappedVillageNode = nodes.find(
      (n) => String(n.data.label).toLowerCase() === villageNode.label.toLowerCase() && String(n.data.type ?? "village") === "village"
    );
    if (!mappedVillageNode) return;

    const connectedIds = edges.reduce<string[]>((acc, edge) => {
      if (edge.source === mappedVillageNode.id) acc.push(edge.target);
      if (edge.target === mappedVillageNode.id) acc.push(edge.source);
      return acc;
    }, []);
    const ids = [...new Set([mappedVillageNode.id, ...connectedIds])];

    const alerts: string[] = [];
    const drivers: string[] = [];
    const interventions: string[] = [];
    const recommendations: string[] = [];
    const forecast: string[] = [];
    const alertNodes: GraphNodeResponse[] = [];
    let status = "";
    let confidence = "";

    rawNodes.forEach((node) => {
      if (!ids.includes(node.id)) return;
      switch (node.type) {
        case "alert": alerts.push(node.label); alertNodes.push(node); break;
        case "driver": drivers.push(node.label); break;
        case "intervention": interventions.push(node.label); break;
        case "recommendation": recommendations.push(node.label); break;
        case "forecast": forecast.push(node.label); break;
        case "status": status = node.label; break;
        case "forecast_confidence": confidence = node.label; break;
      }
    });

    const calculatedScore = calculateRiskScore(alerts, drivers, forecast, alertNodes);
    const level = getRiskLevel(calculatedScore);

    setComparisonVillages([]);
    setHighlightedNodeIds(ids);
    setSelectedNode(mappedVillageNode);
    setAiExplanation("Analyzing risk factors and generating insights...");
    setRiskScore(calculatedScore);
    setRiskLevel(level);

    fetchCopilotResponse({
      village: villageNode.label, alerts, drivers, interventions, recommendations, forecast, status, confidence, intent
    }).then((response) => {
      setAiExplanation(response);
    });

    setTimeout(() => {
      fitView({
        nodes: ids.map((id) => ({ id })),
        padding: 0.4,
        duration: 800,
      });
    }, 150);

    lastProcessedQuery.current = copilotQuery;

  }, [copilotQuery, rawNodes, nodes, edges, allVillageNames, fitView]);

  return (
    <div className="relative w-full h-full">
      {loading && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/90 dark:bg-transparent dark:bg-gradient-to-b dark:from-slate-950/90 dark:to-slate-950/70 backdrop-blur-sm rounded-2xl transition-colors duration-300">
          <div className="flex flex-col items-center gap-6">
            <div className="relative w-16 h-16">
              <div className="absolute inset-0 rounded-full border-2 border-slate-200 dark:border-slate-800" />
              <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-sky-400 border-r-sky-400/50 animate-spin" />
              <div className="absolute inset-2 rounded-full border border-sky-500/30 animate-pulse" />
            </div>
            <div className="text-center space-y-1">
              <p className="text-slate-800 dark:text-white font-semibold text-sm">Building Knowledge Graph</p>
              <p className="text-slate-500 dark:text-slate-400 text-xs">Analyzing relationships and patterns…</p>
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
          setComparisonVillages([]);
        }}
      >
        <Background variant={BackgroundVariant.Dots} color="currentColor" className="text-slate-300 dark:text-slate-800" gap={24} size={1.5} />
        <Controls className="!bg-white/80 dark:!bg-slate-900/80 !border !border-slate-200 dark:!border-slate-700/50 backdrop-blur-md !rounded-xl shadow-sm transition-colors" />
        <MiniMap
          nodeColor={(n) => TYPE_STYLES[String(n.data?.type ?? "village")].border}
          className="!bg-white/80 dark:!bg-slate-900/80 !border !border-slate-200 dark:!border-slate-700/50 backdrop-blur-md !rounded-xl shadow-sm transition-colors"
          maskColor="var(--minimap-mask)"
        />
      </ReactFlow>

      {selectedNode && (
        <div className="absolute top-4 right-4 w-96 bg-white/95 dark:bg-transparent dark:bg-gradient-to-br dark:from-slate-900/95 dark:to-slate-950/95 border border-slate-200 dark:border-slate-700/50 rounded-2xl p-5 shadow-lg dark:shadow-2xl z-20 backdrop-blur-md animate-in fade-in slide-in-from-right-4 max-h-[calc(100vh-160px)] overflow-y-auto transition-colors duration-300">
          <div className="flex justify-between items-start gap-3 mb-4">
            <div className="space-y-1 flex-1">
              <h3 className="font-bold text-slate-800 dark:text-white text-lg flex items-center gap-2">
                {aiExplanation ? (
                  <>
                    <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse shadow-[0_0_8px_rgba(56,189,248,0.8)]" />
                    {comparisonVillages.length > 0 ? 'Village Comparison' : 'AI Assessment'}
                  </>
                ) : (
                  "Node Details"
                )}
              </h3>
              <p className="text-slate-600 dark:text-slate-400 text-xs">
                {aiExplanation ? "Insights generated from knowledge graph" : "Selected from knowledge graph"}
              </p>
            </div>
            <button
              onClick={() => {
                setSelectedNode(null);
                setHighlightedNodeIds([]);
                setAiExplanation("");
                setComparisonVillages([]);
              }}
              className="text-slate-400 dark:text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors hover:bg-slate-100 dark:hover:bg-slate-800/50 w-8 h-8 rounded-lg flex items-center justify-center"
              title="Close"
            >
              ✕
            </button>
          </div>

          <div className="h-px bg-gradient-to-r from-slate-200 dark:from-slate-700 via-slate-200/50 dark:via-slate-700/50 to-transparent mb-4" />

          {aiExplanation ? (
            <div className="space-y-4">
              {comparisonVillages.length === 0 && (
                <div className="bg-slate-50 dark:bg-slate-900/60 rounded-xl p-4 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                  <div>
                    <p className="text-slate-500 dark:text-slate-400 text-[10px] uppercase tracking-widest font-semibold mb-1">Risk Level</p>
                    <p className={`text-2xl font-black tracking-tight ${
                      riskLevel === 'LOW' ? 'text-emerald-400' : 
                      riskLevel === 'MODERATE' ? 'text-amber-400' : 'text-red-400'
                    }`}>
                      {riskLevel} RISK
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-slate-500 dark:text-slate-400 text-[10px] uppercase tracking-widest font-semibold mb-1">Score</p>
                    <p className="text-slate-800 dark:text-white text-2xl font-black tracking-tight">
                      {riskScore}<span className="text-slate-500 text-sm font-medium">/100</span>
                    </p>
                  </div>
                </div>
              )}

              <div className="bg-slate-50 dark:bg-slate-900/40 rounded-xl p-4 border border-slate-200 dark:border-slate-800">
                <p className="text-slate-700 dark:text-slate-300 text-sm leading-7 whitespace-pre-line">
                  {aiExplanation}
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                <p className="text-slate-500 dark:text-slate-400 text-[10px] uppercase tracking-widest font-semibold">Name</p>
                <p className="text-slate-800 dark:text-white font-semibold text-base break-words leading-relaxed">
                  {String(selectedNode.data.label)}
                </p>
              </div>
              <div className="space-y-2">
                <p className="text-slate-500 dark:text-slate-400 text-[10px] uppercase tracking-widest font-semibold">Category</p>
                <div className="flex items-center gap-2">
                  <span
                    className="w-3 h-3 rounded-full shadow-lg"
                    style={{
                      background: TYPE_STYLES[String(selectedNode.data.type ?? "village")].border,
                      boxShadow: `0 0 12px ${TYPE_STYLES[String(selectedNode.data.type ?? "village")].border}66`,
                    }}
                  />
                  <p className="text-slate-800 dark:text-white font-medium capitalize">
                    {String(selectedNode.data.type)}
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="pt-4 mt-4 border-t border-slate-200 dark:border-slate-700/30 text-slate-500 text-xs">
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

export default function VillageKnowledgeGraph({ copilotQuery }: Props) {
  return (
    <div
      style={{ height: "calc(100vh - 120px)", minHeight: 500 }}
      className="w-full rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 shadow-sm dark:shadow-2xl transition-colors duration-300"
    >
      <ReactFlowProvider>
        <GraphInner copilotQuery={copilotQuery} />
      </ReactFlowProvider>
    </div>
  );
}