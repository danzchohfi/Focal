import type { Metadata } from "next";
import { notFound } from "next/navigation";
import BarrasRoas from "@/components/relatorio/BarrasRoas";
import Cobertura from "@/components/relatorio/Cobertura";
import Kpis from "@/components/relatorio/Kpis";
import TabelaRoas from "@/components/relatorio/TabelaRoas";
import { repositorio } from "@/lib/dados/repositorio";
import { montaRelatorio } from "@/lib/roas/relatorio";
import { janelaRecente } from "@/lib/roas/sincronizacao";
import { dataCurta, percentual } from "@/lib/roas/formato";
import type { BaseTemporal, Dimensao, Maturidade, ModeloAtribuicao } from "@/lib/roas/tipos";

// O painel lê o banco a cada acesso — ler `searchParams` já marca a rota como
// dinâmica. No build estático (GitHub Pages) não há servidor, e a página sai do
// forno como um aviso, antes de tocar em qualquer dado.
const ESTATICO = process.env.STATIC_EXPORT === "1";

export const metadata: Metadata = {
  title: "ROAS",
  robots: { index: false, follow: false },
};

const DIMENSOES: { valor: Dimensao; rotulo: string }[] = [
  { valor: "plataforma", rotulo: "Canal (Google / Meta)" },
  { valor: "campanha", rotulo: "Campanha" },
  { valor: "grupo", rotulo: "Grupo de anúncios" },
  { valor: "anuncio", rotulo: "Anúncio" },
  { valor: "palavra_chave", rotulo: "Palavra-chave" },
];

const MODELOS: { valor: ModeloAtribuicao; rotulo: string }[] = [
  { valor: "ultimo", rotulo: "Último clique pago" },
  { valor: "primeiro", rotulo: "Primeiro clique pago" },
  { valor: "linear", rotulo: "Linear (dividido)" },
];

const BASES: { valor: BaseTemporal; rotulo: string }[] = [
  { valor: "clique", rotulo: "Data do clique (coorte)" },
  { valor: "evento", rotulo: "Data da venda" },
];

type Busca = Record<string, string | string[] | undefined>;

function texto(busca: Busca, chave: string) {
  const valor = busca[chave];
  return Array.isArray(valor) ? valor[0] : valor;
}

const rotuloCampo = "block text-[12px] uppercase tracking-wide text-black/50";
const campo =
  "mt-1 w-full rounded-[4px] border border-black/15 bg-white px-3 py-2 text-[14px] text-ink outline-none focus:border-verde focus:ring-2 focus:ring-verde/25";

export default async function PaginaRoas({ searchParams }: { searchParams: Promise<Busca> }) {
  if (ESTATICO) return <AvisoEstatico />;

  const busca = await searchParams;
  const chave = process.env.RELATORIO_TOKEN;
  if (chave && texto(busca, "k") !== chave) notFound();

  const padrao = janelaRecente(90);
  const de = texto(busca, "de") ?? padrao.de;
  const ate = texto(busca, "ate") ?? padrao.ate;
  const dimensao = (texto(busca, "dimensao") as Dimensao) ?? "campanha";
  const modelo = (texto(busca, "modelo") as ModeloAtribuicao) ?? "ultimo";
  const base = (texto(busca, "base") as BaseTemporal) ?? "clique";
  const receita = Number(texto(busca, "receita") ?? 1);

  const banco = repositorio();
  const [toques, leads, eventos, custos] = await Promise.all([
    banco.listaToques(),
    banco.listaLeads(),
    banco.listaEventos(),
    banco.listaCustos(),
  ]);

  const relatorio = montaRelatorio(
    { toques, leads, eventos, custos },
    {
      de,
      ate,
      dimensao,
      modelo,
      base,
      fracaoReceita: Number.isFinite(receita) && receita > 0 ? receita : 1,
      empreendimento: texto(busca, "empreendimento"),
    }
  );

  const vazio = !relatorio.linhas.length;

  return (
    <main className="min-h-screen bg-off px-5 py-10 md:px-10">
      <div className="mx-auto max-w-[1400px]">
        <header className="flex flex-wrap items-end justify-between gap-x-8 gap-y-3">
          <div>
            <p className="kicker text-[12px] uppercase tracking-[0.18em] text-verde">Focal Inc</p>
            <h1 className="din mt-1 text-[32px] leading-none text-ink">Retorno da mídia</h1>
            <p className="mt-2 text-[14px] text-black/60">
              {dataCurta(de)} a {dataCurta(ate)} ·{" "}
              {base === "clique"
                ? "coorte por data do clique"
                : "agrupado pela data da venda"}{" "}
              · {MODELOS.find((item) => item.valor === modelo)?.rotulo.toLowerCase()}
            </p>
          </div>
          <div className="max-w-[46ch] space-y-2">
            <p className="text-[13px] leading-[1.6] text-black/55">
              {base === "clique"
                ? "O investimento de cada período é comparado com o que ELE gerou, mesmo que a venda tenha fechado meses depois. Os períodos mais recentes aparecem subestimados de propósito — a safra ainda não amadureceu."
                : "Agrupado pela data da venda: mostra o que entrou no caixa no período, misturando safras de investimento. Bom para acompanhamento comercial, ruim para julgar campanha."}
            </p>
            {relatorio.maturidade && <AvisoMaturidade maturidade={relatorio.maturidade} />}
          </div>
        </header>

        <Filtros
          busca={busca}
          valores={{ de, ate, dimensao, modelo, base, receita }}
          chave={chave ? texto(busca, "k") : undefined}
        />

        {vazio ? (
          <SemDados />
        ) : (
          <div className="mt-8 space-y-8">
            <Kpis relatorio={relatorio} />

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,420px)]">
              <section className="rounded-[8px] border border-black/10 bg-white p-5">
                <BarrasRoas linhas={relatorio.linhas} />
              </section>
              <Cobertura dados={relatorio.cobertura} />
            </div>

            <section className="rounded-[8px] border border-black/10 bg-white p-5">
              <h2 className="din text-[17px] text-ink">Detalhe por {rotuloDimensao(dimensao)}</h2>
              <div className="mt-4">
                <TabelaRoas linhas={relatorio.linhas} total={relatorio.total} />
              </div>
            </section>

            <Notas />
          </div>
        )}
      </div>
    </main>
  );
}

/**
 * O aviso que impede a leitura errada mais cara do relatório: cortar uma
 * campanha de prospecção porque a coorte dela ainda não teve tempo de vender.
 */
function AvisoMaturidade({ maturidade }: { maturidade: Maturidade }) {
  const madura = maturidade.fracao >= 0.95;
  return (
    <p
      className={`rounded-[4px] px-3 py-2 text-[13px] leading-[1.55] ${
        madura ? "bg-black/[0.04] text-black/60" : "bg-[#C2710C]/[0.09] text-[#7C4A08]"
      }`}
    >
      {madura ? (
        <>Coorte madura: os cliques deste período já tiveram todo o tempo típico de fechamento.</>
      ) : (
        <>
          <strong className="font-semibold">
            Coorte {percentual(maturidade.fracao)} madura.
          </strong>{" "}
          Os cliques deste período tiveram, em média, essa fração do ciclo de{" "}
          {maturidade.cicloDias} dias{" "}
          {maturidade.observado ? "medido nas vendas reais" : "estimado (ainda sem venda medida)"}.
          O ROAS abaixo ainda vai subir.
        </>
      )}
    </p>
  );
}

function rotuloDimensao(dimensao: Dimensao) {
  return DIMENSOES.find((item) => item.valor === dimensao)?.rotulo.toLowerCase() ?? dimensao;
}

function Filtros({
  busca,
  valores,
  chave,
}: {
  busca: Busca;
  valores: {
    de: string;
    ate: string;
    dimensao: Dimensao;
    modelo: ModeloAtribuicao;
    base: BaseTemporal;
    receita: number;
  };
  chave?: string;
}) {
  const empreendimento = texto(busca, "empreendimento") ?? "";
  return (
    <form
      method="get"
      className="mt-6 grid grid-cols-2 gap-4 rounded-[8px] border border-black/10 bg-white p-5 md:grid-cols-3 lg:grid-cols-6"
    >
      {chave && <input type="hidden" name="k" value={chave} />}
      <label className="block">
        <span className={rotuloCampo}>De</span>
        <input type="date" name="de" defaultValue={valores.de} className={campo} />
      </label>
      <label className="block">
        <span className={rotuloCampo}>Até</span>
        <input type="date" name="ate" defaultValue={valores.ate} className={campo} />
      </label>
      <label className="block">
        <span className={rotuloCampo}>Quebra</span>
        <select name="dimensao" defaultValue={valores.dimensao} className={campo}>
          {DIMENSOES.map((item) => (
            <option key={item.valor} value={item.valor}>
              {item.rotulo}
            </option>
          ))}
        </select>
      </label>
      <label className="block">
        <span className={rotuloCampo}>Modelo</span>
        <select name="modelo" defaultValue={valores.modelo} className={campo}>
          {MODELOS.map((item) => (
            <option key={item.valor} value={item.valor}>
              {item.rotulo}
            </option>
          ))}
        </select>
      </label>
      <label className="block">
        <span className={rotuloCampo}>Base</span>
        <select name="base" defaultValue={valores.base} className={campo}>
          {BASES.map((item) => (
            <option key={item.valor} value={item.valor}>
              {item.rotulo}
            </option>
          ))}
        </select>
      </label>
      <label className="block">
        <span className={rotuloCampo} title="1 = VGV cheio; 0,04 = comissão de 4%">
          Fração da receita
        </span>
        <input
          type="number"
          name="receita"
          step="0.01"
          min="0.01"
          max="1"
          defaultValue={valores.receita}
          className={campo}
        />
      </label>
      <input type="hidden" name="empreendimento" value={empreendimento} />
      <div className="col-span-2 flex items-end md:col-span-3 lg:col-span-6">
        <button
          type="submit"
          className="cta rounded-[4px] bg-ink px-6 py-2.5 text-[14px] text-white transition-colors hover:bg-ink-2"
        >
          Aplicar
        </button>
      </div>
    </form>
  );
}

function SemDados() {
  return (
    <section className="mt-8 rounded-[8px] border border-black/10 bg-white p-8">
      <h2 className="din text-[20px] text-ink">Ainda não há dados neste período</h2>
      <ol className="mt-4 max-w-[70ch] list-decimal space-y-2 pl-5 text-[14px] leading-[1.7] text-black/70">
        <li>
          Configure o armazenamento (<code>SUPABASE_URL</code> +{" "}
          <code>SUPABASE_SERVICE_KEY</code>, ou <code>ATRIBUICAO_ARQUIVO</code> em ambiente
          próprio).
        </li>
        <li>
          Rode <code>pnpm roas:sync</code> para trazer custo do Google/Meta e o funil do CVCRM.
        </li>
        <li>
          Para ver o formato do relatório antes de ter credenciais:{" "}
          <code>tsx scripts/roas.ts demo</code>.
        </li>
      </ol>
      <p className="mt-4 text-[13px] text-black/55">
        O passo a passo completo está em <code>docs/atribuicao-roas.md</code>.
      </p>
    </section>
  );
}

function Notas() {
  return (
    <section className="rounded-[8px] border border-black/10 bg-white p-5">
      <h2 className="din text-[17px] text-ink">Como ler estes números</h2>
      <ul className="mt-3 max-w-[85ch] list-disc space-y-2 pl-5 text-[13px] leading-[1.7] text-black/70">
        <li>
          <strong>O funil é cumulativo.</strong> Uma venda também conta como lead qualificado e
          como visita, mesmo que o CRM não tenha registrado a etapa intermediária.
        </li>
        <li>
          <strong>Só clique pago recebe crédito.</strong> Um lead que chegou por busca orgânica ou
          direto aparece na cobertura, mas não entra no ROAS de nenhuma campanha.
        </li>
        <li>
          <strong>Distrato zera o VGV</strong> da venda desfeita e mantém o investimento — como
          deve ser.
        </li>
        <li>
          <strong>Este relatório é a fonte da verdade do ROAS</strong>, não o Google Ads nem o
          Gerenciador da Meta. As duas plataformas têm janela de atribuição muito menor que o
          ciclo de venda de um imóvel (90 dias no Google, 7 dias na Meta), então a venda
          simplesmente não aparece lá.
        </li>
      </ul>
    </section>
  );
}

function AvisoEstatico() {
  return (
    <main className="min-h-screen bg-off px-6 py-20">
      <div className="mx-auto max-w-[60ch]">
        <h1 className="din text-[28px] text-ink">Relatório de ROAS</h1>
        <p className="mt-3 text-[15px] leading-[1.7] text-black/70">
          Este painel lê o banco de atribuição a cada acesso e precisa de servidor. A publicação
          estática (GitHub Pages) não o inclui — use o deploy em Node/Vercel, ou gere o relatório
          pelo terminal com <code>pnpm roas:relatorio</code>.
        </p>
      </div>
    </main>
  );
}
