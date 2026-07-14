// web-admin/src/components/payments/PaidPaymentsTable.tsx

'use client';

import Link from 'next/link';
import {
  Banknote,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  Landmark,
  Loader2,
} from 'lucide-react';

import type {
  PaymentListItem,
  PaymentMethod,
} from '../../types/payments';

type PaidPaymentsTableProps = {
  payments: PaymentListItem[];
  loading: boolean;
  page: number;
  total: number;
  totalPages: number;
  onPageChange: (page: number) => void;
};

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
  if (!value) return '-';

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return '-';

  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  });
}

function paymentMethodLabel(method: PaymentMethod): string {
  if (method === 'BANK_TRANSFER') {
    return 'Bank transfer';
  }

  return method.charAt(0) + method.slice(1).toLowerCase();
}

function PaymentMethodBadge({
  method,
}: {
  method: PaymentMethod;
}) {
  const styles =
    method === 'CASH'
      ? 'bg-emerald-50 text-emerald-700'
      : method === 'CARD'
        ? 'bg-blue-50 text-blue-700'
        : 'bg-purple-50 text-purple-700';

  const icon =
    method === 'CASH' ? (
      <Banknote className="h-3.5 w-3.5" />
    ) : method === 'CARD' ? (
      <CreditCard className="h-3.5 w-3.5" />
    ) : (
      <Landmark className="h-3.5 w-3.5" />
    );

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ${styles}`}
    >
      {icon}
      {paymentMethodLabel(method)}
    </span>
  );
}

function getVisiblePages(
  currentPage: number,
  totalPages: number,
): Array<number | 'ellipsis'> {
  if (totalPages <= 7) {
    return Array.from(
      { length: totalPages },
      (_, index) => index + 1,
    );
  }

  if (currentPage <= 4) {
    return [1, 2, 3, 4, 5, 'ellipsis', totalPages];
  }

  if (currentPage >= totalPages - 3) {
    return [
      1,
      'ellipsis',
      totalPages - 4,
      totalPages - 3,
      totalPages - 2,
      totalPages - 1,
      totalPages,
    ];
  }

  return [
    1,
    'ellipsis',
    currentPage - 1,
    currentPage,
    currentPage + 1,
    'ellipsis',
    totalPages,
  ];
}

export function PaidPaymentsTable({
  payments,
  loading,
  page,
  total,
  totalPages,
  onPageChange,
}: PaidPaymentsTableProps) {
  const firstResult =
    total === 0 ? 0 : (page - 1) * 10 + 1;

  const lastResult = Math.min(page * 10, total);

  const visiblePages = getVisiblePages(page, totalPages);

  return (
    <section
      aria-labelledby="paid-payments-heading"
      className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-soft"
    >
      <div className="flex flex-col gap-2 border-b border-slate-100 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
        <div>
          <h2
            id="paid-payments-heading"
            className="text-sm font-semibold text-slate-900"
          >
            Paid members
          </h2>

          <p className="mt-1 text-xs text-slate-500">
            Most recently recorded payments appear first.
          </p>
        </div>

        <span className="w-fit rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
          {total} paid payment{total === 1 ? '' : 's'}
        </span>
      </div>

      {/* Mobile cards */}
      <div className="md:hidden">
        {loading ? (
          <LoadingRows />
        ) : payments.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="divide-y divide-slate-100">
            {payments.map((payment) => (
              <article
                key={payment._id}
                className="p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <Link
                      href={`/members/${payment.memberId}`}
                      className="block truncate text-sm font-semibold text-slate-900 hover:text-brand-700"
                    >
                      {payment.childName || 'Unknown member'}
                    </Link>

                    <p className="mt-1 text-xs text-slate-500">
                      Paid {formatDate(payment.createdAt)}
                    </p>
                  </div>

                  <p className="shrink-0 text-sm font-semibold text-slate-900">
                    {formatCurrency(
                      payment.amount,
                      payment.currency,
                    )}
                  </p>
                </div>

                <div className="mt-3">
                  <PaymentMethodBadge
                    method={payment.paymentMethod}
                  />
                </div>

                <div className="mt-3 rounded-xl bg-slate-50 px-3 py-2 text-xs text-slate-600">
                  <span className="font-medium">
                    Period covered:
                  </span>{' '}
                  {formatDate(payment.periodStart)} –{' '}
                  {formatDate(payment.periodEnd)}
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      {/* Desktop table */}
      <div className="hidden overflow-x-auto md:block">
        <table className="min-w-full text-sm">
          <caption className="sr-only">
            Paid member payments sorted by most recent payment
          </caption>

          <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th
                scope="col"
                className="px-4 py-3 text-left"
              >
                Member
              </th>

              <th
                scope="col"
                className="px-4 py-3 text-left"
              >
                Amount
              </th>

              <th
                scope="col"
                className="px-4 py-3 text-left"
              >
                Method
              </th>

              <th
                scope="col"
                className="px-4 py-3 text-left"
              >
                Payment date
              </th>

              <th
                scope="col"
                className="px-4 py-3 text-left"
              >
                Period covered
              </th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-12"
                >
                  <div className="flex items-center justify-center gap-2 text-sm text-slate-500">
                    <Loader2 className="h-5 w-5 animate-spin text-brand-600" />
                    Loading payments…
                  </div>
                </td>
              </tr>
            ) : payments.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-12 text-center text-sm text-slate-500"
                >
                  No paid payments were found for this period.
                </td>
              </tr>
            ) : (
              payments.map((payment) => (
                <tr
                  key={payment._id}
                  className="border-t border-slate-100 transition hover:bg-slate-50/70"
                >
                  <td className="px-4 py-4">
                    <Link
                      href={`/members/${payment.memberId}`}
                      className="font-medium text-slate-900 hover:text-brand-700"
                    >
                      {payment.childName || 'Unknown member'}
                    </Link>

                    {payment.guardianName && (
                      <p className="mt-1 text-xs text-slate-400">
                        Guardian: {payment.guardianName}
                      </p>
                    )}
                  </td>

                  <td className="whitespace-nowrap px-4 py-4 font-semibold text-slate-900">
                    {formatCurrency(
                      payment.amount,
                      payment.currency,
                    )}
                  </td>

                  <td className="px-4 py-4">
                    <PaymentMethodBadge
                      method={payment.paymentMethod}
                    />
                  </td>

                  <td className="whitespace-nowrap px-4 py-4 text-slate-600">
                    {formatDate(payment.createdAt)}
                  </td>

                  <td className="whitespace-nowrap px-4 py-4 text-slate-600">
                    {formatDate(payment.periodStart)}
                    <span className="mx-1 text-slate-300">
                      –
                    </span>
                    {formatDate(payment.periodEnd)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {!loading && total > 0 && (
        <nav
          aria-label="Paid member payment pages"
          className="flex flex-col gap-3 border-t border-slate-100 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5"
        >
          <p
            className="text-xs text-slate-500"
            aria-live="polite"
          >
            Showing {firstResult}–{lastResult} of {total}
          </p>

          <div className="flex items-center gap-1">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => onPageChange(page - 1)}
              aria-label="Go to previous page"
              className="inline-flex h-9 items-center justify-center gap-1 rounded-lg border border-slate-200 px-2.5 text-xs font-medium text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronLeft className="h-4 w-4" />
              <span className="hidden sm:inline">
                Previous
              </span>
            </button>

            <div className="flex items-center gap-1">
              {visiblePages.map((item, index) =>
                item === 'ellipsis' ? (
                  <span
                    key={`ellipsis-${index}`}
                    aria-hidden="true"
                    className="flex h-9 w-8 items-center justify-center text-xs text-slate-400"
                  >
                    …
                  </span>
                ) : (
                  <button
                    key={item}
                    type="button"
                    onClick={() => onPageChange(item)}
                    aria-label={`Go to page ${item}`}
                    aria-current={
                      item === page ? 'page' : undefined
                    }
                    className={`flex h-9 min-w-9 items-center justify-center rounded-lg px-2 text-xs font-semibold transition ${
                      item === page
                        ? 'bg-brand-600 text-white'
                        : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {item}
                  </button>
                ),
              )}
            </div>

            <button
              type="button"
              disabled={
                totalPages === 0 || page >= totalPages
              }
              onClick={() => onPageChange(page + 1)}
              aria-label="Go to next page"
              className="inline-flex h-9 items-center justify-center gap-1 rounded-lg border border-slate-200 px-2.5 text-xs font-medium text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <span className="hidden sm:inline">Next</span>
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </nav>
      )}
    </section>
  );
}

function LoadingRows() {
  return (
    <div className="flex items-center justify-center gap-2 px-4 py-12 text-sm text-slate-500">
      <Loader2 className="h-5 w-5 animate-spin text-brand-600" />
      Loading payments…
    </div>
  );
}

function EmptyState() {
  return (
    <div className="px-4 py-12 text-center">
      <p className="text-sm font-medium text-slate-700">
        No paid payments found
      </p>

      <p className="mt-1 text-xs text-slate-500">
        Try selecting another reporting period.
      </p>
    </div>
  );
}