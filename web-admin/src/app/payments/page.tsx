'use client';

import {
  FormEvent,
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  Banknote,
  CalendarDays,
  CheckCircle2,
  CreditCard,
  Landmark,
  Loader2,
  ReceiptText,
  RefreshCw,
  Users,
  WalletCards,
} from 'lucide-react';

import { Protected } from '../../components/Protected';
import { Shell } from '../../components/layout/Shell';
import { ApiError, apiFetch } from '../../lib/apiClient';
import type {
  PaymentMethod,
  PaymentReportPeriod,
  PaymentStatisticsResponse,
} from '../../types/payments';
import { PaymentCharts } from '../../components/payments/PaymentCharts';

const PERIOD_OPTIONS: Array<{
  value: PaymentReportPeriod;
  label: string;
}> = [
  {
    value: 'THIS_TERM',
    label: 'This term',
  },
  {
    value: 'THIS_MONTH',
    label: 'This month',
  },
  {
    value: 'THIS_YEAR',
    label: 'This year',
  },
  {
    value: 'CUSTOM',
    label: 'Custom range',
  },
];

const inputClassName =
  'w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500';

function getDefaultCustomRange() {
  const now = new Date();

  const start = new Date(
    now.getFullYear(),
    now.getMonth(),
    1,
  );

  const formatInputDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  };

  return {
    from: formatInputDate(start),
    to: formatInputDate(now),
  };
}

function formatCurrency(
  value: number,
  currency = 'GBP',
): string {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

function formatDate(value?: string): string {
  if (!value) {
    return '-';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return '-';
  }

  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function getErrorMessage(
  error: unknown,
  fallback: string,
): string {
  return error instanceof ApiError
    ? error.message
    : fallback;
}

export default function PaymentsPage() {
  const defaultCustomRange = useMemo(
    () => getDefaultCustomRange(),
    [],
  );

  const [period, setPeriod] =
    useState<PaymentReportPeriod>('THIS_TERM');

  const [customFrom, setCustomFrom] = useState(
    defaultCustomRange.from,
  );

  const [customTo, setCustomTo] = useState(
    defaultCustomRange.to,
  );

  const [appliedCustomFrom, setAppliedCustomFrom] = useState(
    defaultCustomRange.from,
  );

  const [appliedCustomTo, setAppliedCustomTo] = useState(
    defaultCustomRange.to,
  );

  const [statistics, setStatistics] =
    useState<PaymentStatisticsResponse | null>(null);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const buildQuery = useCallback(() => {
    const params = new URLSearchParams({
      period,
    });

    if (period === 'CUSTOM') {
      params.set('from', appliedCustomFrom);
      params.set('to', appliedCustomTo);
    }

    return params.toString();
  }, [appliedCustomFrom, appliedCustomTo, period]);

  const loadStatistics = useCallback(
    async (showRefreshState = false) => {
      if (
        period === 'CUSTOM' &&
        (!appliedCustomFrom || !appliedCustomTo)
      ) {
        return;
      }

      if (showRefreshState) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError(null);

      try {
        const query = buildQuery();

        const data =
          await apiFetch<PaymentStatisticsResponse>(
            `/payments/statistics?${query}`,
          );

        setStatistics(data);
      } catch (requestError) {
        setError(
          getErrorMessage(
            requestError,
            'Failed to load payment statistics',
          ),
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [
      appliedCustomFrom,
      appliedCustomTo,
      buildQuery,
      period,
    ],
  );

  useEffect(() => {
    void loadStatistics();
  }, [loadStatistics]);

  function handlePeriodChange(
    selectedPeriod: PaymentReportPeriod,
  ) {
    setPeriod(selectedPeriod);
  }

  function applyCustomRange(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();
    setError(null);

    if (!customFrom || !customTo) {
      setError('Select both a start date and an end date.');
      return;
    }

    if (new Date(customFrom) > new Date(customTo)) {
      setError(
        'The start date cannot be later than the end date.',
      );
      return;
    }

    setAppliedCustomFrom(customFrom);
    setAppliedCustomTo(customTo);
  }

  const methodStatistics = useMemo(() => {
    const values = new Map<
      PaymentMethod,
      {
        revenue: number;
        count: number;
      }
    >();

    statistics?.byMethod.forEach((item) => {
      values.set(item.method, {
        revenue: item.revenue,
        count: item.count,
      });
    });

    return {
      cash: values.get('CASH') ?? {
        revenue: 0,
        count: 0,
      },
      card: values.get('CARD') ?? {
        revenue: 0,
        count: 0,
      },
      bankTransfer: values.get('BANK_TRANSFER') ?? {
        revenue: 0,
        count: 0,
      },
    };
  }, [statistics]);

  return (
    <Protected roles={['ADMIN', 'SUPER_ADMIN']}>
      <Shell>
        <div className="space-y-5">
          <header className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-brand-600">
                Financial reporting
              </p>

              <h1 className="mt-1 text-2xl font-semibold text-slate-900">
                Payments &amp; Revenue
              </h1>

              <p className="mt-1 text-sm text-slate-500">
                Monitor revenue, payment activity and membership
                coverage.
              </p>
            </div>

            <button
              type="button"
              onClick={() => void loadStatistics(true)}
              disabled={loading || refreshing}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-soft transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <RefreshCw
                className={`h-4 w-4 ${
                  refreshing ? 'animate-spin' : ''
                }`}
              />

              Refresh
            </button>
          </header>

          <section className="rounded-2xl border border-slate-100 bg-white p-4 shadow-soft sm:p-5">
            <div className="flex items-center gap-2">
              <CalendarDays className="h-5 w-5 text-brand-600" />

              <div>
                <h2 className="text-sm font-semibold text-slate-900">
                  Reporting period
                </h2>

                <p className="text-xs text-slate-500">
                  All figures on this page use the selected period.
                </p>
              </div>
            </div>

            <fieldset className="mt-4">
              <legend className="sr-only">
                Select reporting period
              </legend>

              <div className="flex gap-2 overflow-x-auto pb-1 sm:flex-wrap">
                {PERIOD_OPTIONS.map((option) => {
                  const selected = period === option.value;

                  return (
                    <button
                      key={option.value}
                      type="button"
                      aria-pressed={selected}
                      onClick={() =>
                        handlePeriodChange(option.value)
                      }
                      className={`shrink-0 rounded-xl px-4 py-2.5 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 ${
                        selected
                          ? 'bg-brand-600 text-white shadow-soft'
                          : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                      }`}
                    >
                      {option.label}
                    </button>
                  );
                })}
              </div>
            </fieldset>

            {period === 'CUSTOM' && (
              <form
                onSubmit={applyCustomRange}
                className="mt-4 grid gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-4 sm:grid-cols-[1fr_1fr_auto] sm:items-end"
              >
                <div>
                  <label
                    htmlFor="payment-report-from"
                    className="mb-1.5 block text-xs font-semibold text-slate-500"
                  >
                    From
                  </label>

                  <input
                    id="payment-report-from"
                    type="date"
                    value={customFrom}
                    max={customTo || undefined}
                    onChange={(event) =>
                      setCustomFrom(event.target.value)
                    }
                    className={inputClassName}
                    required
                  />
                </div>

                <div>
                  <label
                    htmlFor="payment-report-to"
                    className="mb-1.5 block text-xs font-semibold text-slate-500"
                  >
                    To
                  </label>

                  <input
                    id="payment-report-to"
                    type="date"
                    value={customTo}
                    min={customFrom || undefined}
                    onChange={(event) =>
                      setCustomTo(event.target.value)
                    }
                    className={inputClassName}
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="inline-flex h-[42px] items-center justify-center rounded-xl bg-brand-600 px-4 text-sm font-medium text-white transition hover:bg-brand-700"
                >
                  Apply dates
                </button>
              </form>
            )}

            {statistics && (
              <div
                className="mt-4 flex flex-col gap-1 border-t border-slate-100 pt-4 text-sm sm:flex-row sm:items-center sm:justify-between"
                aria-live="polite"
              >
                <span className="font-medium text-slate-700">
                  {statistics.range.label}
                </span>

                <span className="text-slate-500">
                  {formatDate(statistics.range.from)} –{' '}
                  {formatDate(statistics.range.to)}
                </span>
              </div>
            )}
          </section>

          {error && (
            <div
              role="alert"
              className="flex flex-col gap-3 rounded-2xl border border-red-100 bg-red-50 p-4 text-sm text-red-700 sm:flex-row sm:items-center sm:justify-between"
            >
              <span>{error}</span>

              <button
                type="button"
                onClick={() => void loadStatistics(true)}
                className="rounded-xl border border-red-200 bg-white px-3 py-2 text-xs font-semibold text-red-700"
              >
                Try again
              </button>
            </div>
          )}

          {loading && !statistics ? (
            <LoadingState />
          ) : (
            <>
              <section aria-labelledby="revenue-summary-heading">
                <div className="mb-3">
                  <h2
                    id="revenue-summary-heading"
                    className="text-sm font-semibold text-slate-900"
                  >
                    Revenue summary
                  </h2>

                  <p className="mt-1 text-xs text-slate-500">
                    Overview for the currently selected reporting
                    period.
                  </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                  <SummaryCard
                    title="Total revenue"
                    value={formatCurrency(
                      statistics?.summary.totalRevenue ?? 0,
                    )}
                    description={`${
                      statistics?.summary.paidCount ?? 0
                    } paid transactions`}
                    icon={<Banknote className="h-5 w-5" />}
                    variant="success"
                  />

                  <SummaryCard
                    title="Payments recorded"
                    value={String(
                      statistics?.summary.paymentCount ?? 0,
                    )}
                    description={`${
                      statistics?.summary.pendingCount ?? 0
                    } pending · ${
                      statistics?.summary.cancelledCount ?? 0
                    } cancelled`}
                    icon={<ReceiptText className="h-5 w-5" />}
                  />

                  <SummaryCard
                    title="Average payment"
                    value={formatCurrency(
                      statistics?.summary.averagePayment ?? 0,
                    )}
                    description="Average of paid transactions"
                    icon={<WalletCards className="h-5 w-5" />}
                    variant="blue"
                  />

                  <SummaryCard
                    title="Paid members"
                    value={String(
                      statistics?.summary.activeMemberships ?? 0,
                    )}
                    description={`${
                      statistics?.summary.outstandingMembers ?? 0
                    } outstanding`}
                    icon={<Users className="h-5 w-5" />}
                    variant="purple"
                  />
                </div>
              </section>

              <section aria-labelledby="payment-method-heading">
                <div className="mb-3">
                  <h2
                    id="payment-method-heading"
                    className="text-sm font-semibold text-slate-900"
                  >
                    Revenue by payment method
                  </h2>

                  <p className="mt-1 text-xs text-slate-500">
                    Paid revenue divided between cash, card and bank
                    transfer.
                  </p>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  <PaymentMethodCard
                    label="Cash"
                    revenue={methodStatistics.cash.revenue}
                    count={methodStatistics.cash.count}
                    icon={<Banknote className="h-5 w-5" />}
                    variant="cash"
                  />

                  <PaymentMethodCard
                    label="Card"
                    revenue={methodStatistics.card.revenue}
                    count={methodStatistics.card.count}
                    icon={<CreditCard className="h-5 w-5" />}
                    variant="card"
                  />

                  <PaymentMethodCard
                    label="Bank transfer"
                    revenue={
                      methodStatistics.bankTransfer.revenue
                    }
                    count={methodStatistics.bankTransfer.count}
                    icon={<Landmark className="h-5 w-5" />}
                    variant="bank"
                  />
                </div>
              </section>

              {statistics && (
                <PaymentCharts statistics={statistics} />
              )}

              <section className="rounded-2xl border border-slate-100 bg-white p-4 shadow-soft sm:p-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h2 className="text-sm font-semibold text-slate-900">
                      Payment status
                    </h2>

                    <p className="mt-1 text-xs text-slate-500">
                      Transaction status totals for this period.
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <StatusItem
                      label="Paid"
                      value={statistics?.summary.paidCount ?? 0}
                      variant="paid"
                    />

                    <StatusItem
                      label="Pending"
                      value={
                        statistics?.summary.pendingCount ?? 0
                      }
                      variant="pending"
                    />

                    <StatusItem
                      label="Cancelled"
                      value={
                        statistics?.summary.cancelledCount ?? 0
                      }
                      variant="cancelled"
                    />
                  </div>
                </div>
              </section>
            </>
          )}
        </div>
      </Shell>
    </Protected>
  );
}

function SummaryCard({
  title,
  value,
  description,
  icon,
  variant = 'default',
}: {
  title: string;
  value: string;
  description: string;
  icon: ReactNode;
  variant?:
    | 'default'
    | 'success'
    | 'blue'
    | 'purple';
}) {
  const iconClass =
    variant === 'success'
      ? 'bg-emerald-50 text-emerald-700'
      : variant === 'blue'
        ? 'bg-blue-50 text-blue-700'
        : variant === 'purple'
          ? 'bg-purple-50 text-purple-700'
          : 'bg-slate-100 text-slate-600';

  return (
    <article className="rounded-2xl border border-slate-100 bg-white p-4 shadow-soft sm:p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-xs font-medium text-slate-500">
            {title}
          </p>

          <p className="mt-2 break-words text-2xl font-semibold text-slate-900">
            {value}
          </p>

          <p className="mt-1 text-xs leading-5 text-slate-500">
            {description}
          </p>
        </div>

        <div
          aria-hidden="true"
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${iconClass}`}
        >
          {icon}
        </div>
      </div>
    </article>
  );
}

function PaymentMethodCard({
  label,
  revenue,
  count,
  icon,
  variant,
}: {
  label: string;
  revenue: number;
  count: number;
  icon: ReactNode;
  variant: 'cash' | 'card' | 'bank';
}) {
  const iconClass =
    variant === 'cash'
      ? 'bg-emerald-50 text-emerald-700'
      : variant === 'card'
        ? 'bg-blue-50 text-blue-700'
        : 'bg-purple-50 text-purple-700';

  return (
    <article className="rounded-2xl border border-slate-100 bg-white p-4 shadow-soft sm:p-5">
      <div className="flex items-center gap-3">
        <div
          aria-hidden="true"
          className={`flex h-10 w-10 items-center justify-center rounded-xl ${iconClass}`}
        >
          {icon}
        </div>

        <div>
          <h3 className="text-sm font-semibold text-slate-900">
            {label}
          </h3>

          <p className="text-xs text-slate-500">
            {count} transaction{count === 1 ? '' : 's'}
          </p>
        </div>
      </div>

      <p className="mt-5 text-2xl font-semibold text-slate-900">
        {formatCurrency(revenue)}
      </p>
    </article>
  );
}

function StatusItem({
  label,
  value,
  variant,
}: {
  label: string;
  value: number;
  variant: 'paid' | 'pending' | 'cancelled';
}) {
  const className =
    variant === 'paid'
      ? 'border-emerald-100 bg-emerald-50 text-emerald-700'
      : variant === 'pending'
        ? 'border-amber-100 bg-amber-50 text-amber-700'
        : 'border-red-100 bg-red-50 text-red-700';

  return (
    <div
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold ${className}`}
    >
      {variant === 'paid' && (
        <CheckCircle2
          className="h-3.5 w-3.5"
          aria-hidden="true"
        />
      )}

      <span>{label}</span>
      <span>{value}</span>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="flex min-h-[320px] items-center justify-center rounded-2xl border border-slate-100 bg-white shadow-soft">
      <div className="text-center">
        <Loader2 className="mx-auto h-8 w-8 animate-spin text-brand-600" />

        <p className="mt-3 text-sm text-slate-500">
          Loading payment statistics…
        </p>
      </div>
    </div>
  );
}