import { useState } from "react";
import { Languages } from "lucide-react";
import { AField, aInput } from "@/pages/admin/ui";

const TABS = [{ code: "ru", label: "Rusça" }, { code: "uz", label: "Özbekçe" }];

const show = (f, v) => (Array.isArray(v) ? v.join(f.type === "lines" ? "\n" : ", ") : v || "");
const parse = (f, raw) => (f.type === "lines" ? raw.split("\n") : f.type === "csv" ? raw.split(",") : raw);

export const cleanI18n = (i18n = {}) =>
  Object.fromEntries(Object.entries(i18n).map(([l, obj]) => [l, Object.fromEntries(Object.entries(obj || {})
    .map(([k, v]) => [k, Array.isArray(v) ? v.map((x) => x.trim()).filter(Boolean) : v]))]));

export const TranslationFields = ({ value = {}, onChange, fields, testid = "i18n" }) => {
  const [lang, setLang] = useState("ru");
  const cur = value?.[lang] || {};
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4 sm:col-span-2" data-testid={`${testid}-fields`}>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <p className="flex items-center gap-2 text-sm font-semibold"><Languages className="h-4 w-4 text-[#FACC15]" /> Çeviriler</p>
        <div className="flex rounded-full border border-white/15 p-1">
          {TABS.map((t) => (
            <button type="button" key={t.code} onClick={() => setLang(t.code)} data-testid={`${testid}-tab-${t.code}`}
              className={`rounded-full px-3 py-1 text-xs font-bold ${lang === t.code ? "bg-[#FACC15] text-[#0B0F17]" : "text-slate-300"}`}>{t.label}</button>
          ))}
        </div>
      </div>
      <p className="mb-4 text-xs text-slate-400">Boş bırakılan alanlar kaydederken yapay zeka ile otomatik çevrilir. Türkçe metni değiştirirseniz, elle düzeltmediğiniz çeviriler yenilenir.</p>
      <div className="grid gap-3 sm:grid-cols-2">
        {fields.map((f) => (
          <AField key={`${lang}-${f.k}`} label={f.label} className={f.type === "text" ? "" : "sm:col-span-2"}>
            {f.type === "text" || f.type === "csv"
              ? <input className={aInput} value={show(f, cur[f.k])} placeholder="Otomatik çevrilecek" data-testid={`${testid}-${lang}-${f.k}`}
                  onChange={(e) => onChange({ ...value, [lang]: { ...cur, [f.k]: parse(f, e.target.value) } })} />
              : <textarea rows={3} className={aInput} value={show(f, cur[f.k])} placeholder="Otomatik çevrilecek" data-testid={`${testid}-${lang}-${f.k}`}
                  onChange={(e) => onChange({ ...value, [lang]: { ...cur, [f.k]: parse(f, e.target.value) } })} />}
          </AField>
        ))}
      </div>
    </div>
  );
};
