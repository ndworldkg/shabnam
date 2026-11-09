import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Search } from "lucide-react";
import { api, asList } from "@/lib/api";
import { useSite } from "@/context/SettingsContext";
import { PageHeader } from "@/components/site/PageHeader";
import { ProductCard } from "@/components/site/ProductCard";
import { CatalogDownload } from "@/components/site/CatalogDownload";
import { useLang } from "@/i18n/LangContext";

export default function Catalog() {
  const { categories } = useSite();
  const { t, loc, lang } = useLang();
  const C = t.catalog;
  const [params, setParams] = useSearchParams();
  const active = params.get("kategori") || "";
  const [q, setQ] = useState("");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const t = setTimeout(() => {
      api.get("/products", { params: { category: active || undefined, q: q || undefined } })
        .then((r) => setItems(asList(r.data))).catch(() => setItems([])).finally(() => setLoading(false));
    }, 250);
    return () => clearTimeout(t);
  }, [active, q]);

  const pill = (on) => `whitespace-nowrap rounded-full border px-5 py-2.5 text-sm font-semibold transition-colors duration-300 ${on ? "border-[#FF5722] bg-[#FF5722] text-white" : "border-white/15 text-slate-300 hover:border-white/40 hover:text-white"}`;

  return (
    <main data-testid="catalog-page">
      <PageHeader key={lang} eyebrow={C.eyebrow} lines={C.lines}>
        <div className="mt-10"><CatalogDownload /></div>
      </PageHeader>
      <div className="sticky top-[72px] z-30 border-b border-white/10 bg-[#0B0F17]/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1400px] flex-col gap-4 px-5 py-4 sm:px-8 lg:flex-row lg:items-center lg:justify-between">
          <div className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1">
            <button className={pill(!active)} onClick={() => setParams({})} data-testid="filter-all">{C.all}</button>
            {categories.map((c) => (
              <button key={c.id} className={pill(active === c.slug)} onClick={() => setParams({ kategori: c.slug })} data-testid={`filter-${c.slug}`}>{loc(c, "name")}</button>
            ))}
          </div>
          <div className="relative lg:w-80">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={C.search}
              className="w-full rounded-full border border-white/15 bg-white/5 py-3 pl-11 pr-4 text-white placeholder:text-slate-400 outline-none focus:border-[#FF5722]" data-testid="catalog-search-input" />
          </div>
        </div>
      </div>
      <section className="mx-auto min-h-[50vh] max-w-[1400px] px-5 py-14 sm:px-8 md:py-20">
        <p className="mb-8 font-mono text-xs uppercase tracking-[0.2em] text-slate-400" data-testid="catalog-count">{loading ? C.loading : `${items.length} ${C.count}`}</p>
        {!loading && !items.length && <p className="py-20 text-center text-lg text-slate-300" data-testid="catalog-empty">{C.empty}</p>}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {items.map((p, i) => (
            <motion.div key={p.id} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(i, 8) * 0.05, duration: 0.6 }}>
              <ProductCard p={p} />
            </motion.div>
          ))}
        </div>
      </section>
    </main>
  );
}
