import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Loader2, LogOut, Package, Layers, FileText, Mail, Settings, ExternalLink } from "lucide-react";
import { api } from "@/lib/api";
import { Logo } from "@/components/Logo";
import AdminProducts from "@/pages/admin/AdminProducts";
import AdminCategories from "@/pages/admin/AdminCategories";
import { AdminQuotes, AdminMessages } from "@/pages/admin/AdminInbox";
import AdminSettings from "@/pages/admin/AdminSettings";

const TABS = [
  { id: "products", label: "Ürünler", icon: Package, C: AdminProducts },
  { id: "categories", label: "Kategoriler", icon: Layers, C: AdminCategories },
  { id: "quotes", label: "Teklifler", icon: FileText, C: AdminQuotes, badge: "new_quotes" },
  { id: "messages", label: "Mesajlar", icon: Mail, C: AdminMessages, badge: "unread_messages" },
  { id: "settings", label: "Firma Bilgileri", icon: Settings, C: AdminSettings },
];

const Login = () => {
  const login = () => {
    // REMINDER: DO NOT HARDCODE THE URL, OR ADD ANY FALLBACKS OR REDIRECT URLS, THIS BREAKS THE AUTH
    const redirectUrl = window.location.origin + "/admin";
    window.location.href = `https://auth.emergentagent.com/?redirect=${encodeURIComponent(redirectUrl)}`;
  };
  return (
    <main className="hero-grid flex min-h-screen items-center justify-center bg-[#0B0F17] px-5" data-testid="admin-login-page">
      <div className="w-full max-w-md rounded-[24px] border border-white/10 bg-[#131924] p-8 md:p-10">
        <Logo />
        <h1 className="mt-10 font-display text-4xl font-black uppercase leading-none text-white">Yönetim Paneli</h1>
        <p className="mt-4 text-slate-300">Ürünleri eklemek ve firma bilgilerini güncellemek için yetkili Google hesabınızla giriş yapın.</p>
        <button onClick={login} data-testid="admin-google-login-button"
          className="mt-8 flex w-full items-center justify-center gap-3 rounded-full bg-white px-6 py-4 font-semibold text-[#0B0F17] transition-colors hover:bg-[#FACC15]">
          <svg viewBox="0 0 24 24" className="h-5 w-5"><path fill="#4285F4" d="M22.6 12.2c0-.8-.1-1.5-.2-2.2H12v4.2h5.9c-.3 1.4-1 2.5-2.2 3.3v2.7h3.6c2.1-1.9 3.3-4.8 3.3-8z"/><path fill="#34A853" d="M12 23c3 0 5.5-1 7.3-2.7l-3.6-2.7c-1 .7-2.2 1.1-3.7 1.1-2.9 0-5.3-1.9-6.2-4.5H2.1v2.8C3.9 20.5 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.8 14.2c-.2-.7-.4-1.4-.4-2.2s.1-1.5.4-2.2V7H2.1C1.4 8.5 1 10.2 1 12s.4 3.5 1.1 5l3.7-2.8z"/><path fill="#EA4335" d="M12 5.4c1.6 0 3.1.6 4.2 1.7l3.2-3.2C17.5 2.1 15 1 12 1 7.7 1 3.9 3.5 2.1 7l3.7 2.8c.9-2.6 3.3-4.4 6.2-4.4z"/></svg>
          Google ile Giriş Yap
        </button>
        <Link to="/" className="mt-6 block text-center text-sm text-slate-400 hover:text-white" data-testid="admin-back-to-site">← Siteye dön</Link>
      </div>
    </main>
  );
};

export default function AdminApp() {
  const location = useLocation();
  const [user, setUser] = useState(location.state?.user || null);
  const [authed, setAuthed] = useState(location.state?.user ? true : null);
  const [tab, setTab] = useState("products");
  const [stats, setStats] = useState({});

  useEffect(() => {
    if (location.state?.user) return;
    api.get("/auth/me").then((r) => { setUser(r.data); setAuthed(true); }).catch(() => setAuthed(false));
  }, [location.state]);

  const loadStats = () => api.get("/admin/stats").then((r) => setStats(r.data || {})).catch(() => {});
  useEffect(() => {
    if (authed) loadStats();
  }, [authed, tab]);

  if (authed === null) return <main className="flex min-h-screen items-center justify-center bg-[#0B0F17]"><Loader2 className="h-8 w-8 animate-spin text-[#FF5722]" /></main>;
  if (!authed) return <Login />;

  const logout = async () => {
    await api.post("/auth/logout").catch(() => {});
    setAuthed(false);
  };
  const Active = TABS.find((t) => t.id === tab).C;

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#0B0F17] text-white lg:grid lg:grid-cols-[260px,1fr]" data-testid="admin-dashboard">
      <aside className="border-b border-white/10 bg-[#07090F] p-5 lg:sticky lg:top-0 lg:h-screen lg:border-b-0 lg:border-r">
        <div className="flex items-center justify-between lg:block"><Logo /></div>
        <nav className="no-scrollbar mt-6 flex gap-2 overflow-x-auto lg:mt-10 lg:flex-col">
          {TABS.map(({ id, label, icon: I, badge }) => (
            <button key={id} onClick={() => setTab(id)} data-testid={`admin-tab-${id}`}
              className={`flex shrink-0 items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors ${tab === id ? "bg-[#FF5722] text-white" : "text-slate-300 hover:bg-white/5"}`}>
              <I className="h-4 w-4" /> {label}
              {badge && stats[badge] > 0 && <span className="ml-auto rounded-full bg-[#FACC15] px-2 text-xs font-bold text-[#0B0F17]">{stats[badge]}</span>}
            </button>
          ))}
        </nav>
        <div className="mt-6 hidden space-y-2 lg:absolute lg:bottom-6 lg:left-5 lg:right-5 lg:block">
          <p className="truncate text-xs text-slate-400" data-testid="admin-user-email">{user?.email}</p>
          <Link to="/" target="_blank" className="flex items-center gap-2 text-sm text-slate-300 hover:text-white" data-testid="admin-view-site"><ExternalLink className="h-4 w-4" /> Siteyi görüntüle</Link>
          <button onClick={logout} className="flex items-center gap-2 text-sm text-slate-300 hover:text-white" data-testid="admin-logout-button"><LogOut className="h-4 w-4" /> Çıkış yap</button>
        </div>
      </aside>
      <main className="min-w-0 p-5 md:p-10">
        <div className="mb-6 flex justify-end gap-4 lg:hidden">
          <Link to="/" className="text-sm text-slate-300" data-testid="admin-view-site-mobile">Siteyi görüntüle</Link>
          <button onClick={logout} className="text-sm text-slate-300" data-testid="admin-logout-mobile">Çıkış yap</button>
        </div>
        <Active onChange={loadStats} />
      </main>
    </div>
  );
}
