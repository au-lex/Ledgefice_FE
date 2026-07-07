import React from "react";
import { ArrowRight } from "iconsax-react";

import { Link } from "react-scroll"; 
// ─── Avatar data ──────────────────────────────────────────────────────────────

const AVATARS = [
  { initials: "AO", src: "https://i.pinimg.com/736x/b4/69/35/b46935e2a26c624c722cdf9063a4ca24.jpg" },
  { initials: "CE", src: "https://images.unsplash.com/photo-1642929426263-caf1617ced29?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8YWZyaWNhJTIwbGFkeSUyMHdvcmtpbmclMjBpbiUyMG9mZmljZXxlbnwwfHwwfHx8MA%3D%3D" },
  { initials: "NA", src: "https://images.unsplash.com/photo-1765648636080-eea4cb482355?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8YWZyaWNhJTIwbGFkeSUyMHdvcmtpbmclMjBpbiUyMG9mZmljZXxlbnwwfHwwfHx8MA%3D%3D" },
  { initials: "FB", src: "https://i.pinimg.com/736x/31/a5/75/31a575ff184e0c262b55059c0d6c7f5e.jpg" },
  { initials: "TK", src: "https://plus.unsplash.com/premium_photo-1661717876697-1c47186f54fd?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTN8fGFmcmljYSUyMGxhZHklMjB3b3JraW5nJTIwaW4lMjBvZmZpY2V8ZW58MHx8MHx8fDA%3D" },
];

// floating positions — hidden on mobile, shown md+
const FLOAT_POSITIONS: {
  initials: string;
  src: string;
  cls: string;
  style: React.CSSProperties;
}[] = [
  {
    initials: "AO",
    src: AVATARS[0].src,
    cls: "hidden md:flex",
    style: { top: "22%", left: "clamp(16px, 5vw, 72px)", rotate: "-8deg" },
  },
  {
    initials: "CE",
    src: AVATARS[1].src,
    cls: "hidden md:flex",
    style: { top: "38%", left: "clamp(56px, 10vw, 130px)", rotate: "5deg" },
  },
  {
    initials: "NA",
    src: AVATARS[2].src,
    cls: "hidden md:flex",
    style: { top: "20%", right: "clamp(16px, 5vw, 72px)", rotate: "10deg" },
  },
  {
    initials: "FB",
    src: AVATARS[3].src,
    cls: "hidden md:flex",
    style: { top: "37%", right: "clamp(56px, 10vw, 130px)", rotate: "-6deg" },
  },
  {
    initials: "TK",
    src: AVATARS[4].src,
    cls: "hidden lg:flex",
    style: { bottom: "30%", right: "clamp(10px, 4vw, 56px)", rotate: "8deg" },
  },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function FloatingAvatar({
  src,
  initials,
  cls,
  style,
}: {
  src: string;
  initials: string;
  cls: string;
  style: React.CSSProperties;
}) {
  return (
    <div
      className={`absolute w-11 h-11 rounded-full border-2 border-zinc-800 overflow-hidden shadow-xl shadow-black/50 ${cls}`}
      style={style}
    >
      <img src={src} alt={initials} className="w-full h-full object-cover grayscale opacity-80" />
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function HeroSection() {
  return (
    <main className="relative w-full min-h-screen flex flex-col items-center justify-center overflow-hidden bg-zinc-950">


      {/* ── Ambient glows ── */}
      <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-[560px] h-64 bg-zinc-300/10 blur-3xl rounded-full" />
      <div className="pointer-events-none absolute bottom-0 left-1/4 w-72 h-40 bg-zinc-500/5 blur-2xl rounded-full" />
      <div className="pointer-events-none absolute bottom-0 right-1/4 w-64 h-32 bg-zinc-500/5 blur-2xl rounded-full" />

      {/* ── Floating avatars (md+) ── */}
      {FLOAT_POSITIONS.map((a) => (
        <FloatingAvatar key={a.initials} src={a.src} initials={a.initials} cls={a.cls} style={a.style} />
      ))}

      {/* ── Content ── */}
      <div className="relative z-10 flex flex-col items-center text-center px-5 sm:px-8 w-full max-w-3xl mx-auto">

        {/* eyebrow */}
        <div className="inline-flex items-center gap-2 bg-zinc-900/80 border border-zinc-700/60 rounded-full px-4 py-1.5 mb-8 sm:mb-10">
          <div className="w-1.5 h-1.5 rounded-full bg-zinc-400" />
          <span className="text-[11px] font-medium text-zinc-400 tracking-wide">
            Voucher management, done right
          </span>
        </div>

        {/* headline */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-medium tracking-tight leading-[1.05] mb-5 sm:mb-6">
          <span className="text-zinc-100">Stop chasing</span>
          <br />
          <span className="text-zinc-100">approvals.</span>
        </h1>

        {/* subtext */}
        <p className="text-sm sm:text-base text-zinc-500 leading-relaxed max-w-md sm:max-w-lg mb-8 sm:mb-10">
          Ledgefice gives your team one place to raise vouchers, route them through the right approvers, and keep a clean audit trail — automatically.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center gap-3 mb-12 sm:mb-16 w-full sm:w-auto">
          <a
            href="/onboarding"
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-zinc-100 hover:bg-white text-zinc-950 text-sm font-semibold px-6 py-3 rounded-xl transition-all shadow-sm"
          >
            Get started
            <ArrowRight size={15} color="currentColor" />
          </a>
          <Link 
       
    
                spy={true}
                smooth={true}
                offset={-80} 
                duration={500}

            to="how-it-works"
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-zinc-900/60 hover:bg-zinc-800/80 border border-zinc-700/50 text-zinc-300 text-sm font-medium px-6 py-3 rounded-xl transition-all"
          >
            See how it works
          </Link>
        </div>

        {/* social proof strip */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          {/* stacked avatars */}
          <div className="flex items-center">
            {AVATARS.slice(0, 4).map((a, i) => (
              <div
                key={a.initials}
                className="w-8 h-8 rounded-full border-2 border-zinc-950 overflow-hidden"
                style={{ marginLeft: i === 0 ? 0 : "-10px", zIndex: 4 - i }}
              >
                <img
                  src={a.src.replace("44x44", "32x32")}
                  alt={a.initials}
                  className="w-full h-full object-cover grayscale"
                />
              </div>
            ))}
          </div>
          <p className="text-xs text-zinc-500">
            Trusted by finance & ops teams across Nigeria
          </p>
        </div>
      </div>
    </main>
  );
}