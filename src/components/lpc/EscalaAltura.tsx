"use client";

/**
 * Diagrama de escala do pé-direito: compara o padrão de mercado (2,70 m) com
 * o living do Artur 73 (5,50 m), com uma porta de 2,10 m como referência de
 * escala — convenção de corte arquitetônico; no vão de 5,50 m ela fica
 * pequena, e é essa a leitura que vende a altura.
 *
 * É desenho, não foto: o acervo do empreendimento não tem imagem de interior
 * que mostre a altura, e usar render de outro projeto seria impreciso num
 * material de venda.
 *
 * A animação é dirigida pelo GSAP do componente pai através dos data-attrs:
 *   [data-escala-volume] volume alto — cresce do piso para cima
 *   [data-escala-teto]   linha de teto + cota — sobe junto
 * Sem JS, o SVG já renderiza no estado final.
 */

// Escala do desenho: 5,5 m = 320 px
const PISO = 440;
const PX_POR_M = 320 / 5.5;
const H_CONV = 2.7 * PX_POR_M; // ≈ 157
const H_ARTUR = 5.5 * PX_POR_M; // 320
const H_PORTA = 2.1 * PX_POR_M; // ≈ 122
const W_PORTA = 0.8 * PX_POR_M; // ≈ 47

function Porta({ x, opacity = 0.4 }: { x: number; opacity?: number }) {
  return (
    <g opacity={opacity} stroke="currentColor" strokeWidth="1" fill="none">
      <rect x={x - W_PORTA / 2} y={PISO - H_PORTA} width={W_PORTA} height={H_PORTA} />
      {/* Maçaneta */}
      <circle cx={x + W_PORTA / 2 - 8} cy={PISO - H_PORTA / 2} r="1.6" fill="currentColor" stroke="none" />
    </g>
  );
}

export default function EscalaAltura() {
  return (
    <svg
      viewBox="0 0 420 478"
      className="h-auto w-full text-white"
      role="img"
      aria-label="Comparação de pé-direito: apartamento convencional 2,70 m e living do Artur 73 com 5,50 m"
    >
      {/* ── Volume convencional ── */}
      <g>
        <rect
          x="40"
          y={PISO - H_CONV}
          width="140"
          height={H_CONV}
          fill="rgba(255,255,255,0.04)"
          stroke="rgba(255,255,255,0.18)"
          strokeWidth="1"
        />
        <line
          x1="40" y1={PISO - H_CONV} x2="180" y2={PISO - H_CONV}
          stroke="rgba(255,255,255,0.35)" strokeWidth="1.5"
        />
        <Porta x={110} />
        <text
          x="110" y={PISO - H_CONV - 14}
          textAnchor="middle" fill="rgba(255,255,255,0.5)"
          className="din" fontSize="19"
        >
          2,70 m
        </text>
        <text
          x="110" y={PISO + 26}
          textAnchor="middle" fill="rgba(255,255,255,0.4)"
          fontSize="12" letterSpacing="0.1em"
        >
          CONVENCIONAL
        </text>
      </g>

      {/* ── Volume Artur 73 ── */}
      <g>
        {/* Contorno-fantasma no estado final: dá leitura antes da animação */}
        <rect
          x="240" y={PISO - H_ARTUR} width="140" height={H_ARTUR}
          fill="none" stroke="rgba(24,150,115,0.22)" strokeWidth="1" strokeDasharray="3 5"
        />
        <rect
          data-escala-volume
          x="240" y={PISO - H_ARTUR} width="140" height={H_ARTUR}
          fill="rgba(24,150,115,0.10)" stroke="rgba(24,150,115,0.55)" strokeWidth="1"
        />
        <g data-escala-teto>
          <line x1="240" y1={PISO - H_ARTUR} x2="380" y2={PISO - H_ARTUR} stroke="#189673" strokeWidth="2" />
          <text
            x="310" y={PISO - H_ARTUR - 14}
            textAnchor="middle" fill="#189673" className="din" fontSize="24"
          >
            <tspan data-cota-num>5,50</tspan> m
          </text>
        </g>
        <Porta x={310} opacity={0.5} />
        <text
          x="310" y={PISO + 26}
          textAnchor="middle" fill="rgba(255,255,255,0.75)"
          fontSize="12" letterSpacing="0.1em"
        >
          ARTUR 73
        </text>
      </g>

      {/* ── Piso ── */}
      <line x1="20" y1={PISO} x2="400" y2={PISO} stroke="rgba(255,255,255,0.35)" strokeWidth="1.5" />
    </svg>
  );
}
