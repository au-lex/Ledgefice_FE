import React from "react";
import { QuoteDown, Star1 } from "iconsax-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Testimonial {
  quote: string;
  name: string;
  role: string;
  org: string;
  initials: string;
}

// ─── Data ─────────────────────────────────────────────────────────────────────
// ⚠️ Placeholder testimonials — replace with real ones before launch.

const TESTIMONIALS: Testimonial[] = [
  {
    quote:
      "Before Ledgefice, approvals were a mess of WhatsApp messages and spreadsheets. Now every voucher has a clear trail and nothing falls through the cracks.",
    name: "Amara Okafor",
    role: "Head of Finance",
    org: "Bridgepoint Holdings",
    initials: "AO",
  },
  {
    quote:
      "Setting up our approval chains took less than an hour. The fact that it routes automatically based on amount tier alone has saved us so much back-and-forth.",
    name: "Chidi Eze",
    role: "Operations Manager",
    org: "Telvara Logistics",
    initials: "CE",
  },
  {
    quote:
      "The audit log is the feature our board cares about most. Every action, every decision — timestamped and exportable. Compliance reviews are painless now.",
    name: "Ngozi Adeyemi",
    role: "CFO",
    org: "Strata Financial Services",
    initials: "NA",
  },
  {
    quote:
      "We run five departments with completely different approval flows. Ledgefice handles all of them from one place without any confusion between teams.",
    name: "Emeka Nwosu",
    role: "Director of Administration",
    org: "Kova Group",
    initials: "EN",
  },
  {
    quote:
      "Our finance team used to chase approvers for days. Now the system does it automatically and everyone can see exactly where a voucher is at any point.",
    name: "Fatima Bello",
    role: "Finance Controller",
    org: "Greenfield Properties",
    initials: "FB",
  },
  {
    quote:
      "Honestly the simplest procurement tool we've used. Staff picked it up without any training and the department spend reports are genuinely useful.",
    name: "Tunde Adebayo",
    role: "Procurement Lead",
    org: "Nexlite Industries",
    initials: "TA",
  },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function Stars() {
  return (
    <div className="flex items-center gap-0.5 mb-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star1 key={i} size={13} color="currentColor" variant="Bold" className="text-zinc-400" />
      ))}
    </div>
  );
}

function TestimonialCard({ t }: { t: Testimonial }) {
  return (
    <div className="flex flex-col bg-zinc-900/40 border border-zinc-800/50 rounded-2xl p-6 hover:border-zinc-700/60 transition-colors break-inside-avoid mb-4">
      <QuoteDown size={20} color="currentColor" className="text-zinc-700 mb-3" variant="Bold" />
      <Stars />
      <p className="text-sm text-zinc-300 leading-relaxed flex-1 mb-6">
        "{t.quote}"
      </p>
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-zinc-800 border border-zinc-700/50 flex items-center justify-center flex-shrink-0">
          <span className="text-[11px] font-semibold text-zinc-300">{t.initials}</span>
        </div>
        <div>
          <p className="text-xs font-medium text-zinc-200">{t.name}</p>
          <p className="text-[11px] text-zinc-500">{t.role}, {t.org}</p>
        </div>
      </div>
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function TestimonialsSection() {
  const col1 = TESTIMONIALS.filter((_, i) => i % 3 === 0);
  const col2 = TESTIMONIALS.filter((_, i) => i % 3 === 1);
  const col3 = TESTIMONIALS.filter((_, i) => i % 3 === 2);

  return (
    <div className="px-4 sm:px-6 py-20 max-w-6xl mx-auto">
      {/* Header */}
      <div className="text-center max-w-lg mx-auto mb-14">
        <div className="inline-flex items-center gap-2 bg-zinc-900 border border-zinc-800/60 rounded-full px-4 py-1.5 mb-6">
          <Star1 size={12} color="currentColor" className="text-zinc-400" variant="Bold" />
          <span className="text-[11px] font-medium text-zinc-400">What people say</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-zinc-50 mb-3">
          Trusted by finance and ops teams
        </h2>
        <p className="text-sm text-zinc-500 leading-relaxed">
          From small departments to multi-site organisations — here's what they've said.
        </p>
      </div>

      {/* Masonry grid — 3 col desktop, 2 col tablet, 1 col mobile */}
      <div className="hidden lg:grid grid-cols-3 gap-4 items-start">
        <div>{col1.map((t, i) => <TestimonialCard key={i} t={t} />)}</div>
        <div className="mt-8">{col2.map((t, i) => <TestimonialCard key={i} t={t} />)}</div>
        <div>{col3.map((t, i) => <TestimonialCard key={i} t={t} />)}</div>
      </div>

      {/* Tablet: 2 col */}
      <div className="hidden sm:grid lg:hidden grid-cols-2 gap-4 items-start">
        {TESTIMONIALS.filter((_, i) => i % 2 === 0).map((t, i) => <TestimonialCard key={i} t={t} />)}
        <div className="mt-8">
          {TESTIMONIALS.filter((_, i) => i % 2 === 1).map((t, i) => <TestimonialCard key={i} t={t} />)}
        </div>
      </div>

      {/* Mobile: 1 col */}
      <div className="flex flex-col gap-4 sm:hidden">
        {TESTIMONIALS.map((t, i) => <TestimonialCard key={i} t={t} />)}
      </div>
    </div>
  );
}