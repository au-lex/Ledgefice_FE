import { useState } from "react";
import { Add, Minus, MessageQuestion } from "iconsax-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface FAQItem {
  q: string;
  a: string;
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const FAQS: FAQItem[] = [
  {
    q: "Do I need a developer to set up Ledgefice?",
    a: "No. Everything — voucher types, approval chains, departments, and permissions — is configured through the dashboard. No code, no technical setup required.",
  },
  {
    q: "Can we define our own voucher types and fields?",
    a: "Yes. You can create as many voucher types as your organization needs, each with its own custom fields (text, number, date, file upload). Types can be scoped to specific departments or available globally.",
  },
  {
    q: "How do approval chains work?",
    a: "Each voucher type can have its own approval chain — single-step or multi-step, sequential or parallel. The system routes automatically based on the voucher type and amount tier, so nothing needs to be forwarded manually.",
  },
  {
    q: "What happens if an approver queries a voucher?",
    a: "The voucher is bounced back to the requester with the query attached. Once they respond, it re-enters the chain from the point it was queried. Every action is timestamped and logged.",
  },
  {
    q: "Is the audit log permanent?",
    a: "Yes. The audit log is immutable — every system action is recorded and preserved, even if a voucher or user is later removed. It's filterable by user, department, voucher type, or date range.",
  },
  {
    q: "Can different departments have different permission levels?",
    a: "Yes. Permissions are assigned at the department level, so access to vouchers, reporting, and billing controls is consistent for everyone in that department. You can also fine-tune individual permission flags per role.",
  },
  {
    q: "How do I get started?",
    a: "Reach out to our team and we'll get you set up on the right plan. Onboarding is straightforward and we walk you through the initial configuration.",
  },
  {
    q: "Can we switch plans later?",
    a: "Yes, you can upgrade or downgrade at any time. Changes take effect at the start of the next billing cycle, and your data is never affected by a plan change.",
  },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function FAQRow({ item, open, onToggle }: { item: FAQItem; open: boolean; onToggle: () => void }) {
  return (
    <div
      className={`border border-zinc-800/50 rounded-2xl overflow-hidden transition-colors ${
        open ? "bg-zinc-900/60" : "bg-zinc-900/30 hover:bg-zinc-900/50"
      }`}
    >
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left"
      >
        <span className={`text-sm font-medium leading-snug ${open ? "text-zinc-100" : "text-zinc-300"}`}>
          {item.q}
        </span>
        <span className="flex-shrink-0 w-7 h-7 rounded-full bg-zinc-800/80 border border-zinc-700/50 flex items-center justify-center">
          {open
            ? <Minus size={13} color="currentColor" className="text-zinc-300" />
            : <Add size={13} color="currentColor" className="text-zinc-400" />
          }
        </span>
      </button>

      {open && (
        <div className="px-5 pb-5">
          <p className="text-sm text-zinc-500 leading-relaxed">{item.a}</p>
        </div>
      )}
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (i: number) => setOpenIndex(openIndex === i ? null : i);

  const half = Math.ceil(FAQS.length / 2);
  const col1 = FAQS.slice(0, half);
  const col2 = FAQS.slice(half);

  return (
    <div className="px-4 sm:px-6 py-20 max-w-6xl mx-auto">
      {/* Header */}
      <div className="text-center max-w-lg mx-auto mb-14">
        <div className="inline-flex items-center gap-2 bg-zinc-900 border border-zinc-800/60 rounded-full px-4 py-1.5 mb-6">
          <MessageQuestion size={12} color="currentColor" className="text-zinc-400" />
          <span className="text-[11px] font-medium text-zinc-400">FAQ</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-zinc-50 mb-3">
          Questions we hear a lot
        </h2>
        <p className="text-sm text-zinc-500 leading-relaxed">
          If something isn't answered here, reach out — we're happy to help.
        </p>
      </div>

      {/* Two-column accordion */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <div className="flex flex-col gap-3">
          {col1.map((item, i) => (
            <FAQRow
              key={i}
              item={item}
              open={openIndex === i}
              onToggle={() => toggle(i)}
            />
          ))}
        </div>
        <div className="flex flex-col gap-3">
          {col2.map((item, i) => (
            <FAQRow
              key={i + half}
              item={item}
              open={openIndex === i + half}
              onToggle={() => toggle(i + half)}
            />
          ))}
        </div>
      </div>

      {/* Bottom nudge */}
      <p className="text-center text-xs text-zinc-600 mt-12">
        Still have questions?{" "}
        <a href="mailto:hello@ledgefice.com" className="text-zinc-400 underline underline-offset-2 hover:text-zinc-200 transition-colors">
          Send us a message
        </a>
      </p>
    </div>
  );
}