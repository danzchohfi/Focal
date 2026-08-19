import type { Metadata } from "next";
import FocamosSection from "@/components/FocamosSection";
import HomeHero from "@/components/HomeHero";
import ProjectsSection from "@/components/ProjectsSection";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";
import StatsBand from "@/components/StatsBand";

export const metadata: Metadata = {
  title: "Focal Inc — Home (versão E, sem vídeo)",
  // Variante de comparação interna: fora do índice; a home oficial é /.
  robots: { index: false, follow: false },
  alternates: { canonical: "/" },
};

// Versão E da home: idêntica à oficial, exceto o hero — sem o vídeo de
// drone, com a composição tipográfica sobre a torre em linhas. Existe para
// comparar com/sem o drone antes de decidir.
export default function HomeE() {
  return (
    <>
      <SiteHeader tone="escuro" heroMenu />
      <main>
        <HomeHero comVideo={false} />
        <ProjectsSection />
        <StatsBand />
        <FocamosSection />
      </main>
      <SiteFooter />
    </>
  );
}
