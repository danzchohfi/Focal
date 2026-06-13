import type { Metadata } from "next";
import LeadForm from "@/components/LeadForm";
import WhatsAppCta from "@/components/WhatsAppCta";

export const metadata: Metadata = {
  title: "Área de clientes",
  description:
    "Assistência técnica, manuais do proprietário e documentos do seu imóvel Focal.",
};

export default function ClientesPage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-16">
      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#7fb89a]">
        Área de clientes
      </p>
      <h1 className="mt-3 text-4xl font-bold tracking-tight md:text-5xl">
        Você comprou. A gente continua aqui.
      </h1>
      <p className="mt-4 max-w-xl text-[#a3a39c]">
        Entrega impecável inclui o pós-entrega: assistência técnica, manuais do
        proprietário e segunda via de documentos.
      </p>

      <div className="mt-12 grid gap-12 lg:grid-cols-2">
        <div className="space-y-8">
          <div className="border-l-2 border-[#3e7c5b] pl-5">
            <h2 className="text-lg font-bold">Assistência técnica</h2>
            <p className="mt-2 text-sm leading-relaxed text-[#a3a39c]">
              Abra um chamado pelo formulário informando empreendimento e
              unidade, ou fale direto no WhatsApp.
            </p>
          </div>
          <div className="border-l-2 border-[#3e7c5b] pl-5">
            <h2 className="text-lg font-bold">Manuais e documentos</h2>
            <p className="mt-2 text-sm leading-relaxed text-[#a3a39c]">
              Manual do proprietário, plantas e documentos do seu imóvel —
              solicite a segunda via pelo formulário.
            </p>
          </div>
          <WhatsAppCta intencao="assistência técnica" posicao="clientes">
            Falar com o pós-entrega
          </WhatsAppCta>
        </div>
        <LeadForm intencaoInicial="cliente" />
      </div>
    </div>
  );
}
