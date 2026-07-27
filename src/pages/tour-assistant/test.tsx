import { useEffect, useState } from "react";

/**
 * STANDALONE — no Sidebar/Layout, no demo card grid. Auto-starts on mount.
 * Since there's nothing on this page to spotlight, each step is a centered
 * card with a real link to that section (opens in a new tab so the tour
 * doesn't lose its place).
 */

interface Step {
  id: string;
  label: string;
  href: string;
  body: string;
  permission: string | null;
}

const steps: Step[] = [
  {
    id: "voucher-types",
    label: "Voucher Types",
    href: "/voucher-types",
    body: "Start here. Create your first voucher type and define what fields it asks for — this is the shape every voucher of that type will take.",
    permission: "can_view_voucher_types",
  },
  {
    id: "approval-chains",
    label: "Approval Chains",
    href: "/approval-chains",
    body: "Next, configure the approval chain for that voucher type — who signs off, in what order, and any amount tiers (e.g. over ₦500k needs a second approver).",
    permission: "can_view_approval_chains",
  },
  {
    id: "departments",
    label: "Departments",
    href: "/departments",
    body: "Now create your departments and assign roles. Departments own approval chains — this is what connects a voucher to the right approvers.",
    permission: "can_view_departments",
  },
  {
    id: "users",
    label: "Users & Roles",
    href: "/users",
    body: "Finally, invite your team members and assign each one to a department. That's the full setup — vouchers can now flow end to end.",
    permission: "can_manage_users",
  },
  {
    id: "voucher",
    label: "My Vouchers",
    href: "/voucher",
    body: "With setup done, this is where you raise a new voucher and track the ones you've already submitted.",
    permission: "can_create",
  },
  {
    id: "approvals",
    label: "Pending Approvals",
    href: "/approvals",
    body: "Vouchers waiting on your sign-off land here. Nothing moves to the next stage until it's approved.",
    permission: "can_approve",
  },
  {
    id: "all-vouchers",
    label: "All Vouchers",
    href: "/all-vouchers",
    body: "Every voucher across the org, regardless of who raised it — useful for a full overview or audit trail.",
    permission: "can_view_all",
  },
  {
    id: "reports",
    label: "Reports",
    href: "/reports",
    body: "Spending broken down by department, voucher type, or time period — the numbers view of everything above.",
    permission: "can_view_reports",
  },
  {
    id: "audit-logs",
    label: "Audit Log",
    href: "/audit-logs",
    body: "A record of every action taken on a voucher — who created it, who approved or rejected it, and when.",
    permission: "can_view_audit_logs",
  },
  {
    id: "billings",
    label: "Billings",
    href: "/billings",
    body: "Your organization's plan, usage, and payment history for Ledgefice itself.",
    permission: "can_view_billings",
  },
  {
    id: "profile",
    label: "My Profile",
    href: "/profile",
    body: "Your personal details and account settings — available to everyone regardless of role.",
    permission: null,
  },
  {
    id: "settings",
    label: "Organisation",
    href: "/settings",
    body: "Org-wide configuration — name, currency, and other settings that apply across every department.",
    permission: "can_configure",
  },
];

export default function OnboardingTestPage() {
  const [active, setActive] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);

  // Auto-start on every page load/refresh, no button needed.
  useEffect(() => {
    setStepIndex(0);
    setActive(true);
  }, []);

  const currentStep = steps[stepIndex];
  const isLast = stepIndex === steps.length - 1;

  const next = () => {
    if (isLast) {
      setActive(false);
      return;
    }
    setStepIndex((i) => i + 1);
  };
  const back = () => setStepIndex((i) => Math.max(0, i - 1));
  const skip = () => setActive(false);

  return (
    <div className="min-h-screen bg-zinc-950 p-8 text-zinc-100">
      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes scaleIn {
          from { opacity: 0; transform: translate(-50%, -50%) scale(0.94); }
          to { opacity: 1; transform: translate(-50%, -50%) scale(1); }
        }
      `}</style>

      <h1 className="text-xl font-semibold">Ledgefice</h1>
      <p className="mt-1 text-sm text-zinc-400">
        Onboarding walkthrough auto-starts on load. Refresh the page to see it again.
      </p>

      {!active && (
        <button
          onClick={() => {
            setStepIndex(0);
            setActive(true);
          }}
          className="mt-6 rounded-lg bg-amber-400 px-4 py-2 text-sm font-semibold text-zinc-950 transition-all duration-150 hover:bg-amber-300 active:scale-95"
        >
          Replay tour
        </button>
      )}

      {active && (
        <div
          className="fixed inset-0 z-[100]"
          style={{ animation: "fadeIn 0.2s ease-out both", background: "rgba(9, 9, 11, 0.82)" }}
        >
          <div
            key={currentStep.id}
            className="absolute left-1/2 top-1/2 w-[360px] rounded-xl border border-zinc-800 bg-zinc-900 p-6 shadow-2xl"
            style={{ animation: "scaleIn 0.22s cubic-bezier(0.16, 1, 0.3, 1) both" }}
          >
            <span className="text-[11px] uppercase tracking-widest text-zinc-500">
              Step {stepIndex + 1} of {steps.length}
            </span>
            <div className="mt-1.5 flex gap-1">
              {steps.map((_, i) => (
                <span
                  key={i}
                  className={`h-1 rounded-full transition-all duration-300 ${
                    i === stepIndex ? "w-5 bg-amber-400" : i < stepIndex ? "w-2.5 bg-amber-400/50" : "w-2.5 bg-zinc-700"
                  }`}
                />
              ))}
            </div>

            <h3 className="mt-2.5 text-base font-semibold text-zinc-50">{currentStep.label}</h3>
            <p className="mt-1.5 text-sm leading-relaxed text-zinc-400">{currentStep.body}</p>

            <a
              href={currentStep.href}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-amber-400 hover:text-amber-300"
            >
              Open {currentStep.label} →
            </a>

            {currentStep.permission && (
              <p className="mt-2 text-[11px] text-zinc-600">
                Requires: <code>{currentStep.permission}</code>
              </p>
            )}

            <div className="mt-5 flex items-center justify-between">
              <button onClick={skip} className="text-xs text-zinc-500 transition-colors hover:text-zinc-300">
                Skip
              </button>
              <div className="flex gap-2">
                {stepIndex > 0 && (
                  <button
                    onClick={back}
                    className="rounded-lg border border-zinc-700 px-3 py-1.5 text-xs text-zinc-300 transition-all duration-150 hover:bg-zinc-800 active:scale-95"
                  >
                    Back
                  </button>
                )}
                <button
                  onClick={next}
                  className="rounded-lg bg-amber-400 px-3.5 py-1.5 text-xs font-semibold text-zinc-950 transition-all duration-150 hover:bg-amber-300 active:scale-95"
                >
                  {isLast ? "Finish" : "Next"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}