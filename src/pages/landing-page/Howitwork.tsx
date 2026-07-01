import React from "react";
import {
  DocumentText,
  Send2,
  TickCircle,
  ShieldTick,
  ArrowRight,
  ArrowDown,
} from "iconsax-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface FlowStep {
  n: string;
  icon: React.ElementType;
  title: string;
  desc: string;
  detail: string;
  image?: string;
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const STEPS: FlowStep[] = [
  {
    n: "01",
    icon: DocumentText,
    title: "Raise a voucher",
    desc: "Pick a voucher type and fill in its fields.",
    detail:
      "Choose from any custom voucher type your organization has defined, complete the required fields, attach files if needed — done in under a minute.",
    // image: "https://placehold.co/480x200/18181b/27272a?text=.",
  },
  {
    n: "02",
    icon: Send2,
    title: "Routed for approval",
    desc: "Sent through the department's approval chain.",
    detail:
      "The voucher moves automatically through its configured approval chain — single-step or multi-step — with no manual forwarding required.",
  },
  {
    n: "03",
    icon: TickCircle,
    title: "Approve or query",
    desc: "Approvers see exactly what they need to decide.",
    detail:
      "Each approver gets full context on the voucher and can approve, reject, or query it in one click — every decision is logged with a timestamp.",
    // image: "https://placehold.co/480x200/18181b/27272a?text=.",
  },
  {
    n: "04",
    icon: ShieldTick,
    title: "Tracked to close",
    desc: "Logged against department spend, fully auditable.",
    detail:
      "Once approved, the voucher is recorded against its department's spend and remains fully auditable from the moment it was raised.",
  },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function StepCard({ step }: { step: FlowStep }) {
  const Icon = step.icon;
  return (
    <div className="group flex flex-col h-full bg-zinc-900/40 border border-zinc-800/50 rounded-2xl overflow-hidden hover:border-zinc-700/70 transition-colors">
      {/* image slot — only rendered for steps that have one */}
      {step.image && (
        <div className="relative w-full h-36 overflow-hidden flex-shrink-0">
          <img
            src={step.image}
            alt={step.title}
            className="w-full h-full object-cover grayscale opacity-50 group-hover:opacity-70 transition-opacity"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-zinc-900/80" />
        </div>
      )}

      <div className="flex flex-col flex-1 p-5">
        {/* icon + step number */}
        <div className="flex items-center justify-between mb-5">
          <div className="w-10 h-10 rounded-xl bg-zinc-800/70 border border-zinc-700/50 flex items-center justify-center group-hover:border-zinc-600 transition-colors">
            <Icon size={18} color="currentColor" className="text-zinc-300" />
          </div>
          <span className="text-xs font-mono font-semibold text-zinc-600">{step.n}</span>
        </div>

        <h3 className="text-sm font-semibold text-zinc-100 mb-1.5">{step.title}</h3>
        <p className="text-xs text-zinc-500 leading-relaxed mb-4">{step.desc}</p>

        <p className="text-[11px] text-zinc-500 leading-relaxed mt-auto pt-4 border-t border-zinc-800/50">
          {step.detail}
        </p>
      </div>
    </div>
  );
}

function StepConnector() {
  return (
    <>
      <div className="hidden lg:flex items-center justify-center px-1 pt-16">
        <ArrowRight size={16} color="currentColor" className="text-zinc-700" />
      </div>
      <div className="flex lg:hidden items-center justify-center py-1">
        <ArrowDown size={16} color="currentColor" className="text-zinc-700" />
      </div>
    </>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function FlowSection() {
  return (
    <div className="px-4 sm:px-6 py-20 max-w-7xl mx-auto">
      <div className="text-center max-w-lg mx-auto mb-14">
        <div className="inline-flex items-center gap-2 bg-zinc-900 border border-zinc-800/60 rounded-full px-4 py-1.5 mb-6">
          <Send2 size={12} color="currentColor" className="text-zinc-400" />
          <span className="text-[11px] font-medium text-zinc-400">The Flow</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-zinc-50 mb-3">
          From raised to resolved
        </h2>
        <p className="text-sm text-zinc-500 leading-relaxed">
          A voucher's path through the system, start to finish — no step skipped, nothing lost.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row items-stretch gap-0">
        {STEPS.map((step, i) => (
          <React.Fragment key={step.n}>
            <div className="flex-1">
              <StepCard step={step} />
            </div>
            {i < STEPS.length - 1 && <StepConnector />}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}