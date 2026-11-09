import { useRef } from "react";
import { Link } from "react-router-dom";
import { motion, useMotionValue, useScroll, useSpring, useTransform } from "framer-motion";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { EASE } from "@/lib/api";
import { useSite } from "@/context/SettingsContext";
import { useLang } from "@/i18n/LangContext";

const LINE_CLS = ["text-white", "text-[#F2962B]", "text-outline"];
const HERO_IMG = "https://images.unsplash.com/photo-1652303518379-c0ef1c9fb2b1?crop=entropy&cs=srgb&fm=jpg&q=85&w=1400";

const Tilt = ({ children }) => {
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const rx = useSpring(useTransform(my, [-0.5, 0.5], [8, -8]), { stiffness: 120, damping: 18 });
  const ry = useSpring(useTransform(mx, [-0.5, 0.5], [-10, 10]), { stiffness: 120, damping: 18 });
  const onMove = (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    mx.set((e.clientX - r.left) / r.width - 0.5);
    my.set((e.clientY - r.top) / r.height - 0.5);
  };
  return (
    <div style={{ perspective: 1200 }} onMouseMove={onMove} onMouseLeave={() => { mx.set(0); my.set(0); }}>
      <motion.div style={{ rotateX: rx, rotateY: ry, transformStyle: "preserve-3d" }}>{children}</motion.div>
    </div>
  );
};

export const Hero = () => {
  const ref = useRef(null);
  const { categories } = useSite();
  const { t: tr, lang } = useLang();
  const h = tr.hero;
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const imgY = useTransform(scrollYProgress, [0, 1], ["0%", "18%"]);
  const textY = useTransform(scrollYProgress, [0, 1], ["0%", "-12%"]);

  return (
    <section ref={ref} className="relative overflow-hidden pt-[72px]" data-testid="hero-section">
      <div className="hero-grid absolute inset-0 opacity-60" />
      <div className="relative mx-auto grid max-w-[1400px] items-center gap-10 px-5 pb-16 pt-10 sm:px-8 lg:min-h-[calc(100vh-72px)] lg:grid-cols-12 lg:pb-10">
        <motion.div style={{ y: textY }} className="lg:col-span-7">
          <motion.p initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, ease: EASE }}
            className="mb-6 inline-flex items-center gap-3 rounded-full border border-white/15 bg-white/5 px-4 py-2 font-mono text-[11px] uppercase tracking-[0.25em] text-slate-200">
            <span className="h-2 w-2 animate-pulse rounded-full bg-[#FACC15]" /> {h.badge}
          </motion.p>
          <h1 className="font-display text-[clamp(3.9rem,11.5vw,10.5rem)] font-black uppercase leading-[0.86] tracking-[-0.04em]" data-testid="hero-title">
            {h.lines.map((l, i) => (
              <span key={`${lang}-${l}`} className="block overflow-hidden pb-[0.04em]">
                <motion.span className={`block ${LINE_CLS[i]}`} initial={{ y: "105%" }} animate={{ y: "0%" }}
                  transition={{ delay: 0.2 + i * 0.14, duration: 1.15, ease: EASE }}>{l}</motion.span>
              </span>
            ))}
          </h1>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.85, duration: 0.9, ease: EASE }}
            className="mt-10 flex max-w-xl flex-col gap-8">
            <p className="text-base text-slate-300 md:text-lg">{h.sub}</p>
            <div className="flex flex-wrap gap-3">
              <Link to="/urunler" data-testid="hero-catalog-btn"
                className="group inline-flex items-center gap-3 rounded-full bg-[#F2962B] px-7 py-4 font-semibold text-white transition-[background-color,transform] duration-300 hover:-translate-y-1 hover:bg-[#F5A94E]">
                {h.catalog} <ArrowDownRight className="h-5 w-5 transition-transform duration-300 group-hover:-rotate-45" />
              </Link>
              <Link to="/teklif" data-testid="hero-quote-btn"
                className="group inline-flex items-center gap-3 rounded-full border border-white/20 px-7 py-4 font-semibold text-white transition-colors duration-300 hover:border-[#FACC15] hover:text-[#FACC15]">
                {h.quote} <ArrowUpRight className="h-5 w-5" />
              </Link>
            </div>
          </motion.div>
        </motion.div>

        <motion.div className="relative lg:col-span-5" initial={{ opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4, duration: 1.3, ease: EASE }}>
          <Tilt>
            <div className="clip-frame relative h-[440px] overflow-hidden bg-[#131924] sm:h-[560px] lg:h-[640px]">
              <motion.img style={{ y: imgY, scale: 1.18 }} src={HERO_IMG} alt={h.alt}
                className="h-full w-full object-cover" data-testid="hero-image" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0B0F17]/90 via-transparent to-transparent" />
              <div className="tape-shine absolute bottom-24 left-0 right-0 h-5 bg-[#FACC15]/90" />
              <div className="absolute bottom-[70px] left-0 right-0 h-1.5 bg-[#FACC15]/60" />
            </div>
            <div style={{ transform: "translateZ(60px)" }}
              className="absolute -left-3 bottom-8 rounded-2xl border border-white/15 bg-[#0B0F17]/85 p-5 backdrop-blur-xl sm:-left-10">
              <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-[#FACC15]">{h.collection}</p>
              <p className="mt-1 font-display text-3xl font-black text-white" data-testid="hero-category-count">{categories.length || "—"} <span className="text-base font-semibold text-slate-300">{h.categories}</span></p>
            </div>
          </Tilt>
        </motion.div>
      </div>
    </section>
  );
};
