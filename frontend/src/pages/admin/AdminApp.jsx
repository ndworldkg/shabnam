import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Loader2, LogOut, Package, Layers, FileText, Mail, Settings, ExternalLink, LogIn } from "lucide-react";
import { api, errMsg } from "@/lib/api";
import { Logo } from "@/components/Logo";
import AdminProducts from "@/pages/admin/AdminProducts";
import AdminCategories from "@/pages/admin/AdminCategories";
import { AdminQuotes, AdminMessages } from "@/pages/admin/AdminInbox";
import AdminSettings from "@/pages/admin/AdminSettings";
import { ForgotPassword } from "@/pages/admin/ForgotPassword";
import { useAdminLang, AdminLangSwitch } from "@/pages/admin/adminI18n";

const TABS = [
  { id: "products", icon: Package, C: AdminProducts },
  { id: "categories", icon: Layers, C: AdminCategories },
  { id: "quotes", icon: FileText, C: AdminQuotes, badge: "new_quotes" },
  { id: "messages", icon: Mail, C: AdminMessages, badge: "unread_messages" },
  { id: "settings", icon: Settings, C: AdminSettings },
];

const Login = ({ onLogin }) => {
  const { t } = useAdminLang();
  const L = t.login;
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [forgot, setForgot] = useState(false);
  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const r = await api.post("/auth/login", { email, password });
      onLogin(r.data);
    } catch (err) {
      setError(errMsg(err, L.fail));
    } finally {
      setBusy(false);
    }
  };
  const inp = "w-full rounded-xl border border-white/15 bg-white/[0.04] px-4 py-3.5 text-white outline-none focus:border-[#F2962B]";
  if (forgot) return <ForgotPassword onBack={() => setForgot(false)} />;
  return (
    <main className="hero-grid flex min-h-screen items-center justify-center bg-[#0B0F17] px-5" data-testid="admin-login-page">
      <form onSubmit={submit} className="w-full max-w-md rounded-[24px] border border-white/10 bg-[#131924] p-8 md:p-10" data-testid="admin-login-form">
        <div className="flex items-center justify-between gap-3"><Logo /><AdminLangSwitch id="login" /></div>
        <h1 className="mt-10 font-display text-4xl font-black uppercase leading-none text-white">{L.title}</h1>
        <p className="mt-4 text-slate-300">{L.sub}</p>
        <label className="mt-8 block text-xs font-semibold uppercase tracking-wider text-slate-300">{L.email}
          <input type="email" required autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} className={`${inp} mt-1.5`} data-testid="admin-login-email" />
        </label>
        <label className="mt-4 block text-xs font-semibold uppercase tracking-wider text-slate-300">{L.password}
          <input type="password" required autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} className={`${inp} mt-1.5`} data-testid="admin-login-password" />
        </label>
        <button type="button" onClick={() => setForgot(true)} className="mt-3 text-sm text-[#F7B267] hover:text-white" data-testid="admin-forgot-password-link">{L.forgot}</button>
        {error && <p className="mt-4 text-sm text-red-400" data-testid="admin-login-error">{error}</p>}
        <button type="submit" disabled={busy} data-testid="admin-login-submit"
          className="mt-8 flex w-full items-center justify-center gap-3 rounded-full bg-[#F2962B] px-6 py-4 font-semibold transition-colors hover:bg-[#F5A94E] disabled:opacity-60">
          {busy ? <Loader2 className="h-5 w-5 animate-spin" /> : <LogIn className="h-5 w-5" />} {L.submit}
        </button>
        <Link to="/" className="mt-6 block text-center text-sm text-slate-400 hover:text-white" data-testid="admin-back-to-site">{L.back}</Link>
      </form>
    </main>
  );
};

export default function AdminApp() {
  const [user, setUser] = useState(null);
  const [authed, setAuthed] = useState(null);
  const [tab, setTab] = useState("products");
  const [stats, setStats] = useState({});
  const { t } = useAdminLang();

  useEffect(() => {
    api.get("/auth/me").then((r) => { setUser(r.data); setAuthed(true); })
      .catch(() => api.post("/auth/refresh").then(() => api.get("/auth/me")).then((r) => { setUser(r.data); setAuthed(true); }).catch(() => setAuthed(false)));
  }, []);

  const loadStats = () => api.get("/admin/stats").then((r) => setStats(r.data || {})).catch(() => {});
  useEffect(() => {
    if (authed) loadStats();
  }, [authed, tab]);

  if (authed === null) return <main className="flex min-h-screen items-center justify-center bg-[#0B0F17]"><Loader2 className="h-8 w-8 animate-spin text-[#F2962B]" /></main>;
  if (!authed) return <Login onLogin={(u) => { setUser(u); setAuthed(true); }} />;

  const logout = async () => {
    await api.post("/auth/logout").catch(() => {});
    setAuthed(false);
  };
  const Active = TABS.find((t) => t.id === tab).C;

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#0B0F17] text-white lg:grid lg:grid-cols-[260px,1fr]" data-testid="admin-dashboard">
      <aside className="border-b border-white/10 bg-[#07090F] p-5 lg:sticky lg:top-0 lg:h-screen lg:border-b-0 lg:border-r">
        <div className="flex items-center justify-between gap-3 lg:block"><Logo /><div className="lg:mt-6"><AdminLangSwitch id="sidebar" /></div></div>
        <nav className="no-scrollbar mt-6 flex gap-2 overflow-x-auto lg:mt-10 lg:flex-col">
          {TABS.map(({ id, icon: I, badge }) => (
            <button key={id} onClick={() => setTab(id)} data-testid={`admin-tab-${id}`}
              className={`flex shrink-0 items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors ${tab === id ? "bg-[#F2962B] text-white" : "text-slate-300 hover:bg-white/5"}`}>
              <I className="h-4 w-4" /> {t.tabs[id]}
              {badge && stats[badge] > 0 && <span className="ml-auto rounded-full bg-[#FACC15] px-2 text-xs font-bold text-[#0B0F17]">{stats[badge]}</span>}
            </button>
          ))}
        </nav>
        <div className="mt-6 hidden space-y-2 lg:absolute lg:bottom-6 lg:left-5 lg:right-5 lg:block">
          <p className="truncate text-xs text-slate-400" data-testid="admin-user-email">{user?.email}</p>
          <Link to="/" target="_blank" className="flex items-center gap-2 text-sm text-slate-300 hover:text-white" data-testid="admin-view-site"><ExternalLink className="h-4 w-4" /> {t.app.viewSite}</Link>
          <button onClick={logout} className="flex items-center gap-2 text-sm text-slate-300 hover:text-white" data-testid="admin-logout-button"><LogOut className="h-4 w-4" /> {t.app.logout}</button>
        </div>
      </aside>
      <main className="min-w-0 p-5 md:p-10">
        <div className="mb-6 flex justify-end gap-4 lg:hidden">
          <Link to="/" className="text-sm text-slate-300" data-testid="admin-view-site-mobile">{t.app.viewSite}</Link>
          <button onClick={logout} className="text-sm text-slate-300" data-testid="admin-logout-mobile">{t.app.logout}</button>
        </div>
        <Active onChange={loadStats} />
      </main>
    </div>
  );
}
