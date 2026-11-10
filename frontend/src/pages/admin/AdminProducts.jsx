import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Search, ImageOff, GripVertical, ChevronUp, ChevronDown } from "lucide-react";
import { api, asList, img, errMsg } from "@/lib/api";
import { useSite } from "@/context/SettingsContext";
import { ProductDialog } from "@/pages/admin/ProductDialog";
import { AdminTitle, PrimaryBtn } from "@/pages/admin/ui";
import { useAdminLang } from "@/pages/admin/adminI18n";

export default function AdminProducts({ onChange }) {
  const { t } = useAdminLang();
  const P = t.products;
  const { categories, reload } = useSite();
  const [items, setItems] = useState([]);
  const [q, setQ] = useState("");
  const [edit, setEdit] = useState(null);
  const [open, setOpen] = useState(false);
  const [dragId, setDragId] = useState(null);

  const load = () => api.get("/products", { params: { all: true } }).then((r) => setItems(asList(r.data))).catch(() => setItems([]));
  useEffect(() => {
    load();
  }, []);

  const refresh = () => { load(); reload(); onChange?.(); };
  const del = async (p) => {
    if (!window.confirm(t.common.confirmDelete(p.name))) return;
    try {
      await api.delete(`/products/${p.id}`);
      toast.success(P.deleted);
      refresh();
    } catch (e) {
      toast.error(errMsg(e));
    }
  };
  const shown = items.filter((p) => `${p.name} ${p.code}`.toLowerCase().includes(q.toLowerCase()));
  const canSort = !q;

  const saveOrder = async (list) => {
    setItems(list);
    try {
      await api.post("/products/reorder", { ids: list.map((p) => p.id) });
      toast.success(P.orderSaved);
    } catch (e) {
      toast.error(errMsg(e, P.orderFail));
      load();
    }
  };
  const moveTo = (fromId, toIdx) => {
    const list = [...items];
    const from = list.findIndex((p) => p.id === fromId);
    if (from < 0 || toIdx < 0 || toIdx >= list.length || from === toIdx) return;
    const [m] = list.splice(from, 1);
    list.splice(toIdx, 0, m);
    saveOrder(list);
  };

  return (
    <div data-testid="admin-products">
      <AdminTitle title={P.title} sub={P.sub(items.length)}
        action={<PrimaryBtn onClick={() => { setEdit(null); setOpen(true); }} data-testid="admin-add-product-button"><Plus className="h-4 w-4" /> {P.add}</PrimaryBtn>} />
      <div className="relative mb-6 max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={P.search} className="w-full rounded-lg border border-white/15 bg-white/5 py-2.5 pl-10 pr-3 text-sm outline-none focus:border-[#F2962B]" data-testid="admin-product-search" />
      </div>
      <div className="grid grid-cols-[minmax(0,1fr)] gap-3">
        {shown.map((p, idx) => (
          <div key={p.id} draggable={canSort} data-testid={`admin-product-row-${p.id}`}
            onDragStart={(e) => { setDragId(p.id); e.dataTransfer.effectAllowed = "move"; }}
            onDragOver={(e) => canSort && e.preventDefault()}
            onDrop={(e) => { e.preventDefault(); if (dragId) moveTo(dragId, idx); setDragId(null); }}
            onDragEnd={() => setDragId(null)}
            className={`flex min-w-0 items-center gap-3 rounded-2xl border bg-[#131924] p-3 transition-[opacity,border-color] ${dragId === p.id ? "border-[#F2962B] opacity-50" : "border-white/10"} ${canSort ? "cursor-grab active:cursor-grabbing" : ""}`}>
            {canSort && (
              <div className="flex shrink-0 flex-col items-center text-slate-400">
                <button onClick={() => moveTo(p.id, idx - 1)} disabled={idx === 0} className="rounded p-0.5 hover:text-white disabled:opacity-20" data-testid={`admin-move-up-${p.id}`} aria-label={P.up}><ChevronUp className="h-4 w-4" /></button>
                <GripVertical className="hidden h-4 w-4 sm:block" />
                <button onClick={() => moveTo(p.id, idx + 1)} disabled={idx === shown.length - 1} className="rounded p-0.5 hover:text-white disabled:opacity-20" data-testid={`admin-move-down-${p.id}`} aria-label={P.down}><ChevronDown className="h-4 w-4" /></button>
              </div>
            )}
            <div className="h-16 w-14 shrink-0 overflow-hidden rounded-lg bg-[#0B0F17]">
              {p.images?.[0] ? <img src={img(p.images[0])} alt="" className="h-full w-full object-cover" /> : <ImageOff className="m-auto mt-5 h-5 w-5 text-slate-500" />}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold text-white">{p.name}</p>
              <p className="mt-1 flex flex-wrap gap-2 text-xs text-slate-400">
                {p.code && <span className="font-mono">{p.code}</span>}
                <span style={{ color: p.category?.accent }}>{p.category?.name}</span>
                {p.featured && <span className="text-[#FACC15]">{P.featured}</span>}
                {!p.active && <span className="text-red-400">{P.inactive}</span>}
              </p>
            </div>
            <button onClick={() => { setEdit(p); setOpen(true); }} className="rounded-lg p-2.5 text-slate-300 hover:bg-white/10 hover:text-white" data-testid={`admin-edit-product-${p.id}`}><Pencil className="h-4 w-4" /></button>
            <button onClick={() => del(p)} className="rounded-lg p-2.5 text-slate-300 hover:bg-red-500/15 hover:text-red-400" data-testid={`admin-delete-product-${p.id}`}><Trash2 className="h-4 w-4" /></button>
          </div>
        ))}
        {!shown.length && <p className="py-12 text-center text-slate-400">{P.empty}</p>}
      </div>
      <ProductDialog open={open} onClose={() => setOpen(false)} product={edit} categories={categories} onSaved={refresh} />
    </div>
  );
}
