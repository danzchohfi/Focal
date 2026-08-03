"use client";

import { useState } from "react";
import { site, waLink } from "@/lib/site";

type Variant = "artur" | "entregue" | "atendimento";
type Tone = "verde" | "claro" | "escuro";

const ASSUNTOS = ["Vendas", "Assistência Técnica", "Fornecedores", "Terrenos"];
const QUANDO = ["Neste mês", "Daqui 1 a 3 meses", "Acima de 3 meses"];
const ORCAMENTO = ["Abaixo de 1 mi", "Entre 1 mi e 1,5 mi", "Entre 1,5 mi e 2,0 mi"];

// Formulário de atendimento (mesmos campos do CF7 do site atual).
// Envia para /api/lead quando disponível; no build estático cai no WhatsApp.
export default function LeadForm({
  variant,
  tone,
  contexto,
  className = "",
}: {
  variant: Variant;
  tone: Tone;
  contexto?: string;
  className?: string;
}) {
  const [estado, setEstado] = useState<"idle" | "enviando" | "ok" | "erro">("idle");

  const input =
    tone === "escuro"
      ? "w-full border border-white/60 bg-transparent px-4 py-3 text-[15px] text-white placeholder-white/85 outline-none focus:border-white"
      : "w-full border border-black/15 bg-white px-4 py-3 text-[15px] text-black placeholder-black/60 outline-none focus:border-black/40";
  const select =
    tone === "escuro"
      ? `${input} appearance-none`
      : `${input} appearance-none`;

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());
    const payload = { ...data, contexto: contexto ?? "site", origem: window.location.pathname };

    setEstado("enviando");
    try {
      const res = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(String(res.status));
      setEstado("ok");
      form.reset();
    } catch {
      // Build estático (GitHub Pages) não tem API: encaminha via WhatsApp com contexto.
      const texto = `Olá Focal Inc! Meu nome é ${data["nome"] ?? ""}. ${
        contexto ? `Tenho interesse em: ${contexto}. ` : ""
      }${data["assunto"] ? `Assunto: ${data["assunto"]}. ` : ""}${
        data["mensagem"] ? `Mensagem: ${data["mensagem"]}` : ""
      }`;
      window.open(waLink(site.whatsappComercial, texto), "_blank", "noopener");
      setEstado("ok");
    }
  }

  if (estado === "ok") {
    return (
      <div className={`${className} py-8 text-center`}>
        <p className={`din text-[22px] ${tone === "verde" || tone === "escuro" ? "text-white" : "text-ink-2"}`}>
          Recebemos seus dados!
        </p>
        <p className={`mt-2 text-[15px] ${tone === "verde" || tone === "escuro" ? "text-white/90" : "text-black/70"}`}>
          Nossa equipe entrará em contato em breve.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className={`${className} space-y-3`}>
      <input required name="nome" type="text" placeholder="Nome Completo" className={input} />
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <input required name="email" type="email" placeholder="E-mail" className={input} />
        <input required name="telefone" type="tel" placeholder="Telefone" className={input} />
      </div>
      <select name="assunto" className={select} defaultValue="Vendas" aria-label="Assunto">
        {ASSUNTOS.map((a) => (
          <option key={a}>{a}</option>
        ))}
      </select>

      {variant === "artur" && (
        <>
          <select name="quando" className={select} defaultValue="" aria-label="Quando pretende adquirir o imóvel">
            <option value="" disabled>
              Quando pretende adquirir o imóvel
            </option>
            {QUANDO.map((q) => (
              <option key={q}>{q}</option>
            ))}
          </select>
          <select name="orcamento" className={select} defaultValue="" aria-label="Qual o seu orçamento">
            <option value="" disabled>
              Qual o seu orçamento
            </option>
            {ORCAMENTO.map((o) => (
              <option key={o}>{o}</option>
            ))}
          </select>
        </>
      )}

      {variant !== "artur" && (
        <textarea name="mensagem" placeholder="Mensagem" rows={4} className={input} />
      )}

      <button
        type="submit"
        disabled={estado === "enviando"}
        className="bg-ink px-8 py-3.5 text-[12px] font-semibold uppercase tracking-wider text-white transition-opacity hover:opacity-85 disabled:opacity-50"
      >
        {estado === "enviando" ? "Enviando…" : "Solicitar Atendimento"}
      </button>
    </form>
  );
}
