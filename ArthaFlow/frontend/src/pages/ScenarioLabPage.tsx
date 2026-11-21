import React, { useState, useEffect } from "react";
import {
  FlaskConical,
  Sparkles,
  BookmarkPlus,
  Play,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  Layers,
  CircleDollarSign,
  Calendar,
  Check,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { useWorkspace } from "../context/WorkspaceContext";
import { api } from "../services/api";
import { ScenarioSimulation, ScenarioType, DecisionMemory } from "../types";
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import { Modal } from "../components/ui/Modal";

export interface ScenarioLabPageProps {
  onNavigate?: (path: string) => void;
}

export const ScenarioLabPage: React.FC<ScenarioLabPageProps> = () => {
  const { activeWorkspace, formatAmount } = useWorkspace();

  // Active scenario state
  const [scenarioType, setScenarioType] = useState<ScenarioType>("capex");
  const [capexAmount, setCapexAmount] = useState<number>(50000);
  const [advancePercent, setAdvancePercent] = useState<number>(30);
  const [deferredDays, setDeferredDays] = useState<number>(30);
  const [salesUplift, setSalesUplift] = useState<number>(115000);
  const [delayDays, setDelayDays] = useState<number>(25);

  const [simulation, setSimulation] = useState<ScenarioSimulation | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);

  // Decision memory modal
  const [isMemoryModalOpen, setIsMemoryModalOpen] = useState(false);
  const [memoryTitle, setMemoryTitle] = useState("");
  const [hypothesis, setHypothesis] = useState("");
  const [isSavingMemory, setIsSavingMemory] = useState(false);
  const [memorySuccessMsg, setMemorySuccessMsg] = useState("");

  const runSimulation = async () => {
    setIsSimulating(true);
    try {
      const result = await api.runSimulation(activeWorkspace.id, {
        title:
          scenarioType === "capex"
            ? `Purchase ₹${capexAmount.toLocaleString()} Seasonal Fabric Inventory`
            : `Client Payment Delay of ${delayDays} Days`,
        scenario_type: scenarioType,
        parameters: {
          outflow_amount: capexAmount,
          upfront_percentage: advancePercent,
          deferred_days: deferredDays,
          expected_sales_uplift: salesUplift,
          delay_days: delayDays,
          affected_invoices_amount: 54000,
        },
      });
      setSimulation(result);
      setMemoryTitle(result.title);
      setHypothesis(
        `By structuring terms at ${advancePercent}% advance and ${100 - advancePercent}% Net ${deferredDays}, net margin will increase by ₹${result.net_impact.toLocaleString()} without breaching ₹40k buffer.`
      );
    } finally {
      setIsSimulating(false);
    }
  };

  useEffect(() => {
    runSimulation();
  }, [activeWorkspace.id, scenarioType, capexAmount, advancePercent, salesUplift, delayDays]);

  const handleSaveDecision = async () => {
    if (!simulation) return;
    setIsSavingMemory(true);
    try {
      await api.createDecisionMemory(activeWorkspace.id, {
        decision_title: memoryTitle || simulation.title,
        scenario_id: simulation.id,
        category: "CapEx / Procurement",
        hypothesis: hypothesis || "Model verified through What-If Scenario Lab.",
        assumptions: simulation.rule_based_advice,
        expected_outcomes: [
          {
            metric: "Lowest Cash Reserve",
            expected_value: `₹${simulation.lowest_cash_dip.toLocaleString()}`,
            timeframe: "Within 30 Days",
          },
          {
            metric: "Break-Even Point",
            expected_value: `Day ${simulation.break_even_day || 22}`,
            timeframe: "Month 1",
          },
          {
            metric: "Net Profit Impact",
            expected_value: `+₹${simulation.net_impact.toLocaleString()}`,
            timeframe: "45 Days",
          },
        ],
        status: "active",
        decision_date: new Date().toISOString().split("T")[0],
        evaluation_date: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString().split("T")[0],
      });
      setMemorySuccessMsg("Decision saved to Decision Memory for tracking!");
      setTimeout(() => {
        setIsMemoryModalOpen(false);
        setMemorySuccessMsg("");
      }, 1200);
    } finally {
      setIsSavingMemory(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-surface-card p-5 rounded-xl border border-surface-border">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
              <FlaskConical className="w-5 h-5" />
            </span>
            <h1 className="text-xl font-bold text-slate-100">Scenario Lab (What-If Simulator)</h1>
            <Badge variant="cyan">Deterministic Sandbox</Badge>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Simulate capital expenditures, customer payment delays, and revenue shocks with zero risk before committing capital.
          </p>
        </div>

        <Button
          onClick={() => setIsMemoryModalOpen(true)}
          variant="secondary"
          size="sm"
          className="gap-2 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/10"
        >
          <BookmarkPlus className="w-4 h-4" />
          <span>Save Decision to Memory</span>
        </Button>
      </div>

      {/* Main Sandbox Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* Left Column: Parameter Controllers (5 cols) */}
        <div className="xl:col-span-5 space-y-5">
          <Card className="space-y-5">
            <div className="flex items-center justify-between border-b border-surface-border pb-3">
              <span className="text-xs font-bold text-slate-200">Simulation Variables</span>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                Dynamic Recalculation
              </span>
            </div>

            {/* Scenario Type Selection */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300">Hypothetical Scenario Type</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setScenarioType("capex")}
                  className={`p-2.5 rounded-lg text-xs font-semibold text-left border transition-all ${
                    scenarioType === "capex"
                      ? "bg-emerald-500/15 border-emerald-500 text-emerald-400"
                      : "bg-surface-elevated border-surface-border text-slate-400 hover:text-slate-200"
                  }`}
                >
                  CapEx / Inventory
                </button>
                <button
                  onClick={() => setScenarioType("delayed_receivable")}
                  className={`p-2.5 rounded-lg text-xs font-semibold text-left border transition-all ${
                    scenarioType === "delayed_receivable"
                      ? "bg-emerald-500/15 border-emerald-500 text-emerald-400"
                      : "bg-surface-elevated border-surface-border text-slate-400 hover:text-slate-200"
                  }`}
                >
                  Payment Delay
                </button>
              </div>
            </div>

            {/* Variable Slider 1: CapEx Amount */}
            {scenarioType === "capex" ? (
              <>
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-300 font-medium">Procurement Outflow (CapEx)</span>
                    <span className="font-mono font-bold text-emerald-400 bg-surface-elevated px-2 py-0.5 rounded border border-surface-border">
                      {formatAmount(capexAmount)}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="20000"
                    max="150000"
                    step="5000"
                    value={capexAmount}
                    onChange={(e) => setCapexAmount(Number(e.target.value))}
                    className="w-full accent-emerald-500 h-1.5 bg-surface-elevated rounded-lg cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                    <span>₹20k</span>
                    <span>Baseline: ₹50k</span>
                    <span>₹1.5L</span>
                  </div>
                </div>

                {/* Variable Slider 2: Advance Payment Split */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-300 font-medium">Payment Structure (Advance vs Net 30)</span>
                    <span className="font-mono font-bold text-cyan-400 bg-surface-elevated px-2 py-0.5 rounded border border-surface-border">
                      {advancePercent}% Advance ({formatAmount((capexAmount * advancePercent) / 100)})
                    </span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="100"
                    step="10"
                    value={advancePercent}
                    onChange={(e) => setAdvancePercent(Number(e.target.value))}
                    className="w-full accent-cyan-500 h-1.5 bg-surface-elevated rounded-lg cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                    <span>10% Advance</span>
                    <span>Recommended: 30%</span>
                    <span>100% Upfront</span>
                  </div>
                </div>

                {/* Variable Slider 3: Expected Sales Uplift */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-300 font-medium">Expected Sales Uplift (45-Day Horizon)</span>
                    <span className="font-mono font-bold text-emerald-400 bg-surface-elevated px-2 py-0.5 rounded border border-surface-border">
                      +{formatAmount(salesUplift)}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="30000"
                    max="250000"
                    step="5000"
                    value={salesUplift}
                    onChange={(e) => setSalesUplift(Number(e.target.value))}
                    className="w-full accent-emerald-500 h-1.5 bg-surface-elevated rounded-lg cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                    <span>+₹30k</span>
                    <span>Projected: ₹1.15L</span>
                    <span>+₹2.5L</span>
                  </div>
                </div>
              </>
            ) : (
              /* Payment Delay Slider */
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-300 font-medium">Customer Delay Window</span>
                  <span className="font-mono font-bold text-rose-400 bg-surface-elevated px-2 py-0.5 rounded border border-surface-border">
                    {delayDays} Days
                  </span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="60"
                  step="5"
                  value={delayDays}
                  onChange={(e) => setDelayDays(Number(e.target.value))}
                  className="w-full accent-rose-500 h-1.5 bg-surface-elevated rounded-lg cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                  <span>5 Days</span>
                  <span>Average: 25 Days</span>
                  <span>60 Days</span>
                </div>
              </div>
            )}
          </Card>
        </div>

        {/* Right Column: Dynamic Simulation Results (7 cols) */}
        <div className="xl:col-span-7 space-y-5">
          {simulation && (
            <>
              {/* Verdict Banner */}
              <div
                className={`p-4 rounded-xl border flex items-center justify-between gap-4 ${
                  simulation.verdict === "SAFE"
                    ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                    : simulation.verdict === "CAUTION"
                    ? "bg-amber-500/10 border-amber-500/30 text-amber-300"
                    : "bg-rose-500/10 border-rose-500/30 text-rose-300"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-surface-card border border-current">
                    {simulation.verdict === "SAFE" ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    ) : (
                      <AlertTriangle className="w-5 h-5 text-amber-400" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold">
                      Decision Verdict: {simulation.verdict === "SAFE" ? "Approved as Feasible" : "Caution: Buffer Breached"}
                    </h3>
                    <p className="text-xs opacity-90 mt-0.5">
                      Lowest balance reaches {formatAmount(simulation.lowest_cash_dip)} (Safety Threshold: ₹40,000)
                    </p>
                  </div>
                </div>

                <Badge
                  variant={
                    simulation.verdict === "SAFE"
                      ? "emerald"
                      : simulation.verdict === "CAUTION"
                      ? "amber"
                      : "rose"
                  }
                  className="font-bold text-xs"
                >
                  {simulation.verdict}
                </Badge>
              </div>

              {/* 4 Outcome Metrics */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                <Card className="p-3">
                  <span className="text-[10px] font-mono text-slate-400 uppercase">Net Yield</span>
                  <div
                    className={`text-base font-bold font-mono mt-1 ${
                      simulation.net_impact >= 0 ? "text-emerald-400" : "text-rose-400"
                    }`}
                  >
                    {simulation.net_impact >= 0 ? "+" : ""}
                    {formatAmount(simulation.net_impact)}
                  </div>
                </Card>

                <Card className="p-3">
                  <span className="text-[10px] font-mono text-slate-400 uppercase">Lowest Balance</span>
                  <div className="text-base font-bold font-mono text-slate-100 mt-1">
                    {formatAmount(simulation.lowest_cash_dip)}
                  </div>
                </Card>

                <Card className="p-3">
                  <span className="text-[10px] font-mono text-slate-400 uppercase">Break-Even</span>
                  <div className="text-base font-bold font-mono text-cyan-400 mt-1">
                    {simulation.break_even_day ? `Day ${simulation.break_even_day}` : "N/A"}
                  </div>
                </Card>

                <Card className="p-3">
                  <span className="text-[10px] font-mono text-slate-400 uppercase">Runway Impact</span>
                  <div
                    className={`text-base font-bold font-mono mt-1 ${
                      simulation.runway_delta_days >= 0 ? "text-emerald-400" : "text-amber-400"
                    }`}
                  >
                    {simulation.runway_delta_days > 0 ? "+" : ""}
                    {simulation.runway_delta_days} Days
                  </div>
                </Card>
              </div>

              {/* Dual-Curve Comparison Chart */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">
                    Baseline Trajectory vs. Simulated What-If Trajectory
                  </CardTitle>
                  <div className="flex items-center gap-3 text-xs font-mono">
                    <span className="flex items-center gap-1.5 text-slate-400">
                      <span className="w-2.5 h-0.5 bg-slate-500" />
                      <span>Baseline</span>
                    </span>
                    <span className="flex items-center gap-1.5 text-emerald-400">
                      <span className="w-2.5 h-0.5 bg-emerald-400" />
                      <span>Simulated</span>
                    </span>
                  </div>
                </CardHeader>

                <CardContent>
                  <div className="h-64 sm:h-72 w-full pt-2">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={simulation.trajectory_comparison}
                        margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                        <XAxis
                          dataKey="day_number"
                          stroke="#64748b"
                          fontSize={11}
                          tickLine={false}
                          tickFormatter={(d) => `Day ${d}`}
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
                          formatter={(val: number, name: string) => [
                            `₹${val.toLocaleString()}`,
                            name === "simulated_balance" ? "Simulated" : "Baseline",
                          ]}
                        />
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
                        <Line
                          type="monotone"
                          dataKey="baseline_balance"
                          stroke="#64748b"
                          strokeWidth={1.5}
                          strokeDasharray="4 4"
                          dot={false}
                        />
                        <Line
                          type="monotone"
                          dataKey="simulated_balance"
                          stroke="#10b981"
                          strokeWidth={2.5}
                          dot={false}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Deterministic Rule-Based Recommendations */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Deterministic Rule-Based Advice</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {simulation.rule_based_advice.map((adv, idx) => (
                      <div
                        key={idx}
                        className="p-2.5 rounded-lg bg-surface-elevated border border-surface-border text-xs text-slate-300 flex items-start gap-2.5"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{adv}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>

      {/* Save to Decision Memory Modal */}
      <Modal
        isOpen={isMemoryModalOpen}
        onClose={() => setIsMemoryModalOpen(false)}
        title="Preserve Decision in Decision Memory"
        description="Record this scenario's hypothesis and assumptions. Track actual business outcomes against this expectation over time."
        maxWidth="md"
      >
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-300">Decision Title</label>
            <input
              type="text"
              value={memoryTitle}
              onChange={(e) => setMemoryTitle(e.target.value)}
              className="w-full h-9 px-3 rounded-lg bg-surface-elevated border border-surface-border text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-300">Hypothesis & Strategic Rationale</label>
            <textarea
              rows={3}
              value={hypothesis}
              onChange={(e) => setHypothesis(e.target.value)}
              className="w-full p-2.5 rounded-lg bg-surface-elevated border border-surface-border text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {memorySuccessMsg && (
            <div className="p-3 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-400" />
              <span>{memorySuccessMsg}</span>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <Button onClick={() => setIsMemoryModalOpen(false)} variant="outline" size="sm">
              Cancel
            </Button>
            <Button
              onClick={handleSaveDecision}
              variant="primary"
              size="sm"
              isLoading={isSavingMemory}
              className="gap-1.5 shadow-glow-emerald font-semibold"
            >
              <BookmarkPlus className="w-3.5 h-3.5" />
              <span>Commit Decision</span>
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
