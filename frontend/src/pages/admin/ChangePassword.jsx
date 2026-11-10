import { useState } from "react";
import { toast } from "sonner";
import { KeyRound, Loader2 } from "lucide-react";
import { api, errMsg } from "@/lib/api";
import { AField, aInput, PrimaryBtn } from "@/pages/admin/ui";
import { useAdminLang } from "@/pages/admin/adminI18n";

export const ChangePassword = () => {
  const { t } = useAdminLang();
  const P = t.password;
  const [f, setF] = useState({ current_password: "", new_password: "", confirm: "" });
  const [busy, setBusy] = useState(false);
  const submit = async (e) => {
    e.preventDefault();
    if (f.new_password !== f.confirm) return toast.error(P.mismatch);
    setBusy(true);
    try {
      await api.post("/auth/change-password", { current_password: f.current_password, new_password: f.new_password });
      toast.success(P.changed);
      setF({ current_password: "", new_password: "", confirm: "" });
    } catch (err) {
      toast.error(errMsg(err, P.fail));
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
      <p className="flex items-center gap-2 text-sm font-semibold sm:col-span-3"><KeyRound className="h-4 w-4 text-[#F2962B]" /> {P.title}</p>
      {field("current_password", P.current)}
      {field("new_password", P.next)}
      {field("confirm", P.confirm)}
      <div className="sm:col-span-3"><PrimaryBtn type="submit" disabled={busy} data-testid="password-save-button">{busy && <Loader2 className="h-4 w-4 animate-spin" />} {P.submit}</PrimaryBtn></div>
    </form>
  );
};
