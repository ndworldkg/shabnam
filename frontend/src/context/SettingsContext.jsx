import { createContext, useContext, useEffect, useState } from "react";
import { api, asList } from "@/lib/api";

const Ctx = createContext({ settings: {}, categories: [], reload: () => {} });

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState({ company_name: "Shabnam Elegant" });
  const [categories, setCategories] = useState([]);
  const reload = () => {
    api.get("/settings").then((r) => setSettings(r.data || {})).catch(() => {});
    api.get("/categories").then((r) => setCategories(asList(r.data))).catch(() => {});
  };
  useEffect(() => {
    reload();
  }, []);
  return <Ctx.Provider value={{ settings, categories, reload }}>{children}</Ctx.Provider>;
};

export const useSite = () => useContext(Ctx);
