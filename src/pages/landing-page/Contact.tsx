import React, { useState } from "react";
import { Sms, Call, Location, ArrowRight, User, MessageText } from "iconsax-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ContactInfo {
  icon: React.ElementType;
  label: string;
  value: string;
  href: string;
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const CONTACT_INFO: ContactInfo[] = [
  {
    icon: Sms,
    label: "Email us",
    value: "hello@ledgefice.com",
    href: "mailto:hello@ledgefice.com",
  },
  {
    icon: Call,
    label: "Call us",
    value: "+234 800 000 0000",
    href: "tel:+2348000000000",
  },
  {
    icon: Location,
    label: "Find us",
    value: "Lagos, Nigeria",
    href: "#",
  },
];

// ─── Component ────────────────────────────────────────────────────────────────

export default function ContactSection() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    org: "",
    message: "",
  });
  const [sent, setSent] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = (e: React.MouseEvent) => {
    e.preventDefault();
    // wire to your backend / email service here
    setSent(true);
  };

  return (
    <div className="px-4 sm:px-6 py-20 max-w-6xl mx-auto">
      {/* Header */}
      <div className="text-center max-w-lg mx-auto mb-14">
        <div className="inline-flex items-center gap-2 bg-zinc-900 border border-zinc-800/60 rounded-full px-4 py-1.5 mb-6">
          <Sms size={12} color="currentColor" className="text-zinc-400" />
          <span className="text-[11px] font-medium text-zinc-400">Contact</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-zinc-50 mb-3">
          Let's get you set up
        </h2>
        <p className="text-sm text-zinc-500 leading-relaxed">
          Tell us about your organisation and we'll reach out to walk you through everything.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">

        {/* Left: contact info */}
        <div className="lg:col-span-2 flex flex-col gap-4">

          {/* info cards */}
          {CONTACT_INFO.map((c) => {
            const Icon = c.icon;
            return (
              <a
                key={c.label}
                href={c.href}
                className="group flex items-center gap-4 bg-zinc-900/40 border border-zinc-800/50 rounded-2xl px-5 py-4 hover:border-zinc-700/60 hover:bg-zinc-900/60 transition-all"
              >
                <div className="w-10 h-10 rounded-xl bg-zinc-800/70 border border-zinc-700/50 flex items-center justify-center flex-shrink-0 group-hover:border-zinc-600 transition-colors">
                  <Icon size={17} color="currentColor" className="text-zinc-300" />
                </div>
                <div>
                  <p className="text-[10px] text-zinc-600 uppercase tracking-widest mb-0.5">{c.label}</p>
                  <p className="text-sm text-zinc-300 font-medium">{c.value}</p>
                </div>
              </a>
            );
          })}

          {/* note */}
          <div className="bg-zinc-900/30 border border-zinc-800/40 rounded-2xl px-5 py-5 mt-auto">
            <p className="text-xs text-zinc-500 leading-relaxed">
              We typically respond within <span className="text-zinc-300 font-medium">1 business day</span>. For urgent matters, call us directly.
            </p>
          </div>
        </div>

        {/* Right: form */}
        <div className="lg:col-span-3 bg-zinc-900/40 border border-zinc-800/50 rounded-2xl p-6 sm:p-8">
          {sent ? (
            <div className="h-full flex flex-col items-center justify-center text-center py-10">
              <div className="w-12 h-12 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center mb-4">
                <Sms size={20} color="currentColor" className="text-zinc-300" />
              </div>
              <h3 className="text-sm font-semibold text-zinc-100 mb-2">Message received</h3>
              <p className="text-xs text-zinc-500 max-w-xs leading-relaxed">
                Thanks for reaching out. We'll get back to you within 1 business day.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Name */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] text-zinc-500 uppercase tracking-widest">Full name</label>
                  <div className="relative">
                    <User size={13} color="currentColor" className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600" />
                    <input
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      placeholder="Amara Okafor"
                      className="w-full bg-zinc-950/50 border border-zinc-800/60 rounded-xl pl-9 pr-4 py-2.5 text-sm text-zinc-200 placeholder-zinc-700 focus:outline-none focus:border-zinc-600 transition-colors"
                    />
                  </div>
                </div>

                {/* Email */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] text-zinc-500 uppercase tracking-widest">Work email</label>
                  <div className="relative">
                    <Sms size={13} color="currentColor" className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600" />
                    <input
                      name="email"
                      type="email"
                      value={form.email}
                      onChange={handleChange}
                      placeholder="amara@company.com"
                      className="w-full bg-zinc-950/50 border border-zinc-800/60 rounded-xl pl-9 pr-4 py-2.5 text-sm text-zinc-200 placeholder-zinc-700 focus:outline-none focus:border-zinc-600 transition-colors"
                    />
                  </div>
                </div>
              </div>

              {/* Organisation */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] text-zinc-500 uppercase tracking-widest">Organisation</label>
                <div className="relative">
                  <Location size={13} color="currentColor" className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600" />
                  <input
                    name="org"
                    value={form.org}
                    onChange={handleChange}
                    placeholder="Bridgepoint Holdings"
                    className="w-full bg-zinc-950/50 border border-zinc-800/60 rounded-xl pl-9 pr-4 py-2.5 text-sm text-zinc-200 placeholder-zinc-700 focus:outline-none focus:border-zinc-600 transition-colors"
                  />
                </div>
              </div>

              {/* Message */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] text-zinc-500 uppercase tracking-widest">Message</label>
                <div className="relative">
                  <MessageText size={13} color="currentColor" className="absolute left-3 top-3.5 text-zinc-600" />
                  <textarea
                    name="message"
                    value={form.message}
                    onChange={handleChange}
                    rows={4}
                    placeholder="Tell us about your team, how many departments you have, and what you're trying to solve..."
                    className="w-full bg-zinc-950/50 border border-zinc-800/60 rounded-xl pl-9 pr-4 py-2.5 text-sm text-zinc-200 placeholder-zinc-700 focus:outline-none focus:border-zinc-600 transition-colors resize-none"
                  />
                </div>
              </div>

              {/* Submit */}
              <button
                onClick={handleSubmit}
                className="flex items-center justify-center gap-2 bg-zinc-100 hover:bg-white text-zinc-950 text-sm font-semibold px-6 py-3 rounded-xl transition-all shadow-sm mt-2"
              >
                Send message
                <ArrowRight size={15} color="currentColor" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}