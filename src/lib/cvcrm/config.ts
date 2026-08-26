// Configuração da integração com o CVCRM (CV — Construtor de Vendas).
//
// A API é multi-tenant: a base é o subdomínio da incorporadora e a autenticação
// são dois headers simples, `email` e `token`, gerados no painel para um
// usuário administrativo (Configurações > Usuários Administrativos > Token).
// Documentação pública: https://desenvolvedor.cvcrm.com.br
//
// Duas APIs convivem e o pipeline usa as duas:
//   • transacional (/api/v1/...) — grava o lead, lê reservas.
//   • CVDW (/api/v1/cvdw/...)    — data warehouse do CV, com carga incremental
//     por data de alteração. É o único caminho que devolve venda + valor +
//     data + mídia + idlead numa consulta só. Módulo contratado à parte.

/** Siglas de `origem` aceitas pelo CV (lista fechada, imutável após criação). */
export const ORIGENS_CV = {
  google: "GO",
  facebook: "FB",
  instagram: "IG",
  midiaPaga: "MP",
  display: "DP",
  retargeting: "RM",
  tiktok: "TT",
  linkedin: "LI",
  site: "SI",
  buscaOrganica: "BO",
  whatsapp: "WA",
  email: "EM",
  chatbot: "CB",
  outros: "OU",
  naoDefinido: "ND",
} as const;

/**
 * Slugs dos campos adicionais que precisam existir no painel do CV
 * (Configurações > Campos adicionais, tipo Texto, funcionalidade Lead **e**
 * Reserva). Sem o campo criado, o CV descarta o valor silenciosamente.
 */
export const CAMPOS_ADICIONAIS_PADRAO = {
  ref: "lead_ref",
  gclid: "gclid",
  gbraid: "gbraid",
  wbraid: "wbraid",
  fbclid: "fbclid",
  utmSource: "utm_source",
  utmMedium: "utm_medium",
  utmCampaign: "utm_campaign",
  utmContent: "utm_content",
  utmTerm: "utm_term",
  grupoAnuncio: "grupo_anuncio",
  origemResumo: "origem_midia",
  landingPage: "landing_page",
} as const;

export type ChaveCampoAdicional = keyof typeof CAMPOS_ADICIONAIS_PADRAO;

export type ConfigCvcrm = {
  /** Ex.: https://focalinc.cvcrm.com.br */
  baseUrl: string;
  email: string;
  token: string;
  /** CVDW contratado? Sem ele, a sincronização usa só os endpoints transacionais. */
  cvdw: boolean;
  /** Slugs reais dos campos adicionais no ambiente do cliente. */
  campos: Record<ChaveCampoAdicional, string>;
  /** IDs de situação do funil de LEADS que contam como "qualificado". */
  situacoesQualificado: string[];
  /** IDs de situação de RESERVA que contam como venda efetivada. */
  situacoesVenda: string[];
  /** Empreendimento padrão a associar no lead (idempreendimento). */
  idEmpreendimento?: number;
};

function listaEnv(bruto: string | undefined): string[] {
  return (bruto ?? "")
    .split(",")
    .map((valor) => valor.trim().toLowerCase())
    .filter(Boolean);
}

/** Permite renomear qualquer campo adicional por env (CVCRM_CAMPO_GCLID=…). */
function resolveCampos(): Record<ChaveCampoAdicional, string> {
  const saida = { ...CAMPOS_ADICIONAIS_PADRAO } as Record<ChaveCampoAdicional, string>;
  for (const chave of Object.keys(saida) as ChaveCampoAdicional[]) {
    const env = process.env[`CVCRM_CAMPO_${chave.toUpperCase()}`];
    if (env) saida[chave] = env;
  }
  return saida;
}

/** `undefined` quando a integração ainda não foi ligada — o site segue funcionando. */
export function configCvcrm(): ConfigCvcrm | undefined {
  const baseUrl = process.env.CVCRM_BASE_URL?.replace(/\/$/, "");
  const email = process.env.CVCRM_EMAIL;
  const token = process.env.CVCRM_TOKEN;
  if (!baseUrl || !email || !token) return undefined;

  const idEmpreendimento = Number(process.env.CVCRM_ID_EMPREENDIMENTO);

  return {
    baseUrl,
    email,
    token,
    cvdw: process.env.CVCRM_CVDW === "1",
    campos: resolveCampos(),
    situacoesQualificado: listaEnv(process.env.CVCRM_SITUACOES_QUALIFICADO),
    situacoesVenda: listaEnv(process.env.CVCRM_SITUACOES_VENDA),
    idEmpreendimento: Number.isFinite(idEmpreendimento) ? idEmpreendimento : undefined,
  };
}

/** Rotas usadas pelo pipeline (relativas à base do cliente). */
export const ROTAS = {
  criarLead: "/api/v1/comercial/leads",
  listarLeads: "/api/v1/comercial/leads",
  listarReservas: "/api/v1/comercial/reservas",
  conversoesLead: "/api/v1/comercial/leads-conversao",
  workflows: (funcionalidade: string) => `/api/v1/configuracoes/workflows/${funcionalidade}`,
  cvdw: (recurso: string) => `/api/v1/cvdw${recurso}`,
} as const;

/** Limites publicados pelo CV: 200 req/min nas REST, 20 req/min no CVDW. */
export const INTERVALO_MS = { rest: 300, cvdw: 3_000 } as const;
