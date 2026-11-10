import { Plus, X } from "lucide-react";
import { SPEC_PRESETS, makeKey } from "@/pages/admin/specPresets";
import { aInput } from "@/pages/admin/ui";
import { useAdminLang } from "@/pages/admin/adminI18n";

export const SpecFieldsEditor = ({ fields = [], sizes = "", onChange }) => {
  const { t, lang } = useAdminLang();
  const S = t.spec;
  const keys = fields.map((f) => f.key);
  const setLabel = (i, label) => onChange({ fields: fields.map((f, k) => (k === i ? { ...f, label } : f)) });
  const add = () => onChange({ fields: [...fields, { key: makeKey(`alan ${fields.length + 1}`, keys), label: "" }] });
  const remove = (i) => onChange({ fields: fields.filter((_, k) => k !== i) });
  const preset = (p) => {
    const taken = [];
    const labels = { ru: {}, uz: {} };
    const next = p.fields.map((l) => {
      const key = makeKey(l.tr, taken);
      taken.push(key);
      labels.ru[key] = l.ru;
      labels.uz[key] = l.uz;
      return { key, label: l[lang] || l.tr };
    });
    onChange({ fields: next, sizes: p.sizes.join(", "), labels });
  };
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4 sm:col-span-2" data-testid="spec-fields-editor">
      <p className="text-sm font-semibold">{S.title}</p>
      <p className="mt-1 text-xs text-slate-400">{S.sub}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {SPEC_PRESETS.map((p) => (
          <button type="button" key={p.id} onClick={() => preset(p)} data-testid={`spec-preset-${p.id}`}
            className="rounded-full border border-white/15 px-3 py-1.5 text-xs text-slate-200 hover:border-[#F2962B] hover:text-white">{S.preset(p.label[lang] || p.label.tr)}</button>
        ))}
      </div>
      <div className="mt-4 grid gap-2">
        {fields.map((f, i) => (
          <div key={f.key} className="flex gap-2">
            <input className={aInput} value={f.label} placeholder={S.labelPh} onChange={(e) => setLabel(i, e.target.value)} data-testid={`spec-field-label-${i}`} />
            <button type="button" onClick={() => remove(i)} className="rounded-lg px-3 text-slate-400 hover:bg-red-500/15 hover:text-red-400" data-testid={`spec-field-remove-${i}`} aria-label={S.remove}><X className="h-4 w-4" /></button>
          </div>
        ))}
      </div>
      <button type="button" onClick={add} className="mt-3 inline-flex items-center gap-2 text-sm text-[#F7B267] hover:text-white" data-testid="spec-field-add"><Plus className="h-4 w-4" /> {S.add}</button>
      <label className="mt-4 block">
        <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-300">{S.sizes}</span>
        <input className={aInput} value={sizes} onChange={(e) => onChange({ sizes: e.target.value })} placeholder={S.sizesPh} data-testid="category-default-sizes-input" />
      </label>
    </div>
  );
};
