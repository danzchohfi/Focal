// O código de atribuição dentro da mensagem do WhatsApp.
//
// O texto pré-preenchido do wa.me vira a PRIMEIRA mensagem da conversa — é a
// única coisa do clique que chega ao WhatsApp (nem UTM nem gclid atravessam).
// Por isso o código vai por último, entre parênteses: não atrapalha a leitura
// do cliente, não convida a apagar, e é fácil de achar com regex do outro lado.

/** Marcador que a Laís/CVCRM procuram na primeira mensagem. */
export function linhaCodigo(ref: string) {
  return `(cód. ${ref})`;
}

/** Insere o código no parâmetro `text` de um link wa.me, sem duplicar. */
export function comCodigo(href: string, ref: string | undefined) {
  if (!ref) return href;
  try {
    const url = new URL(href, "https://wa.me");
    const texto = url.searchParams.get("text") ?? "Olá Focal Inc! Vim pelo site.";
    if (texto.includes(ref)) return url.toString();
    url.searchParams.set("text", `${texto.trim()}\n\n${linhaCodigo(ref)}`);
    return url.toString();
  } catch {
    return href;
  }
}

/**
 * URL do redirecionador rastreado. Usada como URL final dos anúncios que
 * mandam o clique direto para a conversa (o clique pago é capturado mesmo sem
 * visita ao site) e, opcionalmente, nos CTAs do site.
 */
export function linkRedirecionado(opcoes: {
  numero?: string;
  texto?: string;
  posicao?: string;
  contexto?: string;
  base?: string;
}) {
  const params = new URLSearchParams();
  if (opcoes.numero) params.set("n", opcoes.numero);
  if (opcoes.texto) params.set("t", opcoes.texto);
  if (opcoes.posicao) params.set("p", opcoes.posicao);
  if (opcoes.contexto) params.set("c", opcoes.contexto);
  return `${opcoes.base ?? ""}/ir/whatsapp?${params}`;
}

/**
 * Converte um link wa.me no redirecionador rastreado, preservando número e
 * texto. Devolve o original quando o href não é um link de WhatsApp.
 */
export function paraRedirecionador(
  href: string,
  extras: { posicao?: string; contexto?: string; base?: string } = {}
) {
  try {
    const url = new URL(href, "https://wa.me");
    if (!/(^|\.)wa\.me$/.test(url.hostname)) return href;
    return linkRedirecionado({
      numero: url.pathname.replace(/\D+/g, "") || undefined,
      texto: url.searchParams.get("text") ?? undefined,
      ...extras,
    });
  } catch {
    return href;
  }
}
