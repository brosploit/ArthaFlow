import React, { useState, useEffect } from "react";
import {
  Network,
  Wallet,
  TrendingUp,
  TrendingDown,
  Calendar,
  Clock,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Building2,
  Layers,
  CircleDollarSign,
  Activity,
} from "lucide-react";
import { useWorkspace } from "../context/WorkspaceContext";
import { api } from "../services/api";
import { DigitalTwin, Account, Invoice, RecurringItem } from "../types";
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import { formatDate } from "../lib/utils";

export interface DigitalTwinPageProps {
  onNavigate: (path: string) => void;
}

export const DigitalTwinPage: React.FC<DigitalTwinPageProps> = ({ onNavigate }) => {
  const { activeWorkspace, formatAmount } = useWorkspace();
  const [twin, setTwin] = useState<DigitalTwin | null>(null);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [recurring, setRecurring] = useState<RecurringItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [twinData, accData, invData, recData] = await Promise.all([
          api.getDigitalTwin(activeWorkspace.id),
          api.getAccounts(activeWorkspace.id),
          api.getInvoices(activeWorkspace.id),
          api.getRecurring(activeWorkspace.id),
        ]);
        setTwin(twinData);
        setAccounts(accData);
        setInvoices(invData);
        setRecurring(recData);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [activeWorkspace.id]);

  if (isLoading || !twin) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-xs text-slate-400 font-mono animate-pulse">
          Synchronizing Financial Digital Twin State...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-surface-card p-5 rounded-xl border border-surface-border">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              <Network className="w-5 h-5" />
            </span>
            <h1 className="text-xl font-bold text-slate-100">Financial Digital Twin</h1>
            <Badge variant="emerald" dot>
              Time-Aware Graph Active
            </Badge>
          </div>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            A unified state representation of all liquid balances, credit terms, receivables, upcoming bills, and recurring commitments.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            onClick={() => onNavigate("scenario-lab")}
            variant="primary"
            size="sm"
            className="gap-2 shadow-glow-emerald"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Simulate Change Against Twin</span>
          </Button>
        </div>
      </div>

      {/* Top 3 High-Level Twin Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Unencumbered Total Liquid Cash */}
        <Card className="hover:border-emerald-500/40">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Total Unencumbered Liquidity</span>
            <span className="p-1.5 rounded-md bg-emerald-500/10 text-emerald-400">
              <CircleDollarSign className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold font-mono text-slate-100">
              {formatAmount(twin.total_available_cash)}
            </div>
            <div className="mt-2 space-y-1">
              <div className="flex justify-between text-[11px] text-slate-400">
                <span>Account Diversification</span>
                <span className="font-mono text-slate-200">3 Verified Sources</span>
              </div>
              <div className="w-full bg-surface-elevated rounded-full h-1.5 flex overflow-hidden">
                <div className="bg-emerald-500 h-full" style={{ width: "65.3%" }} title="HDFC (65.3%)" />
                <div className="bg-cyan-500 h-full" style={{ width: "27.2%" }} title="ICICI (27.2%)" />
                <div className="bg-teal-400 h-full" style={{ width: "7.5%" }} title="Razorpay (7.5%)" />
              </div>
            </div>
          </div>
        </Card>

        {/* Operating Runway & Burn Rate */}
        <Card className="hover:border-cyan-500/40">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Liquidity Runway Buffer</span>
            <span className="p-1.5 rounded-md bg-cyan-500/10 text-cyan-400">
              <Activity className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold font-mono text-cyan-400">
              {twin.liquidity_runway_days} Days
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Gross Monthly Burn: <strong className="text-slate-200 font-mono">{formatAmount(twin.monthly_burn_rate)}</strong>
            </p>
          </div>
        </Card>

        {/* Vitality Score & Health Index */}
        <Card className="hover:border-indigo-500/40">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Deterministic Vitality Index</span>
            <Badge variant="emerald">{twin.financial_vitality}</Badge>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold font-mono text-slate-100">
              {twin.financial_health_score} <span className="text-xs font-normal text-slate-500">/ 100</span>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-surface-border text-[10px] text-slate-400 font-mono">
              <div>Runway: {twin.health_breakdown.runway_score}/100</div>
              <div>Buffer: {twin.health_breakdown.cash_buffer_score}/100</div>
              <div>Collection: {twin.health_breakdown.receivable_collection_score}/100</div>
              <div>Margin: {twin.health_breakdown.operating_margin_score}/100</div>
            </div>
          </div>
        </Card>
      </div>

      {/* Account Nodes & Liquidity Distribution */}
      <Card>
        <CardHeader>
          <div>
            <CardTitle className="text-sm">Account Nodes in the Digital Twin</CardTitle>
            <p className="text-xs text-slate-400 mt-0.5">
              Current liquid capital nodes synchronized with real-time clearance status
            </p>
          </div>
          <Badge variant="cyan">Real-Time Graph</Badge>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {twin.accounts_breakdown.map((node) => (
              <div
                key={node.account_id}
                className="p-4 rounded-xl bg-surface-elevated border border-surface-border flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-200 truncate">{node.account_name}</span>
                    <span className="text-[10px] font-mono font-semibold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                      {node.share_percentage}%
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400">{node.institution}</p>
                </div>
                <div className="mt-4 pt-3 border-t border-surface-border/60 flex items-center justify-between">
                  <span className="text-[10px] font-mono text-slate-500 uppercase">Available</span>
                  <span className="text-sm font-bold font-mono text-slate-100">
                    {formatAmount(node.balance)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Scheduled Inflows vs Outflows Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Invoices Timeline (Receivables & Payables) */}
        <Card>
          <CardHeader>
            <div>
              <CardTitle className="text-sm">Expected Invoices & Payment Pipeline</CardTitle>
              <p className="text-xs text-slate-400 mt-0.5">
                Contractual payables and receivables modeled into future cash
              </p>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {invoices.map((inv) => (
              <div
                key={inv.id}
                className="p-3 rounded-lg bg-surface-elevated border border-surface-border flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                      inv.type === "receivable"
                        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                        : "bg-rose-500/10 text-rose-400 border border-rose-500/30"
                    }`}
                  >
                    {inv.type === "receivable" ? (
                      <TrendingUp className="w-4 h-4" />
                    ) : (
                      <TrendingDown className="w-4 h-4" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-semibold text-slate-200">{inv.entity_name}</span>
                      <span className="text-[10px] font-mono text-slate-500">#{inv.invoice_number}</span>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Expected by {formatDate(inv.expected_payment_date)} • {inv.category}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <div
                    className={`text-xs font-bold font-mono ${
                      inv.type === "receivable" ? "text-emerald-400" : "text-rose-400"
                    }`}
                  >
                    {inv.type === "receivable" ? "+" : "-"}
                    {formatAmount(inv.amount)}
                  </div>
                  {inv.status === "overdue" ? (
                    <Badge variant="rose" className="text-[9px]">
                      Overdue
                    </Badge>
                  ) : (
                    <Badge variant="neutral" className="text-[9px]">
                      Pending
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Recurring Commitments & Subscriptions */}
        <Card>
          <CardHeader>
            <div>
              <CardTitle className="text-sm">Recurring Operating Commitments</CardTitle>
              <p className="text-xs text-slate-400 mt-0.5">
                Periodic contracts, leases, payroll, and SaaS overhead
              </p>
            </div>
            <Badge variant="neutral">Active Schedule</Badge>
          </CardHeader>
          <CardContent className="space-y-3">
            {recurring.map((rec) => (
              <div
                key={rec.id}
                className="p-3 rounded-lg bg-surface-elevated border border-surface-border flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 flex items-center justify-center shrink-0">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-slate-200">{rec.name}</span>
                    <p className="text-[11px] text-slate-400">
                      Next Due: {formatDate(rec.next_due_date)} • {rec.frequency}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <div
                    className={`text-xs font-bold font-mono ${
                      rec.type === "income" ? "text-emerald-400" : "text-slate-100"
                    }`}
                  >
                    {rec.type === "income" ? "+" : "-"}
                    {formatAmount(rec.amount)}
                  </div>
                  <span className="text-[10px] text-slate-500 uppercase font-mono">{rec.category}</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
