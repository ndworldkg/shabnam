import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import { Reveal, Eyebrow } from "@/components/site/Reveal";
import { useSite } from "@/context/SettingsContext";
import { img } from "@/lib/api";

const SPANS = [
  "md:col-span-7 md:row-span-2",
  "md:col-span-5",
  "md:col-span-5",
  "md:col-span-6",
  "md:col-span-6",
];
const spanFor = (i, n) => (i < 5 ? SPANS[i] : n % 2 === 0 || i < n - 1 ? "md:col-span-6" : "md:col-span-12");

export const CategoryBento = () => {
  const { categories } = useSite();
  if (!categories.length) return null;
  return (
    <section id="kategoriler" className="mx-auto max-w-[1400px] px-5 py-24 sm:px-8 md:py-36" data-testid="category-bento">
      <div className="mb-14 grid gap-6 md:grid-cols-12 md:items-end">
        <Reveal className="md:col-span-7">
          <Eyebrow>Ürün Kategorileri</Eyebrow>
          <h2 className="font-display text-4xl font-black uppercase leading-[0.95] tracking-tight text-white sm:text-5xl lg:text-6xl">
            Her sektöre <span className="text-[#FACC15]">bir üniforma.</span>
          </h2>
        </Reveal>
        <Reveal className="md:col-span-5" delay={0.1}>
          <p className="text-base text-slate-300 md:text-lg">Kategorinizi seçin, modelleri inceleyin ve ekibinize özel teklifinizi birkaç adımda alın.</p>
        </Reveal>
      </div>
      <div className="grid auto-rows-[280px] grid-cols-1 gap-4 md:auto-rows-[300px] md:grid-cols-12 md:gap-5">
        {categories.map((c, i) => (
          <Reveal key={c.id} delay={(i % 3) * 0.08} className={`${spanFor(i, categories.length)} h-full`}>
            <Link to={`/urunler?kategori=${c.slug}`} data-testid={`bento-category-${c.slug}`}
              className="group relative block h-full overflow-hidden rounded-[22px] border border-white/10 bg-[#131924]">
              {c.image && <img src={img(c.image)} alt={c.name} className="absolute inset-0 h-full w-full object-cover opacity-70 transition-[transform,opacity] duration-700 group-hover:scale-105 group-hover:opacity-90" />}
              <div className="absolute inset-0 bg-gradient-to-t from-[#0B0F17] via-[#0B0F17]/40 to-transparent" />
              <span className="absolute left-0 top-0 h-1.5 w-full origin-left scale-x-0 transition-transform duration-500 group-hover:scale-x-100" style={{ background: c.accent }} />
              <div className="absolute right-5 top-5 flex h-12 w-12 items-center justify-center rounded-full border border-white/20 bg-black/30 text-white backdrop-blur-md transition-[background-color,transform] duration-500 group-hover:rotate-45" style={{ "--a": c.accent }}>
                <ArrowUpRight className="h-5 w-5" />
              </div>
              <div className="absolute inset-x-0 bottom-0 p-6 md:p-8">
                <p className="font-mono text-xs uppercase tracking-[0.25em]" style={{ color: c.accent }}>{String(i + 1).padStart(2, "0")} — {c.product_count} ürün</p>
                <h3 className={`mt-2 font-display font-black uppercase leading-none tracking-tight text-white ${i === 0 ? "text-4xl md:text-6xl" : "text-3xl md:text-4xl"}`}>{c.name}</h3>
                {c.description && <p className="mt-3 max-w-md text-sm text-slate-300">{c.description}</p>}
              </div>
            </Link>
          </Reveal>
        ))}
      </div>
    </section>
  );
};
