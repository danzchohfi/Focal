// Leitura de custo na Meta (Marketing API / Insights).
//
// Duas chamadas, porque a Insights não devolve o criativo: uma para o gasto
// diário por anúncio e outra para o catálogo de anúncios (nome e criativo),
// unidas por `ad_id` do nosso lado. É esse join que fecha o "ROAS por anúncio".
//
// Atenção à retenção: desde 12/01/2026 a Meta restringiu o histórico da
// Insights API. Como o ciclo de venda passa de 120 dias, o custo precisa ser
// gravado no nosso banco todo dia — não dá para contar em puxar o histórico
// depois.

import type { RegistroCusto } from "@/lib/dados/tipos";
import type { JanelaSync } from "../tipos";

export const VERSAO_GRAPH = process.env.META_GRAPH_VERSAO ?? "v26.0";

export type ConfigMeta = {
  token: string;
  /** ID da conta de anúncios, sem o prefixo `act_`. */
  contaId?: string;
  /** ID do Dataset (antigo Pixel) para a Conversions API. */
  datasetId?: string;
  /** ID da conta do WhatsApp Business, para eventos de clique-para-WhatsApp. */
  wabaId?: string;
};

export function configMeta(): ConfigMeta | undefined {
  const token = process.env.META_ACCESS_TOKEN;
  if (!token) return undefined;
  return {
    token,
    contaId: process.env.META_AD_ACCOUNT_ID?.replace(/^act_/, ""),
    datasetId: process.env.META_DATASET_ID,
    wabaId: process.env.META_WABA_ID,
  };
}

type LinhaInsights = {
  campaign_id?: string;
  campaign_name?: string;
  adset_id?: string;
  adset_name?: string;
  ad_id?: string;
  ad_name?: string;
  spend?: string;
  impressions?: string;
  clicks?: string;
  date_start?: string;
};

function numero(valor: string | undefined) {
  const n = Number(valor ?? 0);
  return Number.isFinite(n) ? n : 0;
}

async function paginaGraph<T>(url: string): Promise<T[]> {
  const saida: T[] = [];
  let proxima: string | undefined = url;

  while (proxima) {
    const resposta: Response = await fetch(proxima);
    const corpo = await resposta.text();
    if (!resposta.ok) throw new Error(`Meta ${resposta.status}: ${corpo.slice(0, 400)}`);
    const dados = JSON.parse(corpo) as { data?: T[]; paging?: { next?: string } };
    saida.push(...(dados.data ?? []));
    proxima = dados.paging?.next;
  }
  return saida;
}

/** Custo diário por anúncio (nível `ad`), com nome de campanha e conjunto. */
export async function buscaCustosMeta(janela: JanelaSync): Promise<RegistroCusto[]> {
  const config = configMeta();
  if (!config?.contaId) return [];

  const params = new URLSearchParams({
    level: "ad",
    fields: "campaign_id,campaign_name,adset_id,adset_name,ad_id,ad_name,spend,impressions,clicks",
    time_range: JSON.stringify({ since: janela.de, until: janela.ate }),
    time_increment: "1",
    limit: "500",
    access_token: config.token,
  });

  const linhas = await paginaGraph<LinhaInsights>(
    `https://graph.facebook.com/${VERSAO_GRAPH}/act_${config.contaId}/insights?${params}`
  );

  return linhas
    .filter((linha) => linha.date_start && linha.campaign_id)
    .map((linha) => ({
      id: `meta:${linha.date_start}:${linha.campaign_id}:${linha.adset_id ?? "-"}:${linha.ad_id ?? "-"}`,
      data: linha.date_start!,
      plataforma: "meta" as const,
      contaId: config.contaId,
      campanhaId: linha.campaign_id!,
      campanhaNome: linha.campaign_name,
      grupoId: linha.adset_id,
      grupoNome: linha.adset_name,
      anuncioId: linha.ad_id,
      anuncioNome: linha.ad_name,
      impressoes: numero(linha.impressions),
      cliques: numero(linha.clicks),
      custo: numero(linha.spend),
    }));
}

export type CriativoMeta = {
  id: string;
  nome?: string;
  criativoId?: string;
  criativoNome?: string;
  miniatura?: string;
};

/** Catálogo de anúncios com criativo — o que a Insights não devolve. */
export async function buscaCriativosMeta(): Promise<CriativoMeta[]> {
  const config = configMeta();
  if (!config?.contaId) return [];

  const params = new URLSearchParams({
    fields: "id,name,status,adset_id,campaign_id,creative{id,name,thumbnail_url}",
    limit: "500",
    access_token: config.token,
  });

  type Anuncio = {
    id: string;
    name?: string;
    creative?: { id?: string; name?: string; thumbnail_url?: string };
  };

  const anuncios = await paginaGraph<Anuncio>(
    `https://graph.facebook.com/${VERSAO_GRAPH}/act_${config.contaId}/ads?${params}`
  );

  return anuncios.map((anuncio) => ({
    id: anuncio.id,
    nome: anuncio.name,
    criativoId: anuncio.creative?.id,
    criativoNome: anuncio.creative?.name,
    miniatura: anuncio.creative?.thumbnail_url,
  }));
}
