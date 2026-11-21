import React, { useState, useEffect } from "react";
import {
  Brain,
  Sparkles,
  CheckCircle2,
  Clock,
  ArrowRight,
  TrendingUp,
  Target,
  FileCheck,
  Calendar,
  Layers,
  ChevronRight,
  Plus,
} from "lucide-react";
import { useWorkspace } from "../context/WorkspaceContext";
import { api } from "../services/api";
import { DecisionMemory } from "../types";
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import { formatDate } from "../lib/utils";

export interface DecisionMemoryPageProps {
  onNavigate?: (path: string) => void;
}

export const DecisionMemoryPage: React.FC<DecisionMemoryPageProps> = () => {
  const { activeWorkspace } = useWorkspace();
  const [decisions, setDecisions] = useState<DecisionMemory[]>([]);
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "evaluated">("all");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      try {
        const data = await api.getDecisionMemories(activeWorkspace.id);
        setDecisions(data);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [activeWorkspace.id]);

  const filtered = decisions.filter(
    (d) => filterStatus === "all" || d.status === filterStatus
  );

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-surface-card p-5 rounded-xl border border-surface-border">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/30">
              <Brain className="w-5 h-5" />
            </span>
            <h1 className="text-xl font-bold text-slate-100">Decision Memory & Calibration</h1>
            <Badge variant="amber">Continuous Learning</Badge>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Preserve financial hypotheses, model assumptions, and compare expected outcomes against verified actuals over time.
          </p>
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-1 p-1 bg-surface-elevated border border-surface-border rounded-lg text-xs">
          <button
            onClick={() => setFilterStatus("all")}
            className={`px-3 py-1 rounded-md transition-colors ${
              filterStatus === "all" ? "bg-surface-card text-emerald-400 font-semibold" : "text-slate-400"
            }`}
          >
            All Decisions ({decisions.length})
          </button>
          <button
            onClick={() => setFilterStatus("active")}
            className={`px-3 py-1 rounded-md transition-colors ${
              filterStatus === "active" ? "bg-surface-card text-emerald-400 font-semibold" : "text-slate-400"
            }`}
          >
            Active In-Flight
          </button>
          <button
            onClick={() => setFilterStatus("evaluated")}
            className={`px-3 py-1 rounded-md transition-colors ${
              filterStatus === "evaluated" ? "bg-surface-card text-emerald-400 font-semibold" : "text-slate-400"
            }`}
          >
            Evaluated
          </button>
        </div>
      </div>

      {/* Decisions Feed */}
      <div className="space-y-6">
        {filtered.map((dec) => (
          <Card key={dec.id} className="space-y-5 hover:border-surface-subtle transition-all">
            {/* Decision Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-surface-border pb-4">
              <div>
                <div className="flex items-center gap-2.5">
                  <h3 className="text-base font-bold text-slate-100">{dec.decision_title}</h3>
                  <Badge variant={dec.status === "evaluated" ? "emerald" : "indigo"}>
                    {dec.status === "evaluated" ? "Evaluated" : "Active In-Flight"}
                  </Badge>
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-400 mt-1 font-mono">
                  <span>Category: {dec.category}</span>
                  <span>•</span>
                  <span>Committed: {formatDate(dec.decision_date)}</span>
                  <span>•</span>
                  <span>Review Horizon: {formatDate(dec.evaluation_date)}</span>
                </div>
              </div>
            </div>

            {/* Strategic Hypothesis */}
            <div className="p-3.5 rounded-xl bg-surface-elevated/70 border border-surface-border space-y-1.5">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5 text-cyan-400" />
                Strategic Hypothesis & Expected Target
              </span>
              <p className="text-xs text-slate-200 leading-relaxed font-medium">"{dec.hypothesis}"</p>
            </div>

            {/* Expected vs Actual Outcomes Matrix */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Expected Targets */}
              <div className="space-y-2">
                <h4 className="text-xs font-semibold text-slate-300 flex items-center gap-1.5 font-mono">
                  <Clock className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Modeled Expectations (From Scenario Lab)</span>
                </h4>
                <div className="space-y-2">
                  {dec.expected_outcomes.map((exp, ei) => (
                    <div
                      key={ei}
                      className="p-2.5 rounded-lg bg-surface-card border border-surface-border flex items-center justify-between text-xs"
                    >
                      <div>
                        <span className="text-slate-300 font-medium">{exp.metric}</span>
                        <span className="text-[10px] text-slate-500 font-mono block">
                          Horizon: {exp.timeframe}
                        </span>
                      </div>
                      <span className="font-mono font-bold text-slate-100">{exp.expected_value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Verified Actuals */}
              <div className="space-y-2">
                <h4 className="text-xs font-semibold text-slate-300 flex items-center gap-1.5 font-mono">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Verified Actual Outcomes</span>
                </h4>
                <div className="space-y-2">
                  {dec.actual_outcomes && dec.actual_outcomes.length > 0 ? (
                    dec.actual_outcomes.map((act, ai) => (
                      <div
                        key={ai}
                        className="p-2.5 rounded-lg bg-surface-card border border-surface-border flex items-center justify-between text-xs"
                      >
                        <div>
                          <span className="text-slate-300 font-medium">{act.metric}</span>
                          <span className="text-[10px] text-slate-500 font-mono block">
                            Evaluated: {formatDate(act.evaluated_at)}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="font-mono font-bold text-emerald-400">{act.actual_value}</span>
                          <Badge
                            variant={act.verdict === "exceeded" ? "emerald" : "cyan"}
                            className="text-[9px] uppercase font-mono ml-2"
                          >
                            {act.verdict}
                          </Badge>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-4 rounded-lg bg-surface-card border border-surface-border/60 text-center text-xs text-slate-500">
                      Outcome tracking in progress. Will be evaluated at next ledger reconciliation.
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Assumptions Evaluated */}
            {dec.assumptions && dec.assumptions.length > 0 && (
              <div className="pt-3 border-t border-surface-border/50 space-y-1.5">
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                  Assumptions Recorded:
                </span>
                <div className="flex flex-wrap gap-2">
                  {dec.assumptions.map((asm, ai) => (
                    <span
                      key={ai}
                      className="px-2 py-0.5 rounded bg-surface-elevated border border-surface-border text-[11px] text-slate-300"
                    >
                      • {asm}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
};
