import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { CheckCircle2, Loader2 } from "lucide-react";
import { api, errMsg } from "@/lib/api";
import { Logo } from "@/components/Logo";

export const authInput = "w-full rounded-xl border border-white/15 bg-white/[0.04] px-4 py-3.5 text-white outline-none focus:border-[#F2962B]";
export const authBtn = "mt-8 flex w-full items-center justify-center gap-3 rounded-full bg-[#F2962B] px-6 py-4 font-semibold transition-colors hover:bg-[#F5A94E] disabled:opacity-60";

export const AuthCard = ({ title, sub, children, testid }) => (
  <main className="hero-grid flex min-h-screen items-center justify-center bg-[#0B0F17] px-5" data-testid={testid}>
    <div className="w-full max-w-md rounded-[24px] border border-white/10 bg-[#131924] p-8 md:p-10">
      <Logo />
      <h1 className="mt-10 font-display text-4xl font-black uppercase leading-none text-white">{title}</h1>
      {sub && <p className="mt-4 text-slate-300">{sub}</p>}
      {children}
    </div>
  </main>
);

export default function ResetPassword() {
  const [params] = useSearchParams();
  const token = params.get("token") || "";
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (pw !== pw2) return setError("Şifreler eşleşmiyor");
    setBusy(true);
    setError("");
    try {
      await api.post("/auth/reset-password", { token, new_password: pw });
      setDone(true);
    } catch (err) {
      setError(errMsg(err, "Şifre güncellenemedi"));
    } finally {
      setBusy(false);
    }
  };

  if (done) {
    return (
      <AuthCard title="Şifre güncellendi" testid="reset-password-done">
        <p className="mt-6 flex items-center gap-3 text-emerald-400"><CheckCircle2 className="h-5 w-5" /> Yeni şifrenizle giriş yapabilirsiniz.</p>
        <Link to="/admin" className={authBtn} data-testid="reset-go-login">Giriş ekranına git</Link>
      </AuthCard>
    );
  }
  return (
    <AuthCard title="Yeni şifre" sub="En az 8 karakterli yeni bir şifre belirleyin." testid="reset-password-page">
      <form onSubmit={submit}>
        <label className="mt-8 block text-xs font-semibold uppercase tracking-wider text-slate-300">Yeni şifre
          <input type="password" required minLength={8} autoComplete="new-password" value={pw} onChange={(e) => setPw(e.target.value)} className={`${authInput} mt-1.5`} data-testid="reset-password-input" />
        </label>
        <label className="mt-4 block text-xs font-semibold uppercase tracking-wider text-slate-300">Yeni şifre tekrar
          <input type="password" required minLength={8} autoComplete="new-password" value={pw2} onChange={(e) => setPw2(e.target.value)} className={`${authInput} mt-1.5`} data-testid="reset-password-confirm-input" />
        </label>
        {!token && <p className="mt-4 text-sm text-red-400">Bağlantı eksik. E-postadaki bağlantıyı kullanın.</p>}
        {error && <p className="mt-4 text-sm text-red-400" data-testid="reset-password-error">{error}</p>}
        <button type="submit" disabled={busy || !token} className={authBtn} data-testid="reset-password-submit">
          {busy && <Loader2 className="h-5 w-5 animate-spin" />} Şifreyi Kaydet
        </button>
      </form>
    </AuthCard>
  );
}
