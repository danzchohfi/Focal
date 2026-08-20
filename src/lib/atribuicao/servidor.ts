// Leitura da atribuição no servidor (rotas de API e middleware).

import {
  COOKIE_ATRIBUICAO,
  COOKIE_REF,
  VERSAO_ATRIBUICAO,
  type Atribuicao,
  type Toque,
} from "./tipos";
import { refValido } from "./ref";

/** Lê um cookie do header `Cookie` bruto. */
export function cookieDoHeader(header: string | null | undefined, nome: string) {
  if (!header) return undefined;
  const alvo = `${nome}=`;
  for (const parte of header.split(";")) {
    const item = parte.trim();
    if (item.startsWith(alvo)) {
      try {
        return decodeURIComponent(item.slice(alvo.length));
      } catch {
        return item.slice(alvo.length);
      }
    }
  }
  return undefined;
}

function toqueValido(valor: unknown): valor is Toque {
  const t = valor as Toque | undefined;
  return !!t && typeof t.ts === "string" && typeof t.canal === "string";
}

/** Valida e devolve a atribuição vinda do cookie ou do corpo da requisição. */
export function validaAtribuicao(bruto: unknown): Atribuicao | undefined {
  const dados = bruto as Atribuicao | undefined;
  if (!dados || dados.v !== VERSAO_ATRIBUICAO) return undefined;
  if (!refValido(dados.ref)) return undefined;
  if (!toqueValido(dados.primeiro) || !toqueValido(dados.ultimo)) return undefined;
  return dados;
}

/** Atribuição do cookie first-party, se houver. */
export function atribuicaoDoCookie(header: string | null | undefined): Atribuicao | undefined {
  const bruto = cookieDoHeader(header, COOKIE_ATRIBUICAO);
  if (!bruto) return undefined;
  try {
    return validaAtribuicao(JSON.parse(bruto));
  } catch {
    return undefined;
  }
}

/** Código curto do cookie, mesmo quando a atribuição completa não veio. */
export function refDoCookie(header: string | null | undefined) {
  const bruto = cookieDoHeader(header, COOKIE_REF);
  return refValido(bruto) ? bruto : undefined;
}

/**
 * Resolve a atribuição de uma requisição de lead: o corpo enviado pelo cliente
 * tem prioridade (é o estado mais fresco), com o cookie como rede de segurança.
 */
export function resolveAtribuicao(
  corpo: unknown,
  cookieHeader: string | null | undefined
): Atribuicao | undefined {
  return validaAtribuicao(corpo) ?? atribuicaoDoCookie(cookieHeader);
}
