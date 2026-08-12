"use client";

/**
 * Diagrama de escala do pé-direito: compara o padrão de mercado (2,70 m) com
 * o living do Artur 73 (5,50 m), com figura humana para dar referência.
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
const H_PESSOA = 1.75 * PX_POR_M; // ≈ 102

function Pessoa({ x }: { x: number }) {
  const s = H_PESSOA / 100;
  return (
    <g transform={`translate(${x} ${PISO}) scale(${s})`} opacity="0.55">
      {/* Silhueta simplificada, 100 unidades = 1,75 m */}
      <circle cx="0" cy="-90" r="8" fill="currentColor" />
      <path
        d="M0 -82c-8 0-13 5-13 12v24c0 3 2 5 5 5h1v33c0 3 2 5 5 5s5-2 5-5v-33h4v33c0 3 2 5 5 5s5-2 5-5v-33h1c3 0 5-2 5-5v-24c0-7-5-12-13-12z"
        fill="currentColor"
      />
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
        <Pessoa x={110} />
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
        <Pessoa x={310} />
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
