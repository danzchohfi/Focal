import type { LinhaRelatorio } from "@/lib/roas/tipos";
import { dias, inteiro, multiplicador, numero, percentual, reais } from "@/lib/roas/formato";
import { corDaPlataforma } from "./paleta";

type Coluna = {
  titulo: string;
  ajuda?: string;
  valor: (linha: LinhaRelatorio) => string;
  numerica?: boolean;
};

const COLUNAS: Coluna[] = [
  { titulo: "Investido", valor: (l) => reais(l.investimento), numerica: true },
  { titulo: "Cliques", valor: (l) => inteiro(l.cliques), numerica: true },
  { titulo: "Leads", valor: (l) => numero(l.leads), numerica: true },
  {
    titulo: "Qualificados",
    ajuda: "Leads que chegaram pelo menos até a etapa de qualificação",
    valor: (l) => numero(l.qualificados),
    numerica: true,
  },
  { titulo: "Visitas", valor: (l) => numero(l.visitas), numerica: true },
  { titulo: "Vendas", valor: (l) => numero(l.vendas), numerica: true },
  { titulo: "VGV", ajuda: "Soma do valor dos contratos", valor: (l) => reais(l.vgv), numerica: true },
  { titulo: "CPL", valor: (l) => reais(l.cpl), numerica: true },
  {
    titulo: "CPL qualificado",
    ajuda: "Investimento ÷ leads qualificados",
    valor: (l) => reais(l.cplQualificado),
    numerica: true,
  },
  { titulo: "CAC", ajuda: "Investimento ÷ vendas", valor: (l) => reais(l.cac), numerica: true },
  { titulo: "ROAS", valor: (l) => multiplicador(l.roas), numerica: true },
  { titulo: "Conv. venda", valor: (l) => percentual(l.taxaVenda), numerica: true },
  {
    titulo: "Ciclo",
    ajuda: "Mediana de dias entre o clique e a venda",
    valor: (l) => dias(l.diasAteVenda),
    numerica: true,
  },
];

export default function TabelaRoas({
  linhas,
  total,
}: {
  linhas: LinhaRelatorio[];
  total: LinhaRelatorio;
}) {
  return (
    // A rolagem sangra até a borda do cartão: cortar a tabela dentro do
    // padding parece defeito, sangrando parece o que é — uma tabela larga.
    <div className="-mx-5 w-[calc(100%+2.5rem)] overflow-x-auto px-5">
      <table className="w-full min-w-[1080px] border-collapse text-[13px]">
        <caption className="sr-only">
          Investimento, funil e retorno por origem de mídia
        </caption>
        <thead>
          <tr className="border-b border-black/15 text-left align-bottom">
            <th scope="col" className="py-2 pr-4 font-semibold text-ink">
              Origem
            </th>
            {COLUNAS.map((coluna) => (
              <th
                key={coluna.titulo}
                scope="col"
                title={coluna.ajuda}
                className="whitespace-nowrap py-2 pl-4 text-right font-semibold text-ink"
              >
                {coluna.titulo}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {linhas.map((linha) => (
            <tr key={linha.chave} className="border-b border-black/[0.07]">
              <th scope="row" className="max-w-[380px] py-2 pr-4 text-left font-normal">
                <span className="flex min-w-0 items-baseline gap-2">
                  <span
                    aria-hidden
                    className="inline-block h-2 w-2 shrink-0 rounded-[2px]"
                    style={{ background: corDaPlataforma(linha.plataforma) }}
                  />
                  <span className="truncate text-black/80" title={linha.rotulo}>
                    {linha.rotulo}
                  </span>
                </span>
              </th>
              {COLUNAS.map((coluna) => (
                <td
                  key={coluna.titulo}
                  className="whitespace-nowrap py-2 pl-4 text-right tabular-nums text-black/80"
                >
                  {coluna.valor(linha)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="border-t-2 border-black/20">
            <th scope="row" className="py-2 pr-4 text-left font-semibold text-ink">
              Total
            </th>
            {COLUNAS.map((coluna) => (
              <td
                key={coluna.titulo}
                className="whitespace-nowrap py-2 pl-4 text-right font-semibold tabular-nums text-ink"
              >
                {coluna.valor(total)}
              </td>
            ))}
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
