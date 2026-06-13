import { statusLabel, type Status } from "@/lib/types";

const cores: Record<Status, string> = {
  "breve-lancamento": "bg-[--color-bordo]/20 text-[#d8949f] border-[#6e2b36]",
  lancamento: "bg-[#3e7c5b]/20 text-[#7fb89a] border-[#3e7c5b]",
  "em-construcao": "bg-[#3e7c5b]/15 text-[#7fb89a] border-[#3e7c5b]/70",
  entregue: "bg-white/10 text-white/70 border-white/25",
};

export default function StatusBadge({
  status,
  entrega,
}: {
  status: Status;
  entrega?: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium uppercase tracking-wider ${cores[status]}`}
    >
      {statusLabel[status]}
      {entrega && status !== "entregue" ? ` · entrega ${entrega}` : null}
    </span>
  );
}
