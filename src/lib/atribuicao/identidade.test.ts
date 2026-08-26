import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  chaveEmail,
  chavesIdentidade,
  hasheiaIdentidade,
  normalizaEmail,
  normalizaEmailGoogle,
  normalizaNome,
  normalizaTelefone,
  sha256,
  telefoneE164,
  variantesTelefone,
} from "./identidade";

describe("telefone brasileiro", () => {
  it("normaliza os formatos que o formulário recebe", () => {
    for (const bruto of [
      "(11) 99888-7777",
      "11998887777",
      "+55 11 99888-7777",
      "5511998887777",
      "011 99888 7777",
    ]) {
      assert.equal(normalizaTelefone(bruto), "5511998887777", `falhou em ${bruto}`);
    }
  });

  it("aceita fixo de 8 dígitos", () => {
    assert.equal(normalizaTelefone("(11) 3136-0142"), "551131360142");
  });

  it("recusa número sem DDD", () => {
    assert.equal(normalizaTelefone("99888777"), undefined);
    assert.equal(normalizaTelefone(""), undefined);
    assert.equal(normalizaTelefone("abc"), undefined);
  });

  it("gera variante sem o 9º dígito para casar com base antiga do CRM", () => {
    const variantes = variantesTelefone("11998887777");
    assert.ok(variantes.includes("5511998887777"));
    assert.ok(variantes.includes("551198887777"));
  });

  it("E.164 com + é o formato do Google Ads", () => {
    assert.equal(telefoneE164("11998887777"), "+5511998887777");
  });
});

describe("e-mail", () => {
  it("normaliza só com trim e minúsculas (regra de Google e Meta)", () => {
    assert.equal(normalizaEmail("  Cliente@Focalinc.com.BR "), "cliente@focalinc.com.br");
  });

  it("recusa e-mail inválido", () => {
    assert.equal(normalizaEmail("cliente@"), undefined);
    assert.equal(normalizaEmail("sem-arroba"), undefined);
  });

  it("normalização do Google aplica a regra do Gmail só no Gmail", () => {
    assert.equal(normalizaEmailGoogle("Jo.ao+imovel@Gmail.com"), "joao@gmail.com");
    assert.equal(normalizaEmailGoogle("jo.ao+x@focalinc.com.br"), "jo.ao+x@focalinc.com.br");
    assert.equal(normalizaEmailGoogle("invalido"), undefined);
  });

  it("chave interna ignora ponto e +tag no gmail", () => {
    assert.equal(chaveEmail("jo.ao+imovel@gmail.com"), "joao@gmail.com");
    // Fora do gmail o ponto é significativo e precisa ser mantido.
    assert.equal(chaveEmail("jo.ao@focalinc.com.br"), "jo.ao@focalinc.com.br");
  });
});

describe("hash de identidade", () => {
  it("usa SHA-256 hex minúsculo", async () => {
    // Vetor conhecido: SHA-256 de "abc".
    assert.equal(
      await sha256("abc"),
      "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad"
    );
  });

  it("hasheia telefone nos dois formatos exigidos", async () => {
    const hashes = await hasheiaIdentidade({ telefone: "(11) 99888-7777" });
    assert.equal(hashes.telefoneSha256Google, await sha256("+5511998887777"));
    assert.equal(hashes.telefoneSha256Meta, await sha256("5511998887777"));
    assert.notEqual(hashes.telefoneSha256Google, hashes.telefoneSha256Meta);
  });

  it("separa primeiro nome e sobrenome sem acento", async () => {
    const hashes = await hasheiaIdentidade({ nome: "José Antônio da Silva" });
    assert.equal(hashes.primeiroNomeSha256, await sha256("jose"));
    assert.equal(hashes.sobrenomeSha256, await sha256("silva"));
  });

  it("não inventa hash quando o dado não veio", async () => {
    const hashes = await hasheiaIdentidade({ email: "invalido" });
    assert.equal(hashes.emailSha256Meta, undefined);
    assert.equal(hashes.emailSha256Google, undefined);
    assert.equal(hashes.telefoneSha256Meta, undefined);
  });

  it("e-mail tem hash diferente por plataforma no Gmail", async () => {
    // Regra do Google: no gmail.com, ponto e sufixo +tag saem antes do hash.
    // A Meta só faz trim + minúsculas. Usar o mesmo hash nos dois lados zera o
    // match de um dos dois, sem nenhum erro.
    const hashes = await hasheiaIdentidade({ email: "Jo.ao+imovel@Gmail.com" });
    assert.equal(hashes.emailSha256Google, await sha256("joao@gmail.com"));
    assert.equal(hashes.emailSha256Meta, await sha256("jo.ao+imovel@gmail.com"));
    assert.notEqual(hashes.emailSha256Google, hashes.emailSha256Meta);
  });

  it("fora do Gmail os dois hashes coincidem", async () => {
    const hashes = await hasheiaIdentidade({ email: "jo.ao+imovel@focalinc.com.br" });
    assert.equal(hashes.emailSha256Google, hashes.emailSha256Meta);
    assert.equal(hashes.emailSha256Google, await sha256("jo.ao+imovel@focalinc.com.br"));
  });
});

describe("normalizaNome", () => {
  it("remove acento e pontuação", () => {
    assert.equal(normalizaNome("  José   Antônio-Silva "), "jose antoniosilva");
  });
});

describe("chaves de identidade", () => {
  it("prioriza telefone sobre e-mail", () => {
    const chaves = chavesIdentidade({ telefone: "11998887777", email: "a@b.com" });
    assert.ok(chaves[0].startsWith("tel:"));
    assert.ok(chaves.includes("email:a@b.com"));
  });
});
