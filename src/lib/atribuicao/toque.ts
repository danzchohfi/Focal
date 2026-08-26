// Leitura de um toque a partir de uma URL — funções puras, sem navegador.
//
// Usado dos dois lados: pelo script de captura no cliente e pelo redirecionador
// /ir/whatsapp no servidor (que precisa ler a mesma querystring quando o
// anúncio manda o clique direto para o WhatsApp, sem passar pelo site).

import { VERSAO_ATRIBUICAO, type Atribuicao, type Canal, type Toque } from "./tipos";

export const CLICK_IDS = [
  "gclid",
  "gbraid",
  "wbraid",
  "fbclid",
  "ttclid",
  "msclkid",
  "li_fat_id",
] as const;

export const PARAMS_CAMPANHA = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "utm_term",
  "utm_id",
  "ag",
  "mt",
  "net",
  "dev",
  "plc",
  "tgt",
] as const;

/** Tamanho máximo de cada valor guardado (defesa contra querystring inflada). */
const MAX_VALOR = 200;

const HOSTS_SOCIAL = [
  "facebook.com",
  "instagram.com",
  "l.facebook.com",
  "l.instagram.com",
  "lm.facebook.com",
  "m.facebook.com",
  "linkedin.com",
  "t.co",
  "tiktok.com",
  "youtube.com",
];

const HOSTS_BUSCA = ["google.", "bing.com", "duckduckgo.com", "search.yahoo", "ecosia.org"];

/** Sufixos públicos de dois níveis mais comuns no Brasil. */
export const SUFIXOS_DUPLOS = ["com.br", "net.br", "org.br", "gov.br", "art.br", "eco.br", "ind.br"];

function corta(valor: string | null) {
  if (!valor) return undefined;
  const limpo = valor.trim().slice(0, MAX_VALOR);
  return limpo || undefined;
}

/** Domínio registrável com ponto na frente, para o cookie valer em subdomínios. */
export function dominioCookie(hostname: string) {
  if (!hostname || hostname === "localhost" || /^\d+(\.\d+){3}$/.test(hostname)) return undefined;
  const partes = hostname.split(".");
  if (partes.length < 3) return undefined;
  const ultimosDois = partes.slice(-2).join(".");
  const casas = SUFIXOS_DUPLOS.includes(ultimosDois) ? 3 : 2;
  if (partes.length <= casas) return undefined;
  return `.${partes.slice(-casas).join(".")}`;
}

export function classificaCanal(params: URLSearchParams, referrerHost?: string): Canal {
  const fonte = (params.get("utm_source") ?? "").toLowerCase();
  const meio = (params.get("utm_medium") ?? "").toLowerCase();

  if (params.get("gclid") || params.get("gbraid") || params.get("wbraid")) return "google_ads";
  if (params.get("fbclid")) return "meta_ads";
  if (params.get("ttclid")) return "tiktok_ads";
  if (params.get("msclkid")) return "microsoft_ads";
  if (params.get("li_fat_id")) return "linkedin_ads";

  const pago = /^(cpc|ppc|paid|paidsocial|paid_social|cpm|display|discovery|pmax)$/.test(meio);
  if (pago) {
    if (/google|youtube|gdn|pmax|demandgen/.test(fonte)) return "google_ads";
    if (/facebook|instagram|meta|^fb$|^ig$|audience/.test(fonte)) return "meta_ads";
    if (/tiktok/.test(fonte)) return "tiktok_ads";
    if (/bing|microsoft/.test(fonte)) return "microsoft_ads";
    if (/linkedin/.test(fonte)) return "linkedin_ads";
    return "outro";
  }
  if (/^(email|e-mail|newsletter|crm)$/.test(meio)) return "email";
  if (meio || fonte) return "referral";

  if (referrerHost) {
    if (HOSTS_BUSCA.some((host) => referrerHost.includes(host))) return "google_organico";
    if (HOSTS_SOCIAL.some((host) => referrerHost.endsWith(host))) return "social_organico";
    return "referral";
  }
  return "direto";
}

/** Monta o toque atual a partir da URL e do referrer. */
export function montaToque(href: string, referrer: string, agora = Date.now()): Toque {
  const url = new URL(href);
  const params = url.searchParams;

  let referrerHost: string | undefined;
  try {
    if (referrer) {
      const host = new URL(referrer).hostname.replace(/^www\./, "");
      if (host !== url.hostname.replace(/^www\./, "")) referrerHost = host;
    }
  } catch {
    /* referrer inválido ou opaco */
  }

  const toque: Toque = {
    ts: new Date(agora).toISOString(),
    lp: url.pathname,
    canal: classificaCanal(params, referrerHost),
  };
  if (referrerHost) toque.ref = referrerHost;

  for (const chave of CLICK_IDS) {
    const valor = corta(params.get(chave));
    if (valor) toque[chave] = valor;
  }
  for (const chave of PARAMS_CAMPANHA) {
    const valor = corta(params.get(chave));
    if (valor) toque[chave] = valor;
  }
  return toque;
}

/** Um toque só "conta" quando traz origem — visita direta não sobrescreve campanha. */
export function toqueTemOrigem(toque: Toque) {
  if (toque.canal === "direto") return false;
  const temClickId = CLICK_IDS.some((chave) => toque[chave]);
  const temUtm = !!(toque.utm_source || toque.utm_medium || toque.utm_campaign);
  return temClickId || temUtm || !!toque.ref;
}

/**
 * `_fbc` no formato exigido pela Meta: fb.{índiceDeSubdomínio}.{criação}.{fbclid}.
 *
 * O índice conta quantos rótulos existem ABAIXO do sufixo público — a própria
 * doc da Meta exemplifica com `com` = 0, `example.com` = 1,
 * `www.example.com` = 2. Em `.com.br` o sufixo tem dois rótulos, então
 * `focalinc.com.br` = 1 e `www.focalinc.com.br` = 2. Errar esse número não dá
 * erro na API: só derruba o match rate em silêncio.
 *
 * `criação` é em MILISSEGUNDOS (o `event_time` do evento é em segundos — são
 * unidades diferentes no mesmo payload).
 */
export function montaFbc(fbclid: string, hostname: string, agora = Date.now()) {
  const partes = hostname.split(".").filter(Boolean);
  const ultimosDois = partes.slice(-2).join(".");
  const rotulosDoSufixo = SUFIXOS_DUPLOS.includes(ultimosDois) ? 2 : 1;
  const indice = Math.max(0, partes.length - rotulosDoSufixo);
  // O fbclid é opaco e case-sensitive: entra exatamente como veio na URL.
  return `fb.${indice}.${agora}.${fbclid}`;
}

/**
 * Aplica um toque novo sobre a atribuição existente.
 *
 * Regras: o primeiro toque com origem real é o que fica gravado como primeiro
 * (uma visita direta anterior é só um marcador); o último toque só é
 * substituído por outro que também traga origem — assim uma volta ao site por
 * digitação não apaga a campanha que trouxe a pessoa.
 */
export function consolidaAtribuicao(
  anterior: Atribuicao | undefined,
  toque: Toque,
  ref: string,
  agora = Date.now()
): Atribuicao {
  const comOrigem = toqueTemOrigem(toque);

  if (!anterior) {
    return {
      v: VERSAO_ATRIBUICAO,
      ref,
      primeiro: toque,
      ultimo: toque,
      toques: comOrigem ? 1 : 0,
      criadoEm: new Date(agora).toISOString(),
    };
  }
  if (!comOrigem || mesmoToque(anterior.ultimo, toque)) return anterior;

  const atual: Atribuicao = { ...anterior, ultimo: toque, toques: anterior.toques + 1 };
  if (!toqueTemOrigem(anterior.primeiro)) atual.primeiro = toque;
  return atual;
}

/** Dois toques são o mesmo evento? Evita inflar a contagem por re-render. */
export function mesmoToque(a: Toque, b: Toque) {
  return (
    a.lp === b.lp &&
    a.canal === b.canal &&
    a.gclid === b.gclid &&
    a.fbclid === b.fbclid &&
    a.gbraid === b.gbraid &&
    a.wbraid === b.wbraid &&
    a.utm_campaign === b.utm_campaign &&
    a.utm_content === b.utm_content &&
    a.utm_term === b.utm_term
  );
}
