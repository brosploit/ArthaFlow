import React, { useState, useEffect } from "react";
import {
  TrendingUp,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Layers,
  ChevronRight,
  Info,
  ShieldCheck,
  CircleDollarSign,
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
import { CashForecast } from "../types";
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import { formatDate } from "../lib/utils";

export interface ForecastingPageProps {
  onNavigate?: (path: string) => void;
}

export const ForecastingPage: React.FC<ForecastingPageProps> = () => {
  const { activeWorkspace, formatAmount } = useWorkspace();
  const [days, setDays] = useState<7 | 30>(30);
  const [forecast, setForecast] = useState<CashForecast | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      try {
        const data = await api.getForecast(activeWorkspace.id, days);
        setForecast(data);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [activeWorkspace.id, days]);

  if (isLoading || !forecast) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-xs text-slate-400 font-mono animate-pulse">
          Computing deterministic cash flow projection...
        </div>
      </div>
    );
  }

  const chartData = forecast.daily_forecasts.map((d) => ({
    date: d.day_label,
    balance: d.closing_balance,
    confidenceLow: d.confidence_low,
    confidenceHigh: d.confidence_high,
    inflows: d.expected_inflows,
    outflows: d.expected_outflows,
  }));

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-surface-card p-5 rounded-xl border border-surface-border">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-100">Deterministic Cash Flow Forecasting</h1>
            <Badge variant="emerald" dot>
              Model v3.8 Active
            </Badge>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Forward-looking liquidity horizon reconciling pending invoices, recurring schedules, and run-rate variance
          </p>
        </div>

        {/* 7-day vs 30-day toggle */}
        <div className="flex items-center gap-1 p-1 bg-surface-elevated border border-surface-border rounded-lg text-xs">
          <button
            onClick={() => setDays(7)}
            className={`px-3 py-1.5 rounded-md transition-colors ${
              days === 7 ? "bg-emerald-500 text-slate-950 font-bold" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            7-Day Horizon
          </button>
          <button
            onClick={() => setDays(30)}
            className={`px-3 py-1.5 rounded-md transition-colors ${
              days === 30 ? "bg-emerald-500 text-slate-950 font-bold" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            30-Day Horizon
          </button>
        </div>
      </div>

      {/* KPI Forecast Ribbon */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="hover:border-emerald-500/40">
          <span className="text-xs text-slate-400">Ending Projected Balance</span>
          <div className="text-2xl font-bold font-mono text-emerald-400 mt-2">
            {formatAmount(forecast.ending_projected_balance)}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Net Change: +{formatAmount(forecast.net_projected_change)}
          </p>
        </Card>

        <Card className="hover:border-cyan-500/40">
          <span className="text-xs text-slate-400">Total Expected Inflows</span>
          <div className="text-2xl font-bold font-mono text-slate-100 mt-2">
            +{formatAmount(forecast.total_inflows)}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Confirmed receivables & daily sales</p>
        </Card>

        <Card className="hover:border-rose-500/40">
          <span className="text-xs text-slate-400">Scheduled Outflows</span>
          <div className="text-2xl font-bold font-mono text-slate-100 mt-2">
            -{formatAmount(forecast.total_outflows)}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Payroll, supplier bills, rent</p>
        </Card>

        <Card className="hover:border-indigo-500/40">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400">Lowest Dip Point</span>
            <Badge variant="emerald">Safe Buffer</Badge>
          </div>
          <div className="text-2xl font-bold font-mono text-slate-100 mt-2">
            {formatAmount(forecast.lowest_projected_balance)}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Occurs on {formatDate(forecast.lowest_balance_date)} (&gt; ₹40k buffer)
          </p>
        </Card>
      </div>

      {/* Interactive Forecast Chart */}
      <Card>
        <CardHeader>
          <div>
            <CardTitle className="text-sm">
              {days}-Day Projected Trajectory with Uncertainty Band (±{forecast.uncertainty_range_percentage}%)
            </CardTitle>
            <p className="text-xs text-slate-400 mt-0.5">
              Green line represents deterministic median balance. Shaded range models statistical variance.
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs text-slate-400 font-mono">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-0.5 bg-emerald-400" />
              <span>Projected Closing</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-0.5 bg-rose-500" />
              <span>Emergency Reserve</span>
            </span>
          </div>
        </CardHeader>

        <CardContent>
          <div className="h-72 sm:h-80 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="forecastGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis
                  dataKey="date"
                  stroke="#64748b"
                  fontSize={11}
                  tickLine={false}
                  interval={days === 7 ? 0 : 3}
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
                  formatter={(val: number) => [`₹${val.toLocaleString()}`, "Balance"]}
                />
                <ReferenceLine
                  y={forecast.safety_buffer_threshold}
                  stroke="#ef4444"
                  strokeDasharray="4 4"
                  label={{
                    value: "Emergency Buffer (₹40,000)",
                    fill: "#ef4444",
                    fontSize: 10,
                    position: "insideBottomRight",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="balance"
                  stroke="#10b981"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#forecastGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Assumptions & Daily Schedule Table */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Model Assumptions Card */}
        <Card className="lg:col-span-5">
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <Info className="w-4 h-4 text-emerald-400" />
              <span>Forecast Assumptions & Factors</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2.5">
              {forecast.assumptions.map((asm, i) => (
                <div
                  key={i}
                  className="p-2.5 rounded-lg bg-surface-elevated border border-surface-border flex items-start gap-2.5 text-xs text-slate-300"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <span>{asm}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Daily Schedule Breakdown */}
        <Card className="lg:col-span-7">
          <CardHeader>
            <CardTitle className="text-sm">Daily Liquidity Breakdown</CardTitle>
            <span className="text-xs text-slate-400 font-mono">
              Opening vs Inflows vs Outflows
            </span>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto max-h-80 overflow-y-auto border border-surface-border rounded-lg">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-surface-elevated text-slate-400 font-mono border-b border-surface-border sticky top-0">
                    <th className="p-2.5">Date</th>
                    <th className="p-2.5 text-right">Inflow</th>
                    <th className="p-2.5 text-right">Outflow</th>
                    <th className="p-2.5 text-right">Closing</th>
                    <th className="p-2.5">Scheduled Events</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-border/50">
                  {forecast.daily_forecasts.map((d, idx) => (
                    <tr key={idx} className="hover:bg-surface-elevated/40">
                      <td className="p-2.5 font-mono text-slate-300">{d.day_label}</td>
                      <td className="p-2.5 text-right font-mono text-emerald-400">
                        +{formatAmount(d.expected_inflows)}
                      </td>
                      <td className="p-2.5 text-right font-mono text-rose-400">
                        -{formatAmount(d.expected_outflows)}
                      </td>
                      <td className="p-2.5 text-right font-mono font-bold text-slate-100">
                        {formatAmount(d.closing_balance)}
                      </td>
                      <td className="p-2.5">
                        {d.scheduled_events && d.scheduled_events.length > 0 ? (
                          <div className="space-y-0.5">
                            {d.scheduled_events.map((ev, ei) => (
                              <span
                                key={ei}
                                className="inline-block px-1.5 py-0.2 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 text-[10px] mr-1"
                              >
                                {ev}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-slate-600">—</span>
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
    </div>
  );
};
