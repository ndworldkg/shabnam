import { useState } from "react";
import { Loader2, MailCheck } from "lucide-react";
import { api, errMsg } from "@/lib/api";
import { AuthCard, authBtn, authInput } from "@/pages/admin/ResetPassword";

export const ForgotPassword = ({ onBack }) => {
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
      setError(errMsg(err, "İstek gönderilemedi"));
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthCard title="Şifremi unuttum" sub="Yönetici e-posta adresinizi yazın; şifre sıfırlama bağlantısı gönderelim." testid="forgot-password-page">
      {sent ? (
        <p className="mt-8 flex gap-3 text-emerald-400" data-testid="forgot-password-sent"><MailCheck className="h-5 w-5 shrink-0" />
          Bu adres kayıtlıysa sıfırlama bağlantısı gönderildi. Gelen kutunuzu (ve spam klasörünü) kontrol edin. Bağlantı 1 saat geçerlidir.</p>
      ) : (
        <form onSubmit={submit}>
          <label className="mt-8 block text-xs font-semibold uppercase tracking-wider text-slate-300">E-posta
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className={`${authInput} mt-1.5`} data-testid="forgot-password-email" />
          </label>
          {error && <p className="mt-4 text-sm text-red-400" data-testid="forgot-password-error">{error}</p>}
          <button type="submit" disabled={busy} className={authBtn} data-testid="forgot-password-submit">
            {busy && <Loader2 className="h-5 w-5 animate-spin" />} Bağlantı Gönder
          </button>
        </form>
      )}
      <button onClick={onBack} className="mt-6 block w-full text-center text-sm text-slate-400 hover:text-white" data-testid="forgot-back-to-login">← Girişe dön</button>
    </AuthCard>
  );
};
