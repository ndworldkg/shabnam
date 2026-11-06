import { useState } from "react";
import { toast } from "sonner";
import { Loader2, Send } from "lucide-react";
import { api, errMsg } from "@/lib/api";
import { Field, inputCls } from "@/components/site/Field";

const EMPTY = { name: "", email: "", phone: "", subject: "", message: "" };

export const ContactForm = () => {
  const [f, setF] = useState(EMPTY);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      await api.post("/messages", f);
      setF(EMPTY);
      setDone(true);
      toast.success("Mesajınız gönderildi.");
    } catch (err) {
      toast.error(errMsg(err, "Mesaj gönderilemedi."));
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="grid gap-5 sm:grid-cols-2" data-testid="contact-form">
      <Field label="Ad Soyad *"><input required minLength={2} className={inputCls} value={f.name} onChange={set("name")} data-testid="contact-name-input" /></Field>
      <Field label="E-posta *"><input required type="email" className={inputCls} value={f.email} onChange={set("email")} data-testid="contact-email-input" /></Field>
      <Field label="Telefon"><input className={inputCls} value={f.phone} onChange={set("phone")} data-testid="contact-phone-input" /></Field>
      <Field label="Konu"><input className={inputCls} value={f.subject} onChange={set("subject")} data-testid="contact-subject-input" /></Field>
      <Field label="Mesaj *" className="sm:col-span-2">
        <textarea required minLength={2} rows={5} className={inputCls} value={f.message} onChange={set("message")} data-testid="contact-message-input" />
      </Field>
      <div className="flex flex-wrap items-center gap-4 sm:col-span-2">
        <button disabled={busy} type="submit" data-testid="contact-submit-button"
          className="inline-flex items-center gap-3 rounded-full bg-white px-8 py-4 font-semibold text-[#0B0F17] transition-[background-color,transform] duration-300 hover:-translate-y-0.5 hover:bg-[#FACC15] disabled:opacity-60">
          {busy ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />} Gönder
        </button>
        {done && <span className="text-sm text-emerald-400" data-testid="contact-success-message">Mesajınız alındı, teşekkürler.</span>}
      </div>
    </form>
  );
};
