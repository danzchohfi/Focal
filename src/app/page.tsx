import HomeHero from "@/components/HomeHero";
import ProjectsSection from "@/components/ProjectsSection";
import Reveal from "@/components/Reveal";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";
import StatsBand from "@/components/StatsBand";
import { asset } from "@/lib/asset";

export default function Home() {
  return (
    <>
      <SiteHeader tone="escuro" heroMenu />
      <main>
        <HomeHero />
        <ProjectsSection />
        <StatsBand />

        {/* Focamos no que importa */}
        <section className="bg-[#C9AD96] text-[#53381E]">
          <div className="grid grid-cols-1 lg:min-h-[820px] lg:grid-cols-[3fr_2fr]">
            <div className="p-6 lg:p-12">
              <div
                className="h-full min-h-[380px] rounded-lg bg-cover bg-center lg:min-h-[calc(100%)]"
                style={{ backgroundImage: `url(${asset("/wp/facilities-piscina-2.jpg")})` }}
                role="img"
                aria-label="Rooftop com piscina de empreendimento Focal"
              />
            </div>
            <div className="flex flex-col justify-center px-6 py-16 md:py-20 lg:pl-24 lg:pr-16 xl:pl-28">
              <Reveal>
                <h6 className="kicker opacity-70">Focamos no que importa</h6>
                <h2 className="din h-section mt-5">
                  + 500MM
                  <br />
                  VENDIDOS
                </h2>
                <div className="mt-9 max-w-[60ch] space-y-6 text-[16px] leading-[1.8] opacity-90">
                  <p>
                    Somos fascinados pela arquitetura pois acreditamos na sua capacidade de criar
                    experiências singulares e nos inspirar a uma vida melhor.
                  </p>
                  <p>
                    Por isso investimos em fachadas e plantas inovadoras, capazes de redefinir o
                    espaço e surpreender nossos clientes com uma infinidade de detalhes.
                  </p>
                  <p>Focamos naquilo que realmente importa.</p>
                  <p>Essa é a nossa essência. Somos a focal.</p>
                </div>
              </Reveal>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
