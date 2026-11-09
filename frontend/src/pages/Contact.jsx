import { Phone, Mail, MapPin, Clock, MessageCircle } from "lucide-react";
import { PageHeader } from "@/components/site/PageHeader";
import { ContactForm } from "@/components/site/ContactForm";
import { Reveal } from "@/components/site/Reveal";
import { useSite } from "@/context/SettingsContext";
import { useLang } from "@/i18n/LangContext";

export default function Contact() {
  const { settings } = useSite();
  const { t, loc, lang } = useLang();
  const P = t.contactPage;
  const wa = (settings?.whatsapp || "").replace(/\D/g, "");
  const rows = [
    { icon: Phone, k: P.phone, v: settings?.phone, href: settings?.phone ? `tel:${settings.phone}` : null, id: "phone" },
    { icon: Mail, k: P.email, v: settings?.email, href: settings?.email ? `mailto:${settings.email}` : null, id: "email" },
    { icon: MapPin, k: P.address, v: loc(settings, "address"), id: "address" },
    { icon: Clock, k: P.hours, v: loc(settings, "working_hours"), id: "hours" },
    { icon: MessageCircle, k: P.whatsapp, v: settings?.whatsapp, href: wa ? `https://wa.me/${wa}` : null, id: "whatsapp" },
  ].filter((r) => r.v);

  return (
    <main data-testid="contact-page">
      <PageHeader key={lang} eyebrow={P.eyebrow} lines={P.lines} />
      <section className="mx-auto grid max-w-[1400px] gap-12 px-5 py-16 sm:px-8 md:py-24 lg:grid-cols-12">
        <Reveal className="lg:col-span-5">
          <div className="space-y-3">
            {rows.map(({ icon: I, k, v, href, id }) => {
              const Inner = (
                <div className="group flex items-start gap-5 rounded-2xl border border-white/10 bg-[#131924] p-6 transition-colors duration-300 hover:border-[#F2962B]/60">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#F2962B]/15 text-[#F7B267]"><I className="h-5 w-5" /></span>
                  <span>
                    <span className="block font-mono text-[11px] uppercase tracking-[0.2em] text-slate-400">{k}</span>
                    <span className="mt-1 block text-lg text-white">{v}</span>
                  </span>
                </div>
              );
              return href ? <a key={id} href={href} target={id === "whatsapp" ? "_blank" : undefined} rel="noreferrer" data-testid={`contact-info-${id}`}>{Inner}</a> : <div key={id} data-testid={`contact-info-${id}`}>{Inner}</div>;
            })}
          </div>
          {settings?.about && <p className="mt-8 text-slate-300">{loc(settings, "about")}</p>}
        </Reveal>
        <Reveal className="lg:col-span-7" delay={0.1}>
          <div className="rounded-[24px] border border-white/10 bg-[#131924] p-6 md:p-10">
            <h2 className="mb-8 font-display text-3xl font-black uppercase text-white">{P.sendTitle}</h2>
            <ContactForm />
          </div>
        </Reveal>
      </section>
    </main>
  );
}
