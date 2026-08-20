// Paleta do relatório.
//
// Duas categorias (Google e Meta) precisam ser distinguíveis também por quem
// tem daltonismo. Estes dois tons foram verificados: ΔE 10,2 no eixo protan e
// 20,6 na visão normal, ambos acima do piso, com contraste ≥ 3:1 sobre a
// superfície clara do painel. Além da cor, cada barra leva rótulo direto e
// legenda — identidade nunca depende só de cor.

import type { Plataforma } from "@/lib/dados/tipos";

export const COR_PLATAFORMA: Record<string, string> = {
  google: "#C2710C",
  meta: "#189673",
  tiktok: "#4B5563",
  microsoft: "#4B5563",
  linkedin: "#4B5563",
  outro: "#8A8A8A",
};

export const NOME_PLATAFORMA: Record<string, string> = {
  google: "Google Ads",
  meta: "Meta Ads",
  tiktok: "TikTok Ads",
  microsoft: "Microsoft Ads",
  linkedin: "LinkedIn Ads",
  outro: "Outros",
};

export function corDaPlataforma(plataforma: Plataforma | string) {
  return COR_PLATAFORMA[plataforma] ?? COR_PLATAFORMA.outro;
}

/** Superfícies do painel (claro; o site não tem modo escuro). */
export const SUPERFICIE = "#F7F7F7";
export const CARTAO = "#FFFFFF";
export const GRADE = "#E4E4E4";
