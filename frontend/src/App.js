import "@/App.css";
import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";
import { Toaster } from "sonner";
import { SettingsProvider } from "@/context/SettingsContext";
import { LangProvider } from "@/i18n/LangContext";
import { SmoothScroll } from "@/components/site/SmoothScroll";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import { WhatsAppButton } from "@/components/site/WhatsAppButton";
import Home from "@/pages/Home";
import Catalog from "@/pages/Catalog";
import ProductDetail from "@/pages/ProductDetail";
import Quote from "@/pages/Quote";
import Contact from "@/pages/Contact";
import AdminApp from "@/pages/admin/AdminApp";
import ResetPassword from "@/pages/admin/ResetPassword";

const SiteLayout = () => (
  <div className="grain min-h-screen bg-[#0B0F17]">
    <Navbar />
    <Outlet />
    <Footer />
    <WhatsAppButton />
  </div>
);

function AppRouter() {
  return (
    <Routes>
      <Route element={<SiteLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/urunler" element={<Catalog />} />
        <Route path="/urunler/:id" element={<ProductDetail />} />
        <Route path="/teklif" element={<Quote />} />
        <Route path="/iletisim" element={<Contact />} />
        <Route path="*" element={<Home />} />
      </Route>
      <Route path="/admin" element={<AdminApp />} />
      <Route path="/admin/sifre-sifirla" element={<ResetPassword />} />
    </Routes>
  );
}

function App() {
  return (
    <LangProvider>
    <SettingsProvider>
      <BrowserRouter>
        <SmoothScroll />
        <AppRouter />
        <Toaster theme="dark" position="bottom-right" richColors />
      </BrowserRouter>
    </SettingsProvider>
    </LangProvider>
  );
}

export default App;
