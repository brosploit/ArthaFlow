import React, { useState } from "react";
import {
  Menu,
  Search,
  Sparkles,
  Bell,
  RefreshCw,
  ChevronDown,
  Building2,
  User,
  ShieldCheck,
  AlertTriangle,
} from "lucide-react";
import { useWorkspace } from "../../context/WorkspaceContext";
import { Button } from "../ui/Button";
import { Badge } from "../ui/Badge";

export interface HeaderProps {
  onToggleSidebar: () => void;
  currentPath: string;
  onNavigate: (path: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ onToggleSidebar, currentPath, onNavigate }) => {
  const { activeWorkspace, workspaces, switchWorkspace, isDemoMode } = useWorkspace();
  const [isWorkspaceMenuOpen, setIsWorkspaceMenuOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  const getBreadcrumbTitle = (path: string) => {
    switch (path) {
      case "dashboard":
        return "Financial Overview";
      case "transactions":
        return "Transactions & Ledger";
      case "digital-twin":
        return "Financial Digital Twin";
      case "forecasting":
        return "Cash Flow Forecasting";
      case "scenario-lab":
        return "Scenario Lab (What-If Simulator)";
      case "risk-intelligence":
        return "Risk Intelligence";
      case "ai-agent":
        return "AI Financial Decision Agent";
      case "decision-memory":
        return "Decision Memory & History";
      case "settings":
        return "Settings & Workspaces";
      default:
        return "ArthaFlow Intelligence";
    }
  };

  const handleSync = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
    }, 1000);
  };

  return (
    <header className="h-16 bg-surface-card/80 backdrop-blur-md border-b border-surface-border px-4 lg:px-6 flex items-center justify-between gap-4 sticky top-0 z-30">
      {/* Left section: Hamburger & Breadcrumb */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-surface-elevated lg:hidden transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="hidden sm:flex items-center gap-2 text-xs">
          <span className="text-slate-400 font-medium">ArthaFlow</span>
          <span className="text-slate-600">/</span>
          <span className="text-slate-100 font-semibold">{getBreadcrumbTitle(currentPath)}</span>
        </div>
      </div>

      {/* Middle/Right Controls */}
      <div className="flex items-center gap-3">
        {/* Live Sync Indicator */}
        <div className="hidden xl:flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface-elevated/80 border border-surface-border text-xs">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-slate-300 font-mono text-[11px]">
            Sync: <strong className="text-slate-100 font-semibold">Active</strong> (HDFC, ICICI, Razorpay)
          </span>
          <button
            onClick={handleSync}
            className={`text-slate-400 hover:text-slate-200 ml-1 ${isSyncing ? "animate-spin text-emerald-400" : ""}`}
            title="Trigger Instant Account Sync"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Demo Mode Notice Badge */}
        {isDemoMode && (
          <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-mono">
            <AlertTriangle className="w-3 h-3 text-amber-400" />
            <span>Sample Demo Data Active</span>
          </div>
        )}

        {/* Workspace Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsWorkspaceMenuOpen(!isWorkspaceMenuOpen)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface-elevated border border-surface-border hover:bg-surface-hover text-xs font-medium text-slate-200 transition-colors"
          >
            {activeWorkspace.mode === "business" ? (
              <Building2 className="w-3.5 h-3.5 text-cyan-400" />
            ) : (
              <User className="w-3.5 h-3.5 text-emerald-400" />
            )}
            <span className="max-w-[120px] truncate">{activeWorkspace.name}</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {isWorkspaceMenuOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-surface-card border border-surface-border rounded-xl shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-100">
              <div className="px-2 py-1.5 text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                Select Active Workspace
              </div>
              <div className="space-y-1">
                {workspaces.map((ws) => (
                  <button
                    key={ws.id}
                    onClick={() => {
                      switchWorkspace(ws.id);
                      setIsWorkspaceMenuOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs transition-colors ${
                      ws.id === activeWorkspace.id
                        ? "bg-emerald-500/15 text-emerald-400 font-semibold border border-emerald-500/20"
                        : "text-slate-300 hover:bg-surface-elevated"
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      {ws.mode === "business" ? (
                        <Building2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                      ) : (
                        <User className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      )}
                      <span className="truncate">{ws.name}</span>
                    </div>
                    {ws.isDemo && (
                      <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30">
                        Demo
                      </span>
                    )}
                  </button>
                ))}
              </div>
              <div className="mt-2 pt-2 border-t border-surface-border">
                <button
                  onClick={() => {
                    setIsWorkspaceMenuOpen(false);
                    onNavigate("settings");
                  }}
                  className="w-full text-left px-2.5 py-1.5 text-xs text-slate-400 hover:text-emerald-400 transition-colors flex items-center gap-1.5"
                >
                  <span>+ Create or Manage Workspaces</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Ask AI Agent Trigger */}
        <Button
          onClick={() => onNavigate("ai-agent")}
          variant="primary"
          size="sm"
          className="gap-1.5 shadow-glow-emerald"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Ask AI Agent</span>
        </Button>

        {/* Notifications / Risk Badge */}
        <button
          onClick={() => onNavigate("risk-intelligence")}
          className="relative p-2 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-surface-elevated transition-colors"
          title="3 Active Risk Alerts"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-surface-card" />
        </button>
      </div>
    </header>
  );
};
