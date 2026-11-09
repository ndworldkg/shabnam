import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowDown, CheckCircle2, ImageOff } from "lucide-react";
import { api, asList, img, EASE } from "@/lib/api";
import { Reveal, Eyebrow } from "@/components/site/Reveal";
import { QuoteForm } from "@/components/site/QuoteForm";
import { ProductCard } from "@/components/site/ProductCard";
import { useLang } from "@/i18n/LangContext";
import { Price } from "@/components/site/Price";

const Gallery = ({ images, name }) => {
  const [i, setI] = useState(0);
  const list = Array.isArray(images) ? images : [];
  return (
    <div>
      <div className="clip-frame relative aspect-[4/5] overflow-hidden bg-[#131924]" data-testid="product-main-image">
        {list[i] ? (
          <motion.img key={list[i]} initial={{ opacity: 0, scale: 1.06 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8, ease: EASE }}
            src={img(list[i])} alt={name} className="h-full w-full object-cover" />
        ) : <div className="flex h-full items-center justify-center text-slate-500"><ImageOff className="h-12 w-12" /></div>}
      </div>
      {list.length > 1 && (
        <div className="mt-4 flex gap-3 overflow-x-auto">
          {list.map((u, k) => (
            <button key={u} onClick={() => setI(k)} data-testid={`product-thumb-${k}`}
              className={`h-20 w-16 shrink-0 overflow-hidden rounded-lg border-2 transition-colors ${k === i ? "border-[#F2962B]" : "border-transparent opacity-60 hover:opacity-100"}`}>
              <img src={img(u)} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const Spec = ({ k, v }) => (v ? (
  <div className="grid grid-cols-[120px,1fr] gap-4 border-t border-white/10 py-4 text-sm">
    <span className="font-mono uppercase tracking-[0.15em] text-slate-400">{k}</span>
    <span className="text-white">{v}</span>
  </div>
) : null);

export default function ProductDetail() {
  const { id } = useParams();
  const [p, setP] = useState(null);
  const [missing, setMissing] = useState(false);
  const [related, setRelated] = useState([]);
  const formRef = useRef(null);
  const { t, loc } = useLang();
  const D = t.detail;

  useEffect(() => {
    setP(null);
    setMissing(false);
    api.get(`/products/${id}`).then((r) => {
      setP(r.data);
      return api.get("/products", { params: { category: r.data?.category_id } });
    }).then((r) => setRelated(asList(r?.data).filter((x) => x.id !== id).slice(0, 4))).catch(() => setMissing(true));
  }, [id]);

  if (missing) return <main className="flex min-h-screen flex-col items-center justify-center gap-6 pt-20 text-white" data-testid="product-not-found"><p className="text-xl">{D.notFound}</p><Link to="/urunler" className="text-[#F7B267] underline">{D.back}</Link></main>;
  if (!p) return <main className="min-h-screen pt-40 text-center text-slate-400">{D.loading}</main>;
  const name = loc(p, "name");
  const accent = p.category?.accent || "#F2962B";

  return (
    <main className="pt-[72px]" data-testid="product-detail-page">
      <section className="mx-auto max-w-[1400px] px-5 py-12 sm:px-8 md:py-16">
        <Link to="/urunler" className="mb-10 inline-flex items-center gap-2 text-sm text-slate-300 hover:text-white" data-testid="product-back-link"><ArrowLeft className="h-4 w-4" /> {D.back}</Link>
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="min-w-0 lg:col-span-6"><Gallery images={p.images} name={name} /></div>
          <div className="min-w-0 lg:col-span-6">
            <Link to={`/urunler?kategori=${p.category?.slug}`} className="inline-block rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-[#0B0F17]" style={{ background: accent }} data-testid="product-category-tag">{loc(p.category, "name")}</Link>
            <h1 className="mt-6 hyphens-auto break-words font-display text-3xl font-black uppercase leading-[0.95] tracking-tight text-white sm:text-5xl lg:text-6xl" data-testid="product-name">{name}</h1>
            {p.code && <p className="mt-4 font-mono text-sm uppercase tracking-[0.25em] text-slate-400" data-testid="product-code">{D.code}: {p.code}</p>}
            <Price p={p} testid="product-detail-price" className="mt-6 inline-block rounded-2xl border border-[#FACC15]/40 bg-[#FACC15]/10 px-5 py-3 font-display text-2xl font-black text-[#FACC15]" />
            {p.summary && <p className="mt-6 text-lg text-slate-200">{loc(p, "summary")}</p>}
            {p.description && <p className="mt-4 whitespace-pre-line text-slate-300">{loc(p, "description")}</p>}
            <div className="mt-8">
              <Spec k={D.fabric} v={loc(p, "fabric")} />
              <Spec k={D.weight} v={loc(p, "weight")} />
              <Spec k={D.sizes} v={(p.sizes || []).join(" · ")} />
              <Spec k={D.colors} v={(loc(p, "colors") || []).join(" · ")} />
            </div>
            {!!p.features?.length && (
              <ul className="mt-6 grid gap-3 sm:grid-cols-2" data-testid="product-features">
                {(loc(p, "features") || []).map((f) => <li key={f} className="flex gap-3 text-slate-200"><CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" style={{ color: accent }} />{f}</li>)}
              </ul>
            )}
            <button onClick={() => formRef.current?.scrollIntoView({ behavior: "smooth" })} data-testid="product-quote-btn"
              className="group mt-10 inline-flex items-center gap-3 rounded-full bg-[#F2962B] px-8 py-4 font-semibold text-white transition-[background-color,transform] duration-300 hover:-translate-y-1 hover:bg-[#F5A94E]">
              {D.quoteBtn} <ArrowDown className="h-5 w-5 transition-transform group-hover:translate-y-1" />
            </button>
          </div>
        </div>
      </section>
      <section ref={formRef} className="border-t border-white/10 bg-[#0E131D] py-20 md:py-28">
        <div className="mx-auto grid max-w-[1400px] gap-12 px-5 sm:px-8 lg:grid-cols-12">
          <Reveal className="min-w-0 lg:col-span-4">
            <Eyebrow>{D.formEyebrow}</Eyebrow>
            <h2 className="hyphens-auto break-words font-display text-3xl font-black uppercase leading-[0.95] text-white sm:text-5xl">{D.formTitle}{name}</h2>
          </Reveal>
          <Reveal className="min-w-0 lg:col-span-8" delay={0.1}><QuoteForm defaultProductId={p.id} /></Reveal>
        </div>
      </section>
      {!!related.length && (
        <section className="mx-auto max-w-[1400px] px-5 py-20 sm:px-8 md:py-28">
          <h2 className="mb-10 font-display text-3xl font-black uppercase text-white sm:text-4xl">{D.related}</h2>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">{related.map((r) => <ProductCard key={r.id} p={r} />)}</div>
        </section>
      )}
    </main>
  );
}
