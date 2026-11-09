import { motion } from "framer-motion";
import { EASE } from "@/lib/api";

export const PageHeader = ({ eyebrow, lines, children }) => (
  <section className="relative overflow-hidden border-b border-white/10 pt-[72px]">
    <div className="hero-grid absolute inset-0 opacity-50" />
    <div className="relative mx-auto max-w-[1400px] px-5 pb-14 pt-16 sm:px-8 md:pb-20 md:pt-24">
      <p className="mb-6 font-mono text-xs uppercase tracking-[0.25em] text-[#F7B267]">{eyebrow}</p>
      <h1 className="font-display text-[clamp(2.8rem,8vw,7rem)] font-black uppercase leading-[0.88] tracking-[-0.03em] text-white">
        {lines.map((l, i) => (
          <span key={l} className="block overflow-hidden pb-[0.04em]">
            <motion.span className={`block ${i === lines.length - 1 ? "text-[#F2962B]" : ""}`} initial={{ y: "105%" }} animate={{ y: "0%" }}
              transition={{ delay: 0.1 + i * 0.12, duration: 1, ease: EASE }}>{l}</motion.span>
          </span>
        ))}
      </h1>
      {children}
    </div>
  </section>
);
