import axios from "axios";

export const BACKEND = process.env.REACT_APP_BACKEND_URL;
export const api = axios.create({ baseURL: `${BACKEND}/api`, withCredentials: true });
export const img = (u) => (!u ? "" : u.startsWith("/api") ? `${BACKEND}${u}` : u);
export const asList = (d) => (Array.isArray(d) ? d : []);
export const errMsg = (e, fallback = "Bir hata oluştu") => e?.response?.data?.detail?.toString?.() || fallback;
export const EASE = [0.16, 1, 0.3, 1];
