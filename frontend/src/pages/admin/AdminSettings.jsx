import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { api, errMsg } from "@/lib/api";
import { useSite } from "@/context/SettingsContext";
import { AdminTitle, AField, aInput, PrimaryBtn } from "@/pages/admin/ui";
import { TranslationFields, cleanI18n } from "@/pages/admin/TranslationFields";
import { TelegramSettings } from "@/pages/admin/TelegramSettings";
import { ChangePassword } from "@/pages/admin/ChangePassword";
import { useAdminLang } from "@/pages/admin/adminI18n";

const FIELDS = [["company_name"], ["tagline"], ["phone"], ["email"], ["whatsapp"], ["working_hours"], ["notification_email"],
  ["address", true], ["map_location", true], ["about", true]];
const SOCIAL = [["instagram", "Instagram"], ["telegram", "Telegram"], ["facebook", "Facebook"], ["tiktok", "TikTok"]];

export default function AdminSettings() {
  const { t } = useAdminLang();
  const S = t.settings;
  const { settings, reload } = useSite();
  const [f, setF] = useState(settings);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setF(settings);
  }, [settings]);

  const trFields = [
    { k: "tagline", label: S.tagline, type: "text" }, { k: "working_hours", label: S.working_hours, type: "text" },
    { k: "address", label: S.address, type: "textarea" }, { k: "about", label: S.about, type: "textarea" },
  ];
  const input = (k) => <input className={aInput} value={f?.[k] || ""} onChange={(e) => setF({ ...f, [k]: e.target.value })} data-testid={`settings-${k}-input`} />;

  const save = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      await api.put("/settings", { ...f, i18n: cleanI18n(f?.i18n) });
      toast.success(S.saved);
      reload();
    } catch (err) {
      toast.error(errMsg(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div data-testid="admin-settings">
      <AdminTitle title={S.title} sub={S.sub} />
      <form onSubmit={save} className="grid max-w-3xl gap-4 rounded-2xl border border-white/10 bg-[#131924] p-6 sm:grid-cols-2">
        {FIELDS.map(([k, long]) => (
          <AField key={k} label={S[k]} className={long ? "sm:col-span-2" : ""}>
            {long ? <textarea rows={k === "map_location" ? 2 : 3} className={aInput} value={f?.[k] || ""} onChange={(e) => setF({ ...f, [k]: e.target.value })} data-testid={`settings-${k}-input`} />
              : input(k)}
          </AField>
        ))}
        <div className="grid gap-3 rounded-xl border border-white/10 bg-white/[0.02] p-4 sm:col-span-2 sm:grid-cols-2" data-testid="settings-social">
          <div className="sm:col-span-2">
            <p className="text-sm font-semibold">{S.social}</p>
            <p className="mt-1 text-xs text-slate-400">{S.socialNote}</p>
          </div>
          {SOCIAL.map(([k, label]) => (
            <AField key={k} label={label}>
              <input className={aInput} value={f?.[k] || ""} placeholder={S.linkPh} onChange={(e) => setF({ ...f, [k]: e.target.value })} data-testid={`settings-${k}-input`} />
            </AField>
          ))}
        </div>
        <TelegramSettings value={f?.telegram_chat_id} onChange={(v) => setF({ ...f, telegram_chat_id: v })} />
        <TranslationFields value={f?.i18n || {}} onChange={(i18n) => setF({ ...f, i18n })} fields={trFields} testid="settings-i18n" />
        <div className="sm:col-span-2"><PrimaryBtn type="submit" disabled={busy} data-testid="settings-save-button">{busy && <Loader2 className="h-4 w-4 animate-spin" />} {t.common.save}</PrimaryBtn></div>
      </form>
      <ChangePassword />
    </div>
  );
}
