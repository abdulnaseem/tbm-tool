// web-admin/src/components/payments/PaymentCharts.tsx

'use client';

import { ReactNode, useMemo } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import type {
  PaymentMethod,
  PaymentStatisticsResponse,
} from '../../types/payments';

type PaymentChartsProps = {
  statistics: PaymentStatisticsResponse;
};

const CHART_COLOURS = {
  brand: '#d99a00',
  cash: '#059669',
  card: '#2563eb',
  bankTransfer: '#7c3aed',
  cubs: '#f97316',
  tigers: '#2563eb',
  active: '#059669',
  outstanding: '#ef4444',
  grid: '#e2e8f0',
  muted: '#64748b',
};

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    maximumFractionDigits: 2,
  }).format(value);
}

function formatCompactCurrency(value: number): string {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(value);
}

function formatTimelineDate(value: string): string {
  if (/^\d{4}-\d{2}$/.test(value)) {
    const [year, month] = value.split('-').map(Number);

    return new Date(year, month - 1, 1).toLocaleDateString('en-GB', {
      month: 'short',
      year: 'numeric',
    });
  }

  const parts = value.split('-');

  if (parts.length === 3) {
    const [year, month, day] = parts.map(Number);

    return new Date(year, month - 1, day).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
    });
  }

  return value;
}

function paymentMethodLabel(method: PaymentMethod): string {
  if (method === 'BANK_TRANSFER') {
    return 'Bank transfer';
  }

  return method.charAt(0) + method.slice(1).toLowerCase();
}

function ChartCard({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-slate-100 bg-white p-4 shadow-soft sm:p-5">
      <div className="mb-5">
        <h2 className="text-sm font-semibold text-slate-900">
          {title}
        </h2>

        <p className="mt-1 text-xs leading-5 text-slate-500">
          {description}
        </p>
      </div>

      {children}
    </section>
  );
}

function EmptyChart({ message }: { message: string }) {
  return (
    <div className="flex h-[300px] items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50">
      <p className="px-4 text-center text-sm text-slate-500">
        {message}
      </p>
    </div>
  );
}

function RevenueTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{
    value?: number;
    payload?: {
      count?: number;
    };
  }>;
  label?: string;
}) {
  if (!active || !payload?.length) {
    return null;
  }

  const revenue = Number(payload[0]?.value ?? 0);
  const count = Number(payload[0]?.payload?.count ?? 0);

  return (
    <div className="rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-lg">
      <p className="text-xs font-semibold text-slate-900">
        {label}
      </p>

      <p className="mt-1 text-xs text-slate-600">
        Revenue: {formatCurrency(revenue)}
      </p>

      <p className="text-xs text-slate-600">
        {count} payment{count === 1 ? '' : 's'}
      </p>
    </div>
  );
}

function RevenueOverTimeChart({
  statistics,
}: PaymentChartsProps) {
  const data = useMemo(
    () =>
      statistics.timeline.map((item) => ({
        ...item,
        displayDate: formatTimelineDate(item.date),
      })),
    [statistics.timeline],
  );

  return (
    <ChartCard
      title="Revenue over time"
      description="Paid revenue recorded throughout the selected reporting period."
    >
      {data.length === 0 ? (
        <EmptyChart message="No paid revenue was recorded for this period." />
      ) : (
        <>
          <div
            className="h-[320px] w-full"
            role="img"
            aria-label="Line chart showing paid revenue over time"
          >
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={data}
                margin={{
                  top: 10,
                  right: 12,
                  left: 0,
                  bottom: 5,
                }}
              >
                <CartesianGrid
                  stroke={CHART_COLOURS.grid}
                  strokeDasharray="4 4"
                  vertical={false}
                />

                <XAxis
                  dataKey="displayDate"
                  tickLine={false}
                  axisLine={false}
                  tick={{
                    fill: CHART_COLOURS.muted,
                    fontSize: 12,
                  }}
                  minTickGap={24}
                />

                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tick={{
                    fill: CHART_COLOURS.muted,
                    fontSize: 12,
                  }}
                  tickFormatter={formatCompactCurrency}
                  width={68}
                />

                <Tooltip content={<RevenueTooltip />} />

                <Line
                  type="monotone"
                  dataKey="revenue"
                  name="Revenue"
                  stroke={CHART_COLOURS.brand}
                  strokeWidth={3}
                  dot={{
                    r: 4,
                    fill: CHART_COLOURS.brand,
                    strokeWidth: 2,
                  }}
                  activeDot={{
                    r: 6,
                  }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="sr-only">
            <table>
              <caption>Revenue over time</caption>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Revenue</th>
                  <th>Payments</th>
                </tr>
              </thead>
              <tbody>
                {data.map((item) => (
                  <tr key={item.date}>
                    <td>{item.displayDate}</td>
                    <td>{formatCurrency(item.revenue)}</td>
                    <td>{item.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </ChartCard>
  );
}

function PaymentMethodsChart({
  statistics,
}: PaymentChartsProps) {
  const colourMap: Record<PaymentMethod, string> = {
    CASH: CHART_COLOURS.cash,
    CARD: CHART_COLOURS.card,
    BANK_TRANSFER: CHART_COLOURS.bankTransfer,
  };

  const data = useMemo(
    () =>
      statistics.byMethod
        .filter((item) => item.revenue > 0 || item.count > 0)
        .map((item) => ({
          name: paymentMethodLabel(item.method),
          method: item.method,
          revenue: item.revenue,
          count: item.count,
          fill: colourMap[item.method],
        })),
    [statistics.byMethod],
  );

  const totalRevenue = data.reduce(
    (total, item) => total + item.revenue,
    0,
  );

  return (
    <ChartCard
      title="Payment methods"
      description="Share of paid revenue received by cash, card and bank transfer."
    >
      {data.length === 0 ? (
        <EmptyChart message="No payment-method data is available for this period." />
      ) : (
        <>
          <div
            className="relative h-[300px] w-full"
            role="img"
            aria-label="Donut chart showing revenue by payment method"
          >
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  dataKey="revenue"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={72}
                  outerRadius={105}
                  paddingAngle={3}
                  stroke="none"
                >
                  {data.map((entry) => (
                    <Cell
                      key={entry.method}
                      fill={entry.fill}
                    />
                  ))}
                </Pie>

                <Tooltip
                  formatter={(value, _name, item) => {
                    const count =
                      Number(item.payload?.count ?? 0);

                    return [
                      `${formatCurrency(Number(value))} · ${count} payment${
                        count === 1 ? '' : 's'
                      }`,
                      item.payload?.name,
                    ];
                  }}
                />
              </PieChart>
            </ResponsiveContainer>

            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 flex items-center justify-center"
            >
              <div className="text-center">
                <p className="text-xs font-medium text-slate-500">
                  Total
                </p>
                <p className="mt-1 text-xl font-semibold text-slate-900">
                  {formatCurrency(totalRevenue)}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-3 space-y-2">
            {data.map((item) => {
              const percentage =
                totalRevenue > 0
                  ? (item.revenue / totalRevenue) * 100
                  : 0;

              return (
                <div
                  key={item.method}
                  className="flex items-center justify-between gap-4 rounded-xl bg-slate-50 px-3 py-2.5"
                >
                  <div className="flex min-w-0 items-center gap-2">
                    <span
                      aria-hidden="true"
                      className="h-2.5 w-2.5 shrink-0 rounded-full"
                      style={{ backgroundColor: item.fill }}
                    />

                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-slate-800">
                        {item.name}
                      </p>

                      <p className="text-xs text-slate-500">
                        {item.count} payment
                        {item.count === 1 ? '' : 's'}
                      </p>
                    </div>
                  </div>

                  <div className="shrink-0 text-right">
                    <p className="text-sm font-semibold text-slate-900">
                      {formatCurrency(item.revenue)}
                    </p>

                    <p className="text-xs text-slate-500">
                      {percentage.toFixed(1)}%
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </ChartCard>
  );
}

function SessionRevenueChart({
  statistics,
}: PaymentChartsProps) {
  const sessionColours: Record<string, string> = {
    CUBS: CHART_COLOURS.cubs,
    TIGERS: CHART_COLOURS.tigers,
  };

  const data = useMemo(() => {
    const available = new Map(
      statistics.bySession.map((item) => [
        item.session,
        item,
      ]),
    );

    return ['CUBS', 'TIGERS'].map((session) => {
      const item = available.get(
        session as 'CUBS' | 'TIGERS',
      );

      return {
        session:
          session === 'CUBS' ? 'Cubs' : 'Tigers',
        rawSession: session,
        revenue: item?.revenue ?? 0,
        count: item?.count ?? 0,
        fill: sessionColours[session],
      };
    });
  }, [statistics.bySession]);

  const hasData = data.some(
    (item) => item.revenue > 0 || item.count > 0,
  );

  return (
    <ChartCard
      title="Cubs vs Tigers"
      description="Paid revenue and payment volume by programme session."
    >
      {!hasData ? (
        <EmptyChart message="No session revenue is available for this period." />
      ) : (
        <>
          <div
            className="h-[300px] w-full"
            role="img"
            aria-label="Bar chart comparing Cubs and Tigers revenue"
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data}
                margin={{
                  top: 10,
                  right: 12,
                  left: 0,
                  bottom: 5,
                }}
              >
                <CartesianGrid
                  stroke={CHART_COLOURS.grid}
                  strokeDasharray="4 4"
                  vertical={false}
                />

                <XAxis
                  dataKey="session"
                  tickLine={false}
                  axisLine={false}
                  tick={{
                    fill: CHART_COLOURS.muted,
                    fontSize: 12,
                  }}
                />

                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tick={{
                    fill: CHART_COLOURS.muted,
                    fontSize: 12,
                  }}
                  tickFormatter={formatCompactCurrency}
                  width={68}
                />

                <Tooltip
                  cursor={{
                    fill: '#f8fafc',
                  }}
                  formatter={(value, _name, item) => {
                    const count =
                      Number(item.payload?.count ?? 0);

                    return [
                      `${formatCurrency(Number(value))} · ${count} payment${
                        count === 1 ? '' : 's'
                      }`,
                      'Revenue',
                    ];
                  }}
                />

                <Bar
                  dataKey="revenue"
                  name="Revenue"
                  radius={[8, 8, 0, 0]}
                  maxBarSize={96}
                >
                  {data.map((entry) => (
                    <Cell
                      key={entry.rawSession}
                      fill={entry.fill}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-3">
            {data.map((item) => (
              <div
                key={item.rawSession}
                className="rounded-xl bg-slate-50 px-3 py-3"
              >
                <div className="flex items-center gap-2">
                  <span
                    aria-hidden="true"
                    className="h-2.5 w-2.5 rounded-full"
                    style={{
                      backgroundColor: item.fill,
                    }}
                  />

                  <p className="text-xs font-semibold text-slate-600">
                    {item.session}
                  </p>
                </div>

                <p className="mt-2 text-lg font-semibold text-slate-900">
                  {formatCurrency(item.revenue)}
                </p>

                <p className="mt-0.5 text-xs text-slate-500">
                  {item.count} payment
                  {item.count === 1 ? '' : 's'}
                </p>
              </div>
            ))}
          </div>
        </>
      )}
    </ChartCard>
  );
}

function MembershipStatusChart({
  statistics,
}: PaymentChartsProps) {
  const data = useMemo(
    () => [
      {
        name: 'Active memberships',
        value: statistics.summary.activeMemberships,
        fill: CHART_COLOURS.active,
      },
      {
        name: 'Outstanding members',
        value: statistics.summary.outstandingMembers,
        fill: CHART_COLOURS.outstanding,
      },
    ],
    [
      statistics.summary.activeMemberships,
      statistics.summary.outstandingMembers,
    ],
  );

  const totalMembers = data.reduce(
    (total, item) => total + item.value,
    0,
  );

  const activePercentage =
    totalMembers > 0
      ? (statistics.summary.activeMemberships /
          totalMembers) *
        100
      : 0;

  return (
    <ChartCard
      title="Membership payment status"
      description="Members with an active paid period compared with members currently outstanding."
    >
      {totalMembers === 0 ? (
        <EmptyChart message="No membership status data is available." />
      ) : (
        <>
          <div
            className="relative h-[300px] w-full"
            role="img"
            aria-label="Donut chart comparing active memberships and outstanding members"
          >
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={72}
                  outerRadius={105}
                  paddingAngle={3}
                  stroke="none"
                >
                  {data.map((entry) => (
                    <Cell
                      key={entry.name}
                      fill={entry.fill}
                    />
                  ))}
                </Pie>

                <Tooltip
                  formatter={(value, name) => [
                    `${Number(value)} member${
                      Number(value) === 1 ? '' : 's'
                    }`,
                    name,
                  ]}
                />
              </PieChart>
            </ResponsiveContainer>

            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 flex items-center justify-center"
            >
              <div className="text-center">
                <p className="text-2xl font-semibold text-slate-900">
                  {activePercentage.toFixed(0)}%
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  Active
                </p>
              </div>
            </div>
          </div>

          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {data.map((item) => {
              const percentage =
                totalMembers > 0
                  ? (item.value / totalMembers) * 100
                  : 0;

              return (
                <div
                  key={item.name}
                  className="rounded-xl bg-slate-50 px-3 py-3"
                >
                  <div className="flex items-center gap-2">
                    <span
                      aria-hidden="true"
                      className="h-2.5 w-2.5 rounded-full"
                      style={{
                        backgroundColor: item.fill,
                      }}
                    />

                    <p className="text-xs font-medium text-slate-600">
                      {item.name}
                    </p>
                  </div>

                  <p className="mt-2 text-lg font-semibold text-slate-900">
                    {item.value}
                  </p>

                  <p className="text-xs text-slate-500">
                    {percentage.toFixed(1)}% of members
                  </p>
                </div>
              );
            })}
          </div>
        </>
      )}
    </ChartCard>
  );
}

export function PaymentCharts({
  statistics,
}: PaymentChartsProps) {
  return (
    <section
      aria-label="Payment charts"
      className="space-y-4"
    >
      <RevenueOverTimeChart statistics={statistics} />

      <div className="grid gap-4 xl:grid-cols-2">
        <PaymentMethodsChart statistics={statistics} />
        <SessionRevenueChart statistics={statistics} />
      </div>

      <MembershipStatusChart statistics={statistics} />
    </section>
  );
}