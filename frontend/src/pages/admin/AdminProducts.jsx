import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Search, ImageOff } from "lucide-react";
import { api, asList, img, errMsg } from "@/lib/api";
import { useSite } from "@/context/SettingsContext";
import { ProductDialog } from "@/pages/admin/ProductDialog";
import { AdminTitle, PrimaryBtn } from "@/pages/admin/ui";

export default function AdminProducts({ onChange }) {
  const { categories, reload } = useSite();
  const [items, setItems] = useState([]);
  const [q, setQ] = useState("");
  const [edit, setEdit] = useState(null);
  const [open, setOpen] = useState(false);

  const load = () => api.get("/products", { params: { all: true } }).then((r) => setItems(asList(r.data))).catch(() => setItems([]));
  useEffect(() => {
    load();
  }, []);

  const refresh = () => { load(); reload(); onChange?.(); };
  const del = async (p) => {
    if (!window.confirm(`"${p.name}" silinsin mi?`)) return;
    try {
      await api.delete(`/products/${p.id}`);
      toast.success("Ürün silindi");
      refresh();
    } catch (e) {
      toast.error(errMsg(e));
    }
  };
  const shown = items.filter((p) => `${p.name} ${p.code}`.toLowerCase().includes(q.toLowerCase()));

  return (
    <div data-testid="admin-products">
      <AdminTitle title="Ürünler" sub={`${items.length} ürün`}
        action={<PrimaryBtn onClick={() => { setEdit(null); setOpen(true); }} data-testid="admin-add-product-button"><Plus className="h-4 w-4" /> Yeni Ürün</PrimaryBtn>} />
      <div className="relative mb-6 max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Ürün ara" className="w-full rounded-lg border border-white/15 bg-white/5 py-2.5 pl-10 pr-3 text-sm outline-none focus:border-[#FF5722]" data-testid="admin-product-search" />
      </div>
      <div className="grid gap-3">
        {shown.map((p) => (
          <div key={p.id} className="flex items-center gap-4 rounded-2xl border border-white/10 bg-[#131924] p-3" data-testid={`admin-product-row-${p.id}`}>
            <div className="h-16 w-14 shrink-0 overflow-hidden rounded-lg bg-[#0B0F17]">
              {p.images?.[0] ? <img src={img(p.images[0])} alt="" className="h-full w-full object-cover" /> : <ImageOff className="m-auto mt-5 h-5 w-5 text-slate-500" />}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold text-white">{p.name}</p>
              <p className="mt-1 flex flex-wrap gap-2 text-xs text-slate-400">
                {p.code && <span className="font-mono">{p.code}</span>}
                <span style={{ color: p.category?.accent }}>{p.category?.name}</span>
                {p.featured && <span className="text-[#FACC15]">Öne çıkan</span>}
                {!p.active && <span className="text-red-400">Yayında değil</span>}
              </p>
            </div>
            <button onClick={() => { setEdit(p); setOpen(true); }} className="rounded-lg p-2.5 text-slate-300 hover:bg-white/10 hover:text-white" data-testid={`admin-edit-product-${p.id}`}><Pencil className="h-4 w-4" /></button>
            <button onClick={() => del(p)} className="rounded-lg p-2.5 text-slate-300 hover:bg-red-500/15 hover:text-red-400" data-testid={`admin-delete-product-${p.id}`}><Trash2 className="h-4 w-4" /></button>
          </div>
        ))}
        {!shown.length && <p className="py-12 text-center text-slate-400">Ürün bulunamadı.</p>}
      </div>
      <ProductDialog open={open} onClose={() => setOpen(false)} product={edit} categories={categories} onSaved={refresh} />
    </div>
  );
}
