import React, { useState, useEffect } from "react";
import {
  Receipt,
  Search,
  Filter,
  Upload,
  Download,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Calendar,
  X,
  Sparkles,
} from "lucide-react";
import { useWorkspace } from "../context/WorkspaceContext";
import { api } from "../services/api";
import { Transaction, CSVUploadResult, ColumnMapping } from "../types";
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import { Modal } from "../components/ui/Modal";
import { formatDate } from "../lib/utils";

export interface TransactionsPageProps {
  onNavigate?: (path: string) => void;
}

export const TransactionsPage: React.FC<TransactionsPageProps> = () => {
  const { activeWorkspace, formatAmount } = useWorkspace();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | "income" | "expense" | "flagged">("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(true);

  // CSV Modal State
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [csvPreview, setCsvPreview] = useState<CSVUploadResult | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [uploadSuccessMsg, setUploadSuccessMsg] = useState("");

  const loadData = async () => {
    setIsLoading(true);
    try {
      const list = await api.getTransactions(activeWorkspace.id);
      setTransactions(list);
      setFilteredTransactions(list);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [activeWorkspace.id]);

  useEffect(() => {
    let result = [...transactions];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (t) =>
          t.description.toLowerCase().includes(q) ||
          t.counterparty.toLowerCase().includes(q) ||
          t.category.toLowerCase().includes(q) ||
          t.reference_no?.toLowerCase().includes(q)
      );
    }

    if (typeFilter === "income") {
      result = result.filter((t) => t.type === "income");
    } else if (typeFilter === "expense") {
      result = result.filter((t) => t.type === "expense");
    } else if (typeFilter === "flagged") {
      result = result.filter((t) => t.status === "flagged");
    }

    if (categoryFilter !== "all") {
      result = result.filter((t) => t.category === categoryFilter);
    }

    setFilteredTransactions(result);
  }, [searchQuery, typeFilter, categoryFilter, transactions]);

  // Unique categories
  const categories = Array.from(new Set(transactions.map((t) => t.category))).filter(Boolean);

  const handleFileChange = async (file: File) => {
    setSelectedFile(file);
    setIsParsing(true);
    try {
      const preview = await api.parseCSVPreview(file);
      setCsvPreview(preview);
    } catch (err: any) {
      alert(err.message || "Failed to parse CSV");
      setSelectedFile(null);
    } finally {
      setIsParsing(false);
    }
  };

  const handleConfirmImport = async () => {
    if (!csvPreview) return;
    setIsImporting(true);
    try {
      const res = await api.confirmCSVUpload(activeWorkspace.id, csvPreview, {
        date: "Date",
        amount: "Amount",
        description: "Description",
      });
      setUploadSuccessMsg(`Successfully imported ${res.imported_count} transactions!`);
      setTimeout(() => {
        setIsUploadModalOpen(false);
        setSelectedFile(null);
        setCsvPreview(null);
        setUploadSuccessMsg("");
        loadData();
      }, 1200);
    } finally {
      setIsImporting(false);
    }
  };

  const exportCSV = () => {
    const headers = ["Date", "Description", "Amount", "Type", "Category", "Counterparty", "Status"];
    const rows = filteredTransactions.map((t) => [
      t.date,
      `"${t.description.replace(/"/g, '""')}"`,
      t.amount,
      t.type,
      `"${t.category}"`,
      `"${t.counterparty}"`,
      t.status,
    ]);

    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `transactions_${activeWorkspace.name.toLowerCase().replace(/\s+/g, "_")}.csv`;
    link.click();
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-surface-card p-5 rounded-xl border border-surface-border">
        <div>
          <h1 className="text-xl font-bold text-slate-100">Transactions & Ledger</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Synchronized transaction history with automated category mapping and anti-duplicate audit flags
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Button onClick={exportCSV} variant="secondary" size="sm" className="gap-1.5">
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </Button>
          <Button
            onClick={() => setIsUploadModalOpen(true)}
            variant="primary"
            size="sm"
            className="gap-1.5 shadow-glow-emerald"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Import Bank Statement CSV</span>
          </Button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <Card className="p-4 space-y-3">
        <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
          {/* Search Box */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by counterparty, notes, ref..."
              className="w-full h-9 pl-9 pr-3 rounded-lg bg-surface-elevated border border-surface-border text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>

          {/* Quick Filters */}
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            <div className="flex bg-surface-elevated border border-surface-border rounded-lg p-0.5 text-xs">
              <button
                onClick={() => setTypeFilter("all")}
                className={`px-3 py-1 rounded-md transition-colors ${
                  typeFilter === "all" ? "bg-surface-card text-emerald-400 font-semibold" : "text-slate-400"
                }`}
              >
                All
              </button>
              <button
                onClick={() => setTypeFilter("income")}
                className={`px-3 py-1 rounded-md transition-colors ${
                  typeFilter === "income" ? "bg-surface-card text-emerald-400 font-semibold" : "text-slate-400"
                }`}
              >
                Income
              </button>
              <button
                onClick={() => setTypeFilter("expense")}
                className={`px-3 py-1 rounded-md transition-colors ${
                  typeFilter === "expense" ? "bg-surface-card text-emerald-400 font-semibold" : "text-slate-400"
                }`}
              >
                Expenses
              </button>
              <button
                onClick={() => setTypeFilter("flagged")}
                className={`px-3 py-1 rounded-md transition-colors ${
                  typeFilter === "flagged" ? "bg-rose-500/20 text-rose-400 font-semibold" : "text-slate-400"
                }`}
              >
                Flagged
              </button>
            </div>

            {/* Category Filter Dropdown */}
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="h-9 px-3 rounded-lg bg-surface-elevated border border-surface-border text-xs text-slate-300 focus:outline-none focus:border-emerald-500"
            >
              <option value="all">All Categories</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      {/* Transactions Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-surface-border bg-surface-elevated/40 text-slate-400 font-mono">
                <th className="py-3 px-4 font-medium">Date</th>
                <th className="py-3 px-4 font-medium">Description</th>
                <th className="py-3 px-4 font-medium">Category</th>
                <th className="py-3 px-4 font-medium">Account / Channel</th>
                <th className="py-3 px-4 font-medium">Reference No</th>
                <th className="py-3 px-4 font-medium text-right">Amount</th>
                <th className="py-3 px-4 font-medium text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-border/50">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500">
                    No transactions match your search criteria.
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((tx) => (
                  <tr
                    key={tx.id}
                    className={`hover:bg-surface-elevated/40 transition-colors ${
                      tx.status === "flagged" ? "bg-rose-500/5" : ""
                    }`}
                  >
                    <td className="py-3 px-4 text-slate-400 font-mono">{formatDate(tx.date)}</td>
                    <td className="py-3 px-4">
                      <div className="font-medium text-slate-200">{tx.description}</div>
                      <div className="text-[11px] text-slate-400">{tx.counterparty}</div>
                      {tx.notes && (
                        <div className="text-[10px] text-rose-400 mt-0.5 flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3 shrink-0" />
                          <span>{tx.notes}</span>
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded bg-surface-elevated border border-surface-border text-[11px] text-slate-300">
                        {tx.category}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-300">{tx.account_name || "Primary Current"}</td>
                    <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">
                      {tx.reference_no || "—"}
                    </td>
                    <td
                      className={`py-3 px-4 text-right font-mono font-bold ${
                        tx.type === "income" ? "text-emerald-400" : "text-slate-100"
                      }`}
                    >
                      {tx.type === "income" ? "+" : "-"}
                      {formatAmount(tx.amount)}
                    </td>
                    <td className="py-3 px-4 text-right">
                      {tx.status === "flagged" ? (
                        <Badge variant="rose" className="text-[10px]">
                          Flagged Duplicate
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
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* CSV Upload & Column Mapping Modal */}
      <Modal
        isOpen={isUploadModalOpen}
        onClose={() => {
          setIsUploadModalOpen(false);
          setSelectedFile(null);
          setCsvPreview(null);
        }}
        title="Import Financial Transactions (CSV)"
        description="Upload your bank statement or accounting ledger. ArthaFlow validates columns and detects duplicates."
        maxWidth="xl"
      >
        <div className="space-y-5">
          {!csvPreview ? (
            /* Dropzone */
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                if (e.dataTransfer.files[0]) handleFileChange(e.dataTransfer.files[0]);
              }}
              className="border-2 border-dashed border-surface-border hover:border-emerald-500/60 rounded-xl p-8 text-center bg-surface-elevated/40 hover:bg-surface-elevated/70 transition-all cursor-pointer flex flex-col items-center justify-center space-y-3"
            >
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                <Upload className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-200">
                  Drag and drop statement CSV, or click to browse
                </p>
                <p className="text-[11px] text-slate-400 mt-1">
                  Supported formats: HDFC, ICICI, SBI, Axis, Razorpay, Stripe, QuickBooks
                </p>
              </div>
              <input
                type="file"
                accept=".csv"
                id="csvFileInput"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files?.[0]) handleFileChange(e.target.files[0]);
                }}
              />
              <Button
                onClick={() => document.getElementById("csvFileInput")?.click()}
                variant="secondary"
                size="sm"
                isLoading={isParsing}
              >
                Choose File
              </Button>
            </div>
          ) : (
            /* Preview & Mapping */
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg bg-surface-elevated border border-surface-border text-xs">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-emerald-400" />
                  <span className="font-semibold text-slate-200">{csvPreview.filename}</span>
                </div>
                <Badge variant="emerald">{csvPreview.total_rows} Rows Detected</Badge>
              </div>

              {/* Sample Rows Preview */}
              <div>
                <h4 className="text-xs font-semibold text-slate-300 mb-2">Parsed Preview Sample</h4>
                <div className="overflow-x-auto border border-surface-border rounded-lg max-h-48 overflow-y-auto">
                  <table className="w-full text-left text-[11px]">
                    <thead>
                      <tr className="bg-surface-elevated text-slate-400 font-mono border-b border-surface-border">
                        <th className="p-2">Date</th>
                        <th className="p-2">Description</th>
                        <th className="p-2">Category</th>
                        <th className="p-2 text-right">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-surface-border/50">
                      {csvPreview.preview_transactions.map((p, i) => (
                        <tr key={i} className="hover:bg-surface-elevated/30">
                          <td className="p-2 font-mono text-slate-400">{p.date}</td>
                          <td className="p-2 text-slate-200 truncate max-w-[180px]">{p.description}</td>
                          <td className="p-2 text-slate-300">{p.category}</td>
                          <td className="p-2 text-right font-mono font-bold text-slate-100">
                            ₹{p.amount?.toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {uploadSuccessMsg && (
                <div className="p-3 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                  <span>{uploadSuccessMsg}</span>
                </div>
              )}

              <div className="flex justify-end gap-2.5 pt-2">
                <Button
                  onClick={() => {
                    setCsvPreview(null);
                    setSelectedFile(null);
                  }}
                  variant="outline"
                  size="sm"
                >
                  Choose Different File
                </Button>
                <Button
                  onClick={handleConfirmImport}
                  variant="primary"
                  size="sm"
                  isLoading={isImporting}
                  className="gap-1.5 shadow-glow-emerald font-semibold"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Confirm & Import Ledger</span>
                </Button>
              </div>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};
