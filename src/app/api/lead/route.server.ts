import { NextResponse } from "next/server";
import { resolveAtribuicao } from "@/lib/atribuicao/servidor";
import { chavesIdentidade, hasheiaIdentidade, normalizaEmail, normalizaTelefone } from "@/lib/atribuicao/identidade";
import type { PayloadLead } from "@/lib/atribuicao/tipos";
import { toqueParaRegistro } from "@/lib/dados/mapeamento";
import { repositorio } from "@/lib/dados/repositorio";
import type { RegistroEvento, RegistroLead } from "@/lib/dados/tipos";
import { enviaLeadParaCrm } from "@/lib/cvcrm/leads";

/**
 * Recepção de leads do formulário.
 *
 * Além de encaminhar o lead, grava no warehouse de atribuição a ligação
 * código ↔ campanha ↔ contato. É essa linha que, meses depois, permite dizer
 * de qual anúncio veio a venda.
 */
export const runtime = "nodejs";

export async function POST(request: Request) {
  const corpo = (await request.json().catch(() => null)) as PayloadLead | null;

  if (!corpo?.nome || !corpo?.email || !corpo?.telefone) {
    return NextResponse.json({ ok: false, error: "dados incompletos" }, { status: 400 });
  }

  const cookies = request.headers.get("cookie");
  const atribuicao = resolveAtribuicao(corpo.atribuicao, cookies);
  const recebidoEm = new Date().toISOString();

  const email = normalizaEmail(corpo.email);
  const telefone = normalizaTelefone(corpo.telefone);
  const chaves = chavesIdentidade({ email: corpo.email, telefone: corpo.telefone });
  const hashes = await hasheiaIdentidade({
    email: corpo.email,
    telefone: corpo.telefone,
    nome: corpo.nome,
  });

  const ref = atribuicao?.ref;
  // Mesma pessoa reenviando o formulário atualiza a linha em vez de duplicar.
  const id = `${ref ?? "sem-ref"}|${chaves[0] ?? email ?? recebidoEm}`;

  const lead: RegistroLead = {
    id,
    ref: ref ?? "",
    criadoEm: recebidoEm,
    nome: String(corpo.nome).slice(0, 200),
    email,
    telefone: String(corpo.telefone).slice(0, 40),
    telefoneNormalizado: telefone,
    emailSha256: hashes.emailSha256,
    telefoneSha256: hashes.telefoneSha256Meta,
    chaves,
    contexto: corpo.contexto,
    origem: corpo.origem,
    assunto: corpo.assunto,
    quando: corpo.quando,
    orcamento: corpo.orcamento,
    mensagem: corpo.mensagem ? String(corpo.mensagem).slice(0, 2000) : undefined,
    consentimento: corpo.consentimento,
    atribuicao,
  };

  const evento: RegistroEvento = {
    id: `site|lead|${id}`,
    ref,
    chaves,
    etapa: "lead",
    ts: recebidoEm,
    moeda: "BRL",
    fonte: "site",
    fonteId: id,
    empreendimento: corpo.contexto,
  };

  const banco = repositorio();
  const gravacoes: Promise<unknown>[] = [banco.salvaLeads([lead]), banco.salvaEventos([evento])];
  if (atribuicao) {
    gravacoes.push(
      banco.salvaToques([
        toqueParaRegistro({
          tipo: "formulario",
          ts: recebidoEm,
          ref: atribuicao.ref,
          atribuicao,
          contexto: corpo.contexto,
          pagina: corpo.origem,
        }),
      ])
    );
  }

  const resultados = await Promise.allSettled(gravacoes);
  for (const resultado of resultados) {
    if (resultado.status === "rejected") console.error("[lead] falha ao gravar", resultado.reason);
  }

  // Espelho para o CRM: não bloqueia a resposta ao visitante.
  const crm = await enviaLeadParaCrm(lead).catch((erro) => {
    console.error("[lead] falha ao enviar ao CVCRM", erro);
    return undefined;
  });
  if (crm?.crmId) {
    await banco.salvaLeads([{ ...lead, crmId: crm.crmId }]).catch(() => undefined);
  }

  return NextResponse.json({ ok: true, ref: ref ?? null });
}
