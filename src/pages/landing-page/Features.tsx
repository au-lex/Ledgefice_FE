import React from "react";
import {
  Receipt21,
  Hierarchy,
  Building,
  Profile2User,
  ChartSquare,
  SecuritySafe,
  TickCircle,
} from "iconsax-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface FeatureCard {
  id: string;
  icon: React.ElementType;
  title: string;
  tagline: string;
  capabilities: string[];
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const FEATURES: FeatureCard[] = [
  {
    id: "voucher-types",
    icon: Receipt21,
    title: "Custom Voucher Types",
    tagline: "Build the exact form your process needs — no developer required.",
    capabilities: [
      "Text, number, date, and file fields",
      "Scoped globally or to one department",
      "Edit or retire without breaking past records",
    ],
  },
  {
    id: "approval-chains",
    icon: Hierarchy,
    title: "Approval Chains",
    tagline: "Route every voucher to the right people, automatically.",
    capabilities: [
      "Multi-step, sequential or parallel",
      "Different chains per voucher type",
      "Full history of who approved or queried",
    ],
  },
  {
    id: "departments",
    icon: Building,
    title: "Department Structure",
    tagline: "The unit everything else hangs off — staff, spend, and access.",
    capabilities: [
      "Track headcount and spend per department",
      "Custom icon and short code per department",
      "Spend distribution visible at a glance",
    ],
  },
  {
    id: "permissions",
    icon: Profile2User,
    title: "Department-Level Permissions",
    tagline: "Assign a department, access follows automatically.",
    capabilities: [
      "Granular permissions across vouchers & billing",
      "Group toggles for fast setup",
      "Consistent access across every user in a department",
    ],
  },
  {
    id: "reporting",
    icon: ChartSquare,
    title: "Spend & Reporting",
    tagline: "See where the money is going, in real time.",
    capabilities: [
      "Live spend by department or voucher type",
      "Active vs. historical voucher tracking",
      "Exportable summaries for finance review",
    ],
  },
  {
    id: "audit",
    icon: SecuritySafe,
    title: "Audit Trail",
    tagline: "Every action, logged and accountable.",
    capabilities: [
      "Immutable log of every system action",
      "Filterable by user, department, or date",
      "Preserved history even after records are removed",
    ],
  },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function FeatureCardItem({ feature }: { feature: FeatureCard }) {
  const Icon = feature.icon;
  return (
    <div className="group flex flex-col bg-zinc-900/40 border border-zinc-800/50 rounded-2xl p-6 hover:border-zinc-700/60 hover:bg-zinc-900/60 transition-all">
      {/* icon */}
      <div className="w-11 h-11 rounded-xl bg-zinc-800/70 border border-zinc-700/50 flex items-center justify-center mb-5 group-hover:border-zinc-600 transition-colors">
        <Icon size={20} color="currentColor" className="text-zinc-300" />
      </div>

      <h3 className="text-sm font-semibold text-zinc-100 mb-2">{feature.title}</h3>
      <p className="text-xs text-zinc-500 leading-relaxed mb-6">{feature.tagline}</p>

      <ul className="space-y-2.5 mt-auto pt-5 border-t border-zinc-800/50">
        {feature.capabilities.map((c) => (
          <li key={c} className="flex items-start gap-2">
            <TickCircle
              size={13}
              color="currentColor"
              className="text-zinc-500 flex-shrink-0 mt-0.5"
            />
            <span className="text-[11px] text-zinc-400 leading-relaxed">{c}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function FeaturesSection() {
  return (
    <div className="px-4 sm:px-6 py-20 max-w-6xl mx-auto">
      {/* Header */}
      <div className="text-center max-w-lg mx-auto mb-14">
        <div className="inline-flex items-center gap-2 bg-zinc-900 border border-zinc-800/60 rounded-full px-4 py-1.5 mb-6">
          <Receipt21 size={12} color="currentColor" className="text-zinc-400" />
          <span className="text-[11px] font-medium text-zinc-400">Platform Capabilities</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-zinc-50 mb-3">
          One system, every moving part
        </h2>
        <p className="text-sm text-zinc-500 leading-relaxed">
          From raising a voucher to closing the books — here's what's running underneath.
        </p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {FEATURES.map((f) => (
          <FeatureCardItem key={f.id} feature={f} />
        ))}
      </div>
    </div>
  );
}