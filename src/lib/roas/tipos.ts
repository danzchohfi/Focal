// Tipos do motor de ROAS.

import type { Canal } from "@/lib/atribuicao/tipos";
import type {
  Etapa,
  Plataforma,
  RegistroCusto,
  RegistroEvento,
  RegistroLead,
  RegistroToque,
} from "@/lib/dados/tipos";

/** Como o crédito da venda é distribuído entre os toques do lead. */
export type ModeloAtribuicao =
  /** Todo o crédito para o primeiro toque pago (bom para prospecção). */
  | "primeiro"
  /** Todo o crédito para o último toque pago antes da conversão (padrão do mercado). */
  | "ultimo"
  /** Crédito dividido igualmente entre todos os toques pagos. */
  | "linear";

/** Dimensão de quebra do relatório. */
export type Dimensao = "plataforma" | "campanha" | "grupo" | "anuncio" | "palavra_chave";

/** Base temporal do relatório. */
export type BaseTemporal =
  /** Agrupa pela data do CLIQUE (coorte) — a única que faz ROAS honesto num
   *  ciclo longo: compara o investimento de um mês com o que ele gerou. */
  | "clique"
  /** Agrupa pela data do EVENTO (venda) — responde "o que entrou este mês". */
  | "evento";

export type OpcoesRelatorio = {
  de: string;
  ate: string;
  modelo?: ModeloAtribuicao;
  dimensao?: Dimensao;
  base?: BaseTemporal;
  /**
   * Fração do VGV que vira receita para quem paga a mídia. 1 = a incorporadora
   * olha o VGV cheio; 0,05 = uma imobiliária que ganha 5% de comissão.
   */
  fracaoReceita?: number;
  /** Considera só um empreendimento. */
  empreendimento?: string;
  /**
   * Ciclo típico de fechamento, em dias. Quando omitido, usa a mediana
   * observada no próprio período e cai para 120 dias enquanto não houver
   * venda suficiente para medir.
   */
  cicloDias?: number;
  /** Momento de referência (ISO). Injetável para teste. */
  agora?: string;
};

/**
 * Quanto do ciclo de venda já passou para o investimento do período.
 *
 * Numa coorte por data do clique, um mês recente aparece com ROAS baixo
 * simplesmente porque as vendas ainda não tiveram tempo de acontecer.
 * Publicar esse número ao lado do ROAS é o que evita cortar a campanha de
 * prospecção que ainda não maturou.
 */
export type Maturidade = {
  /** 0 a 1: fração do ciclo já decorrida, ponderada pelo investimento. */
  fracao: number;
  /** Ciclo usado no cálculo, em dias. */
  cicloDias: number;
  /** O ciclo veio de vendas reais do período, ou é a estimativa padrão? */
  observado: boolean;
};

export type EntradaRelatorio = {
  toques: RegistroToque[];
  leads: RegistroLead[];
  eventos: RegistroEvento[];
  custos: RegistroCusto[];
};

/** Um lead consolidado: todos os eventos da mesma pessoa reduzidos a um estado. */
export type Jornada = {
  /** Identidade da jornada: o código de atribuição, ou a chave de contato. */
  id: string;
  ref?: string;
  chaves: string[];
  /** Algum evento trouxe o código direto do CRM (o código atravessou o funil). */
  refDireto: boolean;
  /** Quando o código só foi encontrado por identidade, qual chave resolveu. */
  viaChave?: "telefone" | "email";
  etapaMaxima: Etapa;
  /** Etapas atingidas (uma vez cada). */
  etapas: Set<Etapa>;
  primeiroEvento: string;
  dataVenda?: string;
  /** VGV das vendas menos o das que viraram distrato. */
  valor: number;
  valorBruto: number;
  distratado: boolean;
  empreendimento?: string;
};

/** Toque que recebeu crédito por uma jornada. */
export type CreditoToque = {
  toque: RegistroToque;
  /** Fração do crédito (soma 1 por jornada conciliada). */
  peso: number;
};

export type MetodoConciliacao = "ref" | "telefone" | "email" | "manual" | "sem_correspondencia";

export type JornadaConciliada = Jornada & {
  metodo: MetodoConciliacao;
  confianca: "alta" | "media" | "baixa" | "nenhuma";
  creditos: CreditoToque[];
  /** Dias entre o primeiro clique creditado e a venda. */
  diasAteVenda?: number;
};

export type LinhaRelatorio = {
  chave: string;
  rotulo: string;
  plataforma: Plataforma;
  canal?: Canal;
  campanhaId?: string;
  campanhaNome?: string;
  grupoId?: string;
  grupoNome?: string;
  anuncioId?: string;
  anuncioNome?: string;
  palavraChave?: string;

  investimento: number;
  impressoes: number;
  cliques: number;

  leads: number;
  qualificados: number;
  visitas: number;
  propostas: number;
  reservas: number;
  vendas: number;
  distratos: number;

  vgv: number;
  receita: number;

  cpl?: number;
  cplQualificado?: number;
  cac?: number;
  roas?: number;
  ticketMedio?: number;
  taxaQualificacao?: number;
  taxaVenda?: number;
  /** Mediana de dias entre o clique e a venda. */
  diasAteVenda?: number;
};

export type Relatorio = {
  opcoes: Required<Pick<OpcoesRelatorio, "de" | "ate" | "modelo" | "dimensao" | "base" | "fracaoReceita">> & {
    empreendimento?: string;
  };
  linhas: LinhaRelatorio[];
  total: LinhaRelatorio;
  cobertura: Cobertura;
  /** Só faz sentido na base por data do clique. */
  maturidade?: Maturidade;
};

/** Diagnóstico honesto de quanto do funil o relatório realmente enxerga. */
export type Cobertura = {
  jornadas: number;
  conciliadas: number;
  porMetodo: Record<MetodoConciliacao, number>;
  vendas: number;
  vendasConciliadas: number;
  vgvTotal: number;
  vgvConciliado: number;
  /** Investimento do período que não tem nenhuma jornada associada. */
  investimentoSemJornada: number;
};
