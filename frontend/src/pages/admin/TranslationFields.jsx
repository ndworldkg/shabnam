import { useState } from "react";
import { Languages } from "lucide-react";
import { AField, aInput } from "@/pages/admin/ui";
import { useAdminLang } from "@/pages/admin/adminI18n";

const show = (f, v) => (Array.isArray(v) ? v.join(f.type === "lines" ? "\n" : ", ") : v || "");
const parse = (f, raw) => (f.type === "lines" ? raw.split("\n") : f.type === "csv" ? raw.split(",") : raw);
const getVal = (cur, f) => (f.sub ? cur[f.k]?.[f.sub] : cur[f.k]);
const setVal = (cur, f, v) => (f.sub ? { ...cur, [f.k]: { ...(cur[f.k] || {}), [f.sub]: v } } : { ...cur, [f.k]: v });

export const cleanI18n = (i18n = {}) =>
  Object.fromEntries(Object.entries(i18n).map(([l, obj]) => [l, Object.fromEntries(Object.entries(obj || {})
    .map(([k, v]) => [k, Array.isArray(v) ? v.map((x) => x.trim()).filter(Boolean) : v]))]));

export const TranslationFields = ({ value = {}, onChange, fields, testid = "i18n" }) => {
  const { t } = useAdminLang();
  const [lang, setLang] = useState("ru");
  const cur = value?.[lang] || {};
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4 sm:col-span-2" data-testid={`${testid}-fields`}>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <p className="flex items-center gap-2 text-sm font-semibold"><Languages className="h-4 w-4 text-[#FACC15]" /> {t.i18n.title}</p>
        <div className="flex rounded-full border border-white/15 p-1">
          {["ru", "uz"].map((code) => (
            <button type="button" key={code} onClick={() => setLang(code)} data-testid={`${testid}-tab-${code}`}
              className={`rounded-full px-3 py-1 text-xs font-bold ${lang === code ? "bg-[#FACC15] text-[#0B0F17]" : "text-slate-300"}`}>{t.i18n[code]}</button>
          ))}
        </div>
      </div>
      <p className="mb-4 text-xs text-slate-400">{t.i18n.note}</p>
      <div className="grid gap-3 sm:grid-cols-2">
        {fields.map((f) => {
          const tid = `${testid}-${lang}-${f.k}${f.sub ? `-${f.sub}` : ""}`;
          const onEdit = (e) => onChange({ ...value, [lang]: setVal(cur, f, parse(f, e.target.value)) });
          return (
            <AField key={`${lang}-${f.k}-${f.sub || ""}`} label={f.label} className={f.type === "text" ? "" : "sm:col-span-2"}>
              {f.type === "text" || f.type === "csv"
                ? <input className={aInput} value={show(f, getVal(cur, f))} placeholder={t.i18n.ph} data-testid={tid} onChange={onEdit} />
                : <textarea rows={3} className={aInput} value={show(f, getVal(cur, f))} placeholder={t.i18n.ph} data-testid={tid} onChange={onEdit} />}
            </AField>
          );
        })}
      </div>
    </div>
  );
};
