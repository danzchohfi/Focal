"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import EmpreendimentoCard from "@/components/EmpreendimentoCard";
import StatusBadge from "@/components/StatusBadge";
import { empreendimentos, publicados } from "@/data/empreendimentos";
import { statusLabel, type Status, type Uso } from "@/lib/types";

const todosStatus = Object.keys(statusLabel) as Status[];

const faixas = [
  { id: "todas", label: "Qualquer metragem", min: 0, max: Infinity },
  { id: "ate-60", label: "Até 60 m²", min: 0, max: 60 },
  { id: "60-90", label: "60–90 m²", min: 60, max: 90 },
  { id: "90-mais", label: "90 m² ou mais", min: 90, max: Infinity },
] as const;

export default function Vitrine() {
  const [status, setStatus] = useState<Status | "todos">("todos");
  const [bairro, setBairro] = useState<string>("todos");
  const [faixa, setFaixa] = useState<(typeof faixas)[number]["id"]>("todas");
  const [uso, setUso] = useState<Uso | "todos">("todos");
  const [comparar, setComparar] = useState(false);

  const bairros = useMemo(
    () => Array.from(new Set(publicados.map((e) => e.bairro))).sort(),
    [],
  );

  const filtrados = useMemo(() => {
    const f = faixas.find((x) => x.id === faixa)!;
    return empreendimentos.filter((e) => {
      if (e.draft) {
        // rascunhos só aparecem sem filtros ativos, como "em preparação"
        return status === "todos" && bairro === "todos" && faixa === "todas" && uso === "todos";
      }
      if (status !== "todos" && e.status !== status) return false;
      if (bairro !== "todos" && e.bairro !== bairro) return false;
      if (uso !== "todos" && !e.usos.includes(uso)) return false;
      if (f.min > 0 || f.max !== Infinity) {
        if (e.metragem.max < f.min || e.metragem.min > f.max) return false;
      }
      return true;
    });
  }, [status, bairro, faixa, uso]);

  const selectCls =
    "rounded-full border border-white/20 bg-[#0a0a0a] px-4 py-2 text-sm text-white";

  return (
    <>
      <div className="mt-10 flex flex-wrap items-center gap-3">
        <label className="sr-only" htmlFor="f-status">Status</label>
        <select id="f-status" className={selectCls} value={status}
          onChange={(e) => setStatus(e.target.value as Status | "todos")}>
          <option value="todos">Todos os status</option>
          {todosStatus.map((s) => (
            <option key={s} value={s}>{statusLabel[s]}</option>
          ))}
        </select>

        <label className="sr-only" htmlFor="f-bairro">Bairro</label>
        <select id="f-bairro" className={selectCls} value={bairro}
          onChange={(e) => setBairro(e.target.value)}>
          <option value="todos">Todos os bairros</option>
          {bairros.map((b) => (
            <option key={b} value={b}>{b}</option>
          ))}
        </select>

        <label className="sr-only" htmlFor="f-metragem">Metragem</label>
        <select id="f-metragem" className={selectCls} value={faixa}
          onChange={(e) => setFaixa(e.target.value as typeof faixa)}>
          {faixas.map((f) => (
            <option key={f.id} value={f.id}>{f.label}</option>
          ))}
        </select>

        <label className="sr-only" htmlFor="f-uso">Uso</label>
        <select id="f-uso" className={selectCls} value={uso}
          onChange={(e) => setUso(e.target.value as Uso | "todos")}>
          <option value="todos">Residencial e NR</option>
          <option value="residencial">Residencial</option>
          <option value="nr">NR / investimento</option>
        </select>

        <button
          type="button"
          onClick={() => setComparar((v) => !v)}
          aria-pressed={comparar}
          className={`ml-auto rounded-full border px-5 py-2 text-sm font-medium transition-colors ${
            comparar
              ? "border-[#3e7c5b] bg-[#3e7c5b]/15 text-[#7fb89a]"
              : "border-white/20 text-white/70 hover:border-white/50"
          }`}
        >
          {comparar ? "Ver em cards" : "Comparar lado a lado"}
        </button>
      </div>

      {comparar ? (
        <div className="mt-10 overflow-x-auto">
          <table className="w-full min-w-[640px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-white/15 text-left text-xs uppercase tracking-wider text-white/50">
                <th className="py-3 pr-4">Empreendimento</th>
                <th className="py-3 pr-4">Status</th>
                <th className="py-3 pr-4">Bairro</th>
                <th className="py-3 pr-4">Metragem</th>
                <th className="py-3 pr-4">Uso</th>
                <th className="py-3 pr-4">A partir de</th>
                <th className="py-3" />
              </tr>
            </thead>
            <tbody>
              {filtrados.filter((e) => !e.draft).map((e) => (
                <tr key={e.slug} className="border-b border-white/10">
                  <td className="py-4 pr-4 font-semibold">{e.nome}</td>
                  <td className="py-4 pr-4">
                    <StatusBadge status={e.status} entrega={e.entrega} />
                  </td>
                  <td className="py-4 pr-4">{e.bairro}</td>
                  <td className="py-4 pr-4">
                    {e.metragem.min}–{e.metragem.max} m²
                  </td>
                  <td className="py-4 pr-4">
                    {e.usos.includes("nr") ? "Residencial + NR" : "Residencial"}
                  </td>
                  <td className="py-4 pr-4 text-[#7fb89a]">{e.precoAPartir ?? "—"}</td>
                  <td className="py-4">
                    <Link href={`/empreendimentos/${e.slug}`} className="text-[#7fb89a] hover:text-white">
                      Ver página →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="mt-4 text-xs text-white/40">
            Demais fichas do portfólio entram na comparação assim que forem publicadas.
          </p>
        </div>
      ) : (
        <div className="mt-10 grid gap-10 md:grid-cols-2 lg:grid-cols-3">
          {filtrados.map((e) => (
            <EmpreendimentoCard key={e.slug} e={e} />
          ))}
          {filtrados.length === 0 ? (
            <p className="col-span-full py-10 text-center text-[#a3a39c]">
              Nenhum empreendimento com esses filtros — limpe um filtro ou{" "}
              <Link href="/atendimento" className="text-[#7fb89a] underline">
                fale com a equipe
              </Link>
              .
            </p>
          ) : null}
        </div>
      )}
    </>
  );
}
