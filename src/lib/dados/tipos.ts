// Modelo de dados do warehouse de atribuição.
//
// Cinco tabelas, uma por etapa da cadeia que liga o real investido ao real
// vendido:
//
//   toques        — o clique/visita com origem (campanha, grupo, anúncio)
//   leads         — o contato que se identificou (form ou WhatsApp)
//   eventos       — o que aconteceu com o lead depois (qualificação → venda)
//   custos        — quanto cada anúncio custou, por dia
//   conciliacoes  — como cada venda foi ligada (ou não) a um clique
//
// Todos os identificadores de mídia são guardados como ID (não nome): nome de
// campanha muda, ID não. Os nomes entram no relatório vindos da tabela de
// custos, que é sincronizada com as plataformas.

import type { Atribuicao, Canal } from "@/lib/atribuicao/tipos";

export type Plataforma = "google" | "meta" | "tiktok" | "microsoft" | "linkedin" | "outro";

/** Toque registrado no servidor (chegada com origem, clique em WhatsApp, envio de form). */
export type RegistroToque = {
  id: string;
  ref: string;
  tipo: "toque" | "whatsapp" | "formulario";
  ts: string;
  pagina?: string;
  contexto?: string;
  posicao?: string;

  canal: Canal;
  plataforma: Plataforma;
  campanhaId?: string;
  grupoId?: string;
  anuncioId?: string;
  palavraChave?: string;

  gclid?: string;
  gbraid?: string;
  wbraid?: string;
  fbclid?: string;
  fbc?: string;
  fbp?: string;
  gaCid?: string;

  /** Canal do primeiro toque (o que descobriu o lead). */
  canalPrimeiro: Canal;
  campanhaPrimeiroId?: string;
  /** Toques acumulados até aqui. */
  toques: number;

  /** Objeto completo, para auditoria e reprocessamento. */
  atribuicao: Atribuicao;
};

/** Contato identificado. Só aqui existe PII, e com retenção definida. */
export type RegistroLead = {
  id: string;
  ref: string;
  criadoEm: string;
  nome?: string;
  email?: string;
  telefone?: string;
  /** E.164 sem `+` — chave de join com o CRM. */
  telefoneNormalizado?: string;
  /** SHA-256 do e-mail no formato da Meta (trim + minúsculas). */
  emailSha256?: string;
  /** SHA-256 do e-mail no formato do Google (regra do Gmail aplicada). */
  emailSha256Google?: string;
  /** SHA-256 do telefone no formato da Meta (só dígitos). */
  telefoneSha256?: string;
  /** Chaves determinísticas de identidade (`tel:…`, `email:…`). */
  chaves: string[];
  contexto?: string;
  origem?: string;
  /** Perguntas de qualificação do formulário. */
  quando?: string;
  orcamento?: string;
  assunto?: string;
  mensagem?: string;
  consentimento?: boolean;
  atribuicao?: Atribuicao;
  /** ID do lead no CVCRM, quando o espelhamento acontece. */
  crmId?: string;
};

/** Etapas do funil imobiliário, na ordem. */
export const ETAPAS = [
  "lead",
  "qualificado",
  "atendimento",
  "visita",
  "proposta",
  "reserva",
  "venda",
  "distrato",
  "descartado",
] as const;
export type Etapa = (typeof ETAPAS)[number];

/** Fato do funil vindo do CRM, da Laís ou de lançamento manual. */
export type RegistroEvento = {
  id: string;
  /** Código curto quando conhecido — é o join forte. */
  ref?: string;
  /** Chaves de identidade para o join fraco (telefone/e-mail). */
  chaves: string[];
  etapa: Etapa;
  ts: string;
  /** VGV do contrato, em reais, quando a etapa tem valor. */
  valor?: number;
  moeda: "BRL";
  fonte: "cvcrm" | "lais" | "site" | "manual";
  /** ID do registro na fonte (idempotência). */
  fonteId?: string;
  empreendimento?: string;
  unidade?: string;
  /** Payload original, para auditoria. */
  bruto?: unknown;
};

/** Custo diário por anúncio, sincronizado das plataformas. */
export type RegistroCusto = {
  /** `${plataforma}:${data}:${anuncioId ?? grupoId ?? campanhaId}` */
  id: string;
  data: string;
  plataforma: Plataforma;
  contaId?: string;
  campanhaId: string;
  campanhaNome?: string;
  grupoId?: string;
  grupoNome?: string;
  anuncioId?: string;
  anuncioNome?: string;
  impressoes: number;
  cliques: number;
  /** Custo em reais (as APIs devolvem micros/centavos — converter na origem). */
  custo: number;
};

/** Como uma venda foi (ou não) ligada a um clique. Auditoria da atribuição. */
export type RegistroConciliacao = {
  id: string;
  eventoId: string;
  ref?: string;
  metodo: "ref" | "telefone" | "email" | "manual" | "sem_correspondencia";
  confianca: "alta" | "media" | "baixa" | "nenhuma";
  toqueId?: string;
  conciliadoEm: string;
  observacao?: string;
};

export type Colecao = "toques" | "leads" | "eventos" | "custos" | "conciliacoes";

export type FiltroPeriodo = { de?: string; ate?: string };
