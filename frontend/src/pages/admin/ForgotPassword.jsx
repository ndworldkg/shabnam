import { useState } from "react";
import { Loader2, MailCheck } from "lucide-react";
import { api, errMsg } from "@/lib/api";
import { AuthCard, authBtn, authInput } from "@/pages/admin/ResetPassword";
import { useAdminLang } from "@/pages/admin/adminI18n";

export const ForgotPassword = ({ onBack }) => {
  const { t } = useAdminLang();
  const F = t.forgot;
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      await api.post("/auth/forgot-password", { email });
      setSent(true);
    } catch (err) {
      setError(errMsg(err, F.fail));
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthCard title={F.title} sub={F.sub} testid="forgot-password-page">
      {sent ? (
        <p className="mt-8 flex gap-3 text-emerald-400" data-testid="forgot-password-sent"><MailCheck className="h-5 w-5 shrink-0" />
          {F.sent}</p>
      ) : (
        <form onSubmit={submit}>
          <label className="mt-8 block text-xs font-semibold uppercase tracking-wider text-slate-300">{t.login.email}
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className={`${authInput} mt-1.5`} data-testid="forgot-password-email" />
          </label>
          {error && <p className="mt-4 text-sm text-red-400" data-testid="forgot-password-error">{error}</p>}
          <button type="submit" disabled={busy} className={authBtn} data-testid="forgot-password-submit">
            {busy && <Loader2 className="h-5 w-5 animate-spin" />} {F.submit}
          </button>
        </form>
      )}
      <button onClick={onBack} className="mt-6 block w-full text-center text-sm text-slate-400 hover:text-white" data-testid="forgot-back-to-login">{F.back}</button>
    </AuthCard>
  );
};
