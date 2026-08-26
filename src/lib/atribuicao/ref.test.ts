import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { dataDoRef, extraiRef, normalizaRef, novoRef, refValido, REGEX_REF } from "./ref";

describe("código de atribuição", () => {
  it("gera código no formato esperado", () => {
    const ref = novoRef(Date.UTC(2026, 7, 20, 15, 30));
    assert.match(ref, /^FCL-[0-9A-HJKMNP-TV-Z]{8}$/);
    assert.ok(refValido(ref));
  });

  it("não repete o mesmo código dentro do mesmo minuto", () => {
    const agora = Date.UTC(2026, 7, 20, 15, 30);
    const gerados = new Set(Array.from({ length: 500 }, () => novoRef(agora)));
    // 32³ = 32768 combinações por minuto; 500 sorteios praticamente não colidem.
    assert.ok(gerados.size > 480, `esperava quase 500 únicos, veio ${gerados.size}`);
  });

  it("a parte temporal cresce com o tempo", () => {
    const cedo = novoRef(Date.UTC(2026, 0, 1, 0, 0));
    const tarde = novoRef(Date.UTC(2026, 0, 1, 0, 30));
    assert.ok(tarde.slice(4, 9) > cedo.slice(4, 9));
  });

  it("recupera a data de criação a partir do próprio código", () => {
    const momento = Date.UTC(2026, 7, 20, 15, 30);
    const data = dataDoRef(novoRef(momento));
    assert.equal(data?.toISOString(), new Date(momento).toISOString());
  });

  it("acha o código no meio da mensagem do WhatsApp", () => {
    const mensagem = "Olá! Vi o Artur 73 no site e quero as plantas.\n\n(cód. FCL-3K9M2A7B)";
    assert.equal(extraiRef(mensagem), "FCL-3K9M2A7B");
  });

  it("normaliza o que o corretor digitou errado", () => {
    assert.equal(normalizaRef("fcl 3k9m2a7b"), "FCL-3K9M2A7B");
    assert.equal(normalizaRef("3K9M2A7B"), "FCL-3K9M2A7B");
    // O e L não existem no alfabeto: viram 0 e 1 (confusão clássica ao ditar).
    assert.equal(normalizaRef("FCL-3K9M2A7O"), "FCL-3K9M2A70");
    assert.equal(normalizaRef("FCL-3K9M2A7I"), "FCL-3K9M2A71");
  });

  it("rejeita o que não é código", () => {
    assert.equal(normalizaRef("FCL-123"), undefined);
    assert.equal(normalizaRef(""), undefined);
    assert.equal(extraiRef("mensagem sem código nenhum"), undefined);
    assert.equal(refValido("FCL-3K9M2A7"), false);
  });

  it("a regex de busca não casa códigos truncados", () => {
    assert.equal(REGEX_REF.test("FCL-3K9M2A7"), false);
  });
});
