import { useState } from "react";
import { toast } from "sonner";
import { Loader2, Send, Search } from "lucide-react";
import { api, asList, errMsg } from "@/lib/api";
import { AField, aInput } from "@/pages/admin/ui";

export const TelegramSettings = ({ value, onChange }) => {
  const [chats, setChats] = useState(null);
  const [busy, setBusy] = useState("");

  const find = async () => {
    setBusy("find");
    try {
      const r = await api.get("/admin/telegram/chats");
      const list = asList(r.data);
      setChats(list);
      if (!list.length) toast.info("Sohbet bulunamadı. Önce bota Telegram'dan bir mesaj yazın, sonra tekrar deneyin.");
    } catch (e) {
      toast.error(errMsg(e));
    } finally {
      setBusy("");
    }
  };
  const test = async () => {
    setBusy("test");
    try {
      await api.post("/admin/telegram/test", { chat_id: value });
      toast.success("Test mesajı gönderildi. Kaydetmeyi unutmayın.");
    } catch (e) {
      toast.error(errMsg(e));
    } finally {
      setBusy("");
    }
  };

  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4 sm:col-span-2" data-testid="telegram-settings">
      <p className="mb-1 text-sm font-semibold">Telegram bildirimleri</p>
      <p className="mb-4 text-xs text-slate-400">Botunuza Telegram'dan bir mesaj yazın (veya botu grubunuza ekleyin), sonra "Sohbeti bul" butonuna basın.</p>
      <div className="flex flex-col gap-2 sm:flex-row">
        <AField label="Telegram Chat ID" className="flex-1">
          <input className={aInput} value={value || ""} onChange={(e) => onChange(e.target.value)} placeholder="Örn. 123456789" data-testid="settings-telegram-chat-input" />
        </AField>
        <div className="flex gap-2 sm:items-end">
          <button type="button" onClick={find} disabled={!!busy} data-testid="telegram-find-chat-button"
            className="inline-flex items-center gap-2 rounded-lg border border-white/15 px-3.5 py-2.5 text-sm hover:border-[#FACC15]">
            {busy === "find" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />} Sohbeti bul
          </button>
          <button type="button" onClick={test} disabled={!!busy || !value} data-testid="telegram-test-button"
            className="inline-flex items-center gap-2 rounded-lg border border-white/15 px-3.5 py-2.5 text-sm hover:border-[#FACC15] disabled:opacity-50">
            {busy === "test" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />} Test
          </button>
        </div>
      </div>
      {!!chats?.length && (
        <div className="mt-3 flex flex-wrap gap-2">
          {chats.map((c) => (
            <button type="button" key={c.id} onClick={() => onChange(c.id)} data-testid={`telegram-chat-${c.id}`}
              className={`rounded-full border px-3 py-1.5 text-xs ${value === c.id ? "border-[#FACC15] bg-[#FACC15] text-[#0B0F17]" : "border-white/15 text-slate-200"}`}>
              {c.name || c.id} · {c.type}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
