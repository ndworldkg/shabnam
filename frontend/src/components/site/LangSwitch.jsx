import { LANGS } from "@/i18n/dict";
import { useLang } from "@/i18n/LangContext";

export const LangSwitch = ({ className = "", id = "desktop" }) => {
  const { lang, setLang } = useLang();
  return (
    <div className={`flex rounded-full border border-white/15 p-1 ${className}`} data-testid={`lang-switch-${id}`}>
      {LANGS.map((l) => (
        <button key={l.code} onClick={() => setLang(l.code)} title={l.name} data-testid={`lang-${l.code}-${id}`}
          className={`rounded-full px-3 py-1.5 font-mono text-xs font-bold tracking-wider transition-colors duration-300 ${lang === l.code ? "bg-[#FACC15] text-[#0B0F17]" : "text-slate-300 hover:text-white"}`}>
          {l.label}
        </button>
      ))}
    </div>
  );
};
