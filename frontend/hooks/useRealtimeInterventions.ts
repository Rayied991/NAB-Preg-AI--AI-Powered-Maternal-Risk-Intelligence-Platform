import { createClient } from "@supabase/supabase-js";
import { useEffect, useState } from "react";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type Intervention = {
  id: string;
  village_name: string;
  intervention_type: string;
  message: string;
  created_at: string;
};

export function useRealtimeInterventions() {
  const [newIntervention, setNewIntervention] = useState<Intervention | null>(null);
  const [isListening, setIsListening] = useState(false);

  useEffect(() => {
    // Subscribe to INSERT events on ai_interventions table
    const channel = supabase
      .channel("interventions-changes")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "ai_interventions",
        },
        (payload) => {
          console.log("🔔 NEW INTERVENTION INSERTED IN REAL-TIME:", payload.new);
          setNewIntervention(payload.new as Intervention);
          
          // Auto-clear notification after 5 seconds
          setTimeout(() => setNewIntervention(null), 5000);
        }
      )
      .subscribe((status) => {
        console.log("📡 Realtime subscription status:", status);
        if (status === "SUBSCRIBED") {
          setIsListening(true);
        }
      });

    // Cleanup on unmount
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return { newIntervention, isListening };
}