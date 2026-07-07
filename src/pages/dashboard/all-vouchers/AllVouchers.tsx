import { useMemo, useState } from "react";
import {
  Receipt21,
 
  SearchNormal1,

  FolderOpen,
  Sort,
} from "iconsax-react";
import Layout from "../../../layout/Layout";
import {
  useListVouchers,
  type VoucherStatus,
  type VoucherSort,
  type VoucherListFilters,
} from "../../../api/hooks/useVouchers";
import { VoucherCard } from "../../../components/ui/VouchersCard";
import Loader from "../../../components/ui/Loader";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function useDebouncedValue<T>(value: T, delay = 400) {
  const [debounced, setDebounced] = useState(value);
  useState(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  });
  return debounced;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatCard({ label, value, sub }: { label: string; value: string | number; sub: string }) {
  return (
    <div className="bg-white dark:bg-pri border border-gray-200 dark:border-zinc-800/80 rounded-xl p-5 flex flex-col justify-between shadow-sm">
      <p className="text-xs text-gray-500 dark:text-zinc-400 font-medium mb-3">{label}</p>
      <p className="text-2xl font-medium text-gray-900 dark:text-zinc-50 tracking-tight">{value}</p>
      <p className="text-[11px] text-gray-400 dark:text-zinc-500 mt-2">{sub}</p>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function AllVouchersPage() {
  const [searchInput, setSearchInput] = useState("");
  const search = useDebouncedValue(searchInput, 400);

  const [statusFilter, setStatusFilter] = useState<VoucherStatus | "">("");
  const [typeFilter, setTypeFilter] = useState<string>("");
  const [deptFilter, setDeptFilter] = useState<string>("");
  const [sortParam, setSortParam] = useState<VoucherSort>("newest");
  const [page, setPage] = useState(1);

  const limit = 12;

  const filters: VoucherListFilters = {
    search: search || undefined,
    status: statusFilter || undefined,
    type: typeFilter || undefined,
    department: deptFilter || undefined,
    sort: sortParam,
    page,
    limit,
  };

  const { data, isLoading, isError, error, isFetching } = useListVouchers(filters);

  const vouchers = data?.data ?? [];
  const meta = data?.meta;

  const departmentOptions = useMemo(() => {
    const seen = new Map<string, string>();
    vouchers.forEach((v) => {
      if (v.department) seen.set(v.department.id, v.department.name ?? v.department.id);
    });
    return Array.from(seen.entries());
  }, [vouchers]);

  const typeOptions = useMemo(() => {
    const seen = new Map<string, string>();
    vouchers.forEach((v) => {
      if (v.voucher_type) seen.set(v.voucher_type.id, v.voucher_type.name ?? v.voucher_type.id);
    });
    return Array.from(seen.entries());
  }, [vouchers]);

  const stats = useMemo(() => {
    const pending = vouchers.filter((v) => v.status === "pending").length;
    const activeDepts = new Set(vouchers.map((v) => v.department_id)).size;
    const duplicates = vouchers.filter(
      (v) => v.duplicate_flag?.is_duplicate && !v.duplicate_flag.dismissed_at
    ).length;
    return {
      total: meta?.total_items ?? vouchers.length,
      pending,
      activeDepts,
      duplicates,
    };
  }, [vouchers, meta]);

  function resetToFirstPage<T>(setter: (v: T) => void) {
    return (v: T) => {
      setter(v);
      setPage(1);
    };
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 text-gray-900 dark:text-zinc-300 font-sans pb-16 selection:bg-gray-200 selection:text-gray-900 dark:selection:bg-zinc-800 dark:selection:text-zinc-100">

        {/* Top Navigation Bar */}
        <div className="border-b border-gray-200 dark:border-zinc-800/80 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md sticky top-0 z-10">
          <div className="px-6 h-16 flex items-center justify-between max-w-7xl mx-auto">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gray-100 dark:bg-zinc-900 rounded-lg border border-gray-200 dark:border-zinc-800/80 shadow-sm text-gray-600 dark:text-zinc-400">
                <Receipt21 size={18} color="currentColor" />
              </div>
              <h1 className="text-sm font-medium text-gray-900 dark:text-zinc-100">All Vouchers Directory</h1>

              {isFetching && !isLoading && (
         <Loader />
              )}
            </div>

          </div>
        </div>

        <div className="px-6 py-8 max-w-7xl mx-auto space-y-10">

          {/* KPI Dashboard */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
            <StatCard label="Total Vouchers" value={stats.total} sub="Across all departments" />
            <StatCard label="Awaiting Approval" value={stats.pending} sub="This page's backlog" />
            <StatCard label="Active Departments" value={stats.activeDepts} sub="Departments logging issues" />
            <StatCard label="Flagged Duplicates" value={stats.duplicates} sub="Unresolved on this page" />
          </div>

          <div className="space-y-6">
            {/* Filtering & Controls */}
            <div className="flex flex-col lg:flex-row gap-4 items-center justify-between bg-white dark:bg-zinc-900/30 p-2 rounded-xl border border-gray-200 dark:border-zinc-800/50 shadow-sm">

              <div className="relative w-full lg:w-80 flex-shrink-0">
                <SearchNormal1 size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-zinc-500" color="currentColor" />
                <input
                  value={searchInput}
                  onChange={(e) => {
                    setSearchInput(e.target.value);
                    setPage(1);
                  }}
                  placeholder="Search by title, description, ID..."
                  className="w-full bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg pl-10 pr-4 py-2 text-sm text-gray-900 dark:text-zinc-200 placeholder-gray-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-gray-400 dark:focus:ring-zinc-700 transition-all"
                />
              </div>

              <div className="flex flex-wrap gap-2 w-full lg:w-auto">
                <select
                  value={deptFilter}
                  onChange={(e) => resetToFirstPage(setDeptFilter)(e.target.value)}
                  className="bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-xs text-gray-700 dark:text-zinc-300 focus:outline-none focus:ring-1 focus:ring-gray-400 dark:focus:ring-zinc-700 appearance-none cursor-pointer hover:bg-gray-100 dark:hover:bg-zinc-800/50 transition-colors"
                >
                  <option value="">Department: All</option>
                  {departmentOptions.map(([id, name]) => (
                    <option key={id} value={id}>{name}</option>
                  ))}
                </select>

                <select
                  value={statusFilter}
                  onChange={(e) => resetToFirstPage(setStatusFilter)(e.target.value as VoucherStatus | "")}
                  className="bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-xs text-gray-700 dark:text-zinc-300 focus:outline-none focus:ring-1 focus:ring-gray-400 dark:focus:ring-zinc-700 appearance-none cursor-pointer hover:bg-gray-100 dark:hover:bg-zinc-800/50 transition-colors"
                >
                  <option value="">Status: All</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                  <option value="draft">Drafts</option>
                </select>

                <select
                  value={typeFilter}
                  onChange={(e) => resetToFirstPage(setTypeFilter)(e.target.value)}
                  className="bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-xs text-gray-700 dark:text-zinc-300 focus:outline-none focus:ring-1 focus:ring-gray-400 dark:focus:ring-zinc-700 appearance-none cursor-pointer hover:bg-gray-100 dark:hover:bg-zinc-800/50 transition-colors hidden sm:block"
                >
                  <option value="">Type: All</option>
                  {typeOptions.map(([id, name]) => (
                    <option key={id} value={id}>{name}</option>
                  ))}
                </select>

                <div className="relative flex items-center bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg px-3 py-2 focus-within:ring-1 focus-within:ring-gray-400 dark:focus-within:ring-zinc-700 transition-all hover:bg-gray-100 dark:hover:bg-zinc-800/50 cursor-pointer">
                  <Sort size={14} className="text-gray-400 dark:text-zinc-500 mr-2" color="currentColor" />
                  <select
                    value={sortParam}
                    onChange={(e) => resetToFirstPage(setSortParam)(e.target.value as VoucherSort)}
                    className="bg-transparent text-xs text-gray-700 dark:text-zinc-300 focus:outline-none appearance-none cursor-pointer pr-2"
                  >
                    <option value="newest">Newest</option>
                    <option value="oldest">Oldest</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Loading state */}
            {isLoading && (
              <div className="py-24 flex flex-col items-center justify-center text-center border border-dashed border-gray-300 dark:border-zinc-800 rounded-xl bg-white dark:bg-zinc-900/20">
                <Loader />
              </div>
            )}

            {/* Error state */}
            {isError && !isLoading && (
              <div className="py-24 flex flex-col items-center justify-center text-center border border-dashed border-red-300 dark:border-red-800 rounded-xl bg-red-50 dark:bg-red-950/10">
                <p className="text-sm font-medium text-red-700 dark:text-red-400">Failed to load vouchers</p>
                <p className="text-xs text-red-500 dark:text-red-500 mt-1">
                  {error?.response?.data?.message || error?.message || "Something went wrong"}
                </p>
              </div>
            )}

            {/* Empty state */}
            {!isLoading && !isError && vouchers.length === 0 && (
              <div className="py-24 flex flex-col items-center justify-center text-center border border-dashed border-gray-300 dark:border-zinc-800 rounded-xl bg-white dark:bg-zinc-900/20">
                <FolderOpen size={32} className="text-gray-400 dark:text-zinc-600 mb-4" color="currentColor" />
                <p className="text-sm font-medium text-gray-900 dark:text-zinc-300">No issues found</p>
                <p className="text-xs text-gray-500 dark:text-zinc-500 mt-1">Adjust your filters or search term to find what you're looking for.</p>
              </div>
            )}

            {/* Cards Grid */}
            {!isLoading && !isError && vouchers.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 items-start">
                {vouchers.map((v) => (
                  <VoucherCard key={v.id} voucher={v} />
                ))}
              </div>
            )}

            {/* Pagination */}
            {meta && meta.total_pages > 1 && (
              <div className="flex items-center justify-between pt-2">
                <p className="text-xs text-gray-500 dark:text-zinc-500">
                  Page {meta.page} of {meta.total_pages} · {meta.total_items} total
                </p>
                <div className="flex gap-2">
                  <button
                    disabled={page <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    className="px-3 py-1.5 text-xs rounded-md border border-gray-200 dark:border-zinc-800 text-gray-600 dark:text-zinc-400 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-zinc-800/50 transition-colors"
                  >
                    Previous
                  </button>
                  <button
                    disabled={page >= meta.total_pages}
                    onClick={() => setPage((p) => Math.min(meta.total_pages, p + 1))}
                    className="px-3 py-1.5 text-xs rounded-md border border-gray-200 dark:border-zinc-800 text-gray-600 dark:text-zinc-400 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-zinc-800/50 transition-colors"
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



