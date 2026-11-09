import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { api, errMsg } from "@/lib/api";
import { useSite } from "@/context/SettingsContext";
import { AdminTitle, AField, aInput, PrimaryBtn } from "@/pages/admin/ui";
import { TranslationFields, cleanI18n } from "@/pages/admin/TranslationFields";
import { TelegramSettings } from "@/pages/admin/TelegramSettings";
import { ChangePassword } from "@/pages/admin/ChangePassword";

const TR_FIELDS = [
  { k: "tagline", label: "Slogan", type: "text" }, { k: "working_hours", label: "Çalışma saatleri", type: "text" },
  { k: "address", label: "Adres", type: "textarea" }, { k: "about", label: "Hakkımızda", type: "textarea" },
];

const FIELDS = [
  ["company_name", "Firma adı"], ["tagline", "Slogan / kısa tanım"], ["phone", "Telefon"], ["email", "E-posta"],
  ["whatsapp", "WhatsApp numarası (ülke koduyla, örn. 90555...)"], ["working_hours", "Çalışma saatleri"],
  ["notification_email", "Teklif bildirimlerinin gideceği e-posta (boşsa ana yönetici)"], ["address", "Adres", true], ["about", "Hakkımızda", true],
];

export default function AdminSettings() {
  const { settings, reload } = useSite();
  const [f, setF] = useState(settings);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setF(settings);
  }, [settings]);

  const save = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      await api.put("/settings", { ...f, i18n: cleanI18n(f?.i18n) });
      toast.success("Firma bilgileri güncellendi");
      reload();
    } catch (err) {
      toast.error(errMsg(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div data-testid="admin-settings">
      <AdminTitle title="Firma Bilgileri" sub="Sitede gösterilen iletişim ve firma bilgileri" />
      <form onSubmit={save} className="grid max-w-3xl gap-4 rounded-2xl border border-white/10 bg-[#131924] p-6 sm:grid-cols-2">
        {FIELDS.map(([k, label, long]) => (
          <AField key={k} label={label} className={long ? "sm:col-span-2" : ""}>
            {long ? <textarea rows={3} className={aInput} value={f?.[k] || ""} onChange={(e) => setF({ ...f, [k]: e.target.value })} data-testid={`settings-${k}-input`} />
              : <input className={aInput} value={f?.[k] || ""} onChange={(e) => setF({ ...f, [k]: e.target.value })} data-testid={`settings-${k}-input`} />}
          </AField>
        ))}
        <TelegramSettings value={f?.telegram_chat_id} onChange={(v) => setF({ ...f, telegram_chat_id: v })} />
        <TranslationFields value={f?.i18n || {}} onChange={(i18n) => setF({ ...f, i18n })} fields={TR_FIELDS} testid="settings-i18n" />
        <div className="sm:col-span-2"><PrimaryBtn type="submit" disabled={busy} data-testid="settings-save-button">{busy && <Loader2 className="h-4 w-4 animate-spin" />} Kaydet</PrimaryBtn></div>
      </form>
      <ChangePassword />
    </div>
  );
}
