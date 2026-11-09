import { useSite } from "@/context/SettingsContext";
import { useLang } from "@/i18n/LangContext";

export const Marquee = () => {
  const { categories } = useSite();
  const { t, loc } = useLang();
  const words = categories.length ? categories.map((c) => loc(c, "name")) : t.marquee;
  const row = [...words, ...words];
  return (
    <section className="relative overflow-hidden border-y border-white/10 bg-[#FF5722] py-6 md:py-8" data-testid="editorial-marquee">
      <div className="marquee-track flex w-max">
        {[0, 1].map((k) => (
          <div key={k} className="flex shrink-0 items-center" aria-hidden={k === 1}>
            {row.map((w, i) => (
              <span key={`${k}-${i}`} className="flex items-center font-display text-4xl font-black uppercase tracking-tight text-[#0B0F17] md:text-7xl">
                <span className={i % 2 ? "text-outline-dark" : ""}>{w}</span>
                <span className="mx-8 inline-block h-4 w-12 -skew-x-12 bg-[#FACC15] md:mx-12 md:h-6 md:w-20" />
              </span>
            ))}
          </div>
        ))}
      </div>
    </section>
  );
};
