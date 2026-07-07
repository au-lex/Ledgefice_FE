import React, { useMemo, useState } from "react";
import {
  Activity,
  SearchNormal1,
  DocumentDownload,
  Profile2User,
  Receipt21,
  Building,
  Hierarchy,
  SecuritySafe,
  Trash,
  Login,
  Edit2,
  TickCircle,
  CloseSquare,
  Filter,
} from "iconsax-react";
import Layout from "../../../layout/Layout";
import {
  useListAuditLogs,
  type AuditAction,
  type AuditModule,
  type AuditLog,
} from "../../../api/hooks/useAuditLogs";

// ─── Helpers & Config ─────────────────────────────────────────────────────────

function formatDateTime(isoString: string) {
  const d = new Date(isoString);
  return d.toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

const MODULE_META: Record<AuditModule, { icon: React.ReactNode }> = {
  Users: { icon: <Profile2User size={14} color="currentColor" /> },
  Vouchers: { icon: <Receipt21 size={14} color="currentColor" /> },
  Departments: { icon: <Building size={14} color="currentColor" /> },
  Workflows: { icon: <Hierarchy size={14} color="currentColor" /> },
  System: { icon: <SecuritySafe size={14} color="currentColor" /> },
};

const ACTION_META: Record<
  AuditAction,
  { label: string; icon: React.ReactNode; isAlert?: boolean }
> = {
  CREATE: { label: "Created", icon: <Edit2 size={12} color="currentColor" /> },
  UPDATE: { label: "Updated", icon: <Edit2 size={12} color="currentColor" /> },
  DELETE: {
    label: "Deleted",
    icon: <Trash size={12} color="currentColor" />,
    isAlert: true,
  },
  APPROVE: {
    label: "Approved",
    icon: <TickCircle size={12} color="currentColor" />,
  },
  REJECT: {
    label: "Rejected",
    icon: <CloseSquare size={12} color="currentColor" />,
    isAlert: true,
  },
  AUTH_SUCCESS: {
    label: "Logged In",
    icon: <Login size={12} color="currentColor" />,
  },
  AUTH_FAILURE: {
    label: "Auth Failed",
    icon: <SecuritySafe size={12} color="currentColor" />,
    isAlert: true,
  },
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  sub,
  alert,
}: {
  label: string;
  value: string | number;
  sub: string;
  alert?: boolean;
}) {
  return (
    <div
      className={`bg-white bg-pri border rounded-xl p-5 flex flex-col justify-between shadow-sm transition-colors ${alert
        ? "border-red-500/30 bg-red-500/5"
        : "border-gray-200 border-zinc-800/80"
        }`}
    >
      <p
        className={`text-xs font-medium mb-3 ${alert ? "text-red-500" : "text-gray-500 text-zinc-400"
          }`}
      >
        {label}
      </p>
      <p
        className={`text-2xl font-medium tracking-tight ${alert ? "text-red-600 text-red-400" : "text-gray-900 text-zinc-50"
          }`}
      >
        {value}
      </p>
      <p
        className={`text-[11px] mt-2 ${alert ? "text-red-500/70" : "text-gray-400 text-zinc-500"
          }`}
      >
        {sub}
      </p>
    </div>
  );
}

function ActionBadge({ action }: { action: AuditAction }) {
  const meta = ACTION_META[action];

  if (meta.isAlert) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md border border-red-200 border-red-500/20 bg-red-50 bg-red-500/10 text-[10px] font-medium text-red-600 text-red-400 uppercase tracking-widest">
        {meta.icon}
        {meta.label}
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md border border-gray-200 border-zinc-700 bg-gray-100 bg-zinc-800 text-[10px] font-medium text-gray-700 text-zinc-300 uppercase tracking-widest">
      {meta.icon}
      {meta.label}
    </span>
  );
}

function LogRow({ log }: { log: AuditLog }) {
  const moduleMeta = MODULE_META[log.module];
  const formatted = formatDateTime(log.created_at).split(", ");
  const actorName = log.actor?.name || log.actor_name || "Unknown";

  return (
    <div className="p-4 sm:px-6 hover:bg-gray-50 hover:bg-zinc-800/40 transition-colors flex flex-col lg:flex-row lg:items-center gap-4 lg:gap-8">
      {/* Left: Time & Module Icon */}
      <div className="flex items-center gap-4 lg:w-48 flex-shrink-0">
        <div className="w-8 h-8 rounded bg-gray-100 bg-zinc-800 flex items-center justify-center text-gray-500 text-zinc-400 border border-gray-200 border-zinc-700 shadow-sm flex-shrink-0">
          {moduleMeta?.icon}
        </div>
        <div>
          <p className="text-xs font-medium text-gray-900 text-zinc-200 whitespace-nowrap">
            {formatted[0]}
          </p>
          <p className="text-[10px] text-zinc-500 font-mono mt-0.5">
            {formatted[1]}
          </p>
        </div>
      </div>

      {/* Middle: Action, Actor & Description */}
      <div className="flex-1 min-w-0 flex flex-col justify-center">
        <div className="flex items-center gap-2 mb-1.5 flex-wrap">
          <ActionBadge action={log.action} />
          <span className="text-[11px] font-mono text-gray-500 text-zinc-400 bg-gray-100 bg-zinc-900 px-1.5 py-0.5 rounded border border-gray-200 border-zinc-800">
            {log.resource_id}
          </span>
          <span className="text-xs text-gray-400 text-zinc-500 hidden sm:inline">
            •
          </span>
          <span className="text-xs font-semibold text-gray-800 text-zinc-200 truncate">
            {actorName}
          </span>
        </div>
        <p className="text-sm text-gray-600 text-zinc-300 leading-relaxed line-clamp-2">
          {log.description}
        </p>
      </div>

      {/* Right: Technical Metadata (IP / Device) */}
      <div className="lg:w-48 flex-shrink-0 flex flex-row lg:flex-col gap-4 lg:gap-1 text-left lg:text-right border-t border-gray-100 border-zinc-800 lg:border-t-0 pt-3 lg:pt-0 mt-2 lg:mt-0">
        <div className="flex-1 lg:flex-none">
          <p className="text-[9px] font-medium text-gray-400 text-zinc-500 uppercase tracking-widest mb-0.5">
            IP Address
          </p>
          <p className="text-[11px] text-gray-700 text-zinc-300 font-mono">
            {log.ip_address}
          </p>
        </div>
        <div className="flex-1 lg:flex-none">
          <p className="text-[9px] font-medium text-gray-400 text-zinc-500 uppercase tracking-widest mb-0.5">
            Client Device
          </p>
          <p
            className="text-[11px] text-gray-600 text-zinc-400 truncate"
            title={log.user_agent}
          >
            {log.user_agent}
          </p>
        </div>
      </div>
    </div>
  );
}

function SkeletonRow() {
  return (
    <div className="p-4 sm:px-6 flex flex-col lg:flex-row lg:items-center gap-4 lg:gap-8 animate-pulse">
      <div className="flex items-center gap-4 lg:w-48 flex-shrink-0">
        <div className="w-8 h-8 rounded bg-gray-200 bg-zinc-800" />
        <div className="space-y-1.5">
          <div className="h-3 w-20 bg-gray-200 bg-zinc-800 rounded" />
          <div className="h-2.5 w-16 bg-gray-200 bg-zinc-800 rounded" />
        </div>
      </div>
      <div className="flex-1 min-w-0 space-y-2">
        <div className="h-4 w-32 bg-gray-200 bg-zinc-800 rounded" />
        <div className="h-3 w-3/4 bg-gray-200 bg-zinc-800 rounded" />
      </div>
      <div className="lg:w-48 flex-shrink-0 space-y-2">
        <div className="h-2.5 w-24 bg-gray-200 bg-zinc-800 rounded" />
        <div className="h-2.5 w-20 bg-gray-200 bg-zinc-800 rounded" />
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function AuditLogPage() {
  const [search, setSearch] = useState("");
  const [moduleFilter, setModuleFilter] = useState<AuditModule | "all">("all");
  const [actionFilter, setActionFilter] = useState<AuditAction | "all">("all");
  const [page, setPage] = useState(1);
  const limit = 20;

  const filters = useMemo(
    () => ({
      search: search || undefined,
      module: moduleFilter === "all" ? undefined : moduleFilter,
      action: actionFilter === "all" ? undefined : actionFilter,
      page,
      limit,
    }),
    [search, moduleFilter, actionFilter, page]
  );

  const { data, isLoading, isError, error, isFetching } = useListAuditLogs(filters);

  const logs = data?.data ?? [];
  const meta = data?.meta;

  // KPIs derived from the current page of results
  const criticalEvents = logs.filter((l) => ACTION_META[l.action]?.isAlert).length;
  const today = new Date().toISOString().slice(0, 10);
  const todaysEvents = logs.filter((l) => l.created_at.startsWith(today)).length;

  function resetToFirstPage<T>(setter: (v: T) => void) {
    return (v: T) => {
      setter(v);
      setPage(1);
    };
  }

  return (
    <Layout>
      <div className="min-h-screen bg-pri text-gray-900 text-zinc-300 font-sans pb-16 selection:bg-gray-200 selection:text-gray-900 selection:bg-zinc-800 selection:text-zinc-100">
        {/* Top Nav */}
        <div className="border-b border-gray-200 border-zinc-800/80 bg-white/80 bg-zinc-950/80 backdrop-blur-md sticky top-0 z-10">
          <div className="px-6 h-16 flex items-center justify-between max-w-7xl mx-auto">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gray-100 bg-zinc-900 rounded-lg border border-gray-200 border-zinc-800/80 shadow-sm text-gray-600 text-zinc-400">
                <Activity size={18} color="currentColor" />
              </div>
              <h1 className="text-sm font-medium text-gray-900 text-zinc-100">
                System Audit Log
              </h1>
            </div>
            <button className="flex items-center gap-1.5 bg-white bg-zinc-900 hover:bg-gray-50 hover:bg-zinc-800 transition-all text-gray-700 text-zinc-300 text-xs font-medium px-4 py-2 rounded-lg border border-gray-200 border-zinc-800 shadow-sm">
              <DocumentDownload size={14} color="currentColor" />
              Export CSV
            </button>
          </div>
        </div>

        <div className="px-6 py-8 max-w-7xl mx-auto space-y-8">
          {/* KPI Row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
            <StatCard
              label="Total Events"
              value={meta?.total ?? (isLoading ? "—" : 0)}
              sub="System-wide logged actions"
            />
            <StatCard
              label="Events Today"
              value={todaysEvents}
              sub="Recorded since 00:00 (current page)"
            />
            <StatCard
              label="Critical Alerts"
              value={criticalEvents}
              sub="Failures, rejections, deletions (current page)"
              alert={criticalEvents > 0}
            />
            <StatCard label="Data Retention" value="90 Days" sub="Compliant with policy" />
          </div>

          <div className="bg-white bg-zinc-900/40 border border-gray-200 border-zinc-800/50 rounded-xl overflow-hidden shadow-sm flex flex-col">
            {/* Toolbar */}
            <div className="p-4 border-b border-gray-200 border-zinc-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 bg-gray-50 bg-pri">
              <div className="relative w-full sm:w-96">
                <SearchNormal1
                  size={15}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-zinc-500"
                  color="currentColor"
                />
                <input
                  value={search}
                  onChange={(e) => resetToFirstPage(setSearch)(e.target.value)}
                  placeholder="Search user, IP, action, or ID..."
                  className="w-full bg-white bg-zinc-950 border border-gray-200 border-zinc-800 rounded-lg pl-10 pr-4 py-2 text-sm text-gray-900 text-zinc-200 placeholder-gray-400 placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-gray-400 focus:ring-zinc-600 transition-all"
                />
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <div className="relative flex items-center bg-white bg-zinc-950 border border-gray-200 border-zinc-800 rounded-lg px-3 py-2 focus-within:ring-1 focus-within:ring-gray-400 focus-within:ring-zinc-600 transition-all w-full sm:w-auto">
                  <Filter size={14} className="text-gray-400 text-zinc-500 mr-2" color="currentColor" />
                  <select
                    value={moduleFilter}
                    onChange={(e) =>
                      resetToFirstPage(setModuleFilter)(e.target.value as AuditModule | "all")
                    }
                    className="bg-transparent text-xs font-medium text-gray-700 text-zinc-300 focus:outline-none appearance-none cursor-pointer pr-4 w-full"
                  >
                    <option value="all">All Modules</option>
                    <option value="Vouchers">Vouchers</option>
                    <option value="Users">Users</option>
                    <option value="Departments">Departments</option>
                    <option value="Workflows">Workflows</option>
                    <option value="System">System Access</option>
                  </select>
                </div>

                <select
                  value={actionFilter}
                  onChange={(e) =>
                    resetToFirstPage(setActionFilter)(e.target.value as AuditAction | "all")
                  }
                  className="w-full sm:w-auto bg-white bg-zinc-950 border border-gray-200 border-zinc-800 rounded-lg px-3 py-2 text-xs font-medium text-gray-700 text-zinc-300 focus:outline-none focus:ring-1 focus:ring-gray-400 focus:ring-zinc-600 appearance-none cursor-pointer"
                >
                  <option value="all">All Actions</option>
                  <option value="CREATE">Creates</option>
                  <option value="UPDATE">Updates</option>
                  <option value="DELETE">Deletions</option>
                  <option value="APPROVE">Approvals</option>
                  <option value="REJECT">Rejections</option>
                  <option value="AUTH_SUCCESS">Logins</option>
                  <option value="AUTH_FAILURE">Failed Logins</option>
                </select>
              </div>
            </div>

            {/* List */}
            {isError ? (
              <div className="py-24 flex flex-col items-center justify-center text-center bg-gray-50/50 bg-zinc-900/20">
                <SecuritySafe size={32} className="text-red-400 mb-4" color="currentColor" />
                <p className="text-sm font-medium text-red-600 text-red-400">
                  Failed to load audit logs
                </p>
                <p className="text-xs text-zinc-500 mt-1">
                  {(error as any)?.response?.data?.message ||
                    error?.message ||
                    "Please try again."}
                </p>
              </div>
            ) : isLoading ? (
              <div className="divide-y divide-gray-100 divide-zinc-800/80">
                {Array.from({ length: 6 }).map((_, i) => (
                  <SkeletonRow key={i} />
                ))}
              </div>
            ) : logs.length === 0 ? (
              <div className="py-24 flex flex-col items-center justify-center text-center bg-gray-50/50 bg-zinc-900/20">
                <Activity size={32} className="text-gray-300 text-zinc-700 mb-4" color="currentColor" />
                <p className="text-sm font-medium text-gray-900 text-zinc-300">No logs found</p>
                <p className="text-xs text-zinc-500 mt-1">
                  Try clearing your filters or search query.
                </p>
              </div>
            ) : (
              <div
                className={`divide-y divide-gray-100 divide-zinc-800/80 transition-opacity ${isFetching ? "opacity-60" : ""
                  }`}
              >
                {logs.map((log) => (
                  <LogRow key={log.id} log={log} />
                ))}
              </div>
            )}

            {/* Pagination */}
            {meta && meta.total_pages > 1 && (
              <div className="p-4 border-t border-gray-200 border-zinc-800/80 flex items-center justify-between bg-gray-50 bg-pri">
                <p className="text-[11px] text-zinc-500">
                  Page {meta.page} of {meta.total_pages} • {meta.total} total events
                </p>
                <div className="flex items-center gap-2">
                  <button
                    disabled={page <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    className="text-xs font-medium px-3 py-1.5 rounded-lg border border-gray-200 border-zinc-800 text-gray-600 text-zinc-400 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-100 hover:bg-zinc-800 transition-colors"
                  >
                    Previous
                  </button>
                  <button
                    disabled={page >= meta.total_pages}
                    onClick={() => setPage((p) => Math.min(meta.total_pages, p + 1))}
                    className="text-xs font-medium px-3 py-1.5 rounded-lg border border-gray-200 border-zinc-800 text-gray-600 text-zinc-400 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-100 hover:bg-zinc-800 transition-colors"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}