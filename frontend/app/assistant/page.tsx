"use client";

import { askAssistant } from "@/services/rag.service";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

// ── Types ────────────────────────────────────────────────────────────────────

type Message = {
  id: string;
  role: "user" | "assistant";
  text: string;
  ts: Date;
  sources?: string[];
};

// ── Helper: Strip Markdown Formatting ────────────────────────────────────────

const stripMarkdown = (text: string): string => {
  return text
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/\*\*(.+?)\*\*/g, "$1")
    .replace(/\*(.+?)\*/g, "$1")
    .replace(/^[\-\*]\s+/gm, "• ")
    .replace(/```[\s\S]*?```/g, "")
    .replace(/`(.+?)`/g, "$1")
    .replace(/\[(.+?)\]\(.+?\)/g, "$1")
    .replace(/^---+$/gm, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
};

// ── Page ──────────────────────────────────────────────────────────────────────

export default function AssistantPage() {
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setQuestion(e.target.value);
    e.target.style.height = "auto";
    e.target.style.height = `${Math.min(e.target.scrollHeight, 160)}px`;
  };

  const handleAsk = async () => {
    const q = question.trim();
    if (!q || loading) return;

    const userMsg: Message = {
      id: crypto.randomUUID(),
      role: "user",
      text: q,
      ts: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setQuestion("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }

    setLoading(true);
    try {
      const result = await askAssistant(q);
      const cleanText = stripMarkdown(result.answer);
      
      const assistantMsg: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        text: cleanText,
        sources: result.sources,
        ts: new Date(),
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (error) {
      console.error(error);
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          text: "Something went wrong. Please try again.",
          ts: new Date(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleAsk();
    }
  };

  const fmt = (d: Date) =>
    d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  return (
    <div className="flex flex-col fixed inset-0 overflow-hidden bg-[#f4f7fb] dark:bg-[#0b0f1a] transition-colors duration-300">

      {/* ── Header ── */}
      <div className="shrink-0 px-6 py-5 border-b border-[#e2e8f0] dark:border-[#1a2235] flex items-center justify-between bg-white dark:bg-[#0b0f1a] transition-colors duration-300">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="w-8 h-8 rounded-xl bg-[#e6f0fa] dark:bg-[#0f1f32] border border-[#cce0f5] dark:border-[#1e3350] hover:border-[#b3d1f0] dark:hover:border-[#2a4a70] hover:bg-[#d9ebf9] dark:hover:bg-[#112340] flex items-center justify-center transition-all duration-200 group"
            title="Back to dashboard"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#4a7fa8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </Link>

          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#3b82f6] opacity-60" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#3b82f6]" />
          </span>
          <div>
            <p className="text-[11px] font-semibold tracking-widest uppercase text-[#4a7fa8]">
              Maternal Health AI
            </p>
            <h1 className="text-[18px] font-semibold text-slate-800 dark:text-[#e8edf8] leading-tight">
              Clinical Assistant
            </h1>
          </div>
        </div>

        {messages.length > 0 && (
          <button
            onClick={() => setMessages([])}
            className="text-[12px] text-slate-500 hover:text-slate-700 dark:text-[#3a4a68] dark:hover:text-[#5a6a88] transition-colors duration-200 flex items-center gap-1.5"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="1 4 1 10 7 10" /><path d="M3.51 15a9 9 0 1 0 .49-3.51" />
            </svg>
            New chat
          </button>
        )}
      </div>

      {/* ── Message list ── */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6">

        {/* Empty state */}
        {messages.length === 0 && !loading && (
          <div className="flex flex-col items-center justify-center h-full gap-6 pb-10">
            <div className="w-14 h-14 rounded-2xl bg-[#e6f0fa] dark:bg-[#0f1f38] border border-[#cce0f5] dark:border-[#1e3350] flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#4a7fa8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
            </div>
            <div className="text-center">
              <p className="text-[15px] font-medium text-[#1e3a5f] dark:text-[#c8d0e0] mb-1">
                Ask anything about maternal health
              </p>
              <p className="text-[13px] text-slate-500 dark:text-[#3a4a68] max-w-xs">
                Powered by clinical knowledge — risk factors, symptoms, care guidelines, and more.
              </p>
            </div>

            <div className="flex flex-wrap justify-center gap-2 max-w-md">
              {[
                "What are signs of pre-eclampsia?",
                "Normal hemoglobin range in pregnancy?",
                "When is anemia considered high risk?",
                "Dietary advice for iron deficiency",
              ].map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => {
                    setQuestion(prompt);
                    textareaRef.current?.focus();
                  }}
                  className="px-3 py-1.5 text-[12px] text-[#2a5a8a] dark:text-[#4a7fa8] bg-[#e6f0fa] dark:bg-[#0f1f32] border border-[#cce0f5] dark:border-[#1e3350] rounded-lg hover:border-[#b3d1f0] dark:hover:border-[#2a4a70] hover:bg-[#d9ebf9] dark:hover:bg-[#112340] transition-all duration-200 shadow-sm dark:shadow-none"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Messages */}
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-3 max-w-3xl ${msg.role === "user" ? "ml-auto flex-row-reverse" : ""}`}
          >
            {/* Avatar */}
            <div className={`shrink-0 w-8 h-8 rounded-xl flex items-center justify-center text-[11px] font-bold
              ${msg.role === "user"
                ? "bg-[#1a4fa8] text-[#d8e8ff]"
                : "bg-[#e6f0fa] dark:bg-[#0f1f32] border border-[#cce0f5] dark:border-[#1e3350] text-[#4a7fa8]"
              }`}
            >
              {msg.role === "user" ? "YOU" : "AI"}
            </div>

            {/* Bubble */}
            <div className={`flex flex-col gap-1 max-w-[80%] ${msg.role === "user" ? "items-end" : "items-start"}`}>
              <div
                className={`px-4 py-3 rounded-2xl text-[13px] leading-relaxed shadow-sm dark:shadow-none
                  ${msg.role === "user"
                    ? "bg-[#1a4fa8] text-[#d8e8ff] rounded-tr-sm"
                    : "bg-white dark:bg-[#131720] border border-[#e2e8f0] dark:border-[#1e2535] text-slate-800 dark:text-[#c8d0e0] rounded-tl-sm"
                  }`}
              >
                <div className={`text-[13px] leading-relaxed whitespace-pre-wrap ${
                  msg.role === "user"
                    ? "text-[#d8e8ff]"
                    : "text-slate-800 dark:text-[#c8d0e0]"
                }`}>
                  {msg.text}
                </div>

                {/* ── Polished Sources Section ── */}
                {msg.role === "assistant" && msg.sources && msg.sources.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-[#f1f5f9] dark:border-[#2a3345]">
                    <p className="text-[10px] font-semibold text-[#4a7fa8] mb-1.5 uppercase tracking-wide">
                      Clinical Guidelines Used
                    </p>

                    {/* FIX: Added ?. to slice to satisfy TypeScript */}
                    {msg.sources?.slice(0, 3).map((source, index) => (
                      <div key={index} className="flex items-center gap-2 text-[11px] text-[#64748b] dark:text-[#7a8aa5] mb-1">
                        <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 opacity-70">
                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                          <polyline points="14 2 14 8 20 8"></polyline>
                          <line x1="16" y1="13" x2="8" y2="13"></line>
                          <line x1="16" y1="17" x2="8" y2="17"></line>
                        </svg>
                       <span className="truncate">{(source.split("/").pop() ?? source).replace(".pdf", "")}</span>
                      </div>
                    ))}
                    
                    {/* FIX: Added ?. to length checks to satisfy TypeScript */}
                    {msg.sources && msg.sources?.length > 3 && (
                      <p className="text-[11px] text-slate-400 mt-1 italic">
                        +{(msg.sources?.length || 0) - 3} more guidelines referenced
                      </p>
                    )}
                  </div>
                )}
              </div>
              <span className="text-[11px] text-slate-400 dark:text-[#2d3a50] px-1">{fmt(msg.ts)}</span>
            </div>
          </div>
        ))}

        {/* Typing indicator */}
        {loading && (
          <div className="flex gap-3 max-w-3xl">
            <div className="shrink-0 w-8 h-8 rounded-xl bg-[#e6f0fa] dark:bg-[#0f1f32] border border-[#cce0f5] dark:border-[#1e3350] flex items-center justify-center text-[11px] font-bold text-[#4a7fa8]">
              AI
            </div>
            <div className="px-4 py-3 rounded-2xl rounded-tl-sm bg-white dark:bg-[#131720] border border-[#e2e8f0] dark:border-[#1e2535] flex items-center gap-1.5 shadow-sm dark:shadow-none">
              <span className="w-1.5 h-1.5 rounded-full bg-[#4a7fa8] animate-bounce" style={{ animationDelay: "0ms" }} />
              <span className="w-1.5 h-1.5 rounded-full bg-[#4a7fa8] animate-bounce" style={{ animationDelay: "150ms" }} />
              <span className="w-1.5 h-1.5 rounded-full bg-[#4a7fa8] animate-bounce" style={{ animationDelay: "300ms" }} />
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* ─ Input bar ── */}
      <div className="shrink-0 px-4 pb-5 pt-3 border-t border-[#e2e8f0] dark:border-[#1a2235] bg-[#f4f7fb] dark:bg-[#0b0f1a] transition-colors duration-300">
        <div className="max-w-3xl mx-auto flex items-end gap-3 bg-white dark:bg-[#131720] border border-[#cbd5e1] dark:border-[#1e2535] rounded-2xl px-4 py-3 focus-within:border-[#4a7fa8] dark:focus-within:border-[#2a4a70] transition-colors duration-200 shadow-sm dark:shadow-none">
          <textarea
            ref={textareaRef}
            value={question}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            placeholder="Ask a maternal health question… (Enter to send)"
            rows={1}
            className="flex-1 bg-transparent text-[13px] text-slate-800 dark:text-[#c8d0e0] placeholder-[#94a3b8] dark:placeholder-[#2d3a50] resize-none focus:outline-none leading-relaxed"
            style={{ minHeight: "24px", maxHeight: "160px" }}
            disabled={loading}
          />
          <button
            onClick={handleAsk}
            disabled={!question.trim() || loading}
            className="shrink-0 w-9 h-9 rounded-xl bg-[#1a4fa8] hover:bg-[#2060c8] disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center transition-all duration-200 active:scale-95"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#d8e8ff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </button>
        </div>
        <p className="text-center text-[11px] text-slate-400 dark:text-[#1e2a3a] mt-2">
          Shift + Enter for new line · Enter to send
        </p>
      </div>

    </div>
  );
}