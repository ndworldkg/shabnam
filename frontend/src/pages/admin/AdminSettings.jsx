import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { api, errMsg } from "@/lib/api";
import { useSite } from "@/context/SettingsContext";
import { AdminTitle, AField, aInput, PrimaryBtn, toList } from "@/pages/admin/ui";

const FIELDS = [
  ["company_name", "Firma adı"], ["tagline", "Slogan / kısa tanım"], ["phone", "Telefon"], ["email", "E-posta"],
  ["whatsapp", "WhatsApp numarası"], ["working_hours", "Çalışma saatleri"], ["address", "Adres", true], ["about", "Hakkımızda", true],
];

export default function AdminSettings() {
  const { settings, reload } = useSite();
  const [f, setF] = useState(settings);
  const [owner, setOwner] = useState("");
  const [admins, setAdmins] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setF(settings);
  }, [settings]);
  useEffect(() => {
    api.get("/admin/admins").then((r) => { setOwner(r.data?.owner || ""); setAdmins((r.data?.emails || []).join(", ")); }).catch(() => {});
  }, []);

  const save = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      await api.put("/settings", { ...f, admin_emails: toList(admins) });
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
        <AField label="Ek yönetici Google e-postaları (virgülle)" className="sm:col-span-2">
          <input className={aInput} value={admins} onChange={(e) => setAdmins(e.target.value)} placeholder="ornek@gmail.com" data-testid="settings-admin-emails-input" />
          <span className="mt-1.5 block text-xs text-slate-400">Ana yönetici: {owner || "-"}</span>
        </AField>
        <div className="sm:col-span-2"><PrimaryBtn type="submit" disabled={busy} data-testid="settings-save-button">{busy && <Loader2 className="h-4 w-4 animate-spin" />} Kaydet</PrimaryBtn></div>
      </form>
    </div>
  );
}
