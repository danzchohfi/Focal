import type { Metadata } from "next";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Política de Privacidade e Segurança",
  description: "Como a Focal Inc coleta, usa e protege seus dados pessoais.",
};

export default function PrivacidadePage() {
  return (
    <div className="mx-auto w-full max-w-3xl px-5 py-16">
      <h1 className="text-4xl font-bold tracking-tight">
        Política de Privacidade e Segurança
      </h1>
      <div className="prose-invert mt-8 space-y-6 text-sm leading-relaxed text-[#a3a39c]">
        <p>
          A Focal Incorporadora e Desenvolvimento Imobiliário Ltda (CNPJ{" "}
          {site.cnpj}) respeita a sua privacidade e trata dados pessoais em
          conformidade com a Lei Geral de Proteção de Dados (Lei nº 13.709/2018).
        </p>
        <h2 className="text-lg font-bold text-white">Quais dados coletamos</h2>
        <p>
          Coletamos os dados que você informa em nossos formulários (nome,
          e-mail, telefone e mensagem) e dados de navegação (páginas visitadas e
          origem de campanha) por meio de cookies e ferramentas de análise, sempre
          mediante consentimento.
        </p>
        <h2 className="text-lg font-bold text-white">Para que usamos</h2>
        <p>
          Exclusivamente para atendimento comercial, relacionamento com clientes,
          parcerias e melhoria do site. Não vendemos nem compartilhamos seus
          dados com terceiros para fins de marketing.
        </p>
        <h2 className="text-lg font-bold text-white">Segurança</h2>
        <p>
          Mantemos estrutura de software, firewall e controles de acesso para
          preservar a confidencialidade, a integridade e a segurança das suas
          informações.
        </p>
        <h2 className="text-lg font-bold text-white">Seus direitos</h2>
        <p>
          Você pode solicitar acesso, correção ou exclusão dos seus dados a
          qualquer momento pelo e-mail{" "}
          <a href={`mailto:${site.email}`} className="text-[#7fb89a] underline">
            {site.email}
          </a>
          .
        </p>
      </div>
    </div>
  );
}
