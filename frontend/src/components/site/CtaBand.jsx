import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import { Reveal } from "@/components/site/Reveal";

export const CtaBand = () => (
  <section className="px-5 pb-24 sm:px-8 md:pb-36" data-testid="cta-band">
    <Reveal>
      <div className="relative mx-auto max-w-[1400px] overflow-hidden rounded-[28px] bg-[#FACC15] px-6 py-16 md:px-16 md:py-24">
        <div className="absolute -right-10 top-10 h-8 w-[60%] -rotate-6 bg-[#0B0F17]" />
        <div className="absolute -right-10 top-24 h-2 w-[50%] -rotate-6 bg-[#0B0F17]/70" />
        <h2 className="relative max-w-3xl font-display text-4xl font-black uppercase leading-[0.92] tracking-tight text-[#0B0F17] sm:text-6xl lg:text-7xl">
          Ekibinize özel teklif, tek formda.
        </h2>
        <div className="relative mt-10 flex flex-wrap gap-3">
          <Link to="/teklif" data-testid="cta-quote-btn"
            className="group inline-flex items-center gap-3 rounded-full bg-[#0B0F17] px-8 py-4 font-semibold text-white transition-transform duration-300 hover:-translate-y-1">
            Teklif Formu <ArrowUpRight className="h-5 w-5 transition-transform duration-300 group-hover:rotate-45" />
          </Link>
          <Link to="/iletisim" data-testid="cta-contact-btn" className="inline-flex items-center rounded-full border-2 border-[#0B0F17] px-8 py-4 font-semibold text-[#0B0F17] transition-colors duration-300 hover:bg-[#0B0F17] hover:text-white">
            Bize Ulaşın
          </Link>
        </div>
      </div>
    </Reveal>
  </section>
);
