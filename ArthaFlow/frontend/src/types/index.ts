export type WorkspaceMode = 'business' | 'individual';
export type CurrencyCode = 'INR' | 'USD' | 'EUR' | 'GBP';

export interface Workspace {
  id: string;
  name: string;
  mode: WorkspaceMode;
  currency: CurrencyCode;
  currencySymbol: string;
  starting_cash: number;
  created_at: string;
  updated_at: string;
  isDemo?: boolean;
}

export interface Account {
  id: string;
  workspace_id: string;
  name: string;
  type: 'checking' | 'savings' | 'credit' | 'wallet' | 'escrow';
  institution: string;
  account_number_mask: string;
  balance: number;
  currency: CurrencyCode;
  is_active: boolean;
  last_synced_at: string;
  status: 'synced' | 'syncing' | 'error';
}

export type TransactionType = 'income' | 'expense' | 'transfer';
export type TransactionStatus = 'cleared' | 'pending' | 'flagged';

export interface Transaction {
  id: string;
  workspace_id: string;
  account_id: string;
  account_name?: string;
  date: string;
  amount: number;
  type: TransactionType;
  category: string;
  description: string;
  counterparty: string;
  status: TransactionStatus;
  is_recurring: boolean;
  notes?: string;
  tags?: string[];
  reference_no?: string;
}

export interface Invoice {
  id: string;
  workspace_id: string;
  invoice_number: string;
  entity_name: string; // client or vendor
  type: 'receivable' | 'payable';
  amount: number;
  issue_date: string;
  due_date: string;
  expected_payment_date: string;
  status: 'paid' | 'pending' | 'overdue' | 'disputed';
  category?: string;
  notes?: string;
}

export interface RecurringItem {
  id: string;
  workspace_id: string;
  name: string;
  type: 'income' | 'expense';
  category: string;
  amount: number;
  frequency: 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'quarterly' | 'annual';
  next_due_date: string;
  counterparty: string;
  is_active: boolean;
}

export interface DigitalTwin {
  workspace_id: string;
  as_of_date: string;
  total_available_cash: number;
  accounts_breakdown: {
    account_id: string;
    account_name: string;
    institution: string;
    balance: number;
    share_percentage: number;
  }[];
  liquidity_runway_days: number;
  monthly_burn_rate: number;
  monthly_run_rate: number;
  net_monthly_cash_flow: number;
  operating_buffer_months: number;
  receivables: {
    total_pending: number;
    total_overdue: number;
    expected_next_30_days: number;
    count_pending: number;
  };
  payables: {
    total_pending: number;
    total_overdue: number;
    expected_next_30_days: number;
    count_pending: number;
  };
  financial_health_score: number; // 0 - 100
  financial_vitality: 'Critical' | 'Vulnerable' | 'Stable' | 'Robust' | 'Exceptional';
  health_breakdown: {
    runway_score: number;
    cash_buffer_score: number;
    receivable_collection_score: number;
    operating_margin_score: number;
  };
}

export interface DailyForecastItem {
  date: string;
  day_label: string;
  opening_balance: number;
  expected_inflows: number;
  expected_outflows: number;
  net_change: number;
  closing_balance: number;
  confidence_low: number;
  confidence_high: number;
  scheduled_events?: string[];
}

export interface CashForecast {
  workspace_id: string;
  days: 7 | 30;
  generated_at: string;
  starting_balance: number;
  ending_projected_balance: number;
  total_inflows: number;
  total_outflows: number;
  net_projected_change: number;
  lowest_projected_balance: number;
  lowest_balance_date: string;
  safety_buffer_threshold: number;
  shortage_detected: boolean;
  shortage_date?: string;
  assumptions: string[];
  uncertainty_range_percentage: number;
  daily_forecasts: DailyForecastItem[];
}

export type ScenarioType =
  | 'capex'
  | 'delayed_receivable'
  | 'revenue_shock'
  | 'expense_spike'
  | 'new_recurring_expense'
  | 'hiring_payroll';

export interface ScenarioParameters {
  outflow_amount?: number;
  upfront_percentage?: number;
  deferred_days?: number;
  expected_sales_uplift?: number;
  uplift_realization_days?: number;
  delay_days?: number;
  affected_invoices_amount?: number;
  revenue_reduction_percent?: number;
  duration_months?: number;
  monthly_cost?: number;
}

export interface ScenarioSimulation {
  id: string;
  workspace_id: string;
  title: string;
  description: string;
  scenario_type: ScenarioType;
  parameters: ScenarioParameters;
  created_at: string;
  baseline_runway_days: number;
  simulated_runway_days: number;
  runway_delta_days: number;
  baseline_ending_cash: number;
  simulated_ending_cash: number;
  net_impact: number;
  lowest_cash_dip: number;
  lowest_cash_date: string;
  break_even_day?: number;
  verdict: 'SAFE' | 'CAUTION' | 'HIGH_RISK';
  risk_level: 'low' | 'medium' | 'high' | 'critical';
  confidence_score: number;
  rule_based_advice: string[];
  trajectory_comparison: {
    date: string;
    day_number: number;
    baseline_balance: number;
    simulated_balance: number;
    variance: number;
  }[];
}

export type RiskSeverity = 'critical' | 'high' | 'medium' | 'low';
export type RiskCategory =
  | 'cash_buffer_breach'
  | 'duplicate_payment'
  | 'unusual_expense_spike'
  | 'overdue_receivable_concentration'
  | 'accelerated_burn_rate'
  | 'recurring_cost_creep';

export interface RiskAlert {
  id: string;
  workspace_id: string;
  category: RiskCategory;
  severity: RiskSeverity;
  title: string;
  description: string;
  explanation: string;
  financial_impact: number;
  detected_at: string;
  is_resolved: boolean;
  suggested_action: string;
  related_entity?: string;
  related_transactions?: {
    id: string;
    description: string;
    amount: number;
    date: string;
  }[];
}

export interface DecisionMemory {
  id: string;
  workspace_id: string;
  scenario_id?: string;
  decision_title: string;
  category: string;
  hypothesis: string;
  assumptions: string[];
  expected_outcomes: {
    metric: string;
    expected_value: number | string;
    timeframe: string;
  }[];
  actual_outcomes?: {
    metric: string;
    actual_value: number | string;
    variance_percentage?: number;
    evaluated_at: string;
    verdict: 'exceeded' | 'met' | 'missed' | 'pending';
  }[];
  status: 'active' | 'evaluated' | 'superseded' | 'abandoned';
  decision_date: string;
  evaluation_date: string;
  notes?: string;
  created_at: string;
}

export interface ChatMessage {
  id: string;
  session_id: string;
  role: 'user' | 'assistant' | 'tool';
  content: string;
  timestamp: string;
  tool_calls_executed?: {
    tool_name: string;
    arguments: Record<string, unknown>;
    result_summary: string;
  }[];
  verified_figures?: {
    label: string;
    value: string | number;
    source: string;
  }[];
  suggested_followups?: string[];
}

export interface ColumnMapping {
  date: string;
  amount: string;
  description: string;
  type?: string;
  category?: string;
  counterparty?: string;
}

export interface CSVUploadResult {
  filename: string;
  total_rows: number;
  valid_rows: number;
  invalid_rows: number;
  detected_categories: { category: string; count: number }[];
  preview_transactions: Partial<Transaction>[];
  validation_errors?: string[];
}
