// web-admin/src/types/payments.ts
export type PaymentReportPeriod =
  | 'THIS_TERM'
  | 'THIS_MONTH'
  | 'THIS_YEAR'
  | 'CUSTOM';

export type PaymentMethod =
  | 'CASH'
  | 'CARD'
  | 'BANK_TRANSFER';

export type PaymentStatus =
  | 'PAID'
  | 'PENDING'
  | 'CANCELLED';

export type PaymentSession =
  | 'CUBS'
  | 'TIGERS'
  | 'UNKNOWN';

export type PaymentMethodStatistic = {
  method: PaymentMethod;
  revenue: number;
  count: number;
};

export type PaymentSessionStatistic = {
  session: PaymentSession;
  revenue: number;
  count: number;
};

export type PaymentTimelineItem = {
  date: string;
  revenue: number;
  count: number;
};

export type RecentPayment = {
  id: string;
  memberId: string;
  childName: string;
  guardianName: string;
  session: PaymentSession;
  amount: number;
  currency: string;
  paymentMethod: PaymentMethod;
  status: PaymentStatus;
  periodStart: string;
  periodEnd: string;
  recordedBy?: string;
  createdAt: string;
};

export type PaymentStatisticsResponse = {
  range: {
    label: string;
    from: string;
    to: string;
  };

  summary: {
    totalRevenue: number;
    paymentCount: number;
    averagePayment: number;
    paidCount: number;
    pendingCount: number;
    cancelledCount: number;
    activeMemberships: number;
    outstandingMembers: number;
  };

  byMethod: PaymentMethodStatistic[];
  bySession: PaymentSessionStatistic[];
  timeline: PaymentTimelineItem[];
  recentPayments: RecentPayment[];
};