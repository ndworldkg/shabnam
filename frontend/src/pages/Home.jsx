import { Hero } from "@/components/site/Hero";
import { Marquee } from "@/components/site/Marquee";
import { CategoryBento } from "@/components/site/CategoryBento";
import { FeaturedProducts } from "@/components/site/FeaturedProducts";
import { Process } from "@/components/site/Process";
import { CtaBand } from "@/components/site/CtaBand";

export default function Home() {
  return (
    <main data-testid="home-page">
      <Hero />
      <Marquee />
      <CategoryBento />
      <FeaturedProducts />
      <Process />
      <CtaBand />
    </main>
  );
}
