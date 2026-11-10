import { MapPin, ArrowUpRight } from "lucide-react";
import { useSite } from "@/context/SettingsContext";
import { useLang } from "@/i18n/LangContext";

const queryOf = (v) => {
  if (!/^https?:\/\//i.test(v)) return v;
  const at = v.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
  if (at) return `${at[1]},${at[2]}`;
  try {
    const u = new URL(v);
    return u.searchParams.get("q") || u.searchParams.get("query") || "";
  } catch (e) {
    return "";
  }
};

export const MapEmbed = () => {
  const { settings } = useSite();
  const { t } = useLang();
  const raw = (settings?.map_location || "").trim();
  const q = queryOf(raw) || (settings?.address || "").split("\n")[0];
  if (!q) return null;
  const open = /^https?:\/\//i.test(raw) ? raw : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`;
  return (
    <section className="mx-auto max-w-[1400px] px-5 pb-20 sm:px-8 md:pb-28" data-testid="contact-map-section">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <p className="flex items-center gap-3 font-mono text-xs uppercase tracking-[0.25em] text-[#FACC15]"><MapPin className="h-4 w-4" /> {t.contactPage.map}</p>
        <a href={open} target="_blank" rel="noreferrer" data-testid="contact-map-open-link"
          className="group inline-flex items-center gap-2 rounded-full border border-white/15 px-5 py-2.5 text-sm text-white transition-colors duration-300 hover:border-[#F2962B] hover:bg-[#F2962B]">
          {t.contactPage.openMap} <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:rotate-45" />
        </a>
      </div>
      <div className="overflow-hidden rounded-[24px] border border-white/10 bg-[#131924]">
        <iframe title={t.contactPage.map} src={`https://maps.google.com/maps?q=${encodeURIComponent(q)}&z=16&output=embed`} loading="lazy"
          referrerPolicy="no-referrer-when-downgrade" className="block h-[320px] w-full grayscale-[0.4] md:h-[460px]" data-testid="contact-map-iframe" />
      </div>
    </section>
  );
};
