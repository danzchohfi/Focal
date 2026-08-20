import { NextResponse, type NextRequest } from "next/server";
import { COOKIE_ATRIBUICAO, COOKIE_REF, DIAS_VALIDADE } from "@/lib/atribuicao/tipos";
import { cookieDoHeader } from "@/lib/atribuicao/servidor";
import { novoRef, refValido } from "@/lib/atribuicao/ref";

/**
 * Proxy de atribuição (o antigo middleware — renomeado na convenção do
 * Next 16).
 *
 * Faz duas coisas que o navegador sozinho não consegue:
 *
 * 1. **Reemite o cookie pelo servidor.** No Safari (ITP) e no Firefox um
 *    cookie escrito por `document.cookie` morre em 7 dias. Num ciclo de venda
 *    de imóvel (30–180 dias) isso apagaria a origem antes da venda acontecer.
 *    Cookie devolvido em `Set-Cookie` numa resposta first-party não sofre esse
 *    corte, então a cada navegação a validade volta para 180 dias.
 *
 * 2. **Cria o código curto já na primeira resposta**, antes de qualquer JS —
 *    inclusive para quem chega com JS bloqueado ou sai da página em 2 s.
 *
 * Não roda no build estático (`STATIC_EXPORT=1`), onde não há servidor; nesse
 * caso a captura no cliente assume sozinha (src/lib/atribuicao/captura.ts).
 */
export function proxy(request: NextRequest) {
  const resposta = NextResponse.next();
  const cookies = request.headers.get("cookie");
  const maxAge = DIAS_VALIDADE * 86_400;
  const seguro = request.nextUrl.protocol === "https:";

  const refExistente = cookieDoHeader(cookies, COOKIE_REF);
  const ref = refValido(refExistente) ? refExistente : novoRef();
  resposta.cookies.set(COOKIE_REF, ref, {
    path: "/",
    maxAge,
    sameSite: "lax",
    secure: seguro,
    httpOnly: false,
  });

  // Limpa o cookie grande de versões anteriores: o payload da atribuição
  // agora vive no localStorage e na tabela de toques, não em todo request.
  if (cookieDoHeader(cookies, COOKIE_ATRIBUICAO)) {
    resposta.cookies.delete({ name: COOKIE_ATRIBUICAO, path: "/" });
  }

  return resposta;
}

export const config = {
  // Só documentos: assets, imagens e as próprias rotas de API ficam de fora.
  matcher: ["/((?!api|_next/static|_next/image|wp/|favicon.ico|robots.txt|sitemap.xml).*)"],
};
