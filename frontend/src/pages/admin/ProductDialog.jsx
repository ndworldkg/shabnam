import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { api, errMsg } from "@/lib/api";
import { ImageUploader } from "@/pages/admin/ImageUploader";
import { AField, aInput, PrimaryBtn, toList } from "@/pages/admin/ui";

const blank = (cats) => ({ name: "", code: "", category_id: cats[0]?.id || "", summary: "", description: "", fabric: "", weight: "",
  features: "", sizes: "S, M, L, XL, XXL", colors: "", images: [], featured: false, active: true });

const toForm = (p) => ({ ...p, features: (p.features || []).join("\n"), sizes: (p.sizes || []).join(", "), colors: (p.colors || []).join(", ") });

export const ProductDialog = ({ open, onClose, product, categories, onSaved }) => {
  const [f, setF] = useState(blank(categories));
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (open) setF(product ? toForm(product) : blank(categories));
  }, [open, product, categories]);

  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  const save = async (e) => {
    e.preventDefault();
    if (!f.category_id) return toast.error("Önce bir kategori oluşturun.");
    setBusy(true);
    const body = { name: f.name, code: f.code, category_id: f.category_id, summary: f.summary, description: f.description, fabric: f.fabric,
      weight: f.weight, features: toList(f.features), sizes: toList(f.sizes), colors: toList(f.colors), images: f.images, featured: f.featured, active: f.active };
    try {
      if (product) await api.put(`/products/${product.id}`, body);
      else await api.post("/products", body);
      toast.success(product ? "Ürün güncellendi" : "Ürün eklendi");
      onSaved();
      onClose();
    } catch (err) {
      toast.error(errMsg(err, "Kaydedilemedi"));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[92vh] max-w-3xl overflow-y-auto border-white/10 bg-[#131924] text-white" data-testid="product-dialog">
        <DialogHeader><DialogTitle className="font-display text-2xl font-black uppercase">{product ? "Ürünü Düzenle" : "Yeni Ürün"}</DialogTitle></DialogHeader>
        <form onSubmit={save} className="grid gap-4 sm:grid-cols-2">
          <AField label="Fotoğraflar (ilk fotoğraf kapak olur)" className="sm:col-span-2">
            <ImageUploader value={f.images} onChange={(images) => setF({ ...f, images })} testid="product-images" />
          </AField>
          <AField label="Ürün adı *"><input required className={aInput} value={f.name} onChange={set("name")} data-testid="product-name-input" /></AField>
          <AField label="Ürün kodu"><input className={aInput} value={f.code} onChange={set("code")} data-testid="product-code-input" /></AField>
          <AField label="Kategori *">
            <select className={aInput} value={f.category_id} onChange={set("category_id")} data-testid="product-category-select">
              {categories.map((c) => <option key={c.id} value={c.id} className="bg-[#131924]">{c.name}</option>)}
            </select>
          </AField>
          <AField label="Kumaş"><input className={aInput} value={f.fabric} onChange={set("fabric")} data-testid="product-fabric-input" /></AField>
          <AField label="Gramaj"><input className={aInput} value={f.weight} onChange={set("weight")} data-testid="product-weight-input" /></AField>
          <AField label="Bedenler (virgülle)"><input className={aInput} value={f.sizes} onChange={set("sizes")} data-testid="product-sizes-input" /></AField>
          <AField label="Renkler (virgülle)" className="sm:col-span-2"><input className={aInput} value={f.colors} onChange={set("colors")} data-testid="product-colors-input" /></AField>
          <AField label="Kısa açıklama" className="sm:col-span-2"><input className={aInput} value={f.summary} onChange={set("summary")} data-testid="product-summary-input" /></AField>
          <AField label="Detaylı açıklama" className="sm:col-span-2"><textarea rows={4} className={aInput} value={f.description} onChange={set("description")} data-testid="product-description-input" /></AField>
          <AField label="Özellikler (her satıra bir tane)" className="sm:col-span-2"><textarea rows={4} className={aInput} value={f.features} onChange={set("features")} data-testid="product-features-input" /></AField>
          <div className="flex flex-wrap gap-8 sm:col-span-2">
            <label className="flex items-center gap-3 text-sm"><Switch checked={f.featured} onCheckedChange={(v) => setF({ ...f, featured: v })} data-testid="product-featured-switch" /> Ana sayfada öne çıkar</label>
            <label className="flex items-center gap-3 text-sm"><Switch checked={f.active} onCheckedChange={(v) => setF({ ...f, active: v })} data-testid="product-active-switch" /> Sitede yayında</label>
          </div>
          <div className="flex justify-end gap-3 sm:col-span-2">
            <button type="button" onClick={onClose} className="rounded-full px-5 py-2.5 text-sm text-slate-300 hover:text-white" data-testid="product-cancel-button">Vazgeç</button>
            <PrimaryBtn type="submit" disabled={busy} data-testid="product-save-button">{busy && <Loader2 className="h-4 w-4 animate-spin" />} Kaydet</PrimaryBtn>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
