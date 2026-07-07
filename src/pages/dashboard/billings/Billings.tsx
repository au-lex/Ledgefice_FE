import { useState } from "react";
import {
  EmptyWallet,
  Receipt21,
  DocumentDownload,
  TickCircle,
  Warning2,
  CloseCircle,
  Add,
  ArrowRight2,
  Flash,
  Buildings2,
  Calendar,
  Trash,
} from "iconsax-react";
import Layout from "../../../layout/Layout";
import {
  useMyPlan,
  useMyHistory,
  useUpgradePlan,
  useMyToken,
  useDeleteMyToken,
  type PlanType,
  type PlanOption,
} from "../../../api/hooks/useSubscription";
import MandateSetupModal from "./Mandate";
import Loader from "../../../components/ui/Loader";

// ─── Helpers ──────────────────────────────────────────────────────────────

function formatAmount(n: number) {
  return "₦" + n.toLocaleString("en-NG");
}

function formatDate(d: string | null) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

function planDisplayName(cfg: PlanOption["config"]) {
  return cfg.name + " OS";
}

// ─── Modals ───────────────────────────────────────────────────────────────

function UpgradeModal({
  plans,
  currentPlan,
  onClose,
}: {
  plans: PlanOption[];
  currentPlan: PlanType;
  onClose: () => void;
}) {
  const [selectedPlan, setSelectedPlan] = useState<PlanType>(currentPlan);
  const upgrade = useUpgradePlan();

  const handleConfirm = () => {
    if (selectedPlan === currentPlan) return;
    upgrade.mutate(
      { plan: selectedPlan, billing_cycle: "monthly" },
      {
        onSuccess: (res) => {
          window.location.href = res.checkout_link;
        },
      },
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm bg-black/60 transition-opacity">
      <div className="relative bg-zinc-900 border border-zinc-800 rounded-xl w-full max-w-4xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">

        <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-zinc-800 bg-zinc-900/50 flex-shrink-0">
          <div>
            <h2 className="text-sm font-medium text-zinc-100">Upgrade Subscription</h2>
            <p className="text-[11px] text-zinc-500 mt-0.5">Select a plan that scales with your organization.</p>
          </div>
          <button onClick={onClose} className="text-zinc-500 hover:text-zinc-300 transition-colors">
            <CloseCircle size={20} color="currentColor" />
          </button>
        </div>

        <div className="p-4 sm:p-6 overflow-y-auto bg-zinc-950/30 flex-1 custom-scrollbar">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
            {plans.map((p) => {
              const isCurrent = p.plan === currentPlan;
              const isSelected = selectedPlan === p.plan;
              const priceLabel =
                p.config.monthly_price === 0
                  ? "Custom"
                  : formatAmount(p.config.monthly_price / 100);

              return (
                <div
                  key={p.plan}
                  className={`relative flex flex-col rounded-xl border p-5 transition-all cursor-pointer ${
                    isSelected
                      ? "bg-zinc-900 border-zinc-400 shadow-md ring-1 ring-zinc-400"
                      : "bg-zinc-950 border-zinc-800 hover:border-zinc-700"
                  }`}
                  onClick={() => setSelectedPlan(p.plan)}
                >
                  {isCurrent && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-zinc-100 text-zinc-900 text-[9px] font-bold uppercase tracking-widest px-3 py-1 rounded-full border border-zinc-200">
                      Current Plan
                    </div>
                  )}
                  <div className="mb-4 mt-2">
                    <p className="text-sm font-semibold text-zinc-100 mb-1">
                      {planDisplayName(p.config)}
                    </p>
                    <p className="text-2xl font-bold text-zinc-50 tracking-tight">
                      {priceLabel}
                      {p.config.monthly_price > 0 && (
                        <span className="text-xs font-normal text-zinc-500">/mo</span>
                      )}
                    </p>
                  </div>
                  <ul className="space-y-3 flex-1 mb-6">
                    <li className="flex items-center gap-2 text-xs text-zinc-300 font-medium">
                      <TickCircle size={14} className="text-zinc-500 flex-shrink-0" color="currentColor" variant="Bulk" />
                      {p.config.max_users === -1 ? "Unlimited Users" : `Up to ${p.config.max_users} Users`}
                    </li>
                    <li className="flex items-center gap-2 text-xs text-zinc-300 font-medium">
                      <TickCircle size={14} className="text-zinc-500 flex-shrink-0" color="currentColor" variant="Bulk" />
                      {p.config.max_departments === -1 ? "Unlimited Departments" : `Up to ${p.config.max_departments} Departments`}
                    </li>
                    {p.config.features.multi_step_approvals && (
                      <li className="flex items-center gap-2 text-xs text-zinc-300 font-medium">
                        <TickCircle size={14} className="text-zinc-500 flex-shrink-0" color="currentColor" variant="Bulk" /> Multi-step Approvals
                      </li>
                    )}
                    {p.config.features.full_reporting_dashboard && (
                      <li className="flex items-center gap-2 text-xs text-zinc-300 font-medium">
                        <TickCircle size={14} className="text-zinc-500 flex-shrink-0" color="currentColor" variant="Bulk" /> Full Reporting Dashboard
                      </li>
                    )}
                    {p.config.features.audit_log_export && (
                      <li className="flex items-center gap-2 text-xs text-zinc-300 font-medium">
                        <TickCircle size={14} className="text-zinc-500 flex-shrink-0" color="currentColor" variant="Bulk" /> Audit Log Export
                      </li>
                    )}
                    {p.config.features.priority_support && (
                      <li className="flex items-center gap-2 text-xs text-zinc-300 font-medium">
                        <TickCircle size={14} className="text-zinc-500 flex-shrink-0" color="currentColor" variant="Bulk" /> Priority Support
                      </li>
                    )}
                  </ul>
                  <div className="w-full text-center py-2 rounded-lg border border-zinc-700 bg-zinc-800 text-xs font-medium text-zinc-300">
                    {isCurrent ? "Current Plan" : isSelected ? "Selected" : `Select ${p.config.name}`}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="p-4 border-t border-zinc-800 flex flex-col sm:flex-row justify-end gap-3 bg-zinc-900/80 flex-shrink-0">
          <button onClick={onClose} className="px-4 py-2 rounded-lg text-sm text-zinc-400 font-medium hover:text-zinc-100 hover:bg-zinc-800 transition-all order-2 sm:order-1">
            Cancel
          </button>
          <button
            disabled={selectedPlan === currentPlan || upgrade.isPending}
            onClick={handleConfirm}
            className="px-5 py-2 rounded-lg bg-zinc-100 text-zinc-900 text-sm font-medium hover:bg-white transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed order-1 sm:order-2"
          >
            {upgrade.isPending ? "Redirecting..." : "Confirm Change"}
          </button>
        </div>
      </div>
    </div>
  );
}

function CancelModal({ onClose }: { onClose: () => void }) {
  // No cancel-subscription endpoint exists on the backend yet — this stays
  // UI-only until SubscriptionHandler gets a Cancel method + route.
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm bg-black/60 transition-opacity">
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl w-full max-w-md shadow-2xl overflow-hidden">
        <div className="p-6 space-y-4">
          <div className="w-10 h-10 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400">
            <Warning2 size={18} color="currentColor" variant="Bulk" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-zinc-100">Cancel Subscription?</h2>
            <p className="text-xs text-zinc-400 mt-1.5 leading-relaxed">
              If you cancel, you will lose access to all premium features at the end of your current billing cycle. Your data will be preserved in a read-only state for 90 days.
            </p>
          </div>
        </div>
        <div className="px-6 pb-5 flex flex-col sm:flex-row gap-3 justify-end bg-zinc-900/80 pt-4 border-t border-zinc-800">
          <button onClick={onClose} className="px-4 py-2 rounded-lg text-sm text-zinc-400 font-medium hover:text-zinc-100 hover:bg-zinc-800 transition-all order-2 sm:order-1">
            Keep Subscription
          </button>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-500 transition-all shadow-sm order-1 sm:order-2"
          >
            Confirm Cancellation
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Payment Methods ────────────────────────────────────────────────────────

function PaymentMethodsSection() {
  const { data: tokenData, isLoading } = useMyToken();
  const deleteToken = useDeleteMyToken();
  const [showMandateModal, setShowMandateModal] = useState(false);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-zinc-100">Payment Methods</h3>
      </div>

      {isLoading && (
        <Loader />
      )}

      {!isLoading && tokenData?.has_token && (
        <div className="space-y-3">
          <div className="flex items-center justify-between p-4 bg-zinc-900/40 border border-zinc-800/50 rounded-xl shadow-sm hover:border-zinc-700 transition-colors">
            <div className="flex items-center gap-4">
              <div className="w-12 h-8 bg-zinc-800 rounded border border-zinc-700 flex items-center justify-center text-[10px] font-bold text-zinc-400 tracking-wider">
                {tokenData.card_type}
              </div>
              <div>
                <p className="text-sm font-medium text-zinc-200">{tokenData.card_pan}</p>
                <p className="text-[11px] text-zinc-500 mt-0.5">Saved for automatic renewal</p>
              </div>
            </div>
            <button
              onClick={() => deleteToken.mutate()}
              disabled={deleteToken.isPending}
              className="p-2 text-zinc-500 hover:text-red-400 hover:bg-zinc-800 rounded-lg transition-colors disabled:opacity-50"
              title="Remove card"
            >
              <Trash size={16} color="currentColor" />
            </button>
          </div>
        </div>
      )}

      {!isLoading && !tokenData?.has_token && (
        <div className="p-5 bg-zinc-900/40 border border-dashed border-zinc-700 rounded-xl text-center">
          <p className="text-xs text-zinc-400 mb-3">
            No card saved — you'll need to pay manually each cycle unless you set up automatic renewal.
          </p>
          <button
            onClick={() => setShowMandateModal(true)}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-zinc-100 text-zinc-900 text-xs font-medium hover:bg-white transition-all w-full sm:w-auto"
          >
            <Add size={14} color="currentColor" /> Set Up Auto-Renewal
          </button>
        </div>
      )}

      {showMandateModal && (
        <MandateSetupModal onClose={() => setShowMandateModal(false)} />
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────

export default function BillingPage() {
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);

  const { data: planData, isLoading: planLoading } = useMyPlan();
  const { data: historyData, isLoading: historyLoading } = useMyHistory({ page: 1, limit: 5 });

  if (planLoading || !planData) {
    return (
      <Layout>
        <section className="min-h-screen flex items-center justify-center bg-zinc-950">
          <Loader />
        </section>
      </Layout>
    );
  }

  const currentPlanOption = planData.plans.find((p) => p.plan === planData.current_plan);
  const sub = planData.subscription;

  return (
    <Layout>
      <div className="min-h-screen bg-zinc-950 text-zinc-300 font-sans pb-16 selection:bg-zinc-800 selection:text-zinc-100">

        {/* Top Nav */}
        <div className="border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-md sticky top-0 z-10">
          <div className="px-4 sm:px-6 h-16 flex items-center justify-between max-w-7xl mx-auto">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-zinc-900 rounded-lg border border-zinc-800/80 shadow-sm text-zinc-400">
                <EmptyWallet size={18} color="currentColor" variant="Bulk" />
              </div>
              <h1 className="text-sm font-medium text-zinc-100">
                Billing & Subscription
              </h1>
            </div>
            <button className="flex items-center gap-1.5 bg-zinc-900 hover:bg-zinc-800 transition-all text-zinc-300 text-xs font-medium px-4 py-2 rounded-lg border border-zinc-800 shadow-sm">
              <DocumentDownload size={14} color="currentColor" />
              <span className="hidden sm:inline">Statement</span>
            </button>
          </div>
        </div>

        <div className="px-4 sm:px-6 py-6 sm:py-8 max-w-7xl mx-auto space-y-8">

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 items-start">

            {/* Left Column: Plan & Payment Methods */}
            <div className="lg:col-span-2 space-y-6 sm:space-y-8">

              {/* Current Plan Overview */}
              <div className="bg-zinc-900/50 border border-zinc-800/80 rounded-xl overflow-hidden shadow-sm flex flex-col">
                <div className="p-5 sm:p-8">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 mb-8">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <h2 className="text-2xl font-bold text-zinc-100 tracking-tight">
                          {currentPlanOption ? planDisplayName(currentPlanOption.config) : planData.current_plan}
                        </h2>
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md border border-zinc-700/50 bg-zinc-800 text-[10px] font-medium text-zinc-300 uppercase tracking-widest">
                          {sub?.status ? sub.status : "Active"}
                        </span>
                      </div>
                    </div>
                    <div className="text-left sm:text-right">
                      <p className="text-3xl font-bold text-zinc-50 tracking-tight mb-1">
                        {currentPlanOption && currentPlanOption.config.monthly_price > 0
                          ? formatAmount(currentPlanOption.config.monthly_price / 100)
                          : "Custom"}
                      </p>
                      <p className="text-xs font-medium text-zinc-500">per month</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 p-4 sm:p-5 bg-zinc-950 rounded-xl border border-zinc-800/80">
                    <div>
                      <p className="text-[10px] font-medium text-zinc-500 uppercase tracking-widest mb-1.5">Next Billing Date</p>
                      <div className="flex items-center gap-2">
                        <Calendar size={14} className="text-zinc-400" color="currentColor" />
                        <p className="text-sm font-semibold text-zinc-200">
                          {formatDate(sub?.renews_at ?? null)}
                        </p>
                      </div>
                    </div>
                    <div>
                      <p className="text-[10px] font-medium text-zinc-500 uppercase tracking-widest mb-1.5">Seat Usage</p>
                      <div className="flex items-center gap-2">
                        <Buildings2 size={14} className="text-zinc-400" color="currentColor" />
                        <p className="text-sm font-semibold text-zinc-200">
                          {currentPlanOption?.config.max_users === -1
                            ? "Unlimited Personnel"
                            : `Up to ${currentPlanOption?.config.max_users ?? "—"} Users`}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="px-5 sm:px-8 py-5 border-t border-zinc-800/80 bg-zinc-900/80 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <button
                    onClick={() => setShowCancelModal(true)}
                    className="text-xs font-medium text-red-400 hover:text-red-300 transition-colors px-3 py-1.5 rounded-lg hover:bg-red-500/10 w-full sm:w-auto"
                  >
                    Cancel Subscription
                  </button>
                  <button
                    onClick={() => setShowUpgradeModal(true)}
                    className="w-full sm:w-auto px-5 py-2.5 rounded-lg bg-zinc-100 text-zinc-900 text-sm font-medium hover:bg-white transition-all shadow-sm flex items-center justify-center gap-2"
                  >
                    <Flash size={16} color="currentColor" variant="Bulk" /> Change Plan
                  </button>
                </div>
              </div>

              {/* Payment Methods */}
              <PaymentMethodsSection />

            </div>

            {/* Right Column: Billing History */}
            <div className="bg-zinc-900/50 border border-zinc-800/80 rounded-xl overflow-hidden shadow-sm flex flex-col">
              <div className="p-5 border-b border-zinc-800/80 bg-zinc-900/90 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-zinc-100 flex items-center gap-2">
                  <Receipt21 size={16} className="text-zinc-400" color="currentColor" />
                  Billing History
                </h3>
              </div>
              <div className="divide-y divide-zinc-800/80">
                {historyLoading && (
                  <div className="p-4 text-xs text-zinc-500">Loading…</div>
                )}
                {!historyLoading && historyData?.history.length === 0 && (
                  <div className="p-4 text-xs text-zinc-500">No billing history yet.</div>
                )}
                {historyData?.history.map((item) => (
                  <div key={item.id} className="p-4 hover:bg-zinc-800/30 transition-colors flex items-center justify-between group cursor-pointer">
                    <div>
                      <p className="text-xs font-semibold text-zinc-200 mb-1">{formatAmount(item.amount)}</p>
                      <div className="flex items-center gap-2 text-[10px]">
                        <span className="text-zinc-400">{formatDate(item.paid_at ?? item.created_at)}</span>
                        <span className="text-zinc-700">•</span>
                        <span className="font-mono text-zinc-500">{item.plan}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {item.status === "paid" ? (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-medium border border-zinc-700 bg-zinc-800 text-zinc-300 uppercase tracking-wider">
                          Paid
                        </span>
                      ) : item.status === "pending" ? (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-medium border border-amber-500/20 bg-amber-500/10 text-amber-400 uppercase tracking-wider">
                          Pending
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-medium border border-red-500/20 bg-red-500/10 text-red-400 uppercase tracking-wider">
                          Failed
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              {historyData && historyData.total > historyData.history.length && (
                <div className="p-4 border-t border-zinc-800/80 bg-zinc-900/80 text-center">
                  <button className="text-[11px] font-medium text-zinc-400 hover:text-zinc-100 transition-colors flex items-center justify-center gap-1.5 w-full">
                    View All Invoices <ArrowRight2 size={12} color="currentColor" />
                  </button>
                </div>
              )}
            </div>

          </div>
        </div>

        {/* Modals */}
        {showUpgradeModal && (
          <UpgradeModal
            plans={planData.plans}
            currentPlan={planData.current_plan}
            onClose={() => setShowUpgradeModal(false)}
          />
        )}
        {showCancelModal && <CancelModal onClose={() => setShowCancelModal(false)} />}
      </div>
    </Layout>
  );
}