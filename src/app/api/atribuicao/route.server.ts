import { NextResponse } from "next/server";
import { validaAtribuicao, refDoCookie } from "@/lib/atribuicao/servidor";
import type { EventoAtribuicao } from "@/lib/atribuicao/eventos";
import { toqueParaRegistro } from "@/lib/dados/mapeamento";
import { repositorio } from "@/lib/dados/repositorio";

/**
 * Registra um toque de atribuição.
 *
 * Chamado pelo navegador quando (a) uma visita chega de campanha, (b) alguém
 * clica num CTA de WhatsApp — e leva o código embora — ou (c) um formulário é
 * enviado. É o que garante que, quando o código voltar pelo CRM meses depois,
 * exista deste lado uma linha dizendo de qual anúncio ele saiu.
 *
 * Sempre responde 204: é chamado via `sendBeacon` durante a navegação para
 * fora e ninguém está lendo a resposta.
 */
export const runtime = "nodejs";

const TIPOS_VALIDOS = new Set(["toque", "whatsapp", "formulario"]);

export async function POST(request: Request) {
  const corpo = (await request.json().catch(() => null)) as EventoAtribuicao | null;
  const atribuicao = validaAtribuicao(corpo?.atribuicao);

  if (!corpo || !atribuicao || !TIPOS_VALIDOS.has(corpo.tipo)) {
    return new NextResponse(null, { status: 204 });
  }

  const evento: EventoAtribuicao = {
    ...corpo,
    atribuicao,
    // O `ref` do corpo é o que realmente viajou na mensagem do WhatsApp — é
    // ele que precisa casar quando o código voltar pelo CRM. O cookie só
    // entra se o corpo vier sem código válido.
    ref: atribuicao.ref || refDoCookie(request.headers.get("cookie")) || "",
    ts: typeof corpo.ts === "string" ? corpo.ts : new Date().toISOString(),
  };

  try {
    await repositorio().salvaToques([toqueParaRegistro(evento)]);
  } catch (erro) {
    console.error("[atribuicao] falha ao gravar toque", erro);
  }

  return new NextResponse(null, { status: 204 });
}
