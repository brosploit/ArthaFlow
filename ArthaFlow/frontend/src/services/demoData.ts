import {
  Workspace,
  Account,
  Transaction,
  Invoice,
  RecurringItem,
  DigitalTwin,
  CashForecast,
  ScenarioSimulation,
  RiskAlert,
  DecisionMemory,
  ChatMessage,
} from "../types";

export const DEMO_WORKSPACES: Workspace[] = [
  {
    id: "ws-aarav-retail",
    name: "Aarav Retail Enterprises",
    mode: "business",
    currency: "INR",
    currencySymbol: "₹",
    starting_cash: 120000,
    created_at: "2024-01-15T10:00:00Z",
    updated_at: "2024-10-31T18:00:00Z",
    isDemo: true,
  },
  {
    id: "ws-priya-consulting",
    name: "Priya Sharma (Individual / Tech)",
    mode: "individual",
    currency: "INR",
    currencySymbol: "₹",
    starting_cash: 245000,
    created_at: "2024-03-01T08:30:00Z",
    updated_at: "2024-10-31T18:00:00Z",
    isDemo: true,
  },
];

export const DEMO_ACCOUNTS: Account[] = [
  {
    id: "acc-hdfc-current",
    workspace_id: "ws-aarav-retail",
    name: "HDFC Primary Current A/c",
    type: "checking",
    institution: "HDFC Bank",
    account_number_mask: "•••• 4892",
    balance: 78400,
    currency: "INR",
    is_active: true,
    last_synced_at: new Date(Date.now() - 1000 * 60 * 4).toISOString(),
    status: "synced",
  },
  {
    id: "acc-icici-ops",
    workspace_id: "ws-aarav-retail",
    name: "ICICI Business Operations",
    type: "checking",
    institution: "ICICI Bank",
    account_number_mask: "•••• 8104",
    balance: 32600,
    currency: "INR",
    is_active: true,
    last_synced_at: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
    status: "synced",
  },
  {
    id: "acc-razorpay-clearing",
    workspace_id: "ws-aarav-retail",
    name: "Razorpay Gateway Settlement",
    type: "wallet",
    institution: "Razorpay",
    account_number_mask: "•••• RZPY",
    balance: 9000,
    currency: "INR",
    is_active: true,
    last_synced_at: new Date(Date.now() - 1000 * 60 * 2).toISOString(),
    status: "synced",
  },
];

export const DEMO_TRANSACTIONS: Transaction[] = [
  {
    id: "tx-101",
    workspace_id: "ws-aarav-retail",
    account_id: "acc-hdfc-current",
    account_name: "HDFC Primary Current A/c",
    date: "2024-10-31",
    amount: 32500,
    type: "income",
    category: "Store Sales",
    description: "Weekend Retail & POS Batch Clearance",
    counterparty: "Walk-in Retail Customers",
    status: "cleared",
    is_recurring: false,
    reference_no: "POS-2024-9842",
  },
  {
    id: "tx-102",
    workspace_id: "ws-aarav-retail",
    account_id: "acc-icici-ops",
    account_name: "ICICI Business Operations",
    date: "2024-10-30",
    amount: 14200,
    type: "expense",
    category: "Logistics",
    description: "Delhivery Surface Freight - North Zone",
    counterparty: "Delhivery Logistics Pvt Ltd",
    status: "cleared",
    is_recurring: true,
    reference_no: "INV-DLV-8941",
  },
  {
    id: "tx-103",
    workspace_id: "ws-aarav-retail",
    account_id: "acc-hdfc-current",
    account_name: "HDFC Primary Current A/c",
    date: "2024-10-29",
    amount: 45000,
    type: "income",
    category: "B2B Wholesale",
    description: "Settlement Invoice #INV-2024-041",
    counterparty: "FabIndia Franchise Outlet",
    status: "cleared",
    is_recurring: false,
    reference_no: "NEFT-HDFC-99120",
  },
  {
    id: "tx-104",
    workspace_id: "ws-aarav-retail",
    account_id: "acc-icici-ops",
    account_name: "ICICI Business Operations",
    date: "2024-10-28",
    amount: 22000,
    type: "expense",
    category: "Rent & Utilities",
    description: "Commercial Showroom Rent - Connaught Place",
    counterparty: "Sharma Estates Leasing",
    status: "cleared",
    is_recurring: true,
    reference_no: "RTGS-ICICI-1109",
  },
  {
    id: "tx-105",
    workspace_id: "ws-aarav-retail",
    account_id: "acc-hdfc-current",
    account_name: "HDFC Primary Current A/c",
    date: "2024-10-27",
    amount: 18500,
    type: "expense",
    category: "Raw Material",
    description: "Surat Cotton Mills - Fabric Lot Batch A",
    counterparty: "Surat Cotton Mills",
    status: "cleared",
    is_recurring: false,
    reference_no: "INV-SCM-4412",
  },
  {
    id: "tx-106",
    workspace_id: "ws-aarav-retail",
    account_id: "acc-hdfc-current",
    account_name: "HDFC Primary Current A/c",
    date: "2024-10-27",
    amount: 18500,
    type: "expense",
    category: "Raw Material",
    description: "Surat Cotton Mills - Duplicate Reference Flag",
    counterparty: "Surat Cotton Mills",
    status: "flagged",
    is_recurring: false,
    notes: "AI Anomaly: Identical amount and counterparty within 3 hours",
    reference_no: "INV-SCM-4412-B",
  },
  {
    id: "tx-107",
    workspace_id: "ws-aarav-retail",
    account_id: "acc-razorpay-clearing",
    account_name: "Razorpay Gateway Settlement",
    date: "2024-10-26",
    amount: 9000,
    type: "income",
    category: "E-Commerce",
    description: "Shopify Store Weekly Payout via Razorpay",
    counterparty: "Razorpay Technologies",
    status: "pending",
    is_recurring: true,
    reference_no: "RZPY-TR-8819",
  },
  {
    id: "tx-108",
    workspace_id: "ws-aarav-retail",
    account_id: "acc-icici-ops",
    account_name: "ICICI Business Operations",
    date: "2024-10-25",
    amount: 12500,
    type: "expense",
    category: "Packaging",
    description: "Eco-friendly Box Packaging & Labels",
    counterparty: "PackCraft Industries",
    status: "cleared",
    is_recurring: false,
    reference_no: "INV-PC-7782",
  },
];

export const DEMO_INVOICES: Invoice[] = [
  {
    id: "inv-rec-01",
    workspace_id: "ws-aarav-retail",
    invoice_number: "INV-2024-048",
    entity_name: "Heritage Silks Jaipur",
    type: "receivable",
    amount: 54000,
    issue_date: "2024-10-10",
    due_date: "2024-11-05",
    expected_payment_date: "2024-11-04",
    status: "pending",
    category: "Wholesale Apparel",
  },
  {
    id: "inv-rec-02",
    workspace_id: "ws-aarav-retail",
    invoice_number: "INV-2024-042",
    entity_name: "Kala Kendra Boutiques",
    type: "receivable",
    amount: 28500,
    issue_date: "2024-09-20",
    due_date: "2024-10-20",
    expected_payment_date: "2024-11-08",
    status: "overdue",
    category: "Consignment Stock",
    notes: "Overdue by 12 days. Counterparty promised clearing by Nov 8.",
  },
  {
    id: "inv-pay-01",
    workspace_id: "ws-aarav-retail",
    invoice_number: "BILL-2024-119",
    entity_name: "Ahmedabad Weaver Guild",
    type: "payable",
    amount: 35000,
    issue_date: "2024-10-18",
    due_date: "2024-11-12",
    expected_payment_date: "2024-11-10",
    status: "pending",
    category: "Raw Cotton Yarn",
  },
  {
    id: "inv-pay-02",
    workspace_id: "ws-aarav-retail",
    invoice_number: "BILL-2024-098",
    entity_name: "BlueDart Express Courier",
    type: "payable",
    amount: 8400,
    issue_date: "2024-10-22",
    due_date: "2024-11-02",
    expected_payment_date: "2024-11-02",
    status: "pending",
    category: "Logistics",
  },
];

export const DEMO_RECURRING: RecurringItem[] = [
  {
    id: "rec-01",
    workspace_id: "ws-aarav-retail",
    name: "Showroom Lease Rent",
    type: "expense",
    category: "Rent & Facilities",
    amount: 22000,
    frequency: "monthly",
    next_due_date: "2024-11-28",
    counterparty: "Sharma Estates",
    is_active: true,
  },
  {
    id: "rec-02",
    workspace_id: "ws-aarav-retail",
    name: "Staff Payroll (3 Associates)",
    type: "expense",
    category: "Payroll",
    amount: 45000,
    frequency: "monthly",
    next_due_date: "2024-11-05",
    counterparty: "Direct Bank Transfer",
    is_active: true,
  },
  {
    id: "rec-03",
    workspace_id: "ws-aarav-retail",
    name: "Shopify Store Recurring Sales",
    type: "income",
    category: "E-Commerce",
    amount: 38000,
    frequency: "monthly",
    next_due_date: "2024-11-15",
    counterparty: "Online Direct Sales",
    is_active: true,
  },
];

export const DEMO_DIGITAL_TWIN: DigitalTwin = {
  workspace_id: "ws-aarav-retail",
  as_of_date: "2024-10-31",
  total_available_cash: 120000,
  accounts_breakdown: [
    {
      account_id: "acc-hdfc-current",
      account_name: "HDFC Primary Current A/c",
      institution: "HDFC Bank",
      balance: 78400,
      share_percentage: 65.3,
    },
    {
      account_id: "acc-icici-ops",
      account_name: "ICICI Business Operations",
      institution: "ICICI Bank",
      balance: 32600,
      share_percentage: 27.2,
    },
    {
      account_id: "acc-razorpay-clearing",
      account_name: "Razorpay Gateway Settlement",
      institution: "Razorpay",
      balance: 9000,
      share_percentage: 7.5,
    },
  ],
  liquidity_runway_days: 72,
  monthly_burn_rate: 115000,
  monthly_run_rate: 142000,
  net_monthly_cash_flow: 27000,
  operating_buffer_months: 2.4,
  receivables: {
    total_pending: 82500,
    total_overdue: 28500,
    expected_next_30_days: 82500,
    count_pending: 2,
  },
  payables: {
    total_pending: 43400,
    total_overdue: 0,
    expected_next_30_days: 43400,
    count_pending: 2,
  },
  financial_health_score: 82,
  financial_vitality: "Stable",
  health_breakdown: {
    runway_score: 85,
    cash_buffer_score: 78,
    receivable_collection_score: 72,
    operating_margin_score: 89,
  },
};

export const DEMO_FORECAST_30D: CashForecast = {
  workspace_id: "ws-aarav-retail",
  days: 30,
  generated_at: "2024-10-31T20:00:00Z",
  starting_balance: 120000,
  ending_projected_balance: 148500,
  total_inflows: 184500,
  total_outflows: 156000,
  net_projected_change: 28500,
  lowest_projected_balance: 68200,
  lowest_balance_date: "2024-11-06",
  safety_buffer_threshold: 40000,
  shortage_detected: false,
  uncertainty_range_percentage: 8.5,
  assumptions: [
    "Confirmed invoice #INV-2024-048 (₹54k) cleared on Nov 4",
    "Staff Payroll (₹45k) deducted on Nov 5",
    "Overdue invoice #INV-2024-042 (₹28.5k) collected on Nov 8",
    "Ahmedabad Weaver bill (₹35k) settled on Nov 10",
    "Shopify e-commerce baseline inflows project at ₹8.5k weekly",
    "Store Lease Rent (₹22k) deducted on Nov 28",
  ],
  daily_forecasts: Array.from({ length: 30 }, (_, i) => {
    const day = i + 1;
    const date = new Date(2024, 10, day);
    const dateStr = date.toISOString().split("T")[0];
    const dayLabel = date.toLocaleDateString("en-IN", {
      month: "short",
      day: "numeric",
    });

    let inflows = 1200 + Math.round(Math.sin(day * 0.7) * 400);
    let outflows = 800 + Math.round(Math.cos(day * 0.5) * 300);
    const events: string[] = [];

    if (day === 2) {
      outflows += 8400;
      events.push("BlueDart courier bill (₹8.4k)");
    }
    if (day === 4) {
      inflows += 54000;
      events.push("Heritage Silks receivable (₹54k)");
    }
    if (day === 5) {
      outflows += 45000;
      events.push("Staff Monthly Payroll (₹45k)");
    }
    if (day === 8) {
      inflows += 28500;
      events.push("Overdue Kala Kendra clearance (₹28.5k)");
    }
    if (day === 10) {
      outflows += 35000;
      events.push("Ahmedabad Weaver bill (₹35k)");
    }
    if (day === 15) {
      inflows += 12000;
      events.push("Mid-month retail weekend payout");
    }
    if (day === 28) {
      outflows += 22000;
      events.push("Commercial Showroom Rent (₹22k)");
    }

    // Accumulate
    let base = 120000;
    if (day === 1) base = 120000;
    else if (day < 5) base = 120000 + 44000;
    else if (day < 8) base = 120000 + 44000 - 45000;
    else if (day < 11) base = 120000 + 72500 - 45000 - 35000;
    else base = 125000 + day * 800;

    const opening = base;
    const closing = opening + inflows - outflows;

    return {
      date: dateStr,
      day_label: dayLabel,
      opening_balance: opening,
      expected_inflows: inflows,
      expected_outflows: outflows,
      net_change: inflows - outflows,
      closing_balance: closing,
      confidence_low: Math.round(closing * 0.94),
      confidence_high: Math.round(closing * 1.06),
      scheduled_events: events.length > 0 ? events : undefined,
    };
  }),
};

export const DEMO_SCENARIO_SIMULATIONS: ScenarioSimulation[] = [
  {
    id: "scn-fabric-50k",
    workspace_id: "ws-aarav-retail",
    title: "Purchase ₹50,000 Seasonal Fabric Inventory for Diwali Peak",
    description:
      "Simulate purchasing 500m premium Chanderi fabric with 30% advance upfront and 70% net 30, targeting ₹1,15,000 retail sales uplift over 45 days.",
    scenario_type: "capex",
    parameters: {
      outflow_amount: 50000,
      upfront_percentage: 30,
      deferred_days: 30,
      expected_sales_uplift: 115000,
      uplift_realization_days: 45,
    },
    created_at: "2024-10-31T14:30:00Z",
    baseline_runway_days: 72,
    simulated_runway_days: 64,
    runway_delta_days: -8,
    baseline_ending_cash: 148500,
    simulated_ending_cash: 213500,
    net_impact: 65000,
    lowest_cash_dip: 53200,
    lowest_cash_date: "2024-11-06",
    break_even_day: 22,
    verdict: "SAFE",
    risk_level: "low",
    confidence_score: 88,
    rule_based_advice: [
      "The minimum cash balance remains at ₹53,200 on Nov 6, comfortably above the ₹40,000 safety threshold.",
      "Break-even is achieved on Day 22 as initial festive sales revenue materializes.",
      "Deferred 70% payment (₹35,000) falls on Day 30, by which time projected cash reserves will have rebounded to ₹1,42,000.",
      "Verdict: Approved for execution. Recommended payment structure: 30% advance, 70% Net 30.",
    ],
    trajectory_comparison: Array.from({ length: 30 }, (_, i) => {
      const day = i + 1;
      const date = new Date(2024, 10, day);
      const baseline = DEMO_FORECAST_30D.daily_forecasts[i]?.closing_balance || 120000;
      let simulated = baseline;

      // Upfront 30% on day 1
      if (day >= 1) simulated -= 15000;
      // Uplift gradually kicks in from day 8
      if (day >= 8) simulated += (day - 7) * 2800;
      // Deferred 70% on day 30
      if (day >= 30) simulated -= 35000;

      return {
        date: date.toISOString().split("T")[0],
        day_number: day,
        baseline_balance: baseline,
        simulated_balance: Math.round(simulated),
        variance: Math.round(simulated - baseline),
      };
    }),
  },
  {
    id: "scn-delayed-rec",
    workspace_id: "ws-aarav-retail",
    title: "Heritage Silks ₹54k Receivable Delayed by 25 Days",
    description:
      "Stress test liquidity if client delays payment of their largest pending invoice until late November.",
    scenario_type: "delayed_receivable",
    parameters: {
      affected_invoices_amount: 54000,
      delay_days: 25,
    },
    created_at: "2024-10-30T11:15:00Z",
    baseline_runway_days: 72,
    simulated_runway_days: 41,
    runway_delta_days: -31,
    baseline_ending_cash: 148500,
    simulated_ending_cash: 94500,
    net_impact: -54000,
    lowest_cash_dip: 28400,
    lowest_cash_date: "2024-11-10",
    break_even_day: 29,
    verdict: "CAUTION",
    risk_level: "medium",
    confidence_score: 92,
    rule_based_advice: [
      "Cash dips to ₹28,400 on Nov 10, breaching the ₹40,000 emergency buffer by ₹11,600.",
      "Payroll on Nov 5 (₹45k) and Weaver bill on Nov 10 (₹35k) coincide with the collection gap.",
      "Recommendation: Request a 40% partial payment (₹21,600) upfront from Heritage Silks or defer weaver settlement by 10 days.",
    ],
    trajectory_comparison: Array.from({ length: 30 }, (_, i) => {
      const day = i + 1;
      const date = new Date(2024, 10, day);
      const baseline = DEMO_FORECAST_30D.daily_forecasts[i]?.closing_balance || 120000;
      const simulated = day >= 4 && day < 29 ? baseline - 54000 : baseline;

      return {
        date: date.toISOString().split("T")[0],
        day_number: day,
        baseline_balance: baseline,
        simulated_balance: Math.round(simulated),
        variance: Math.round(simulated - baseline),
      };
    }),
  },
];

export const DEMO_RISK_ALERTS: RiskAlert[] = [
  {
    id: "risk-001",
    workspace_id: "ws-aarav-retail",
    category: "duplicate_payment",
    severity: "high",
    title: "Suspected Duplicate Supplier Charge: ₹18,500",
    description:
      "Two identical debit transactions of ₹18,500 posted to Surat Cotton Mills within 3 hours.",
    explanation:
      "Deterministic matching detected matching account, exact rupee amount (₹18,500), and identical counterparty name with distinct transaction reference numbers. This frequently indicates an accidental double submission.",
    financial_impact: 18500,
    detected_at: "2024-10-27T16:42:00Z",
    is_resolved: false,
    suggested_action:
      "Contact Surat Cotton Mills accounts team to verify whether Batch B was debited twice or represents an unbilled second lot.",
    related_entity: "Surat Cotton Mills",
    related_transactions: [
      {
        id: "tx-105",
        description: "Surat Cotton Mills - Fabric Lot Batch A",
        amount: 18500,
        date: "2024-10-27",
      },
      {
        id: "tx-106",
        description: "Surat Cotton Mills - Duplicate Reference Flag",
        amount: 18500,
        date: "2024-10-27",
      },
    ],
  },
  {
    id: "risk-002",
    workspace_id: "ws-aarav-retail",
    category: "overdue_receivable_concentration",
    severity: "medium",
    title: "Overdue Receivable Concentration: Kala Kendra (₹28,500)",
    description:
      "Consignment invoice #INV-2024-042 is 12 days overdue, representing 34.5% of total outstanding receivables.",
    explanation:
      "Receivable age exceeded 30-day payment terms. High counterparty concentration heightens cash-flow vulnerability ahead of Nov 5 payroll.",
    financial_impact: 28500,
    detected_at: "2024-10-29T09:00:00Z",
    is_resolved: false,
    suggested_action:
      "Send automated WhatsApp/Email reminder with direct UPI payment link to Kala Kendra accounts desk.",
    related_entity: "Kala Kendra Boutiques",
  },
  {
    id: "risk-003",
    workspace_id: "ws-aarav-retail",
    category: "cash_buffer_breach",
    severity: "low",
    title: "Mid-Month Buffer Squeeze Ahead of Payroll & Weaver Payables",
    description:
      "Upcoming commitments between Nov 5 and Nov 10 total ₹80,000 against current liquid buffer of ₹1,20,000.",
    explanation:
      "Without scheduled receivables clearing on time, the operating cash buffer dips into the warning threshold of ₹40,000.",
    financial_impact: 80000,
    detected_at: "2024-10-31T18:00:00Z",
    is_resolved: false,
    suggested_action:
      "Prioritize collection of Heritage Silks (₹54k) by Nov 4 to maintain an unencumbered ₹85k liquidity safety margin.",
  },
];

export const DEMO_DECISION_MEMORIES: DecisionMemory[] = [
  {
    id: "dec-01",
    workspace_id: "ws-aarav-retail",
    scenario_id: "scn-fabric-50k",
    decision_title: "Diwali Chanderi Fabric Inventory CapEx (₹50,000)",
    category: "Procurement / CapEx",
    hypothesis:
      "Procuring 500m of festival inventory on 30% advance terms will generate ₹1.15L in incremental sales without dropping cash below ₹50k.",
    assumptions: [
      "Vendor accepts 30% advance (₹15k) and 70% Net 30 (₹35k)",
      "Festive consumer demand delivers 2.3x return on fabric procurement",
      "Receivables from existing retail outlets clear without >5 day delays",
    ],
    expected_outcomes: [
      { metric: "Minimum Cash Dip", expected_value: "₹53,200", timeframe: "Day 6 (Nov 6)" },
      { metric: "Break-Even Window", expected_value: "22 Days", timeframe: "By Nov 22" },
      { metric: "Net Positive Margin", expected_value: "₹65,000", timeframe: "45 Days" },
    ],
    actual_outcomes: [
      {
        metric: "Advance Payment Disbursed",
        actual_value: "₹15,000 on Oct 31",
        evaluated_at: "2024-10-31",
        verdict: "met",
      },
      {
        metric: "First Week Festive Sales",
        actual_value: "₹38,200 (Projected: ₹32,000)",
        variance_percentage: 19.3,
        evaluated_at: "2024-11-07",
        verdict: "exceeded",
      },
    ],
    status: "active",
    decision_date: "2024-10-31",
    evaluation_date: "2024-11-30",
    notes:
      "Approved based on Scenario Lab verification. Monitored through AI Financial Agent for weekly delta checks.",
    created_at: "2024-10-31T15:00:00Z",
  },
  {
    id: "dec-02",
    workspace_id: "ws-aarav-retail",
    decision_title: "Transition Logistics from Bluedart to Delhivery Surface",
    category: "Operations / Cost Reduction",
    hypothesis:
      "Switching non-urgent B2B freight to Delhivery surface will save ₹7,500/month while maintaining 4-day delivery SLA.",
    assumptions: ["Monthly shipping volume stays above 120 parcels", "Damage rate remains under 0.5%"],
    expected_outcomes: [
      { metric: "Monthly Logistics Burn", expected_value: "₹14,500", timeframe: "Monthly" },
      { metric: "Cost Reduction", expected_value: "₹7,500/Mo", timeframe: "Q4 2024" },
    ],
    actual_outcomes: [
      {
        metric: "October Logistics Total",
        actual_value: "₹14,200",
        variance_percentage: 2.1,
        evaluated_at: "2024-10-30",
        verdict: "met",
      },
    ],
    status: "evaluated",
    decision_date: "2024-09-01",
    evaluation_date: "2024-10-30",
    notes: "Target achieved. Saving ₹7,800/mo on surface logistics with 98.4% on-time delivery.",
    created_at: "2024-09-01T10:00:00Z",
  },
];

export const DEMO_CHAT_MESSAGES: ChatMessage[] = [
  {
    id: "msg-1",
    session_id: "session-01",
    role: "user",
    content: "What is my current available cash and how long is my operating runway?",
    timestamp: "2024-10-31T16:00:00Z",
  },
  {
    id: "msg-2",
    session_id: "session-01",
    role: "assistant",
    content:
      "Based on verified real-time records from your accounts, you currently have **₹1,20,000** in total available cash. Your operating liquidity runway is estimated at **72 days** at your current net monthly burn rate.",
    timestamp: "2024-10-31T16:00:02Z",
    tool_calls_executed: [
      {
        tool_name: "get_digital_twin_metrics",
        arguments: { workspace_id: "ws-aarav-retail" },
        result_summary:
          "Total cash: ₹1,20,000 across 3 accounts (HDFC ₹78.4k, ICICI ₹32.6k, Razorpay ₹9k). Runway: 72 days.",
      },
    ],
    verified_figures: [
      { label: "Total Available Cash", value: "₹1,20,000", source: "Digital Twin Engine" },
      { label: "Liquid Runway", value: "72 Days", source: "Forecast Engine" },
      { label: "Monthly Gross Burn", value: "₹1,15,000", source: "Transaction Ledger" },
    ],
    suggested_followups: [
      "Can I afford to purchase ₹50,000 fabric inventory today?",
      "Show me upcoming payables for the next 14 days",
      "Explain the duplicate charge alert from Surat Cotton Mills",
    ],
  },
  {
    id: "msg-3",
    session_id: "session-01",
    role: "user",
    content: "Can I afford to purchase ₹50,000 fabric inventory today?",
    timestamp: "2024-10-31T16:02:00Z",
  },
  {
    id: "msg-4",
    session_id: "session-01",
    role: "assistant",
    content:
      "Yes, but **only with staggered vendor terms**. Here is what the What-If Simulation Engine calculates:\n\n1. **Upfront Payment**: If you pay 100% upfront (₹50,000), your cash will drop to **₹25,000** on Nov 5 when ₹45,000 staff payroll is debited, **breaching your ₹40,000 emergency safety reserve**.\n\n2. **Recommended Staggered Term (30% Advance / 70% Net 30)**:\n   - Immediate outflow: **₹15,000**\n   - Lowest projected balance: **₹53,200** on Nov 6 (comfortably safe)\n   - Expected festive sales uplift: **+₹1,15,000** over 45 days\n   - Projected break-even: **Day 22 (Nov 22)**\n   - Net impact: **+₹65,000 profit contribution**\n\nVerdict: **SAFE** provided you negotiate 30% advance and 70% Net 30.",
    timestamp: "2024-10-31T16:02:05Z",
    tool_calls_executed: [
      {
        tool_name: "run_what_if_simulation",
        arguments: {
          scenario_type: "capex",
          outflow_amount: 50000,
          upfront_percentage: 30,
          deferred_days: 30,
        },
        result_summary:
          "Verdict: SAFE with terms. Lowest cash dip: ₹53,200. Break-even: Day 22. Net impact: +₹65,000.",
      },
    ],
    verified_figures: [
      { label: "Safe Upfront Advance", value: "₹15,000 (30%)", source: "Scenario Lab Engine" },
      { label: "Lowest Cash Reserve", value: "₹53,200", source: "Cash Flow Engine" },
      { label: "Break-Even Day", value: "Day 22", source: "Simulation Trajectory" },
    ],
    suggested_followups: [
      "Save this decision to Decision Memory",
      "What if Heritage Silks delays their ₹54k payment?",
      "Download cash projection report for bank",
    ],
  },
];
