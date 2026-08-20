import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { classificaCanal, consolidaAtribuicao, dominioCookie, montaFbc, montaToque, toqueTemOrigem } from "./toque";
import { comCodigo, linhaCodigo } from "./mensagem";
import { extraiRef } from "./ref";

const SITE = "https://focalinc.com.br";

function canal(query: string, referrer = "") {
  return montaToque(`${SITE}/artur-73${query}`, referrer).canal;
}

describe("classificação de canal", () => {
  it("click id manda mais que UTM", () => {
    // Anúncio com UTM errado ainda é reconhecido pelo gclid.
    assert.equal(canal("?gclid=ABC123&utm_source=instagram&utm_medium=social"), "google_ads");
    assert.equal(canal("?fbclid=XYZ&utm_source=google"), "meta_ads");
  });

  it("reconhece os click ids de iOS do Google", () => {
    assert.equal(canal("?gbraid=ABC"), "google_ads");
    assert.equal(canal("?wbraid=ABC"), "google_ads");
  });

  it("usa UTM quando não há click id", () => {
    assert.equal(canal("?utm_source=google&utm_medium=cpc"), "google_ads");
    assert.equal(canal("?utm_source=instagram&utm_medium=paid_social"), "meta_ads");
    assert.equal(canal("?utm_source=newsletter&utm_medium=email"), "email");
  });

  it("cai no referrer quando não há nada na URL", () => {
    assert.equal(canal("", "https://www.google.com/search"), "google_organico");
    assert.equal(canal("", "https://www.instagram.com/"), "social_organico");
    assert.equal(canal("", "https://algumsite.com.br/"), "referral");
    assert.equal(canal("", ""), "direto");
  });

  it("navegação interna não vira referral", () => {
    assert.equal(canal("", `${SITE}/sobre`), "direto");
  });

  it("classificaCanal aceita params soltos", () => {
    assert.equal(classificaCanal(new URLSearchParams("utm_medium=cpc&utm_source=bing")), "microsoft_ads");
  });
});

describe("montaToque", () => {
  it("guarda os IDs de mídia do template de tagueamento", () => {
    const toque = montaToque(
      `${SITE}/artur-73?gclid=ABC&utm_source=google&utm_medium=cpc&utm_campaign=22110044&ag=1810&utm_content=7761&utm_term=apartamento+pinheiros&mt=p&net=g&dev=m`,
      ""
    );
    assert.equal(toque.gclid, "ABC");
    assert.equal(toque.utm_campaign, "22110044");
    assert.equal(toque.ag, "1810");
    assert.equal(toque.utm_content, "7761");
    assert.equal(toque.utm_term, "apartamento pinheiros");
    assert.equal(toque.lp, "/artur-73");
  });

  it("trunca valor gigante na querystring", () => {
    const toque = montaToque(`${SITE}/?utm_campaign=${"x".repeat(500)}`, "");
    assert.equal(toque.utm_campaign?.length, 200);
  });

  it("visita direta não conta como toque de origem", () => {
    assert.equal(toqueTemOrigem(montaToque(`${SITE}/`, "")), false);
    assert.equal(toqueTemOrigem(montaToque(`${SITE}/?gclid=A`, "")), true);
  });
});

describe("consolidação primeiro/último toque", () => {
  const google = montaToque(`${SITE}/artur-73?gclid=A&utm_campaign=1`, "", Date.parse("2026-03-01T10:00:00Z"));
  const meta = montaToque(`${SITE}/artur-73?fbclid=B&utm_campaign=2`, "", Date.parse("2026-04-01T10:00:00Z"));
  const direto = montaToque(`${SITE}/artur-73`, "", Date.parse("2026-05-01T10:00:00Z"));

  it("primeiro toque com origem fica gravado como primeiro", () => {
    const um = consolidaAtribuicao(undefined, google, "FCL-AAAAAAAA");
    const dois = consolidaAtribuicao(um, meta, "FCL-AAAAAAAA");
    assert.equal(dois.primeiro.gclid, "A");
    assert.equal(dois.ultimo.fbclid, "B");
    assert.equal(dois.toques, 2);
  });

  it("visita direta não apaga a campanha que trouxe a pessoa", () => {
    const um = consolidaAtribuicao(undefined, google, "FCL-AAAAAAAA");
    const dois = consolidaAtribuicao(um, direto, "FCL-AAAAAAAA");
    assert.equal(dois.ultimo.gclid, "A");
    assert.equal(dois.toques, 1);
  });

  it("primeira campanha substitui um primeiro toque direto", () => {
    const um = consolidaAtribuicao(undefined, direto, "FCL-AAAAAAAA");
    assert.equal(um.toques, 0);
    const dois = consolidaAtribuicao(um, google, "FCL-AAAAAAAA");
    assert.equal(dois.primeiro.gclid, "A");
  });

  it("recarregar a mesma página não infla a contagem", () => {
    const um = consolidaAtribuicao(undefined, google, "FCL-AAAAAAAA");
    const dois = consolidaAtribuicao(um, google, "FCL-AAAAAAAA");
    assert.equal(dois.toques, 1);
  });
});

describe("_fbc", () => {
  it("segue o formato fb.{subdominio}.{ms}.{fbclid}", () => {
    const fbc = montaFbc("IwAR123", "focalinc.com.br", 1_756_000_000_000);
    assert.equal(fbc, "fb.1.1756000000000.IwAR123");
  });

  it("subdomínio conta um nível a mais em www", () => {
    assert.match(montaFbc("A", "www.focalinc.com.br", 1), /^fb\.2\./);
  });

  it("não modifica o fbclid (a Meta trata como opaco e case-sensitive)", () => {
    const fbclid = "IwZXh0bgNhZW0BMABhZGlkAasdA_aa1";
    assert.ok(montaFbc(fbclid, "focalinc.com.br", 1).endsWith(fbclid));
  });
});

describe("domínio do cookie", () => {
  it("usa o domínio registrável em .com.br", () => {
    assert.equal(dominioCookie("www.focalinc.com.br"), ".focalinc.com.br");
    assert.equal(dominioCookie("cliente.focalinc.com.br"), ".focalinc.com.br");
  });

  it("não define domínio para host raiz nem localhost", () => {
    assert.equal(dominioCookie("focalinc.com.br"), undefined);
    assert.equal(dominioCookie("localhost"), undefined);
    assert.equal(dominioCookie("127.0.0.1"), undefined);
  });
});

describe("código na mensagem do WhatsApp", () => {
  const ref = "FCL-3K9M2A7B";

  it("acrescenta o código no fim do texto pré-preenchido", () => {
    const href = comCodigo("https://wa.me/551148589385?text=Ol%C3%A1%21%20Quero%20as%20plantas", ref);
    const texto = new URL(href).searchParams.get("text")!;
    assert.ok(texto.startsWith("Olá! Quero as plantas"));
    assert.ok(texto.endsWith(linhaCodigo(ref)));
    assert.equal(extraiRef(texto), ref);
  });

  it("cria um texto quando o link não tem nenhum", () => {
    const texto = new URL(comCodigo("https://wa.me/551148589385", ref)).searchParams.get("text")!;
    assert.equal(extraiRef(texto), ref);
  });

  it("não duplica o código se já estiver lá", () => {
    const uma = comCodigo("https://wa.me/551148589385?text=oi", ref);
    const duas = comCodigo(uma, ref);
    assert.equal(duas.match(/FCL-/g)?.length, 1);
  });

  it("sem código, devolve o link intacto", () => {
    const href = "https://wa.me/551148589385?text=oi";
    assert.equal(comCodigo(href, undefined), href);
  });
});
