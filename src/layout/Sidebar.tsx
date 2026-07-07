import { useState } from "react";
import { NavLink } from "react-router-dom";
import {

  Receipt21,
  TickCircle,
  ClipboardText,
  Layer,
  Buildings2,
  Profile2User,
  Chart21,
  DocumentText1,
  CloseCircle,

  Setting2,
  Logout,
  People,
  Money3,
} from "iconsax-react";
import { GiHamburgerMenu } from "react-icons/gi";
import Logo from "../components/Logo";

export interface UserPermissions {
  can_create: boolean;
  can_approve: boolean;
  can_dismiss_duplicates: boolean;
  can_view_all: boolean;
  can_view_all_vouchers: boolean;
  can_view_reports: boolean;
  can_view_voucher_types: boolean;
  can_create_voucher_types: boolean;
  can_edit_voucher_types: boolean;
  can_delete_voucher_types: boolean;
  can_manage_voucher_types: boolean;
  can_view_billings: boolean;
  can_create_billings: boolean;
  can_edit_billings: boolean;
  can_delete_billings: boolean;
  can_manage_billings: boolean;
  can_view_approval_chains: boolean;
  can_create_approval_chains: boolean;
  can_edit_approval_chains: boolean;
  can_delete_approval_chains: boolean;
  can_view_departments: boolean;
  can_create_departments: boolean;
  can_edit_departments: boolean;
  can_delete_departments: boolean;
  can_manage_users: boolean;
  can_configure: boolean;
  can_view_audit_logs: boolean;
  can_export_audit_logs: boolean;
}

export interface SidebarUser {
  name: string;
  role: string;
  avatarColor: string;
  avatarUrl?: string;
  permissions: UserPermissions;
}



const NAV_LINKS = [
  { label: "My Vouchers", icon: Receipt21, href: "/voucher", permission: "can_create" },
  { label: "Pending Approvals", icon: TickCircle, href: "/approvals", permission: "can_approve"},
  { label: "All Vouchers", icon: ClipboardText, href: "/all-vouchers", permission: "can_view_all" },
  { label: "Reports", icon: Chart21, href: "/reports", permission: "can_view_reports" },
  { label: "Voucher Types", icon: Layer, href: "/voucher-types", permission: "can_view_voucher_types" },
  { label: "Approval Chains", icon: Layer, href: "/approval-chains", permission: "can_view_approval_chains" },
  { label: "Departments", icon: Buildings2, href: "/departments", permission: "can_view_departments" },
  { label: "Users & Roles", icon: People, href: "/users", permission: "can_manage_users" },
  { label: "Audit Log", icon: DocumentText1, href: "/audit-logs", permission: "can_view_audit_logs" },
  { label: "Billings", icon: Money3, href: "/billings", permission: "can_view_billings" },
  { label: "My Profile", icon: Profile2User, href: "/profile", permission: null },
  { label: "Organisation", icon: Setting2, href: "/settings", permission: "can_configure" },
];

interface SidebarProps {
  user: SidebarUser;
  onLogout?: () => void;
}

function initials(name: string) {
  return name
    .split(" ")
    .map((item) => item[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export default function Sidebar({ user, onLogout }: SidebarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const renderLinks = (links: any[]) => {
    return links
      .filter(
        (link) =>
          link.permission === null ||
          user.permissions[link.permission as keyof UserPermissions]
      )
      .map((link) => {
        const Icon = link.icon;
        return (
          <NavLink
            key={link.href}
            to={link.href}
            onClick={() => setMobileOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${isActive
                ? "bg-slate-200 text-black"
                : "text-gray-400 hover:bg-white/10 hover:text-white"
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon
                  size={19}
                  variant={isActive ? "Bold" : "Linear"}
                  color={isActive ? "#000000" : "#9ca3af"}
                />
                <span className="flex-1">{link.label}</span>
                {link.badge && (
                  <span className="rounded-full bg-red-500 px-2 py-0.5 text-[10px] text-white">
                    {link.badge}
                  </span>
                )}
              </>
            )}
          </NavLink>
        );
      });
  };

  const SidebarContent = (
    <div className="flex h-full flex-col border-r border-white/10 bg-pri">
      {/* Header */}
      <div className="flex h-[72px] items-center border-b border-white/10 px-5">
        <Logo />
        <button
          onClick={() => setMobileOpen(false)}
          className="ml-auto text-gray-400 hover:text-white lg:hidden"
        >
          <CloseCircle size={22} />
        </button>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto px-3 py-5">
        <div className="space-y-1">{renderLinks(NAV_LINKS)}</div>

        <button
          onClick={onLogout}
          className="text-red-500 flex gap-2 px-3 pt-4 transition-colors hover:text-white"
        >
          <Logout size={20} color="currentColor" /><span className="block">Log out</span>
        </button>
      </div>

      {/* User */}
      <div className="border-t border-white/10 p-4">
        <div className="flex items-center gap-3">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold text-white overflow-hidden"
            style={{ backgroundColor: user.avatarColor }}
          >
            {user.avatarUrl ? (
              <img src={user.avatarUrl} alt={user.name} className="h-full w-full object-cover" />
            ) : (
              initials(user.name)
            )}
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-white">{user.name}</p>
            <p className="text-xs text-gray-500">{user.role}</p>
          </div>

        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Header */}
      <div className="fixed top-0 left-0 right-0 z-40 flex h-14 items-center justify-between border-b border-white/10 bg-pri px-4 lg:hidden">
        <button
          onClick={() => setMobileOpen(true)}
          className="text-gray-400 hover:text-white"
        >
          <GiHamburgerMenu size={24} color="currentColor" />
        </button>
        <Logo />
      </div>

      {/* Mobile Drawer */}
      <div
        className={`fixed inset-0 z-50 lg:hidden transition-all duration-300 ${mobileOpen ? "visible" : "invisible"
          }`}
      >
        <div
          className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${mobileOpen ? "opacity-100" : "opacity-0"
            }`}
          onClick={() => setMobileOpen(false)}
        />
        <div
          className={`absolute left-0 top-0 h-full w-[270px] shadow-2xl transition-transform duration-300 ease-in-out ${mobileOpen ? "translate-x-0" : "-translate-x-full"
            }`}
        >
          {SidebarContent}
        </div>
      </div>

      {/* Desktop Sidebar */}
      <aside className="hidden h-screen w-[270px] sticky top-0 lg:block">
        {SidebarContent}
      </aside>
    </>
  );
}