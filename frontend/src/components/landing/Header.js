import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useLead } from "@/lib/leadContext";
import { BRAND } from "@/lib/data";
import { Phone, Menu, X } from "lucide-react";

export default function Header() {
  const { openLead } = useLead();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const navItems = [
    { label: "Кейсы", href: "#cases" },
    { label: "Процесс", href: "#process" },
    { label: "Контакты", href: "#contacts" },
  ];

  return (
    <motion.header
      initial={{ y: -30, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? "bg-[#050505]/85 backdrop-blur-xl"
          : "bg-transparent"
      }`}
      data-testid="site-header"
    >
      <div className="max-w-[1400px] mx-auto px-6 md:px-10 h-[72px] flex items-center justify-between">
        <a href="#top" className="flex items-center gap-3" data-testid="logo-link">
          <img src="/logo.svg" alt="Detail Inspector" className="h-9 md:h-10 w-auto" />
        </a>

        <nav className="hidden md:flex items-center gap-10" aria-label="Главное меню">
          {navItems.map((n) => (
            <a
              key={n.href}
              href={n.href}
              data-testid={`nav-${n.label}`}
              className="text-xs uppercase tracking-[0.18em] text-white/80 hover:text-white transition-colors"
            >
              {n.label}
            </a>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-6">
          <a
            href={`tel:${BRAND.phoneRaw}`}
            data-testid="header-phone"
            className="text-xs text-white/80 hover:text-white tracking-[0.04em] font-mono"
          >
            {BRAND.phone}
          </a>
          <button
            onClick={() => openLead({ source: "header" })}
            data-testid="header-cta-btn"
            className="btn-primary px-6 py-3 uppercase tracking-[0.18em] text-[11px] font-medium"
          >
            <span>Получить расчёт</span>
          </button>
        </div>

        <button
          className="md:hidden text-white"
          onClick={() => setMenuOpen((v) => !v)}
          data-testid="mobile-menu-toggle"
          aria-label="Меню"
        >
          {menuOpen ? <X className="size-6" /> : <Menu className="size-6" />}
        </button>
      </div>

      {menuOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="md:hidden bg-[#050505]/95 backdrop-blur-xl border-t border-white/10 px-6 py-8"
        >
          <div className="flex flex-col gap-6">
            {navItems.map((n) => (
              <a
                key={n.href}
                href={n.href}
                onClick={() => setMenuOpen(false)}
                className="text-base text-white uppercase tracking-[0.18em]"
              >
                {n.label}
              </a>
            ))}
            <a href={`tel:${BRAND.phoneRaw}`} className="text-sm text-white/80 font-mono inline-flex items-center gap-2">
              <Phone className="size-4" /> {BRAND.phone}
            </a>
            <button
              onClick={() => { setMenuOpen(false); openLead({ source: "mobile-menu" }); }}
              className="btn-primary w-full py-4 uppercase tracking-[0.18em] text-[11px] font-medium mt-2"
            >
              <span>Получить расчёт</span>
            </button>
          </div>
        </motion.div>
      )}
    </motion.header>
  );
}
