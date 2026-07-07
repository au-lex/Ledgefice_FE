import {
  Trash,
  User,
  MessageText,
  Calendar,
  Building,
} from "iconsax-react";
import type {
  Voucher,
  VoucherStatus,
  VoucherFieldValue,
} from "../../api/hooks/useVouchers";

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export const STATUS_CONFIG: Record<
  VoucherStatus,
  { label: string; dot: string; text: string; bg: string }
> = {
  pending: {
    label: "Pending",
    dot: "bg-zinc-400",
    text: "text-zinc-300",
    bg: "bg-zinc-800",
  },
  approved: {
    label: "Approved",
    dot: "bg-zinc-100",
    text: "text-zinc-100",
    bg: "bg-zinc-800",
  },
  rejected: {
    label: "Rejected",
    dot: "bg-red-500",
    text: "text-red-400",
    bg: "bg-red-500/10 border-red-500/20",
  },
  draft: {
    label: "Draft",
    dot: "bg-zinc-600",
    text: "text-zinc-400",
    bg: "bg-zinc-900",
  },
};

// Builds the approval timeline from the voucher's resolved amount_tier
// (real departments, real order) — never hardcoded roles.
export function getApprovalSteps(voucher: Voucher) {
  const steps = voucher.amount_tier?.steps ?? [];
  if (steps.length === 0) return [];

  const approvedDeptIds = new Set(
    (voucher.approval_history ?? [])
      .filter((h) => h.action === "approved")
      .map((h) => h.department_id)
  );

  return [...steps]
    .sort((a, b) => a.step_order - b.step_order)
    .map((step) => ({
      id: step.department_id,
      name: step.department?.name ?? "Unknown department",
      done: approvedDeptIds.has(step.department_id),
      active: voucher.current_approver_dept_id === step.department_id,
    }));
}

// ─── Status badge ─────────────────────────────────────────────────────────────

export function StatusBadge({ status }: { status: VoucherStatus }) {
  const cfg = STATUS_CONFIG[status];
  return (
    <div
      className={`flex items-center gap-1.5 px-2 py-1 rounded-md border border-zinc-700/50 ${cfg.bg}`}
    >
      <div className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      <span className={`text-[10px] font-medium leading-none ${cfg.text}`}>
        {cfg.label}
      </span>
    </div>
  );
}

// ─── Field value rendering ────────────────────────────────────────────────────

function FieldValueDisplay({ fv }: { fv: VoucherFieldValue }) {
  const type = fv.field?.type;

  if (type === "file" && fv.value) {
    return (
      <a
        href={fv.value}
        target="_blank"
        rel="noopener noreferrer"
        onClick={(e) => e.stopPropagation()}
        className="text-xs text-blue-400 underline underline-offset-2 truncate hover:opacity-80 transition-opacity"
      >
        View file ↗
      </a>
    );
  }

  if (type === "date" && fv.value) {
    return (
      <span className="text-sm text-zinc-200">
        {formatDate(fv.value)}
      </span>
    );
  }

  return (
    <span className="text-sm text-zinc-200 break-words">
      {fv.value || "—"}
    </span>
  );
}

export function VoucherFields({ fieldValues }: { fieldValues?: VoucherFieldValue[] }) {
  if (!fieldValues?.length) {
    return <p className="text-xs text-zinc-500 italic">No fields submitted</p>;
  }

  return (
    <div className="grid grid-cols-1 gap-x-4 gap-y-2.5">
      {fieldValues.map((fv) => (
        <div key={fv.id} className="flex flex-col min-w-0">
          <span className="text-[10px] font-medium text-zinc-500 uppercase tracking-wide truncate">
            {fv.field?.label ?? "Field"}
          </span>
          <FieldValueDisplay fv={fv} />
        </div>
      ))}
    </div>
  );
}

// ─── The reusable card ────────────────────────────────────────────────────────

export interface VoucherCardProps {
  voucher: Voucher;
  onDelete?: (id: string) => void;
  onSubmit?: (id: string) => void;
  onComment?: (voucher: Voucher) => void;
  isSubmitting?: boolean;
  isDeleting?: boolean;
}

export function VoucherCard({
  voucher: v,
  onDelete,
  onSubmit,
  onComment,
  isSubmitting,
  isDeleting,
}: VoucherCardProps) {
  const approvalSteps = getApprovalSteps(v);

  return (
    <div className="bg-zinc-900/80 border border-zinc-800/80 hover:border-zinc-700 rounded-xl p-5 transition-all group flex flex-col gap-5 relative shadow-sm hover:shadow-md">
      {/* Header */}
      <div className="flex justify-between items-center">
        <span className="text-[11px] font-mono text-zinc-400 tracking-wide bg-zinc-950 px-2 py-0.5 rounded border border-zinc-800">
          {v.code}
        </span>
        <StatusBadge status={v.status} />
      </div>

      {/* Type + field values */}
      <div>
        <h3 className="text-base font-semibold text-zinc-100 leading-snug mb-3">
          {v.voucher_type?.name ?? "Voucher"}
        </h3>

        <VoucherFields fieldValues={v.field_values} />

        <div className="flex flex-wrap gap-2 mt-3">
          {v.department && (
            <div className="inline-flex items-center gap-1 px-2 py-1 bg-pri border border-zinc-800 rounded-md text-[10px] text-zinc-400">
              <Building size={10} color="currentColor" />
              {v.department.name}
            </div>
          )}
          <div className="inline-flex items-center gap-1 px-2 py-1 bg-pri border border-zinc-800 rounded-md text-[10px] text-zinc-400">
            <Calendar size={10} color="currentColor" />
            {formatDate(v.created_at)}
          </div>
          {v.duplicate_flag?.is_duplicate && !v.duplicate_flag.dismissed_at && (
            <span className="inline-flex px-2 py-1 border border-red-500/30 bg-red-500/10 rounded-md text-[10px] font-medium text-red-400">
              Possible duplicate
            </span>
          )}
        </div>
      </div>

      {/* Approval flow */}
      {approvalSteps.length > 0 && (
        <div className="bg-pri/50 rounded-lg p-3.5 border border-zinc-800/50">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[10px] font-medium text-zinc-500 uppercase tracking-widest">
              Approval Flow
            </p>
            <span className="text-[10px] text-zinc-500 font-mono">
              {v.amount_tier?.label ?? `Tier ${v.tier}`}
            </span>
          </div>
          <div className="flex flex-col gap-2 border-l border-zinc-800 ml-1.5 pl-3.5 relative">
            {approvalSteps.map((step) => (
              <div key={step.id} className="flex items-center justify-between relative">
                <div className="flex items-center gap-2.5">
                  <div
                    className={`w-2 h-2 rounded-full absolute -left-[19px] border-2 border-zinc-900 ${step.done
                      ? "bg-zinc-400"
                      : step.active
                        ? "bg-zinc-100 shadow-[0_0_8px_rgba(255,255,255,0.2)]"
                        : "bg-zinc-700"
                      }`}
                  />
                  <span
                    className={`text-[11px] ${step.done
                      ? "text-zinc-400"
                      : step.active
                        ? "text-zinc-100 font-medium"
                        : "text-zinc-600"
                      }`}
                  >
                    {step.name}
                  </span>
                </div>
                {step.active && (
                  <span className="text-[9px] font-medium text-zinc-300 bg-zinc-800 px-1.5 py-0.5 rounded">
                    Pending Action
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-zinc-800/80">
        <div className="flex items-center gap-2 text-zinc-400">
          <div className="w-6 h-6 rounded-full bg-zinc-800 flex items-center justify-center border border-zinc-700 text-zinc-300">
            <User size={12} color="currentColor" />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] text-zinc-500 leading-none mb-0.5">Raised by</span>
            <span className="text-[11px] font-medium text-zinc-300 leading-none">
              {v.raised_by?.name ?? "—"}
            </span>
          </div>
        </div>
      </div>

      {/* Hover actions */}
      <div className="absolute top-4 right-4 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        {v.status === "draft" && onDelete && (
          <button
            onClick={() => onDelete(v.id)}
            disabled={isDeleting}
            className="p-1.5 rounded-md bg-zinc-800 border border-zinc-700 text-zinc-400 hover:text-red-400 hover:border-red-500/30 transition-colors shadow-sm disabled:opacity-40"
          >
            <Trash size={14} color="currentColor" />
          </button>
        )}
        {(v.status === "pending" || v.status === "approved") && onComment && (
          <button
            onClick={() => onComment(v)}
            className="p-1.5 rounded-md bg-zinc-800 border border-zinc-700 text-zinc-400 hover:text-zinc-100 transition-colors shadow-sm"
          >
            <MessageText size={14} color="currentColor" />
          </button>
        )}
      </div>

      {/* Submit CTA */}
      {v.status === "draft" && onSubmit && (
        <button
          onClick={() => onSubmit(v.id)}
          disabled={isSubmitting}
          className="w-full mt-2 py-2 rounded-lg bg-zinc-100 text-zinc-900 text-xs font-medium hover:bg-white transition-all shadow-sm disabled:opacity-40"
        >
          {isSubmitting ? "Submitting…" : "Submit for Approval"}
        </button>
      )}
    </div>
  );
}