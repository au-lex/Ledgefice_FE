import  { useState } from "react";
import {
  ShieldTick,
  SearchNormal1,
  TickCircle,
  CloseSquare,
  Warning2,
  DocumentText,
  Profile2User,
  CloseCircle,
  ArrowRight2,
  DocumentDownload,
  Filter,
  Building,
  Calendar,
} from "iconsax-react";
import Layout from "../../../layout/Layout";
import {
  useListSubmittedVouchers,
  useApproveVoucher,
  useRejectVoucher,
  useDismissDuplicate,
  type Voucher,
  type VoucherFieldValue,
} from "../../../api/hooks/useVouchers";
import Loader from "../../../components/ui/Loader";

// ─── Types ────────────────────────────────────────────────────────────────────

type TabType = "pending" | "flagged" | "approved" | "rejected";

// ─── Constants ────────────────────────────────────────────────────────────────

const MY_ROLE = "Finance Director";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

function isDuplicateFlagged(v: Voucher) {
  return !!v.duplicate_flag && v.duplicate_flag.is_duplicate && !v.duplicate_flag.dismissed_at;
}

function isToday(dateStr: string) {
  const d = new Date(dateStr);
  const now = new Date();
  return d.toDateString() === now.toDateString();
}

/** Pull a field value by label (case-insensitive) */
function getField(fieldValues: VoucherFieldValue[] | undefined, label: string) {
  return fieldValues?.find((fv) => fv.field?.label?.toLowerCase() === label.toLowerCase())?.value ?? null;
}

// ─── Shared Field Components (same as AllVouchersPage) ───────────────────────

function FieldValueDisplay({ fv }: { fv: VoucherFieldValue }) {
  const type = fv.field?.type;

  if (type === "file" && fv.value) {
    return (
      <a
        href={fv.value}
        target="_blank"
        rel="noopener noreferrer"
        onClick={(e) => e.stopPropagation()}
        className="text-xs text-blue-600 dark:text-blue-400 underline underline-offset-2 truncate hover:opacity-80 transition-opacity"
      >
        View file ↗
      </a>
    );
  }

  if (type === "date" && fv.value) {
    return (
      <span className="text-sm text-gray-900 dark:text-zinc-200">
        {formatDate(fv.value)}
      </span>
    );
  }

  return (
    <span className="text-sm text-gray-900 dark:text-zinc-200 break-words">
      {fv.value || "—"}
    </span>
  );
}

function VoucherFields({ fieldValues }: { fieldValues?: VoucherFieldValue[] }) {
  if (!fieldValues?.length) {
    return <p className="text-xs text-gray-400 dark:text-zinc-500 italic">No fields submitted</p>;
  }

  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-2.5">
      {fieldValues.map((fv) => (
        <div key={fv.id} className="flex flex-col min-w-0">
          <span className="text-[10px] font-medium text-gray-400 dark:text-zinc-500 uppercase tracking-wide truncate">
            {fv.field?.label ?? "Field"}
          </span>
          <FieldValueDisplay fv={fv} />
        </div>
      ))}
    </div>
  );
}

// ─── Stat Card ────────────────────────────────────────────────────────────────

function StatCard({ label, value, sub, alert }: { label: string; value: string | number; sub: string; alert?: boolean }) {
  return (
    <div className={`bg-white dark:bg-zinc-900/50 border rounded-xl p-5 flex flex-col justify-between shadow-sm transition-colors ${alert ? "border-red-500/30 bg-red-500/5" : "border-gray-200 dark:border-zinc-800/80"}`}>
      <p className={`text-xs font-medium mb-3 ${alert ? "text-red-500" : "text-gray-500 dark:text-zinc-400"}`}>{label}</p>
      <p className={`text-2xl font-medium tracking-tight ${alert ? "text-red-600 dark:text-red-400" : "text-gray-900 dark:text-zinc-50"}`}>{value}</p>
      <p className={`text-[11px] mt-2 ${alert ? "text-red-500/70" : "text-gray-400 dark:text-zinc-500"}`}>{sub}</p>
    </div>
  );
}

// ─── Review Modal ─────────────────────────────────────────────────────────────

interface ReviewModalProps {
  voucher: Voucher;
  onClose: () => void;
  onApprove: (id: string) => void;
  onReject: (id: string, reason: string) => void;
  onDismissDuplicate: (id: string) => void;
  isPending: boolean;
}

function ReviewModal({ voucher, onClose, onApprove, onReject, onDismissDuplicate, isPending }: ReviewModalProps) {
  const [rejectMode, setRejectMode] = useState(false);
  const [reason, setReason] = useState("");

  const isActionable = voucher.status === "pending";
  const duplicateFlagged = isDuplicateFlagged(voucher);
  const voucherTypeName = voucher.voucher_type?.name ?? "Unknown Type";
  const raisedByName = voucher.raised_by?.name ?? "Unknown";
  const departmentName = voucher.department?.name ?? "Unknown";

  // Pull file-type fields for the attachments section
  const fileFields = voucher.field_values?.filter((fv) => fv.field?.type === "file" && fv.value) ?? [];

  const sortedHistory = (voucher.approval_history ?? [])
    .slice()
    .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm bg-black/60 transition-opacity">
      <div className="relative bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl w-full max-w-3xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-900/50">
          <div className="flex items-center gap-3">
            <span className="text-[11px] font-mono text-gray-500 dark:text-zinc-400 bg-white dark:bg-zinc-950 px-2 py-1 rounded border border-gray-200 dark:border-zinc-700">
              {voucher.code}
            </span>
            <span className="inline-flex items-center gap-1.5 px-2 py-1 border rounded-md text-[10px] font-medium bg-gray-100 dark:bg-zinc-800/50 border-gray-200 dark:border-zinc-700/50 text-gray-700 dark:text-zinc-300">
              {voucherTypeName}
            </span>
          </div>
          <button onClick={onClose} className="text-gray-400 dark:text-zinc-500 hover:text-gray-900 dark:hover:text-zinc-100 transition-colors">
            <CloseCircle size={20} color="currentColor" />
          </button>
        </div>

        {/* Body */}
        <div className="flex flex-col md:flex-row flex-1 overflow-hidden">

          {/* Main Details Pane */}
          <div className="flex-1 p-6 overflow-y-auto border-r border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-950/30 space-y-6">

            {/* Duplicate Warning */}
            {duplicateFlagged && voucher.duplicate_flag && (
              <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl p-4 flex gap-3">
                <Warning2 size={20} className="text-red-500 flex-shrink-0 mt-0.5" variant="Bulk" color="currentColor" />
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-semibold text-red-700 dark:text-red-400 mb-1">System Flag: Potential Duplicate Detected</h4>
                  <p className="text-xs text-red-600 dark:text-red-500/80 leading-relaxed mb-3">
                    {voucher.duplicate_flag.reason}
                  </p>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[11px] font-medium text-red-700 dark:text-red-300 bg-red-100 dark:bg-red-500/20 px-3 py-1.5 rounded">
                      Match: {voucher.duplicate_flag.match_ref}
                    </span>
                    <button
                      onClick={() => onDismissDuplicate(voucher.id)}
                      disabled={isPending}
                      className="text-[11px] font-medium text-gray-600 dark:text-zinc-400 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 hover:bg-gray-50 dark:hover:bg-zinc-800 px-3 py-1.5 rounded transition-colors disabled:opacity-40"
                    >
                      Dismiss Flag
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Meta badges */}
            <div className="flex flex-wrap gap-2">
              <div className="inline-flex items-center gap-1 px-2 py-1 bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-md text-[10px] text-gray-600 dark:text-zinc-400">
                <Building size={10} color="currentColor" />
                {departmentName}
              </div>
              <div className="inline-flex items-center gap-1 px-2 py-1 bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-md text-[10px] text-gray-600 dark:text-zinc-400">
                <Calendar size={10} color="currentColor" />
                {formatDate(voucher.created_at)}
              </div>
              <div className="inline-flex items-center gap-1.5 px-2 py-1 bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-md text-[10px] text-gray-600 dark:text-zinc-400">
                <Profile2User size={10} color="currentColor" />
                {raisedByName}
              </div>
            </div>

            {/* Dynamic field values — same grid as the card */}
            <div className="bg-gray-50 dark:bg-zinc-900/50 rounded-xl border border-gray-200 dark:border-zinc-800 p-5">
              <p className="text-[10px] font-medium text-gray-500 dark:text-zinc-500 uppercase tracking-widest mb-4">
                {voucherTypeName} · Tier {voucher.tier}
              </p>
              <VoucherFields fieldValues={voucher.field_values} />
            </div>

            {/* File attachments derived from file-type fields */}
            {fileFields.length > 0 && (
              <div>
                <p className="text-xs font-medium text-gray-900 dark:text-zinc-300 mb-3">Supporting Documents</p>
                <div className="space-y-2">
                  {fileFields.map((fv) => (
                    <a
                      key={fv.id}
                      href={fv.value}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-900/30 group hover:border-gray-400 dark:hover:border-zinc-600 transition-colors"
                    >
                      <div className="w-10 h-10 rounded bg-gray-200 dark:bg-zinc-800 flex items-center justify-center text-gray-700 dark:text-zinc-300 flex-shrink-0">
                        <DocumentText size={20} variant="Bulk" color="currentColor" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-gray-900 dark:text-zinc-200 truncate">
                          {fv.field?.label ?? "Attachment"}
                        </p>
                        <p className="text-[10px] text-gray-500 dark:text-zinc-500 truncate">{fv.value}</p>
                      </div>
                      <DocumentDownload size={16} className="text-gray-400 dark:text-zinc-500 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" color="currentColor" />
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Side Pane: Workflow & Actions */}
          <div className="w-full md:w-72 bg-gray-50 dark:bg-zinc-900/30 p-6 flex flex-col justify-between overflow-y-auto">

            {/* Approval History */}
            <div>
              <p className="text-[10px] font-medium text-gray-500 dark:text-zinc-500 uppercase tracking-widest mb-4">Approval Chain</p>
              {sortedHistory.length === 0 ? (
                <p className="text-xs text-gray-400 dark:text-zinc-500 italic">No approval history yet.</p>
              ) : (
                <div className="relative border-l border-gray-200 dark:border-zinc-700 ml-2.5 space-y-5">
                  {sortedHistory.map((entry) => (
                    <div key={entry.id} className="relative pl-5">
                      <div className={`absolute -left-[5px] top-1 w-2.5 h-2.5 rounded-full border-2 border-white dark:border-zinc-900 ${
                        entry.action === "approved" ? "bg-gray-800 dark:bg-zinc-300" :
                        entry.action === "rejected" ? "bg-red-500" :
                        entry.action === "pending" ? "bg-gray-400 dark:bg-zinc-100" :
                        "bg-gray-200 dark:bg-zinc-700"
                      }`} />
                      <div className="flex flex-col">
                        <span className={`text-xs font-medium ${
                          entry.action === "approved" ? "text-gray-900 dark:text-zinc-100" :
                          entry.action === "rejected" ? "text-red-600 dark:text-red-400" :
                          "text-gray-700 dark:text-zinc-200"
                        }`}>
                          {entry.department?.name ?? entry.role}
                        </span>
                        {entry.actor?.name && (
                          <span className="text-[10px] text-gray-500 dark:text-zinc-500 mt-0.5">
                            {entry.action === "approved" ? "Approved by" : entry.action === "rejected" ? "Rejected by" : "Actioned by"} {entry.actor.name}
                          </span>
                        )}
                        {entry.acted_at && (
                          <span className="text-[9px] text-gray-400 dark:text-zinc-600 mt-0.5 font-mono">
                            {new Date(entry.acted_at).toLocaleString()}
                          </span>
                        )}
                        {entry.comment && (
                          <span className="text-[10px] text-gray-500 dark:text-zinc-400 mt-1 italic">
                            "{entry.comment}"
                          </span>
                        )}
                        {entry.action === "pending" && (
                          <span className="text-[10px] text-gray-500 dark:text-zinc-400 mt-0.5">Awaiting review</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Action Buttons */}
            {isActionable ? (
              <div className="pt-6 mt-6 border-t border-gray-200 dark:border-zinc-800">
                {!rejectMode ? (
                  <div className="flex flex-col gap-3">
                    <button
                      onClick={() => onApprove(voucher.id)}
                      disabled={isPending}
                      className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-gray-900 dark:bg-zinc-100 text-white dark:text-zinc-900 hover:bg-black dark:hover:bg-white text-sm font-medium transition-all shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <TickCircle size={16} color="currentColor" />
                      {isPending ? "Processing…" : "Approve Voucher"}
                    </button>
                    <button
                      onClick={() => setRejectMode(true)}
                      disabled={isPending}
                      className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 hover:border-red-200 dark:hover:border-red-500/30 text-sm font-medium transition-all disabled:opacity-40"
                    >
                      <CloseSquare size={16} color="currentColor" />
                      Reject Voucher
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <label className="block text-[10px] font-medium text-gray-500 dark:text-zinc-400 uppercase tracking-widest">Rejection Reason</label>
                    <textarea
                      autoFocus
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      placeholder="Provide a reason for rejection..."
                      className="w-full bg-white dark:bg-zinc-950 border border-gray-200 dark:border-zinc-700 rounded-lg p-2.5 text-xs text-gray-900 dark:text-zinc-200 placeholder-gray-400 dark:placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-gray-400 dark:focus:ring-zinc-600 resize-none h-20 transition-all"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => setRejectMode(false)}
                        disabled={isPending}
                        className="flex-1 py-2 rounded-lg bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-zinc-300 text-xs font-medium hover:bg-gray-200 dark:hover:bg-zinc-700 transition-colors disabled:opacity-40"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => onReject(voucher.id, reason)}
                        disabled={!reason.trim() || isPending}
                        className="flex-1 py-2 rounded-lg bg-red-600 text-white text-xs font-medium hover:bg-red-500 transition-colors disabled:opacity-50"
                      >
                        {isPending ? "Rejecting…" : "Confirm Reject"}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="pt-6 mt-6 border-t border-gray-200 dark:border-zinc-800">
                <div className="text-center py-3 rounded-lg bg-gray-100 dark:bg-zinc-800/50 border border-gray-200 dark:border-zinc-700">
                  <p className="text-xs font-medium text-gray-600 dark:text-zinc-300 capitalize">
                    This voucher was {voucher.status}.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Voucher Row ──────────────────────────────────────────────────────────────

function VoucherRow({ voucher, onClick }: { voucher: Voucher; onClick: () => void }) {
  const flagged = isDuplicateFlagged(voucher);
  const voucherTypeName = voucher.voucher_type?.name ?? "Unknown";

  // Derive a "primary" display value — prefer amount field, fall back to name
  const amountRaw = getField(voucher.field_values, "amount");
  const nameVal = getField(voucher.field_values, "name");
  const displayLabel = amountRaw
    ? `₦${Number(amountRaw).toLocaleString("en-NG", { minimumFractionDigits: 2 })}`
    : nameVal ?? "—";

  return (
    <div
      onClick={onClick}
      className="group p-4 hover:bg-gray-50 dark:hover:bg-zinc-800/40 transition-colors cursor-pointer flex flex-col sm:flex-row sm:items-center gap-4 relative"
    >
      {/* Status bar */}
      <div className={`absolute left-0 top-0 bottom-0 w-1 hidden sm:block ${
        voucher.status === "pending" && flagged ? "bg-red-500" :
        voucher.status === "pending" ? "bg-gray-300 dark:bg-zinc-600" :
        "bg-transparent"
      }`} />

      <div className="flex items-center gap-4 flex-1 min-w-0 sm:pl-2">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 bg-gray-100 dark:bg-zinc-800/50 text-gray-600 dark:text-zinc-400 border border-gray-200 dark:border-zinc-700/50 text-xs font-semibold">
          {voucherTypeName.slice(0, 2).toUpperCase()}
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-zinc-100 truncate">
              {nameVal ?? voucherTypeName}
            </h3>
            {flagged && (
              <div className="flex items-center justify-center w-5 h-5 rounded bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 flex-shrink-0">
                <Warning2 size={12} variant="Bulk" color="currentColor" />
              </div>
            )}
          </div>
          <div className="flex items-center gap-2 text-[11px]">
            <span className="font-mono text-gray-500 dark:text-zinc-400 bg-gray-100 dark:bg-zinc-900 px-1.5 py-0.5 rounded border border-gray-200 dark:border-zinc-800 tracking-wide">
              {voucher.code}
            </span>
            <span className="text-gray-400 dark:text-zinc-500">•</span>
            <span className="text-gray-600 dark:text-zinc-400 truncate">
              {voucher.department?.name ?? "—"}
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between sm:justify-end gap-6 sm:gap-10 flex-shrink-0">
        <div className="text-left sm:text-right hidden md:block">
          <p className="text-[10px] text-gray-500 dark:text-zinc-500 mb-0.5">Submitted</p>
          <p className="text-xs font-medium text-gray-700 dark:text-zinc-300">{formatDate(voucher.created_at)}</p>
        </div>
        <div className="text-left sm:text-right">
          <p className="text-[10px] text-gray-500 dark:text-zinc-500 mb-0.5">
            {amountRaw ? "Amount" : "Name"}
          </p>
          <p className="text-sm font-semibold text-gray-900 dark:text-zinc-100">{displayLabel}</p>
        </div>
        <div className="text-gray-300 dark:text-zinc-600 group-hover:text-gray-600 dark:group-hover:text-zinc-300 transition-colors hidden sm:block">
          <ArrowRight2 size={16} color="currentColor" />
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function ApprovalInboxPage() {
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<TabType>("pending");
  const [selectedVoucher, setSelectedVoucher] = useState<Voucher | null>(null);

  const { data, isLoading } = useListSubmittedVouchers({ limit: 100 });

  const approveMutation = useApproveVoucher();
  const rejectMutation = useRejectVoucher();
  const dismissMutation = useDismissDuplicate();

  const allVouchers = data?.data ?? [];

  const matchesSearch = (v: Voucher) => {
    if (!search.trim()) return true;
    const q = search.trim().toLowerCase();
    const nameVal = getField(v.field_values, "name") ?? "";
    return (
      nameVal.toLowerCase().includes(q) ||
      v.code.toLowerCase().includes(q) ||
      (v.department?.name ?? "").toLowerCase().includes(q) ||
      (v.voucher_type?.name ?? "").toLowerCase().includes(q)
    );
  };

  const pendingVouchers = allVouchers.filter((v) => v.status === "pending");
  const duplicateFlagsCount = pendingVouchers.filter(isDuplicateFlagged).length;
  const processedTodayCount = allVouchers.filter(
    (v) => (v.status === "approved" || v.status === "rejected") && isToday(v.updated_at)
  ).length;

  const displayedVouchers = allVouchers
    .filter((v) => {
      if (activeTab === "pending") return v.status === "pending";
      if (activeTab === "flagged") return v.status === "pending" && isDuplicateFlagged(v);
      if (activeTab === "approved") return v.status === "approved";
      if (activeTab === "rejected") return v.status === "rejected";
      return true;
    })
    .filter(matchesSearch);

  const isPending = approveMutation.isPending || rejectMutation.isPending || dismissMutation.isPending;

  const handleApprove = (id: string) => {
    approveMutation.mutate(
      { id },
      { onSuccess: (updated) => setSelectedVoucher(updated) }
    );
  };

  const handleReject = (id: string, reason: string) => {
    rejectMutation.mutate(
      { id, payload: { reason } },
      { onSuccess: (updated) => setSelectedVoucher(updated) }
    );
  };

  const handleDismissDuplicate = (id: string) => {
    dismissMutation.mutate(id, { onSuccess: () => setSelectedVoucher(null) });
  };

  const TAB_CONFIG: { key: TabType; label: string; badge?: number }[] = [
    { key: "pending", label: "Pending Review", badge: pendingVouchers.length },
    { key: "flagged", label: "Flagged Issues", badge: duplicateFlagsCount },
    { key: "approved", label: "Approved" },
    { key: "rejected", label: "Rejected" },
  ];

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 text-gray-900 dark:text-zinc-300 font-sans pb-16">

        {/* Top Nav */}
        <div className="border-b border-gray-200 dark:border-zinc-800/80 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md sticky top-0 z-10">
          <div className="px-6 h-16 flex items-center justify-between max-w-7xl mx-auto">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gray-100 dark:bg-zinc-900 rounded-lg border border-gray-200 dark:border-zinc-800/80 shadow-sm text-gray-600 dark:text-zinc-400">
                <ShieldTick size={18} color="currentColor" />
              </div>
              <h1 className="text-sm font-medium text-gray-900 dark:text-zinc-100">Approval Inbox</h1>
              <span className="ml-2 bg-gray-100 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-gray-700 dark:text-zinc-300 text-[11px] px-2.5 py-0.5 rounded-full font-mono font-medium">
                {pendingVouchers.length} pending
              </span>
            </div>
            <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-zinc-500 font-medium">
              <div className="w-2 h-2 rounded-full bg-gray-400 dark:bg-zinc-400" />
              Acting as: {MY_ROLE}
            </div>
          </div>
        </div>

        <div className="px-6 py-8 max-w-7xl mx-auto space-y-8">

          {/* KPI Row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
            <StatCard label="Pending Items" value={pendingVouchers.length} sub="Awaiting your review" />
            <StatCard label="Duplicate Flags" value={duplicateFlagsCount} sub="System warnings detected" alert={duplicateFlagsCount > 0} />
            <StatCard label="Processed Today" value={processedTodayCount} sub="Approved or rejected" />
            <StatCard label="Voucher Types" value={new Set(allVouchers.map((v) => v.voucher_type_id)).size} sub="Across all submissions" />
          </div>

          <div className="bg-white dark:bg-zinc-900/40 border border-gray-200 dark:border-zinc-800/50 rounded-xl overflow-hidden shadow-sm">

            {/* Tabs */}
            <div className="border-b border-gray-200 dark:border-zinc-800/80 bg-gray-50 dark:bg-zinc-900/50">
              <div className="flex items-center gap-6 px-4 pt-4 border-b border-gray-200 dark:border-zinc-800 overflow-x-auto">
                {TAB_CONFIG.map(({ key, label, badge }) => {
                  const isFlagged = key === "flagged";
                  const isActive = activeTab === key;
                  return (
                    <button
                      key={key}
                      onClick={() => setActiveTab(key)}
                      className={`pb-3 text-sm font-medium transition-colors border-b-2 whitespace-nowrap flex items-center gap-1.5 ${
                        isActive
                          ? isFlagged ? "border-red-500 text-red-600 dark:text-red-400" : "border-gray-900 dark:border-zinc-100 text-gray-900 dark:text-zinc-100"
                          : "border-transparent text-gray-500 dark:text-zinc-400 hover:text-gray-700 dark:hover:text-zinc-300"
                      }`}
                    >
                      {label}
                      {badge !== undefined && badge > 0 && (
                        <span className={`py-0.5 px-1.5 rounded text-[10px] ${isFlagged ? "bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400" : "bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-zinc-400"}`}>
                          {badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Search */}
              <div className="p-4">
                <div className="relative w-full sm:w-80">
                  <SearchNormal1 size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-zinc-500" color="currentColor" />
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search by name, code, department…"
                    className="w-full bg-white dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-lg pl-10 pr-4 py-2 text-sm text-gray-900 dark:text-zinc-200 placeholder-gray-400 dark:placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-gray-400 dark:focus:ring-zinc-600 transition-all"
                  />
                </div>
              </div>
            </div>

            {/* List */}
            {isLoading ? (
              <section className="h-32 flex items-center justify-center bg-black">
                <Loader />
              </section>
            ) : displayedVouchers.length === 0 ? (
              <div className="py-24 flex flex-col items-center justify-center text-center">
                <Filter size={32} className="text-gray-300 dark:text-zinc-700 mb-4" color="currentColor" />
                <p className="text-sm font-medium text-gray-900 dark:text-zinc-300">No records found</p>
                <p className="text-xs text-gray-500 dark:text-zinc-500 mt-1">Try adjusting your filters or search query.</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100 dark:divide-zinc-800/80">
                {displayedVouchers.map((v) => (
                  <VoucherRow key={v.id} voucher={v} onClick={() => setSelectedVoucher(v)} />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Modal */}
        {selectedVoucher && (
          <ReviewModal
            voucher={selectedVoucher}
            onClose={() => setSelectedVoucher(null)}
            onApprove={handleApprove}
            onReject={handleReject}
            onDismissDuplicate={handleDismissDuplicate}
            isPending={isPending}
          />
        )}
      </div>
    </Layout>
  );
}