import { Reveal, Eyebrow } from "@/components/site/Reveal";
import { useLang } from "@/i18n/LangContext";

const COLORS = ["#FF5722", "#FACC15", "#60A5FA", "#34D399"];

export const Process = () => {
  const { t } = useLang();
  const p = t.process;
  return (
  <section className="mx-auto max-w-[1400px] px-5 py-24 sm:px-8 md:py-36" data-testid="process-section">
    <div className="grid gap-14 lg:grid-cols-12">
      <div className="lg:col-span-4">
        <div className="lg:sticky lg:top-32">
          <Reveal>
            <Eyebrow color="#FACC15">{p.eyebrow}</Eyebrow>
            <h2 className="font-display text-4xl font-black uppercase leading-[0.95] tracking-tight text-white sm:text-5xl">{p.t1}<br />{p.t2}</h2>
          </Reveal>
        </div>
      </div>
      <div className="lg:col-span-8">
        {p.steps.map((s, i) => (
          <Reveal key={s.t} delay={0.05}>
            <div className="group grid grid-cols-[auto,1fr] gap-6 border-t border-white/10 py-10 md:gap-12" data-testid={`process-step-${i + 1}`}>
              <span className="font-display text-5xl font-black md:text-7xl" style={{ color: COLORS[i] }}>{String(i + 1).padStart(2, "0")}</span>
              <div>
                <h3 className="font-display text-2xl font-bold uppercase text-white md:text-4xl">{s.t}</h3>
                <p className="mt-3 max-w-lg text-slate-300">{s.d}</p>
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </div>
  </section>
  );
};
