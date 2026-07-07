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
  Users: { icon: <Profile2User size={16} color="currentColor" /> },
  Vouchers: { icon: <Receipt21 size={16} color="currentColor" /> },
  Departments: { icon: <Building size={16} color="currentColor" /> },
  Workflows: { icon: <Hierarchy size={16} color="currentColor" /> },
  System: { icon: <SecuritySafe size={16} color="currentColor" /> },
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
      className={`bg-zinc-900/50 border rounded-xl p-4 sm:p-5 flex flex-col justify-between shadow-sm transition-colors min-w-0 ${
        alert ? "border-red-500/30 bg-red-500/5" : "border-zinc-800/80"
      }`}
    >
      <p className={`text-xs font-medium mb-3 truncate ${alert ? "text-red-400" : "text-zinc-400"}`}>
        {label}
      </p>
      <p className={`text-xl sm:text-2xl font-medium tracking-tight truncate ${alert ? "text-red-400" : "text-zinc-50"}`}>
        {value}
      </p>
      <p className={`text-[11px] mt-2 ${alert ? "text-red-500/70" : "text-zinc-500"}`}>
        {sub}
      </p>
    </div>
  );
}

function ActionBadge({ action }: { action: AuditAction }) {
  const meta = ACTION_META[action];

  if (meta.isAlert) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md border border-red-500/20 bg-red-500/10 text-[10px] font-medium text-red-400 uppercase tracking-widest whitespace-nowrap">
        {meta.icon}
        {meta.label}
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md border border-zinc-700 bg-zinc-800 text-[10px] font-medium text-zinc-300 uppercase tracking-widest whitespace-nowrap">
      {meta.icon}
      {meta.label}
    </span>
  );
}

function LogRow({ log }: { log: AuditLog }) {
  const moduleMeta = MODULE_META[log.module];
  const formatted = formatDateTime(log.created_at).split(", ");
  const actorName = log.actor?.name || log.actor_name || "System";

  return (
    <div className="group p-4 sm:px-5 hover:bg-zinc-800/40 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
      {/* Primary Log Info */}
      <div className="flex items-start sm:items-center gap-3 sm:gap-4 min-w-0 flex-1">
        <div className="w-10 h-10 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-400 flex-shrink-0">
          {moduleMeta?.icon}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center flex-wrap gap-x-2.5 gap-y-1 mb-1">
            <h3 className="text-sm font-semibold text-zinc-100 truncate max-w-[180px] sm:max-w-none">
              {actorName}
            </h3>
            <ActionBadge action={log.action} />
            <span className="text-[10px] font-mono text-zinc-400 bg-zinc-900 px-1.5 py-0.5 rounded border border-zinc-800">
              {log.resource_id}
            </span>
          </div>
          <p className="text-xs text-zinc-400 leading-relaxed line-clamp-2 sm:line-clamp-1">
            {log.description}
          </p>
          
          {/* Mobile-only metadata row */}
          <div className="flex items-center gap-3 mt-1.5 sm:hidden">
            <span className="text-[10px] text-zinc-500">
              {formatted[0]} {formatted[1]}
            </span>
            <span className="text-[10px] text-zinc-600">•</span>
            <span className="text-[10px] text-zinc-500 font-mono truncate max-w-[100px]">
              {log.ip_address}
            </span>
          </div>
        </div>
      </div>

      {/* Desktop-only Metadata Columns */}
      <div className="hidden sm:flex items-center justify-between sm:justify-end gap-4 sm:gap-6 lg:gap-10 flex-shrink-0">
        <div className="hidden md:block text-left w-24 lg:w-32">
          <p className="text-[10px] font-medium text-zinc-500 uppercase tracking-widest mb-1">
            IP / Client
          </p>
          <p className="text-[11px] font-medium text-zinc-200 truncate font-mono">
            {log.ip_address}
          </p>
          <p className="text-[10px] text-zinc-500 truncate mt-0.5" title={log.user_agent}>
            {log.user_agent}
          </p>
        </div>
        <div className="hidden sm:block text-right w-32">
          <p className="text-[10px] font-medium text-zinc-500 uppercase tracking-widest mb-1">
            Timestamp
          </p>
          <p className="text-xs text-zinc-200">{formatted[0]}</p>
          <p className="text-[11px] text-zinc-400 mt-0.5">{formatted[1]}</p>
        </div>
      </div>
    </div>
  );
}

function SkeletonRow() {
  return (
    <div className="p-4 sm:px-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-pulse">
      <div className="flex items-center gap-4 min-w-0 flex-1">
        <div className="w-10 h-10 rounded-lg bg-zinc-800 flex-shrink-0" />
        <div className="space-y-1.5 min-w-0 flex-1">
          <div className="flex gap-2">
            <div className="h-4 w-24 bg-zinc-800 rounded" />
            <div className="h-4 w-16 bg-zinc-800 rounded" />
          </div>
          <div className="h-3 w-3/4 max-w-sm bg-zinc-800 rounded" />
        </div>
      </div>
      <div className="hidden sm:flex gap-6 lg:gap-10 w-48 lg:w-64">
        <div className="hidden md:block flex-1 space-y-1.5">
          <div className="h-2.5 w-16 bg-zinc-800 rounded" />
          <div className="h-2.5 w-20 bg-zinc-800 rounded" />
        </div>
        <div className="flex-1 space-y-1.5">
          <div className="h-2.5 w-16 bg-zinc-800 rounded ml-auto" />
          <div className="h-2.5 w-12 bg-zinc-800 rounded ml-auto" />
        </div>
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
      <div className="min-h-screen bg-zinc-950 text-zinc-300 font-sans pb-16 selection:bg-zinc-800 selection:text-zinc-100">
        {/* Top Nav */}
        <div className="border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-md sticky top-0 z-10">
          <div className="px-4 sm:px-6 py-3 sm:py-0 sm:h-16 flex flex-col sm:flex-row sm:items-center justify-between gap-3 max-w-7xl mx-auto">
            <div className="flex items-center gap-3 min-w-0 flex-wrap">
              <div className="p-2 bg-zinc-900 rounded-lg border border-zinc-800/80 shadow-sm text-zinc-400 flex-shrink-0">
                <Activity size={18} color="currentColor" />
              </div>
              <h1 className="text-sm font-medium text-zinc-100 truncate">
                System Audit Log
              </h1>
              <span className="bg-zinc-900 border border-zinc-800 text-zinc-400 text-[11px] px-2.5 py-0.5 rounded-full font-mono whitespace-nowrap">
                {meta?.total ?? logs.length} events
              </span>
            </div>
            <button className="flex items-center justify-center gap-1.5 bg-zinc-100 hover:bg-white transition-all text-zinc-900 text-xs font-medium px-4 py-2 rounded-lg shadow-sm">
              <DocumentDownload size={14} color="currentColor" />
              Export CSV
            </button>
          </div>
        </div>

        <div className="px-4 sm:px-6 py-6 sm:py-8 max-w-7xl mx-auto space-y-8 sm:space-y-10">
          {/* KPI Row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
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
              sub="Failures, rejections, deletions"
              alert={criticalEvents > 0}
            />
            <StatCard 
              label="Data Retention" 
              value="90 Days" 
              sub="Compliant with policy" 
            />
          </div>

          <div className="bg-zinc-900/50 border border-zinc-800/80 rounded-xl overflow-hidden shadow-sm flex flex-col">
            {/* Toolbar */}
            <div className="p-4 border-b border-zinc-800/80 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4 bg-zinc-900/90">
              <div className="relative w-full sm:w-80">
                <SearchNormal1
                  size={15}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500"
                  color="currentColor"
                />
                <input
                  value={search}
                  onChange={(e) => resetToFirstPage(setSearch)(e.target.value)}
                  placeholder="Search user, IP, action, or ID..."
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg pl-10 pr-4 py-2 text-sm text-zinc-200 placeholder-zinc-600 outline-none focus:border-zinc-600 transition-colors"
                />
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 w-full sm:w-auto">
                <div className="relative flex items-center bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 outline-none focus-within:border-zinc-600 transition-colors w-full sm:w-auto">
                  <Filter size={14} className="text-zinc-500 mr-2 flex-shrink-0" color="currentColor" />
                  <select
                    value={moduleFilter}
                    onChange={(e) =>
                      resetToFirstPage(setModuleFilter)(e.target.value as AuditModule | "all")
                    }
                    className="bg-transparent text-xs font-medium text-zinc-300 focus:outline-none appearance-none cursor-pointer w-full"
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
                  className="w-full sm:w-auto bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs font-medium text-zinc-300 outline-none focus:border-zinc-600 appearance-none cursor-pointer transition-colors"
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
              <div className="py-16 sm:py-24 flex flex-col items-center justify-center text-center px-4">
                <SecuritySafe size={32} className="text-red-400 mb-4" color="currentColor" />
                <p className="text-sm font-medium text-red-400">
                  Failed to load audit logs
                </p>
                <p className="text-xs text-zinc-500 mt-1">
                  {(error as any)?.response?.data?.message ||
                    error?.message ||
                    "Please try again."}
                </p>
              </div>
            ) : isLoading ? (
              <div className="divide-y divide-zinc-800/80">
                {Array.from({ length: 6 }).map((_, i) => (
                  <SkeletonRow key={i} />
                ))}
              </div>
            ) : logs.length === 0 ? (
              <div className="py-16 sm:py-24 flex flex-col items-center justify-center text-center px-4">
                <Activity size={32} className="text-zinc-700 mb-4" color="currentColor" />
                <p className="text-sm font-medium text-zinc-300">No logs found</p>
                <p className="text-xs text-zinc-500 mt-1">
                  Try clearing your filters or search query.
                </p>
              </div>
            ) : (
              <div
                className={`divide-y divide-zinc-800/80 transition-opacity ${
                  isFetching ? "opacity-60" : ""
                }`}
              >
                {logs.map((log) => (
                  <LogRow key={log.id} log={log} />
                ))}
              </div>
            )}

            {/* Pagination */}
            {meta && meta.total_pages > 1 && (
              <div className="p-4 border-t border-zinc-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 bg-zinc-900/80">
                <p className="text-[11px] text-zinc-500 text-center sm:text-left">
                  Page {meta.page} of {meta.total_pages} • {meta.total} total events
                </p>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    disabled={page <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    className="flex-1 sm:flex-none text-xs font-medium px-3 py-1.5 rounded-lg border border-zinc-800 text-zinc-400 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-zinc-800 transition-colors"
                  >
                    Previous
                  </button>
                  <button
                    disabled={page >= meta.total_pages}
                    onClick={() => setPage((p) => Math.min(meta.total_pages, p + 1))}
                    className="flex-1 sm:flex-none text-xs font-medium px-3 py-1.5 rounded-lg border border-zinc-800 text-zinc-400 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-zinc-800 transition-colors"
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