export const inputCls =
  "w-full rounded-xl border border-white/15 bg-white/[0.04] px-4 py-3.5 text-white placeholder:text-slate-500 outline-none transition-[border-color,background-color] duration-300 focus:border-[#F2962B] focus:bg-white/[0.07]";

export const Field = ({ label, children, className = "" }) => (
  <label className={`block ${className}`}>
    <span className="mb-2 block font-mono text-[11px] uppercase tracking-[0.2em] text-slate-300">{label}</span>
    {children}
  </label>
);
