import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { listaIds, paraIso, paraNumero, pega, texto } from "./util";
import { leCamposAdicionais, midiaCv, origemCv } from "./campos";

describe("leitura defensiva de campos", () => {
  it("pega o primeiro caminho que existir", () => {
    const registro = { situacao: { nome: "Vendida" }, idlead: 123 };
    assert.equal(pega(registro, "situacao.id", "situacao.nome"), "Vendida");
    assert.equal(pega(registro, "id", "idlead"), 123);
    assert.equal(pega(registro, "inexistente"), undefined);
  });

  it("string vazia conta como ausente", () => {
    assert.equal(pega({ a: "", b: "x" }, "a", "b"), "x");
  });

  it("texto ignora objetos", () => {
    assert.equal(texto({ nome: "x" }), undefined);
    assert.equal(texto(" 42 "), "42");
    assert.equal(texto(null), undefined);
  });
});

describe("valores em reais", () => {
  it("entende o formato brasileiro", () => {
    assert.equal(paraNumero("R$ 2.054.000,00"), 2_054_000);
    assert.equal(paraNumero("1.500.000,50"), 1_500_000.5);
  });

  it("entende o formato americano e número puro", () => {
    assert.equal(paraNumero("2054000.00"), 2_054_000);
    assert.equal(paraNumero(2_054_000), 2_054_000);
  });

  it("devolve indefinido quando não há número", () => {
    assert.equal(paraNumero(""), undefined);
    assert.equal(paraNumero("R$"), undefined);
    assert.equal(paraNumero(undefined), undefined);
  });
});

describe("datas do CRM", () => {
  it("converte dd/mm/aaaa no fuso de Brasília", () => {
    assert.equal(paraIso("20/08/2026"), "2026-08-20T03:00:00.000Z");
    assert.equal(paraIso("20/08/2026 14:30"), "2026-08-20T17:30:00.000Z");
    assert.equal(paraIso("20/08/2026 14:30:15"), "2026-08-20T17:30:15.000Z");
  });

  it("converte 'aaaa-mm-dd hh:mm:ss' também como horário de Brasília", () => {
    // Sem fuso explícito o CV devolve horário local do CRM — tratar como UTC
    // adiantaria a venda em 3 horas e jogaria eventos para o dia seguinte.
    assert.equal(paraIso("2026-08-20 14:30:00"), "2026-08-20T17:30:00.000Z");
  });

  it("respeita o fuso quando ele vem declarado", () => {
    assert.equal(paraIso("2026-08-20T14:30:00Z"), "2026-08-20T14:30:00.000Z");
  });

  it("devolve indefinido para lixo", () => {
    assert.equal(paraIso("não é data"), undefined);
    assert.equal(paraIso(""), undefined);
  });
});

describe("lista de ids de lead", () => {
  it("separa a lista que o CVDW manda em uma string só", () => {
    assert.deepEqual(listaIds("168523,4322"), ["168523", "4322"]);
    assert.deepEqual(listaIds("168523"), ["168523"]);
    assert.deepEqual(listaIds(""), []);
  });
});

describe("campos adicionais", () => {
  it("lê o formato de objeto (escrita)", () => {
    assert.deepEqual(leCamposAdicionais({ gclid: "ABC", lead_ref: "FCL-1" }), {
      gclid: "ABC",
      lead_ref: "FCL-1",
    });
  });

  it("lê o formato de array do GET de leads (slug)", () => {
    assert.deepEqual(leCamposAdicionais([{ slug: "gclid", valor: "ABC" }]), { gclid: "ABC" });
  });

  it("lê o formato de array do GET de reservas (nome_referencia)", () => {
    assert.deepEqual(
      leCamposAdicionais([{ idcampo_adicional: 3, nome: "GCLID", nome_referencia: "gclid", valor: "ABC" }]),
      { gclid: "ABC" }
    );
  });

  it("lê o formato do CVDW (referencia)", () => {
    assert.deepEqual(leCamposAdicionais([{ referencia: "lead_ref", valor: "FCL-1" }]), {
      lead_ref: "FCL-1",
    });
  });

  it("aguenta payload vazio ou inesperado", () => {
    assert.deepEqual(leCamposAdicionais(undefined), {});
    assert.deepEqual(leCamposAdicionais([{ valor: "sem nome" }]), {});
  });
});

describe("taxonomia do CV", () => {
  it("mapeia canal para a sigla de origem (lista fechada de 2 caracteres)", () => {
    assert.equal(origemCv("google_ads"), "GO");
    assert.equal(origemCv("meta_ads"), "FB");
    assert.equal(origemCv("google_organico"), "BO");
    assert.equal(origemCv("direto"), "SI");
    assert.equal(origemCv("qualquer_coisa"), "OU");
    for (const canal of ["google_ads", "meta_ads", "direto", "x"]) {
      assert.equal(origemCv(canal).length, 2);
    }
  });

  it("mídia respeita o limite de 45 caracteres do CV", () => {
    const atribuicao = {
      v: 1 as const,
      ref: "FCL-AAAAAAAA",
      criadoEm: "2026-03-01T00:00:00.000Z",
      toques: 1,
      primeiro: { ts: "2026-03-01T00:00:00.000Z", lp: "/", canal: "google_ads" as const },
      ultimo: {
        ts: "2026-03-01T00:00:00.000Z",
        lp: "/",
        canal: "google_ads" as const,
        utm_campaign: "9".repeat(80),
      },
    };
    assert.ok(midiaCv(atribuicao).length <= 45);
    assert.equal(midiaCv(undefined), "site");
  });
});
