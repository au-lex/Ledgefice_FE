import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Receipt21,
  Add,
  SearchNormal1,
  CloseCircle,
  FolderOpen,
  Sort,
} from "iconsax-react";
import Layout from "../../../layout/Layout";
import {
  useListMyVouchers,
  useCreateVoucher,
  useSubmitVoucher,
  useDeleteVoucher,
  type VoucherStatus,
  type VoucherSort,
  type CreateVoucherPayload,
} from "../../../api/hooks/useVouchers";
import { useListVoucherTypes, type VoucherType } from "../../../api/hooks/useVoucherTypes";
import { VoucherCard } from "../../../components/ui/VouchersCard";
import Loader from "../../../components/ui/Loader";

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatCard({ label, value, sub }: { label: string; value: string | number; sub: string }) {
  return (
    <div className="bg-pri border border-zinc-800/80 rounded-xl p-4 sm:p-5 flex flex-col justify-between shadow-sm min-w-0">
      <p className="text-xs text-zinc-400 font-medium mb-3 truncate">{label}</p>
      <p className="text-xl sm:text-2xl font-medium text-zinc-50 tracking-tight">{value}</p>
      <p className="text-[11px] text-zinc-500 mt-2">{sub}</p>
    </div>
  );
}

// ─── New Voucher Modal ────────────────────────────────────────────────────────

interface NewVoucherModalProps {
  onClose: () => void;
  voucherTypes: VoucherType[];
  isLoadingTypes: boolean;
}

function NewVoucherModal({ onClose, voucherTypes, isLoadingTypes }: NewVoucherModalProps) {
  const navigate = useNavigate();
  const [selectedTypeId, setSelectedTypeId] = useState<string>(voucherTypes[0]?.id ?? "");
  const [fieldValues, setFieldValues] = useState<Record<string, string>>({});

  const { mutate: createVoucher, isPending } = useCreateVoucher();

  const selectedType = voucherTypes.find((t) => t.id === selectedTypeId);

  const handleFieldChange = (fieldId: string, value: string) => {
    setFieldValues((prev) => ({ ...prev, [fieldId]: value }));
  };

  const allFilled =
    !!selectedTypeId &&
    (selectedType?.fields ?? []).every((f) => (fieldValues[f.id] ?? "").trim() !== "");

  const handleSubmit = () => {
    if (!selectedTypeId || !selectedType) return;

    const payload: CreateVoucherPayload = {
      voucher_type_id: selectedTypeId,
      field_values: Object.entries(fieldValues).map(([custom_field_id, value]) => ({
        custom_field_id,
        value,
      })),
    };

    createVoucher(payload, { onSuccess: () => onClose() });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 backdrop-blur-sm bg-black/60">
      <div className="relative bg-zinc-900 border border-zinc-800 rounded-xl w-full max-w-lg shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-zinc-800 bg-pri">
          <h2 className="text-sm font-medium text-zinc-100">Create New Issue</h2>
          <button onClick={onClose} className="text-zinc-500 hover:text-zinc-300 transition-colors flex-shrink-0">
            <CloseCircle size={18} color="currentColor" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1 custom-scrollbar">

          {/* Voucher Type */}
          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-2">Issue Type</label>
            {isLoadingTypes ? (
              <Loader />
            ) : voucherTypes.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-3 border border-dashed border-zinc-800 rounded-lg py-6 px-4 bg-zinc-950/40">
                <p className="text-xs text-zinc-500 text-center">
                  No issue types yet. Create one to start raising vouchers.
                </p>
                <button
                  onClick={() => { onClose(); navigate("/voucher-types"); }}
                  className="flex items-center gap-1.5 bg-zinc-100 hover:bg-white transition-all text-zinc-950 text-xs font-medium px-3 py-2 rounded-lg shadow-sm"
                >
                  <Add size={14} color="currentColor" />
                  Create Voucher Type
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {voucherTypes.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => {
                      setSelectedTypeId(t.id);
                      setFieldValues({});
                    }}
                    className={`px-3 py-2.5 rounded-lg border text-left transition-all text-xs font-medium ${
                      selectedTypeId === t.id
                        ? "border-zinc-500 bg-zinc-800 text-zinc-100 shadow-sm"
                        : "border-zinc-800/80 bg-transparent text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-300"
                    }`}
                  >
                    {t.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Dynamic fields */}
          {selectedType && selectedType.fields && selectedType.fields.length > 0 && (
            <div className="space-y-4 pt-4 border-t border-zinc-800/80">
              <p className="text-[10px] font-medium text-zinc-500 uppercase tracking-widest">
                {selectedType.name} Fields
              </p>
              {selectedType.fields
                .slice()
                .sort((a, b) => a.sort_order - b.sort_order)
                .map((field) => (
                  <div key={field.id}>
                    <label className="block text-xs font-medium text-zinc-400 mb-1.5">
                      {field.label}
                    </label>
                    <input
                      type={
                        field.type === "number" ? "number" :
                        field.type === "date" ? "date" : "text"
                      }
                      value={fieldValues[field.id] ?? ""}
                      onChange={(e) => handleFieldChange(field.id, e.target.value)}
                      placeholder={
                        field.type === "file"
                          ? "Paste file URL (upload via media manager)"
                          : `Enter ${field.label.toLowerCase()}`
                      }
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2.5 text-sm text-zinc-300 placeholder-zinc-600 focus:outline-none focus:border-zinc-600 focus:ring-1 focus:ring-zinc-600 transition-all"
                    />
                  </div>
                ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-zinc-800 flex justify-end gap-3 bg-zinc-900/80">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-sm text-zinc-400 font-medium hover:text-zinc-100 hover:bg-zinc-800 transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isPending || !allFilled}
            className="px-5 py-2 rounded-lg bg-zinc-100 text-sm text-zinc-900 font-medium hover:bg-white transition-all shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {isPending ? "Creating..." : "Create Issue"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function VouchersPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<VoucherStatus | "all">("all");
  const [sortParam, setSortParam] = useState<VoucherSort>("newest");
  const [showNew, setShowNew] = useState(false);

  const { data, isLoading } = useListMyVouchers({
    status: statusFilter === "all" ? undefined : statusFilter,
    sort: sortParam,
  });

  const { data: voucherTypes = [], isLoading: isLoadingTypes } = useListVoucherTypes();
  const { mutate: submitVoucher, isPending: isSubmitting } = useSubmitVoucher();
  const { mutate: deleteVoucher, isPending: isDeleting } = useDeleteVoucher();

  const vouchers = data?.data ?? [];

  const filtered = vouchers.filter((v) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      v.code.toLowerCase().includes(q) ||
      (v.raised_by?.name ?? "").toLowerCase().includes(q) ||
      (v.voucher_type?.name ?? "").toLowerCase().includes(q) ||
      (v.field_values ?? []).some((fv) => fv.value.toLowerCase().includes(q))
    );
  });

  const stats = {
    total: vouchers.length,
    pending: vouchers.filter((v) => v.status === "pending").length,
    approved: vouchers.filter((v) => v.status === "approved").length,
    draft: vouchers.filter((v) => v.status === "draft").length,
  };

  return (
    <Layout>
      <div className="min-h-screen bg-zinc-950 text-zinc-300 font-sans pb-16 selection:bg-zinc-800 selection:text-zinc-100">

        {/* Top Nav */}
        <div className="border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-md sticky top-0 z-10">
          <div className="px-4 sm:px-6 py-3 sm:py-0 sm:h-16 flex flex-col sm:flex-row sm:items-center justify-between gap-3 max-w-7xl mx-auto">
            <div className="flex items-center gap-3 flex-wrap min-w-0">
              <div className="p-2 bg-zinc-900 rounded-lg border border-zinc-800/80 flex-shrink-0">
                <Receipt21 size={18} color="currentColor" className="text-zinc-400" />
              </div>
              <h1 className="text-sm font-medium text-zinc-100 truncate">My Issues</h1>
              <span className="bg-zinc-900 border border-zinc-800 text-zinc-400 text-[11px] px-2 py-0.5 rounded-full font-mono whitespace-nowrap">
                {filtered.length} entries
              </span>
            </div>
            <button
              onClick={() => setShowNew(true)}
              className="flex items-center justify-center gap-1.5 bg-zinc-100 hover:bg-white transition-all text-zinc-950 text-sm font-medium px-4 py-2 rounded-lg shadow-sm w-full sm:w-auto"
            >
              <Add size={16} color="currentColor" />
              New Issue
            </button>
          </div>
        </div>

        <div className="px-4 sm:px-6 py-6 sm:py-8 max-w-7xl mx-auto space-y-8 sm:space-y-10">

          {/* KPIs */}
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            <StatCard label="Total Vouchers" value={stats.total} sub="All time" />
            <StatCard label="Awaiting Approval" value={stats.pending} sub="Requires attention" />
            <StatCard label="Approved" value={stats.approved} sub="Successfully closed" />
            <StatCard label="Drafts" value={stats.draft} sub="Not yet submitted" />
          </div>

          <div className="space-y-6">
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-stretch sm:items-center justify-between bg-zinc-900/30 p-2 rounded-xl border border-zinc-800/50">
              <div className="relative w-full sm:w-96">
                <SearchNormal1 size={16} color="currentColor" className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by code, type, field value..."
                  className="w-full bg-zinc-900 border-none rounded-lg pl-10 pr-4 py-2 text-sm text-zinc-200 placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-700 transition-all"
                />
              </div>
              <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as VoucherStatus | "all")}
                  className="flex-1 sm:flex-none bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-300 focus:outline-none focus:ring-1 focus:ring-zinc-700 appearance-none cursor-pointer hover:bg-zinc-800/50 transition-colors"
                >
                  <option value="all">Status: All</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                  <option value="draft">Drafts</option>
                </select>
                <div className="flex-1 sm:flex-none relative flex items-center bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 focus-within:ring-1 focus-within:ring-zinc-700 transition-all hover:bg-zinc-800/50 cursor-pointer">
                  <Sort size={14} color="currentColor" className="text-zinc-500 mr-2 flex-shrink-0" />
                  <select
                    value={sortParam}
                    onChange={(e) => setSortParam(e.target.value as VoucherSort)}
                    className="w-full bg-transparent text-xs text-zinc-300 focus:outline-none appearance-none cursor-pointer pr-2"
                  >
                    <option value="newest">Newest first</option>
                    <option value="oldest">Oldest first</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Cards */}
            {isLoading ? (
              <div className="py-24 flex items-center justify-center">
             <Loader />
              </div>
            ) : filtered.length === 0 ? (
              <div className="py-16 sm:py-24 flex flex-col items-center justify-center text-center px-4 border border-dashed border-zinc-800 rounded-xl bg-zinc-900/20">
                <FolderOpen size={32} color="currentColor" className="text-zinc-600 mb-4" />
                <p className="text-sm font-medium text-zinc-300">No issues found</p>
                <p className="text-xs text-zinc-500 mt-1">Try adjusting your filters or create a new issue.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5 items-start">
                {filtered.map((v) => (
                  <VoucherCard
                    key={v.id}
                    voucher={v}
                    onDelete={(id) => deleteVoucher(id)}
                    onSubmit={(id) => submitVoucher(id)}
                    isSubmitting={isSubmitting}
                    isDeleting={isDeleting}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {showNew && (
          <NewVoucherModal
            onClose={() => setShowNew(false)}
            voucherTypes={voucherTypes}
            isLoadingTypes={isLoadingTypes}
          />
        )}
      </div>
    </Layout>
  );
}