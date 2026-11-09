import { useState } from "react";
import { toast } from "sonner";
import { KeyRound, Loader2 } from "lucide-react";
import { api, errMsg } from "@/lib/api";
import { AField, aInput, PrimaryBtn } from "@/pages/admin/ui";

export const ChangePassword = () => {
  const [f, setF] = useState({ current_password: "", new_password: "", confirm: "" });
  const [busy, setBusy] = useState(false);
  const submit = async (e) => {
    e.preventDefault();
    if (f.new_password !== f.confirm) return toast.error("Yeni şifreler eşleşmiyor");
    setBusy(true);
    try {
      await api.post("/auth/change-password", { current_password: f.current_password, new_password: f.new_password });
      toast.success("Şifre değiştirildi");
      setF({ current_password: "", new_password: "", confirm: "" });
    } catch (err) {
      toast.error(errMsg(err, "Şifre değiştirilemedi (en az 8 karakter olmalı)"));
    } finally {
      setBusy(false);
    }
  };
  const field = (k, label) => (
    <AField label={label}>
      <input type="password" required minLength={k === "current_password" ? 1 : 8} className={aInput} value={f[k]}
        onChange={(e) => setF({ ...f, [k]: e.target.value })} data-testid={`password-${k}-input`} />
    </AField>
  );
  return (
    <form onSubmit={submit} className="mt-8 grid max-w-3xl gap-4 rounded-2xl border border-white/10 bg-[#131924] p-6 sm:grid-cols-3" data-testid="change-password-form">
      <p className="flex items-center gap-2 text-sm font-semibold sm:col-span-3"><KeyRound className="h-4 w-4 text-[#F2962B]" /> Şifre değiştir</p>
      {field("current_password", "Mevcut şifre")}
      {field("new_password", "Yeni şifre (en az 8)")}
      {field("confirm", "Yeni şifre tekrar")}
      <div className="sm:col-span-3"><PrimaryBtn type="submit" disabled={busy} data-testid="password-save-button">{busy && <Loader2 className="h-4 w-4 animate-spin" />} Şifreyi Güncelle</PrimaryBtn></div>
    </form>
  );
};
