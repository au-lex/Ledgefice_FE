import React, { useState } from "react";
import {
  Hierarchy,
  Add,
  Trash,
  Edit2,
  CloseCircle,
  ArrowRight2,
  TickCircle,
  Warning2,
  Setting2,
  DocumentText,
  ArrowDown2,
  ArrowUp2,

  Receipt21,
} from "iconsax-react";
import Layout from "../../../layout/Layout";
import {
  useListApprovalChains,
  useCreateApprovalChain,
  useUpdateApprovalChain,
  type ApprovalChain,
  type AmountTier,
  type AmountTierInput,
} from "../../../api/hooks/useApprovalChains";
import { useListVoucherTypes, type VoucherType } from "../../../api/hooks/useVoucherTypes";
import { useListDepartments, type DepartmentWithStats } from "../../../api/hooks/useDepartments";
import Loader from "../../../components/ui/Loader";

// ─── Types ────────────────────────────────────────────────────────────────────

interface LocalStep {
  id: string;
  department_id: string;
}

interface LocalTier {
  id: string;
  label: string;
  min_amount: number;
  max_amount: number | null;
  steps: LocalStep[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const genTempId = () => `tmp_${Math.random().toString(36).slice(2, 9)}`;

function formatAmount(n: number) {
  return "₦" + n.toLocaleString("en-NG");
}

function formatRange(tier: LocalTier | AmountTier) {
  const min = tier.min_amount;
  const max = tier.max_amount;
  if (max === null) return `${formatAmount(min)} and above`;
  return `${formatAmount(min)} – ${formatAmount(max)}`;
}

function tierToLocal(tier: AmountTier): LocalTier {
  return {
    id: tier.id,
    label: tier.label,
    min_amount: tier.min_amount,
    max_amount: tier.max_amount,
    steps: tier.steps
      .slice()
      .sort((a, b) => a.step_order - b.step_order)
      .map((s) => ({ id: s.id, department_id: s.department_id })),
  };
}

function localTierToInput(tier: LocalTier, sort_order: number): AmountTierInput {
  return {
    label: tier.label,
    min_amount: tier.min_amount,
    max_amount: tier.max_amount,
    sort_order,
    steps: tier.steps.map((s, i) => ({ department_id: s.department_id, step_order: i })),
  };
}



// ─── Stat Card ────────────────────────────────────────────────────────────────

function StatCard({ label, value, sub }: { label: string; value: string | number; sub: string }) {
  return (
    <div className="bg-white dark:bg-zinc-900/50 border border-gray-200 dark:border-zinc-800/80 rounded-xl p-5 flex flex-col justify-between shadow-sm">
      <p className="text-xs text-gray-500 dark:text-zinc-400 font-medium mb-3">{label}</p>
      <p className="text-2xl font-medium text-gray-900 dark:text-zinc-50 tracking-tight">{value}</p>
      <p className="text-[11px] text-gray-400 dark:text-zinc-500 mt-2">{sub}</p>
    </div>
  );
}

// ─── Create Chain Modal ───────────────────────────────────────────────────────

interface CreateChainModalProps {
  voucherTypes: VoucherType[];
  departments: DepartmentWithStats[];
  existingVoucherTypeIds: Set<string>;
  onClose: () => void;
  onSave: (voucherTypeId: string, tiers: AmountTierInput[]) => void;
  isPending: boolean;
}

function CreateChainModal({ voucherTypes, departments, existingVoucherTypeIds, onClose, onSave, isPending }: CreateChainModalProps) {
  const available = voucherTypes.filter((vt) => !existingVoucherTypeIds.has(vt.id));
  const [selectedTypeId, setSelectedTypeId] = useState(available[0]?.id ?? "");
  const [tiers, setTiers] = useState<LocalTier[]>([]);

  const canSave =
    !!selectedTypeId &&
    tiers.every((t) => t.label.trim().length > 0 && t.steps.every((s) => !!s.department_id));

  function addTier() {
    const last = tiers[tiers.length - 1];
    const newMin = last ? (last.max_amount ?? 0) + 1 : 0;
    setTiers([...tiers, { id: genTempId(), label: "New Tier", min_amount: newMin, max_amount: null, steps: [] }]);
  }

  function removeTier(id: string) { setTiers(tiers.filter((t) => t.id !== id)); }
  function updateTier(id: string, patch: Partial<LocalTier>) { setTiers(tiers.map((t) => (t.id === id ? { ...t, ...patch } : t))); }
  function addStep(tierId: string) {
    const defaultDeptId = departments[0]?.id ?? "";
    setTiers(tiers.map((t) => t.id === tierId ? { ...t, steps: [...t.steps, { id: genTempId(), department_id: defaultDeptId }] } : t));
  }
  function removeStep(tierId: string, stepId: string) { setTiers(tiers.map((t) => t.id === tierId ? { ...t, steps: t.steps.filter((s) => s.id !== stepId) } : t)); }
  function updateStep(tierId: string, stepId: string, departmentId: string) { setTiers(tiers.map((t) => t.id === tierId ? { ...t, steps: t.steps.map((s) => s.id === stepId ? { ...s, department_id: departmentId } : s) } : t)); }
  function moveStep(tierId: string, stepId: string, dir: "up" | "down") {
    setTiers(tiers.map((t) => {
      if (t.id !== tierId) return t;
      const idx = t.steps.findIndex((s) => s.id === stepId);
      if (dir === "up" && idx === 0) return t;
      if (dir === "down" && idx === t.steps.length - 1) return t;
      const steps = [...t.steps];
      const swap = dir === "up" ? idx - 1 : idx + 1;
      [steps[idx], steps[swap]] = [steps[swap], steps[idx]];
      return { ...t, steps };
    }));
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm bg-black/60">
      <div className="relative bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl w-full max-w-2xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-900/50">
          <div className="flex items-center gap-3">
            <Receipt21 size={18} color="currentColor" className="text-gray-500 dark:text-zinc-400" />
            <h2 className="text-sm font-medium text-gray-900 dark:text-zinc-100">New Approval Chain</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 dark:text-zinc-500 hover:text-gray-600 dark:hover:text-zinc-300">
            <CloseCircle size={18} color="currentColor" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-6 flex-1 bg-gray-50/50 dark:bg-zinc-950/30">
          {/* Voucher type selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-gray-600 dark:text-zinc-400">Voucher Type</label>
            {available.length === 0 ? (
              <p className="text-xs text-gray-400 dark:text-zinc-500 py-3 text-center border border-dashed border-gray-200 dark:border-zinc-800 rounded-lg">
                All voucher types already have approval chains.
              </p>
            ) : (
              <select
                value={selectedTypeId}
                onChange={(e) => setSelectedTypeId(e.target.value)}
                className="w-full text-sm bg-white dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-lg px-3 py-2 outline-none focus:border-gray-400 dark:focus:border-zinc-600 text-gray-900 dark:text-zinc-200"
              >
                {available.map((vt) => (
                  <option key={vt.id} value={vt.id}>{vt.name}</option>
                ))}
              </select>
            )}
          </div>

          {departments.length === 0 && (
            <div className="flex items-start gap-3 bg-gray-100 dark:bg-zinc-800/50 border border-gray-200 dark:border-zinc-700/50 rounded-xl px-4 py-3">
              <Warning2 size={16} color="currentColor" className="text-gray-500 dark:text-zinc-400 mt-0.5" />
              <p className="text-xs text-gray-600 dark:text-zinc-400">
                No departments exist yet. Create at least one department before assigning approval steps.
              </p>
            </div>
          )}

          {/* Tiers */}
          <TierEditor
            tiers={tiers}
            departments={departments}
            onAddTier={addTier}
            onRemoveTier={removeTier}
            onUpdateTier={updateTier}
            onAddStep={addStep}
            onRemoveStep={removeStep}
            onUpdateStep={updateStep}
            onMoveStep={moveStep}
          />
        </div>

        <div className="p-4 border-t border-gray-200 dark:border-zinc-800 flex justify-end gap-3 bg-gray-50 dark:bg-zinc-900/80">
          <button onClick={onClose} disabled={isPending} className="px-4 py-2 rounded-lg text-sm text-gray-600 dark:text-zinc-400 font-medium hover:bg-gray-200 dark:hover:bg-zinc-800 disabled:opacity-40">
            Cancel
          </button>
          <button
            onClick={() => onSave(selectedTypeId, tiers.map((t, i) => localTierToInput(t, i)))}
            disabled={!canSave || isPending || available.length === 0}
            className="px-5 py-2 rounded-lg bg-gray-900 dark:bg-zinc-100 text-sm text-white dark:text-zinc-900 font-medium hover:bg-black dark:hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            {isPending ? "Creating…" : "Create Chain"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Edit Chain Modal ─────────────────────────────────────────────────────────

interface EditChainModalProps {
  chain: ApprovalChain;
  departments: DepartmentWithStats[];
  onClose: () => void;
  onSave: (id: string, tiers: AmountTierInput[]) => void;
  isPending: boolean;
}

function EditChainModal({ chain, departments, onClose, onSave, isPending }: EditChainModalProps) {
  const [tiers, setTiers] = useState<LocalTier[]>(
    chain.tiers.slice().sort((a, b) => a.sort_order - b.sort_order).map(tierToLocal)
  );

  const voucherTypeName = chain.voucher_type?.name ?? "Unknown Type";

  function addTier() {
    const last = tiers[tiers.length - 1];
    const newMin = last ? (last.max_amount ?? 0) + 1 : 0;
    setTiers([...tiers, { id: genTempId(), label: "New Tier", min_amount: newMin, max_amount: null, steps: [] }]);
  }

  function removeTier(id: string) { setTiers(tiers.filter((t) => t.id !== id)); }
  function updateTier(id: string, patch: Partial<LocalTier>) { setTiers(tiers.map((t) => (t.id === id ? { ...t, ...patch } : t))); }
  function addStep(tierId: string) {
    const defaultDeptId = departments[0]?.id ?? "";
    setTiers(tiers.map((t) => t.id === tierId ? { ...t, steps: [...t.steps, { id: genTempId(), department_id: defaultDeptId }] } : t));
  }
  function removeStep(tierId: string, stepId: string) { setTiers(tiers.map((t) => t.id === tierId ? { ...t, steps: t.steps.filter((s) => s.id !== stepId) } : t)); }
  function updateStep(tierId: string, stepId: string, departmentId: string) { setTiers(tiers.map((t) => t.id === tierId ? { ...t, steps: t.steps.map((s) => s.id === stepId ? { ...s, department_id: departmentId } : s) } : t)); }
  function moveStep(tierId: string, stepId: string, dir: "up" | "down") {
    setTiers(tiers.map((t) => {
      if (t.id !== tierId) return t;
      const idx = t.steps.findIndex((s) => s.id === stepId);
      if (dir === "up" && idx === 0) return t;
      if (dir === "down" && idx === t.steps.length - 1) return t;
      const steps = [...t.steps];
      const swap = dir === "up" ? idx - 1 : idx + 1;
      [steps[idx], steps[swap]] = [steps[swap], steps[idx]];
      return { ...t, steps };
    }));
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm bg-black/60">
      <div className="relative bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl w-full max-w-2xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-900/50">
          <div>
            <h2 className="text-sm font-medium text-gray-900 dark:text-zinc-100">Edit Approval Chain</h2>
            <p className="text-[11px] text-gray-500 dark:text-zinc-500 mt-0.5">{voucherTypeName} configuration</p>
          </div>
          <button onClick={onClose} className="text-gray-400 dark:text-zinc-500 hover:text-gray-600 dark:hover:text-zinc-300">
            <CloseCircle size={18} color="currentColor" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-6 flex-1 bg-gray-50/50 dark:bg-zinc-950/30">
          <TierEditor
            tiers={tiers}
            departments={departments}
            onAddTier={addTier}
            onRemoveTier={removeTier}
            onUpdateTier={updateTier}
            onAddStep={addStep}
            onRemoveStep={removeStep}
            onUpdateStep={updateStep}
            onMoveStep={moveStep}
          />
        </div>

        <div className="p-4 border-t border-gray-200 dark:border-zinc-800 flex justify-end gap-3 bg-gray-50 dark:bg-zinc-900/80">
          <button onClick={onClose} disabled={isPending} className="px-4 py-2 rounded-lg text-sm text-gray-600 dark:text-zinc-400 font-medium hover:bg-gray-200 dark:hover:bg-zinc-800 disabled:opacity-40">
            Cancel
          </button>
          <button
            onClick={() => onSave(chain.id, tiers.map((t, i) => localTierToInput(t, i)))}
            disabled={isPending}
            className="px-5 py-2 rounded-lg bg-gray-900 dark:bg-zinc-100 text-sm text-white dark:text-zinc-900 font-medium hover:bg-black dark:hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            {isPending ? "Saving…" : "Save Configuration"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Tier Editor (shared between both modals) ─────────────────────────────────

interface TierEditorProps {
  tiers: LocalTier[];
  departments: DepartmentWithStats[];
  onAddTier: () => void;
  onRemoveTier: (id: string) => void;
  onUpdateTier: (id: string, patch: Partial<LocalTier>) => void;
  onAddStep: (tierId: string) => void;
  onRemoveStep: (tierId: string, stepId: string) => void;
  onUpdateStep: (tierId: string, stepId: string, departmentId: string) => void;
  onMoveStep: (tierId: string, stepId: string, dir: "up" | "down") => void;
}

function TierEditor({ tiers, departments, onAddTier, onRemoveTier, onUpdateTier, onAddStep, onRemoveStep, onUpdateStep, onMoveStep }: TierEditorProps) {
  const noDepartments = departments.length === 0;

  return (
    <div className="space-y-4">
      {tiers.length === 0 && (
        <div className="py-12 flex flex-col items-center justify-center border border-dashed border-gray-300 dark:border-zinc-800 rounded-xl text-center bg-white dark:bg-zinc-900/20">
          <div className="text-gray-400 dark:text-zinc-600 mb-3">
            <Hierarchy size={28} color="currentColor" />
          </div>
          <p className="text-sm text-gray-700 dark:text-zinc-300 font-medium">No tiers defined yet</p>
          <p className="text-xs text-gray-500 dark:text-zinc-500 mt-1">Add an amount tier to start building this approval chain.</p>
        </div>
      )}

      {tiers.map((tier, tIdx) => (
        <div key={tier.id} className="bg-white dark:bg-zinc-900/80 border border-gray-200 dark:border-zinc-800/80 rounded-xl overflow-hidden shadow-sm">
          {/* Tier header */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-200 dark:border-zinc-800/80 bg-gray-50 dark:bg-zinc-900/90">
            <div className="w-5 h-5 rounded bg-gray-100 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 flex items-center justify-center text-[10px] font-bold text-gray-500 dark:text-zinc-400 flex-shrink-0">
              {tIdx + 1}
            </div>
            <input
              value={tier.label}
              placeholder="Tier Name (e.g., Medium)"
              onChange={(e) => onUpdateTier(tier.id, { label: e.target.value })}
              className="bg-transparent text-sm font-medium text-gray-900 dark:text-zinc-100 focus:outline-none border-b border-transparent focus:border-gray-300 dark:focus:border-zinc-600 transition-all flex-1 min-w-0"
            />
            <button onClick={() => onRemoveTier(tier.id)} className="p-1.5 text-gray-400 dark:text-zinc-500 hover:text-red-500 dark:hover:text-red-400 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-md transition-colors flex-shrink-0">
              <Trash size={14} color="currentColor" />
            </button>
          </div>

          <div className="p-5 space-y-5">
            {/* Amount range */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-zinc-400 mb-1.5">Min Amount (₦)</label>
                <input
                  type="number"
                  value={tier.min_amount}
                  onChange={(e) => onUpdateTier(tier.id, { min_amount: parseInt(e.target.value) || 0 })}
                  className="w-full bg-white dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-zinc-200 focus:outline-none focus:border-gray-400 dark:focus:border-zinc-600 font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-zinc-400 mb-1.5">Max Amount (₦)</label>
                <input
                  type="number"
                  value={tier.max_amount ?? ""}
                  placeholder="Unlimited (Leave blank)"
                  onChange={(e) => onUpdateTier(tier.id, { max_amount: e.target.value ? parseInt(e.target.value) : null })}
                  className="w-full bg-white dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-zinc-200 placeholder-gray-400 dark:placeholder-zinc-600 focus:outline-none focus:border-gray-400 dark:focus:border-zinc-600 font-mono"
                />
              </div>
            </div>

            {/* Approval steps */}
            <div className="pt-2">
              <div className="flex items-center justify-between mb-3">
                <p className="text-[10px] font-medium text-gray-500 dark:text-zinc-500 uppercase tracking-widest">Approval Sequence</p>
                <button
                  onClick={() => onAddStep(tier.id)}
                  disabled={noDepartments}
                  className="flex items-center gap-1.5 text-[11px] font-medium text-gray-600 dark:text-zinc-300 hover:text-gray-900 dark:hover:text-white bg-gray-100 dark:bg-zinc-800 hover:bg-gray-200 dark:hover:bg-zinc-700 px-2 py-1 rounded-md border border-gray-200 dark:border-zinc-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <Add size={12} color="currentColor" /> Add Step
                </button>
              </div>

              {tier.steps.length === 0 ? (
                <div className="text-center py-4 border border-dashed border-gray-200 dark:border-zinc-800 rounded-lg bg-gray-50 dark:bg-zinc-950/50">
                  <p className="text-xs text-gray-500 dark:text-zinc-500">No approvers required for this tier.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {tier.steps.map((step, sIdx) => (
                    <div key={step.id} className="flex items-center gap-3 bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-lg px-3 py-2.5 group hover:border-gray-300 dark:hover:border-zinc-700 transition-all">
                      <div className="w-5 h-5 rounded-full bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 flex items-center justify-center text-[10px] font-bold text-gray-500 dark:text-zinc-500 flex-shrink-0">
                        {sIdx + 1}
                      </div>
                      <select
                        value={step.department_id}
                        onChange={(e) => onUpdateStep(tier.id, step.id, e.target.value)}
                        className="flex-1 bg-transparent text-xs text-gray-800 dark:text-zinc-200 font-medium focus:outline-none appearance-none cursor-pointer"
                      >
                        {!step.department_id && (
                          <option value="" className="bg-white dark:bg-zinc-900">Select department</option>
                        )}
                        {departments.map((d) => (
                          <option key={d.id} value={d.id} className="bg-white dark:bg-zinc-900">{d.name}</option>
                        ))}
                      </select>
                      <div className="flex items-center gap-1 flex-shrink-0 opacity-40 group-hover:opacity-100 transition-opacity text-gray-500 dark:text-zinc-400">
                        <button onClick={() => onMoveStep(tier.id, step.id, "up")} disabled={sIdx === 0} className="p-1.5 hover:text-gray-900 dark:hover:text-zinc-100 disabled:opacity-20 hover:bg-gray-200 dark:hover:bg-zinc-800 rounded-md">
                          <ArrowUp2 size={12} color="currentColor" />
                        </button>
                        <button onClick={() => onMoveStep(tier.id, step.id, "down")} disabled={sIdx === tier.steps.length - 1} className="p-1.5 hover:text-gray-900 dark:hover:text-zinc-100 disabled:opacity-20 hover:bg-gray-200 dark:hover:bg-zinc-800 rounded-md">
                          <ArrowDown2 size={12} color="currentColor" />
                        </button>
                        <div className="w-px h-4 bg-gray-300 dark:bg-zinc-800 mx-1" />
                        <button onClick={() => onRemoveStep(tier.id, step.id)} className="p-1.5 hover:text-red-500 dark:hover:text-red-400 hover:bg-gray-200 dark:hover:bg-zinc-800 rounded-md">
                          <CloseCircle size={14} color="currentColor" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      ))}

      <button
        onClick={onAddTier}
        className="w-full flex items-center justify-center gap-2 py-3 border border-dashed border-gray-300 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-900/20 rounded-xl text-xs font-medium text-gray-500 dark:text-zinc-400 hover:border-gray-400 dark:hover:border-zinc-600 hover:text-gray-700 dark:hover:text-zinc-200 transition-all"
      >
        <Add size={14} color="currentColor" /> Add New Amount Tier
      </button>
    </div>
  );
}

// ─── Chain Card ───────────────────────────────────────────────────────────────

function ChainCard({ chain, onEdit }: { chain: ApprovalChain; onEdit: () => void }) {
  const hasChain = chain.tiers.length > 0;
  const maxDepth = chain.tiers.reduce((m, t) => Math.max(m, t.steps.length), 0);
  const voucherTypeName = chain.voucher_type?.name ?? "Unknown Type";

  return (
    <div className="bg-white dark:bg-zinc-900/50 border border-gray-200 dark:border-zinc-800/80 hover:border-gray-300 dark:hover:border-zinc-700 rounded-xl transition-all flex flex-col shadow-sm hover:shadow-md overflow-hidden">
      {/* Card Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-zinc-800/50 bg-gray-50 dark:bg-zinc-900/30">
        <div>
          <h3 className="text-sm font-semibold text-gray-900 dark:text-zinc-100">{voucherTypeName}</h3>
          <p className="text-[11px] text-gray-500 dark:text-zinc-500 mt-0.5">
            {hasChain
              ? `${chain.tiers.length} tier${chain.tiers.length !== 1 ? "s" : ""} · max depth ${maxDepth}`
              : "No chain configured"}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {hasChain ? (
            <div className="hidden sm:flex items-center gap-1.5 px-2 py-1 rounded-md border border-gray-200 dark:border-zinc-700 bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-zinc-300">
              <TickCircle size={12} color="currentColor" />
              <span className="text-[10px] font-medium">Active</span>
            </div>
          ) : (
            <div className="hidden sm:flex items-center gap-1.5 px-2 py-1 rounded-md border border-gray-200 dark:border-zinc-700 bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-zinc-300">
              <Warning2 size={12} color="currentColor" />
              <span className="text-[10px] font-medium">Needs Setup</span>
            </div>
          )}
          <button onClick={onEdit} className="p-1.5 rounded-md bg-gray-100 dark:bg-zinc-800/50 border border-gray-200 dark:border-zinc-700/50 text-gray-500 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-zinc-100 hover:bg-gray-200 dark:hover:bg-zinc-700 transition-colors">
            <Edit2 size={14} color="currentColor" />
          </button>
        </div>
      </div>

      {/* Tier list */}
      <div className="flex-1 p-5 space-y-4">
        {!hasChain && (
          <div className="py-10 flex flex-col items-center justify-center border border-dashed border-gray-200 dark:border-zinc-800 rounded-xl text-center bg-gray-50 dark:bg-zinc-950/30">
            <div className="text-gray-400 dark:text-zinc-600 mb-3">
              <Setting2 size={24} color="currentColor" />
            </div>
            <p className="text-xs font-medium text-gray-500 dark:text-zinc-400 mb-3">Workflow not defined</p>
            <button
              onClick={onEdit}
              className="text-[11px] font-medium text-gray-900 dark:text-zinc-900 bg-white dark:bg-zinc-100 border border-gray-300 dark:border-transparent hover:bg-gray-50 dark:hover:bg-white px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 shadow-sm"
            >
              <Add size={14} color="currentColor" /> Configure Workflow
            </button>
          </div>
        )}

        {chain.tiers
          .slice()
          .sort((a, b) => a.sort_order - b.sort_order)
          .map((tier, tIdx) => (
            <div key={tier.id} className="bg-gray-50 dark:bg-zinc-950/50 border border-gray-200 dark:border-zinc-800/50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-5 h-5 rounded bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 flex items-center justify-center text-[10px] font-bold text-gray-500 dark:text-zinc-400">
                    {tIdx + 1}
                  </div>
                  <span className="text-xs font-semibold text-gray-800 dark:text-zinc-200">{tier.label}</span>
                </div>
                <span className="text-[10px] font-mono font-medium text-gray-500 dark:text-zinc-400 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 px-2 py-1 rounded">
                  {formatRange(tier)}
                </span>
              </div>
              <div className="flex items-center gap-2 flex-wrap bg-white dark:bg-zinc-900/40 p-2.5 rounded-lg border border-gray-200 dark:border-zinc-800/50">
                {tier.steps
                  .slice()
                  .sort((a, b) => a.step_order - b.step_order)
                  .map((step, sIdx) => (
                    <React.Fragment key={step.id}>
                      <div className="flex items-center gap-1.5 px-2.5 py-1.5 border rounded-md text-[10px] font-medium bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-zinc-300 border-gray-200 dark:border-zinc-700">
                        <span className="w-3.5 h-3.5 rounded-full bg-black/10 dark:bg-black/20 flex items-center justify-center text-[8px] font-bold">{sIdx + 1}</span>
                        {step.department?.name ?? "Unknown Department"}
                      </div>
                      {sIdx < tier.steps.length - 1 && (
                        <ArrowRight2 size={12} className="text-gray-400 dark:text-zinc-600 flex-shrink-0" color="currentColor" />
                      )}
                    </React.Fragment>
                  ))}
                {tier.steps.length === 0 && (
                  <span className="text-[11px] text-gray-500 dark:text-zinc-500 italic pl-1">Auto-approved (No steps)</span>
                )}
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function ApprovalChainsPage() {
  const [editingChain, setEditingChain] = useState<ApprovalChain | null>(null);
  const [showCreate, setShowCreate] = useState(false);

  const { data: chains = [], isLoading: chainsLoading } = useListApprovalChains();
  const { data: voucherTypes = [], isLoading: typesLoading } = useListVoucherTypes();
  const { data: departments = [], isLoading: deptsLoading } = useListDepartments();
  const createMutation = useCreateApprovalChain();
  const updateMutation = useUpdateApprovalChain();

  const isPending = createMutation.isPending || updateMutation.isPending;

  const existingVoucherTypeIds = new Set(chains.map((c) => c.voucher_type_id));

  const configured = chains.filter((c) => c.tiers.length > 0).length;
  const totalTiers = chains.reduce((s, c) => s + c.tiers.length, 0);
  const maxDepth = chains.reduce((m, c) => Math.max(m, ...c.tiers.map((t) => t.steps.length), 0), 0);

  const handleCreate = (voucherTypeId: string, tiers: AmountTierInput[]) => {
    createMutation.mutate(
      { voucher_type_id: voucherTypeId, tiers },
      { onSuccess: () => setShowCreate(false) }
    );
  };

  const handleUpdate = (id: string, tiers: AmountTierInput[]) => {
    updateMutation.mutate(
      { id, payload: { tiers } },
      { onSuccess: () => setEditingChain(null) }
    );
  };

  const isLoading = chainsLoading || typesLoading || deptsLoading;

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 text-gray-900 dark:text-zinc-300 font-sans pb-16">

        {/* Top Nav */}
        <div className="border-b border-gray-200 dark:border-zinc-800/80 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md sticky top-0 z-10">
          <div className="px-6 h-16 flex items-center justify-between max-w-7xl mx-auto">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gray-100 dark:bg-zinc-900 rounded-lg border border-gray-200 dark:border-zinc-800/80 shadow-sm text-gray-600 dark:text-zinc-400">
                <Hierarchy size={18} color="currentColor" />
              </div>
              <h1 className="text-sm font-medium text-gray-900 dark:text-zinc-100">Approval Workflows</h1>
              <span className="ml-2 bg-gray-100 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 text-gray-500 dark:text-zinc-400 text-[11px] px-2.5 py-0.5 rounded-full font-mono">
                {chains.length} chains
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button className="flex items-center gap-1.5 bg-white dark:bg-zinc-900 hover:bg-gray-50 dark:hover:bg-zinc-800 transition-all text-gray-700 dark:text-zinc-300 text-xs font-medium px-4 py-2 rounded-lg border border-gray-200 dark:border-zinc-800 shadow-sm">
                <DocumentText size={14} color="currentColor" /> Export Config
              </button>
              <button
                onClick={() => setShowCreate(true)}
                disabled={(existingVoucherTypeIds.size >= voucherTypes.length && voucherTypes.length > 0)}
                className="flex items-center gap-1.5 bg-gray-900 dark:bg-zinc-100 hover:bg-black dark:hover:bg-white text-white dark:text-zinc-900 text-xs font-medium px-4 py-2 rounded-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Add size={14} color="currentColor" /> New Chain
              </button>
            </div>
          </div>
        </div>

        <div className="px-6 py-8 max-w-7xl mx-auto space-y-10">

          {/* KPI Row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
            <StatCard label="Voucher Types" value={voucherTypes.length} sub="Active issue categories" />
            <StatCard label="Configured Chains" value={`${configured}/${chains.length}`} sub={chains.length - configured > 0 ? `${chains.length - configured} workflows need setup` : "All workflows complete"} />
            <StatCard label="Total Tiers" value={totalTiers} sub="Granular rules created" />
            <StatCard label="Max Depth" value={maxDepth} sub="Deepest approval route" />
          </div>

          {/* Warning banner */}
          {chains.some((c) => c.tiers.length === 0) && (
            <div className="flex items-start gap-3 bg-gray-100 dark:bg-zinc-800/50 border border-gray-200 dark:border-zinc-700/50 rounded-xl px-5 py-4">
              <div className="text-gray-600 dark:text-zinc-400 mt-0.5">
                <Warning2 size={18} color="currentColor" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-zinc-200">Missing Configurations Detected</p>
                <p className="text-xs text-gray-600 dark:text-zinc-400 mt-1 leading-relaxed">
                  Vouchers belonging to unconfigured types cannot be submitted. Define at least one amount tier and approval path for all chains below.
                </p>
              </div>
            </div>
          )}

          {/* Loading */}
          {isLoading && (
     <Loader />
          )}

          {/* Empty */}
          {!isLoading && chains.length === 0 && (
            <div className="text-sm text-gray-400 dark:text-zinc-500 text-center py-16 border border-dashed border-gray-200 dark:border-zinc-800 rounded-xl">
              No approval chains yet. Create one to define a workflow.
            </div>
          )}

          {/* Chain Cards */}
          {!isLoading && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
              {chains.map((chain) => (
                <ChainCard key={chain.id} chain={chain} onEdit={() => setEditingChain(chain)} />
              ))}
            </div>
          )}

          {/* Departments Legend */}

        </div>

        {/* Modals */}
        {showCreate && (
          <CreateChainModal
            voucherTypes={voucherTypes}
            departments={departments}
            existingVoucherTypeIds={existingVoucherTypeIds}
            onClose={() => setShowCreate(false)}
            onSave={handleCreate}
            isPending={isPending}
          />
        )}

        {editingChain && (
          <EditChainModal
            chain={editingChain}
            departments={departments}
            onClose={() => setEditingChain(null)}
            onSave={handleUpdate}
            isPending={isPending}
          />
        )}
      </div>
    </Layout>
  );
}