import React from "react";
import { ArrowRight, Receipt21, ShieldTick, ChartSquare } from "iconsax-react";



// ─── Component ────────────────────────────────────────────────────────────────

export default function CTABanner() {
  return (
    <div className="px-4 sm:px-6 py-20 max-w-6xl mx-auto">
      <div className="relative rounded-2xl overflow-hidden border border-zinc-800/60 bg-zinc-900/50 px-8 sm:px-14 py-16 flex flex-col items-center text-center">

        {/* background glow */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-48 bg-zinc-600/10 blur-3xl rounded-full" />
          <div className="absolute bottom-0 right-1/4 w-64 h-32 bg-zinc-500/5 blur-2xl rounded-full" />
        </div>

        {/* eyebrow */}
        <div className="inline-flex items-center gap-2 bg-zinc-800/60 border border-zinc-700/50 rounded-full px-4 py-1.5 mb-8">
          <div className="w-1.5 h-1.5 rounded-full bg-zinc-400" />
          <span className="text-[11px] font-medium text-zinc-400 tracking-wide">
            Get started today
          </span>
        </div>

        {/* headline */}
        <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-zinc-50 leading-tight max-w-xl mb-4">
          Stop chasing approvals.<br />
          <span className="text-zinc-400">Start closing them.</span>
        </h2>

        <p className="text-sm text-zinc-500 leading-relaxed max-w-md mb-10">
          Give your finance and operations teams one place to raise, route, and resolve every voucher — with a full audit trail from day one.
        </p>


        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <a
            href="#contact"
            className="flex items-center gap-2 bg-zinc-100 hover:bg-white text-zinc-950 text-sm font-semibold px-6 py-3 rounded-xl transition-all shadow-sm"
          >
            Get started
            <ArrowRight size={15} color="currentColor" />
          </a>
          <a
            href="#pricing"
            className="flex items-center gap-2 bg-transparent hover:bg-zinc-800/60 border border-zinc-700/50 text-zinc-300 text-sm font-medium px-6 py-3 rounded-xl transition-all"
          >
            View pricing
          </a>
        </div>
      </div>
    </div>
  );
}