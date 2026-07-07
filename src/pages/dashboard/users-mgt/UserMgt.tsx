import React, { useMemo, useState } from "react";
import {
  Profile2User,
  Add,
  Edit2,
  Trash,
  CloseCircle,
  SearchNormal1,
  Lock,
  Unlock,
  Warning2,
  ShieldTick,
  UserEdit,
} from "iconsax-react";
import Layout from "../../../layout/Layout";
import {
  useListUsers,
  useCreateUser,
  useUpdateUser,
  useDeleteUser,
  useSetUserStatus,
  type User,
} from "../../../api/hooks/useUsers";
import { useListDepartments } from "../../../api/hooks/useDepartments";
import type { UserStatus } from "../../../api/hooks/useAuth";

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
      className={`bg-white bg-pri border rounded-xl p-5 flex flex-col justify-between shadow-sm transition-colors ${alert ? "border-red-500/30 bg-red-500/5" : "border-gray-200 border-zinc-800/80"
        }`}
    >
      <p className={`text-xs font-medium mb-3 ${alert ? "text-red-500" : "text-gray-500 text-zinc-400"}`}>
        {label}
      </p>
      <p
        className={`text-2xl font-medium tracking-tight ${alert ? "text-red-600 text-red-400" : "text-gray-900 text-zinc-50"
          }`}
      >
        {value}
      </p>
      <p className={`text-[11px] mt-2 ${alert ? "text-red-500/70" : "text-gray-400 text-zinc-500"}`}>
        {sub}
      </p>
    </div>
  );
}

function StatusBadge({ status }: { status: UserStatus }) {
  if (status === "active") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md border border-gray-200 border-zinc-700 bg-gray-100 bg-zinc-800 text-[10px] font-medium text-gray-700 text-zinc-300">
        Active
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md border border-red-200 border-red-500/20 bg-red-50 bg-red-500/10 text-[10px] font-medium text-red-600 text-red-400 capitalize">
      <Warning2 size={10} color="currentColor" />
      {status}
    </span>
  );
}

function SkeletonRow() {
  return (
    <div className="p-4 sm:px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-pulse">
      <div className="flex items-center gap-4 min-w-0 flex-1">
        <div className="w-10 h-10 rounded-full bg-gray-200 bg-zinc-800 flex-shrink-0" />
        <div className="space-y-1.5">
          <div className="h-3.5 w-32 bg-gray-200 bg-zinc-800 rounded" />
          <div className="h-3 w-40 bg-gray-200 bg-zinc-800 rounded" />
        </div>
      </div>
      <div className="hidden md:block w-36 space-y-1.5">
        <div className="h-2.5 w-16 bg-gray-200 bg-zinc-800 rounded" />
        <div className="h-3 w-24 bg-gray-200 bg-zinc-800 rounded" />
      </div>
    </div>
  );
}

// ─── Modals ───────────────────────────────────────────────────────────────────

function UserModal({
  user,
  onClose,
  onSubmit,
  isSaving,
}: {
  user: User | null;
  onClose: () => void;
  onSubmit: (payload: { name: string; email: string; department_id: string }) => void;
  isSaving: boolean;
}) {
  const isNew = user === null;
  const { data: departments, isLoading: isLoadingDepartments } = useListDepartments();

  const [name, setName] = useState(user?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [departmentId, setDepartmentId] = useState(user?.department_id ?? "");

  // Once departments load, default to the first one if nothing is selected yet (new user case)
  React.useEffect(() => {
    if (!departmentId && departments && departments.length > 0) {
      setDepartmentId(departments[0].id);
    }
  }, [departments, departmentId]);

  function handleSave() {
    if (!name.trim() || !email.trim() || !departmentId) return;
    onSubmit({ name: name.trim(), email: email.trim(), department_id: departmentId });
  }

  const canSave = !!name.trim() && !!email.trim() && !!departmentId && !isSaving;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm bg-black/60 transition-opacity">
      <div className="relative bg-white bg-zinc-900 border border-gray-200 border-zinc-800 rounded-xl w-full max-w-md shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 border-zinc-800 bg-gray-50 bg-pri">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gray-100 bg-zinc-800/50 border border-gray-200 border-zinc-700/50 text-gray-600 text-zinc-400 flex items-center justify-center">
              <UserEdit size={16} variant="Bulk" color="currentColor" />
            </div>
            <div>
              <h2 className="text-sm font-medium text-gray-900 text-zinc-100">
                {isNew ? "Add New User" : "Edit User Profile"}
              </h2>
              <p className="text-[11px] text-zinc-500 mt-0.5">
                {isNew ? "Provision access by assigning a department." : `Updating settings for ${user.name}`}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 text-zinc-500 hover:text-gray-900 hover:text-zinc-100 transition-colors"
          >
            <CloseCircle size={20} color="currentColor" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5 overflow-y-auto custom-scrollbar">
          <div>
            <label className="block text-xs font-medium text-gray-500 text-zinc-400 mb-1.5">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. John Doe"
              className="w-full bg-white bg-zinc-950 border border-gray-200 border-zinc-800 rounded-lg px-3 py-2.5 text-sm text-gray-900 text-zinc-200 placeholder-gray-400 placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-gray-400 focus:ring-zinc-600 transition-all font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 text-zinc-400 mb-1.5">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@company.com"
              className="w-full bg-white bg-zinc-950 border border-gray-200 border-zinc-800 rounded-lg px-3 py-2.5 text-sm text-gray-900 text-zinc-200 placeholder-gray-400 placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-gray-400 focus:ring-zinc-600 transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 text-zinc-400 mb-1.5">Department</label>
            <select
              value={departmentId}
              onChange={(e) => setDepartmentId(e.target.value)}
              disabled={isLoadingDepartments}
              className="w-full bg-white bg-zinc-950 border border-gray-200 border-zinc-800 rounded-lg px-3 py-2.5 text-sm text-gray-900 text-zinc-200 focus:outline-none focus:ring-1 focus:ring-gray-400 focus:ring-zinc-600 transition-all appearance-none cursor-pointer disabled:opacity-60"
            >
              {isLoadingDepartments && <option value="">Loading departments…</option>}
              {!isLoadingDepartments && departments?.length === 0 && (
                <option value="">No departments configured</option>
              )}
              {departments?.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
            <p className="text-[11px] text-zinc-500 mt-1.5">
              The user's permissions are inherited from this department's access settings.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 border-zinc-800 flex justify-end gap-3 bg-gray-50 bg-zinc-900/80">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-sm text-gray-600 text-zinc-400 font-medium hover:text-gray-900 hover:text-zinc-100 hover:bg-gray-200 hover:bg-zinc-800 transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!canSave}
            className="px-5 py-2 rounded-lg bg-gray-900 bg-zinc-100 text-white text-zinc-900 text-sm font-medium hover:bg-black hover:bg-white transition-all shadow-sm disabled:opacity-50"
          >
            {isSaving ? "Saving…" : isNew ? "Create User" : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}

function ActionModal({
  title,
  description,
  actionLabel,
  icon,
  isDestructive,
  isLoading,
  onClose,
  onConfirm,
}: {
  title: string;
  description: string;
  actionLabel: string;
  icon: React.ReactNode;
  isDestructive?: boolean;
  isLoading?: boolean;
  onClose: () => void;
  onConfirm: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm bg-black/60 transition-opacity">
      <div className="bg-white bg-zinc-900 border border-gray-200 border-zinc-800 rounded-xl w-full max-w-sm shadow-2xl overflow-hidden">
        <div className="p-6 space-y-4">
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center ${isDestructive
              ? "bg-red-50 bg-red-500/10 border border-red-100 border-red-500/20 text-red-500"
              : "bg-gray-100 bg-zinc-800/50 border border-gray-200 border-zinc-700/50 text-gray-600 text-zinc-400"
              }`}
          >
            {icon}
          </div>
          <div>
            <h2 className="text-sm font-semibold text-gray-900 text-zinc-100">{title}</h2>
            <p className="text-xs text-gray-600 text-zinc-400 mt-1.5 leading-relaxed">{description}</p>
          </div>
        </div>
        <div className="px-6 pb-5 flex gap-3 justify-end bg-gray-50 bg-zinc-900/80 pt-4 border-t border-gray-200 border-zinc-800">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 rounded-lg text-sm text-gray-600 text-zinc-400 font-medium hover:text-gray-900 hover:text-zinc-100 hover:bg-gray-200 hover:bg-zinc-800 transition-all disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition-all shadow-sm disabled:opacity-60 ${isDestructive
              ? "bg-red-600 text-white hover:bg-red-500"
              : "bg-gray-900 bg-zinc-100 text-white text-zinc-900 hover:bg-black hover:bg-white"
              }`}
          >
            {isLoading ? "Working…" : actionLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function UsersRolesPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<UserStatus | "all">("all");
  const [departmentFilter, setDepartmentFilter] = useState<string>("all");
  const [page, setPage] = useState(1);
  const limit = 20;

  const [editingUser, setEditingUser] = useState<User | null | "new">(null);
  const [deletingUser, setDeletingUser] = useState<User | null>(null);
  const [statusTogglingUser, setStatusTogglingUser] = useState<{ user: User; target: UserStatus } | null>(null);

  const { data: departments } = useListDepartments();

  const filters = useMemo(
    () => ({
      search: search || undefined,
      status: statusFilter === "all" ? undefined : statusFilter,
      department: departmentFilter === "all" ? undefined : departmentFilter,
      page,
      limit,
    }),
    [search, statusFilter, departmentFilter, page]
  );

  const { data, isLoading, isError, error, isFetching } = useListUsers(filters);
  const createUser = useCreateUser();
  const updateUser = useUpdateUser();
  const deleteUser = useDeleteUser();
  const setUserStatus = useSetUserStatus();

  const users = data?.data ?? [];
  const meta = data?.meta;

  // KPIs (current page; total comes from meta)
  const activeCount = users.filter((u) => u.status === "active").length;
  const restrictedCount = users.filter((u) => u.status !== "active").length;
  const departmentsInUse = new Set(users.map((u) => u.department_id).filter(Boolean)).size;

  function resetToFirstPage<T>(setter: (v: T) => void) {
    return (v: T) => {
      setter(v);
      setPage(1);
    };
  }

  function handleUserModalSubmit(payload: { name: string; email: string; department_id: string }) {
    if (editingUser === "new") {
      createUser.mutate(payload, {
        onSuccess: () => setEditingUser(null),
      });
    } else if (editingUser) {
      updateUser.mutate(
        { id: editingUser.id, payload },
        { onSuccess: () => setEditingUser(null) }
      );
    }
  }

  function handleConfirmDelete() {
    if (!deletingUser) return;
    deleteUser.mutate(deletingUser.id, {
      onSuccess: () => setDeletingUser(null),
    });
  }

  function handleConfirmStatusChange() {
    if (!statusTogglingUser) return;
    setUserStatus.mutate(
      { id: statusTogglingUser.user.id, payload: { status: statusTogglingUser.target } },
      { onSuccess: () => setStatusTogglingUser(null) }
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-pri text-gray-900 text-zinc-300 font-sans pb-16 selection:bg-gray-200 selection:text-gray-900 selection:bg-zinc-800 selection:text-zinc-100">
        {/* Top Nav */}
        <div className="border-b border-gray-200 border-zinc-800/80 bg-white/80 bg-zinc-950/80 backdrop-blur-md sticky top-0 z-10">
          <div className="px-6 h-16 flex items-center justify-between max-w-7xl mx-auto">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gray-100 bg-zinc-900 rounded-lg border border-gray-200 border-zinc-800/80 shadow-sm text-gray-600 text-zinc-400">
                <Profile2User size={18} color="currentColor" />
              </div>
              <h1 className="text-sm font-medium text-gray-900 text-zinc-100">Users</h1>
              <span className="ml-2 bg-gray-100 bg-zinc-800 border border-gray-200 border-zinc-700 text-gray-700 text-zinc-300 text-[11px] px-2.5 py-0.5 rounded-full font-mono font-medium">
                {meta?.total ?? users.length} total
              </span>
            </div>
            <button
              onClick={() => setEditingUser("new")}
              className="flex items-center gap-1.5 bg-gray-900 bg-zinc-100 hover:bg-black hover:bg-white transition-all text-white text-zinc-900 text-sm font-medium px-4 py-2 rounded-lg shadow-sm"
            >
              <Add size={16} color="currentColor" />
              Provision User
            </button>
          </div>
        </div>

        <div className="px-6 py-8 max-w-7xl mx-auto space-y-8">
          {/* KPI Row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
            <StatCard label="Total Users" value={meta?.total ?? (isLoading ? "—" : 0)} sub="All registered accounts" />
            <StatCard label="Active Personnel" value={activeCount} sub="Users with login access (current page)" />
            <StatCard
              label="Restricted Accounts"
              value={restrictedCount}
              sub="Suspended or blocked (current page)"
              alert={restrictedCount > 0}
            />
            <StatCard
              label="Departments in Use"
              value={departmentsInUse}
              sub={`Out of ${departments?.length ?? 0} configured`}
            />
          </div>

          <div className="bg-white bg-zinc-900/40 border border-gray-200 border-zinc-800/50 rounded-xl overflow-hidden shadow-sm">
            {/* Toolbar */}
            <div className="p-4 border-b border-gray-200 border-zinc-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 bg-gray-50 bg-pri">
              <div className="relative w-full sm:w-80">
                <SearchNormal1
                  size={15}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-zinc-500"
                  color="currentColor"
                />
                <input
                  value={search}
                  onChange={(e) => resetToFirstPage(setSearch)(e.target.value)}
                  placeholder="Search name or email..."
                  className="w-full bg-white bg-zinc-950 border border-gray-200 border-zinc-800 rounded-lg pl-10 pr-4 py-2 text-sm text-gray-900 text-zinc-200 placeholder-gray-400 placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-gray-400 focus:ring-zinc-600 transition-all"
                />
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <select
                  value={departmentFilter}
                  onChange={(e) => resetToFirstPage(setDepartmentFilter)(e.target.value)}
                  className="w-full sm:w-auto bg-white bg-zinc-950 border border-gray-200 border-zinc-800 rounded-lg px-3 py-2 text-xs font-medium text-gray-700 text-zinc-300 focus:outline-none focus:ring-1 focus:ring-gray-400 focus:ring-zinc-600 appearance-none cursor-pointer"
                >
                  <option value="all">All Departments</option>
                  {departments?.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>
                <select
                  value={statusFilter}
                  onChange={(e) => resetToFirstPage(setStatusFilter)(e.target.value as UserStatus | "all")}
                  className="w-full sm:w-auto bg-white bg-zinc-950 border border-gray-200 border-zinc-800 rounded-lg px-3 py-2 text-xs font-medium text-gray-700 text-zinc-300 focus:outline-none focus:ring-1 focus:ring-gray-400 focus:ring-zinc-600 appearance-none cursor-pointer"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="suspended">Suspended</option>
                  <option value="blocked">Blocked</option>
                </select>
              </div>
            </div>

            {/* Users List */}
            {isError ? (
              <div className="py-24 flex flex-col items-center justify-center text-center">
                <Warning2 size={32} className="text-red-400 mb-4" color="currentColor" />
                <p className="text-sm font-medium text-red-600 text-red-400">Failed to load users</p>
                <p className="text-xs text-zinc-500 mt-1">
                  {(error as any)?.response?.data?.message || error?.message || "Please try again."}
                </p>
              </div>
            ) : isLoading ? (
              <div className="divide-y divide-gray-100 divide-zinc-800/80">
                {Array.from({ length: 5 }).map((_, i) => (
                  <SkeletonRow key={i} />
                ))}
              </div>
            ) : users.length === 0 ? (
              <div className="py-24 flex flex-col items-center justify-center text-center">
                <ShieldTick size={32} className="text-gray-300 text-zinc-700 mb-4" color="currentColor" />
                <p className="text-sm font-medium text-gray-900 text-zinc-300">No users found</p>
                <p className="text-xs text-zinc-500 mt-1">Adjust filters or search query.</p>
              </div>
            ) : (
              <div
                className={`divide-y divide-gray-100 divide-zinc-800/80 transition-opacity ${isFetching ? "opacity-60" : ""
                  }`}
              >
                {users.map((user) => (
                  <div
                    key={user.id}
                    className="group p-4 sm:px-6 hover:bg-gray-50 hover:bg-zinc-800/40 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    {/* User Info */}
                    <div className="flex items-center gap-4 min-w-0 flex-1">
                      <div className="w-10 h-10 rounded-full bg-gray-100 bg-zinc-800 border border-gray-200 border-zinc-700 flex items-center justify-center text-xs font-bold text-gray-500 text-zinc-400 flex-shrink-0 uppercase tracking-widest">
                        {user.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .substring(0, 2)}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2.5 mb-1">
                          <h3 className="text-sm font-semibold text-gray-900 text-zinc-100 truncate">
                            {user.name}
                          </h3>
                          <StatusBadge status={user.status} />
                        </div>
                        <p className="text-xs text-gray-500 text-zinc-400 truncate">{user.email}</p>
                      </div>
                    </div>

                    {/* Metadata */}
                    <div className="flex items-center gap-6 sm:gap-10">
                      <div className="hidden md:block text-left w-36">
                        <p className="text-[10px] font-medium text-gray-400 text-zinc-500 uppercase tracking-widest mb-1">
                          Department
                        </p>
                        <p className="text-xs font-medium text-gray-800 text-zinc-200 truncate">
                          {user.department?.name ?? "—"}
                        </p>
                      </div>
                      <div className="hidden lg:block text-right w-36">
                        <p className="text-[10px] font-medium text-gray-400 text-zinc-500 uppercase tracking-widest mb-1">
                          Last Login
                        </p>
                        <p className="text-[11px] text-gray-700 text-zinc-300">
                          {user.last_login_at
                            ? new Date(user.last_login_at).toLocaleString("en-GB", {
                              day: "2-digit",
                              month: "short",
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                            : "Never"}
                        </p>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1.5 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 pl-2 sm:border-l border-gray-200 border-zinc-800">
                        <button
                          title="Edit User"
                          onClick={() => setEditingUser(user)}
                          className="p-1.5 rounded-md text-gray-500 text-zinc-400 hover:bg-gray-200 hover:bg-zinc-700 hover:text-gray-900 hover:text-zinc-100 transition-colors"
                        >
                          <Edit2 size={16} color="currentColor" />
                        </button>

                        {user.status === "active" ? (
                          <button
                            title="Suspend/Block User"
                            onClick={() => setStatusTogglingUser({ user, target: "suspended" })}
                            className="p-1.5 rounded-md text-gray-500 text-zinc-400 hover:bg-red-50 hover:bg-red-500/10 hover:text-red-600 hover:text-red-400 transition-colors"
                          >
                            <Lock size={16} color="currentColor" />
                          </button>
                        ) : (
                          <button
                            title="Reactivate User"
                            onClick={() => setStatusTogglingUser({ user, target: "active" })}
                            className="p-1.5 rounded-md text-gray-500 text-zinc-400 hover:bg-gray-200 hover:bg-zinc-700 hover:text-gray-900 hover:text-zinc-100 transition-colors"
                          >
                            <Unlock size={16} color="currentColor" />
                          </button>
                        )}

                        <button
                          title="Delete User"
                          onClick={() => setDeletingUser(user)}
                          className="p-1.5 rounded-md text-gray-500 text-zinc-400 hover:bg-red-50 hover:bg-red-500/10 hover:text-red-600 hover:text-red-400 transition-colors"
                        >
                          <Trash size={16} color="currentColor" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Pagination */}
            {meta && meta.total_pages > 1 && (
              <div className="p-4 border-t border-gray-200 border-zinc-800/80 flex items-center justify-between bg-gray-50 bg-pri">
                <p className="text-[11px] text-zinc-500">
                  Page {meta.page} of {meta.total_pages} • {meta.total} total users
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

        {/* Modals */}
        {editingUser !== null && (
          <UserModal
            user={editingUser === "new" ? null : editingUser}
            onClose={() => setEditingUser(null)}
            onSubmit={handleUserModalSubmit}
            isSaving={createUser.isPending || updateUser.isPending}
          />
        )}

        {deletingUser && (
          <ActionModal
            title={`Delete ${deletingUser.name}?`}
            description="This action cannot be undone. The user's historical actions (approvals, logs) will be preserved but anonymized where applicable."
            actionLabel="Permanently Delete"
            icon={<Trash size={18} color="currentColor" />}
            isDestructive={true}
            isLoading={deleteUser.isPending}
            onClose={() => setDeletingUser(null)}
            onConfirm={handleConfirmDelete}
          />
        )}

        {statusTogglingUser && (
          <ActionModal
            title={
              statusTogglingUser.target === "active"
                ? `Reactivate ${statusTogglingUser.user.name}?`
                : `Restrict ${statusTogglingUser.user.name}?`
            }
            description={
              statusTogglingUser.target === "active"
                ? "This will restore the user's login access and approval rights."
                : "This will immediately revoke their active sessions and prevent them from logging in or approving vouchers."
            }
            actionLabel={statusTogglingUser.target === "active" ? "Reactivate Access" : "Restrict Access"}
            icon={
              statusTogglingUser.target === "active" ? (
                <Unlock size={18} color="currentColor" />
              ) : (
                <Lock size={18} color="currentColor" />
              )
            }
            isDestructive={statusTogglingUser.target !== "active"}
            isLoading={setUserStatus.isPending}
            onClose={() => setStatusTogglingUser(null)}
            onConfirm={handleConfirmStatusChange}
          />
        )}
      </div>
    </Layout>
  );
}