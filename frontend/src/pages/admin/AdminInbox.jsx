import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Trash2, Phone, Mail, Building2 } from "lucide-react";
import { api, asList, errMsg } from "@/lib/api";
import { AdminTitle, fmtDate } from "@/pages/admin/ui";
import { useAdminLang } from "@/pages/admin/adminI18n";

const STATUS = { yeni: "bg-[#FACC15] text-[#0B0F17]", "görüşülüyor": "bg-[#3B82F6] text-white", "tamamlandı": "bg-emerald-500 text-white", iptal: "bg-slate-600 text-white" };

const useList = (path) => {
  const [items, setItems] = useState([]);
  const load = () => api.get(path).then((r) => setItems(asList(r.data))).catch(() => setItems([]));
  useEffect(() => {
    load();
  }, [path]);
  return [items, load];
};

const Contact = ({ x }) => (
  <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-sm text-slate-300">
    {x.company && <span className="flex items-center gap-1.5"><Building2 className="h-3.5 w-3.5" />{x.company}</span>}
    <a href={`mailto:${x.email}`} className="flex items-center gap-1.5 hover:text-white"><Mail className="h-3.5 w-3.5" />{x.email}</a>
    {x.phone && <a href={`tel:${x.phone}`} className="flex items-center gap-1.5 hover:text-white"><Phone className="h-3.5 w-3.5" />{x.phone}</a>}
  </div>
);

const del = async (path, load, onChange, question) => {
  if (!window.confirm(question)) return;
  try {
    await api.delete(path);
    load();
    onChange?.();
  } catch (e) {
    toast.error(errMsg(e));
  }
};

export const AdminQuotes = ({ onChange }) => {
  const { t } = useAdminLang();
  const I = t.inbox;
  const [items, load] = useList("/quotes");
  const setStatus = async (id, status) => {
    await api.patch(`/quotes/${id}`, { status }).catch(() => toast.error(I.statusFail));
    load();
    onChange?.();
  };
  return (
    <div data-testid="admin-quotes">
      <AdminTitle title={I.quotesTitle} sub={I.quotesSub(items.length)} />
      <div className="grid gap-3">
        {items.map((q) => (
          <div key={q.id} className="rounded-2xl border border-white/10 bg-[#131924] p-5" data-testid={`admin-quote-${q.id}`}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-lg font-semibold">{q.name}</p>
                <p className="text-xs text-slate-400">{fmtDate(q.created_at)}</p>
              </div>
              <div className="flex items-center gap-2">
                <select value={q.status} onChange={(e) => setStatus(q.id, e.target.value)} data-testid={`admin-quote-status-${q.id}`}
                  className={`rounded-full px-3 py-1.5 text-xs font-bold outline-none ${STATUS[q.status] || STATUS.yeni}`}>
                  {Object.keys(STATUS).map((s) => <option key={s} value={s} className="bg-[#131924] text-white">{I.status[s]}</option>)}
                </select>
                <button onClick={() => del(`/quotes/${q.id}`, load, onChange, t.common.deleteRecord)} className="rounded-lg p-2 text-slate-400 hover:text-red-400" data-testid={`admin-delete-quote-${q.id}`}><Trash2 className="h-4 w-4" /></button>
              </div>
            </div>
            <Contact x={q} />
            <div className="mt-4 grid gap-2 rounded-xl bg-white/[0.03] p-4 text-sm sm:grid-cols-3">
              <span><span className="text-slate-400">{I.product}: </span>{q.product_name || I.general}</span>
              <span><span className="text-slate-400">{I.qty}: </span>{q.quantity || "-"}</span>
              <span><span className="text-slate-400">{I.logo}: </span>{q.embroidery ? I.yes : I.no}</span>
            </div>
            {q.message && <p className="mt-3 whitespace-pre-line text-slate-200">{q.message}</p>}
          </div>
        ))}
        {!items.length && <p className="py-12 text-center text-slate-400">{I.emptyQuotes}</p>}
      </div>
    </div>
  );
};

export const AdminMessages = ({ onChange }) => {
  const { t } = useAdminLang();
  const I = t.inbox;
  const [items, load] = useList("/messages");
  const markRead = async (m) => {
    if (m.read) return;
    await api.patch(`/messages/${m.id}`).catch(() => {});
    load();
    onChange?.();
  };
  return (
    <div data-testid="admin-messages">
      <AdminTitle title={I.messagesTitle} sub={I.messagesSub(items.length)} />
      <div className="grid gap-3">
        {items.map((m) => (
          <div key={m.id} onClick={() => markRead(m)} data-testid={`admin-message-${m.id}`}
            className={`cursor-pointer rounded-2xl border bg-[#131924] p-5 ${m.read ? "border-white/10" : "border-[#FACC15]/60"}`}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-semibold">{!m.read && <span className="mr-2 inline-block h-2 w-2 rounded-full bg-[#FACC15]" />}{m.subject || I.noSubject} — {m.name}</p>
                <p className="text-xs text-slate-400">{fmtDate(m.created_at)}</p>
              </div>
              <button onClick={(e) => { e.stopPropagation(); del(`/messages/${m.id}`, load, onChange, t.common.deleteRecord); }} className="rounded-lg p-2 text-slate-400 hover:text-red-400" data-testid={`admin-delete-message-${m.id}`}><Trash2 className="h-4 w-4" /></button>
            </div>
            <Contact x={m} />
            <p className="mt-3 whitespace-pre-line text-slate-200">{m.message}</p>
          </div>
        ))}
        {!items.length && <p className="py-12 text-center text-slate-400">{I.emptyMessages}</p>}
      </div>
    </div>
  );
};
