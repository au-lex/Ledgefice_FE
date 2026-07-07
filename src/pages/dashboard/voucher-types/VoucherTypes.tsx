import React, { useMemo, useState } from "react";
import {
  Add,
  Trash,
  Edit2,
  CloseCircle,
  TagRight,
  Setting2,
  Hierarchy,
  Receipt21,
  Folder2,
  DocumentUpload,
} from "iconsax-react";
import Layout from "../../../layout/Layout";
import {
  useListVoucherTypes,
  useCreateVoucherType,
  useUpdateVoucherType,
  useDeleteVoucherType,
  type VoucherType,
  type CustomField,
  type CustomFieldInput,
} from "../../../api/hooks/useVoucherTypes";
import Loader from "../../../components/ui/Loader";

// ─── Types ────────────────────────────────────────────────────────────────────

interface LocalField {
  id: string;
  label: string;
  type: CustomField["type"];
}

// ─── Constants ────────────────────────────────────────────────────────────────

const FIELD_TYPES: { value: CustomField["type"]; label: string }[] = [
  { value: "text", label: "Text" },
  { value: "number", label: "Number" },
  { value: "date", label: "Date" },
  { value: "file", label: "File" },
];

const FIELD_TYPE_LABEL: Record<CustomField["type"], string> = {
  text: "Text",
  number: "Number",
  date: "Date",
  file: "File",
};

const genTempId = () => `tmp_${Math.random().toString(36).slice(2, 9)}`;

// ─── Voucher Type Modal ───────────────────────────────────────────────────────

interface VoucherTypeModalProps {
  initial: VoucherType | null;
  onClose: () => void;
  onSave: (data: { id?: string; name: string; description: string; fields: CustomFieldInput[] }) => void;
  isPending: boolean;
}

function VoucherTypeModal({ initial, onClose, onSave, isPending }: VoucherTypeModalProps) {
  const [name, setName] = useState(initial?.name ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [fields, setFields] = useState<LocalField[]>(
    initial?.fields.map((f) => ({ id: f.id, label: f.label, type: f.type })) ?? []
  );

  const isEditing = !!initial;
  const canSave = name.trim().length > 0 && fields.every((f) => f.label.trim().length > 0);

  const addField = () =>
    setFields((prev) => [...prev, { id: genTempId(), label: "", type: "text" }]);

  const updateField = (id: string, patch: Partial<LocalField>) =>
    setFields((prev) => prev.map((f) => (f.id === id ? { ...f, ...patch } : f)));

  const removeField = (id: string) =>
    setFields((prev) => prev.filter((f) => f.id !== id));

  const handleSave = () => {
    if (!canSave) return;
    onSave({
      id: initial?.id,
      name: name.trim(),
      description: description.trim(),
      fields: fields.map((f, i) => ({ label: f.label, type: f.type, sort_order: i })),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
      <div className="w-full max-w-lg bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl shadow-xl max-h-[85vh] flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-zinc-800">
          <h2 className="text-sm font-semibold flex items-center gap-2 text-gray-900 dark:text-zinc-100">
            <Receipt21 size={18} color="currentColor" />
            {isEditing ? "Edit Voucher Type" : "Define Voucher Type"}
          </h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded">
            <CloseCircle size={18} color="currentColor" />
          </button>
        </div>

        {/* Body */}
        <div className="px-5 py-4 space-y-5 overflow-y-auto">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-gray-600 dark:text-zinc-400">Type Name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Contractor Payment"
              className="w-full text-sm bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-lg px-3 py-2 outline-none focus:border-gray-400 dark:focus:border-zinc-600"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-gray-600 dark:text-zinc-400">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What is this voucher type used for?"
              rows={2}
              className="w-full text-sm bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-lg px-3 py-2 outline-none focus:border-gray-400 dark:focus:border-zinc-600 resize-none"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-gray-600 dark:text-zinc-400 flex items-center gap-1.5">
                <Setting2 size={13} color="currentColor" /> Custom Fields
              </label>
              <button
                onClick={addField}
                className="flex items-center gap-1 text-xs font-medium text-gray-700 dark:text-zinc-300 hover:text-gray-900 dark:hover:text-zinc-100"
              >
                <Add size={14} color="currentColor" /> Add Field
              </button>
            </div>

            {fields.length === 0 && (
              <p className="text-xs text-gray-400 dark:text-zinc-500 py-3 text-center border border-dashed border-gray-200 dark:border-zinc-800 rounded-lg">
                No custom fields yet — add one to capture extra info on this voucher type.
              </p>
            )}

            <div className="space-y-2">
              {fields.map((field) => (
                <div
                  key={field.id}
                  className="flex items-center gap-2 bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-lg px-2 py-2"
                >
                  <TagRight size={14} color="currentColor" className="text-gray-400 dark:text-zinc-500 shrink-0" />
                  <input
                    value={field.label}
                    onChange={(e) => updateField(field.id, { label: e.target.value })}
                    placeholder="Field label"
                    className="flex-1 text-xs bg-transparent outline-none text-gray-800 dark:text-zinc-200 min-w-0"
                  />
                  <div className="flex items-center gap-1 shrink-0 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-md p-0.5">
                    {FIELD_TYPES.map((ft) => {
                      const active = field.type === ft.value;
                      return (
                        <button
                          key={ft.value}
                          onClick={() => updateField(field.id, { type: ft.value })}
                          className={`text-[11px] font-medium px-2 py-1 rounded ${
                            active
                              ? "bg-gray-900 dark:bg-zinc-100 text-white dark:text-zinc-900"
                              : "text-gray-400 dark:text-zinc-500 hover:bg-gray-100 dark:hover:bg-zinc-800"
                          }`}
                        >
                          {ft.label}
                        </button>
                      );
                    })}
                  </div>
                  <button
                    onClick={() => removeField(field.id)}
                    className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 rounded shrink-0"
                  >
                    <Trash size={13} color="currentColor" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-gray-200 dark:border-zinc-800">
          <button
            onClick={onClose}
            disabled={isPending}
            className="text-sm font-medium px-4 py-2 rounded-lg text-gray-600 dark:text-zinc-400 hover:bg-gray-100 dark:hover:bg-zinc-800 disabled:opacity-40"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!canSave || isPending}
            className="text-sm font-medium px-4 py-2 rounded-lg bg-gray-900 dark:bg-zinc-100 text-white dark:text-zinc-900 hover:bg-black dark:hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            {isPending ? "Saving..." : isEditing ? "Save Changes" : "Create Type"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Stat Card ────────────────────────────────────────────────────────────────

function StatCard({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: number | string }) {
  return (
    <div className="flex items-center gap-3 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl px-4 py-3">
      <div className="p-2 rounded-lg bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-zinc-300">
        <Icon size={16} color="currentColor" />
      </div>
      <div>
        <p className="text-lg font-semibold leading-none text-gray-900 dark:text-zinc-100">{value}</p>
        <p className="text-[11px] text-gray-500 dark:text-zinc-400 mt-0.5">{label}</p>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function VoucherTypesPage() {
  const [modalTarget, setModalTarget] = useState<VoucherType | null | "new">(null);

  const { data: types = [], isLoading } = useListVoucherTypes();
  const createMutation = useCreateVoucherType();
  const updateMutation = useUpdateVoucherType();
  const deleteMutation = useDeleteVoucherType();

  const isPending =
    createMutation.isPending || updateMutation.isPending || deleteMutation.isPending;

  const stats = useMemo(() => {
    const totalFields = types.reduce((sum, t) => sum + t.fields.length, 0);
    const fileFields = types.reduce(
      (sum, t) => sum + t.fields.filter((f) => f.type === "file").length,
      0
    );
    return { totalTypes: types.length, totalFields, fileFields };
  }, [types]);

  const handleSave = ({
    id,
    name,
    description,
    fields,
  }: {
    id?: string;
    name: string;
    description: string;
    fields: CustomFieldInput[];
  }) => {
    if (id) {
      updateMutation.mutate(
        { id, payload: { name, description, fields } },
        { onSuccess: () => setModalTarget(null) }
      );
    } else {
      createMutation.mutate(
        { name, description, fields },
        { onSuccess: () => setModalTarget(null) }
      );
    }
  };

  const handleDelete = (id: string) => {
    deleteMutation.mutate(id);
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 text-gray-900 dark:text-zinc-300 font-sans pb-16">

        {/* Top Nav */}
        <div className="border-b border-gray-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md sticky top-0 z-10">
          <div className="px-6 h-16 flex items-center justify-between max-w-7xl mx-auto">
            <h1 className="text-sm font-medium flex items-center gap-2">
              <Hierarchy size={18} color="currentColor" /> Voucher Type Definitions
            </h1>
            <button
              onClick={() => setModalTarget("new")}
              className="flex items-center gap-1.5 bg-gray-900 dark:bg-zinc-100 hover:bg-black dark:hover:bg-white text-white dark:text-zinc-900 text-sm font-medium px-4 py-2 rounded-lg transition-all"
            >
              <Add size={16} color="currentColor" /> Create New Type
            </button>
          </div>
        </div>

        <div className="px-6 py-8 max-w-7xl mx-auto">

          {/* Stats Strip */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
            <StatCard icon={Folder2} label="Voucher Types" value={stats.totalTypes} />
            <StatCard icon={TagRight} label="Custom Fields" value={stats.totalFields} />
            <StatCard icon={DocumentUpload} label="File Fields" value={stats.fileFields} />
          </div>

          {/* Loading */}
          {isLoading && (
            <div className="text-sm text-gray-400 dark:text-zinc-500 text-center py-16">
      <Loader />
            </div>
          )}

          {/* Empty */}
          {!isLoading && types.length === 0 && (
            <div className="text-sm text-gray-400 dark:text-zinc-500 text-center py-16 border border-dashed border-gray-200 dark:border-zinc-800 rounded-xl">
              No voucher types defined yet. Create one to get started.
            </div>
          )}

          {/* Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {types.map((type) => (
              <div
                key={type.id}
                className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl p-5 shadow-sm"
              >
                <div className="flex justify-between items-start mb-4">
                  <h3 className="font-semibold text-gray-900 dark:text-zinc-100">{type.name}</h3>
                  <div className="flex gap-1">
                    <button
                      onClick={() => setModalTarget(type)}
                      className="p-1.5 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded"
                    >
                      <Edit2 size={14} color="currentColor" />
                    </button>
                    <button
                      onClick={() => handleDelete(type.id)}
                      disabled={deleteMutation.isPending}
                      className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 rounded disabled:opacity-40"
                    >
                      <Trash size={14} color="currentColor" />
                    </button>
                  </div>
                </div>
                <p className="text-xs text-gray-500 dark:text-zinc-400 mb-4">{type.description}</p>
                <div className="space-y-2">
                  {type.fields.map((f) => (
                    <div
                      key={f.id}
                      className="flex items-center justify-between gap-2 text-xs bg-gray-50 dark:bg-zinc-950 px-2 py-1.5 rounded border border-gray-200 dark:border-zinc-800"
                    >
                      <span className="text-gray-600 dark:text-zinc-300">{f.label}</span>
                      <span className="text-[10px] font-semibold uppercase tracking-wide text-gray-400 dark:text-zinc-500 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded px-1.5 py-0.5 shrink-0">
                        {FIELD_TYPE_LABEL[f.type]}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {modalTarget !== null && (
          <VoucherTypeModal
            initial={modalTarget === "new" ? null : modalTarget}
            onClose={() => setModalTarget(null)}
            onSave={handleSave}
            isPending={isPending}
          />
        )}
      </div>
    </Layout>
  );
}