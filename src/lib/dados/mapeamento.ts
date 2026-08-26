// Conversão do objeto de atribuição do navegador para os registros do
// warehouse. Achata o que interessa para o relatório (canal, campanha, grupo,
// anúncio) mantendo o objeto original para auditoria.

import type { Atribuicao, Canal, Toque } from "@/lib/atribuicao/tipos";
import type { EventoAtribuicao } from "@/lib/atribuicao/eventos";
import type { Plataforma, RegistroToque } from "./tipos";

const CANAL_PARA_PLATAFORMA: Record<Canal, Plataforma> = {
  google_ads: "google",
  meta_ads: "meta",
  tiktok_ads: "tiktok",
  microsoft_ads: "microsoft",
  linkedin_ads: "linkedin",
  google_organico: "google",
  social_organico: "outro",
  email: "outro",
  referral: "outro",
  direto: "outro",
  outro: "outro",
};

export function plataformaDoCanal(canal: Canal): Plataforma {
  return CANAL_PARA_PLATAFORMA[canal] ?? "outro";
}

/** Canal é pago? Só canal pago entra no cálculo de custo/ROAS. */
export function canalPago(canal: Canal) {
  return canal.endsWith("_ads");
}

/** IDs de mídia do toque, na convenção de tagueamento documentada. */
export function idsDeMidia(toque: Toque) {
  return {
    campanhaId: toque.utm_campaign ?? toque.utm_id,
    grupoId: toque.ag,
    anuncioId: toque.utm_content,
    palavraChave: toque.utm_term,
  };
}

/** Monta o registro persistido a partir do evento recebido do navegador. */
export function toqueParaRegistro(evento: EventoAtribuicao): RegistroToque {
  const { atribuicao } = evento;
  const ultimo = atribuicao.ultimo;
  const ids = idsDeMidia(ultimo);

  return {
    // Determinístico: reenvio do mesmo evento não duplica linha.
    id: `${evento.ref}|${evento.tipo}|${evento.ts}`,
    ref: evento.ref,
    tipo: evento.tipo,
    ts: evento.ts,
    pagina: evento.pagina,
    contexto: evento.contexto,
    posicao: evento.posicao,

    canal: ultimo.canal,
    plataforma: plataformaDoCanal(ultimo.canal),
    ...ids,

    gclid: ultimo.gclid ?? atribuicao.primeiro.gclid,
    gbraid: ultimo.gbraid ?? atribuicao.primeiro.gbraid,
    wbraid: ultimo.wbraid ?? atribuicao.primeiro.wbraid,
    fbclid: ultimo.fbclid ?? atribuicao.primeiro.fbclid,
    fbc: atribuicao.fbc,
    fbp: atribuicao.fbp,
    gaCid: atribuicao.gaCid,

    canalPrimeiro: atribuicao.primeiro.canal,
    campanhaPrimeiroId: idsDeMidia(atribuicao.primeiro).campanhaId,
    toques: atribuicao.toques,

    atribuicao,
  };
}

/** Descrição curta da origem, para exibir no CRM e no relatório. */
export function resumoOrigem(atribuicao: Atribuicao) {
  const { ultimo } = atribuicao;
  const ids = idsDeMidia(ultimo);
  const partes: string[] = [ultimo.canal];
  if (ids.campanhaId) partes.push(`camp:${ids.campanhaId}`);
  if (ids.grupoId) partes.push(`grupo:${ids.grupoId}`);
  if (ids.anuncioId) partes.push(`anuncio:${ids.anuncioId}`);
  if (ids.palavraChave) partes.push(`kw:${ids.palavraChave}`);
  return partes.join(" · ");
}
