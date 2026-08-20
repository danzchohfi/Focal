// Campos adicionais do CVCRM.
//
// Assimetria conhecida da API: na ESCRITA o campo é um objeto
// `{ "gclid": "abc" }`; na LEITURA volta como ARRAY, e o nome da chave muda
// conforme o endpoint (`slug` no GET de leads, `nome_referencia` no GET de
// reservas, `referencia` no CVDW). Este módulo esconde essa diferença.

import type { Atribuicao } from "@/lib/atribuicao/tipos";
import { idsDeMidia, resumoOrigem } from "@/lib/dados/mapeamento";
import { ORIGENS_CV, type ConfigCvcrm } from "./config";

type Bruto = Record<string, unknown>;

const CHAVES_NOME = ["slug", "nome_referencia", "referencia", "nome", "campo_nome"];

/** Normaliza qualquer forma de `campos_adicionais` para um objeto plano. */
export function leCamposAdicionais(bruto: unknown): Record<string, string> {
  const saida: Record<string, string> = {};
  if (!bruto) return saida;

  if (Array.isArray(bruto)) {
    for (const item of bruto as Bruto[]) {
      const nome = CHAVES_NOME.map((chave) => item?.[chave]).find(
        (valor) => typeof valor === "string" && valor
      );
      const valor = item?.valor ?? item?.value;
      if (typeof nome === "string" && valor !== undefined && valor !== null) {
        saida[nome] = String(valor);
      }
    }
    return saida;
  }

  if (typeof bruto === "object") {
    for (const [chave, valor] of Object.entries(bruto as Bruto)) {
      if (valor !== undefined && valor !== null) saida[chave] = String(valor);
    }
  }
  return saida;
}

/** Sigla de `origem` do CV para o canal detectado. A lista é fechada. */
export function origemCv(canal: string): string {
  switch (canal) {
    case "google_ads":
      return ORIGENS_CV.google;
    case "meta_ads":
      return ORIGENS_CV.facebook;
    case "tiktok_ads":
      return ORIGENS_CV.tiktok;
    case "linkedin_ads":
      return ORIGENS_CV.linkedin;
    case "microsoft_ads":
      return ORIGENS_CV.midiaPaga;
    case "google_organico":
      return ORIGENS_CV.buscaOrganica;
    case "social_organico":
      return ORIGENS_CV.instagram;
    case "email":
      return ORIGENS_CV.email;
    case "referral":
    case "direto":
      return ORIGENS_CV.site;
    default:
      return ORIGENS_CV.outros;
  }
}

/** `midia` do CV: texto livre de 45 caracteres, criado automaticamente. */
export function midiaCv(atribuicao: Atribuicao | undefined) {
  if (!atribuicao) return "site";
  const ids = idsDeMidia(atribuicao.ultimo);
  return `${atribuicao.ultimo.canal}/${ids.campanhaId ?? "sem-campanha"}`.slice(0, 45);
}

/** `conversao` do CV: texto livre de 100 caracteres, um por toque. */
export function conversaoCv(atribuicao: Atribuicao | undefined) {
  return atribuicao ? resumoOrigem(atribuicao).slice(0, 100) : "site";
}

/** Monta o objeto de campos adicionais para o POST de lead. */
export function montaCamposAdicionais(
  config: ConfigCvcrm,
  ref: string | undefined,
  atribuicao: Atribuicao | undefined
): Record<string, string> {
  const campos = config.campos;
  const saida: Record<string, string> = {};
  const escreve = (slug: string, valor: string | undefined) => {
    if (valor) saida[slug] = String(valor).slice(0, 255);
  };

  escreve(campos.ref, ref);
  if (!atribuicao) return saida;

  const { ultimo, primeiro } = atribuicao;
  escreve(campos.gclid, ultimo.gclid ?? primeiro.gclid);
  escreve(campos.gbraid, ultimo.gbraid ?? primeiro.gbraid);
  escreve(campos.wbraid, ultimo.wbraid ?? primeiro.wbraid);
  escreve(campos.fbclid, ultimo.fbclid ?? primeiro.fbclid);
  escreve(campos.utmSource, ultimo.utm_source);
  escreve(campos.utmMedium, ultimo.utm_medium);
  escreve(campos.utmCampaign, ultimo.utm_campaign);
  escreve(campos.utmContent, ultimo.utm_content);
  escreve(campos.utmTerm, ultimo.utm_term);
  escreve(campos.grupoAnuncio, ultimo.ag);
  escreve(campos.origemResumo, resumoOrigem(atribuicao));
  escreve(campos.landingPage, primeiro.lp);
  return saida;
}
