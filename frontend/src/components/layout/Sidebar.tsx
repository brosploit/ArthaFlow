import React from "react";
import {
  LayoutDashboard,
  Receipt,
  Network,
  TrendingUp,
  FlaskConical,
  ShieldAlert,
  Bot,
  Brain,
  Settings,
  ChevronRight,
  Sparkles,
  Building2,
  User,
  ArrowUpRight,
} from "lucide-react";
import { useWorkspace } from "../../context/WorkspaceContext";
import { Badge } from "../ui/Badge";

export interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  badge?: string;
  badgeCount?: number;
  highlight?: boolean;
}

export interface NavGroup {
  title: string;
  items: NavItem[];
}

export interface SidebarProps {
  currentPath: string;
  onNavigate: (path: string) => void;
  isOpen: boolean;
  onToggle: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentPath, onNavigate, isOpen, onToggle }) => {
  const { activeWorkspace, isDemoMode } = useWorkspace();

  const navGroups: NavGroup[] = [
    {
      title: "Overview",
      items: [
        { id: "dashboard", label: "Dashboard", icon: <LayoutDashboard className="w-4 h-4" /> },
      ],
    },
    {
      title: "Financial Management",
      items: [
        { id: "transactions", label: "Transactions", icon: <Receipt className="w-4 h-4" /> },
        {
          id: "digital-twin",
          label: "Digital Twin",
          icon: <Network className="w-4 h-4" />,
          badge: "Live",
        },
      ],
    },
    {
      title: "Decision Intelligence",
      items: [
        { id: "forecasting", label: "Forecasting", icon: <TrendingUp className="w-4 h-4" /> },
        { id: "scenario-lab", label: "What-If Simulator", icon: <FlaskConical className="w-4 h-4" /> },
        {
          id: "risk-intelligence",
          label: "Risk Intelligence",
          icon: <ShieldAlert className="w-4 h-4" />,
          badgeCount: 3,
        },
      ],
    },
    {
      title: "AI Platform",
      items: [
        {
          id: "ai-agent",
          label: "AI Financial Agent",
          icon: <Bot className="w-4 h-4" />,
          highlight: true,
        },
        { id: "decision-memory", label: "Decision Memory", icon: <Brain className="w-4 h-4" /> },
      ],
    },
    {
      title: "Settings & Setup",
      items: [
        { id: "settings", label: "Settings", icon: <Settings className="w-4 h-4" /> },
      ],
    },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onToggle}
          className="fixed inset-0 z-40 bg-slate-950/80 backdrop-blur-sm lg:hidden"
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-surface-card border-r border-surface-border flex flex-col justify-between transition-transform duration-200 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="flex flex-col flex-1 overflow-y-auto">
          {/* Brand Header */}
          <div className="h-16 px-5 flex items-center justify-between border-b border-surface-border">
            <div
              onClick={() => onNavigate("dashboard")}
              className="flex items-center gap-2.5 cursor-pointer select-none"
            >
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold shadow-glow-emerald">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-1">
                  <span className="font-bold text-base text-slate-100 tracking-tight">ArthaFlow</span>
                  <span className="font-bold text-base text-emerald-400">AI</span>
                </div>
                <p className="text-[10px] text-slate-400 uppercase tracking-widest font-mono">
                  Decision Intelligence
                </p>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="px-3 py-4 space-y-6">
            {navGroups.map((group) => (
              <div key={group.title} className="space-y-1">
                <h4 className="px-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider font-mono">
                  {group.title}
                </h4>
                <div className="space-y-0.5">
                  {group.items.map((item) => {
                    const isActive = currentPath === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          onNavigate(item.id);
                          if (window.innerWidth < 1024) onToggle();
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all duration-150 select-none ${
                          isActive
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-semibold shadow-sm"
                            : "text-slate-400 hover:text-slate-100 hover:bg-surface-elevated"
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <span
                            className={
                              isActive
                                ? "text-emerald-400"
                                : item.highlight
                                ? "text-cyan-400 animate-pulse"
                                : "text-slate-400"
                            }
                          >
                            {item.icon}
                          </span>
                          <span>{item.label}</span>
                        </div>

                        {item.badge && (
                          <span className="px-1.5 py-0.2 rounded-full text-[9px] font-mono uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                            {item.badge}
                          </span>
                        )}
                        {item.badgeCount && (
                          <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30">
                            {item.badgeCount}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Workspace & Mode Card */}
        <div className="p-3 border-t border-surface-border bg-surface/50 space-y-2">
          <div className="p-2.5 rounded-xl bg-surface-elevated border border-surface-border flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 flex items-center gap-1">
                {activeWorkspace.mode === "business" ? (
                  <Building2 className="w-3 h-3 text-cyan-400" />
                ) : (
                  <User className="w-3 h-3 text-emerald-400" />
                )}
                {activeWorkspace.mode === "business" ? "Small Business" : "Personal"}
              </span>
              {isDemoMode && (
                <Badge variant="amber" className="text-[9px] px-1.5 py-0">
                  Demo
                </Badge>
              )}
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-200 truncate">
                {activeWorkspace.name}
              </span>
              <span className="text-[11px] font-mono text-emerald-400 font-bold">
                {activeWorkspace.currencySymbol}
              </span>
            </div>
          </div>

          {/* User Profile Mini Bar */}
          <div className="flex items-center justify-between px-2 py-1.5 rounded-lg hover:bg-surface-elevated transition-colors text-xs text-slate-300">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 font-bold text-[10px]">
                AS
              </div>
              <span className="font-medium text-slate-200">Aarav Sharma</span>
            </div>
            <button
              onClick={() => onNavigate("settings")}
              className="text-slate-400 hover:text-slate-200 p-1"
            >
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
