import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { api, errMsg } from "@/lib/api";
import { ImageUploader } from "@/pages/admin/ImageUploader";
import { AField, aInput, PrimaryBtn, toList } from "@/pages/admin/ui";
import { TranslationFields, cleanI18n } from "@/pages/admin/TranslationFields";
import { useAdminLang } from "@/pages/admin/adminI18n";

const trFields = (cat, D) => [
  { k: "name", label: D.name, type: "text" },
  ...(cat?.spec_fields || []).map((s) => ({ k: "specs", sub: s.key, label: s.label, type: "text" })),
  { k: "colors", label: D.colors, type: "csv" }, { k: "summary", label: D.summary, type: "textarea" },
  { k: "description", label: D.description, type: "textarea" }, { k: "features", label: D.features, type: "lines" },
];

const blank = (cats) => ({ name: "", code: "", category_id: cats[0]?.id || "", summary: "", description: "", specs: {},
  features: "", sizes: (cats[0]?.default_sizes || []).join(", "), colors: "", images: [], featured: false, active: true, price_from: "", show_price: false, i18n: {} });

const toForm = (p) => ({ ...p, specs: p.specs || {}, price_from: p.price_from ?? "", show_price: !!p.show_price, features: (p.features || []).join("\n"), sizes: (p.sizes || []).join(", "), colors: (p.colors || []).join(", ") });

export const ProductDialog = ({ open, onClose, product, categories, onSaved }) => {
  const { t } = useAdminLang();
  const D = t.dialog;
  const [f, setF] = useState(blank(categories));
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (open) setF(product ? toForm(product) : blank(categories));
  }, [open, product, categories]);

  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const cat = categories.find((c) => c.id === f.category_id);
  const specFields = cat?.spec_fields || [];
  const changeCategory = (e) => {
    const next = categories.find((c) => c.id === e.target.value);
    setF({ ...f, category_id: e.target.value, sizes: product ? f.sizes : (next?.default_sizes || []).join(", ") });
  };

  const save = async (e) => {
    e.preventDefault();
    if (!f.category_id) return toast.error(D.needCat);
    setBusy(true);
    const body = { name: f.name, code: f.code, category_id: f.category_id, summary: f.summary, description: f.description,
      specs: Object.fromEntries(specFields.map((s) => [s.key, f.specs?.[s.key] || ""])), features: toList(f.features), sizes: toList(f.sizes), colors: toList(f.colors), images: f.images, featured: f.featured, active: f.active, price_from: f.price_from === "" ? null : Number(f.price_from), show_price: f.show_price, i18n: cleanI18n(f.i18n) };
    try {
      if (product) await api.put(`/products/${product.id}`, body);
      else await api.post("/products", body);
      toast.success(product ? D.updated : D.added);
      onSaved();
      onClose();
    } catch (err) {
      toast.error(errMsg(err, t.common.saveFail));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[92vh] max-w-3xl overflow-y-auto border-white/10 bg-[#131924] text-white" data-testid="product-dialog">
        <DialogHeader><DialogTitle className="font-display text-2xl font-black uppercase">{product ? D.edit : D.create}</DialogTitle></DialogHeader>
        <form onSubmit={save} className="grid gap-4 sm:grid-cols-2">
          <AField label={D.photos} className="sm:col-span-2">
            <ImageUploader value={f.images} onChange={(images) => setF({ ...f, images })} testid="product-images" />
          </AField>
          <AField label={`${D.name} *`}><input required className={aInput} value={f.name} onChange={set("name")} data-testid="product-name-input" /></AField>
          <AField label={D.code}><input className={aInput} value={f.code} onChange={set("code")} data-testid="product-code-input" /></AField>
          <AField label={`${D.category} *`}>
            <select className={aInput} value={f.category_id} onChange={changeCategory} data-testid="product-category-select">
              {categories.map((c) => <option key={c.id} value={c.id} className="bg-[#131924]">{c.name}</option>)}
            </select>
          </AField>
          {specFields.map((s) => (
            <AField key={s.key} label={s.label}>
              <input className={aInput} value={f.specs?.[s.key] || ""} onChange={(e) => setF({ ...f, specs: { ...f.specs, [s.key]: e.target.value } })} data-testid={`product-spec-${s.key}-input`} />
            </AField>
          ))}
          {!specFields.length && <p className="text-xs text-slate-400 sm:col-span-2">{D.noSpecs}</p>}
          <AField label={D.sizes}><input className={aInput} value={f.sizes} onChange={set("sizes")} data-testid="product-sizes-input" /></AField>
          <AField label={D.colors}><input className={aInput} value={f.colors} onChange={set("colors")} data-testid="product-colors-input" /></AField>
          <AField label={D.price}>
            <input type="number" min="0" step="1000" className={aInput} value={f.price_from} onChange={set("price_from")} placeholder={D.pricePh} data-testid="product-price-input" />
          </AField>
          <AField label={D.summary} className="sm:col-span-2"><input className={aInput} value={f.summary} onChange={set("summary")} data-testid="product-summary-input" /></AField>
          <AField label={D.description} className="sm:col-span-2"><textarea rows={4} className={aInput} value={f.description} onChange={set("description")} data-testid="product-description-input" /></AField>
          <AField label={D.features} className="sm:col-span-2"><textarea rows={4} className={aInput} value={f.features} onChange={set("features")} data-testid="product-features-input" /></AField>
          <TranslationFields value={f.i18n} onChange={(i18n) => setF({ ...f, i18n })} fields={trFields(cat, D)} testid="product-i18n" />
          <div className="flex flex-wrap gap-8 sm:col-span-2">
            <label className="flex items-center gap-3 text-sm"><Switch checked={f.featured} onCheckedChange={(v) => setF({ ...f, featured: v })} data-testid="product-featured-switch" /> {D.featuredSw}</label>
            <label className="flex items-center gap-3 text-sm"><Switch checked={f.active} onCheckedChange={(v) => setF({ ...f, active: v })} data-testid="product-active-switch" /> {D.activeSw}</label>
            <label className="flex items-center gap-3 text-sm"><Switch checked={f.show_price} onCheckedChange={(v) => setF({ ...f, show_price: v })} data-testid="product-show-price-switch" /> {D.showPrice}</label>
          </div>
          <div className="flex justify-end gap-3 sm:col-span-2">
            <button type="button" onClick={onClose} className="rounded-full px-5 py-2.5 text-sm text-slate-300 hover:text-white" data-testid="product-cancel-button">{t.common.cancel}</button>
            <PrimaryBtn type="submit" disabled={busy} data-testid="product-save-button">{busy && <Loader2 className="h-4 w-4 animate-spin" />} {busy ? t.common.saving : t.common.save}</PrimaryBtn>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
