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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-3 sm:px-4">
      <div className="w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl max-h-[90vh] sm:max-h-[85vh] flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-5 py-4 border-b border-zinc-800">
          <h2 className="text-sm font-semibold flex items-center gap-2 text-zinc-100 min-w-0 truncate">
            <Receipt21 size={18} color="currentColor" className="flex-shrink-0" />
            {isEditing ? "Edit Voucher Type" : "Define Voucher Type"}
          </h2>
          <button onClick={onClose} className="p-1 hover:bg-zinc-800 rounded text-zinc-400 hover:text-zinc-100 transition-colors flex-shrink-0">
            <CloseCircle size={18} color="currentColor" />
          </button>
        </div>

        {/* Body */}
        <div className="px-4 sm:px-5 py-4 space-y-5 overflow-y-auto">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-zinc-400">Type Name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Contractor Payment"
              className="w-full text-sm bg-pri border border-zinc-800 rounded-lg px-3 py-2 outline-none text-zinc-200 placeholder-zinc-600 focus:border-zinc-600 transition-colors"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-zinc-400">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What is this voucher type used for?"
              rows={2}
              className="w-full text-sm bg-pri border border-zinc-800 rounded-lg px-3 py-2 outline-none text-zinc-200 placeholder-zinc-600 focus:border-zinc-600 resize-none transition-colors"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-zinc-400 flex items-center gap-1.5">
                <Setting2 size={13} color="currentColor" /> Custom Fields
              </label>
              <button
                onClick={addField}
                className="flex items-center gap-1 text-xs font-medium text-zinc-300 hover:text-zinc-100 transition-colors"
              >
                <Add size={14} color="currentColor" /> Add Field
              </button>
            </div>

            {fields.length === 0 && (
              <p className="text-xs text-zinc-500 py-3 text-center border border-dashed border-zinc-800 rounded-lg px-2">
                No custom fields yet — add one to capture extra info on this voucher type.
              </p>
            )}

            <div className="space-y-2">
              {fields.map((field) => (
                <div
                  key={field.id}
                  className="flex flex-col sm:flex-row sm:items-center gap-2 bg-pri border border-zinc-800 rounded-lg px-2 py-2"
                >
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <TagRight size={14} color="currentColor" className="text-zinc-500 shrink-0" />
                    <input
                      value={field.label}
                      onChange={(e) => updateField(field.id, { label: e.target.value })}
                      placeholder="Field label"
                      className="flex-1 text-xs bg-transparent outline-none text-zinc-200 placeholder-zinc-600 min-w-0"
                    />
                  </div>
                  <div className="flex items-center justify-between gap-2 shrink-0">
                    <div className="flex items-center gap-1 shrink-0 bg-zinc-900 border border-zinc-800 rounded-md p-0.5 overflow-x-auto">
                      {FIELD_TYPES.map((ft) => {
                        const active = field.type === ft.value;
                        return (
                          <button
                            key={ft.value}
                            onClick={() => updateField(field.id, { type: ft.value })}
                            className={`text-[11px] font-medium px-2 py-1 rounded whitespace-nowrap transition-colors ${
                              active
                                ? "bg-zinc-100 text-zinc-900"
                                : "text-zinc-500 hover:bg-zinc-800"
                            }`}
                          >
                            {ft.label}
                          </button>
                        );
                      })}
                    </div>
                    <button
                      onClick={() => removeField(field.id)}
                      className="p-1.5 hover:bg-red-900/20 text-red-500 rounded shrink-0 transition-colors"
                    >
                      <Trash size={13} color="currentColor" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-4 sm:px-5 py-4 border-t border-zinc-800">
          <button
            onClick={onClose}
            disabled={isPending}
            className="text-sm font-medium px-4 py-2 rounded-lg text-zinc-400 hover:bg-zinc-800 disabled:opacity-40 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!canSave || isPending}
            className="text-sm font-medium px-4 py-2 rounded-lg bg-zinc-100 text-zinc-900 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-all"
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
    <div className="flex items-center gap-3 bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 min-w-0">
      <div className="p-2 rounded-lg bg-zinc-800 text-zinc-300 flex-shrink-0">
        <Icon size={16} color="currentColor" />
      </div>
      <div className="min-w-0">
        <p className="text-lg font-semibold leading-none text-zinc-100">{value}</p>
        <p className="text-[11px] text-zinc-400 mt-0.5 truncate">{label}</p>
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
      <div className="min-h-screen bg-zinc-950 text-zinc-300 font-sans pb-16 selection:bg-zinc-800 selection:text-zinc-100">

        {/* Top Nav */}
        <div className="border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-md sticky top-0 z-10">
          <div className="px-4 sm:px-6 py-3 sm:py-0 sm:h-16 flex flex-col sm:flex-row sm:items-center justify-between gap-3 max-w-7xl mx-auto">
            <h1 className="text-sm font-medium flex items-center gap-2 text-zinc-100 min-w-0 truncate">
              <Hierarchy size={18} color="currentColor" className="flex-shrink-0" /> Voucher Type Definitions
            </h1>
            <button
              onClick={() => setModalTarget("new")}
              className="flex items-center justify-center gap-1.5 bg-zinc-100 hover:bg-white text-zinc-900 text-sm font-medium px-4 py-2 rounded-lg transition-all w-full sm:w-auto"
            >
              <Add size={16} color="currentColor" /> Create New Type
            </button>
          </div>
        </div>

        <div className="px-4 sm:px-6 py-6 sm:py-8 max-w-7xl mx-auto">

          {/* Stats Strip */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
            <StatCard icon={Folder2} label="Voucher Types" value={stats.totalTypes} />
            <StatCard icon={TagRight} label="Custom Fields" value={stats.totalFields} />
            <StatCard icon={DocumentUpload} label="File Fields" value={stats.fileFields} />
          </div>

          {/* Loading */}
          {isLoading && (
            <div className="text-sm text-zinc-500 text-center py-16">
              <Loader />
            </div>
          )}

          {/* Empty */}
          {!isLoading && types.length === 0 && (
            <div className="text-sm text-zinc-500 text-center py-16 border border-dashed border-zinc-800 rounded-xl px-4">
              No voucher types defined yet. Create one to get started.
            </div>
          )}

          {/* Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {types.map((type) => (
              <div
                key={type.id}
                className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 sm:p-5 shadow-sm min-w-0"
              >
                <div className="flex justify-between items-start mb-4 gap-2">
                  <h3 className="font-semibold text-zinc-100 truncate min-w-0">{type.name}</h3>
                  <div className="flex gap-1 flex-shrink-0">
                    <button
                      onClick={() => setModalTarget(type)}
                      className="p-1.5 hover:bg-zinc-800 rounded text-zinc-400 hover:text-zinc-100 transition-colors"
                    >
                      <Edit2 size={14} color="currentColor" />
                    </button>
                    <button
                      onClick={() => handleDelete(type.id)}
                      disabled={deleteMutation.isPending}
                      className="p-1.5 hover:bg-red-900/20 text-red-500 rounded disabled:opacity-40 transition-colors"
                    >
                      <Trash size={14} color="currentColor" />
                    </button>
                  </div>
                </div>
                <p className="text-xs text-zinc-400 mb-4 line-clamp-2">{type.description}</p>
                <div className="space-y-2">
                  {type.fields.map((f) => (
                    <div
                      key={f.id}
                      className="flex items-center justify-between gap-2 text-xs bg-pri px-2 py-1.5 rounded border border-zinc-800"
                    >
                      <span className="text-zinc-300 truncate min-w-0">{f.label}</span>
                      <span className="text-[10px] font-semibold uppercase tracking-wide text-zinc-500 bg-zinc-900 border border-zinc-800 rounded px-1.5 py-0.5 shrink-0">
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