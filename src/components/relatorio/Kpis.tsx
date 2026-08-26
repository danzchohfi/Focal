import type { LinhaRelatorio, Relatorio } from "@/lib/roas/tipos";
import { inteiro, multiplicador, numero, reais } from "@/lib/roas/formato";

type Tile = { rotulo: string; valor: string; nota?: string; destaque?: boolean };

function tiles(total: LinhaRelatorio, relatorio: Relatorio): Tile[] {
  const { fracaoReceita } = relatorio.opcoes;
  return [
    { rotulo: "Investido", valor: reais(total.investimento) },
    { rotulo: "Leads", valor: numero(total.leads), nota: `${reais(total.cpl)} por lead` },
    {
      rotulo: "Leads qualificados",
      valor: numero(total.qualificados),
      nota: `${reais(total.cplQualificado)} por qualificado`,
    },
    {
      rotulo: "Vendas",
      valor: numero(total.vendas),
      nota: total.cac ? `${reais(total.cac)} de CAC` : undefined,
    },
    {
      rotulo: fracaoReceita === 1 ? "VGV atribuído" : "Receita atribuída",
      valor: reais(fracaoReceita === 1 ? total.vgv : total.receita),
      nota: total.ticketMedio ? `ticket ${reais(total.ticketMedio)}` : undefined,
    },
    {
      rotulo: "ROAS",
      valor: multiplicador(total.roas),
      nota: total.diasAteVenda ? `ciclo de ${inteiro(total.diasAteVenda)} dias` : undefined,
      destaque: true,
    },
  ];
}

/** Números-cabeçalho do período. Não é gráfico: é a resposta direta. */
export default function Kpis({ relatorio }: { relatorio: Relatorio }) {
  return (
    <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-[8px] border border-black/10 bg-black/10 sm:grid-cols-3 lg:grid-cols-6">
      {tiles(relatorio.total, relatorio).map((tile) => (
        <div key={tile.rotulo} className="bg-white px-4 py-4">
          <dt className="text-[12px] uppercase tracking-wide text-black/50">{tile.rotulo}</dt>
          <dd
            className={`din mt-1 tabular-nums ${
              tile.destaque ? "text-[30px] text-verde" : "text-[24px] text-ink"
            }`}
          >
            {tile.valor}
          </dd>
          {tile.nota && <p className="mt-0.5 text-[12px] text-black/50">{tile.nota}</p>}
        </div>
      ))}
    </dl>
  );
}
