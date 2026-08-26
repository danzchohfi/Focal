import type { Cobertura as DadosCobertura } from "@/lib/roas/tipos";
import { inteiro, percentual, reais } from "@/lib/roas/formato";

/**
 * Painel de cobertura.
 *
 * Existe porque atribuição que esconde o próprio buraco vira ficção: se metade
 * das vendas não tem origem identificada, o ROAS das que têm está inflado. Este
 * bloco é o que permite ler o resto do relatório com o desconto certo.
 */
export default function Cobertura({ dados }: { dados: DadosCobertura }) {
  const taxa = (a: number, b: number) => (b > 0 ? a / b : undefined);
  const semVinculo = dados.porMetodo.sem_correspondencia;

  const metodos = [
    { rotulo: "pelo código no WhatsApp", valor: dados.porMetodo.ref, forte: true },
    { rotulo: "por telefone", valor: dados.porMetodo.telefone },
    { rotulo: "por e-mail", valor: dados.porMetodo.email },
    { rotulo: "manual", valor: dados.porMetodo.manual },
    { rotulo: "sem vínculo", valor: semVinculo, alerta: true },
  ].filter((item) => item.valor > 0);

  return (
    <section className="rounded-[8px] border border-black/10 bg-white p-5">
      <h3 className="din text-[17px] text-ink">Cobertura da atribuição</h3>
      <p className="mt-1 max-w-[70ch] text-[13px] leading-[1.6] text-black/60">
        Quanto do funil o relatório realmente enxerga. O que não tem vínculo com um
        clique fica de fora do ROAS acima — nunca é redistribuído entre as campanhas.
      </p>

      {/* Duas colunas fixas: o painel vive numa coluna estreita ao lado do
          gráfico, e um valor em reais não cabe em quatro colunas ali. */}
      <dl className="mt-4 grid grid-cols-2 gap-x-6 gap-y-4">
        <div>
          <dt className="text-[12px] uppercase tracking-wide text-black/50">Leads no período</dt>
          <dd className="din mt-0.5 text-[22px] text-ink">{inteiro(dados.jornadas)}</dd>
        </div>
        <div>
          <dt className="text-[12px] uppercase tracking-wide text-black/50">Com origem</dt>
          <dd className="din mt-0.5 text-[22px] text-ink">
            {percentual(taxa(dados.conciliadas, dados.jornadas))}
          </dd>
        </div>
        <div>
          <dt className="text-[12px] uppercase tracking-wide text-black/50">Vendas atribuídas</dt>
          <dd className="din mt-0.5 text-[22px] text-ink">
            {inteiro(dados.vendasConciliadas)}
            <span className="text-[15px] text-black/45"> / {inteiro(dados.vendas)}</span>
          </dd>
        </div>
        <div>
          <dt className="text-[12px] uppercase tracking-wide text-black/50">VGV atribuído</dt>
          <dd className="din mt-0.5 text-[22px] text-ink">{reais(dados.vgvConciliado)}</dd>
        </div>
      </dl>

      {metodos.length > 0 && (
        <ul className="mt-5 flex flex-wrap gap-x-6 gap-y-2 text-[13px] text-black/70">
          {metodos.map((metodo) => (
            <li key={metodo.rotulo}>
              <span
                className={`tabular-nums ${metodo.alerta ? "text-[#9A3412]" : "text-ink"} font-semibold`}
              >
                {inteiro(metodo.valor)}
              </span>{" "}
              {metodo.rotulo}
            </li>
          ))}
        </ul>
      )}

      {dados.investimentoSemJornada > 0 && (
        <p className="mt-4 rounded-[4px] border border-[#C2710C]/30 bg-[#C2710C]/[0.07] px-3 py-2 text-[13px] text-[#7C4A08]">
          <strong className="font-semibold">{reais(dados.investimentoSemJornada)}</strong> investidos
          em origens que não geraram nenhum lead rastreado no período. Pode ser mídia sem
          resultado — ou tagueamento faltando na campanha.
        </p>
      )}
    </section>
  );
}
