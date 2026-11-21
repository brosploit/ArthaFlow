import React from "react";
import {
  Sparkles,
  ArrowRight,
  TrendingUp,
  ShieldAlert,
  FlaskConical,
  Network,
  Bot,
  Brain,
  CheckCircle2,
  Lock,
  ChevronRight,
  Play,
} from "lucide-react";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import { Card } from "../components/ui/Card";

export interface LandingPageProps {
  onEnterApp: () => void;
  onExploreDemo: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onEnterApp, onExploreDemo }) => {
  return (
    <div className="min-h-screen bg-background text-slate-100 flex flex-col selection:bg-emerald-500/30 selection:text-emerald-300">
      {/* Top Navigation */}
      <header className="h-20 border-b border-surface-border/60 px-6 lg:px-12 flex items-center justify-between sticky top-0 z-50 bg-background/90 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold shadow-glow-emerald">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-lg text-slate-100 tracking-tight">ArthaFlow</span>
              <span className="font-bold text-lg text-emerald-400">AI</span>
            </div>
            <p className="text-[10px] text-slate-400 uppercase tracking-widest font-mono">
              Decision Intelligence
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button onClick={onExploreDemo} variant="outline" size="sm">
            Explore Live Demo
          </Button>
          <Button onClick={onEnterApp} variant="primary" size="sm" className="gap-2 shadow-glow-emerald">
            <span>Launch Platform</span>
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 lg:py-28 px-6 lg:px-12 max-w-6xl mx-auto flex flex-col items-center text-center space-y-8">
        <Badge variant="emerald" dot className="px-3.5 py-1 text-xs">
          Decision Intelligence Platform for SMEs & Individuals
        </Badge>

        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-slate-100 max-w-4xl leading-[1.1]">
          Understand money. <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400">
            Predict possibilities.
          </span>{" "}
          <br />
          Make smarter decisions.
        </h1>

        <p className="text-base sm:text-xl text-slate-400 max-w-2xl leading-relaxed">
          Most financial apps tell you what happened to your money. ArthaFlow AI builds a{" "}
          <strong className="text-slate-200">Financial Digital Twin</strong> to stress-test decisions,
          forecast liquidity, and eliminate financial blind spots before you commit capital.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
          <Button onClick={onEnterApp} size="lg" variant="primary" className="gap-2 shadow-glow-emerald font-semibold px-7">
            <span>Enter Workspace</span>
            <ArrowRight className="w-5 h-5" />
          </Button>
          <Button onClick={onExploreDemo} size="lg" variant="secondary" className="gap-2 px-7">
            <Play className="w-4 h-4 text-emerald-400 fill-emerald-400" />
            <span>Try Aarav Retail Demo</span>
          </Button>
        </div>

        {/* Feature Tags Ribbon */}
        <div className="pt-8 flex flex-wrap justify-center gap-6 text-xs text-slate-400 border-t border-surface-border/40 w-full max-w-3xl">
          <span className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            Zero Financial Hallucination
          </span>
          <span className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            Deterministic Math Engines
          </span>
          <span className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            Tool-Calling AI Architecture
          </span>
          <span className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            Workspace Isolated Data
          </span>
        </div>
      </section>

      {/* Core Modules Grid */}
      <section className="py-16 px-6 lg:px-12 max-w-6xl mx-auto w-full space-y-12">
        <div className="text-center space-y-3">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-100">
            Six Intelligent Engines Working as One
          </h2>
          <p className="text-sm text-slate-400 max-w-xl mx-auto">
            Traditional bookkeeping looks backward. ArthaFlow AI evaluates prospective financial scenarios
            with deterministic rigor and explainable AI.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="hover:border-emerald-500/40 transition-colors">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-4">
              <Network className="w-5 h-5" />
            </div>
            <h3 className="text-base font-semibold text-slate-100 mb-1">Financial Digital Twin</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              A unified, time-aware representation of all bank accounts, pending receivables, upcoming payables, and recurring commitments.
            </p>
          </Card>

          <Card className="hover:border-cyan-500/40 transition-colors">
            <div className="w-10 h-10 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 mb-4">
              <FlaskConical className="w-5 h-5" />
            </div>
            <h3 className="text-base font-semibold text-slate-100 mb-1">What-If Scenario Lab</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Stress-test inventory purchases, payment delays, or revenue shocks. Compare baseline vs. simulated runway before spending.
            </p>
          </Card>

          <Card className="hover:border-indigo-500/40 transition-colors">
            <div className="w-10 h-10 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-4">
              <TrendingUp className="w-5 h-5" />
            </div>
            <h3 className="text-base font-semibold text-slate-100 mb-1">7 & 30-Day Cash Forecasting</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Deterministic daily projections with confidence intervals, scheduled payment milestones, and safety buffer breach warnings.
            </p>
          </Card>

          <Card className="hover:border-rose-500/40 transition-colors">
            <div className="w-10 h-10 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 mb-4">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <h3 className="text-base font-semibold text-slate-100 mb-1">Risk Intelligence</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Automated anomaly detection for duplicate charges, overdue customer concentrations, and mid-month liquidity pinches.
            </p>
          </Card>

          <Card className="hover:border-emerald-500/40 transition-colors">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-4">
              <Bot className="w-5 h-5" />
            </div>
            <h3 className="text-base font-semibold text-slate-100 mb-1">AI Financial Agent</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Tool-based conversational intelligence. The agent calls verified backend calculation tools—never inventing numbers.
            </p>
          </Card>

          <Card className="hover:border-amber-500/40 transition-colors">
            <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mb-4">
              <Brain className="w-5 h-5" />
            </div>
            <h3 className="text-base font-semibold text-slate-100 mb-1">Decision Memory</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Record hypotheses, assumptions, and expected outcomes. Track actual performance over time to continuously calibrate your decisions.
            </p>
          </Card>
        </div>
      </section>

      {/* How it Works Section */}
      <section className="py-16 px-6 lg:px-12 max-w-5xl mx-auto w-full border-t border-surface-border/50">
        <h2 className="text-2xl font-bold text-center text-slate-100 mb-12">
          From Raw Records to Decision Intelligence
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-center">
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-full bg-surface-elevated border border-surface-border mx-auto flex items-center justify-center font-bold text-emerald-400 text-sm font-mono">
              1
            </div>
            <h4 className="text-sm font-semibold text-slate-200">Import Financial Data</h4>
            <p className="text-xs text-slate-400">
              Upload bank CSVs or invoices with automated column detection and categorization.
            </p>
          </div>

          <div className="space-y-3">
            <div className="w-10 h-10 rounded-full bg-surface-elevated border border-surface-border mx-auto flex items-center justify-center font-bold text-cyan-400 text-sm font-mono">
              2
            </div>
            <h4 className="text-sm font-semibold text-slate-200">Build Digital Twin</h4>
            <p className="text-xs text-slate-400">
              The engine consolidates accounts, pending receivables, and recurring burn rates.
            </p>
          </div>

          <div className="space-y-3">
            <div className="w-10 h-10 rounded-full bg-surface-elevated border border-surface-border mx-auto flex items-center justify-center font-bold text-indigo-400 text-sm font-mono">
              3
            </div>
            <h4 className="text-sm font-semibold text-slate-200">Simulate Scenarios</h4>
            <p className="text-xs text-slate-400">
              Adjust sliders for capital expenditures, delayed terms, or revenue shocks.
            </p>
          </div>

          <div className="space-y-3">
            <div className="w-10 h-10 rounded-full bg-surface-elevated border border-surface-border mx-auto flex items-center justify-center font-bold text-emerald-400 text-sm font-mono">
              4
            </div>
            <h4 className="text-sm font-semibold text-slate-200">AI Counsel & Memory</h4>
            <p className="text-xs text-slate-400">
              Interact with the AI agent to explain numbers and preserve decisions for post-hoc analysis.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-surface-border py-8 px-6 lg:px-12 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
        <div>
          © 2024 ArthaFlow AI • Team Trio Analytics (Dhruv Mahajan, Anshika Verma, Shikha Yadav).
        </div>
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5 text-emerald-400/80">
            <Lock className="w-3.5 h-3.5" />
            Strict Workspace Isolation
          </span>
          <button onClick={onExploreDemo} className="hover:text-slate-300 transition-colors">
            Demo Sandbox
          </button>
        </div>
      </footer>
    </div>
  );
};
