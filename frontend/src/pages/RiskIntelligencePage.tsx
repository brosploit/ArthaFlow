import React, { useState, useEffect } from "react";
import {
  ShieldAlert,
  AlertTriangle,
  AlertCircle,
  Info,
  CheckCircle2,
  Clock,
  ArrowRight,
  ExternalLink,
  RotateCcw,
  Sparkles,
  Search,
} from "lucide-react";
import { useWorkspace } from "../context/WorkspaceContext";
import { api } from "../services/api";
import { RiskAlert, RiskSeverity } from "../types";
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import { formatDate } from "../lib/utils";

export interface RiskIntelligencePageProps {
  onNavigate?: (path: string) => void;
}

export const RiskIntelligencePage: React.FC<RiskIntelligencePageProps> = ({ onNavigate }) => {
  const { activeWorkspace, formatAmount } = useWorkspace();
  const [alerts, setAlerts] = useState<RiskAlert[]>([]);
  const [filterSeverity, setFilterSeverity] = useState<"all" | RiskSeverity>("all");
  const [isLoading, setIsLoading] = useState(true);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const data = await api.getRiskAlerts(activeWorkspace.id);
      setAlerts(data);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [activeWorkspace.id]);

  const handleResolve = async (id: string) => {
    await api.resolveRiskAlert(activeWorkspace.id, id);
    loadData();
  };

  const filtered = alerts.filter(
    (a) => filterSeverity === "all" || a.severity === filterSeverity
  );

  const activeAlerts = alerts.filter((a) => !a.is_resolved);
  const totalImpact = activeAlerts.reduce((acc, a) => acc + (a.financial_impact || 0), 0);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-surface-card p-5 rounded-xl border border-surface-border">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/30">
              <ShieldAlert className="w-5 h-5" />
            </span>
            <h1 className="text-xl font-bold text-slate-100">Financial Risk Intelligence</h1>
            <Badge variant="rose">{activeAlerts.length} Actionable</Badge>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Explainable anomaly detection flagging potential duplicate debits, receivable concentrations, and cash-flow pinches.
          </p>
        </div>

        {/* Severity Filter Tabs */}
        <div className="flex items-center gap-1 p-1 bg-surface-elevated border border-surface-border rounded-lg text-xs">
          <button
            onClick={() => setFilterSeverity("all")}
            className={`px-2.5 py-1 rounded-md transition-colors ${
              filterSeverity === "all" ? "bg-surface-card text-emerald-400 font-semibold" : "text-slate-400"
            }`}
          >
            All ({alerts.length})
          </button>
          <button
            onClick={() => setFilterSeverity("high")}
            className={`px-2.5 py-1 rounded-md transition-colors ${
              filterSeverity === "high" ? "bg-rose-500/20 text-rose-400 font-semibold" : "text-slate-400"
            }`}
          >
            High
          </button>
          <button
            onClick={() => setFilterSeverity("medium")}
            className={`px-2.5 py-1 rounded-md transition-colors ${
              filterSeverity === "medium" ? "bg-amber-500/20 text-amber-400 font-semibold" : "text-slate-400"
            }`}
          >
            Medium
          </button>
          <button
            onClick={() => setFilterSeverity("low")}
            className={`px-2.5 py-1 rounded-md transition-colors ${
              filterSeverity === "low" ? "bg-cyan-500/20 text-cyan-400 font-semibold" : "text-slate-400"
            }`}
          >
            Low
          </button>
        </div>
      </div>

      {/* Metrics Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="hover:border-rose-500/40">
          <span className="text-xs text-slate-400">Total Flagged Exposure</span>
          <div className="text-2xl font-bold font-mono text-rose-400 mt-2">
            {formatAmount(totalImpact)}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Combined value of open risk signals</p>
        </Card>

        <Card className="hover:border-amber-500/40">
          <span className="text-xs text-slate-400">Active Vulnerability Signals</span>
          <div className="text-2xl font-bold font-mono text-slate-100 mt-2">
            {activeAlerts.length} Alerts
          </div>
          <p className="text-[11px] text-slate-500 mt-1">1 High, 1 Medium, 1 Low severity</p>
        </Card>

        <Card className="hover:border-emerald-500/40">
          <span className="text-xs text-slate-400">Audit Rule Engine Status</span>
          <div className="text-2xl font-bold font-mono text-emerald-400 mt-2">100% Deterministic</div>
          <p className="text-[11px] text-slate-500 mt-1">Zero probabilistic false-conviction</p>
        </Card>
      </div>

      {/* Alerts List */}
      <div className="space-y-4">
        {filtered.map((alert) => (
          <Card
            key={alert.id}
            className={`space-y-4 transition-all ${
              alert.is_resolved
                ? "opacity-60 bg-surface-elevated/20 border-surface-border/50"
                : alert.severity === "high"
                ? "border-rose-500/30 bg-rose-500/5 hover:border-rose-500/50"
                : alert.severity === "medium"
                ? "border-amber-500/30 bg-amber-500/5 hover:border-amber-500/50"
                : "border-cyan-500/30 bg-cyan-500/5 hover:border-cyan-500/50"
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <div
                  className={`p-2 rounded-lg shrink-0 mt-0.5 ${
                    alert.severity === "high"
                      ? "bg-rose-500/20 text-rose-400"
                      : alert.severity === "medium"
                      ? "bg-amber-500/20 text-amber-400"
                      : "bg-cyan-500/20 text-cyan-400"
                  }`}
                >
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-sm font-bold text-slate-100">{alert.title}</h3>
                    <Badge
                      variant={
                        alert.severity === "high"
                          ? "rose"
                          : alert.severity === "medium"
                          ? "amber"
                          : "cyan"
                      }
                      className="text-[10px] uppercase font-mono"
                    >
                      {alert.severity} Severity
                    </Badge>
                    {alert.is_resolved && (
                      <Badge variant="neutral" className="text-[10px]">
                        Resolved
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-slate-300 mt-1">{alert.description}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0 self-end sm:self-start">
                <span className="text-xs font-mono font-bold text-slate-100">
                  Impact: {formatAmount(alert.financial_impact)}
                </span>
                {!alert.is_resolved && (
                  <Button
                    onClick={() => handleResolve(alert.id)}
                    variant="outline"
                    size="sm"
                    className="text-xs gap-1 border-surface-border text-slate-300 hover:text-white"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Resolve</span>
                  </Button>
                )}
              </div>
            </div>

            {/* Explainable Rationale Drawer */}
            <div className="p-3 rounded-lg bg-surface-elevated/70 border border-surface-border space-y-2 text-xs">
              <div className="flex items-center gap-1.5 text-slate-400 font-mono text-[11px] uppercase tracking-wider">
                <Info className="w-3.5 h-3.5 text-emerald-400" />
                <span>Deterministic Detection Rationale</span>
              </div>
              <p className="text-slate-300 leading-relaxed text-[11px]">{alert.explanation}</p>
            </div>

            {/* Related Transactions if any */}
            {alert.related_transactions && alert.related_transactions.length > 0 && (
              <div className="space-y-2">
                <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block">
                  Matched Ledger Records:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {alert.related_transactions.map((tx) => (
                    <div
                      key={tx.id}
                      className="p-2.5 rounded-lg bg-surface-card border border-surface-border flex items-center justify-between text-xs"
                    >
                      <div>
                        <p className="font-semibold text-slate-200">{tx.description}</p>
                        <p className="text-[10px] text-slate-500 font-mono">{formatDate(tx.date)}</p>
                      </div>
                      <span className="font-mono font-bold text-rose-400">
                        -{formatAmount(tx.amount)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Suggested Investigation / Action */}
            <div className="flex items-center justify-between pt-2 border-t border-surface-border/50 text-xs">
              <span className="text-slate-400">
                Action: <strong className="text-slate-200">{alert.suggested_action}</strong>
              </span>
              <span className="text-[10px] font-mono text-slate-500">
                Detected: {formatDate(alert.detected_at)}
              </span>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
