"use client";


import "leaflet/dist/leaflet.css";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

const MapContainer = dynamic(
  () => import("react-leaflet").then(m => m.MapContainer),
  { ssr: false }
);

const TileLayer = dynamic(
  () => import("react-leaflet").then(m => m.TileLayer),
  { ssr: false }
);

const CircleMarker = dynamic(
  () => import("react-leaflet").then(m => m.CircleMarker),
  { ssr: false }
);

const Popup = dynamic(
  () => import("react-leaflet").then(m => m.Popup),
  { ssr: false }
);

import { fetchHeatmap } from "@/services/heatmap.service";

interface HeatmapPoint {
  village: string;
  latitude: number;
  longitude: number;
  high_risk_cases: number;
}
export default function VillageHeatmap() {
  const [data, setData] = useState<HeatmapPoint[]>([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const result = await fetchHeatmap();
        setData(result);
      } catch (error) {
        console.error(error);
      }
    };

    loadData();
  }, []);

  return (
    <div className="h-125 w-full rounded-2xl overflow-hidden">
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
  .map((point, index) => (
    <CircleMarker
      key={index}
      center={[
        point.latitude,
        point.longitude,
      ]}
           radius={
  Math.min(
    Math.max(point.high_risk_cases * 2, 8),
    30
  )
}
    pathOptions={{
  color:
    point.high_risk_cases > 10
      ? "#ef4444"
      : point.high_risk_cases > 5
      ? "#f59e0b"
      : "#22c55e",

  fillColor:
    point.high_risk_cases > 10
      ? "#ef4444"
      : point.high_risk_cases > 5
      ? "#f59e0b"
      : "#22c55e",

  fillOpacity: 0.7,
}}
          >
          <Popup>
  <div>
    <strong>{point.village}</strong>

    <br />

    High Risk Cases:
    {" "}
    {point.high_risk_cases}

    <br />

    Risk Level:
    {" "}
    {point.high_risk_cases > 10
      ? "High"
      : point.high_risk_cases > 5
      ? "Medium"
      : "Low"}
  </div>
</Popup>
          </CircleMarker>
        ))}
      </MapContainer>
    </div>
  );
}