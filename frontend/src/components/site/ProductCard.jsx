import { Link } from "react-router-dom";
import { ArrowUpRight, ImageOff } from "lucide-react";
import { img } from "@/lib/api";

export const ProductCard = ({ p }) => {
  const accent = p?.category?.accent || "#FF5722";
  const onMove = (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty("--x", `${e.clientX - r.left}px`);
    e.currentTarget.style.setProperty("--y", `${e.clientY - r.top}px`);
  };
  return (
    <Link to={`/urunler/${p.id}`} onMouseMove={onMove} data-testid={`product-card-${p.id}`}
      className="spotlight group relative block rounded-[22px] border border-white/10 bg-[#131924] p-3 transition-[border-color,transform] duration-500 hover:-translate-y-1 hover:border-white/25">
      <div className="clip-frame-sm relative aspect-[4/5] overflow-hidden bg-[#0B0F17]">
        {p.images?.[0] ? (
          <img src={img(p.images[0])} alt={p.name} loading="lazy" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
        ) : (
          <div className="flex h-full items-center justify-center text-slate-500"><ImageOff className="h-10 w-10" /></div>
        )}
        <span className="absolute left-3 top-3 rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-[#0B0F17]" style={{ background: accent }}>
          {p.category?.name || "Ürün"}
        </span>
      </div>
      <div className="flex items-start justify-between gap-4 px-2 pb-2 pt-5">
        <div>
          {p.code && <p className="font-mono text-xs uppercase tracking-[0.2em] text-slate-400">{p.code}</p>}
          <h3 className="mt-1 font-display text-xl font-bold leading-tight text-white">{p.name}</h3>
        </div>
        <span className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/15 text-white transition-[background-color,transform] duration-500 group-hover:rotate-45 group-hover:bg-[#FF5722]">
          <ArrowUpRight className="h-4 w-4" />
        </span>
      </div>
    </Link>
  );
};
