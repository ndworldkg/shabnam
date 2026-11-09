import { FileDown } from "lucide-react";
import { BACKEND } from "@/lib/api";
import { useLang } from "@/i18n/LangContext";

export const CatalogDownload = ({ testid = "catalog-pdf-download", className = "" }) => {
  const { t, lang } = useLang();
  return (
    <a href={`${BACKEND}/api/catalog.pdf?lang=${lang}`} download data-testid={testid}
      className={`group inline-flex items-center gap-3 rounded-full border border-[#FACC15]/60 px-6 py-3 text-sm font-semibold text-[#FACC15] transition-[background-color,color] duration-300 hover:bg-[#FACC15] hover:text-[#0B0F17] ${className}`}>
      <FileDown className="h-4 w-4 transition-transform duration-300 group-hover:translate-y-0.5" /> {t.catalog.pdf}
    </a>
  );
};
