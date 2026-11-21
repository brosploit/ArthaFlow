import React, { useState, useEffect, useRef } from "react";
import {
  Bot,
  Send,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Terminal,
  ArrowRight,
  Trash2,
  Cpu,
  HelpCircle,
  Database,
  Calculator,
} from "lucide-react";
import { useWorkspace } from "../context/WorkspaceContext";
import { api } from "../services/api";
import { ChatMessage } from "../types";
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import { DEMO_CHAT_MESSAGES } from "../services/demoData";

export interface AIAgentPageProps {
  onNavigate?: (path: string) => void;
}

export const AIAgentPage: React.FC<AIAgentPageProps> = () => {
  const { activeWorkspace } = useWorkspace();
  const [messages, setMessages] = useState<ChatMessage[]>(DEMO_CHAT_MESSAGES);
  const [inputValue, setInputValue] = useState("");
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isSending]);

  const handleSend = async (textToSend?: string) => {
    const text = (textToSend || inputValue).trim();
    if (!text || isSending) return;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      session_id: "active",
      role: "user",
      content: text,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue("");
    setIsSending(true);

    try {
      const response = await api.sendChatMessage(activeWorkspace.id, text, messages);
      setMessages((prev) => [...prev, response]);
    } finally {
      setIsSending(false);
    }
  };

  const clearChat = () => {
    setMessages([]);
  };

  const suggestedPrompts = [
    "What is my current available cash and runway?",
    "Can I afford to purchase ₹50,000 fabric inventory today?",
    "Explain the duplicate charge alert from Surat Cotton Mills",
    "Show me upcoming payables for the next 14 days",
  ];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-surface-card p-5 rounded-xl border border-surface-border">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              <Bot className="w-5 h-5" />
            </span>
            <h1 className="text-xl font-bold text-slate-100">AI Financial Decision Agent</h1>
            <Badge variant="emerald" dot>
              Zero-Hallucination Guard Active
            </Badge>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Calls verified deterministic backend tools for all numbers. Explains evidence-backed financial decisions with mathematical certainty.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={clearChat}
            variant="outline"
            size="sm"
            className="text-xs gap-1.5 text-slate-400 hover:text-rose-400 hover:border-rose-500/40"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear Context</span>
          </Button>
        </div>
      </div>

      {/* Suggested Prompt Chips */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs text-slate-500 font-mono flex items-center gap-1 mr-1">
          <Sparkles className="w-3 h-3 text-emerald-400" />
          Suggested:
        </span>
        {suggestedPrompts.map((prompt, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(prompt)}
            className="px-3 py-1.5 rounded-lg bg-surface-elevated hover:bg-surface-hover border border-surface-border hover:border-emerald-500/40 text-xs text-slate-300 hover:text-slate-100 transition-all select-none text-left"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Chat Container */}
      <Card className="flex flex-col h-[650px] p-0 overflow-hidden">
        {/* Messages Stream */}
        <div className="flex-1 p-5 overflow-y-auto space-y-5">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 max-w-3xl ${
                msg.role === "user" ? "ml-auto justify-end" : "mr-auto justify-start"
              }`}
            >
              {msg.role === "assistant" && (
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div className="space-y-2.5 max-w-2xl">
                {/* Content Bubble */}
                <div
                  className={`p-4 rounded-2xl text-xs leading-relaxed ${
                    msg.role === "user"
                      ? "bg-emerald-500 text-slate-950 font-medium rounded-tr-none shadow-glow-emerald"
                      : "bg-surface-elevated border border-surface-border text-slate-200 rounded-tl-none whitespace-pre-line"
                  }`}
                >
                  {msg.content}
                </div>

                {/* Tool Calling Execution Card */}
                {msg.tool_calls_executed && msg.tool_calls_executed.length > 0 && (
                  <div className="p-3 rounded-xl bg-surface-card border border-surface-border/80 space-y-2 text-[11px] font-mono">
                    <div className="flex items-center gap-1.5 text-cyan-400 font-semibold">
                      <Terminal className="w-3.5 h-3.5" />
                      <span>Verified Deterministic Tool Executed:</span>
                    </div>
                    {msg.tool_calls_executed.map((tc, ti) => (
                      <div key={ti} className="p-2 rounded bg-surface-elevated/70 space-y-1">
                        <div className="text-slate-300 font-bold">
                          tool: <span className="text-emerald-400">{tc.tool_name}()</span>
                        </div>
                        <div className="text-slate-400 text-[10px]">
                          Result: {tc.result_summary}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Verified Figures Badge Strip */}
                {msg.verified_figures && msg.verified_figures.length > 0 && (
                  <div className="flex flex-wrap items-center gap-2">
                    {msg.verified_figures.map((vf, vi) => (
                      <div
                        key={vi}
                        className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-surface-card border border-emerald-500/30 text-[11px]"
                      >
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-slate-400">{vf.label}:</span>
                        <strong className="text-slate-100 font-mono">{vf.value}</strong>
                        <span className="text-[9px] text-slate-500 font-mono">({vf.source})</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Suggested Followups */}
                {msg.suggested_followups && msg.suggested_followups.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {msg.suggested_followups.map((fup, fi) => (
                      <button
                        key={fi}
                        onClick={() => handleSend(fup)}
                        className="text-[11px] text-emerald-400 hover:text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 px-2 py-0.5 rounded border border-emerald-500/20 transition-colors"
                      >
                        → {fup}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}

          {isSending && (
            <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
              <Bot className="w-4 h-4 text-emerald-400 animate-spin" />
              <span>Invoking deterministic calculation tools...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-4 bg-surface-elevated border-t border-surface-border">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-3"
          >
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask anything about liquidity, inventory CapEx, runway, or risks..."
              className="flex-1 h-11 px-4 rounded-xl bg-surface-card border border-surface-border text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 transition-colors font-medium"
            />
            <Button
              type="submit"
              variant="primary"
              size="md"
              disabled={!inputValue.trim() || isSending}
              className="h-11 px-5 shadow-glow-emerald font-semibold"
            >
              <Send className="w-4 h-4" />
              <span className="hidden sm:inline ml-1.5">Consult Agent</span>
            </Button>
          </form>
          <div className="flex items-center justify-between text-[10px] text-slate-500 mt-2 px-1 font-mono">
            <span>Guaranteed zero financial invention • Deterministic backend tools</span>
            <span>Gemini 2.5 Pro + Python Execution Sandbox</span>
          </div>
        </div>
      </Card>
    </div>
  );
};
