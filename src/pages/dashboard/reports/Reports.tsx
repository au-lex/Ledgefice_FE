import React, { useState } from "react";
import {
  Chart,
  TrendUp,
  Receipt21,
  Building,
  Clock,
  TickCircle,
  DocumentDownload,
  Calendar,
  ArrowUp2,
  ArrowDown2,
  Minus,
  Warning2,
} from "iconsax-react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import Layout from "../../../layout/Layout";
import {
  useReportSummary,
  useSpendOverTime,
  useSpendByDept,
  useVolumeByType,
  type ReportRange,
} from "../../../api/hooks/useReports";



const APPROVAL_TURNAROUND = [
  { name: "< 1 hr", count: 12 },
  { name: "1–4 hrs", count: 28 },
  { name: "4–24 hrs", count: 19 },
  { name: "1–3 days", count: 8 },
  { name: "> 3 days", count: 3 },
];

const PIE_COLORS = ["#71717a", "#52525b", "#a1a1aa", "#3f3f46", "#d4d4d8", "#27272a"];

const TYPE_COLORS: Record<string, string> = {
  "Contractor Payment": "bg-blue-500/10 text-blue-400 border-blue-500/20",
  "Petty Cash": "bg-amber-500/10 text-amber-400 border-amber-500/20",
  "Site Materials": "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  "Equipment Hire": "bg-purple-500/10 text-purple-400 border-purple-500/20",
};

const BAR_COLORS: Record<string, string> = {
  "Contractor Payment": "bg-blue-500/40",
  "Petty Cash": "bg-amber-500/40",
  "Site Materials": "bg-emerald-500/40",
  "Equipment Hire": "bg-purple-500/40",
};

const RANGE_LABELS: Record<ReportRange, string> = {
  "7d": "Last 7 days",
  "30d": "Last 30 days",
  "90d": "Last 90 days",
  "12m": "Last 12 months",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmt(n: number) {
  if (n >= 1_000_000) return "₦" + (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000) return "₦" + (n / 1_000).toFixed(0) + "K";
  return "₦" + n.toLocaleString("en-NG");
}

function fmtFull(n: number) {
  return "₦" + n.toLocaleString("en-NG");
}

// ─── Custom Tooltips ──────────────────────────────────────────────────────────

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2.5 shadow-xl text-xs">
      <p className="text-zinc-400 mb-1.5 font-medium">{label}</p>
      {payload.map((p: any, i: number) => (
        <div key={i} className="flex items-center gap-2 text-zinc-200">
          <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: p.color }} />
          <span>{p.name}: </span>
          <span className="font-mono">{fmt(p.value)}</span>
        </div>
      ))}
    </div>
  );
}

function BarTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2.5 shadow-xl text-xs">
      <p className="text-zinc-400 mb-1 font-medium">{label}</p>
      <p className="text-zinc-200 font-mono">{payload[0]?.value} vouchers</p>
    </div>
  );
}

// ─── Stat Card ────────────────────────────────────────────────────────────────

function StatCard({
  icon,
  label,
  value,
  sub,
  delta,
  deltaDir,
  isLoading,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub: string;
  delta?: string;
  deltaDir?: "up" | "down" | "flat";
  isLoading?: boolean;
}) {
  return (
    <div className="bg-zinc-900/80 border border-zinc-800/80 rounded-xl p-4 sm:p-5 flex flex-col gap-3 sm:gap-4 shadow-sm min-w-0">
      <div className="flex items-start justify-between gap-2">
        <p className="text-xs text-zinc-400 font-medium truncate">{label}</p>
        <div className="p-1.5 bg-zinc-800 rounded-lg border border-zinc-700/60 text-zinc-400 flex-shrink-0">{icon}</div>
      </div>
      <div>
        <p className="text-xl sm:text-2xl font-semibold text-zinc-50 tracking-tight leading-none truncate">
          {isLoading ? "—" : value}
        </p>
        <div className="flex items-center gap-2 mt-2 flex-wrap">
          <p className="text-[11px] text-zinc-500">{sub}</p>
          {delta && !isLoading && (
            <div
              className={`flex items-center gap-0.5 text-[10px] font-semibold px-1.5 py-0.5 rounded-md border ${
                deltaDir === "up"
                  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                  : deltaDir === "down"
                  ? "bg-rose-500/10 text-rose-400 border-rose-500/20"
                  : "bg-zinc-800 text-zinc-400 border-zinc-700"
              }`}
            >
              {deltaDir === "up" && <ArrowUp2 size={10} color="currentColor" />}
              {deltaDir === "down" && <ArrowDown2 size={10} color="currentColor" />}
              {deltaDir === "flat" && <Minus size={10} color="currentColor" />}
              {delta}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Section Header ───────────────────────────────────────────────────────────

function SectionHeader({ icon, title, sub }: { icon: React.ReactNode; title: string; sub?: string }) {
  return (
    <div className="flex items-center gap-3 mb-5">
      <div className="p-1.5 bg-zinc-800 rounded-lg border border-zinc-700/60 text-zinc-400 flex-shrink-0">{icon}</div>
      <div className="min-w-0">
        <h2 className="text-sm font-semibold text-zinc-100">{title}</h2>
        {sub && <p className="text-[11px] text-zinc-500 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

function ChartErrorState({ message }: { message?: string }) {
  return (
    <div className="h-40 flex flex-col items-center justify-center text-center px-4">
      <Warning2 size={24} color="currentColor" className="text-rose-400 mb-2" />
      <p className="text-xs text-rose-400 font-medium">Failed to load data</p>
      {message && <p className="text-[11px] text-zinc-500 mt-1 break-words">{message}</p>}
    </div>
  );
}

function ChartSkeleton({ height = "h-40" }: { height?: string }) {
  return <div className={`${height} bg-zinc-800/30 rounded-lg animate-pulse`} />;
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function ReportsPage() {
  const [range, setRange] = useState<ReportRange>("30d");

  const {
    data: summary,
    isLoading: isSummaryLoading,
    isError: isSummaryError,
    error: summaryError,
  } = useReportSummary({ range });

  const {
    data: spendData = [],
    isLoading: isSpendLoading,
    isError: isSpendError,
    error: spendError,
  } = useSpendOverTime({ range });

  const {
    data: deptSpend = [],
    isLoading: isDeptLoading,
    isError: isDeptError,
    error: deptError,
  } = useSpendByDept();

  const {
    data: typeData = [],
    isLoading: isTypeLoading,
    isError: isTypeError,
    error: typeError,
  } = useVolumeByType({ range });

  const totalApproved = spendData.reduce((s, d) => s + d.approved, 0);
  const totalRejected = spendData.reduce((s, d) => s + d.rejected, 0);
  const totalDeptSpend = deptSpend.reduce((s, d) => s + d.value, 0);
  const maxTypeVal = typeData.length > 0 ? Math.max(...typeData.map((x) => x.value)) : 1;

  return (
    <Layout>
      <div className="min-h-screen bg-zinc-950 text-zinc-300 font-sans pb-16 sm:pb-20 selection:bg-zinc-800 selection:text-zinc-100">
        {/* Top Nav */}
        <div className="border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-md sticky top-0 z-10">
          <div className="px-4 sm:px-6 py-3 sm:py-0 sm:h-16 flex flex-col sm:flex-row sm:items-center justify-between gap-3 max-w-7xl mx-auto">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-zinc-900 rounded-lg border border-zinc-800/80 flex-shrink-0">
                <Chart size={18} color="currentColor" className="text-zinc-400" />
              </div>
              <h1 className="text-sm font-medium text-zinc-100">Reports & Analytics</h1>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {/* Date range pills */}
              <div className="flex items-center bg-zinc-900 border border-zinc-800 rounded-lg p-1 gap-1 overflow-x-auto">
                {(["7d", "30d", "90d", "12m"] as ReportRange[]).map((r) => (
                  <button
                    key={r}
                    onClick={() => setRange(r)}
                    className={`px-2.5 sm:px-3 py-1.5 rounded-md text-xs font-medium transition-all whitespace-nowrap ${
                      range === r ? "bg-zinc-700 text-zinc-100 shadow-sm" : "text-zinc-500 hover:text-zinc-300"
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
              <button className="flex items-center gap-1.5 bg-zinc-900 hover:bg-zinc-800 transition-all text-zinc-300 text-sm font-medium px-3 sm:px-4 py-2 rounded-lg border border-zinc-800 shadow-sm whitespace-nowrap">
                <DocumentDownload size={15} color="currentColor" />
                <span className="hidden sm:inline">Export</span>
              </button>
            </div>
          </div>
        </div>

        <div className="px-4 sm:px-6 py-6 sm:py-8 max-w-7xl mx-auto space-y-8 sm:space-y-10">
          {/* Range label */}
          <div className="flex items-center gap-2">
            <Calendar size={14} color="currentColor" className="text-zinc-500 flex-shrink-0" />
            <p className="text-xs text-zinc-500">{RANGE_LABELS[range]} · All departments</p>
          </div>

          {/* ── KPI Row ── */}
          {isSummaryError ? (
            <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-xl p-6">
              <ChartErrorState message={(summaryError as any)?.response?.data?.message || summaryError?.message} />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
              <StatCard
                icon={<Receipt21 size={15} color="currentColor" />}
                label="Total vouchers"
                value={(summary?.total_vouchers ?? 0).toString()}
                sub="Submitted in period"
                isLoading={isSummaryLoading}
              />
              <StatCard
                icon={<TrendUp size={15} color="currentColor" />}
                label="Total spend"
                value={fmt(summary?.total_spend ?? 0)}
                sub="Approved + pending"
                isLoading={isSummaryLoading}
              />
              <StatCard
                icon={<TickCircle size={15} color="currentColor" />}
                label="Approval rate"
                value={`${summary?.approval_rate ?? 0}%`}
                sub="Of submitted by value"
                isLoading={isSummaryLoading}
              />
              <StatCard
                icon={<Clock size={15} color="currentColor" />}
                label="Avg turnaround"
                value={summary?.avg_turnaround ?? "—"}
                sub="Median approval time"
                isLoading={isSummaryLoading}
              />
            </div>
          )}

          {/* ── Spend Over Time ── */}
          <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-xl p-4 sm:p-6">
            <SectionHeader
              icon={<TrendUp size={15} color="currentColor" />}
              title="Spend over time"
              sub={`Approved vs. rejected value · ${RANGE_LABELS[range]}`}
            />
            {isSpendError ? (
              <ChartErrorState message={(spendError as any)?.response?.data?.message || spendError?.message} />
            ) : isSpendLoading ? (
              <ChartSkeleton height="h-48 sm:h-56" />
            ) : (
              <>
                <div className="h-48 sm:h-56 -ml-2 sm:ml-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={spendData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="approvedGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#71717a" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#71717a" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="rejectedGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.2} />
                          <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                      <XAxis dataKey="label" tick={{ fill: "#52525b", fontSize: 10 }} axisLine={false} tickLine={false} />
                      <YAxis
                        tickFormatter={(v) => fmt(v)}
                        tick={{ fill: "#52525b", fontSize: 10 }}
                        axisLine={false}
                        tickLine={false}
                        width={48}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Area
                        type="monotone"
                        dataKey="approved"
                        name="Approved"
                        stroke="#a1a1aa"
                        strokeWidth={2}
                        fill="url(#approvedGrad)"
                        dot={false}
                        activeDot={{ r: 4, fill: "#a1a1aa" }}
                      />
                      <Area
                        type="monotone"
                        dataKey="rejected"
                        name="Rejected"
                        stroke="#f43f5e"
                        strokeWidth={1.5}
                        strokeDasharray="4 2"
                        fill="url(#rejectedGrad)"
                        dot={false}
                        activeDot={{ r: 3, fill: "#f43f5e" }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
                {/* Legend */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-5 mt-4 pt-4 border-t border-zinc-800/60">
                  <div className="flex items-center gap-4 sm:gap-5">
                    <div className="flex items-center gap-2 text-xs text-zinc-400">
                      <div className="w-6 h-0.5 bg-zinc-400 rounded" />
                      Approved
                    </div>
                    <div className="flex items-center gap-2 text-xs text-zinc-400">
                      <div
                        className="w-6 h-0.5 bg-rose-500 rounded border-dashed"
                        style={{ borderTop: "1.5px dashed #f43f5e", background: "none" }}
                      />
                      Rejected
                    </div>
                  </div>
                  <div className="sm:ml-auto flex items-center gap-4 text-xs flex-wrap">
                    <div>
                      <span className="text-zinc-500">Total approved: </span>
                      <span className="text-zinc-200 font-mono font-medium">{fmt(totalApproved)}</span>
                    </div>
                    <div>
                      <span className="text-zinc-500">Total rejected: </span>
                      <span className="text-rose-400 font-mono font-medium">{fmt(totalRejected)}</span>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* ── Dept Spend + Turnaround ── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6">
            {/* Spend by dept */}
            <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-xl p-4 sm:p-6">
              <SectionHeader icon={<Building size={15} color="currentColor" />} title="Spend by department" sub="Approved value, all-time" />
              {isDeptError ? (
                <ChartErrorState message={(deptError as any)?.response?.data?.message || deptError?.message} />
              ) : isDeptLoading ? (
                <ChartSkeleton />
              ) : deptSpend.length === 0 ? (
                <div className="h-40 flex items-center justify-center text-xs text-zinc-500 text-center px-4">
                  No department spend recorded yet.
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <div className="h-36 w-36 sm:h-40 sm:w-40 flex-shrink-0">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={deptSpend} cx="50%" cy="50%" innerRadius={38} outerRadius={62} paddingAngle={3} dataKey="value">
                          {deptSpend.map((_entry, i) => (
                            <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} stroke="transparent" />
                          ))}
                        </Pie>
                        <Tooltip
                          content={({ active, payload }) => {
                            if (!active || !payload?.length) return null;
                            return (
                              <div className="bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-xs shadow-xl">
                                <p className="text-zinc-200">{payload[0].name}</p>
                                <p className="text-zinc-400 font-mono">{fmtFull(payload[0].value as number)}</p>
                              </div>
                            );
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex-1 w-full space-y-2.5 min-w-0">
                    {deptSpend.map((d, i) => {
                      const pct = totalDeptSpend > 0 ? ((d.value / totalDeptSpend) * 100).toFixed(1) : "0.0";
                      return (
                        <div key={i} className="flex items-center gap-2.5">
                          <div
                            className="w-2 h-2 rounded-full flex-shrink-0"
                            style={{ background: PIE_COLORS[i % PIE_COLORS.length] }}
                          />
                          <span className="text-xs text-zinc-400 flex-1 truncate min-w-0">{d.name}</span>
                          <span className="text-[10px] font-mono text-zinc-500 flex-shrink-0">{pct}%</span>
                          <span className="text-[11px] font-mono text-zinc-300 w-14 text-right flex-shrink-0">{fmt(d.value)}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Approval turnaround (static — no endpoint yet) */}
            <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-xl p-4 sm:p-6">
              <SectionHeader icon={<Clock size={15} color="currentColor" />} title="Approval turnaround" sub="How quickly vouchers get resolved" />
              <div className="h-40 -ml-2 sm:ml-0">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={APPROVAL_TURNAROUND} margin={{ top: 4, right: 4, left: -10, bottom: 0 }} barSize={20}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                    <XAxis dataKey="name" tick={{ fill: "#52525b", fontSize: 9 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: "#52525b", fontSize: 10 }} axisLine={false} tickLine={false} />
                    <Tooltip content={<BarTooltip />} cursor={{ fill: "#27272a" }} />
                    <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                      {APPROVAL_TURNAROUND.map((_entry, i) => (
                        <Cell key={i} fill={i === 0 ? "#a1a1aa" : i === 1 ? "#71717a" : i === 2 ? "#52525b" : "#3f3f46"} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-3 pt-3 border-t border-zinc-800/60 flex items-center justify-between text-xs gap-2">
                <span className="text-zinc-500">Median time to full approval</span>
                <span className="text-zinc-200 font-mono font-medium flex-shrink-0">{summary?.avg_turnaround ?? "—"}</span>
              </div>
            </div>
          </div>

          {/* ── Voucher Type Breakdown ── */}
          <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-xl p-4 sm:p-6">
            <SectionHeader
              icon={<Receipt21 size={15} color="currentColor" />}
              title="Volume by voucher type"
              sub={`Count and total value · ${RANGE_LABELS[range]}`}
            />
            {isTypeError ? (
              <ChartErrorState message={(typeError as any)?.response?.data?.message || typeError?.message} />
            ) : isTypeLoading ? (
              <ChartSkeleton />
            ) : typeData.length === 0 ? (
              <div className="h-40 flex items-center justify-center text-xs text-zinc-500 text-center px-4">
                No vouchers recorded for this period.
              </div>
            ) : (
              <div className="space-y-3">
                {[...typeData]
                  .sort((a, b) => b.value - a.value)
                  .map((t, i) => {
                    const pct = maxTypeVal > 0 ? (t.value / maxTypeVal) * 100 : 0;
                    return (
                      <div
                        key={i}
                        className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 py-3 border-b border-zinc-800/40 last:border-0"
                      >
                        <div className="flex items-center justify-between sm:contents">
                          <span
                            className={`text-[10px] font-medium px-2 py-1 border rounded-md flex-shrink-0 ${
                              TYPE_COLORS[t.name] ?? "bg-zinc-800 text-zinc-400 border-zinc-700"
                            }`}
                          >
                            {t.name}
                          </span>
                          <span className="text-[11px] text-zinc-600 sm:hidden flex-shrink-0">{t.count} vouchers</span>
                        </div>
                        <div className="flex-1 h-1.5 bg-zinc-800 rounded-full overflow-hidden min-w-0">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${BAR_COLORS[t.name] ?? "bg-zinc-500/40"}`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <div className="flex items-center justify-between sm:contents">
                          <span className="text-xs font-mono text-zinc-400 sm:w-16 text-right flex-shrink-0">{fmt(t.value)}</span>
                          <span className="text-[11px] text-zinc-600 w-16 text-right flex-shrink-0 hidden sm:inline">
                            {t.count} vouchers
                          </span>
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}