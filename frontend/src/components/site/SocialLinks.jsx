import { Instagram, Facebook } from "lucide-react";
import { useSite } from "@/context/SettingsContext";

const TelegramIcon = (p) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...p}><path d="M21.94 4.3 18.7 19.6c-.24 1.08-.88 1.35-1.78.84l-4.93-3.63-2.38 2.29c-.26.26-.48.48-.99.48l.35-5.02 9.14-8.26c.4-.35-.09-.55-.62-.2L6.2 13.2 1.33 11.68c-1.06-.33-1.08-1.06.22-1.57L20.6 2.77c.88-.33 1.65.2 1.34 1.53Z" /></svg>
);
const TikTokIcon = (p) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...p}><path d="M16.6 2h-3.4v13.4a2.9 2.9 0 1 1-2.9-2.9c.3 0 .6 0 .9.1V9.1a6.4 6.4 0 1 0 5.4 6.3V8.6a8 8 0 0 0 4.7 1.5V6.7a4.7 4.7 0 0 1-4.7-4.7Z" /></svg>
);

export const SOCIALS = [
  { k: "instagram", label: "Instagram", Icon: Instagram },
  { k: "telegram", label: "Telegram", Icon: TelegramIcon },
  { k: "facebook", label: "Facebook", Icon: Facebook },
  { k: "tiktok", label: "TikTok", Icon: TikTokIcon },
];

const href = (k, v) => {
  const s = (v || "").trim();
  if (!s) return "";
  if (/^https?:\/\//i.test(s)) return s;
  const h = s.replace(/^@/, "");
  return { instagram: `https://instagram.com/${h}`, telegram: `https://t.me/${h}`, facebook: `https://facebook.com/${h}`, tiktok: `https://www.tiktok.com/@${h}` }[k];
};

export const SocialLinks = ({ id = "footer", className = "" }) => {
  const { settings } = useSite();
  return (
    <div className={`flex flex-wrap gap-3 ${className}`} data-testid={`social-links-${id}`}>
      {SOCIALS.map(({ k, label, Icon }) => {
        const url = href(k, settings?.[k]);
        const cls = "flex h-11 w-11 items-center justify-center rounded-full border transition-[background-color,border-color,color,transform] duration-300";
        return url ? (
          <a key={k} href={url} target="_blank" rel="noreferrer" aria-label={label} title={label} data-testid={`social-${id}-${k}`}
            className={`${cls} border-white/15 text-white hover:-translate-y-0.5 hover:border-[#F2962B] hover:bg-[#F2962B]`}><Icon className="h-5 w-5" /></a>
        ) : (
          <span key={k} aria-label={label} title={label} data-testid={`social-${id}-${k}`} aria-disabled="true"
            className={`${cls} cursor-default border-white/10 text-slate-500`}><Icon className="h-5 w-5" /></span>
        );
      })}
    </div>
  );
};
