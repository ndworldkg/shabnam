import { useLang } from "@/i18n/LangContext";

export const formatSom = (n) => Math.round(Number(n) || 0).toLocaleString("ru-RU").replace(/\u00a0|,/g, " ");

export const Price = ({ p, className = "", testid }) => {
  const { t } = useLang();
  if (!p?.show_price || !p?.price_from) return null;
  return <p className={className} data-testid={testid || `product-price-${p.id}`}>{t.price(formatSom(p.price_from))}</p>;
};
