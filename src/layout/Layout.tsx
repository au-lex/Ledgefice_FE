import  { type ReactNode } from "react";
import Sidebar, { type SidebarUser } from "./Sidebar";
import { useMe, useLogout } from "../api/hooks/useAuth";

interface DashboardLayoutProps {
  children: ReactNode;
}

const AVATAR_COLORS = [
  "#2563eb", "#7c3aed", "#db2777", "#059669", "#d97706", "#dc2626",
];

function avatarColor(name: string = "") {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash += name.charCodeAt(i);
  return AVATAR_COLORS[hash % AVATAR_COLORS.length] ?? AVATAR_COLORS[0];
}

export default function Layout({ children }: DashboardLayoutProps) {
  const { data: me, isLoading } = useMe();
  const logout = useLogout();

  if (isLoading || !me) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <span className="w-5 h-5 border-2 border-gray-300 border-t-gray-800 rounded-full animate-spin" />
      </div>
    );
  }

  const perms = me.permissions ?? {};

  const user: SidebarUser = {
    name: me.name ?? "",
    role: me.department?.name ?? "Member",
    avatarColor: avatarColor(me.name),
    avatarUrl: me.avatar_url,
    permissions: {
      can_create:               !!perms.can_create,
      can_approve:              !!perms.can_approve,
      can_dismiss_duplicates:   !!perms.can_dismiss_duplicates,
      can_view_all:             !!perms.can_view_all,
      can_view_all_vouchers:    !!perms.can_view_all_vouchers,
      can_view_reports:         !!perms.can_view_reports,
      can_view_voucher_types:   !!perms.can_view_voucher_types,
      can_create_voucher_types: !!perms.can_create_voucher_types,
      can_edit_voucher_types:   !!perms.can_edit_voucher_types,
      can_delete_voucher_types: !!perms.can_delete_voucher_types,
      can_manage_voucher_types: !!perms.can_manage_voucher_types,
      can_view_billings:        !!perms.can_view_billings,
      can_create_billings:      !!perms.can_create_billings,
      can_edit_billings:        !!perms.can_edit_billings,
      can_delete_billings:      !!perms.can_delete_billings,
      can_manage_billings:      !!perms.can_manage_billings,
      can_view_approval_chains:   !!perms.can_view_approval_chains,
      can_create_approval_chains: !!perms.can_create_approval_chains,
      can_edit_approval_chains:   !!perms.can_edit_approval_chains,
      can_delete_approval_chains: !!perms.can_delete_approval_chains,
      can_view_departments:   !!perms.can_view_departments,
      can_create_departments: !!perms.can_create_departments,
      can_edit_departments:   !!perms.can_edit_departments,
      can_delete_departments: !!perms.can_delete_departments,
      can_manage_users:       !!perms.can_manage_users,
      can_configure:          !!perms.can_configure,
      can_view_audit_logs:    !!perms.can_view_audit_logs,
      can_export_audit_logs:  !!perms.can_export_audit_logs,
    },
  };

  return (
    <div className="flex min-h-screen ">
      <Sidebar user={user} onLogout={() => logout.mutate()} />
      <main className="flex-1 overflow-y-auto pt-14 lg:pt-0">
        {children}
      </main>
    </div>
  );
}