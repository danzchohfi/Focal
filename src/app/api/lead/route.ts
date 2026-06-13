import { NextResponse } from "next/server";

/**
 * Recebe leads do formulário com intenção + empreendimento + origem (UTMs).
 *
 * TODO (go-live): integrar com o destino oficial de leads da Focal —
 * Staple/CRM e/ou notificação por e-mail. Definir endpoint/credenciais com
 * a equipe (docs/plano-site-focal.md §7).
 */
export async function POST(request: Request) {
  const body = await request.json().catch(() => null);

  if (!body?.nome || !body?.email || !body?.telefone) {
    return NextResponse.json({ ok: false, error: "dados incompletos" }, { status: 400 });
  }

  const webhook = process.env.LEAD_WEBHOOK_URL;
  if (webhook) {
    await fetch(webhook, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...body, recebidoEm: new Date().toISOString() }),
    }).catch(() => {
      // não bloqueia o usuário se o webhook falhar; lead fica no log
    });
  }

  console.log("[lead]", JSON.stringify(body));
  return NextResponse.json({ ok: true });
}
