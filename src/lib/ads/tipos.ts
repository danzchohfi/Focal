// Contratos comuns dos conectores de mídia.
//
// Cada plataforma tem duas responsabilidades no pipeline:
//   • LER custo por dia/campanha/grupo/anúncio → alimenta o denominador do ROAS.
//   • ESCREVER conversões offline → devolve o resultado para o algoritmo de
//     lance, dentro das janelas que cada plataforma aceita.

import type { Etapa, RegistroCusto } from "@/lib/dados/tipos";

export type GranularidadeCusto = "campanha" | "grupo" | "anuncio";

export type JanelaSync = { de: string; ate: string };

/** Uma conversão offline pronta para ser devolvida às plataformas. */
export type ConversaoOffline = {
  /** Etapa que a conversão representa. */
  etapa: Etapa;
  /** Momento em que a etapa aconteceu (ISO 8601). */
  ts: string;
  /** Valor em reais. Nas etapas de meio de funil é um valor-proxy. */
  valor?: number;
  /** Identificador estável para deduplicação (id da reserva/lead no CRM). */
  idTransacao: string;
  /** Identificadores de clique — exatamente um por conversão no Google. */
  gclid?: string;
  gbraid?: string;
  wbraid?: string;
  fbc?: string;
  fbp?: string;
  ctwaClid?: string;
  /** Identidade hasheada (SHA-256 hex minúsculo), já no formato de cada plataforma. */
  emailSha256?: string;
  /** Telefone com `+`, formato do Google Ads. */
  telefoneSha256Google?: string;
  /** Telefone sem `+`, formato da Meta. */
  telefoneSha256Meta?: string;
  primeiroNomeSha256?: string;
  sobrenomeSha256?: string;
  /** ID do lead no CRM — vira `external_id` na Meta. */
  idExterno?: string;
  /** Momento do clique, para checar a janela antes de enviar. */
  tsClique?: string;
};

export type ResultadoEnvio = {
  plataforma: "google" | "meta";
  enviados: number;
  descartados: number;
  /** Motivo → quantidade. Serve para explicar o que ficou fora da janela. */
  motivos: Record<string, number>;
  erros: string[];
};

export type ConectorCusto = {
  nome: string;
  configurado: boolean;
  buscaCustos(janela: JanelaSync): Promise<RegistroCusto[]>;
};
