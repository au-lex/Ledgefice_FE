import React, { useState } from "react";
import {
  Building,
  Add,
  Edit2,
  Trash,
  CloseCircle,
  SearchNormal1,
  Warning2,
  Moneys,
  Briefcase,
  Box,
  SecuritySafe,
  Monitor,
  Setting2,
  ChartSquare,
  TruckFast,
  Shop,
} from "iconsax-react";
import Layout from "../../../layout/Layout";
import {
  useListDepartments,
  useCreateDepartment,
  useUpdateDepartment,
  useDeleteDepartment,
  type DepartmentWithStats,
  type CreateDepartmentPayload,
  type UpdateDepartmentPayload,
} from "../../../api/hooks/useDepartments";
import type { PermissionMap } from "../../../api/hooks/useAuth";


type Permission = keyof PermissionMap;

interface PermissionGroup {
  label: string;
  manageKey?: Permission; // when set, this toggle also flips every key in `perms`
  perms: Permission[];
}

const PERMISSION_GROUPS: PermissionGroup[] = [
  {
    label: "Vouchers",
    perms: [
      "can_create",
      "can_approve",
      "can_dismiss_duplicates",
      "can_view_all",
      "can_view_all_vouchers",
      "can_view_reports",
    ] as Permission[],
  },
  {
    label: "Voucher Types",
    manageKey: "can_manage_voucher_types" as Permission,
    perms: [
      "can_view_voucher_types",
      "can_create_voucher_types",
      "can_edit_voucher_types",
      "can_delete_voucher_types",
    ] as Permission[],
  },
  {
    label: "Billings",
    manageKey: "can_manage_billings" as Permission,
    perms: ["can_view_billings", "can_create_billings", "can_edit_billings", "can_delete_billings"] as Permission[],
  },
  {
    label: "Approval Chains",
    perms: [
      "can_view_approval_chains",
      "can_create_approval_chains",
      "can_edit_approval_chains",
      "can_delete_approval_chains",
    ] as Permission[],
  },
  {
    label: "Departments",
    perms: [
      "can_view_departments",
      "can_create_departments",
      "can_edit_departments",
      "can_delete_departments",
    ] as Permission[],
  },
  {
    label: "Administration",
    perms: ["can_manage_users", "can_configure", "can_view_audit_logs", "can_export_audit_logs"] as Permission[],
  },
];

const ALL_PERMISSION_KEYS = PERMISSION_GROUPS.flatMap((g) => [
  ...(g.manageKey ? [g.manageKey] : []),
  ...g.perms,
]) as Permission[];

function buildEmptyPermissions(): PermissionMap {
  const perms = {} as PermissionMap;
  ALL_PERMISSION_KEYS.forEach((k) => {
    (perms as any)[k] = false;
  });
  return perms;
}

function permLabel(key: Permission) {
  return String(key)
    .replace(/^can_/, "")
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function permCount(perms: PermissionMap | undefined) {
  if (!perms) return 0;
  return Object.values(perms).filter(Boolean).length;
}

// ─── Icon Dictionary ──────────────────────────────────────────────────────────

const ICON_MAP: Record<string, React.ReactNode> = {
  Building: <Building size={20} color="currentColor" variant="Bulk" />,
  Moneys: <Moneys size={20} color="currentColor" variant="Bulk" />,
  Briefcase: <Briefcase size={20} color="currentColor" variant="Bulk" />,
  Box: <Box size={20} color="currentColor" variant="Bulk" />,
  SecuritySafe: <SecuritySafe size={20} color="currentColor" variant="Bulk" />,
  Monitor: <Monitor size={20} color="currentColor" variant="Bulk" />,
  Setting2: <Setting2 size={20} color="currentColor" variant="Bulk" />,
  ChartSquare: <ChartSquare size={20} color="currentColor" variant="Bulk" />,
  TruckFast: <TruckFast size={20} color="currentColor" variant="Bulk" />,
  Shop: <Shop size={20} color="currentColor" variant="Bulk" />,
};

const DEPT_ICON_KEYS = Object.keys(ICON_MAP);

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatAmount(n: number) {
  if (n >= 1_000_000) return "₦" + (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000) return "₦" + (n / 1_000).toFixed(0) + "K";
  return "₦" + n.toLocaleString("en-NG");
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

// ─── Components ───────────────────────────────────────────────────────────────

function StatCard({ label, value, sub }: { label: string; value: string | number; sub: string }) {
  return (
    <div className="bg-pri border border-zinc-800/80 rounded-xl p-5 flex flex-col justify-between shadow-sm">
      <p className="text-xs text-zinc-400 font-medium mb-3">{label}</p>
      <p className="text-2xl font-medium text-zinc-50 tracking-tight">{value}</p>
      <p className="text-[11px] text-zinc-500 mt-2">{sub}</p>
    </div>
  );
}

function CheckMark() {
  return (
    <svg viewBox="0 0 16 16" width="10" height="10" fill="none">
      <path d="M3 8.5L6 11.5L13 4.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function PermToggle({
  checked,
  label,
  onClick,
  emphasis,
}: {
  checked: boolean;
  label: string;
  onClick: () => void;
  emphasis?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-2 text-left px-2.5 py-2 rounded-lg border transition-all ${
        emphasis
          ? checked
            ? "border-zinc-500 bg-zinc-800"
            : "border-zinc-700/80 bg-zinc-900/60"
          : checked
          ? "border-zinc-700 bg-zinc-900"
          : "border-zinc-800/60 bg-zinc-950/40 hover:bg-zinc-900/60"
      }`}
    >
      <span
        className={`w-4 h-4 rounded flex items-center justify-center flex-shrink-0 border ${
          checked ? "bg-zinc-100 border-zinc-100 text-zinc-900" : "border-zinc-700 text-transparent"
        }`}
      >
        <CheckMark />
      </span>
      <span className={`text-xs ${emphasis ? "font-semibold text-zinc-100" : "text-zinc-300"}`}>{label}</span>
    </button>
  );
}

function SkeletonRow() {
  return (
    <div className="bg-pri border border-zinc-800/80 rounded-xl px-5 py-4 flex items-center gap-4 animate-pulse">
      <div className="w-10 h-10 rounded-xl bg-zinc-800/60 flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-3.5 w-32 bg-zinc-800/60 rounded" />
        <div className="h-2.5 w-24 bg-zinc-800/60 rounded" />
      </div>
      <div className="hidden sm:flex gap-8">
        <div className="h-3 w-10 bg-zinc-800/60 rounded" />
        <div className="h-3 w-10 bg-zinc-800/60 rounded" />
        <div className="h-3 w-16 bg-zinc-800/60 rounded" />
      </div>
    </div>
  );
}

// ─── Modals ───────────────────────────────────────────────────────────────────

function DeptModal({
  dept,
  onClose,
  onSubmit,
  isSaving,
}: {
  dept: DepartmentWithStats | null;
  onClose: () => void;
  onSubmit: (payload: CreateDepartmentPayload | UpdateDepartmentPayload) => void;
  isSaving: boolean;
}) {
  const isNew = dept === null;
  const [name, setName] = useState(dept?.name ?? "");
  const [code, setCode] = useState(dept?.code ?? "");
  const [iconKey, setIconKey] = useState(dept?.icon_key ?? "Building");
  const [permissions, setPermissions] = useState<PermissionMap>(
    dept?.permissions ?? buildEmptyPermissions()
  );

  const allOn = ALL_PERMISSION_KEYS.every((k) => permissions[k]);

  function togglePerm(key: Permission) {
    setPermissions((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  function toggleKeys(keys: Permission[], value: boolean) {
    setPermissions((prev) => {
      const next = { ...prev };
      keys.forEach((k) => {
        (next as any)[k] = value;
      });
      return next;
    });
  }

  function handleManageToggle(group: PermissionGroup) {
    if (!group.manageKey) return;
    const newVal = !permissions[group.manageKey];
    toggleKeys([group.manageKey, ...group.perms], newVal);
  }

  function handleSave() {
    if (!name.trim() || !code.trim() || isSaving) return;
    onSubmit({
      name: name.trim(),
      code: code.trim().toUpperCase(),
      icon_key: iconKey,
      permissions,
    });
  }

  const canSave = !!name.trim() && !!code.trim() && !isSaving;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm bg-black/60 transition-opacity">
      <div className="relative bg-zinc-900 border border-zinc-800 rounded-xl w-full max-w-lg shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-pri">
          <div>
            <h2 className="text-sm font-medium text-zinc-100">{isNew ? "Create Department" : "Edit Department"}</h2>
            <p className="text-[11px] text-zinc-500 mt-0.5">
              {isNew
                ? "New departments will be available for issue tagging immediately."
                : `Updating settings for ${dept.name}`}
            </p>
          </div>
          <button onClick={onClose} className="text-zinc-500 hover:text-zinc-300 transition-colors">
            <CloseCircle size={18} color="currentColor" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6 custom-scrollbar overflow-y-auto max-h-[70vh]">
          {/* Icon picker */}
          <div>
            <label className="block text-[10px] font-medium text-zinc-500 mb-2 uppercase tracking-widest">
              Department Icon
            </label>
            <div className="flex flex-wrap gap-2">
              {DEPT_ICON_KEYS.map((key) => (
                <button
                  key={key}
                  onClick={() => setIconKey(key)}
                  className={`w-10 h-10 rounded-lg border flex items-center justify-center transition-all ${
                    iconKey === key
                      ? "border-zinc-400 bg-zinc-800 text-zinc-100 shadow-sm"
                      : "border-zinc-800/80 bg-zinc-950/50 text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 hover:border-zinc-700"
                  }`}
                >
                  {ICON_MAP[key]}
                </button>
              ))}
            </div>
          </div>

          {/* Name */}
          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1.5">Department Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Site Operations"
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2.5 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-zinc-600 focus:ring-1 focus:ring-zinc-600 transition-all font-medium"
            />
          </div>

          {/* Code */}
          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1.5">Short Code</label>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase().slice(0, 6))}
              placeholder="e.g. SITE"
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2.5 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-zinc-600 focus:ring-1 focus:ring-zinc-600 transition-all font-mono tracking-widest"
            />
            <p className="text-[11px] text-zinc-500 mt-1.5">
              Used as a prefix in issue codes (e.g. SITE-001). Max 6 characters.
            </p>
          </div>

          {/* Permissions */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="block text-[10px] font-medium text-zinc-500 uppercase tracking-widest">
                Permissions
              </label>
              <button
                type="button"
                onClick={() => toggleKeys(ALL_PERMISSION_KEYS, !allOn)}
                className="text-[11px] font-medium text-zinc-400 hover:text-zinc-100 transition-colors"
              >
                {allOn ? "Clear all" : "Select all"}
              </button>
            </div>

            <div className="space-y-5">
              {PERMISSION_GROUPS.map((group) => (
                <div key={group.label}>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-[11px] font-semibold text-zinc-300">{group.label}</p>
                    {group.manageKey && (
                      <button
                        type="button"
                        onClick={() => toggleKeys(group.perms, !group.perms.every((p) => permissions[p]))}
                        className="text-[10px] text-zinc-500 hover:text-zinc-300 transition-colors"
                      >
                        {group.perms.every((p) => permissions[p]) ? "Clear" : "Select all"}
                      </button>
                    )}
                  </div>

                  {group.manageKey && (
                    <div className="mb-2">
                      <PermToggle
                        checked={!!permissions[group.manageKey]}
                        label={`Manage ${group.label} (full access)`}
                        onClick={() => handleManageToggle(group)}
                        emphasis
                      />
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-2">
                    {group.perms.map((p) => (
                      <PermToggle
                        key={String(p)}
                        checked={!!permissions[p]}
                        label={permLabel(p)}
                        onClick={() => togglePerm(p)}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-zinc-800 flex justify-end gap-3 bg-zinc-900/80">
          <button
            onClick={onClose}
            disabled={isSaving}
            className="px-4 py-2 rounded-lg text-sm text-zinc-400 font-medium hover:text-zinc-100 hover:bg-zinc-800 transition-all disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!canSave}
            className="px-5 py-2 rounded-lg bg-zinc-100 text-sm text-zinc-900 font-medium hover:bg-white transition-all shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {isSaving ? "Saving…" : isNew ? "Create Department" : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}

function DeleteModal({
  dept,
  onClose,
  onConfirm,
  isDeleting,
}: {
  dept: DepartmentWithStats;
  onClose: () => void;
  onConfirm: () => void;
  isDeleting: boolean;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm bg-black/60 transition-opacity">
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl w-full max-w-sm shadow-2xl overflow-hidden">
        <div className="p-6 space-y-4">
          <div className="w-10 h-10 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center">
            <Trash color="currentColor" size={18} className="text-rose-400" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-zinc-100">Remove {dept.name}?</h2>
            <p className="text-xs text-zinc-400 mt-1.5 leading-relaxed">
              This department will be removed permanently. Existing records tagged to this department will remain
              intact but it will no longer be selectable.
            </p>
          </div>
          {dept.active_vouchers > 0 && (
            <div className="flex items-start gap-2.5 bg-amber-500/10 border border-amber-500/20 rounded-lg px-3 py-3">
              <Warning2 color="currentColor" size={14} className="text-amber-400 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-amber-400">
                {dept.active_vouchers} active issue{dept.active_vouchers !== 1 ? "s are" : " is"} currently attached
                to this department.
              </p>
            </div>
          )}
        </div>
        <div className="px-6 pb-5 flex gap-3 justify-end bg-zinc-900/80">
          <button
            onClick={onClose}
            disabled={isDeleting}
            className="px-4 py-2 rounded-lg text-sm text-zinc-400 font-medium hover:text-zinc-100 hover:bg-zinc-800 transition-all disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isDeleting}
            className="px-5 py-2 rounded-lg bg-rose-600 text-sm text-white font-medium hover:bg-rose-500 transition-all shadow-sm disabled:opacity-60"
          >
            {isDeleting ? "Deleting…" : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Department Row ───────────────────────────────────────────────────────────

function DeptRow({
  dept,
  onEdit,
  onDelete,
  totalSpend,
}: {
  dept: DepartmentWithStats;
  onEdit: () => void;
  onDelete: () => void;
  totalSpend: number;
}) {
  const spendPct = totalSpend > 0 ? (dept.total_spend / totalSpend) * 100 : 0;

  return (
    <div className="group bg-pri border border-zinc-800/80 hover:border-zinc-700 rounded-xl px-5 py-4 flex flex-col sm:flex-row sm:items-center gap-4 transition-all shadow-sm hover:shadow-md">
      {/* Icon + Basic Info */}
      <div className="flex items-center gap-4 flex-1 min-w-0">
        <div className="w-10 h-10 rounded-xl bg-zinc-800/50 border border-zinc-700/50 text-zinc-400 flex items-center justify-center flex-shrink-0 shadow-inner">
          {ICON_MAP[dept.icon_key] || <Building color="currentColor" size={20} variant="Bulk" />}
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-sm font-semibold text-zinc-100 truncate">{dept.name}</span>
            <span className="text-[10px] font-mono font-medium text-zinc-500 bg-zinc-950 border border-zinc-800 px-1.5 py-0.5 rounded tracking-wide flex-shrink-0">
              {dept.code}
            </span>
            <span className="text-[10px] font-medium text-zinc-500 bg-zinc-950 border border-zinc-800 px-1.5 py-0.5 rounded flex-shrink-0">
              {permCount(dept.permissions)} perms
            </span>
          </div>
          <p className="text-[11px] text-zinc-500">Added {formatDate(dept.created_at)}</p>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-3 sm:flex items-center gap-6 sm:gap-8 flex-shrink-0 pt-3 border-t border-zinc-800/50 sm:pt-0 sm:border-0 mt-1 sm:mt-0">
        <div className="text-left sm:text-center">
          <p className="text-sm font-semibold text-zinc-100">{dept.head_count}</p>
          <p className="text-[10px] text-zinc-500 mt-0.5">Staff</p>
        </div>

        <div className="text-left sm:text-center">
          <div className="flex items-center gap-1.5 sm:justify-center">
            <p className="text-sm font-semibold text-zinc-100">{dept.active_vouchers}</p>
            {dept.active_vouchers > 0 && (
              <div className="w-1.5 h-1.5 rounded-full bg-amber-400 shadow-[0_0_6px_rgba(251,191,36,0.6)]" />
            )}
          </div>
          <p className="text-[10px] text-zinc-500 mt-0.5">Active</p>
        </div>

        <div className="text-right min-w-[100px]">
          <p className="text-sm font-semibold text-zinc-100">{formatAmount(dept.total_spend)}</p>
          <div className="mt-1.5 h-1 w-full bg-zinc-800 rounded-full overflow-hidden">
            <div className="h-full bg-zinc-400 rounded-full transition-all duration-500" style={{ width: `${spendPct}%` }} />
          </div>
          <p className="text-[9px] text-zinc-500 mt-1 uppercase tracking-widest">{spendPct.toFixed(0)}% Share</p>
        </div>
      </div>

      {/* Actions */}
      <div className="hidden sm:flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 pl-2 ml-2 border-l border-zinc-800">
        <button onClick={onEdit} className="p-1.5 rounded-md text-zinc-500 hover:text-zinc-100 hover:bg-zinc-800 transition-colors">
          <Edit2 size={16} color="currentColor" />
        </button>
        <button onClick={onDelete} className="p-1.5 rounded-md text-zinc-500 hover:text-rose-400 hover:bg-zinc-800 transition-colors">
          <Trash size={16} color="currentColor" />
        </button>
      </div>

      {/* Mobile Actions */}
      <div className="sm:hidden flex items-center justify-end gap-2 pt-2">
        <button onClick={onEdit} className="text-[11px] text-zinc-400 px-3 py-1 rounded bg-zinc-800/50 border border-zinc-800">
          Edit
        </button>
        <button onClick={onDelete} className="text-[11px] text-rose-400 px-3 py-1 rounded bg-rose-500/10 border border-rose-500/20">
          Delete
        </button>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function DepartmentsPage() {
  const [search, setSearch] = useState("");
  const [editingDept, setEditingDept] = useState<DepartmentWithStats | null | "new">(null);
  const [deletingDept, setDeletingDept] = useState<DepartmentWithStats | null>(null);

  const { data: departments = [], isLoading, isError, error } = useListDepartments();
  const createDepartment = useCreateDepartment();
  const updateDepartment = useUpdateDepartment();
  const deleteDepartment = useDeleteDepartment();

  const totalSpend = departments.reduce((s, d) => s + d.total_spend, 0);
  const totalStaff = departments.reduce((s, d) => s + d.head_count, 0);
  const totalActiveVouchers = departments.reduce((s, d) => s + d.active_vouchers, 0);

  const filtered = departments.filter(
    (d) => d.name.toLowerCase().includes(search.toLowerCase()) || d.code.toLowerCase().includes(search.toLowerCase())
  );

  function handleModalSubmit(payload: CreateDepartmentPayload | UpdateDepartmentPayload) {
    if (editingDept === "new") {
      createDepartment.mutate(payload as CreateDepartmentPayload, {
        onSuccess: () => setEditingDept(null),
      });
    } else if (editingDept) {
      updateDepartment.mutate(
        { id: editingDept.id, payload },
        { onSuccess: () => setEditingDept(null) }
      );
    }
  }

  function handleConfirmDelete() {
    if (!deletingDept) return;
    deleteDepartment.mutate(deletingDept.id, {
      onSuccess: () => setDeletingDept(null),
    });
  }

  return (
    <Layout>
      <div className="min-h-screen bg-zinc-950 text-zinc-300 font-sans pb-16 selection:bg-zinc-800 selection:text-zinc-100">
        {/* Top Nav */}
        <div className="border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-md sticky top-0 z-10">
          <div className="px-6 h-16 flex items-center justify-between max-w-7xl mx-auto">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-zinc-900 rounded-lg border border-zinc-800/80 shadow-sm">
                <Building color="currentColor" size={18} className="text-zinc-400" />
              </div>
              <h1 className="text-sm font-medium text-zinc-100">Departments</h1>
              <span className="ml-2 bg-zinc-900 border border-zinc-800 text-zinc-400 text-[11px] px-2.5 py-0.5 rounded-full font-mono">
                {departments.length}
              </span>
            </div>
            <button
              onClick={() => setEditingDept("new")}
              className="flex items-center gap-1.5 bg-zinc-100 hover:bg-white transition-all text-zinc-950 text-sm font-medium px-4 py-2 rounded-lg shadow-sm"
            >
              <Add size={16} />
              New Department
            </button>
          </div>
        </div>

        <div className="px-6 py-8 max-w-7xl mx-auto space-y-8">
          {/* KPIs */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
            <StatCard label="Total Departments" value={departments.length} sub="Active cost centers" />
            <StatCard label="Total Staff" value={totalStaff} sub="Across all operations" />
            <StatCard label="Active Issues" value={totalActiveVouchers} sub="Pending approval currently" />
            <StatCard label="Aggregate Spend" value={formatAmount(totalSpend)} sub="Total approved historical value" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            {/* Left Col: Search + List */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-zinc-900/30 p-2 rounded-xl border border-zinc-800/50">
                <div className="relative w-full sm:w-80">
                  <SearchNormal1
                    color="currentColor"
                    size={15}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500"
                  />
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search by name or code..."
                    className="w-full bg-zinc-900 border-none rounded-lg pl-10 pr-4 py-2 text-sm text-zinc-200 placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-700 transition-all"
                  />
                </div>
                <div className="w-full sm:w-auto text-xs text-zinc-500 pr-2 font-medium">
                  Showing {filtered.length} results
                </div>
              </div>

              {isError ? (
                <div className="py-24 flex flex-col items-center justify-center text-center border border-dashed border-zinc-800 rounded-xl bg-zinc-900/20">
                  <Warning2 size={32} color="currentColor" className="text-rose-400 mb-4" />
                  <p className="text-sm font-medium text-rose-400">Failed to load departments</p>
                  <p className="text-xs text-zinc-500 mt-1">
                    {(error as any)?.response?.data?.message || error?.message || "Please try again."}
                  </p>
                </div>
              ) : isLoading ? (
                <div className="flex flex-col gap-3">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <SkeletonRow key={i} />
                  ))}
                </div>
              ) : filtered.length === 0 ? (
                <div className="py-24 flex flex-col items-center justify-center text-center border border-dashed border-zinc-800 rounded-xl bg-zinc-900/20">
                  <Building size={32} color="currentColor" className="text-zinc-600 mb-4" />
                  <p className="text-sm font-medium text-zinc-300">No departments found</p>
                  <p className="text-xs text-zinc-500 mt-1">Adjust your search term or create a new department.</p>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {filtered.map((dept) => (
                    <DeptRow
                      key={dept.id}
                      dept={dept}
                      totalSpend={totalSpend}
                      onEdit={() => setEditingDept(dept)}
                      onDelete={() => setDeletingDept(dept)}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Right Col: Spend Breakdown */}
            {!isLoading && !isError && departments.length > 0 && (
              <div className="bg-zinc-900/40 border border-zinc-800/50 rounded-xl p-6 sticky top-24">
                <h3 className="text-sm font-medium text-zinc-100 mb-1">Spend Distribution</h3>
                <p className="text-xs text-zinc-500 mb-6">Historical expenditure split across all active cost centers.</p>

                <div className="space-y-5">
                  {[...departments]
                    .sort((a, b) => b.total_spend - a.total_spend)
                    .map((dept) => {
                      const pct = totalSpend > 0 ? (dept.total_spend / totalSpend) * 100 : 0;
                      return (
                        <div key={dept.id} className="group">
                          <div className="flex items-center justify-between mb-1.5">
                            <div className="flex items-center gap-2 min-w-0">
                              <span className="text-zinc-400">
                                {ICON_MAP[dept.icon_key] || <Building size={16} variant="Bulk" />}
                              </span>
                              <span className="text-xs font-medium text-zinc-300 truncate">{dept.name}</span>
                            </div>
                            <span className="text-xs font-mono text-zinc-400">{formatAmount(dept.total_spend)}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="flex-1 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-zinc-400 rounded-full transition-all duration-700"
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                            <span className="text-[10px] font-mono text-zinc-500 w-8 text-right">{pct.toFixed(1)}%</span>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Modals */}
        {editingDept !== null && (
          <DeptModal
            dept={editingDept === "new" ? null : editingDept}
            onClose={() => setEditingDept(null)}
            onSubmit={handleModalSubmit}
            isSaving={createDepartment.isPending || updateDepartment.isPending}
          />
        )}
        {deletingDept && (
          <DeleteModal
            dept={deletingDept}
            onClose={() => setDeletingDept(null)}
            onConfirm={handleConfirmDelete}
            isDeleting={deleteDepartment.isPending}
          />
        )}
      </div>
    </Layout>
  );
}