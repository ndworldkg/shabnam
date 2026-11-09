export const LogoMark = ({ className = "h-9 w-auto" }) => (
  <img src="/logo-mark.png" alt="" aria-hidden="true" className={`${className} select-none object-contain`} draggable={false} />
);

export const Logo = ({ name = "Shabnam Elegant" }) => {
  const [first, ...rest] = name.split(" ");
  return (
    <span className="flex items-center gap-2.5 sm:gap-3" aria-label={name}>
      <LogoMark className="h-8 w-auto sm:h-9" />
      <span className="font-brand flex flex-col text-[11px] font-semibold uppercase leading-[1.15] tracking-[0.14em] text-[#F2962B] sm:flex-row sm:gap-[0.4em] sm:whitespace-nowrap sm:text-[15px] sm:leading-none">
        <span>{first}</span>{rest.length > 0 && <span>{rest.join(" ")}</span>}
      </span>
    </span>
  );
};
