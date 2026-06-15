"use client";


import "leaflet/dist/leaflet.css";
// import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

import { CircleMarker, MapContainer, Popup, TileLayer } from "react-leaflet";

import { fetchHeatmap } from "@/services/heatmap.service";

interface HeatmapPoint {
  village: string;
  latitude: number;
  longitude: number;
  high_risk_cases: number;
  medium_risk_cases: number;
  low_risk_cases: number;
}
export default function VillageHeatmap() {
  const [data, setData] = useState<HeatmapPoint[]>([]);

  useEffect(() => {
  const loadData = async () => {
    try {
      const result = await fetchHeatmap();

      console.log("HEATMAP DATA", result);

      setData(result);
    } catch (error) {
      console.error(error);
    }
  };

  loadData();
}, []);

  return (
    <div className="h-150 w-full rounded-2xl overflow-hidden">
      <MapContainer
        center={[23.685, 90.3563]}
        zoom={7}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

       {data
  .filter(
    (point) =>
      point.latitude != null &&
      point.longitude != null
  )
  .map((point, index) => {

    const riskLevel =
      point.high_risk_cases > 0
        ? "HIGH"
        : point.medium_risk_cases > 0
        ? "MEDIUM"
        : "LOW";

    const color =
      riskLevel === "HIGH"
        ? "#ef4444"
        : riskLevel === "MEDIUM"
        ? "#f59e0b"
        : "#22c55e";

    return (
      <CircleMarker
        key={index}
        center={[
          point.latitude,
          point.longitude,
        ]}
        radius={
          riskLevel === "HIGH"
            ? 18
            : riskLevel === "MEDIUM"
            ? 14
            : 10
        }
        pathOptions={{
          color,
          fillColor: color,
          fillOpacity: 0.8,
        }}
      >
        <Popup>
          <div>
            <strong>{point.village}</strong>

            <br />

            Risk Level: {riskLevel}

            <br />

            High Risk: {point.high_risk_cases}

            <br />

            Medium Risk: {point.medium_risk_cases}

            <br />

            Low Risk: {point.low_risk_cases}
          </div>
        </Popup>
      </CircleMarker>
    );
  })}
      </MapContainer>

      <div className="flex gap-6 mt-4 text-sm">
  <div className="flex items-center gap-2">
    <div className="w-4 h-4 rounded-full bg-red-500" />
    High Risk
  </div>

  <div className="flex items-center gap-2">
    <div className="w-4 h-4 rounded-full bg-yellow-500" />
    Medium Risk
  </div>

  <div className="flex items-center gap-2">
    <div className="w-4 h-4 rounded-full bg-green-500" />
    Low Risk
  </div>
</div>
    </div>

    
  );
}