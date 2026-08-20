import { NextResponse } from "next/server";
import { configCvcrm } from "@/lib/cvcrm/config";
import { buscaLeadCrm, leadParaEvento } from "@/lib/cvcrm/leads";
import { reservaParaEvento } from "@/lib/cvcrm/vendas";
import { chamadaRest } from "@/lib/cvcrm/http";
import { ROTAS } from "@/lib/cvcrm/config";
import { pega } from "@/lib/cvcrm/util";
import { repositorio } from "@/lib/dados/repositorio";

/**
 * Receptor dos webhooks do CVCRM (funcionalidades LD = leads e RS = reservas).
 *
 * O payload do CV é mínimo — `{"idlead": 1}` ou `{"idreserva": 1}` — então cada
 * disparo exige uma consulta de enriquecimento. Isso é bom para segurança: o
 * conteúdo do webhook nunca é levado a sério, tudo é reconsultado com
 * credencial. Como o CV não assina os disparos, a proteção é o segredo na URL
 * (`?k=`), que deve ter alta entropia.
 *
 * Cadastro no CV: Configurações > Integrações > novo webhook, funcionalidade
 * Leads (gatilho "Alteração para situações definidas") e Reservas (gatilhos
 * "Alteração para situações definidas" e "Contrato gerado").
 */
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Bruto = Record<string, unknown>;

async function buscaReservaCrm(idreserva: string) {
  const config = configCvcrm();
  if (!config) return undefined;
  const resposta = (await chamadaRest(
    config,
    `${ROTAS.listarReservas}?${new URLSearchParams({ idreserva })}`
  )) as Bruto | undefined;
  const lista = pega(resposta, "reservas", "dados");
  if (Array.isArray(lista)) return lista[0] as Bruto | undefined;
  return resposta;
}

export async function POST(request: Request) {
  const segredo = process.env.CVCRM_WEBHOOK_SEGREDO;
  const url = new URL(request.url);
  if (!segredo || url.searchParams.get("k") !== segredo) {
    return NextResponse.json({ ok: false }, { status: 404 });
  }

  const config = configCvcrm();
  if (!config) return NextResponse.json({ ok: false, erro: "cvcrm não configurado" }, { status: 503 });

  const corpo = (await request.json().catch(() => null)) as Bruto | null;
  const idlead = pega(corpo ?? {}, "idlead", "idLead");
  const idreserva = pega(corpo ?? {}, "idreserva", "idReserva");

  try {
    if (idlead) {
      const registro = await buscaLeadCrm(String(idlead));
      if (registro) await repositorio().salvaEventos([leadParaEvento(registro, config)]);
    } else if (idreserva) {
      const registro = await buscaReservaCrm(String(idreserva));
      if (registro) await repositorio().salvaEventos([reservaParaEvento(registro, config)]);
    } else {
      return NextResponse.json({ ok: false, erro: "payload sem id" }, { status: 400 });
    }
  } catch (erro) {
    console.error("[webhook cvcrm] falha", erro);
    // 500 faz o CV registrar a falha no painel CVIO, onde dá para reprocessar.
    return NextResponse.json({ ok: false }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
