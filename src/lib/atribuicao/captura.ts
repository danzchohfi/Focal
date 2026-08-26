"use client";

// Captura de atribuição no navegador.
//
// Roda uma vez por carregamento de página: lê click ids, UTMs e referrer,
// classifica o canal e guarda primeiro/último toque num cookie first-party
// (+ localStorage como espelho). O cookie é reemitido pelo servidor no
// middleware — cookie escrito por JS é limitado a 7 dias no Safari/ITP, o que
// destruiria a atribuição num ciclo de venda de meses.
//
// A leitura da URL em si vive em ./toque.ts, compartilhada com o servidor.

import {
  COOKIE_ATRIBUICAO,
  COOKIE_REF,
  DIAS_VALIDADE,
  VERSAO_ATRIBUICAO,
  type Atribuicao,
} from "./tipos";
import { consolidaAtribuicao, montaFbc, montaToque, dominioCookie } from "./toque";
import { novoRef, refValido } from "./ref";

export { classificaCanal, montaToque, toqueTemOrigem, montaFbc, dominioCookie } from "./toque";

function leCookie(nome: string) {
  if (typeof document === "undefined") return undefined;
  const alvo = `${nome}=`;
  for (const parte of document.cookie.split(";")) {
    const item = parte.trim();
    if (item.startsWith(alvo)) return decodeURIComponent(item.slice(alvo.length));
  }
  return undefined;
}

function gravaCookie(nome: string, valor: string, dias = DIAS_VALIDADE) {
  if (typeof document === "undefined") return;
  const dominio = dominioCookie(location.hostname);
  const seguro = location.protocol === "https:" ? "; Secure" : "";
  document.cookie =
    `${nome}=${encodeURIComponent(valor)}; path=/; max-age=${dias * 86_400}; SameSite=Lax` +
    (dominio ? `; domain=${dominio}` : "") +
    seguro;
}

/** client_id do GA4 a partir do cookie `_ga` (GA1.1.<cid1>.<cid2>). */
function gaClientId() {
  const bruto = leCookie("_ga");
  if (!bruto) return undefined;
  const partes = bruto.split(".");
  return partes.length >= 4 ? partes.slice(-2).join(".") : undefined;
}

function lerLocal(chave: string) {
  try {
    return localStorage.getItem(chave) ?? undefined;
  } catch {
    return undefined;
  }
}

function gravarLocal(chave: string, valor: string) {
  try {
    localStorage.setItem(chave, valor);
  } catch {
    /* modo privado ou storage cheio */
  }
}

function leGuardado(): Atribuicao | undefined {
  // localStorage primeiro: é onde o objeto completo mora. O cookie só entra
  // como resgate de sessões antigas, de quando ele carregava o payload.
  for (const bruto of [lerLocal(COOKIE_ATRIBUICAO), leCookie(COOKIE_ATRIBUICAO)]) {
    if (!bruto) continue;
    try {
      const dados = JSON.parse(bruto) as Atribuicao;
      if (dados?.v === VERSAO_ATRIBUICAO && refValido(dados.ref) && dados.primeiro && dados.ultimo) {
        return dados;
      }
    } catch {
      /* conteúdo corrompido: descarta e recomeça */
    }
  }
  return undefined;
}

let memoria: Atribuicao | undefined;

// Store mínimo para os componentes reagirem à captura sem `setState` dentro de
// efeito (o servidor renderiza sem código; o cliente completa depois).
const ouvintes = new Set<() => void>();

export function assinaAtribuicao(ouvinte: () => void) {
  ouvintes.add(ouvinte);
  return () => {
    ouvintes.delete(ouvinte);
  };
}

/** Leitura pura, segura durante o render: nunca cria nem grava nada. */
export function refSnapshot() {
  return obtemAtribuicao()?.ref ?? "";
}

/**
 * Executa a captura do toque atual e devolve a atribuição consolidada.
 * Idempotente por carregamento: chamar duas vezes na mesma URL não infla a
 * contagem de toques.
 */
export function capturaAtribuicao(agora = Date.now()): Atribuicao | undefined {
  if (typeof window === "undefined") return undefined;

  const toque = montaToque(window.location.href, document.referrer, agora);
  const anterior = leGuardado();
  const guardado = leCookie(COOKIE_REF) ?? lerLocal(COOKIE_REF);
  const ref = anterior?.ref ?? (refValido(guardado) ? guardado : novoRef(agora));
  const atual = consolidaAtribuicao(anterior, toque, ref, agora);

  const fbclid = atual.ultimo.fbclid ?? atual.primeiro.fbclid;
  const fbc = leCookie("_fbc") ?? (fbclid ? montaFbc(fbclid, location.hostname, agora) : undefined);
  if (fbc) atual.fbc = fbc;
  const fbp = leCookie("_fbp");
  if (fbp) atual.fbp = fbp;
  const cid = gaClientId();
  if (cid) atual.gaCid = cid;

  // No cookie vai só o código (12 bytes): ele acompanha TODA requisição do
  // domínio, e o objeto completo passa de 1 KB. O payload fica no
  // localStorage e, do lado do servidor, na tabela de toques indexada pelo
  // código — o navegador é cache, não banco.
  gravaCookie(COOKIE_REF, atual.ref);
  gravarLocal(COOKIE_ATRIBUICAO, JSON.stringify(atual));
  gravarLocal(COOKIE_REF, atual.ref);
  memoria = atual;
  for (const ouvinte of ouvintes) ouvinte();
  return atual;
}

/** Atribuição já capturada nesta página (ou o que estiver guardado). */
export function obtemAtribuicao(): Atribuicao | undefined {
  if (memoria) return memoria;
  if (typeof window === "undefined") return undefined;
  memoria = leGuardado();
  return memoria;
}

/** Código curto atual — cria um na hora se a captura ainda não rodou. */
export function obtemRef(): string | undefined {
  const atribuicao = obtemAtribuicao();
  if (atribuicao) return atribuicao.ref;
  if (typeof window === "undefined") return undefined;
  return capturaAtribuicao()?.ref;
}

/** Achata a atribuição em parâmetros planos para GA4/dataLayer. */
export function atribuicaoParaEventos(atribuicao?: Atribuicao) {
  const dados = atribuicao ?? obtemAtribuicao();
  if (!dados) return {};
  const { primeiro, ultimo } = dados;
  return {
    lead_ref: dados.ref,
    canal: ultimo.canal,
    canal_primeiro: primeiro.canal,
    campanha_id: ultimo.utm_campaign,
    grupo_id: ultimo.ag,
    anuncio_id: ultimo.utm_content,
    origem: ultimo.utm_source,
    meio: ultimo.utm_medium,
    toques: dados.toques,
  };
}
