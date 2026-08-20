// Leitura de custo no Google Ads (GAQL via REST).
//
// Três consultas, porque a estrutura da conta não é uniforme:
//   • `ad_group_ad`  — Search, Display e Demand Gen têm anúncio de verdade.
//   • `asset_group`  — Performance Max NÃO tem ad_group/ad_group_ad; consultar
//     esses recursos devolve ZERO linhas em silêncio, e o gasto de PMax
//     simplesmente some do relatório. Este é o erro clássico.
//   • `campaign`     — rede de segurança: garante que a soma por campanha
//     bata com a conta, mesmo em tipos que as outras duas não cobrem.
//
// O custo vem em micros (1 real = 1.000.000) e é convertido aqui.

import type { RegistroCusto } from "@/lib/dados/tipos";
import type { JanelaSync } from "../tipos";
import { accessToken, configGoogle, VERSAO_ADS_API, type ConfigGoogle } from "./auth";

type Linha = Record<string, Record<string, unknown>>;

function numero(valor: unknown) {
  const n = Number(valor ?? 0);
  return Number.isFinite(n) ? n : 0;
}

function texto(valor: unknown) {
  return valor === undefined || valor === null ? undefined : String(valor);
}

/** Executa uma GAQL paginada e devolve todas as linhas. */
export async function consultaGaql(config: ConfigGoogle, query: string): Promise<Linha[]> {
  if (!config.customerId) throw new Error("Google Ads: falta GOOGLE_ADS_CUSTOMER_ID");
  if (!config.developerToken) throw new Error("Google Ads: falta GOOGLE_ADS_DEVELOPER_TOKEN");

  const token = await accessToken(config, "ads");
  const url = `https://googleads.googleapis.com/${VERSAO_ADS_API}/customers/${config.customerId}/googleAds:search`;
  const linhas: Linha[] = [];
  let pageToken: string | undefined;

  do {
    const resposta = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "developer-token": config.developerToken,
        ...(config.loginCustomerId ? { "login-customer-id": config.loginCustomerId } : {}),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query, pageSize: 10_000, ...(pageToken ? { pageToken } : {}) }),
    });

    const corpo = await resposta.text();
    if (!resposta.ok) throw new Error(`Google Ads ${resposta.status}: ${corpo.slice(0, 400)}`);
    const dados = JSON.parse(corpo) as { results?: Linha[]; nextPageToken?: string };
    linhas.push(...(dados.results ?? []));
    pageToken = dados.nextPageToken;
  } while (pageToken);

  return linhas;
}

const CAMPOS_METRICAS = "metrics.impressions, metrics.clicks, metrics.costMicros";

function queryAnuncios(janela: JanelaSync) {
  return `
    SELECT campaign.id, campaign.name, ad_group.id, ad_group.name,
           ad_group_ad.ad.id, ad_group_ad.ad.name, ad_group_ad.ad.type,
           segments.date, ${CAMPOS_METRICAS}
    FROM ad_group_ad
    WHERE segments.date BETWEEN '${janela.de}' AND '${janela.ate}'
      AND campaign.status != 'REMOVED'
  `;
}

function queryAssetGroups(janela: JanelaSync) {
  // Performance Max: asset_group é o equivalente ao grupo de anúncios.
  return `
    SELECT campaign.id, campaign.name, asset_group.id, asset_group.name,
           segments.date, ${CAMPOS_METRICAS}
    FROM asset_group
    WHERE segments.date BETWEEN '${janela.de}' AND '${janela.ate}'
      AND campaign.advertising_channel_type = 'PERFORMANCE_MAX'
  `;
}

function queryCampanhas(janela: JanelaSync) {
  return `
    SELECT campaign.id, campaign.name, campaign.advertising_channel_type,
           segments.date, ${CAMPOS_METRICAS}
    FROM campaign
    WHERE segments.date BETWEEN '${janela.de}' AND '${janela.ate}'
      AND campaign.status != 'REMOVED'
  `;
}

function paraRegistro(
  linha: Linha,
  nivel: "anuncio" | "grupo" | "campanha",
  contaId: string
): RegistroCusto | undefined {
  const data = texto(linha.segments?.date);
  const campanhaId = texto(linha.campaign?.id);
  if (!data || !campanhaId) return undefined;

  const grupoId =
    nivel === "campanha" ? undefined : texto(linha.adGroup?.id ?? linha.assetGroup?.id);
  const anuncioId =
    nivel === "anuncio"
      ? texto((linha.adGroupAd?.ad as Record<string, unknown> | undefined)?.id)
      : undefined;

  return {
    id: `google:${data}:${campanhaId}:${grupoId ?? "-"}:${anuncioId ?? "-"}`,
    data,
    plataforma: "google",
    contaId,
    campanhaId,
    campanhaNome: texto(linha.campaign?.name),
    grupoId,
    grupoNome: nivel === "campanha" ? undefined : texto(linha.adGroup?.name ?? linha.assetGroup?.name),
    anuncioId,
    anuncioNome:
      nivel === "anuncio"
        ? texto((linha.adGroupAd?.ad as Record<string, unknown> | undefined)?.name)
        : undefined,
    impressoes: numero(linha.metrics?.impressions),
    cliques: numero(linha.metrics?.clicks),
    // costMicros: 1 real = 1.000.000 micros.
    custo: numero(linha.metrics?.costMicros) / 1_000_000,
  };
}

/**
 * Custo diário por anúncio, com PMax coberto por asset group.
 *
 * As campanhas cujo gasto não apareceu em nenhum dos dois níveis entram no
 * nível de campanha — é preferível ter o custo sem quebra a perdê-lo.
 */
export async function buscaCustosGoogle(janela: JanelaSync): Promise<RegistroCusto[]> {
  const config = configGoogle();
  if (!config?.customerId || !config.developerToken) return [];
  const contaId = config.customerId;

  const [anuncios, assetGroups, campanhas] = await Promise.all([
    consultaGaql(config, queryAnuncios(janela)),
    consultaGaql(config, queryAssetGroups(janela)).catch(() => [] as Linha[]),
    consultaGaql(config, queryCampanhas(janela)),
  ]);

  const registros: RegistroCusto[] = [];
  const cobertas = new Set<string>();

  for (const linha of anuncios) {
    const registro = paraRegistro(linha, "anuncio", contaId);
    if (registro) {
      registros.push(registro);
      cobertas.add(`${registro.data}|${registro.campanhaId}`);
    }
  }
  for (const linha of assetGroups) {
    const registro = paraRegistro(linha, "grupo", contaId);
    if (registro) {
      registros.push(registro);
      cobertas.add(`${registro.data}|${registro.campanhaId}`);
    }
  }
  for (const linha of campanhas) {
    const registro = paraRegistro(linha, "campanha", contaId);
    // Só entra o que não foi coberto por um nível mais fino — senão o custo
    // seria contado duas vezes.
    if (registro && !cobertas.has(`${registro.data}|${registro.campanhaId}`)) {
      registros.push(registro);
    }
  }
  return registros;
}

/**
 * Mapa gclid → campanha/grupo/anúncio a partir de `click_view`.
 *
 * O Google só retém esse vínculo por ~90 dias. Como a venda pode chegar 180
 * dias depois do clique, o job precisa rodar TODO DIA e guardar o resultado —
 * sem isso o gclid gravado no CRM vira um identificador órfão.
 *
 * `click_view` exige `segments.date` de um único dia por consulta.
 */
export async function snapshotCliquesGoogle(dia: string) {
  const config = configGoogle();
  if (!config?.customerId || !config.developerToken) return [];

  const linhas = await consultaGaql(
    config,
    `
      SELECT click_view.gclid, click_view.ad_group_ad, click_view.keyword_info.text,
             campaign.id, campaign.name, ad_group.id, ad_group.name, segments.date
      FROM click_view
      WHERE segments.date = '${dia}'
    `
  );

  return linhas
    .map((linha) => {
      const gclid = texto((linha.clickView as Record<string, unknown> | undefined)?.gclid);
      if (!gclid) return undefined;
      const recurso = texto((linha.clickView as Record<string, unknown> | undefined)?.adGroupAd);
      return {
        gclid,
        data: texto(linha.segments?.date)!,
        campanhaId: texto(linha.campaign?.id),
        campanhaNome: texto(linha.campaign?.name),
        grupoId: texto(linha.adGroup?.id),
        grupoNome: texto(linha.adGroup?.name),
        // O recurso vem como customers/X/adGroupAds/{adGroupId}~{adId}.
        anuncioId: recurso?.split("~").pop(),
      };
    })
    .filter((item): item is NonNullable<typeof item> => !!item);
}
