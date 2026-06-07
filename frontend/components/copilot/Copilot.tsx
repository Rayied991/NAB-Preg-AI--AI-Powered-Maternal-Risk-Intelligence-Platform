"use client";

import { useState } from "react";

type CopilotProps = {
  onQuery: (query: string) => void;
};

export default function Copilot({ onQuery }: CopilotProps) {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const handleSubmit = () => {
    if (query.trim()) {
      onQuery(query);
      setQuery("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSubmit();
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-40">
      {/* Floating Panel */}
      {isOpen && (
        <div className="absolute bottom-16 right-0 w-96 bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-700/50 rounded-2xl p-5 shadow-2xl backdrop-blur-md animate-in fade-in slide-in-from-bottom-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-white font-bold text-sm">✨ Graph Navigator</h3>
              <p className="text-slate-400 text-xs mt-1">Ask about villages, alerts, or patterns</p>
            </div>
          </div>
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="e.g., Find village X..."
                className="w-full bg-slate-800/50 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none border border-slate-600/50 focus:border-sky-500/50 transition-colors backdrop-blur-sm"
              />
            </div>
            <button
              onClick={handleSubmit}
              className="bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 text-white px-4 py-2.5 rounded-lg text-sm font-semibold transition-all shadow-lg hover:shadow-sky-500/50"
            >
              →
            </button>
          </div>
        </div>
      )}

      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 rounded-full bg-gradient-to-br from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 text-white font-bold text-xl shadow-lg hover:shadow-sky-500/50 transition-all flex items-center justify-center hover:scale-110 active:scale-95"
        title={isOpen ? "Close" : "Open Navigator"}
      >
        {isOpen ? "✕" : "🧭"}
      </button>
    </div>
  );
}