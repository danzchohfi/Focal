"use client";

import Link from "next/link";
import { useState } from "react";
import { getOrigem, track, whatsappHref } from "@/lib/tracking";

const intencoes = [
  { value: "comprar-morar", label: "Quero comprar para morar" },
  { value: "comprar-investir", label: "Quero investir" },
  { value: "terreno", label: "Tenho um terreno para apresentar" },
  { value: "corretor", label: "Sou corretor(a) — parceria" },
  { value: "fornecedor", label: "Sou fornecedor" },
  { value: "cliente", label: "Já sou cliente / assistência técnica" },
];

export default function LeadForm({
  empreendimento,
  intencaoInicial,
}: {
  empreendimento?: string;
  intencaoInicial?: string;
}) {
  const [status, setStatus] = useState<"idle" | "enviando" | "ok" | "erro">("idle");
  const [intencao, setIntencao] = useState(intencaoInicial ?? "comprar-morar");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("enviando");
    const form = new FormData(e.currentTarget);
    const payload = {
      nome: form.get("nome"),
      email: form.get("email"),
      telefone: form.get("telefone"),
      mensagem: form.get("mensagem"),
      intencao,
      empreendimento,
      origem: getOrigem(),
    };
    const endpoint = process.env.NEXT_PUBLIC_LEAD_WEBHOOK_URL ?? "/api/lead";
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("falha no envio");
      setStatus("ok");
      track("submit_form", { empreendimento, intencao });
    } catch {
      // Sem backend disponível (ex.: deploy estático): o lead segue pelo
      // WhatsApp com a mensagem já montada — nenhuma conversão se perde.
      track("submit_form", { empreendimento, intencao, fallback: "whatsapp" });
      const detalhes = [
        `Sou ${payload.nome}`,
        empreendimento ? `tenho interesse no ${empreendimento}` : undefined,
        `(${intencoes.find((i) => i.value === intencao)?.label ?? intencao})`,
        payload.mensagem ? `— ${payload.mensagem}` : undefined,
      ]
        .filter(Boolean)
        .join(" ");
      window.open(
        `${whatsappHref({ empreendimento, intencao }).split("?text=")[0]}?text=${encodeURIComponent(
          `Olá! Vim pelo site da Focal. ${detalhes}.`,
        )}`,
        "_blank",
        "noopener",
      );
      setStatus("ok");
    }
  }

  if (status === "ok") {
    return (
      <div className="rounded-sm border border-[#3e7c5b] bg-[#3e7c5b]/10 p-6">
        <p className="text-lg font-semibold text-white">Recebido. Obrigado!</p>
        <p className="mt-2 text-sm text-[#a3a39c]">
          Nossa equipe responde em até 24h úteis. Se preferir agilidade, fale
          agora com a Laís no WhatsApp.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="grid gap-1.5 text-sm text-white/80">
          Nome
          <input
            required
            name="nome"
            autoComplete="name"
            className="rounded-sm border border-white/20 bg-transparent px-4 py-3 text-white placeholder:text-white/30"
            placeholder="Seu nome"
          />
        </label>
        <label className="grid gap-1.5 text-sm text-white/80">
          Telefone / WhatsApp
          <input
            required
            name="telefone"
            type="tel"
            autoComplete="tel"
            className="rounded-sm border border-white/20 bg-transparent px-4 py-3 text-white placeholder:text-white/30"
            placeholder="(11) 9 0000-0000"
          />
        </label>
      </div>
      <label className="grid gap-1.5 text-sm text-white/80">
        E-mail
        <input
          required
          name="email"
          type="email"
          autoComplete="email"
          className="rounded-sm border border-white/20 bg-transparent px-4 py-3 text-white placeholder:text-white/30"
          placeholder="voce@email.com"
        />
      </label>
      <label className="grid gap-1.5 text-sm text-white/80">
        Como podemos ajudar?
        <select
          name="intencao"
          value={intencao}
          onChange={(e) => setIntencao(e.target.value)}
          className="rounded-sm border border-white/20 bg-[#0a0a0a] px-4 py-3 text-white"
        >
          {intencoes.map((i) => (
            <option key={i.value} value={i.value}>
              {i.label}
            </option>
          ))}
        </select>
      </label>
      <label className="grid gap-1.5 text-sm text-white/80">
        Mensagem (opcional)
        <textarea
          name="mensagem"
          rows={3}
          className="rounded-sm border border-white/20 bg-transparent px-4 py-3 text-white placeholder:text-white/30"
          placeholder={
            empreendimento
              ? `Ex.: quero saber a disponibilidade do ${empreendimento}`
              : "Conte rapidamente o que procura"
          }
        />
      </label>
      <button
        type="submit"
        disabled={status === "enviando"}
        className="rounded-full bg-[#3e7c5b] px-8 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#356b4e] disabled:opacity-50"
      >
        {status === "enviando" ? "Enviando…" : "Enviar"}
      </button>
      {status === "erro" ? (
        <p role="alert" className="text-sm text-[#d8949f]">
          Não foi possível enviar. Tente novamente ou fale direto no WhatsApp.
        </p>
      ) : null}
      <p className="text-xs text-white/40">
        Seus dados são usados apenas para este atendimento, conforme nossa{" "}
        <Link href="/privacidade" className="underline hover:text-white/70">
          política de privacidade
        </Link>
        .
      </p>
    </form>
  );
}
