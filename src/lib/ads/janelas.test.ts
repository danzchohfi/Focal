import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { avaliaConversaoGoogle, JANELA_GCLID_DIAS, JANELA_IDENTIDADE_DIAS } from "./google/conversoes";
import { avaliaConversaoMeta, montaEventoMeta, seraAtribuido } from "./meta/conversoes";
import type { ConversaoOffline } from "./tipos";

const AGORA = Date.now();
const dias = (n: number) => new Date(AGORA - n * 86_400_000).toISOString();

function conversao(extra: Partial<ConversaoOffline> = {}): ConversaoOffline {
  return {
    etapa: "venda",
    ts: dias(1),
    valor: 2_054_000,
    idTransacao: "reserva-42",
    gclid: "ABC",
    tsClique: dias(30),
    ...extra,
  };
}

describe("janela do Google", () => {
  it("aceita venda dentro dos 90 dias do clique", () => {
    assert.equal(avaliaConversaoGoogle(conversao()).pode, true);
  });

  it("recusa quando o clique é mais velho que 90 dias", () => {
    const fora = avaliaConversaoGoogle(conversao({ tsClique: dias(120), ts: dias(1) }));
    assert.equal(fora.pode, false);
    assert.match(String((fora as { motivo: string }).motivo), new RegExp(String(JANELA_GCLID_DIAS)));
  });

  it("sem click id a janela cai para 63 dias", () => {
    const semClique = conversao({
      gclid: undefined,
      emailSha256: "a".repeat(64),
      tsClique: dias(70),
    });
    const fora = avaliaConversaoGoogle(semClique);
    assert.equal(fora.pode, false);
    assert.match(
      String((fora as { motivo: string }).motivo),
      new RegExp(String(JANELA_IDENTIDADE_DIAS))
    );
    // O mesmo caso com 40 dias passa.
    assert.equal(avaliaConversaoGoogle({ ...semClique, tsClique: dias(40) }).pode, true);
  });

  it("recusa mais de um click id (o Google aceita exatamente um)", () => {
    const invalida = avaliaConversaoGoogle(conversao({ gclid: "A", gbraid: "B" }));
    assert.equal(invalida.pode, false);
  });

  it("recusa quando não há gclid nem identidade", () => {
    assert.equal(avaliaConversaoGoogle(conversao({ gclid: undefined })).pode, false);
  });

  it("recusa clique de menos de 6 horas (ainda em processamento)", () => {
    const recente = avaliaConversaoGoogle(
      conversao({ tsClique: new Date(AGORA - 2 * 3_600_000).toISOString(), ts: dias(0) })
    );
    assert.equal(recente.pode, false);
  });

  it("recusa conversão anterior ao clique", () => {
    assert.equal(avaliaConversaoGoogle(conversao({ tsClique: dias(1), ts: dias(10) })).pode, false);
  });
});

describe("janela da Meta", () => {
  // A Meta não conhece gclid: o identificador dela é fbc, telefone/e-mail
  // hasheado, external_id ou ctwa_clid.
  const paraMeta = (extra: Partial<ConversaoOffline> = {}) =>
    conversao({ fbc: "fb.1.1756000000000.IwAR123", ...extra });

  it("aceita venda offline de até 62 dias", () => {
    assert.equal(avaliaConversaoMeta(paraMeta({ ts: dias(40) })).pode, true);
    assert.equal(avaliaConversaoMeta(paraMeta({ ts: dias(80) })).pode, false);
  });

  it("evento de CTWA tem teto de 7 dias", () => {
    const ctwa = { ctwaClid: "ARC123", gclid: undefined };
    assert.equal(avaliaConversaoMeta(conversao({ ...ctwa, ts: dias(3) })).pode, true);
    assert.equal(avaliaConversaoMeta(conversao({ ...ctwa, ts: dias(20) })).pode, false);
  });

  it("recusa sem nenhum identificador aceito", () => {
    assert.equal(avaliaConversaoMeta(conversao({ gclid: undefined })).pode, false);
  });

  it("separa 'pode enviar' de 'vai ser atribuído'", () => {
    // Envio aceito (35 dias < 62) mas fora da janela de atribuição de 7 dias.
    const tardia = conversao({ ts: dias(35), tsClique: dias(120), fbc: "fb.1.1.A" });
    assert.equal(avaliaConversaoMeta(tardia).pode, true);
    assert.equal(seraAtribuido(tardia), false);
    assert.equal(seraAtribuido(conversao({ ts: dias(1), tsClique: dias(3), fbc: "fb.1.1.A" })), true);
  });
});

describe("payload da Meta", () => {
  it("venda de CRM vai como evento de loja física", () => {
    const evento = montaEventoMeta(conversao({ fbc: "fb.1.1.A", telefoneSha256Meta: "b".repeat(64) }));
    assert.equal(evento.event_name, "Purchase");
    assert.equal(evento.action_source, "physical_store");
    assert.equal(evento.custom_data.value, 2_054_000);
    assert.equal(evento.custom_data.currency, "BRL");
    assert.equal(evento.custom_data.order_id, "reserva-42");
    // fbc não é hasheado; telefone é.
    assert.equal(evento.user_data.fbc, "fb.1.1.A");
    assert.deepEqual(evento.user_data.ph, ["b".repeat(64)]);
  });

  it("conversa de anúncio exige business_messaging + whatsapp juntos", () => {
    const evento = montaEventoMeta(conversao({ ctwaClid: "ARC123" }));
    assert.equal(evento.action_source, "business_messaging");
    assert.equal((evento as { messaging_channel?: string }).messaging_channel, "whatsapp");
    assert.equal(evento.user_data.ctwa_clid, "ARC123");
  });

  it("event_time é em segundos", () => {
    const evento = montaEventoMeta(conversao({ ts: "2026-08-20T12:00:00.000Z" }));
    assert.equal(evento.event_time, Math.floor(Date.parse("2026-08-20T12:00:00.000Z") / 1000));
    assert.ok(String(evento.event_time).length === 10);
  });

  it("lead qualificado vira QualifiedLead com valor-proxy", () => {
    const evento = montaEventoMeta(conversao({ etapa: "qualificado", valor: 40_000 }));
    assert.equal(evento.event_name, "QualifiedLead");
    assert.equal(evento.custom_data.value, 40_000);
  });

  it("apenasMedicao marca opt_out para não treinar a entrega", () => {
    const evento = montaEventoMeta(conversao(), { apenasMedicao: true });
    assert.equal((evento as { opt_out?: boolean }).opt_out, true);
  });
});
