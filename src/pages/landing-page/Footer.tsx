import React from "react";
import {  Sms, Location, Instagram, Youtube } from "iconsax-react";
import Logo from "../../components/Logo";

// ─── Types ────────────────────────────────────────────────────────────────────

interface FooterLink {
  label: string;
  href: string;
}

interface FooterColumn {
  heading: string;
  links: FooterLink[];
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const COLUMNS: FooterColumn[] = [
  {
    heading: "Product",
    links: [
      { label: "Features", href: "#features" },
      { label: "How it works", href: "#how-it-works" },
      { label: "Pricing", href: "#pricing" },
      { label: "Changelog", href: "/changelog" },
    ],
  },
  {
    heading: "Company",
    links: [
      { label: "About", href: "/about" },
      { label: "Blog", href: "/blog" },
      { label: "Careers", href: "/careers" },
      { label: "Contact", href: "/contact" },
    ],
  },
  {
    heading: "Legal",
    links: [
      { label: "Privacy policy", href: "/privacy" },
      { label: "Terms of service", href: "/terms" },
      { label: "Cookie policy", href: "/cookies" },
    ],
  },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function SocialLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="w-8 h-8 rounded-xl bg-zinc-800/60 border border-zinc-700/50 flex items-center justify-center text-zinc-500 hover:text-zinc-200 hover:border-zinc-600 transition-all"
    >
      {children}
    </a>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function Footer() {
  return (
    <footer className="border-t border-zinc-800/50 px-4 sm:px-6 pt-16 pb-10 max-w-6xl mx-auto">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-10 mb-14">

        {/* Brand col — spans 2 on large */}
        <div className="lg:col-span-2">
     <Logo />

          <p className="text-xs text-zinc-500 leading-relaxed max-w-xs my-6">
            Voucher management and approval workflows for teams that need structure, accountability, and a clean audit trail.
          </p>

          {/* Contact snippets */}
          <div className="flex flex-col gap-2.5 mb-6">
            <a
              href="mailto:hello@ledgefice.com"
              className="inline-flex items-center gap-2 text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
            >
              <Sms size={13} color="currentColor" />
              hello@ledgefice.com
            </a>
            <span className="inline-flex items-center gap-2 text-xs text-zinc-600">
              <Location size={13} color="currentColor" />
              Lagos, Nigeria
            </span>
          </div>

          {/* Socials */}
          <div className="flex items-center gap-2">
            <SocialLink href="https://twitter.com/ledgefice">
              {/* X / Twitter icon via SVG since Iconsax doesn't have it */}
              <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.747l7.73-8.835L1.254 2.25H8.08l4.253 5.622 5.912-5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </SocialLink>
            <SocialLink href="https://instagram.com/ledgefice">
              <Instagram size={13} color="currentColor" />
            </SocialLink>
            <SocialLink href="https://linkedin.com/company/ledgefice">
              {/* LinkedIn icon */}
              <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
              </svg>
            </SocialLink>
            <SocialLink href="https://youtube.com/@ledgefice">
              <Youtube size={13} color="currentColor" />
            </SocialLink>
          </div>
        </div>

        {/* Link columns */}
        {COLUMNS.map((col) => (
          <div key={col.heading}>
            <p className="text-[11px] font-semibold text-zinc-400 uppercase tracking-widest mb-4">
              {col.heading}
            </p>
            <ul className="flex flex-col gap-3">
              {col.links.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-xs text-zinc-500 hover:text-zinc-200 transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Bottom bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-8 border-t border-zinc-800/40">
        <p className="text-[11px] text-zinc-600">
          © {new Date().getFullYear()} Ledgefice. All rights reserved.
        </p>
        <p className="text-[11px] text-zinc-700">
          Built for African finance teams
        </p>
      </div>
    </footer>
  );
}