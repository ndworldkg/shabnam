import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Check, Loader2, Send } from "lucide-react";
import { api, asList } from "@/lib/api";
import { useLang } from "@/i18n/LangContext";
import { Field, inputCls } from "@/components/site/Field";

const EMPTY = { name: "", company: "", email: "", phone: "", product_id: "", quantity: "", embroidery: false, message: "" };

export const QuoteForm = ({ defaultProductId = "" }) => {
  const { t, loc } = useLang();
  const L = t.form;
  const [products, setProducts] = useState([]);
  const [f, setF] = useState({ ...EMPTY, product_id: defaultProductId });
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    api.get("/products").then((r) => setProducts(asList(r.data))).catch(() => setProducts([]));
  }, []);
  useEffect(() => {
    setF((s) => ({ ...s, product_id: defaultProductId }));
  }, [defaultProductId]);

  const set = (k) => (e) => setF({ ...f, [k]: e.target.type === "checkbox" ? e.target.checked : e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const product = products.find((p) => p.id === f.product_id);
      await api.post("/quotes", { ...f, quantity: Number(f.quantity) || 0, product_name: product?.name || "" });
      setDone(true);
      setF({ ...EMPTY, product_id: defaultProductId });
      toast.success(L.toastOk);
    } catch (err) {
      toast.error(err?.response?.status === 429 ? L.tooMany : L.toastErr);
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="grid gap-5 sm:grid-cols-2" data-testid="quote-form">
      <Field label={L.name}><input required minLength={2} className={inputCls} value={f.name} onChange={set("name")} data-testid="quote-name-input" /></Field>
      <Field label={L.company}><input className={inputCls} value={f.company} onChange={set("company")} data-testid="quote-company-input" /></Field>
      <Field label={L.email}><input required type="email" className={inputCls} value={f.email} onChange={set("email")} data-testid="quote-email-input" /></Field>
      <Field label={L.phone}><input required minLength={5} className={inputCls} value={f.phone} onChange={set("phone")} data-testid="quote-phone-input" /></Field>
      <Field label={L.product}>
        <select className={`${inputCls} appearance-none`} value={f.product_id} onChange={set("product_id")} data-testid="quote-product-select">
          <option value="" className="bg-[#131924]">{L.general}</option>
          {products.map((p) => <option key={p.id} value={p.id} className="bg-[#131924]">{loc(p, "name")}{p.code ? ` (${p.code})` : ""}</option>)}
        </select>
      </Field>
      <Field label={L.qty}><input type="number" min="0" className={inputCls} value={f.quantity} onChange={set("quantity")} data-testid="quote-quantity-input" /></Field>
      <label className="flex cursor-pointer items-center gap-3 sm:col-span-2" data-testid="quote-embroidery-toggle">
        <input type="checkbox" className="peer sr-only" checked={f.embroidery} onChange={set("embroidery")} />
        <span className="flex h-6 w-6 items-center justify-center rounded-md border border-white/25 transition-colors peer-checked:border-[#FF5722] peer-checked:bg-[#FF5722]">
          {f.embroidery && <Check className="h-4 w-4 text-white" />}
        </span>
        <span className="text-slate-200">{L.embroidery}</span>
      </label>
      <Field label={L.message} className="sm:col-span-2">
        <textarea rows={4} className={inputCls} value={f.message} onChange={set("message")} placeholder={L.msgPh} data-testid="quote-message-input" />
      </Field>
      <div className="flex flex-wrap items-center gap-4 sm:col-span-2">
        <button disabled={busy} type="submit" data-testid="quote-submit-button"
          className="group inline-flex items-center gap-3 rounded-full bg-[#FF5722] px-8 py-4 font-semibold text-white transition-[background-color,transform] duration-300 hover:-translate-y-0.5 hover:bg-[#ff6a3d] disabled:opacity-60">
          {busy ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />} {L.submit}
        </button>
        {done && <span className="text-sm text-emerald-400" data-testid="quote-success-message">{L.success}</span>}
      </div>
    </form>
  );
};
