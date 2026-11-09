import { useSearchParams } from "react-router-dom";
import { PageHeader } from "@/components/site/PageHeader";
import { QuoteForm } from "@/components/site/QuoteForm";
import { Reveal } from "@/components/site/Reveal";
import { useLang } from "@/i18n/LangContext";

export default function Quote() {
  const [params] = useSearchParams();
  const { t, lang } = useLang();
  const Q = t.quotePage;
  return (
    <main data-testid="quote-page">
      <PageHeader key={lang} eyebrow={Q.eyebrow} lines={Q.lines} />
      <section className="mx-auto grid max-w-[1400px] gap-12 px-5 py-16 sm:px-8 md:py-24 lg:grid-cols-12">
        <Reveal className="lg:col-span-4">
          <ol className="space-y-6">
            {Q.notes.map((n, i) => (
              <li key={n} className="flex gap-5 border-t border-white/10 pt-6">
                <span className="font-display text-3xl font-black text-[#FACC15]">0{i + 1}</span>
                <span className="pt-2 text-slate-200">{n}</span>
              </li>
            ))}
          </ol>
        </Reveal>
        <Reveal className="lg:col-span-8" delay={0.1}>
          <div className="rounded-[24px] border border-white/10 bg-[#131924] p-6 md:p-10"><QuoteForm defaultProductId={params.get("urun") || ""} /></div>
        </Reveal>
      </section>
    </main>
  );
}
