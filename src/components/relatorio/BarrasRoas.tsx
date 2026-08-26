import type { LinhaRelatorio } from "@/lib/roas/tipos";
import { multiplicador, reaisCurto } from "@/lib/roas/formato";
import { corDaPlataforma, NOME_PLATAFORMA } from "./paleta";

/**
 * Ranking de ROAS por origem, em barras horizontais.
 *
 * Barras horizontais porque o rótulo é longo (plataforma · campanha · grupo ·
 * anúncio) e não caberia num eixo vertical. Uma medida só: investimento e VGV
 * ficam na tabela — dois eixos no mesmo gráfico mentem sobre a proporção.
 * As barras partem do zero e cada uma leva rótulo direto, então a leitura não
 * depende de cor nem de hover.
 */
export default function BarrasRoas({
  linhas,
  titulo = "ROAS por origem",
  limite = 12,
}: {
  linhas: LinhaRelatorio[];
  titulo?: string;
  limite?: number;
}) {
  const ranking = linhas
    .filter((linha) => linha.investimento > 0)
    .sort((a, b) => (b.roas ?? 0) - (a.roas ?? 0))
    .slice(0, limite);

  if (!ranking.length) {
    return (
      <p className="text-[14px] text-black/60">
        Ainda não há investimento com origem identificada neste período.
      </p>
    );
  }

  const maximo = Math.max(...ranking.map((linha) => linha.roas ?? 0), 0.001);
  const plataformas = [...new Set(ranking.map((linha) => linha.plataforma))];
  const ocultas = linhas.filter((linha) => linha.investimento > 0).length - ranking.length;

  return (
    <figure className="m-0">
      <figcaption className="mb-3 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
        <h3 className="din text-[17px] text-ink">{titulo}</h3>
        <p className="text-[13px] text-black/55">Receita atribuída ÷ investimento</p>
      </figcaption>

      {plataformas.length > 1 && (
        <ul className="mb-4 flex flex-wrap gap-x-5 gap-y-1 text-[13px] text-black/70">
          {plataformas.map((plataforma) => (
            <li key={plataforma} className="flex items-center gap-2">
              <span
                aria-hidden
                className="inline-block h-2.5 w-2.5 rounded-[2px]"
                style={{ background: corDaPlataforma(plataforma) }}
              />
              {NOME_PLATAFORMA[plataforma] ?? plataforma}
            </li>
          ))}
        </ul>
      )}

      <ul className="space-y-3">
        {ranking.map((linha) => {
          const largura = Math.max(((linha.roas ?? 0) / maximo) * 100, 0.6);
          return (
            <li key={linha.chave}>
              <div className="flex items-baseline justify-between gap-4 text-[13px]">
                <span className="min-w-0 truncate text-black/75" title={linha.rotulo}>
                  {linha.rotulo}
                </span>
                <span className="shrink-0 tabular-nums text-ink">
                  {multiplicador(linha.roas)}
                  <span className="ml-2 font-normal text-black/45">
                    {reaisCurto(linha.investimento)}
                  </span>
                </span>
              </div>
              <div className="mt-1 h-2.5 w-full bg-black/[0.05]">
                <div
                  className="h-full rounded-r-[4px]"
                  style={{ width: `${largura}%`, background: corDaPlataforma(linha.plataforma) }}
                  title={`${linha.rotulo} · ROAS ${multiplicador(linha.roas)} · investido ${reaisCurto(
                    linha.investimento
                  )} · VGV ${reaisCurto(linha.vgv)}`}
                />
              </div>
            </li>
          );
        })}
      </ul>

      {ocultas > 0 && (
        <p className="mt-4 text-[12px] text-black/50">
          Mostrando as {ranking.length} maiores de {ranking.length + ocultas} origens com
          investimento. As demais estão na tabela abaixo.
        </p>
      )}
    </figure>
  );
}
