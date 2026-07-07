import { useState, useEffect } from "react";
import { HambergerMenu, CloseCircle, Receipt21 } from "iconsax-react";
import { Link } from "react-scroll"; 
import Logo from "../../components/Logo";

// ─── Types ────────────────────────────────────────────────────────────────────

interface NavLink {
  label: string;
  to: string; 
}


const NAV_LINKS: NavLink[] = [
  { label: "Features", to: "features" },
  { label: "How it works", to: "how-it-works" },
  { label: "Pricing", to: "pricing" },
  { label: "FAQ", to: "faq" },
  { label: "Contact", to: "contact" },
];



export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const openMenu = () => {
    setMenuOpen(true);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => setMenuVisible(true));
    });
  };

  const closeMenu = () => {
    setMenuVisible(false);
    setTimeout(() => setMenuOpen(false), 250);
  };

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  return (
    <>
      <header
        className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-zinc-950/80 backdrop-blur-md border-b border-zinc-800/60 shadow-lg shadow-black/20"
            : "bg-transparent border-b border-transparent"
        }`}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-6">

          <Logo />

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.label}
                to={link.to}
                spy={true}
                smooth={true}
                offset={-80} 
                duration={500}
                className="cursor-pointer px-3.5 py-1.5 rounded-lg text-sm text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/50 transition-all"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-2">
            <a href="/login" className="px-4 py-1.5 rounded-xl text-sm text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/50 transition-all">Log in</a>
            <a href="/onboarding" className="flex items-center gap-1.5 px-4 py-1.5 bg-zinc-100 hover:bg-white text-zinc-950 text-sm font-medium rounded-full transition-all shadow-sm">Get started</a>
          </div>

          <button onClick={openMenu} className="md:hidden w-9 h-9 flex items-center justify-center rounded-xl hover:bg-zinc-800/60 transition-colors" aria-label="Open menu">
            <HambergerMenu size={20} color="currentColor" className="text-zinc-300" />
          </button>
        </div>
      </header>

      {/* Mobile menu overlay */}
      {menuOpen && (
        <div className="fixed inset-0 z-50 flex flex-col md:hidden" style={{ background: "rgba(9,9,11,0.95)", backdropFilter: "blur(12px)", opacity: menuVisible ? 1 : 0, transform: menuVisible ? "translateY(0)" : "translateY(-12px)", transition: "opacity 220ms ease, transform 220ms ease" }}>
          
          <div className="flex items-center justify-between px-4 h-16 border-b border-zinc-800/60">
            <a href="/" className="flex items-center gap-2.5" onClick={closeMenu}>
              <div className="w-8 h-8 rounded-xl bg-zinc-100 flex items-center justify-center">
                <Receipt21 size={16} color="#09090b" variant="Bold" />
              </div>
              <span className="text-sm font-semibold text-zinc-100 tracking-tight">Ledgefice</span>
            </a>
            <button onClick={closeMenu} className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-zinc-800/60 transition-colors" aria-label="Close menu">
              <CloseCircle size={20} color="currentColor" className="text-zinc-400" />
            </button>
          </div>

          {/* Mobile Nav links */}
          <nav className="flex flex-col px-4 pt-6 gap-1 flex-1">
            {NAV_LINKS.map((link, i) => (
              <Link
                key={link.label}
                to={link.to}
                spy={true}
                smooth={true}
                offset={-80}
                duration={500}
                onClick={closeMenu} 
                className="cursor-pointer px-4 py-3.5 rounded-xl text-base text-zinc-300 hover:text-zinc-100 hover:bg-zinc-800/50 transition-all"
                style={{
                  opacity: menuVisible ? 1 : 0,
                  transform: menuVisible ? "translateY(0)" : "translateY(8px)",
                  transition: `opacity 200ms ease ${80 + i * 40}ms, transform 200ms ease ${80 + i * 40}ms`,
                }}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex flex-col gap-3 px-4 pb-10" style={{ opacity: menuVisible ? 1 : 0, transform: menuVisible ? "translateY(0)" : "translateY(8px)", transition: "opacity 200ms ease 280ms, transform 200ms ease 280ms" }}>
            <a href="/login" onClick={closeMenu} className="flex items-center justify-center px-4 py-3 rounded-xl border border-zinc-800 text-zinc-300 text-sm font-medium hover:bg-zinc-800/50 transition-all">Log in</a>
            <a href="/onboarding" onClick={closeMenu} className="flex items-center justify-center px-4 py-3 bg-zinc-100 hover:bg-white text-zinc-950 text-sm font-medium rounded-xl transition-all">Get started</a>
          </div>
        </div>
      )}
    </>
  );
}