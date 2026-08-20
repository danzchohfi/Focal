// Motor do relatório de ROAS.
//
// Junta as duas metades da conta: o que saiu (custo por anúncio, vindo do
// Google e da Meta) e o que voltou (VGV das vendas do CVCRM, creditado ao
// clique que originou cada uma).
//
// Duas decisões deste módulo merecem atenção porque mudam o número que o
// cliente vê:
//
// 1. BASE TEMPORAL. Num ciclo de 30–180 dias, dividir "vendas fechadas em
//    agosto" por "investimento de agosto" mistura safras diferentes e produz
//    um ROAS que sobe e desce sem relação com a mídia. O padrão aqui é a base
//    "clique": o investimento de agosto é comparado com o que os cliques de
//    agosto geraram, mesmo que a venda tenha saído em dezembro. Isso torna os
//    meses recentes propositalmente subestimados — é a leitura correta, e o
//    relatório sinaliza a defasagem.
//
// 2. FUNIL CUMULATIVO. As contagens são "chegou pelo menos até", então uma
//    venda conta também como qualificado e como visita, mesmo que o CRM não
//    tenha registrado a etapa intermediária.

import { ETAPAS, type Etapa, type RegistroCusto, type RegistroToque } from "@/lib/dados/tipos";
import { conciliaJornadas, montaJornadas } from "./conciliacao";
import type {
  Cobertura,
  Dimensao,
  Maturidade,
  EntradaRelatorio,
  JornadaConciliada,
  LinhaRelatorio,
  MetodoConciliacao,
  OpcoesRelatorio,
  Relatorio,
} from "./tipos";

const ORDEM_ETAPA = new Map<Etapa, number>(ETAPAS.map((etapa, indice) => [etapa, indice]));

function alcancou(etapaMaxima: Etapa, alvo: Etapa) {
  const atual = ORDEM_ETAPA.get(etapaMaxima) ?? 0;
  const limite = ORDEM_ETAPA.get(alvo) ?? 0;
  // Distrato e descarte ficam no fim da lista mas não são progresso.
  if (etapaMaxima === "distrato" || etapaMaxima === "descartado") return alvo === "lead";
  return atual >= limite;
}

type Coordenada = {
  plataforma: string;
  campanhaId?: string;
  grupoId?: string;
  anuncioId?: string;
  palavraChave?: string;
};

const VAZIO = "-";

export function chaveDimensao(coordenada: Coordenada, dimensao: Dimensao) {
  const p = coordenada.plataforma;
  const c = coordenada.campanhaId || VAZIO;
  const g = coordenada.grupoId || VAZIO;
  const a = coordenada.anuncioId || VAZIO;
  const k = coordenada.palavraChave || VAZIO;
  switch (dimensao) {
    case "plataforma":
      return p;
    case "campanha":
      return `${p}|${c}`;
    case "grupo":
      return `${p}|${c}|${g}`;
    case "anuncio":
      return `${p}|${c}|${g}|${a}`;
    case "palavra_chave":
      return `${p}|${c}|${k}`;
  }
}

/** Nomes legíveis vindos da sincronização de custo (ID → nome). */
type Dicionario = {
  campanhas: Map<string, string>;
  grupos: Map<string, string>;
  anuncios: Map<string, string>;
};

function montaDicionario(custos: RegistroCusto[]): Dicionario {
  const campanhas = new Map<string, string>();
  const grupos = new Map<string, string>();
  const anuncios = new Map<string, string>();
  for (const custo of custos) {
    if (custo.campanhaId && custo.campanhaNome) campanhas.set(custo.campanhaId, custo.campanhaNome);
    if (custo.grupoId && custo.grupoNome) grupos.set(custo.grupoId, custo.grupoNome);
    if (custo.anuncioId && custo.anuncioNome) anuncios.set(custo.anuncioId, custo.anuncioNome);
  }
  return { campanhas, grupos, anuncios };
}

const NOME_PLATAFORMA: Record<string, string> = {
  google: "Google Ads",
  meta: "Meta Ads",
  tiktok: "TikTok Ads",
  microsoft: "Microsoft Ads",
  linkedin: "LinkedIn Ads",
  outro: "Outros",
};

function rotulo(linha: LinhaRelatorio, dimensao: Dimensao, dicionario: Dicionario) {
  const plataforma = NOME_PLATAFORMA[linha.plataforma] ?? linha.plataforma;
  const campanha = linha.campanhaId
    ? (dicionario.campanhas.get(linha.campanhaId) ?? `campanha ${linha.campanhaId}`)
    : "sem campanha";
  const grupo = linha.grupoId
    ? (dicionario.grupos.get(linha.grupoId) ?? `grupo ${linha.grupoId}`)
    : "sem grupo";
  const anuncio = linha.anuncioId
    ? (dicionario.anuncios.get(linha.anuncioId) ?? `anúncio ${linha.anuncioId}`)
    : "sem anúncio";

  switch (dimensao) {
    case "plataforma":
      return plataforma;
    case "campanha":
      return `${plataforma} · ${campanha}`;
    case "grupo":
      return `${plataforma} · ${campanha} · ${grupo}`;
    case "anuncio":
      return `${plataforma} · ${campanha} · ${grupo} · ${anuncio}`;
    case "palavra_chave":
      return `${plataforma} · ${campanha} · ${linha.palavraChave ?? "sem palavra-chave"}`;
  }
}

function linhaVazia(chave: string, coordenada: Coordenada): LinhaRelatorio {
  return {
    chave,
    rotulo: chave,
    plataforma: coordenada.plataforma as LinhaRelatorio["plataforma"],
    campanhaId: coordenada.campanhaId,
    grupoId: coordenada.grupoId,
    anuncioId: coordenada.anuncioId,
    palavraChave: coordenada.palavraChave,
    investimento: 0,
    impressoes: 0,
    cliques: 0,
    leads: 0,
    qualificados: 0,
    visitas: 0,
    propostas: 0,
    reservas: 0,
    vendas: 0,
    distratos: 0,
    vgv: 0,
    receita: 0,
  };
}

function coordenadaDoCusto(custo: RegistroCusto, dimensao: Dimensao): Coordenada {
  return {
    plataforma: custo.plataforma,
    campanhaId: dimensao === "plataforma" ? undefined : custo.campanhaId,
    grupoId: dimensao === "grupo" || dimensao === "anuncio" ? custo.grupoId : undefined,
    anuncioId: dimensao === "anuncio" ? custo.anuncioId : undefined,
  };
}

function coordenadaDoToque(toque: RegistroToque, dimensao: Dimensao): Coordenada {
  return {
    plataforma: toque.plataforma,
    campanhaId: dimensao === "plataforma" ? undefined : toque.campanhaId,
    grupoId: dimensao === "grupo" || dimensao === "anuncio" ? toque.grupoId : undefined,
    anuncioId: dimensao === "anuncio" ? toque.anuncioId : undefined,
    palavraChave: dimensao === "palavra_chave" ? toque.palavraChave : undefined,
  };
}

function dentro(valor: string | undefined, de: string, ate: string) {
  if (!valor) return false;
  const dia = valor.slice(0, 10);
  return dia >= de.slice(0, 10) && dia <= ate.slice(0, 10);
}

function medianaPonderada(amostras: { valor: number; peso: number }[]) {
  if (!amostras.length) return undefined;
  const ordenadas = [...amostras].sort((a, b) => a.valor - b.valor);
  const total = ordenadas.reduce((soma, item) => soma + item.peso, 0);
  if (total <= 0) return undefined;
  let acumulado = 0;
  for (const item of ordenadas) {
    acumulado += item.peso;
    if (acumulado >= total / 2) return Math.round(item.valor);
  }
  return Math.round(ordenadas[ordenadas.length - 1].valor);
}

function divide(a: number, b: number) {
  return b > 0 ? a / b : undefined;
}

export function montaRelatorio(entrada: EntradaRelatorio, opcoes: OpcoesRelatorio): Relatorio {
  const modelo = opcoes.modelo ?? "ultimo";
  const dimensao = opcoes.dimensao ?? "campanha";
  const base = opcoes.base ?? "clique";
  const fracaoReceita = opcoes.fracaoReceita ?? 1;
  const { de, ate } = opcoes;

  const dicionario = montaDicionario(entrada.custos);

  // 1. Consolida eventos em jornadas e liga cada uma aos cliques de origem.
  //    O histórico inteiro entra aqui: recortar por período antes de conciliar
  //    perderia o clique de março que gerou a venda de agosto.
  const jornadas = montaJornadas(entrada.eventos, entrada.leads).filter(
    (jornada) => !opcoes.empreendimento || jornada.empreendimento === opcoes.empreendimento
  );
  const conciliadas = conciliaJornadas(jornadas, entrada.toques, entrada.leads, { modelo });

  // 2. Custo por dimensão, dentro do período.
  const linhas = new Map<string, LinhaRelatorio>();
  const amostrasDias = new Map<string, { valor: number; peso: number }[]>();

  const bucket = (chave: string, coordenada: Coordenada) => {
    const existente = linhas.get(chave);
    if (existente) return existente;
    const nova = linhaVazia(chave, coordenada);
    linhas.set(chave, nova);
    return nova;
  };

  for (const custo of entrada.custos) {
    if (!dentro(custo.data, de, ate)) continue;
    const coordenada = coordenadaDoCusto(custo, dimensao);
    const linha = bucket(chaveDimensao(coordenada, dimensao), coordenada);
    linha.investimento += custo.custo;
    linha.impressoes += custo.impressoes;
    linha.cliques += custo.cliques;
  }

  // 3. Conversões creditadas aos toques.
  for (const jornada of conciliadas) {
    const dataEvento = jornada.dataVenda ?? jornada.primeiroEvento;
    if (base === "evento" && !dentro(dataEvento, de, ate)) continue;

    for (const credito of jornada.creditos) {
      if (base === "clique" && !dentro(credito.toque.ts, de, ate)) continue;

      const coordenada = coordenadaDoToque(credito.toque, dimensao);
      const chave = chaveDimensao(coordenada, dimensao);
      const linha = bucket(chave, coordenada);
      linha.canal = linha.canal ?? credito.toque.canal;

      const peso = credito.peso;
      linha.leads += peso;
      if (alcancou(jornada.etapaMaxima, "qualificado")) linha.qualificados += peso;
      if (alcancou(jornada.etapaMaxima, "visita")) linha.visitas += peso;
      if (alcancou(jornada.etapaMaxima, "proposta")) linha.propostas += peso;
      if (alcancou(jornada.etapaMaxima, "reserva")) linha.reservas += peso;
      if (alcancou(jornada.etapaMaxima, "venda")) linha.vendas += peso;
      if (jornada.distratado) linha.distratos += peso;
      linha.vgv += jornada.valor * peso;

      if (jornada.diasAteVenda !== undefined) {
        const amostras = amostrasDias.get(chave) ?? [];
        amostras.push({ valor: jornada.diasAteVenda, peso });
        amostrasDias.set(chave, amostras);
      }
    }
  }

  // 4. Métricas derivadas.
  const finaliza = (linha: LinhaRelatorio, chave?: string) => {
    linha.receita = linha.vgv * fracaoReceita;
    linha.cpl = divide(linha.investimento, linha.leads);
    linha.cplQualificado = divide(linha.investimento, linha.qualificados);
    linha.cac = divide(linha.investimento, linha.vendas);
    linha.roas = divide(linha.receita, linha.investimento);
    linha.ticketMedio = divide(linha.vgv, linha.vendas);
    linha.taxaQualificacao = divide(linha.qualificados, linha.leads);
    linha.taxaVenda = divide(linha.vendas, linha.leads);
    if (chave) linha.diasAteVenda = medianaPonderada(amostrasDias.get(chave) ?? []);
    return linha;
  };

  const lista = [...linhas.values()].map((linha) => {
    linha.rotulo = rotulo(linha, dimensao, dicionario);
    return finaliza(linha, linha.chave);
  });
  lista.sort((a, b) => b.investimento - a.investimento || b.vgv - a.vgv);

  const total = linhaVazia("total", { plataforma: "outro" });
  total.rotulo = "Total";
  for (const linha of lista) {
    total.investimento += linha.investimento;
    total.impressoes += linha.impressoes;
    total.cliques += linha.cliques;
    total.leads += linha.leads;
    total.qualificados += linha.qualificados;
    total.visitas += linha.visitas;
    total.propostas += linha.propostas;
    total.reservas += linha.reservas;
    total.vendas += linha.vendas;
    total.distratos += linha.distratos;
    total.vgv += linha.vgv;
  }
  finaliza(total);
  total.diasAteVenda = medianaPonderada(
    [...amostrasDias.values()].flat()
  );

  return {
    opcoes: { de, ate, modelo, dimensao, base, fracaoReceita, empreendimento: opcoes.empreendimento },
    linhas: lista,
    total,
    cobertura: montaCobertura(conciliadas, lista, de, ate, base),
    maturidade:
      base === "clique"
        ? calculaMaturidade(entrada.custos, { de, ate }, total.diasAteVenda, opcoes)
        : undefined,
  };
}

/** Ciclo assumido enquanto não há venda suficiente para medir a mediana real. */
const CICLO_PADRAO_DIAS = 120;

/**
 * Fração do ciclo já decorrida para o investimento do período, ponderada pelo
 * gasto de cada dia: R$ 1 investido ontem quase não teve chance de virar
 * venda; R$ 1 investido há um ano já teve toda.
 */
function calculaMaturidade(
  custos: RegistroCusto[],
  janela: { de: string; ate: string },
  medianaObservada: number | undefined,
  opcoes: OpcoesRelatorio
): Maturidade | undefined {
  // "Observado" só quando o ciclo veio de vendas reais do período — não quando
  // foi arbitrado por parâmetro nem quando caiu na estimativa padrão.
  const observado = opcoes.cicloDias === undefined && medianaObservada !== undefined;
  const cicloDias = Math.max(1, opcoes.cicloDias ?? medianaObservada ?? CICLO_PADRAO_DIAS);
  const agora = Date.parse(opcoes.agora ?? new Date().toISOString());

  let ponderado = 0;
  let investimento = 0;
  for (const custo of custos) {
    if (!dentro(custo.data, janela.de, janela.ate) || custo.custo <= 0) continue;
    const decorridos = (agora - Date.parse(`${custo.data.slice(0, 10)}T12:00:00Z`)) / 86_400_000;
    ponderado += Math.min(1, Math.max(0, decorridos / cicloDias)) * custo.custo;
    investimento += custo.custo;
  }

  // Sem investimento no período não há coorte para amadurecer — e um "0%
  // madura" ali seria pior que não dizer nada.
  if (investimento <= 0) return undefined;

  return { fracao: ponderado / investimento, cicloDias: Math.round(cicloDias), observado };
}

function montaCobertura(
  conciliadas: JornadaConciliada[],
  linhas: LinhaRelatorio[],
  de: string,
  ate: string,
  base: string
): Cobertura {
  const noPeriodo = conciliadas.filter((jornada) => {
    if (base === "evento") return dentro(jornada.dataVenda ?? jornada.primeiroEvento, de, ate);
    // Base clique: a jornada conta se algum crédito caiu no período. Quando não
    // há crédito nenhum não existe data de clique, então vale a entrada do lead
    // no funil — é justamente o buraco que a cobertura precisa mostrar.
    if (!jornada.creditos.length) return dentro(jornada.primeiroEvento, de, ate);
    return jornada.creditos.some((credito) => dentro(credito.toque.ts, de, ate));
  });

  const porMetodo = {
    ref: 0,
    telefone: 0,
    email: 0,
    manual: 0,
    sem_correspondencia: 0,
  } as Record<MetodoConciliacao, number>;

  let vendas = 0;
  let vendasConciliadas = 0;
  let vgvTotal = 0;
  let vgvConciliado = 0;

  for (const jornada of noPeriodo) {
    porMetodo[jornada.metodo] = (porMetodo[jornada.metodo] ?? 0) + 1;
    if (alcancou(jornada.etapaMaxima, "venda")) {
      vendas += 1;
      vgvTotal += jornada.valor;
      if (jornada.creditos.length) {
        vendasConciliadas += 1;
        vgvConciliado += jornada.valor;
      }
    }
  }

  return {
    jornadas: noPeriodo.length,
    conciliadas: noPeriodo.filter((j) => j.metodo !== "sem_correspondencia").length,
    porMetodo,
    vendas,
    vendasConciliadas,
    vgvTotal,
    vgvConciliado,
    investimentoSemJornada: linhas
      .filter((linha) => linha.leads === 0)
      .reduce((soma, linha) => soma + linha.investimento, 0),
  };
}
