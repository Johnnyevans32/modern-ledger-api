export interface CashFlowStatement {
  period: {
    from: string;
    to: string;
    companyId: number;
  };
  activities: {
    [key: string]: {
      cashInflows: number;
      cashOutflows: number;
      netChange: number;
    };
  };
  summary: {
    totalCashInflows: number;
    totalCashOutflows: number;
    netChangeInCash: number;
    closingCashBalance: number;
  };
}

export interface ReconciliationItem {
  id: number;
  date: Date;
  account: string;
  debit: number;
  credit: number;
  netAmount: number;
  party?: string;
  note?: string;
  reference?: string;
}

export interface BankReconciliation {
  companyId: number;
  bankAccount: string;
  reconciliationDate: string;
  balances: {
    ledgerBalance: number;
    bankStatementBalance: number;
    adjustedBankBalance: number;
  };
  reconcilingItems: {
    totalUnreconciledItems: number;
    outstandingDeposits: number;
    outstandingWithdrawals: number;
    items: ReconciliationItem[];
  };
  reconciliationDifference: number;
  isReconciled: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: string;
}
