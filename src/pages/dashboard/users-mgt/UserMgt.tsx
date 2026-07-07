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
      className={`bg-zinc-900/50 border rounded-xl p-4 sm:p-5 flex flex-col justify-between shadow-sm transition-colors min-w-0 ${
        alert ? "border-red-500/30 bg-red-500/5" : "border-zinc-800/80"
      }`}
    >
      <p className={`text-xs font-medium mb-3 truncate ${alert ? "text-red-400" : "text-zinc-400"}`}>{label}</p>
      <p className={`text-xl sm:text-2xl font-medium tracking-tight truncate ${alert ? "text-red-400" : "text-zinc-50"}`}>
        {value}
      </p>
      <p className={`text-[11px] mt-2 ${alert ? "text-red-500/70" : "text-zinc-500"}`}>{sub}</p>
    </div>
  );
}

function StatusBadge({ status }: { status: UserStatus }) {
  if (status === "active") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md border border-zinc-700 bg-zinc-800 text-[10px] font-medium text-zinc-300 whitespace-nowrap">
        Active
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md border border-red-500/20 bg-red-500/10 text-[10px] font-medium text-red-400 capitalize whitespace-nowrap">
      <Warning2 size={10} color="currentColor" />
      {status}
    </span>
  );
}

function SkeletonRow() {
  return (
    <div className="p-4 sm:px-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-pulse">
      <div className="flex items-center gap-4 min-w-0 flex-1">
        <div className="w-10 h-10 rounded-full bg-zinc-800 flex-shrink-0" />
        <div className="space-y-1.5 min-w-0 flex-1">
          <div className="h-3.5 w-32 max-w-full bg-zinc-800 rounded" />
          <div className="h-3 w-40 max-w-full bg-zinc-800 rounded" />
        </div>
      </div>
      <div className="hidden md:block w-36 space-y-1.5">
        <div className="h-2.5 w-16 bg-zinc-800 rounded" />
        <div className="h-3 w-24 bg-zinc-800 rounded" />
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 backdrop-blur-sm bg-black/60">
      <div className="relative bg-zinc-900 border border-zinc-800 rounded-xl w-full max-w-md shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-zinc-800 bg-zinc-900/50 flex-shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-zinc-800/50 border border-zinc-700/50 text-zinc-400 flex items-center justify-center flex-shrink-0">
              <UserEdit size={16} variant="Bulk" color="currentColor" />
            </div>
            <div className="min-w-0">
              <h2 className="text-sm font-medium text-zinc-100 truncate">
                {isNew ? "Add New User" : "Edit User Profile"}
              </h2>
              <p className="text-[11px] text-zinc-500 mt-0.5 truncate">
                {isNew ? "Provision access by assigning a department." : `Updating settings for ${user.name}`}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-zinc-500 hover:text-zinc-300 flex-shrink-0 transition-colors">
            <CloseCircle size={18} color="currentColor" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 sm:p-6 space-y-5 overflow-y-auto flex-1 bg-zinc-950/30">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-zinc-400">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. John Doe"
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2.5 text-sm text-zinc-200 placeholder-zinc-600 outline-none focus:border-zinc-600 transition-colors font-medium"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-zinc-400">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@company.com"
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2.5 text-sm text-zinc-200 placeholder-zinc-600 outline-none focus:border-zinc-600 transition-colors"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-zinc-400">Department</label>
            <select
              value={departmentId}
              onChange={(e) => setDepartmentId(e.target.value)}
              disabled={isLoadingDepartments}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2.5 text-sm text-zinc-200 outline-none focus:border-zinc-600 transition-colors appearance-none cursor-pointer disabled:opacity-60"
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
            <p className="text-[11px] text-zinc-500">
              The user's permissions are inherited from this department's access settings.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-zinc-800 flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 bg-zinc-900/80 flex-shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-sm text-zinc-400 font-medium hover:bg-zinc-800 transition-colors order-2 sm:order-1"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!canSave}
            className="px-5 py-2 rounded-lg bg-zinc-100 text-zinc-900 text-sm font-medium hover:bg-white transition-all disabled:opacity-40 disabled:cursor-not-allowed order-1 sm:order-2"
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 backdrop-blur-sm bg-black/60">
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl w-full max-w-sm shadow-2xl overflow-hidden">
        <div className="p-5 sm:p-6 space-y-4">
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
              isDestructive
                ? "bg-red-500/10 border border-red-500/20 text-red-400"
                : "bg-zinc-800/50 border border-zinc-700/50 text-zinc-400"
            }`}
          >
            {icon}
          </div>
          <div className="min-w-0">
            <h2 className="text-sm font-semibold text-zinc-100">{title}</h2>
            <p className="text-xs text-zinc-400 mt-1.5 leading-relaxed">{description}</p>
          </div>
        </div>
        <div className="px-5 sm:px-6 pb-5 pt-4 flex flex-col sm:flex-row gap-2 sm:gap-3 justify-end bg-zinc-900/80 border-t border-zinc-800">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 rounded-lg text-sm text-zinc-400 font-medium hover:bg-zinc-800 transition-colors disabled:opacity-40 order-2 sm:order-1"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition-all shadow-sm disabled:opacity-50 order-1 sm:order-2 ${
              isDestructive ? "bg-red-600 text-white hover:bg-red-500" : "bg-zinc-100 text-zinc-900 hover:bg-white"
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
      createUser.mutate(payload, { onSuccess: () => setEditingUser(null) });
    } else if (editingUser) {
      updateUser.mutate({ id: editingUser.id, payload }, { onSuccess: () => setEditingUser(null) });
    }
  }

  function handleConfirmDelete() {
    if (!deletingUser) return;
    deleteUser.mutate(deletingUser.id, { onSuccess: () => setDeletingUser(null) });
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
      <div className="min-h-screen bg-zinc-950 text-zinc-300 font-sans pb-16 selection:bg-zinc-800 selection:text-zinc-100">
        {/* Top Nav */}
        <div className="border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-md sticky top-0 z-10">
          <div className="px-4 sm:px-6 py-3 sm:py-0 sm:h-16 flex flex-col sm:flex-row sm:items-center justify-between gap-3 max-w-7xl mx-auto">
            <div className="flex items-center gap-3 min-w-0 flex-wrap">
              <div className="p-2 bg-zinc-900 rounded-lg border border-zinc-800/80 shadow-sm text-zinc-400 flex-shrink-0">
                <Profile2User size={18} color="currentColor" />
              </div>
              <h1 className="text-sm font-medium text-zinc-100 truncate">Users</h1>
              <span className="bg-zinc-900 border border-zinc-800 text-zinc-400 text-[11px] px-2.5 py-0.5 rounded-full font-mono whitespace-nowrap">
                {meta?.total ?? users.length} total
              </span>
            </div>
            <button
              onClick={() => setEditingUser("new")}
              className="flex items-center justify-center gap-1.5 bg-zinc-100 hover:bg-white transition-all text-zinc-900 text-xs font-medium px-4 py-2 rounded-lg shadow-sm"
            >
              <Add size={14} color="currentColor" />
              Provision User
            </button>
          </div>
        </div>

        <div className="px-4 sm:px-6 py-6 sm:py-8 max-w-7xl mx-auto space-y-8 sm:space-y-10">
          {/* KPI Row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
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

          <div className="bg-zinc-900/50 border border-zinc-800/80 rounded-xl overflow-hidden shadow-sm">
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
                  placeholder="Search name or email..."
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg pl-10 pr-4 py-2 text-sm text-zinc-200 placeholder-zinc-600 outline-none focus:border-zinc-600 transition-colors"
                />
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 w-full sm:w-auto">
                <select
                  value={departmentFilter}
                  onChange={(e) => resetToFirstPage(setDepartmentFilter)(e.target.value)}
                  className="w-full sm:w-auto bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs font-medium text-zinc-300 outline-none focus:border-zinc-600 appearance-none cursor-pointer transition-colors"
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
                  className="w-full sm:w-auto bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs font-medium text-zinc-300 outline-none focus:border-zinc-600 appearance-none cursor-pointer transition-colors"
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
              <div className="py-16 sm:py-24 flex flex-col items-center justify-center text-center px-4">
                <Warning2 size={32} className="text-red-400 mb-4" color="currentColor" />
                <p className="text-sm font-medium text-red-400">Failed to load users</p>
                <p className="text-xs text-zinc-500 mt-1">
                  {(error as any)?.response?.data?.message || error?.message || "Please try again."}
                </p>
              </div>
            ) : isLoading ? (
              <div className="divide-y divide-zinc-800/80">
                {Array.from({ length: 5 }).map((_, i) => (
                  <SkeletonRow key={i} />
                ))}
              </div>
            ) : users.length === 0 ? (
              <div className="py-16 sm:py-24 flex flex-col items-center justify-center text-center px-4">
                <ShieldTick size={32} className="text-zinc-700 mb-4" color="currentColor" />
                <p className="text-sm font-medium text-zinc-300">No users found</p>
                <p className="text-xs text-zinc-500 mt-1">Adjust filters or search query.</p>
              </div>
            ) : (
              <div className={`divide-y divide-zinc-800/80 transition-opacity ${isFetching ? "opacity-60" : ""}`}>
                {users.map((user) => (
                  <div
                    key={user.id}
                    className="group p-4 sm:px-5 hover:bg-zinc-800/40 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4"
                  >
                    {/* User Info */}
                    <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
                      <div className="w-10 h-10 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-xs font-bold text-zinc-400 flex-shrink-0 uppercase tracking-widest">
                        {user.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .substring(0, 2)}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center flex-wrap gap-x-2.5 gap-y-1 mb-1">
                          <h3 className="text-sm font-semibold text-zinc-100 truncate max-w-[180px] sm:max-w-none">
                            {user.name}
                          </h3>
                          <StatusBadge status={user.status} />
                        </div>
                        <p className="text-xs text-zinc-400 truncate">{user.email}</p>
                        {/* Mobile-only meta row */}
                        <div className="flex items-center gap-3 mt-1.5 sm:hidden">
                          <span className="text-[10px] text-zinc-500">
                            {user.department?.name ?? "No department"}
                          </span>
                          <span className="text-[10px] text-zinc-600">•</span>
                          <span className="text-[10px] text-zinc-500">
                            {user.last_login_at
                              ? new Date(user.last_login_at).toLocaleDateString("en-GB", { day: "2-digit", month: "short" })
                              : "Never logged in"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Metadata + Actions */}
                    <div className="flex items-center justify-between sm:justify-end gap-4 sm:gap-6 lg:gap-10 flex-shrink-0">
                      <div className="hidden md:block text-left w-32 lg:w-36">
                        <p className="text-[10px] font-medium text-zinc-500 uppercase tracking-widest mb-1">
                          Department
                        </p>
                        <p className="text-xs font-medium text-zinc-200 truncate">
                          {user.department?.name ?? "—"}
                        </p>
                      </div>
                      <div className="hidden lg:block text-right w-36">
                        <p className="text-[10px] font-medium text-zinc-500 uppercase tracking-widest mb-1">
                          Last Login
                        </p>
                        <p className="text-[11px] text-zinc-300">
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
                      <div className="flex items-center gap-0.5 sm:gap-1.5 opacity-100 sm:opacity-40 group-hover:opacity-100 transition-opacity flex-shrink-0 sm:pl-2 sm:border-l border-zinc-800">
                        <button
                          title="Edit User"
                          onClick={() => setEditingUser(user)}
                          className="p-1.5 rounded-md text-zinc-400 hover:bg-zinc-700 hover:text-zinc-100 transition-colors"
                        >
                          <Edit2 size={16} color="currentColor" />
                        </button>

                        {user.status === "active" ? (
                          <button
                            title="Suspend/Block User"
                            onClick={() => setStatusTogglingUser({ user, target: "suspended" })}
                            className="p-1.5 rounded-md text-zinc-400 hover:bg-red-500/10 hover:text-red-400 transition-colors"
                          >
                            <Lock size={16} color="currentColor" />
                          </button>
                        ) : (
                          <button
                            title="Reactivate User"
                            onClick={() => setStatusTogglingUser({ user, target: "active" })}
                            className="p-1.5 rounded-md text-zinc-400 hover:bg-zinc-700 hover:text-zinc-100 transition-colors"
                          >
                            <Unlock size={16} color="currentColor" />
                          </button>
                        )}

                        <button
                          title="Delete User"
                          onClick={() => setDeletingUser(user)}
                          className="p-1.5 rounded-md text-zinc-400 hover:bg-red-500/10 hover:text-red-400 transition-colors"
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
              <div className="p-4 border-t border-zinc-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 bg-zinc-900/80">
                <p className="text-[11px] text-zinc-500 text-center sm:text-left">
                  Page {meta.page} of {meta.total_pages} • {meta.total} total users
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
              statusTogglingUser.target === "active" ? <Unlock size={18} color="currentColor" /> : <Lock size={18} color="currentColor" />
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