import { NextResponse } from "next/server";
import { site, waLink } from "@/lib/site";
import { COOKIE_REF, DIAS_VALIDADE } from "@/lib/atribuicao/tipos";
import { refDoCookie } from "@/lib/atribuicao/servidor";
import { consolidaAtribuicao, montaFbc, montaToque } from "@/lib/atribuicao/toque";
import { novoRef, refValido } from "@/lib/atribuicao/ref";
import { linhaCodigo } from "@/lib/atribuicao/mensagem";
import { toqueParaRegistro } from "@/lib/dados/mapeamento";
import { repositorio } from "@/lib/dados/repositorio";

/**
 * Redirecionador rastreado para o WhatsApp.
 *
 * Resolve os dois pontos cegos do clique feito no navegador:
 *
 *  • **Registro garantido.** O `sendBeacon` disparado no clique compete com a
 *    navegação para fora e pode ser descartado. Aqui o registro acontece no
 *    servidor, antes do redirect — se a pessoa chegou nesta rota, o código já
 *    está gravado com a campanha de origem.
 *
 *  • **Anúncio que vai direto para a conversa.** Campanhas de clique-para-
 *    WhatsApp podem apontar a URL final para cá (com gclid/UTM na query) em vez
 *    de para o wa.me. Assim o clique pago é capturado mesmo sem visita ao site,
 *    que hoje é justamente onde a atribuição some.
 *
 * Parâmetros: `n` número, `t` texto da mensagem, `p` posição do CTA,
 * `c` contexto/empreendimento. Todo o resto da query é lido como origem.
 */
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Só números da Focal podem ser destino — a rota não vira redirect aberto. */
const NUMEROS_PERMITIDOS = new Set([site.whatsapp, site.whatsappComercial]);

export async function GET(request: Request) {
  const url = new URL(request.url);
  const agora = Date.now();

  const numeroPedido = (url.searchParams.get("n") ?? "").replace(/\D+/g, "");
  const numero = NUMEROS_PERMITIDOS.has(numeroPedido) ? numeroPedido : site.whatsapp;
  const texto = url.searchParams.get("t") ?? "Olá Focal Inc! Vim pelo site.";
  const posicao = url.searchParams.get("p") ?? undefined;
  const contexto = url.searchParams.get("c") ?? undefined;

  const cookies = request.headers.get("cookie");
  const refCookie = refDoCookie(cookies);
  const ref = refValido(refCookie) ? refCookie : novoRef(agora);

  // O toque é gravado como observado aqui. A consolidação primeiro/último não
  // depende deste registro: o relatório reconstrói a jornada ordenando todos os
  // toques do mesmo código.
  const toque = montaToque(request.url, request.headers.get("referer") ?? "", agora);
  const atribuicao = consolidaAtribuicao(undefined, toque, ref, agora);

  const fbclid = atribuicao.ultimo.fbclid ?? atribuicao.primeiro.fbclid;
  if (fbclid && !atribuicao.fbc) atribuicao.fbc = montaFbc(fbclid, url.hostname, agora);

  try {
    await repositorio().salvaToques([
      toqueParaRegistro({
        tipo: "whatsapp",
        ts: new Date(agora).toISOString(),
        ref: atribuicao.ref,
        atribuicao,
        contexto,
        posicao,
        pagina: url.pathname,
      }),
    ]);
  } catch (erro) {
    // Registro é importante, mas nunca pode segurar o visitante na frente de
    // uma tela em branco — o redirect acontece de qualquer forma.
    console.error("[ir/whatsapp] falha ao gravar toque", erro);
  }

  const destino = waLink(numero, `${texto.trim()}\n\n${linhaCodigo(atribuicao.ref)}`);
  const resposta = NextResponse.redirect(destino, 302);
  const opcoes = {
    path: "/",
    maxAge: DIAS_VALIDADE * 86_400,
    sameSite: "lax" as const,
    secure: url.protocol === "https:",
    httpOnly: false,
  };
  resposta.cookies.set(COOKIE_REF, atribuicao.ref, opcoes);
  // Um redirect de conversão nunca deve ser cacheado por CDN.
  resposta.headers.set("Cache-Control", "no-store");
  return resposta;
}
