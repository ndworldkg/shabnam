import axios from "axios";
import { trErr } from "@/pages/admin/adminI18n";

export const BACKEND = process.env.REACT_APP_BACKEND_URL;
export const api = axios.create({ baseURL: `${BACKEND}/api`, withCredentials: true });

api.interceptors.response.use(undefined, async (error) => {
  const cfg = error?.config;
  if (error?.response?.status === 401 && cfg && !cfg._retried && !cfg.url?.startsWith("/auth/")) {
    cfg._retried = true;
    try {
      await api.post("/auth/refresh");
      return api(cfg);
    } catch (e) {
      return Promise.reject(error);
    }
  }
  return Promise.reject(error);
});

const detailText = (d) => (typeof d === "string" ? d : Array.isArray(d) ? d.map((x) => x?.msg).filter(Boolean).join(" ") : d?.msg);
export const img = (u) => (!u ? "" : u.startsWith("/api") ? `${BACKEND}${u}` : u);
export const asList = (d) => (Array.isArray(d) ? d : []);
export const errMsg = (e, fallback = "Bir hata oluştu") => trErr(detailText(e?.response?.data?.detail) || fallback);
export const EASE = [0.16, 1, 0.3, 1];
