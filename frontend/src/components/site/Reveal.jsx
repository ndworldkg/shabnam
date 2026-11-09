import { motion } from "framer-motion";
import { EASE } from "@/lib/api";

export const Reveal = ({ children, delay = 0, y = 36, className = "" }) => (
  <motion.div
    className={className}
    initial={{ opacity: 0, y }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, amount: 0.15 }}
    transition={{ duration: 0.9, ease: EASE, delay }}
  >
    {children}
  </motion.div>
);

export const Eyebrow = ({ children, color = "#F7B267" }) => (
  <p className="mb-5 flex items-center gap-3 font-mono text-xs font-semibold uppercase tracking-[0.25em]" style={{ color }}>
    <span className="h-px w-8" style={{ background: color }} />
    {children}
  </p>
);
