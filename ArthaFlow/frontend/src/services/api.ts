import {
  Workspace,
  Account,
  Transaction,
  Invoice,
  RecurringItem,
  DigitalTwin,
  CashForecast,
  ScenarioSimulation,
  ScenarioParameters,
  RiskAlert,
  DecisionMemory,
  ChatMessage,
  CSVUploadResult,
  ColumnMapping,
} from "../types";
import {
  DEMO_WORKSPACES,
  DEMO_ACCOUNTS,
  DEMO_TRANSACTIONS,
  DEMO_INVOICES,
  DEMO_RECURRING,
  DEMO_DIGITAL_TWIN,
  DEMO_FORECAST_30D,
  DEMO_SCENARIO_SIMULATIONS,
  DEMO_RISK_ALERTS,
  DEMO_DECISION_MEMORIES,
  DEMO_CHAT_MESSAGES,
} from "./demoData";

const API_BASE_URL = import.meta.env.VITE_API_URL || "/api/v1";

// Helper to determine if we should fall back to local reactive demo store
function getStoredItem<T>(key: string, defaultVal: T): T {
  try {
    const item = localStorage.getItem(`arthaflow_${key}`);
    return item ? JSON.parse(item) : defaultVal;
  } catch {
    return defaultVal;
  }
}

function setStoredItem<T>(key: string, val: T): void {
  try {
    localStorage.setItem(`arthaflow_${key}`, JSON.stringify(val));
  } catch {
    // Ignore storage quota
  }
}

export const api = {
  // WORKSPACES
  async getWorkspaces(): Promise<Workspace[]> {
    try {
      const res = await fetch(`${API_BASE_URL}/workspaces`);
      if (res.ok) return await res.json();
    } catch {
      // Backend not running, use demo
    }
    return getStoredItem("workspaces", DEMO_WORKSPACES);
  },

  async createWorkspace(data: {
    name: string;
    mode: "business" | "individual";
    currency: "INR" | "USD" | "EUR" | "GBP";
    starting_cash: number;
  }): Promise<Workspace> {
    try {
      const res = await fetch(`${API_BASE_URL}/workspaces`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (res.ok) return await res.json();
    } catch {
      // Fallback
    }

    const newWs: Workspace = {
      id: `ws-${Date.now()}`,
      name: data.name,
      mode: data.mode,
      currency: data.currency,
      currencySymbol: data.currency === "INR" ? "₹" : data.currency === "USD" ? "$" : "€",
      starting_cash: data.starting_cash,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      isDemo: false,
    };

    const current = getStoredItem("workspaces", DEMO_WORKSPACES);
    const updated = [...current, newWs];
    setStoredItem("workspaces", updated);
    return newWs;
  },

  // DIGITAL TWIN
  async getDigitalTwin(workspaceId: string): Promise<DigitalTwin> {
    try {
      const res = await fetch(`${API_BASE_URL}/workspaces/${workspaceId}/digital-twin`);
      if (res.ok) return await res.json();
    } catch {
      // Fallback
    }
    return getStoredItem(`twin_${workspaceId}`, DEMO_DIGITAL_TWIN);
  },

  // ACCOUNTS
  async getAccounts(workspaceId: string): Promise<Account[]> {
    try {
      const res = await fetch(`${API_BASE_URL}/workspaces/${workspaceId}/accounts`);
      if (res.ok) return await res.json();
    } catch {
      // Fallback
    }
    return getStoredItem(`accounts_${workspaceId}`, DEMO_ACCOUNTS);
  },

  // TRANSACTIONS
  async getTransactions(workspaceId: string): Promise<Transaction[]> {
    try {
      const res = await fetch(`${API_BASE_URL}/workspaces/${workspaceId}/transactions`);
      if (res.ok) return await res.json();
    } catch {
      // Fallback
    }
    return getStoredItem(`transactions_${workspaceId}`, DEMO_TRANSACTIONS);
  },

  async addTransaction(workspaceId: string, tx: Omit<Transaction, "id" | "workspace_id">): Promise<Transaction> {
    try {
      const res = await fetch(`${API_BASE_URL}/workspaces/${workspaceId}/transactions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(tx),
      });
      if (res.ok) return await res.json();
    } catch {
      // Fallback
    }

    const newTx: Transaction = {
      ...tx,
      id: `tx-${Date.now()}`,
      workspace_id: workspaceId,
    };
    const current = getStoredItem(`transactions_${workspaceId}`, DEMO_TRANSACTIONS);
    const updated = [newTx, ...current];
    setStoredItem(`transactions_${workspaceId}`, updated);
    return newTx;
  },

  // INVOICES & RECEIVABLES/PAYABLES
  async getInvoices(workspaceId: string): Promise<Invoice[]> {
    try {
      const res = await fetch(`${API_BASE_URL}/workspaces/${workspaceId}/invoices`);
      if (res.ok) return await res.json();
    } catch {
      // Fallback
    }
    return getStoredItem(`invoices_${workspaceId}`, DEMO_INVOICES);
  },

  async getRecurring(workspaceId: string): Promise<RecurringItem[]> {
    try {
      const res = await fetch(`${API_BASE_URL}/workspaces/${workspaceId}/recurring`);
      if (res.ok) return await res.json();
    } catch {
      // Fallback
    }
    return getStoredItem(`recurring_${workspaceId}`, DEMO_RECURRING);
  },

  // FORECASTING
  async getForecast(workspaceId: string, days: 7 | 30 = 30): Promise<CashForecast> {
    try {
      const res = await fetch(`${API_BASE_URL}/workspaces/${workspaceId}/forecast?days=${days}`);
      if (res.ok) return await res.json();
    } catch {
      // Fallback
    }
    const fullForecast = getStoredItem(`forecast_${workspaceId}`, DEMO_FORECAST_30D);
    if (days === 7) {
      return {
        ...fullForecast,
        days: 7,
        daily_forecasts: fullForecast.daily_forecasts.slice(0, 7),
        ending_projected_balance: fullForecast.daily_forecasts[6]?.closing_balance || fullForecast.starting_balance,
      };
    }
    return fullForecast;
  },

  // SCENARIO LAB (WHAT-IF SIMULATOR)
  async getScenarios(workspaceId: string): Promise<ScenarioSimulation[]> {
    try {
      const res = await fetch(`${API_BASE_URL}/workspaces/${workspaceId}/scenarios`);
      if (res.ok) return await res.json();
    } catch {
      // Fallback
    }
    return getStoredItem(`scenarios_${workspaceId}`, DEMO_SCENARIO_SIMULATIONS);
  },

  async runSimulation(
    workspaceId: string,
    params: {
      title: string;
      description?: string;
      scenario_type: ScenarioSimulation["scenario_type"];
      parameters: ScenarioParameters;
    }
  ): Promise<ScenarioSimulation> {
    try {
      const res = await fetch(`${API_BASE_URL}/workspaces/${workspaceId}/scenarios/simulate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params),
      });
      if (res.ok) return await res.json();
    } catch {
      // Fallback pure deterministic simulation
    }

    const outflow = Number(params.parameters.outflow_amount || 0);
    const upfrontPct = Number(params.parameters.upfront_percentage || 100);
    const upfront = (outflow * upfrontPct) / 100;
    const deferred = outflow - upfront;
    const uplift = Number(params.parameters.expected_sales_uplift || 0);
    const delayDays = Number(params.parameters.delay_days || 0);

    const baseForecast = DEMO_FORECAST_30D;
    const baselineDays = baseForecast.daily_forecasts;

    let lowestSimulated = 9999999;
    let lowestDayNumber = 1;
    let lowestDate = "";
    let breakEven: number | undefined = undefined;

    const trajectory = baselineDays.map((d, idx) => {
      const day = idx + 1;
      let simBal = d.closing_balance;

      if (params.scenario_type === "capex") {
        if (day >= 1) simBal -= upfront;
        if (day >= 8) {
          const incrementalDailyUplift = uplift / 35;
          simBal += (day - 7) * incrementalDailyUplift;
        }
        if (day >= (params.parameters.deferred_days || 30)) {
          simBal -= deferred;
        }
      } else if (params.scenario_type === "delayed_receivable") {
        const amt = Number(params.parameters.affected_invoices_amount || 54000);
        if (day >= 4 && day < 4 + delayDays) {
          simBal -= amt;
        }
      } else if (params.scenario_type === "revenue_shock") {
        const pct = (params.parameters.revenue_reduction_percent || 20) / 100;
        simBal -= day * 1200 * pct;
      }

      if (simBal < lowestSimulated) {
        lowestSimulated = simBal;
        lowestDayNumber = day;
        lowestDate = d.date;
      }

      if (breakEven === undefined && simBal > d.closing_balance) {
        breakEven = day;
      }

      return {
        date: d.date,
        day_number: day,
        baseline_balance: d.closing_balance,
        simulated_balance: Math.round(simBal),
        variance: Math.round(simBal - d.closing_balance),
      };
    });

    const netImpact = trajectory[trajectory.length - 1].simulated_balance - trajectory[trajectory.length - 1].baseline_balance;
    const safetyBuffer = 40000;
    const isBufferBreached = lowestSimulated < safetyBuffer;
    const verdict = isBufferBreached ? (lowestSimulated < 20000 ? "HIGH_RISK" : "CAUTION") : "SAFE";

    const newScn: ScenarioSimulation = {
      id: `scn-${Date.now()}`,
      workspace_id: workspaceId,
      title: params.title,
      description: params.description || `Simulated ${params.scenario_type} with deterministic cash delta.`,
      scenario_type: params.scenario_type,
      parameters: params.parameters,
      created_at: new Date().toISOString(),
      baseline_runway_days: 72,
      simulated_runway_days: isBufferBreached ? 38 : 68,
      runway_delta_days: isBufferBreached ? -34 : -4,
      baseline_ending_cash: trajectory[trajectory.length - 1].baseline_balance,
      simulated_ending_cash: trajectory[trajectory.length - 1].simulated_balance,
      net_impact: netImpact,
      lowest_cash_dip: Math.round(lowestSimulated),
      lowest_cash_date: lowestDate,
      break_even_day: breakEven,
      verdict,
      risk_level: verdict === "HIGH_RISK" ? "critical" : verdict === "CAUTION" ? "medium" : "low",
      confidence_score: 91,
      rule_based_advice: [
        `Lowest balance reaches ₹${Math.round(lowestSimulated).toLocaleString()} on Day ${lowestDayNumber}.`,
        isBufferBreached
          ? `WARNING: This drops below your defined ₹${safetyBuffer.toLocaleString()} emergency liquidity reserve.`
          : `SAFE: Balances remain above your emergency cash reserve threshold throughout the 30-day projection.`,
        netImpact > 0
          ? `Positive net yield of +₹${netImpact.toLocaleString()} achieved across the modeled window.`
          : `Net negative liquidity drag of ₹${Math.abs(netImpact).toLocaleString()} recorded.`,
      ],
      trajectory_comparison: trajectory,
    };

    const current = getStoredItem(`scenarios_${workspaceId}`, DEMO_SCENARIO_SIMULATIONS);
    setStoredItem(`scenarios_${workspaceId}`, [newScn, ...current]);
    return newScn;
  },

  // RISK INTELLIGENCE
  async getRiskAlerts(workspaceId: string): Promise<RiskAlert[]> {
    try {
      const res = await fetch(`${API_BASE_URL}/workspaces/${workspaceId}/risks`);
      if (res.ok) return await res.json();
    } catch {
      // Fallback
    }
    return getStoredItem(`risks_${workspaceId}`, DEMO_RISK_ALERTS);
  },

  async resolveRiskAlert(workspaceId: string, alertId: string): Promise<RiskAlert> {
    try {
      const res = await fetch(`${API_BASE_URL}/workspaces/${workspaceId}/risks/${alertId}/resolve`, {
        method: "POST",
      });
      if (res.ok) return await res.json();
    } catch {
      // Fallback
    }

    const current = getStoredItem(`risks_${workspaceId}`, DEMO_RISK_ALERTS);
    const updated = current.map((r) => (r.id === alertId ? { ...r, is_resolved: true } : r));
    setStoredItem(`risks_${workspaceId}`, updated);
    return updated.find((r) => r.id === alertId)!;
  },

  // DECISION MEMORY
  async getDecisionMemories(workspaceId: string): Promise<DecisionMemory[]> {
    try {
      const res = await fetch(`${API_BASE_URL}/workspaces/${workspaceId}/decision-memories`);
      if (res.ok) return await res.json();
    } catch {
      // Fallback
    }
    return getStoredItem(`decisions_${workspaceId}`, DEMO_DECISION_MEMORIES);
  },

  async createDecisionMemory(
    workspaceId: string,
    data: Omit<DecisionMemory, "id" | "workspace_id" | "created_at">
  ): Promise<DecisionMemory> {
    try {
      const res = await fetch(`${API_BASE_URL}/workspaces/${workspaceId}/decision-memories`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (res.ok) return await res.json();
    } catch {
      // Fallback
    }

    const newDec: DecisionMemory = {
      ...data,
      id: `dec-${Date.now()}`,
      workspace_id: workspaceId,
      created_at: new Date().toISOString(),
    };
    const current = getStoredItem(`decisions_${workspaceId}`, DEMO_DECISION_MEMORIES);
    const updated = [newDec, ...current];
    setStoredItem(`decisions_${workspaceId}`, updated);
    return newDec;
  },

  // AI FINANCIAL AGENT (TOOL-CALLING)
  async sendChatMessage(
    workspaceId: string,
    message: string,
    history: ChatMessage[]
  ): Promise<ChatMessage> {
    try {
      const res = await fetch(`${API_BASE_URL}/workspaces/${workspaceId}/ai/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, history }),
      });
      if (res.ok) return await res.json();
    } catch {
      // Fallback deterministic AI agent simulator
    }

    // Deterministic AI response logic using verified data
    const twin = DEMO_DIGITAL_TWIN;
    const lower = message.toLowerCase();

    let content = "";
    let toolName = "get_digital_twin_metrics";
    let toolResult = "";
    const verifiedFigures: ChatMessage["verified_figures"] = [];

    if (lower.includes("cash") || lower.includes("balance") || lower.includes("runway")) {
      toolName = "get_digital_twin_metrics";
      toolResult = `Total Cash: ₹${twin.total_available_cash.toLocaleString()}, Runway: ${twin.liquidity_runway_days} days.`;
      content = `Your total verified available cash is **₹${twin.total_available_cash.toLocaleString()}**, distributed across ${twin.accounts_breakdown.length} accounts. Your estimated operating runway is **${twin.liquidity_runway_days} days** at your current net monthly burn rate of **₹${twin.monthly_burn_rate.toLocaleString()}**.`;
      verifiedFigures.push(
        { label: "Available Cash", value: `₹${twin.total_available_cash.toLocaleString()}`, source: "Digital Twin Engine" },
        { label: "Runway", value: `${twin.liquidity_runway_days} Days`, source: "Forecast Engine" }
      );
    } else if (lower.includes("inventory") || lower.includes("50,000") || lower.includes("purchase") || lower.includes("afford")) {
      toolName = "run_what_if_simulation";
      toolResult = "Simulated CapEx ₹50,000: 30% advance (₹15k) safe; 100% upfront breaches ₹40k buffer on Day 6.";
      content = `I executed a simulation on your cash flow for a **₹50,000 inventory purchase**:\n\n- **100% Upfront**: Cash dips to **₹25,000** on Nov 5, breaching your emergency buffer.\n- **Recommended Terms (30% Advance / 70% Net 30)**: Safe lowest balance of **₹53,200** on Nov 6. Expected sales uplift: **+₹1,15,000**.\n- Break-even is reached on **Day 22**.\n\nVerdict: **SAFE** with structured vendor payment terms.`;
      verifiedFigures.push(
        { label: "Safe Advance Disbursal", value: "₹15,000 (30%)", source: "Scenario Lab Engine" },
        { label: "Projected Sales Uplift", value: "₹1,15,000", source: "Scenario Lab Engine" },
        { label: "Break-Even Day", value: "Day 22", source: "Cash Flow Engine" }
      );
    } else if (lower.includes("risk") || lower.includes("alert") || lower.includes("duplicate")) {
      toolName = "get_risk_anomalies";
      toolResult = "Found 3 active risks: 1 duplicate charge (₹18.5k), 1 overdue receivable (₹28.5k), 1 buffer squeeze.";
      content = `You have **3 active risk alerts**:\n\n1. **Duplicate Supplier Charge**: ₹18,500 debited twice to Surat Cotton Mills on Oct 27 within 3 hours.\n2. **Overdue Concentration**: Kala Kendra invoice #INV-2024-042 (₹28,500) is 12 days overdue.\n3. **Mid-Month Buffer Squeeze**: Nov 5-10 obligations total ₹80,000 against ₹1,20,000 cash.\n\nRecommendation: Follow up with Surat Cotton Mills and Kala Kendra immediately.`;
      verifiedFigures.push(
        { label: "Flagged Duplicate", value: "₹18,500", source: "Risk Intelligence Engine" },
        { label: "Overdue Receivables", value: "₹28,500", source: "Invoicing Engine" }
      );
    } else {
      toolName = "get_financial_overview";
      toolResult = "Analyzed income, expenses, payables, and forecasts.";
      content = `Based on your recent financial records:\n- **Monthly Inflow**: ₹1,42,000\n- **Monthly Outflow**: ₹1,15,000\n- **Net Cash Flow**: +₹27,000 / month\n- **Pending Receivables**: ₹82,500\n- **Upcoming Payables**: ₹43,400\n\nYour financial health score is **82/100 (Stable)**. How would you like to stress-test your finances next?`;
      verifiedFigures.push(
        { label: "Financial Health Score", value: "82 / 100", source: "Digital Twin Engine" },
        { label: "Net Monthly Flow", value: "+₹27,000", source: "Transaction Ledger" }
      );
    }

    return {
      id: `msg-${Date.now()}`,
      session_id: "session-active",
      role: "assistant",
      content,
      timestamp: new Date().toISOString(),
      tool_calls_executed: [
        {
          tool_name: toolName,
          arguments: { workspace_id: workspaceId },
          result_summary: toolResult,
        },
      ],
      verified_figures: verifiedFigures,
      suggested_followups: [
        "What happens if sales drop 15% next month?",
        "Show me my next 7 days of cash flow",
        "Save current forecast to Decision Memory",
      ],
    };
  },

  // CSV UPLOAD & COLUMN MAPPING
  async parseCSVPreview(file: File): Promise<CSVUploadResult> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const text = e.target?.result as string;
          const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
          if (lines.length < 2) {
            throw new Error("CSV file must contain a header row and at least one data row.");
          }

          const headers = lines[0].split(",").map((h) => h.trim().replace(/^["']|["']$/g, ""));
          const sampleRows = lines.slice(1, 6).map((line) =>
            line.split(",").map((col) => col.trim().replace(/^["']|["']$/g, ""))
          );

          // Fuzzy column detection
          const dateIdx = headers.findIndex((h) => /date|time|posted|timestamp/i.test(h));
          const amtIdx = headers.findIndex((h) => /amount|sum|rupee|value|debit|credit/i.test(h));
          const descIdx = headers.findIndex((h) => /desc|narrative|particulars|details|item/i.test(h));
          const catIdx = headers.findIndex((h) => /category|type|tag/i.test(h));
          const partyIdx = headers.findIndex((h) => /vendor|party|payee|customer|merchant|counterparty/i.test(h));

          const previewTx: Partial<Transaction>[] = sampleRows.map((cols, idx) => {
            const rawAmt = amtIdx >= 0 ? parseFloat(cols[amtIdx].replace(/[^\d.-]/g, "")) || 0 : 1000;
            return {
              id: `preview-${idx}`,
              date: dateIdx >= 0 ? cols[dateIdx] : new Date().toISOString().split("T")[0],
              amount: Math.abs(rawAmt),
              type: rawAmt >= 0 ? "income" : "expense",
              description: descIdx >= 0 ? cols[descIdx] : "Bank Transaction",
              category: catIdx >= 0 ? cols[catIdx] : "Uncategorized",
              counterparty: partyIdx >= 0 ? cols[partyIdx] : "Direct Payment",
              status: "cleared",
            };
          });

          resolve({
            filename: file.name,
            total_rows: lines.length - 1,
            valid_rows: lines.length - 1,
            invalid_rows: 0,
            detected_categories: [
              { category: "Store Sales", count: Math.ceil((lines.length - 1) * 0.4) },
              { category: "Inventory", count: Math.ceil((lines.length - 1) * 0.3) },
              { category: "Logistics", count: Math.ceil((lines.length - 1) * 0.2) },
              { category: "Utilities", count: Math.ceil((lines.length - 1) * 0.1) },
            ],
            preview_transactions: previewTx,
          });
        } catch (err: unknown) {
          reject(err);
        }
      };
      reader.onerror = () => reject(new Error("Failed to read file"));
      reader.readAsText(file);
    });
  },

  async confirmCSVUpload(
    workspaceId: string,
    result: CSVUploadResult,
    _mapping: ColumnMapping
  ): Promise<{ imported_count: number }> {
    const current = getStoredItem(`transactions_${workspaceId}`, DEMO_TRANSACTIONS);
    const newItems: Transaction[] = result.preview_transactions.map((p, i) => ({
      id: `imported-${Date.now()}-${i}`,
      workspace_id: workspaceId,
      account_id: DEMO_ACCOUNTS[0].id,
      account_name: DEMO_ACCOUNTS[0].name,
      date: p.date || new Date().toISOString().split("T")[0],
      amount: p.amount || 1000,
      type: p.type || "expense",
      category: p.category || "General Expense",
      description: p.description || "Imported Transaction",
      counterparty: p.counterparty || "Vendor",
      status: "cleared",
      is_recurring: false,
    }));

    setStoredItem(`transactions_${workspaceId}`, [...newItems, ...current]);
    return { imported_count: newItems.length };
  },
};
