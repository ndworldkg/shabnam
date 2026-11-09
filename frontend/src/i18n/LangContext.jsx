import { createContext, useContext, useEffect, useState } from "react";
import { DICT } from "@/i18n/dict";

const detect = () => {
  const saved = localStorage.getItem("lang");
  if (saved && DICT[saved]) return saved;
  return (navigator.language || "").toLowerCase().startsWith("uz") ? "uz" : "ru";
};

const Ctx = createContext({ lang: "ru", setLang: () => {}, t: DICT.ru, loc: () => "" });

export const LangProvider = ({ children }) => {
  const [lang, setLangState] = useState(detect);
  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);
  const setLang = (l) => {
    localStorage.setItem("lang", l);
    setLangState(l);
  };
  const loc = (obj, key) => obj?.i18n?.[lang]?.[key] || obj?.[key];
  return <Ctx.Provider value={{ lang, setLang, t: DICT[lang], loc }}>{children}</Ctx.Provider>;
};

export const useLang = () => useContext(Ctx);
