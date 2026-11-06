export const LogoMark = ({ className = "h-9 w-9" }) => (
  <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
    <rect width="48" height="48" rx="11" fill="#0B0F17" stroke="rgba(255,255,255,.14)" />
    <path d="M9 11h9l6 7 6-7h9L24 28z" fill="#FF5722" />
    <rect x="9" y="31" width="30" height="5" rx="1" fill="#FACC15" />
    <rect x="9" y="38.5" width="30" height="1.6" fill="#FACC15" opacity=".55" />
  </svg>
);

export const Logo = ({ name = "Shabnam Elegant" }) => {
  const [first, ...rest] = name.split(" ");
  return (
    <span className="flex items-center gap-3">
      <LogoMark />
      <span className="leading-none">
        <span className="block font-display text-[17px] font-extrabold uppercase tracking-tight text-white">{first}</span>
        <span className="block font-mono text-[10px] uppercase tracking-[0.35em] text-[#FF8A65]">{rest.join(" ") || "Workwear"}</span>
      </span>
    </span>
  );
};
