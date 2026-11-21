import React, { useState } from "react";
import { Building2, User, Upload, ArrowRight, Check, Sparkles, FileText, Download } from "lucide-react";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { useWorkspace } from "../context/WorkspaceContext";

export interface OnboardingPageProps {
  onComplete: () => void;
}

export const OnboardingPage: React.FC<OnboardingPageProps> = ({ onComplete }) => {
  const { createWorkspace } = useWorkspace();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [mode, setMode] = useState<"business" | "individual">("business");
  const [name, setName] = useState("Aarav Retail Enterprises");
  const [currency, setCurrency] = useState<"INR" | "USD" | "EUR" | "GBP">("INR");
  const [startingCash, setStartingCash] = useState<number>(120000);
  const [isLoading, setIsLoading] = useState(false);

  const handleCreate = async () => {
    setIsLoading(true);
    try {
      await createWorkspace({
        name,
        mode,
        currency,
        starting_cash: startingCash,
      });
      setStep(3);
    } finally {
      setIsLoading(false);
    }
  };

  const downloadSampleCSV = () => {
    const csvContent = `Date,Description,Amount,Type,Category,Counterparty
2024-10-31,Store Retail Sales,32500,income,Sales,Walk-in Customers
2024-10-30,Freight Logistics,14200,expense,Logistics,Delhivery Surface
2024-10-29,B2B Settlement,45000,income,Wholesale,FabIndia
2024-10-28,Commercial Lease Rent,22000,expense,Rent,Sharma Estates
2024-10-27,Fabric Lot Sourcing,18500,expense,Raw Materials,Surat Cotton Mills`;

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "arthaflow_sample_ledger.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center items-center p-4 selection:bg-emerald-500/30 selection:text-emerald-300">
      <div className="w-full max-w-xl space-y-6">
        {/* Progress indicator */}
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-emerald-500 text-slate-950 font-bold text-xs flex items-center justify-center">
              {step}
            </span>
            <span className="text-xs font-semibold text-slate-200">
              {step === 1 && "Step 1: Choose Operating Mode"}
              {step === 2 && "Step 2: Workspace Setup"}
              {step === 3 && "Step 3: Import & Activate"}
            </span>
          </div>
          <span className="text-xs font-mono text-slate-500">Step {step} of 3</span>
        </div>

        {/* Step 1: Mode Selection */}
        {step === 1 && (
          <Card className="space-y-6">
            <div>
              <h2 className="text-lg font-bold text-slate-100">Select Financial Mode</h2>
              <p className="text-xs text-slate-400 mt-1">
                ArthaFlow adapts its digital twin and forecasting models based on whether you are managing business operations or personal finances.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div
                onClick={() => setMode("business")}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  mode === "business"
                    ? "bg-emerald-500/10 border-emerald-500 text-slate-100 shadow-glow-emerald"
                    : "bg-surface-elevated border-surface-border text-slate-300 hover:border-slate-500"
                }`}
              >
                <div className="w-10 h-10 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center mb-3">
                  <Building2 className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-semibold mb-1">Small Business (SME)</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Vendor invoices, accounts receivable/payable, commercial rent, staff payroll, and working capital runways.
                </p>
                {mode === "business" && (
                  <div className="mt-3 flex items-center gap-1.5 text-xs text-emerald-400 font-semibold">
                    <Check className="w-4 h-4" />
                    <span>Selected</span>
                  </div>
                )}
              </div>

              <div
                onClick={() => setMode("individual")}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  mode === "individual"
                    ? "bg-emerald-500/10 border-emerald-500 text-slate-100 shadow-glow-emerald"
                    : "bg-surface-elevated border-surface-border text-slate-300 hover:border-slate-500"
                }`}
              >
                <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mb-3">
                  <User className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-semibold mb-1">Individual / Freelancer</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Salary & retainers, personal savings, credit card payables, recurring subscriptions, and emergency funds.
                </p>
                {mode === "individual" && (
                  <div className="mt-3 flex items-center gap-1.5 text-xs text-emerald-400 font-semibold">
                    <Check className="w-4 h-4" />
                    <span>Selected</span>
                  </div>
                )}
              </div>
            </div>

            <Button onClick={() => setStep(2)} size="lg" variant="primary" className="w-full gap-2 font-semibold">
              <span>Continue to Workspace Details</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Card>
        )}

        {/* Step 2: Workspace Details */}
        {step === 2 && (
          <Card className="space-y-5">
            <div>
              <h2 className="text-lg font-bold text-slate-100">Setup Financial Parameters</h2>
              <p className="text-xs text-slate-400 mt-1">
                Configure your currency and initial unencumbered starting cash balance.
              </p>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300">Workspace / Business Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full h-10 px-3 rounded-lg bg-surface-elevated border border-surface-border text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-300">Operating Currency</label>
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value as any)}
                    className="w-full h-10 px-3 rounded-lg bg-surface-elevated border border-surface-border text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="INR">INR (₹) - Indian Rupee</option>
                    <option value="USD">USD ($) - US Dollar</option>
                    <option value="EUR">EUR (€) - Euro</option>
                    <option value="GBP">GBP (£) - British Pound</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-300">Current Available Cash</label>
                  <input
                    type="number"
                    value={startingCash}
                    onChange={(e) => setStartingCash(Number(e.target.value))}
                    className="w-full h-10 px-3 rounded-lg bg-surface-elevated border border-surface-border text-xs text-slate-100 focus:outline-none focus:border-emerald-500 font-mono"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <Button onClick={() => setStep(1)} variant="outline" size="md">
                Back
              </Button>
              <Button onClick={handleCreate} isLoading={isLoading} variant="primary" size="md" className="flex-1 font-semibold">
                <span>Create Workspace</span>
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            </div>
          </Card>
        )}

        {/* Step 3: Data Ingestion Guidance */}
        {step === 3 && (
          <Card className="space-y-6">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center">
                <Check className="w-6 h-6" />
              </div>
              <h2 className="text-lg font-bold text-slate-100">Workspace Ready!</h2>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Your Financial Digital Twin is active. You can now import bank statements or proceed with pre-configured accounts.
              </p>
            </div>

            {/* CSV Specification Card */}
            <div className="p-4 rounded-xl bg-surface-elevated border border-surface-border space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-semibold text-slate-200 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-emerald-400" />
                  <span>CSV File Requirements</span>
                </h4>
                <button
                  onClick={downloadSampleCSV}
                  className="text-xs text-emerald-400 hover:underline flex items-center gap-1"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Sample CSV</span>
                </button>
              </div>

              <div className="text-[11px] text-slate-400 space-y-1 leading-relaxed">
                <p>• Requires columns for <strong>Date, Description, Amount, Type</strong> (or debit/credit).</p>
                <p>• Automatically handles standard bank exports from HDFC, ICICI, SBI, Axis, Razorpay, or Stripe.</p>
                <p>• Deterministic anti-duplicate deduplication ensures no transaction is counted twice.</p>
              </div>
            </div>

            <Button onClick={onComplete} size="lg" variant="primary" className="w-full gap-2 font-semibold shadow-glow-emerald">
              <span>Launch Financial Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Card>
        )}
      </div>
    </div>
  );
};
