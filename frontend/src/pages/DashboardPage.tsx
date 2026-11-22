import React, { useState, useEffect } from "react";
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  ShieldAlert,
  Sparkles,
  RefreshCw,
  Download,
  AlertCircle,
  CheckCircle2,
  Calendar,
  Building2,
  ChevronRight,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { useWorkspace } from "../context/WorkspaceContext";
import { api } from "../services/api";
import { DigitalTwin, CashForecast, Transaction, RiskAlert, Account } from "../types";
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import { formatDate } from "../lib/utils";

export interface DashboardPageProps {
  onNavigate: (path: string) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ onNavigate }) => {
  const { activeWorkspace, formatAmount, isDemoMode } = useWorkspace();

  const [digitalTwin, setDigitalTwin] = useState<DigitalTwin | null>(null);
  const [forecast, setForecast] = useState<CashForecast | null>(null);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [risks, setRisks] = useState<RiskAlert[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  const loadData = async () => {
    try {
      const [twinData, fcData, accData, txData, riskData] = await Promise.all([
        api.getDigitalTwin(activeWorkspace.id),
        api.getForecast(activeWorkspace.id, 30),
        api.getAccounts(activeWorkspace.id),
        api.getTransactions(activeWorkspace.id),
        api.getRiskAlerts(activeWorkspace.id),
      ]);
      setDigitalTwin(twinData);
      setForecast(fcData);
      setAccounts(accData);
      setTransactions(txData);
      setRisks(riskData);
    } catch (err) {
      console.error("Dashboard data load error:", err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    setIsLoading(true);
    loadData();
  }, [activeWorkspace.id]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    loadData();
  };

  if (isLoading || !digitalTwin || !forecast) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <RefreshCw className="w-8 h-8 text-emerald-400 animate-spin" />
        <p className="text-xs text-slate-400 font-mono">Calibrating Financial Digital Twin...</p>
      </div>
    );
  }

  // Formatting chart data
  const chartData = forecast.daily_forecasts.map((d) => ({
    date: d.day_label,
    balance: d.closing_balance,
    inflow: d.expected_inflows,
    outflow: d.expected_outflows,
    confidenceLow: d.confidence_low,
    confidenceHigh: d.confidence_high,
  }));

  return (
    <div className="space-y-6">
      {/* Executive Control Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-surface-card p-4 rounded-xl border border-surface-border">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-100">Financial Overview</h1>
            <Badge variant="emerald" dot>
              Live Pulse
            </Badge>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time liquidity, cash runway, and decision intelligence • {activeWorkspace.name}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-1.5 h-8 px-3 rounded-lg bg-surface-elevated border border-surface-border text-xs text-slate-300">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span>Next 30 Days Forecast</span>
          </div>

          <Button
            onClick={handleRefresh}
            variant="secondary"
            size="sm"
            isLoading={isRefreshing}
            className="gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Recalculate</span>
          </Button>

          <Button
            onClick={() => onNavigate("scenario-lab")}
            variant="primary"
            size="sm"
            className="gap-1.5 shadow-glow-emerald"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Run What-If Scenario</span>
          </Button>
        </div>
      </div>

      {/* Top 4 KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Cash */}
        <Card className="relative overflow-hidden group hover:border-emerald-500/40">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Total Available Cash</span>
            <span className="flex items-center text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">
              <TrendingUp className="w-3 h-3 mr-0.5" /> +14.8%
            </span>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-100 font-mono tracking-tight">
              {formatAmount(digitalTwin.total_available_cash)}
            </div>
            <p className="text-[11px] text-slate-500 mt-1">Across 3 unencumbered accounts</p>
          </div>
        </Card>

        {/* Operating Runway */}
        <Card className="hover:border-cyan-500/40">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Operating Runway</span>
            <Badge variant="cyan">{digitalTwin.financial_vitality}</Badge>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-100 font-mono tracking-tight">
              {digitalTwin.liquidity_runway_days} Days
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              ~{digitalTwin.operating_buffer_months} months buffer at current burn
            </p>
          </div>
        </Card>

        {/* Monthly Net Cash Flow */}
        <Card className="hover:border-emerald-500/40">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Monthly Net Cash Flow</span>
            <span className="flex items-center text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">
              <ArrowUpRight className="w-3 h-3 mr-0.5" /> Inflow Surplus
            </span>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-emerald-400 font-mono tracking-tight">
              +{formatAmount(digitalTwin.net_monthly_cash_flow)}
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              In: {formatAmount(digitalTwin.monthly_run_rate, { compact: true })} • Out:{" "}
              {formatAmount(digitalTwin.monthly_burn_rate, { compact: true })}
            </p>
          </div>
        </Card>

        {/* Financial Health Score */}
        <Card className="hover:border-indigo-500/40">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Financial Health Index</span>
            <span className="text-[11px] font-mono font-semibold text-emerald-400">82 / 100</span>
          </div>
          <div className="mt-3">
            <div className="w-full bg-surface-elevated rounded-full h-2 mb-2 overflow-hidden">
              <div
                className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all duration-500"
                style={{ width: `${digitalTwin.financial_health_score}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-slate-400 font-mono">
              <span>Stable Buffer</span>
              <span className="text-emerald-400">Low Insolvency Risk</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Main Grid: Chart & Account Liquidity Deck */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 8 cols: 30-Day Forecast Chart */}
        <Card className="lg:col-span-8 flex flex-col justify-between">
          <CardHeader>
            <div>
              <CardTitle className="flex items-center gap-2">
                <span>30-Day Cash Trajectory & Safety Reserve</span>
                <Badge variant="neutral" className="font-mono text-[10px]">
                  Deterministic Projection
                </Badge>
              </CardTitle>
              <p className="text-xs text-slate-400 mt-1">
                Incorporates confirmed receivables, payroll schedule, vendor bills, and regular run-rate inflows.
              </p>
            </div>
            <Button
              onClick={() => onNavigate("forecasting")}
              variant="ghost"
              size="sm"
              className="text-xs gap-1 text-emerald-400 hover:text-emerald-300"
            >
              <span>Full Forecast</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Button>
          </CardHeader>

          <CardContent>
            <div className="h-64 sm:h-72 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="balanceGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis
                    dataKey="date"
                    stroke="#64748b"
                    fontSize={11}
                    tickLine={false}
                    interval={4}
                  />
                  <YAxis
                    stroke="#64748b"
                    fontSize={11}
                    tickLine={false}
                    tickFormatter={(val) => `₹${(val / 1000).toFixed(0)}k`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0f172a",
                      borderColor: "#1e293b",
                      borderRadius: "0.5rem",
                      fontSize: "12px",
                      color: "#f8fafc",
                    }}
                    formatter={(val: number) => [`₹${val.toLocaleString()}`, "Projected Cash"]}
                  />
                  {/* Emergency Safety Buffer line at ₹40k */}
                  <ReferenceLine
                    y={40000}
                    stroke="#ef4444"
                    strokeDasharray="4 4"
                    label={{
                      value: "Safety Buffer (₹40k)",
                      fill: "#ef4444",
                      fontSize: 10,
                      position: "insideBottomRight",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="balance"
                    stroke="#10b981"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#balanceGrad)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-3 pt-3 border-t border-surface-border flex flex-wrap items-center justify-between text-xs text-slate-400 gap-2">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <span>Projected Balance</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-0.5 bg-rose-500" />
                  <span>Emergency Threshold</span>
                </span>
              </div>
              <span className="font-mono text-[11px] text-slate-300">
                Lowest Dip:{" "}
                <strong className="text-amber-400">
                  {formatAmount(forecast.lowest_projected_balance)}
                </strong>{" "}
                on {formatDate(forecast.lowest_balance_date)}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Right 4 cols: Accounts & Invoices Breakdown */}
        <div className="lg:col-span-4 space-y-4">
          {/* Account Balances Card */}
          <Card>
            <CardHeader className="mb-3">
              <CardTitle className="text-sm">Account Balances</CardTitle>
              <Badge variant="neutral">3 Connected</Badge>
            </CardHeader>
            <CardContent className="space-y-2.5">
              {accounts.map((acc) => (
                <div
                  key={acc.id}
                  className="p-2.5 rounded-lg bg-surface-elevated border border-surface-border flex items-center justify-between"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-7 h-7 rounded-md bg-surface-card border border-surface-border flex items-center justify-center text-slate-300">
                      <Wallet className="w-3.5 h-3.5 text-emerald-400" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-slate-200 truncate">{acc.name}</p>
                      <p className="text-[10px] text-slate-500 font-mono">{acc.account_number_mask}</p>
                    </div>
                  </div>
                  <span className="text-xs font-mono font-bold text-slate-100">
                    {formatAmount(acc.balance)}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Pending Invoices Pill */}
          <Card className="bg-surface-elevated/40">
            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="p-2.5 rounded-lg bg-surface-card border border-surface-border">
                <span className="text-[10px] font-mono text-slate-400 uppercase">
                  Pending Receivables
                </span>
                <div className="text-sm font-bold text-emerald-400 font-mono mt-1">
                  {formatAmount(digitalTwin.receivables.total_pending)}
                </div>
                <span className="text-[10px] text-slate-500 mt-0.5 block">
                  {digitalTwin.receivables.count_pending} invoices (₹28.5k overdue)
                </span>
              </div>

              <div className="p-2.5 rounded-lg bg-surface-card border border-surface-border">
                <span className="text-[10px] font-mono text-slate-400 uppercase">
                  Upcoming Payables
                </span>
                <div className="text-sm font-bold text-rose-400 font-mono mt-1">
                  {formatAmount(digitalTwin.payables.total_pending)}
                </div>
                <span className="text-[10px] text-slate-500 mt-0.5 block">
                  {digitalTwin.payables.count_pending} bills due in 14 days
                </span>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Proactive Risk Alerts Strip */}
      <Card className="border-amber-500/30 bg-amber-500/5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-amber-500/20 text-amber-400 shrink-0">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-xs font-bold text-slate-100">
                  {risks.filter((r) => !r.is_resolved).length} Explainable Risk Alerts Detected
                </h4>
                <Badge variant="amber">Needs Review</Badge>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Duplicate supplier charge flagged (Surat Cotton Mills ₹18,500) and overdue concentration
                risk on Kala Kendra.
              </p>
            </div>
          </div>

          <Button
            onClick={() => onNavigate("risk-intelligence")}
            variant="outline"
            size="sm"
            className="shrink-0 text-amber-300 border-amber-500/30 hover:bg-amber-500/10 text-xs gap-1.5"
          >
            <span>Investigate Alerts</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Button>
        </div>
      </Card>

      {/* Bottom Section: Recent Transactions */}
      <Card>
        <CardHeader>
          <div>
            <CardTitle className="text-sm">Recent Ledger Activity</CardTitle>
            <p className="text-xs text-slate-400 mt-0.5">
              Verified synchronized entries across your accounts
            </p>
          </div>
          <Button
            onClick={() => onNavigate("transactions")}
            variant="ghost"
            size="sm"
            className="text-xs text-emerald-400 hover:text-emerald-300"
          >
            View All Transactions
          </Button>
        </CardHeader>

        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-surface-border text-slate-400 font-mono">
                  <th className="pb-2.5 font-medium">Date</th>
                  <th className="pb-2.5 font-medium">Description</th>
                  <th className="pb-2.5 font-medium">Category</th>
                  <th className="pb-2.5 font-medium">Account</th>
                  <th className="pb-2.5 font-medium text-right">Amount</th>
                  <th className="pb-2.5 font-medium text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-border/50">
                {transactions.slice(0, 5).map((tx) => (
                  <tr key={tx.id} className="hover:bg-surface-elevated/40 transition-colors">
                    <td className="py-2.5 text-slate-400 font-mono">{formatDate(tx.date)}</td>
                    <td className="py-2.5 text-slate-200 font-medium">{tx.description}</td>
                    <td className="py-2.5">
                      <span className="px-2 py-0.5 rounded bg-surface-elevated border border-surface-border text-[11px] text-slate-300">
                        {tx.category}
                      </span>
                    </td>
                    <td className="py-2.5 text-slate-400">{tx.account_name || "Primary Current"}</td>
                    <td
                      className={`py-2.5 text-right font-mono font-bold ${
                        tx.type === "income" ? "text-emerald-400" : "text-slate-100"
                      }`}
                    >
                      {tx.type === "income" ? "+" : "-"}
                      {formatAmount(tx.amount)}
                    </td>
                    <td className="py-2.5 text-right">
                      {tx.status === "flagged" ? (
                        <Badge variant="rose" className="text-[10px]">
                          Flagged
                        </Badge>
                      ) : tx.status === "pending" ? (
                        <Badge variant="amber" className="text-[10px]">
                          Clearing
                        </Badge>
                      ) : (
                        <Badge variant="emerald" className="text-[10px]">
                          Cleared
                        </Badge>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
