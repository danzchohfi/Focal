import FocamosSection from "@/components/FocamosSection";
import HomeHero from "@/components/HomeHero";
import ProjectsSection from "@/components/ProjectsSection";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";
import StatsBand from "@/components/StatsBand";

export default function Home() {
  return (
    <>
      <SiteHeader tone="escuro" heroMenu />
      <main>
        <HomeHero />
        <ProjectsSection />
        <StatsBand />
        <FocamosSection />
      </main>
      <SiteFooter />
    </>
  );
}
