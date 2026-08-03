"use client";

import { useState } from "react";
import { site, waLink } from "@/lib/site";

type Variant = "artur" | "entregue" | "atendimento";
type Tone = "verde" | "claro" | "escuro";

const ASSUNTOS = ["Vendas", "Assistência Técnica", "Fornecedores", "Terrenos"];
const QUANDO = ["Neste mês", "Daqui 1 a 3 meses", "Acima de 3 meses"];
const ORCAMENTO = ["Abaixo de 1 mi", "Entre 1 mi e 1,5 mi", "Entre 1,5 mi e 2,0 mi"];

function Chevron({ dark }: { dark: boolean }) {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className={`pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 ${dark ? "text-white/80" : "text-black/50"}`}
      aria-hidden
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

// Formulário de atendimento (mesmos campos do CF7 do site atual).
// Envia para /api/lead quando disponível; no build estático oferece o
// encaminhamento via WhatsApp com mensagem contextual.
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
  const [estado, setEstado] = useState<"idle" | "enviando" | "ok" | "fallback">("idle");
  const [waHref, setWaHref] = useState<string>();

  const darkField = tone !== "claro";
  const input = darkField
    ? "w-full rounded-[4px] border border-white/60 bg-transparent px-4 py-3 text-[15px] text-white placeholder-white/85 outline-none caret-white transition-[border-color,box-shadow] duration-200 focus:border-white focus:ring-2 focus:ring-white/30"
    : "w-full rounded-[4px] border border-black/15 bg-white px-4 py-3 text-[15px] text-black placeholder-black/60 outline-none transition-[border-color,box-shadow] duration-200 [caret-color:var(--color-verde)] focus:border-verde focus:ring-2 focus:ring-verde/25";
  const select = `${input} appearance-none cursor-pointer pr-10`;
  const botao =
    tone === "escuro"
      ? "bg-white text-ink hover:bg-white/90"
      : "bg-ink text-white hover:bg-ink-2";

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
      // Build estático (GitHub Pages) não tem API: oferecer o WhatsApp com
      // contexto num clique direto do usuário (window.open pós-await é
      // bloqueado no Safari/iOS e perderia o lead).
      const texto = `Olá Focal Inc! Meu nome é ${data["nome"] ?? ""}. ${
        contexto ? `Tenho interesse em: ${contexto}. ` : ""
      }${data["assunto"] ? `Assunto: ${data["assunto"]}. ` : ""}${
        data["mensagem"] ? `Mensagem: ${data["mensagem"]}` : ""
      }`;
      setWaHref(waLink(site.whatsappComercial, texto));
      setEstado("fallback");
    }
  }

  if (estado === "ok" || estado === "fallback") {
    const claro = tone === "verde" || tone === "escuro";
    return (
      <div className={`${className} flex min-h-[280px] flex-col items-center justify-center py-8 text-center`}>
        <svg width="44" height="44" viewBox="0 0 52 52" aria-hidden>
          <circle cx="26" cy="26" r="24" fill="none" stroke={claro ? "#fff" : "#189673"} strokeWidth="2.5" opacity="0.4" />
          <path
            d="M15 27l8 8 15-17"
            fill="none"
            stroke={claro ? "#fff" : "#189673"}
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <p className={`din mt-5 text-[22px] ${claro ? "text-white" : "text-ink-2"}`}>
          {estado === "ok" ? "Recebemos seus dados!" : "Quase lá!"}
        </p>
        <p className={`mt-2 text-[15px] ${claro ? "text-white/90" : "text-black/70"}`}>
          {estado === "ok"
            ? "Nossa equipe entrará em contato em breve."
            : "Conclua pelo WhatsApp — sua mensagem já está pronta."}
        </p>
        {estado === "fallback" && waHref && (
          <a
            href={waHref}
            target="_blank"
            rel="noopener noreferrer"
            className="cta mt-6 inline-flex items-center gap-2 rounded-[4px] bg-verde px-8 py-3.5 text-white transition-opacity duration-200 hover:opacity-90"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
              <path d="M3.5 3.5c4.7-4.7 12.3-4.7 17 0a12 12 0 0 1-13.8 19.3l-5.8.7a.4.4 0 0 1-.4-.4l.7-5.8A12 12 0 0 1 3.5 3.5zm10 10.2-.9 1.2a9.8 9.8 0 0 1-3.5-3.5l1.2-.9a.8.8 0 0 0 .2-.9l-1.3-2.9a.8.8 0 0 0-.9-.4l-2 .5a.8.8 0 0 0-.6.9A11.8 11.8 0 0 0 15.8 17.5a.8.8 0 0 0 .9-.6l.5-2a.8.8 0 0 0-.4-.9l-2.9-1.3a.8.8 0 0 0-.9.2z" />
            </svg>
            Enviar no WhatsApp
          </a>
        )}
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className={`${className} space-y-3`}>
      <input required name="nome" type="text" placeholder="Nome Completo" autoComplete="name" className={input} />
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <input required name="email" type="email" placeholder="E-mail" autoComplete="email" inputMode="email" className={input} />
        <input required name="telefone" type="tel" placeholder="Telefone" autoComplete="tel" inputMode="tel" className={input} />
      </div>
      <div className="relative">
        <select name="assunto" className={select} defaultValue="Vendas" aria-label="Assunto">
          {ASSUNTOS.map((a) => (
            <option key={a}>{a}</option>
          ))}
        </select>
        <Chevron dark={darkField} />
      </div>

      {variant === "artur" && (
        <>
          <div className="relative">
            <select name="quando" className={select} defaultValue="" aria-label="Quando pretende adquirir o imóvel">
              <option value="" disabled>
                Quando pretende adquirir o imóvel
              </option>
              {QUANDO.map((q) => (
                <option key={q}>{q}</option>
              ))}
            </select>
            <Chevron dark={darkField} />
          </div>
          <div className="relative">
            <select name="orcamento" className={select} defaultValue="" aria-label="Qual o seu orçamento">
              <option value="" disabled>
                Qual o seu orçamento
              </option>
              {ORCAMENTO.map((o) => (
                <option key={o}>{o}</option>
              ))}
            </select>
            <Chevron dark={darkField} />
          </div>
        </>
      )}

      {variant !== "artur" && (
        <textarea name="mensagem" placeholder="Mensagem" rows={4} enterKeyHint="send" className={input} />
      )}

      <button
        type="submit"
        disabled={estado === "enviando"}
        className={`cta inline-flex w-full items-center justify-center gap-3 rounded-[4px] px-8 py-4 transition-[background-color,transform] duration-200 active:scale-[0.985] disabled:opacity-60 sm:w-auto ${botao} ${tone === "verde" ? "!w-full" : ""}`}
      >
        {estado === "enviando" && <span className="spinner" aria-hidden />}
        {estado === "enviando" ? "Enviando…" : "Solicitar Atendimento"}
      </button>
    </form>
  );
}
