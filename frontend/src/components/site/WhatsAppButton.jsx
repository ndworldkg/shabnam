import { motion } from "framer-motion";
import { useSite } from "@/context/SettingsContext";

export const WhatsAppButton = () => {
  const { settings } = useSite();
  const num = (settings?.whatsapp || "").replace(/\D/g, "");
  if (!num) return null;
  const text = encodeURIComponent(`Merhaba ${settings?.company_name || ""}, ürünleriniz hakkında bilgi almak istiyorum.`);
  return (
    <motion.a href={`https://wa.me/${num}?text=${text}`} target="_blank" rel="noreferrer" aria-label="WhatsApp ile yazın"
      initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 1.2, type: "spring", stiffness: 260, damping: 18 }}
      whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.94 }} data-testid="whatsapp-float-button"
      className="group fixed bottom-5 right-5 z-[55] flex items-center gap-3 rounded-full bg-[#25D366] p-4 text-white shadow-[0_12px_40px_rgba(37,211,102,.45)] sm:bottom-8 sm:right-8">
      <span className="absolute inset-0 animate-ping rounded-full bg-[#25D366] opacity-30" />
      <svg viewBox="0 0 32 32" className="relative h-7 w-7 fill-current" aria-hidden="true">
        <path d="M16 3C9 3 3.3 8.6 3.3 15.6c0 2.5.7 4.9 2 7L3 29l6.6-2.2c2 1.1 4.2 1.7 6.4 1.7 7 0 12.7-5.6 12.7-12.6S23 3 16 3zm0 23.1c-2 0-4-.6-5.7-1.7l-.4-.2-3.9 1.3 1.3-3.8-.3-.4a10.4 10.4 0 0 1-1.6-5.6C5.4 9.8 10.2 5.1 16 5.1s10.6 4.7 10.6 10.5S21.8 26.1 16 26.1zm5.8-7.8c-.3-.2-1.9-.9-2.2-1-.3-.1-.5-.2-.7.2l-1 1.2c-.2.2-.4.2-.7.1-.3-.2-1.3-.5-2.5-1.6-.9-.8-1.6-1.8-1.7-2.1-.2-.3 0-.5.1-.6l.5-.6.3-.5c.1-.2 0-.4 0-.5l-1-2.4c-.3-.6-.5-.5-.7-.5h-.6c-.2 0-.6.1-.8.4-.3.3-1.1 1-1.1 2.5s1.1 2.9 1.2 3.1c.2.2 2.2 3.4 5.4 4.7 2.7 1 3.2.8 3.8.8.6-.1 1.9-.8 2.2-1.5.3-.8.3-1.4.2-1.5-.1-.2-.3-.3-.6-.4z" />
      </svg>
      <span className="relative hidden pr-1 text-sm font-semibold md:inline">WhatsApp</span>
    </motion.a>
  );
};
