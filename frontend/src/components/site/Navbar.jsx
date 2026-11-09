import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X, ArrowUpRight } from "lucide-react";
import { Logo } from "@/components/Logo";
import { useSite } from "@/context/SettingsContext";
import { useLang } from "@/i18n/LangContext";
import { LangSwitch } from "@/components/site/LangSwitch";

const LINKS = [
  { to: "/", id: "home" },
  { to: "/urunler", id: "products" },
  { to: "/teklif", id: "quote" },
  { to: "/iletisim", id: "contact" },
];

export const Navbar = () => {
  const [open, setOpen] = useState(false);
  const { settings } = useSite();
  const { t } = useLang();
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-[#0B0F17]/80 backdrop-blur-xl" data-testid="site-navbar">
      <div className="mx-auto flex h-[72px] max-w-[1400px] items-center justify-between px-5 sm:px-8">
        <Link to="/" data-testid="nav-logo-link"><Logo name={settings?.company_name || "Shabnam Elegant"} /></Link>
        <nav className="hidden items-center gap-1 md:flex">
          {LINKS.slice(0, 4).map((l) => (
            <NavLink key={l.to} to={l.to} end data-testid={`nav-link-${l.id}`}
              className={({ isActive }) => `rounded-full px-4 py-2 text-sm font-medium transition-colors duration-300 ${isActive ? "bg-white/10 text-white" : "text-slate-300 hover:text-white"}`}>
              {t.nav[l.id]}
            </NavLink>
          ))}
        </nav>
        <div className="hidden items-center gap-3 md:flex">
        <LangSwitch />
        <Link to="/teklif" data-testid="nav-quote-cta"
          className="group flex items-center gap-2 rounded-full bg-[#FF5722] px-5 py-2.5 text-sm font-semibold text-white transition-[background-color,transform] duration-300 hover:-translate-y-0.5 hover:bg-[#ff6a3d]">
          {t.nav.quick} <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:rotate-45" />
        </Link>
        </div>
        <div className="flex items-center gap-2 md:hidden">
        <LangSwitch id="mobile" />
        <button className="rounded-full border border-white/15 p-2.5 text-white md:hidden" onClick={() => setOpen(!open)} data-testid="nav-mobile-toggle" aria-label="Menü">
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
        </div>
      </div>
      <AnimatePresence>
        {open && (
          <motion.nav initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-white/10 bg-[#0B0F17] md:hidden" data-testid="nav-mobile-menu">
            {LINKS.map((l) => (
              <Link key={l.to} to={l.to} onClick={() => setOpen(false)} data-testid={`nav-mobile-link-${l.id}`}
                className="block border-b border-white/5 px-6 py-5 font-display text-2xl font-bold uppercase text-white">
                {t.nav[l.id]}
              </Link>
            ))}
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
};
