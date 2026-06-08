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
    <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm dark:shadow-lg max-h-100 overflow-y-auto transition-colors duration-300">
      <h2 className="text-slate-800 dark:text-white font-bold text-lg mb-3">AI Interventions</h2>
      {interventions.length === 0 && (
        <p className="text-slate-600 dark:text-slate-400 text-sm">No interventions yet.</p>
      )}
      <ul className="flex flex-col gap-2">
        {interventions.map((i) => (
          <li
            key={i.id}
            className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/50 rounded-md p-2 text-sm text-slate-700 dark:text-white"
          >
            <strong className="text-slate-900 dark:text-white">{i.village_name}</strong> - {i.intervention_type} <br />
            {i.message} <br />
            <span className="text-slate-500 dark:text-slate-400 text-xs">{new Date(i.created_at).toLocaleString()}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}