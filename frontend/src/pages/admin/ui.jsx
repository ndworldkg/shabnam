import { adminLang } from "@/pages/admin/adminI18n";

export const aInput = "w-full rounded-lg border border-white/15 bg-white/[0.04] px-3.5 py-2.5 text-sm text-white placeholder:text-slate-500 outline-none focus:border-[#F2962B]";

export const AField = ({ label, children, className = "" }) => (
  <label className={`block ${className}`}>
    <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-300">{label}</span>
    {children}
  </label>
);

export const AdminTitle = ({ title, sub, action }) => (
  <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
    <div>
      <h1 className="font-display text-3xl font-black uppercase text-white md:text-4xl">{title}</h1>
      {sub && <p className="mt-2 text-slate-400">{sub}</p>}
    </div>
    {action}
  </div>
);

export const PrimaryBtn = ({ children, className = "", ...p }) => (
  <button {...p} className={`inline-flex items-center justify-center gap-2 rounded-full bg-[#F2962B] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#F5A94E] disabled:opacity-60 ${className}`}>{children}</button>
);

export const toList = (s) => s.split(/[\n,]/).map((x) => x.trim()).filter(Boolean);
export const fmtDate = (s) => (s ? new Date(s).toLocaleString(adminLang() === "ru" ? "ru-RU" : "tr-TR", { dateStyle: "medium", timeStyle: "short" }) : "");
