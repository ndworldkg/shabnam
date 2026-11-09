import { Link } from "react-router-dom";
import { Phone, Mail, MapPin, Clock } from "lucide-react";
import { LogoMark } from "@/components/Logo";
import { useSite } from "@/context/SettingsContext";
import { CatalogDownload } from "@/components/site/CatalogDownload";
import { useLang } from "@/i18n/LangContext";

export const Footer = () => {
  const { settings, categories } = useSite();
  const { t, loc } = useLang();
  const year = new Date().getFullYear();
  const info = [
    { icon: Phone, v: settings?.phone, id: "phone" },
    { icon: Mail, v: settings?.email, id: "email" },
    { icon: MapPin, v: loc(settings, "address"), id: "address" },
    { icon: Clock, v: loc(settings, "working_hours"), id: "hours" },
  ].filter((i) => i.v);
  return (
    <footer className="relative overflow-hidden border-t border-white/10 bg-[#07090F] pt-20" data-testid="site-footer">
      <div className="mx-auto grid max-w-[1400px] gap-12 px-5 sm:px-8 md:grid-cols-12">
        <div className="md:col-span-5">
          <LogoMark className="h-14 w-auto" />
          <p className="mt-6 max-w-sm text-slate-400">{loc(settings, "tagline")}</p>
          <CatalogDownload testid="footer-catalog-pdf" className="mt-8" />
        </div>
        <div className="md:col-span-3">
          <p className="mb-4 font-mono text-xs uppercase tracking-[0.25em] text-[#FACC15]">{t.footer.categories}</p>
          <ul className="space-y-2">
            {categories.slice(0, 6).map((c) => (
              <li key={c.id}><Link to={`/urunler?kategori=${c.slug}`} className="text-slate-300 transition-colors hover:text-white" data-testid={`footer-cat-${c.slug}`}>{loc(c, "name")}</Link></li>
            ))}
          </ul>
        </div>
        <div className="md:col-span-4">
          <p className="mb-4 font-mono text-xs uppercase tracking-[0.25em] text-[#FACC15]">{t.footer.contact}</p>
          <ul className="space-y-3">
            {info.map(({ icon: I, v, id }) => (
              <li key={id} className="flex gap-3 text-slate-300" data-testid={`footer-${id}`}><I className="mt-0.5 h-4 w-4 shrink-0 text-[#F7B267]" />{v}</li>
            ))}
          </ul>
        </div>
      </div>
      <p className="pointer-events-none mt-16 select-none whitespace-nowrap px-3 font-display text-[18vw] font-black uppercase leading-[0.8] tracking-tighter text-white/[0.05]">
        {settings?.company_name || "Shabnam Elegant"}
      </p>
      <div className="mx-auto flex max-w-[1400px] flex-col justify-between gap-3 border-t border-white/10 px-5 py-6 text-xs text-slate-400 sm:flex-row sm:px-8">
        <span>© {year} {settings?.company_name}. {t.footer.rights}</span>
        <Link to="/admin" className="hover:text-white" data-testid="footer-admin-link">{t.footer.admin}</Link>
      </div>
    </footer>
  );
};
