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

  useEffect(() => {
    fetchAIInterventions().then((data) => setInterventions(data));
  }, []);

  return (
    <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 shadow-lg max-h-100 overflow-y-auto">
      <h2 className="text-white font-bold text-lg mb-3">AI Interventions</h2>
      {interventions.length === 0 && (
        <p className="text-slate-400 text-sm">No interventions yet.</p>
      )}
      <ul className="flex flex-col gap-2">
        {interventions.map((i) => (
          <li
            key={i.id}
            className="bg-slate-800 rounded-md p-2 text-sm text-white"
          >
            <strong>{i.village_name}</strong> - {i.intervention_type} <br />
            {i.message} <br />
            <span className="text-slate-400 text-xs">{new Date(i.created_at).toLocaleString()}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}