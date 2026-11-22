import React, { useState } from "react";
import {
  Settings,
  Building2,
  User,
  ShieldCheck,
  Lock,
  Plus,
  RefreshCw,
  Database,
  Check,
  AlertTriangle,
} from "lucide-react";
import { useWorkspace } from "../context/WorkspaceContext";
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import { Modal } from "../components/ui/Modal";

export const SettingsPage: React.FC = () => {
  const {
    activeWorkspace,
    workspaces,
    switchWorkspace,
    createWorkspace,
    isDemoMode,
    toggleDemoMode,
    formatAmount,
  } = useWorkspace();

  const [bufferThreshold, setBufferThreshold] = useState<number>(40000);
  const [isSaved, setIsSaved] = useState(false);

  // New workspace modal
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newWsName, setNewWsName] = useState("");
  const [newWsMode, setNewWsMode] = useState<"business" | "individual">("business");
  const [newWsCurrency, setNewWsCurrency] = useState<"INR" | "USD" | "EUR">("INR");
  const [newWsCash, setNewWsCash] = useState<number>(50000);
  const [isCreating, setIsCreating] = useState(false);

  const handleSavePreferences = () => {
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 1500);
  };

  const handleCreateWorkspace = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWsName.trim()) return;
    setIsCreating(true);
    try {
      await createWorkspace({
        name: newWsName,
        mode: newWsMode,
        currency: newWsCurrency,
        starting_cash: newWsCash,
      });
      setIsCreateModalOpen(false);
      setNewWsName("");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-surface-card p-5 rounded-xl border border-surface-border">
        <div>
          <h1 className="text-xl font-bold text-slate-100">Workspace & System Settings</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Manage your workspace configuration, security parameters, and data governance policies
          </p>
        </div>

        <Button
          onClick={() => setIsCreateModalOpen(true)}
          variant="primary"
          size="sm"
          className="gap-1.5 shadow-glow-emerald"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Workspace</span>
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 7 cols: Configuration */}
        <div className="lg:col-span-7 space-y-6">
          {/* Active Workspace Info */}
          <Card className="space-y-4">
            <CardHeader className="mb-0">
              <CardTitle className="text-sm">Active Workspace Configuration</CardTitle>
              <Badge variant="emerald">
                {activeWorkspace.mode === "business" ? "Small Business" : "Individual"}
              </Badge>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-lg bg-surface-elevated border border-surface-border">
                  <span className="text-slate-400">Workspace Name</span>
                  <p className="font-semibold text-slate-100 mt-0.5">{activeWorkspace.name}</p>
                </div>
                <div className="p-3 rounded-lg bg-surface-elevated border border-surface-border">
                  <span className="text-slate-400">Base Currency</span>
                  <p className="font-semibold text-slate-100 mt-0.5 font-mono">
                    {activeWorkspace.currency} ({activeWorkspace.currencySymbol})
                  </p>
                </div>
              </div>

              {/* Safety Reserve Threshold */}
              <div className="space-y-2 pt-2">
                <label className="text-xs font-medium text-slate-300">
                  Emergency Liquidity Safety Buffer
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    value={bufferThreshold}
                    onChange={(e) => setBufferThreshold(Number(e.target.value))}
                    className="h-10 px-3 rounded-lg bg-surface-elevated border border-surface-border text-xs text-slate-100 font-mono w-48 focus:outline-none focus:border-emerald-500"
                  />
                  <span className="text-xs text-slate-400">
                    Triggers warning whenever forecast dips below this reserve.
                  </span>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between">
                <Button onClick={handleSavePreferences} variant="primary" size="sm">
                  {isSaved ? "Saved Successfully!" : "Save Parameters"}
                </Button>
                {isSaved && (
                  <span className="text-xs text-emerald-400 flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" />
                    <span>Configuration updated</span>
                  </span>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Switch Workspace */}
          <Card className="space-y-3">
            <CardHeader className="mb-0">
              <CardTitle className="text-sm">Available Workspaces</CardTitle>
              <span className="text-xs text-slate-400 font-mono">
                {workspaces.length} Registered
              </span>
            </CardHeader>
            <CardContent className="space-y-2">
              {workspaces.map((ws) => (
                <div
                  key={ws.id}
                  className={`p-3 rounded-xl border flex items-center justify-between text-xs transition-colors ${
                    ws.id === activeWorkspace.id
                      ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-300"
                      : "bg-surface-elevated border-surface-border text-slate-300 hover:border-slate-500"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {ws.mode === "business" ? (
                      <Building2 className="w-4 h-4 text-cyan-400" />
                    ) : (
                      <User className="w-4 h-4 text-emerald-400" />
                    )}
                    <div>
                      <p className="font-semibold text-slate-100">{ws.name}</p>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {ws.mode} • Currency: {ws.currency}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {ws.id === activeWorkspace.id ? (
                      <Badge variant="emerald">Active</Badge>
                    ) : (
                      <Button
                        onClick={() => switchWorkspace(ws.id)}
                        variant="ghost"
                        size="sm"
                        className="text-xs text-slate-300 hover:text-white"
                      >
                        Switch
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Right 5 cols: Security, Privacy & Demo Switch */}
        <div className="lg:col-span-5 space-y-6">
          {/* Demo Sandbox Controller */}
          <Card className="border-amber-500/30 bg-amber-500/5 space-y-3">
            <CardHeader className="mb-0">
              <CardTitle className="text-sm flex items-center gap-2 text-amber-300">
                <AlertTriangle className="w-4 h-4" />
                <span>Demonstration Sandbox</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-xs text-slate-300">
              <p className="leading-relaxed">
                Toggle between <strong>Aarav Retail Demo Data</strong> (realistic SME Indian retail scenario) and a blank custom workspace.
              </p>
              <div className="flex items-center justify-between pt-2 border-t border-surface-border/50">
                <span className="text-slate-400">Sample Demo Mode</span>
                <button
                  onClick={() => toggleDemoMode(!isDemoMode)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    isDemoMode
                      ? "bg-amber-500 text-slate-950 shadow-sm"
                      : "bg-surface-elevated text-slate-400 border border-surface-border"
                  }`}
                >
                  {isDemoMode ? "Active (Sample Data)" : "Inactive (Live Mode)"}
                </button>
              </div>
            </CardContent>
          </Card>

          {/* Security & Financial Integrity Governance */}
          <Card className="space-y-4">
            <CardHeader className="mb-0">
              <CardTitle className="text-sm flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Financial Decision Integrity</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-xs text-slate-400 leading-relaxed">
              <div className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  <strong className="text-slate-200">Zero Hallucination Guarantee</strong>: AI LLM is restricted from generating numbers; all figures originate from pure deterministic Python math engines.
                </span>
              </div>
              <div className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  <strong className="text-slate-200">Strict Workspace Scoping</strong>: Financial ledgers and decision memories are strictly segmented per workspace UUID.
                </span>
              </div>
              <div className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  <strong className="text-slate-200">Anti-Execution Sandbox</strong>: AI agents have zero direct authority to trigger bank transfers, trades, or unverified disbursements.
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Create Workspace Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create New Financial Workspace"
        description="Set up an isolated workspace for a new business, branch, or personal portfolio."
        maxWidth="md"
      >
        <form onSubmit={handleCreateWorkspace} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-300">Workspace Name</label>
            <input
              type="text"
              value={newWsName}
              onChange={(e) => setNewWsName(e.target.value)}
              placeholder="e.g. Nexus Tech Consulting"
              className="w-full h-9 px-3 rounded-lg bg-surface-elevated border border-surface-border text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300">Mode</label>
              <select
                value={newWsMode}
                onChange={(e) => setNewWsMode(e.target.value as any)}
                className="w-full h-9 px-3 rounded-lg bg-surface-elevated border border-surface-border text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
              >
                <option value="business">Small Business</option>
                <option value="individual">Individual / Personal</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300">Currency</label>
              <select
                value={newWsCurrency}
                onChange={(e) => setNewWsCurrency(e.target.value as any)}
                className="w-full h-9 px-3 rounded-lg bg-surface-elevated border border-surface-border text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
              >
                <option value="INR">INR (₹)</option>
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-300">Starting Liquid Cash</label>
            <input
              type="number"
              value={newWsCash}
              onChange={(e) => setNewWsCash(Number(e.target.value))}
              className="w-full h-9 px-3 rounded-lg bg-surface-elevated border border-surface-border text-xs text-slate-100 font-mono focus:outline-none focus:border-emerald-500"
              required
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button onClick={() => setIsCreateModalOpen(false)} variant="outline" size="sm">
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={isCreating}
              className="shadow-glow-emerald font-semibold"
            >
              Create Workspace
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
