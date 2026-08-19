/**
 * Ícones de linha fina para os destaques da LP-D — traço 1.5 sobre grade de
 * 32, no espírito de desenho técnico da identidade (cotas, arestas, hachuras
 * mínimas). Herdam a cor via currentColor.
 */

const trilhos = {
  stroke: "currentColor",
  strokeWidth: 1.5,
  fill: "none",
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

export type IconeDNome = "height" | "car" | "party" | "sport" | "pool" | "shield" | "layers" | "desk" | "pet" | "gym";

export default function IconeD({ nome, className = "" }: { nome: IconeDNome; className?: string }) {
  return (
    <svg viewBox="0 0 32 32" width="32" height="32" aria-hidden className={className} {...trilhos}>
      {nome === "height" && (
        <>
          {/* Cota de pé-direito duplo: piso, teto e seta dupla */}
          <path d="M5 5.5h22M5 26.5h22" />
          <path d="M16 8.5v15M13.2 11l2.8-2.5L18.8 11M13.2 21l2.8 2.5 2.8-2.5" />
        </>
      )}
      {nome === "car" && (
        <>
          {/* Vaga com infraestrutura elétrica */}
          <path d="M5 20.5l1.8-5.2c.3-.9 1.1-1.3 2-1.3h9.4c.9 0 1.7.4 2 1.3l1.8 5.2" />
          <path d="M4.5 20.5h18v4h-2.6M4.5 24.5v-4M8.5 24.5h9" />
          <circle cx="8.5" cy="24" r="1.6" />
          <circle cx="18.5" cy="24" r="1.6" />
          <path d="M26.5 8.5l-2.6 4h3.2l-2.6 4" />
        </>
      )}
      {nome === "party" && (
        <>
          {/* Salão de festas com forno de pizza */}
          <path d="M6 26h20" />
          <path d="M8 26v-7.5a8 8 0 0 1 16 0V26" />
          <path d="M12.5 26v-4.5a3.5 3.5 0 0 1 7 0V26" />
          <path d="M16 9.5c-.8-1.2-.4-2.3.4-3-.2 1 .8 1.4.6 2.6" />
        </>
      )}
      {nome === "sport" && (
        <>
          {/* Quadra de areia integrada */}
          <circle cx="16" cy="14" r="6.5" />
          <path d="M9.8 12.2c3.4 1.6 9 1.6 12.4 0M16 7.5v13" />
          <path d="M5 26.5h22M8.5 23.5l2 3M23.5 23.5l-2 3" />
        </>
      )}
      {nome === "pool" && (
        <>
          {/* Piscina de 25 m no rooftop */}
          <path d="M5 12.5h22M8 12.5V24M24 12.5V24" />
          <path d="M5 21.5c1.8 1.4 3.7 1.4 5.5 0s3.7-1.4 5.5 0 3.7 1.4 5.5 0 3.7-1.4 5.5 0" />
          <path d="M11 8.5h10M11 8.5l-1.5 2M21 8.5l1.5 2" />
        </>
      )}
      {nome === "shield" && (
        <>
          {/* Guarita blindada e gerador */}
          <path d="M16 5.5l9 3.2v7.1c0 5.4-3.6 9-9 10.7-5.4-1.7-9-5.3-9-10.7V8.7z" />
          <path d="M17.5 11.5l-3.4 5h3.8l-3.4 5" />
        </>
      )}
      {nome === "layers" && (
        <>
          <path d="M16 6l10 5-10 5L6 11z" />
          <path d="M6 16.5l10 5 10-5M6 21.5l10 5 10-5" />
        </>
      )}
      {nome === "desk" && (
        <>
          <path d="M5 12.5h22M7 12.5V24M25 12.5V24M11 16h10M11 19.5h6" />
        </>
      )}
      {nome === "pet" && (
        <>
          <circle cx="11" cy="12" r="1.8" />
          <circle cx="21" cy="12" r="1.8" />
          <circle cx="8" cy="17" r="1.8" />
          <circle cx="24" cy="17" r="1.8" />
          <path d="M16 16.5c2.8 0 5 2.2 5 4.6 0 1.9-1.4 3.4-3.2 3.4-.7 0-1.3-.2-1.8-.5-.5.3-1.1.5-1.8.5-1.8 0-3.2-1.5-3.2-3.4 0-2.4 2.2-4.6 5-4.6z" />
        </>
      )}
      {nome === "gym" && (
        <>
          <path d="M9 12v8M23 12v8M5.5 14v4M26.5 14v4M9 16h14" />
        </>
      )}
    </svg>
  );
}
