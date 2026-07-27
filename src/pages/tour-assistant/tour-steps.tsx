import type { UserPermissions } from "../../layout/Sidebar";

export interface OnboardingStep {
  id: string;
  title: string;
  body: string;
  /** data-tour value of the element to spotlight (matches sidebar href minus leading slash) */
  target: string;
  route?: string;
  placement?: "top" | "bottom" | "left" | "right";
  /** If set, step is skipped when the user lacks this permission */
  permission?: keyof UserPermissions;
}

export const onboardingSteps: OnboardingStep[] = [
  {
    id: "welcome",
    title: "Welcome to Ledgefice",
    body: "Quick tour — under a minute. This shows you where everything lives so vouchers move through approval without back-and-forth.",
    target: "dashboard-root",
    placement: "bottom",
  },
  {
    id: "departments",
    title: "Departments",
    body: "Departments own approval chains. A voucher raised under Finance routes to Finance approvers — set these up first.",
    target: "departments",
    placement: "right",
    permission: "can_view_departments",
  },
  {
    id: "approval-chains",
    title: "Approval chains",
    body: "Define who approves what, and in what order — including amount tiers, e.g. anything over ₦500k needs a second sign-off.",
    target: "approval-chains",
    placement: "right",
    permission: "can_view_approval_chains",
  },
  {
    id: "voucher-types",
    title: "Voucher types",
    body: "Vouchers aren't one-size-fits-all. Configure which fields each voucher type asks for here.",
    target: "voucher-types",
    placement: "right",
    permission: "can_view_voucher_types",
  },
  {
    id: "users",
    title: "Users & roles",
    body: "Invite your team here and assign them to a department — that's what determines which approval chain they sit in.",
    target: "users",
    placement: "right",
    permission: "can_manage_users",
  },
  {
    id: "my-vouchers",
    title: "My Vouchers",
    body: "This is home base — raise a new voucher, or check the status of ones you've already submitted.",
    target: "voucher",
    placement: "right",
    permission: "can_create",
  },
  {
    id: "pending-approvals",
    title: "Pending Approvals",
    body: "Vouchers waiting on your sign-off land here. Nothing moves forward until it's approved at every required step.",
    target: "approvals",
    placement: "right",
    permission: "can_approve",
  },
];

export function getVisibleSteps(permissions?: UserPermissions): OnboardingStep[] {
  if (!permissions) return onboardingSteps;
  return onboardingSteps.filter(
    (step) => !step.permission || permissions[step.permission]
  );
}