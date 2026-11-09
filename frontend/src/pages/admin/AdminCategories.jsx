import { useState } from "react";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { api, img, errMsg } from "@/lib/api";
import { useSite } from "@/context/SettingsContext";
import { ImageUploader } from "@/pages/admin/ImageUploader";
import { AdminTitle, AField, aInput, PrimaryBtn } from "@/pages/admin/ui";
import { TranslationFields, cleanI18n } from "@/pages/admin/TranslationFields";

const TR_FIELDS = [{ k: "name", label: "Kategori adı", type: "text" }, { k: "description", label: "Açıklama", type: "text" }];

const COLORS = ["#F2962B", "#FACC15", "#3B82F6", "#10B981", "#EC4899", "#A78BFA", "#F97316", "#22D3EE"];
const BLANK = { name: "", description: "", image: "", accent: "#F2962B", order: 0, i18n: {} };

export default function AdminCategories({ onChange }) {
  const { categories, reload } = useSite();
  const [f, setF] = useState(BLANK);
  const [editId, setEditId] = useState(null);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  const openFor = (c) => {
    setEditId(c?.id || null);
    setF(c ? { name: c.name, description: c.description, image: c.image, accent: c.accent, order: c.order, i18n: c.i18n || {} } : { ...BLANK, order: categories.length });
    setOpen(true);
  };
  const save = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const body = { ...f, order: Number(f.order) || 0, i18n: cleanI18n(f.i18n) };
      if (editId) await api.put(`/categories/${editId}`, body);
      else await api.post("/categories", body);
      toast.success("Kategori kaydedildi");
      setOpen(false);
      reload();
      onChange?.();
    } catch (err) {
      toast.error(errMsg(err));
    } finally {
      setBusy(false);
    }
  };
  const del = async (c) => {
    if (!window.confirm(`"${c.name}" kategorisi silinsin mi?`)) return;
    try {
      await api.delete(`/categories/${c.id}`);
      toast.success("Kategori silindi");
      reload();
    } catch (e) {
      toast.error(errMsg(e));
    }
  };

  return (
    <div data-testid="admin-categories">
      <AdminTitle title="Kategoriler" sub="Sıra numarası küçük olan önce gösterilir"
        action={<PrimaryBtn onClick={() => openFor(null)} data-testid="admin-add-category-button"><Plus className="h-4 w-4" /> Yeni Kategori</PrimaryBtn>} />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {categories.map((c) => (
          <div key={c.id} className="overflow-hidden rounded-2xl border border-white/10 bg-[#131924]" data-testid={`admin-category-${c.slug}`}>
            <div className="relative h-32 bg-[#0B0F17]">
              {c.image && <img src={img(c.image)} alt="" className="h-full w-full object-cover opacity-70" />}
              <span className="absolute left-0 top-0 h-1.5 w-full" style={{ background: c.accent }} />
            </div>
            <div className="flex items-center gap-2 p-4">
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold">{c.name}</p>
                <p className="text-xs text-slate-400">Sıra {c.order} · {c.product_count} ürün</p>
              </div>
              <button onClick={() => openFor(c)} className="rounded-lg p-2 text-slate-300 hover:bg-white/10" data-testid={`admin-edit-category-${c.slug}`}><Pencil className="h-4 w-4" /></button>
              <button onClick={() => del(c)} className="rounded-lg p-2 text-slate-300 hover:bg-red-500/15 hover:text-red-400" data-testid={`admin-delete-category-${c.slug}`}><Trash2 className="h-4 w-4" /></button>
            </div>
          </div>
        ))}
      </div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[92vh] overflow-y-auto border-white/10 bg-[#131924] text-white" data-testid="category-dialog">
          <DialogHeader><DialogTitle className="font-display text-2xl font-black uppercase">{editId ? "Kategoriyi Düzenle" : "Yeni Kategori"}</DialogTitle></DialogHeader>
          <form onSubmit={save} className="grid gap-4">
            <AField label="Kapak fotoğrafı"><ImageUploader multiple={false} value={f.image ? [f.image] : []} onChange={(v) => setF({ ...f, image: v[0] || "" })} testid="category-image" /></AField>
            <AField label="Kategori adı *"><input required className={aInput} value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} data-testid="category-name-input" /></AField>
            <AField label="Açıklama"><input className={aInput} value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} data-testid="category-description-input" /></AField>
            <AField label="Sıra"><input type="number" className={aInput} value={f.order} onChange={(e) => setF({ ...f, order: e.target.value })} data-testid="category-order-input" /></AField>
            <AField label="Vurgu rengi">
              <div className="flex flex-wrap gap-2">
                {COLORS.map((c) => (
                  <button type="button" key={c} onClick={() => setF({ ...f, accent: c })} data-testid={`category-color-${c.slice(1)}`}
                    className={`h-8 w-8 rounded-full border-2 ${f.accent === c ? "border-white" : "border-transparent"}`} style={{ background: c }} />
                ))}
              </div>
            </AField>
            <TranslationFields value={f.i18n} onChange={(i18n) => setF({ ...f, i18n })} fields={TR_FIELDS} testid="category-i18n" />
            <div className="flex justify-end"><PrimaryBtn type="submit" disabled={busy} data-testid="category-save-button">{busy && <Loader2 className="h-4 w-4 animate-spin" />} Kaydet</PrimaryBtn></div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
