import React, { useState } from "react";
import { Sparkles, ArrowRight, Lock, Mail, Building2, User, Check, Play } from "lucide-react";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { useWorkspace } from "../context/WorkspaceContext";

export interface AuthPageProps {
  onSuccess: () => void;
  onExploreDemo: () => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({ onSuccess, onExploreDemo }) => {
  const [tab, setTab] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("aarav@aaravretail.in");
  const [password, setPassword] = useState("••••••••••••");
  const [name, setName] = useState("Aarav Sharma");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      onSuccess();
    }, 600);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center items-center p-4 selection:bg-emerald-500/30 selection:text-emerald-300">
      <div className="w-full max-w-md space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 mb-2 shadow-glow-emerald">
            <Sparkles className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold text-slate-100 tracking-tight">ArthaFlow AI</h1>
          <p className="text-xs text-slate-400">
            Sign in to access your Financial Decision Intelligence Workspace
          </p>
        </div>

        {/* Demo Fast-Track Card */}
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between gap-3 shadow-glow-emerald">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Play className="w-4 h-4 fill-emerald-400" />
            </div>
            <div>
              <h4 className="text-xs font-semibold text-emerald-300">Evaluating for Hackathon?</h4>
              <p className="text-[11px] text-emerald-400/80">Launch pre-loaded Aarav Retail workspace</p>
            </div>
          </div>
          <Button onClick={onExploreDemo} size="sm" variant="primary" className="text-xs shrink-0 font-semibold">
            One-Click Demo
          </Button>
        </div>

        {/* Auth Card */}
        <Card>
          {/* Tabs */}
          <div className="flex border-b border-surface-border mb-6">
            <button
              onClick={() => setTab("login")}
              className={`flex-1 pb-3 text-xs font-medium text-center border-b-2 transition-colors ${
                tab === "login"
                  ? "border-emerald-500 text-emerald-400 font-semibold"
                  : "border-transparent text-slate-400 hover:text-slate-200"
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => setTab("register")}
              className={`flex-1 pb-3 text-xs font-medium text-center border-b-2 transition-colors ${
                tab === "register"
                  ? "border-emerald-500 text-emerald-400 font-semibold"
                  : "border-transparent text-slate-400 hover:text-slate-200"
              }`}
            >
              Register Workspace
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {tab === "register" && (
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Aarav Sharma"
                  className="w-full h-10 px-3 rounded-lg bg-surface-elevated border border-surface-border text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
                  required
                />
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="finance@yourcompany.com"
                  className="w-full h-10 pl-9 pr-3 rounded-lg bg-surface-elevated border border-surface-border text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-xs font-medium text-slate-300">Password</label>
                {tab === "login" && (
                  <a href="#" className="text-[11px] text-emerald-400 hover:underline">
                    Forgot password?
                  </a>
                )}
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full h-10 pl-9 pr-3 rounded-lg bg-surface-elevated border border-surface-border text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={isLoading}
              className="w-full font-semibold shadow-glow-emerald mt-2"
            >
              {tab === "login" ? "Enter Workspace" : "Create Account & Workspace"}
            </Button>
          </form>

          <div className="mt-6 pt-4 border-t border-surface-border/60 text-center text-xs text-slate-500 flex items-center justify-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-emerald-400" />
            <span>256-bit encrypted • Workspace Isolated</span>
          </div>
        </Card>
      </div>
    </div>
  );
};
