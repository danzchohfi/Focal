// Pictogramas dos "Destaques" e specs (traço 2.1, caixa óptica no chamador).
const paths: Record<string, React.ReactNode> = {
  height: (
    <>
      <path d="M12 3v18" />
      <path d="m8.5 6.5 3.5-3.5 3.5 3.5M8.5 17.5 12 21l3.5-3.5" />
    </>
  ),
  car: (
    <>
      <path d="M5 11l1.5-4.5A2 2 0 0 1 8.4 5h7.2a2 2 0 0 1 1.9 1.5L19 11" />
      <path d="M4 11h16a1 1 0 0 1 1 1v4h-2M3 16v-4a1 1 0 0 1 1-1M5 16H3M7.5 16a1.5 1.5 0 1 1-3 0M19.5 16a1.5 1.5 0 1 1-3 0M7.5 16h9" />
    </>
  ),
  party: (
    <>
      <path d="M8 3v3M12 2v4M16 3v3" />
      <rect x="5" y="9" width="14" height="4" rx="1" />
      <path d="M6.5 13v6a2 2 0 0 0 2 2h7a2 2 0 0 0 2-2v-6" />
    </>
  ),
  sport: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 3a15 15 0 0 1 0 18M3.5 9h17M3.5 15h17" />
    </>
  ),
  pool: (
    <>
      <path d="M3 17c1.5 1.2 3 1.2 4.5 0s3-1.2 4.5 0 3 1.2 4.5 0 3-1.2 4.5 0" />
      <path d="M8 14V5a2 2 0 0 1 4 0M14 14V5a2 2 0 0 1 4 0" />
    </>
  ),
  shield: <path d="M12 3 5 6v5c0 4.5 3 8.2 7 9.5 4-1.3 7-5 7-9.5V6l-7-3z" />,
  layers: (
    <>
      <path d="m12 3 9 5-9 5-9-5 9-5z" />
      <path d="m3 13 9 5 9-5" />
    </>
  ),
  desk: (
    <>
      <rect x="3" y="4" width="18" height="12" rx="1" />
      <path d="M12 16v4M8 20h8" />
    </>
  ),
  pet: (
    <>
      <circle cx="7" cy="9" r="1.6" />
      <circle cx="12" cy="7" r="1.6" />
      <circle cx="17" cy="9" r="1.6" />
      <path d="M12 12c-2.8 0-5 2.2-5 4.4 0 1.4 1.1 2.6 2.5 2.6h5c1.4 0 2.5-1.2 2.5-2.6 0-2.2-2.2-4.4-5-4.4z" />
    </>
  ),
  service: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 3" />
    </>
  ),
  sofa: (
    <>
      <path d="M5 10V8a3 3 0 0 1 3-3h8a3 3 0 0 1 3 3v2" />
      <path d="M3 12a2 2 0 0 1 4 0v2h10v-2a2 2 0 0 1 4 0v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4zM6 18v2M18 18v2" />
    </>
  ),
  sauna: (
    <>
      <path d="M8 4c0 1.5-2 2-2 4M13 4c0 1.5-2 2-2 4M18 4c0 1.5-2 2-2 4" />
      <rect x="4" y="11" width="16" height="9" rx="1.5" />
    </>
  ),
  gym: <path d="M7 8v8M17 8v8M4 10v4M20 10v4M7 12h10" />,
  beauty: (
    <>
      <path d="M12 3s4 4.5 4 8a4 4 0 0 1-8 0c0-3.5 4-8 4-8z" />
      <path d="M9 19h6" />
    </>
  ),
  laundry: (
    <>
      <rect x="5" y="3" width="14" height="18" rx="2" />
      <circle cx="12" cy="13" r="4.5" />
      <path d="M8 6h2" />
    </>
  ),
  // Specs das LPs
  ruler: <path d="m3 17 4 4L21 7l-4-4L3 17zM8 12l1.5 1.5M11 9l1.5 1.5M14 6l1.5 1.5" />,
  bed: (
    <>
      <path d="M3 7v10M3 15h18M21 15v-4a2 2 0 0 0-2-2h-8v6" />
      <circle cx="6.5" cy="11" r="1.5" />
    </>
  ),
};

export default function DestaqueIcon({ nome, size = 34 }: { nome: string; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.1"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      {paths[nome] ?? paths.layers}
    </svg>
  );
}
