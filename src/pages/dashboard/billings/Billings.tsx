import React, { useState } from "react";
import {
  EmptyWallet,
  Receipt21,
  DocumentDownload,
  TickCircle,
  Warning2,
  Edit2,
  CloseCircle,
  Add,
  ArrowRight2,
  SecuritySafe,
  Flash,
  Buildings2,
  Calendar
} from "iconsax-react";
import Layout from "../../../layout/Layout";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Invoice {
  id: string;
  date: string;
  amount: number;
  status: "paid" | "failed" | "pending";
  plan: string;
  invoiceNumber: string;
}

interface PaymentMethod {
  id: string;
  brand: "Visa" | "Mastercard";
  last4: string;
  expiry: string;
  isDefault: boolean;
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

const MOCK_INVOICES: Invoice[] = [
  { id: "inv-1", date: "2026-06-25", amount: 250000, status: "paid", plan: "Enterprise OS", invoiceNumber: "INV-2026-06-01" },
  { id: "inv-2", date: "2026-05-25", amount: 250000, status: "paid", plan: "Enterprise OS", invoiceNumber: "INV-2026-05-01" },
  { id: "inv-3", date: "2026-04-25", amount: 250000, status: "paid", plan: "Enterprise OS", invoiceNumber: "INV-2026-04-01" },
  { id: "inv-4", date: "2026-03-25", amount: 150000, status: "paid", plan: "Pro OS", invoiceNumber: "INV-2026-03-01" },
];

const MOCK_PAYMENT_METHODS: PaymentMethod[] = [
  { id: "pm-1", brand: "Visa", last4: "4242", expiry: "12/28", isDefault: true },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatAmount(n: number) {
  return "₦" + n.toLocaleString("en-NG");
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

// ─── Modals ───────────────────────────────────────────────────────────────────

function UpgradeModal({ onClose }: { onClose: () => void }) {
  const [selectedPlan, setSelectedPlan] = useState<string>("enterprise");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm bg-black/60 transition-opacity">
      <div className="relative bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl w-full max-w-4xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">

        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-pri">
          <div>
            <h2 className="text-sm font-medium text-gray-900 dark:text-zinc-100">Upgrade Subscription</h2>
            <p className="text-[11px] text-gray-500 dark:text-zinc-500 mt-0.5">Select a plan that scales with your organization.</p>
          </div>
          <button onClick={onClose} className="text-gray-400 dark:text-zinc-500 hover:text-gray-900 dark:hover:text-zinc-100 transition-colors">
            <CloseCircle size={20} color="currentColor" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto bg-gray-50/50 dark:bg-zinc-950/30 flex-1 custom-scrollbar">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

            {/* Starter Plan */}
            <div className={`relative flex flex-col rounded-xl border p-5 transition-all cursor-pointer ${selectedPlan === 'starter' ? 'bg-white dark:bg-zinc-900 border-gray-900 dark:border-zinc-400 shadow-md ring-1 ring-gray-900 dark:ring-zinc-400' : 'bg-gray-50 dark:bg-pri border-gray-200 dark:border-zinc-800 hover:border-gray-300 dark:hover:border-zinc-700'}`} onClick={() => setSelectedPlan('starter')}>
              <div className="mb-4">
                <p className="text-sm font-semibold text-gray-900 dark:text-zinc-100 mb-1">Starter OS</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-zinc-50 tracking-tight">₦50,000<span className="text-xs font-normal text-gray-500 dark:text-zinc-500">/mo</span></p>
              </div>
              <p className="text-xs text-gray-600 dark:text-zinc-400 mb-6">Essential tools for small teams managing basic expenses.</p>
              <ul className="space-y-3 flex-1 mb-6">
                {['Up to 5 Users', 'Basic Approval Chains', 'Standard Support', '500 Vouchers/mo'].map((feat, i) => (
                  <li key={i} className="flex items-center gap-2 text-xs text-gray-700 dark:text-zinc-300 font-medium">
                    <TickCircle size={14} className="text-gray-400 dark:text-zinc-500" color="currentColor" variant="Bulk" /> {feat}
                  </li>
                ))}
              </ul>
              <div className="w-full text-center py-2 rounded-lg border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs font-medium text-gray-700 dark:text-zinc-300">
                {selectedPlan === 'starter' ? 'Selected' : 'Select Starter'}
              </div>
            </div>

            {/* Pro Plan */}
            <div className={`relative flex flex-col rounded-xl border p-5 transition-all cursor-pointer ${selectedPlan === 'pro' ? 'bg-white dark:bg-zinc-900 border-gray-900 dark:border-zinc-400 shadow-md ring-1 ring-gray-900 dark:ring-zinc-400' : 'bg-gray-50 dark:bg-pri border-gray-200 dark:border-zinc-800 hover:border-gray-300 dark:hover:border-zinc-700'}`} onClick={() => setSelectedPlan('pro')}>
              <div className="mb-4">
                <p className="text-sm font-semibold text-gray-900 dark:text-zinc-100 mb-1">Pro OS</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-zinc-50 tracking-tight">₦150,000<span className="text-xs font-normal text-gray-500 dark:text-zinc-500">/mo</span></p>
              </div>
              <p className="text-xs text-gray-600 dark:text-zinc-400 mb-6">Advanced controls for growing operations and multiple sites.</p>
              <ul className="space-y-3 flex-1 mb-6">
                {['Up to 20 Users', 'Multi-tier Approvals', 'Priority Support', 'Unlimited Vouchers', 'Audit Logging'].map((feat, i) => (
                  <li key={i} className="flex items-center gap-2 text-xs text-gray-700 dark:text-zinc-300 font-medium">
                    <TickCircle size={14} className="text-gray-400 dark:text-zinc-500" color="currentColor" variant="Bulk" /> {feat}
                  </li>
                ))}
              </ul>
              <div className="w-full text-center py-2 rounded-lg border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs font-medium text-gray-700 dark:text-zinc-300">
                {selectedPlan === 'pro' ? 'Selected' : 'Select Pro'}
              </div>
            </div>

            {/* Enterprise Plan (Current) */}
            <div className={`relative flex flex-col rounded-xl border p-5 transition-all cursor-pointer ${selectedPlan === 'enterprise' ? 'bg-gray-900 dark:bg-zinc-100 border-gray-900 dark:border-zinc-100 shadow-lg' : 'bg-gray-50 dark:bg-pri border-gray-200 dark:border-zinc-800 hover:border-gray-300 dark:hover:border-zinc-700'}`} onClick={() => setSelectedPlan('enterprise')}>
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gray-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-[9px] font-bold uppercase tracking-widest px-3 py-1 rounded-full border border-gray-800 dark:border-zinc-200">
                Current Plan
              </div>
              <div className="mb-4 mt-2">
                <p className={`text-sm font-semibold mb-1 ${selectedPlan === 'enterprise' ? 'text-white dark:text-zinc-900' : 'text-gray-900 dark:text-zinc-100'}`}>Enterprise OS</p>
                <p className={`text-2xl font-bold tracking-tight ${selectedPlan === 'enterprise' ? 'text-white dark:text-zinc-900' : 'text-gray-900 dark:text-zinc-50'}`}>₦250,000<span className={`text-xs font-normal ${selectedPlan === 'enterprise' ? 'text-gray-400 dark:text-zinc-600' : 'text-gray-500 dark:text-zinc-500'}`}>/mo</span></p>
              </div>
              <p className={`text-xs mb-6 ${selectedPlan === 'enterprise' ? 'text-gray-300 dark:text-zinc-700' : 'text-gray-600 dark:text-zinc-400'}`}>Maximum security and unlimited scale for conglomerates.</p>
              <ul className="space-y-3 flex-1 mb-6">
                {['Unlimited Users', 'Custom Workflows', '24/7 Dedicated Support', 'API Access', 'Custom Roles & RBAC'].map((feat, i) => (
                  <li key={i} className={`flex items-center gap-2 text-xs font-medium ${selectedPlan === 'enterprise' ? 'text-gray-200 dark:text-zinc-800' : 'text-gray-700 dark:text-zinc-300'}`}>
                    <TickCircle size={14} className={selectedPlan === 'enterprise' ? 'text-gray-400 dark:text-zinc-600' : 'text-gray-400 dark:text-zinc-500'} color="currentColor" variant="Bulk" /> {feat}
                  </li>
                ))}
              </ul>
              <div className={`w-full text-center py-2 rounded-lg text-xs font-medium ${selectedPlan === 'enterprise' ? 'bg-white dark:bg-zinc-900 text-gray-900 dark:text-zinc-100' : 'border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-700 dark:text-zinc-300'}`}>
                {selectedPlan === 'enterprise' ? 'Current Plan' : 'Select Enterprise'}
              </div>
            </div>

          </div>
        </div>

        <div className="p-4 border-t border-gray-200 dark:border-zinc-800 flex justify-end gap-3 bg-gray-50 dark:bg-zinc-900/80">
          <button onClick={onClose} className="px-4 py-2 rounded-lg text-sm text-gray-600 dark:text-zinc-400 font-medium hover:text-gray-900 dark:hover:text-zinc-100 hover:bg-gray-200 dark:hover:bg-zinc-800 transition-all">
            Cancel
          </button>
          <button
            disabled={selectedPlan === 'enterprise'}
            onClick={onClose}
            className="px-5 py-2 rounded-lg bg-gray-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-sm font-medium hover:bg-black dark:hover:bg-white transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Confirm Change
          </button>
        </div>
      </div>
    </div>
  );
}

function CancelModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm bg-black/60 transition-opacity">
      <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl w-full max-w-md shadow-2xl overflow-hidden">
        <div className="p-6 space-y-4">
          <div className="w-10 h-10 rounded-full bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 flex items-center justify-center text-red-500">
            <Warning2 size={18} color="currentColor" variant="Bulk" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-gray-900 dark:text-zinc-100">Cancel Subscription?</h2>
            <p className="text-xs text-gray-600 dark:text-zinc-400 mt-1.5 leading-relaxed">
              If you cancel, you will lose access to all premium features at the end of your current billing cycle (July 25, 2026). Your data will be preserved in a read-only state for 90 days.
            </p>
          </div>
        </div>
        <div className="px-6 pb-5 flex gap-3 justify-end bg-gray-50 dark:bg-zinc-900/80 pt-4 border-t border-gray-200 dark:border-zinc-800">
          <button onClick={onClose} className="px-4 py-2 rounded-lg text-sm text-gray-600 dark:text-zinc-400 font-medium hover:text-gray-900 dark:hover:text-zinc-100 hover:bg-gray-200 dark:hover:bg-zinc-800 transition-all">
            Keep Subscription
          </button>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-500 transition-all shadow-sm"
          >
            Confirm Cancellation
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function BillingPage() {
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 text-gray-900 dark:text-zinc-300 font-sans pb-16 selection:bg-gray-200 selection:text-gray-900 dark:selection:bg-zinc-800 dark:selection:text-zinc-100">

        {/* Top Nav */}
        <div className="border-b border-gray-200 dark:border-zinc-800/80 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md sticky top-0 z-10">
          <div className="px-6 h-16 flex items-center justify-between max-w-7xl mx-auto">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gray-100 dark:bg-zinc-900 rounded-lg border border-gray-200 dark:border-zinc-800/80 shadow-sm text-gray-600 dark:text-zinc-400">
                <EmptyWallet size={18} color="currentColor" variant="Bulk" />
              </div>
              <h1 className="text-sm font-medium text-gray-900 dark:text-zinc-100">
                Billing & Subscription
              </h1>
            </div>
            <button className="flex items-center gap-1.5 bg-white dark:bg-zinc-900 hover:bg-gray-50 dark:hover:bg-zinc-800 transition-all text-gray-700 dark:text-zinc-300 text-xs font-medium px-4 py-2 rounded-lg border border-gray-200 dark:border-zinc-800 shadow-sm">
              <DocumentDownload size={14} color="currentColor" />
              Statement
            </button>
          </div>
        </div>

        <div className="px-6 py-8 max-w-7xl mx-auto space-y-8">

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

            {/* Left Column: Plan & Payment Methods */}
            <div className="lg:col-span-2 space-y-8">

              {/* Current Plan Overview */}
              <div className="bg-white dark:bg-zinc-900/40 border border-gray-200 dark:border-zinc-800/50 rounded-xl overflow-hidden shadow-sm">
                <div className="p-6 sm:p-8">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 mb-8">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-zinc-100 tracking-tight">Enterprise OS</h2>
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md border border-gray-200 dark:border-zinc-700/50 bg-gray-100 dark:bg-zinc-800 text-[10px] font-medium text-gray-700 dark:text-zinc-300 uppercase tracking-widest">
                          Active
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-zinc-400">Unlimited scale and custom workflows for conglomerates.</p>
                    </div>
                    <div className="text-left sm:text-right">
                      <p className="text-3xl font-bold text-gray-900 dark:text-zinc-50 tracking-tight mb-1">₦250,000</p>
                      <p className="text-xs font-medium text-gray-500 dark:text-zinc-500">per month</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 p-5 bg-gray-50 dark:bg-pri rounded-xl border border-gray-200 dark:border-zinc-800/80">
                    <div>
                      <p className="text-[10px] font-medium text-gray-500 dark:text-zinc-500 uppercase tracking-widest mb-1.5">Next Billing Date</p>
                      <div className="flex items-center gap-2">
                        <Calendar size={14} className="text-gray-400 dark:text-zinc-400" color="currentColor" />
                        <p className="text-sm font-semibold text-gray-900 dark:text-zinc-200">July 25, 2026</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-[10px] font-medium text-gray-500 dark:text-zinc-500 uppercase tracking-widest mb-1.5">Seat Usage</p>
                      <div className="flex items-center gap-2">
                        <Buildings2 size={14} className="text-gray-400 dark:text-zinc-400" color="currentColor" />
                        <p className="text-sm font-semibold text-gray-900 dark:text-zinc-200">Unlimited Personnel</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="px-6 sm:px-8 py-5 border-t border-gray-200 dark:border-zinc-800/80 bg-gray-50/50 dark:bg-zinc-900/30 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <button
                    onClick={() => setShowCancelModal(true)}
                    className="text-xs font-medium text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-colors px-3 py-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10"
                  >
                    Cancel Subscription
                  </button>
                  <button
                    onClick={() => setShowUpgradeModal(true)}
                    className="w-full sm:w-auto px-5 py-2.5 rounded-lg bg-gray-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-sm font-medium hover:bg-black dark:hover:bg-white transition-all shadow-sm flex items-center justify-center gap-2"
                  >
                    <Flash size={16} color="currentColor" variant="Bulk" /> Change Plan
                  </button>
                </div>
              </div>

              {/* Payment Methods */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-zinc-100">Payment Methods</h3>
                  <button className="text-[11px] font-medium text-gray-600 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-zinc-100 transition-colors flex items-center gap-1">
                    <Add size={14} color="currentColor" /> Add Method
                  </button>
                </div>

                <div className="space-y-3">
                  {MOCK_PAYMENT_METHODS.map((pm) => (
                    <div key={pm.id} className="flex items-center justify-between p-4 bg-white dark:bg-zinc-900/40 border border-gray-200 dark:border-zinc-800/50 rounded-xl shadow-sm hover:border-gray-300 dark:hover:border-zinc-700 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-8 bg-gray-100 dark:bg-zinc-800 rounded border border-gray-200 dark:border-zinc-700 flex items-center justify-center text-[10px] font-bold text-gray-500 dark:text-zinc-400 tracking-wider">
                          VISA
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium text-gray-900 dark:text-zinc-200">•••• {pm.last4}</p>
                            {pm.isDefault && (
                              <span className="bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-zinc-400 text-[9px] px-1.5 py-0.5 rounded font-medium border border-gray-200 dark:border-zinc-700">Default</span>
                            )}
                          </div>
                          <p className="text-[11px] text-gray-500 dark:text-zinc-500 mt-0.5">Expires {pm.expiry}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button className="p-2 text-gray-400 dark:text-zinc-500 hover:text-gray-900 dark:hover:text-zinc-200 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-lg transition-colors">
                          <Edit2 size={16} color="currentColor" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Right Column: Billing History */}
            <div className="bg-white dark:bg-zinc-900/40 border border-gray-200 dark:border-zinc-800/50 rounded-xl overflow-hidden shadow-sm">
              <div className="p-5 border-b border-gray-200 dark:border-zinc-800/80 bg-gray-50 dark:bg-pri flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-zinc-100 flex items-center gap-2">
                  <Receipt21 size={16} className="text-gray-500 dark:text-zinc-400" color="currentColor" />
                  Billing History
                </h3>
              </div>
              <div className="divide-y divide-gray-100 dark:divide-zinc-800/80">
                {MOCK_INVOICES.map((inv) => (
                  <div key={inv.id} className="p-4 hover:bg-gray-50 dark:hover:bg-zinc-800/30 transition-colors flex items-center justify-between group cursor-pointer">
                    <div>
                      <p className="text-xs font-semibold text-gray-900 dark:text-zinc-200 mb-1">{formatAmount(inv.amount)}</p>
                      <div className="flex items-center gap-2 text-[10px]">
                        <span className="text-gray-500 dark:text-zinc-400">{formatDate(inv.date)}</span>
                        <span className="text-gray-300 dark:text-zinc-700">•</span>
                        <span className="font-mono text-gray-400 dark:text-zinc-500">{inv.plan}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {inv.status === "paid" ? (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-medium border border-gray-200 dark:border-zinc-700 bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-zinc-300 uppercase tracking-wider">
                          Paid
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-medium border border-red-200 dark:border-red-500/20 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 uppercase tracking-wider">
                          Failed
                        </span>
                      )}
                      <button className="text-gray-400 dark:text-zinc-500 hover:text-gray-900 dark:hover:text-zinc-200 transition-colors opacity-0 group-hover:opacity-100">
                        <DocumentDownload size={16} color="currentColor" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-4 border-t border-gray-200 dark:border-zinc-800/80 bg-gray-50/50 dark:bg-zinc-900/30 text-center">
                <button className="text-[11px] font-medium text-gray-600 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-zinc-100 transition-colors flex items-center justify-center gap-1.5 w-full">
                  View All Invoices <ArrowRight2 size={12} color="currentColor" />
                </button>
              </div>
            </div>

          </div>
        </div>

        {/* Modals */}
        {showUpgradeModal && <UpgradeModal onClose={() => setShowUpgradeModal(false)} />}
        {showCancelModal && <CancelModal onClose={() => setShowCancelModal(false)} />}
      </div>
    </Layout>
  );
}