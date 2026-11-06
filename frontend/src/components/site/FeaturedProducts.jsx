import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { api, asList } from "@/lib/api";
import { Reveal, Eyebrow } from "@/components/site/Reveal";
import { ProductCard } from "@/components/site/ProductCard";

export const FeaturedProducts = () => {
  const [items, setItems] = useState([]);
  useEffect(() => {
    api.get("/products", { params: { featured: true } }).then((r) => setItems(asList(r.data))).catch(() => setItems([]));
  }, []);
  if (!items.length) return null;
  return (
    <section className="bg-[#0E131D] py-24 md:py-36" data-testid="featured-products">
      <div className="mx-auto max-w-[1400px] px-5 sm:px-8">
        <div className="mb-14 flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <Reveal>
            <Eyebrow color="#60A5FA">Öne Çıkanlar</Eyebrow>
            <h2 className="font-display text-4xl font-black uppercase leading-[0.95] tracking-tight text-white sm:text-5xl lg:text-6xl">
              Öne çıkan<br />modeller.
            </h2>
          </Reveal>
          <Reveal delay={0.1}>
            <Link to="/urunler" data-testid="featured-all-link" className="group inline-flex items-center gap-3 font-semibold text-white">
              <span className="border-b border-white/30 pb-1 transition-colors group-hover:border-[#FF5722]">Tüm ürünler</span>
              <ArrowRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </Reveal>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {items.slice(0, 8).map((p, i) => (
            <Reveal key={p.id} delay={(i % 4) * 0.08} className={i % 2 ? "lg:mt-16" : ""}>
              <ProductCard p={p} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
};
