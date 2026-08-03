// Dados institucionais da Focal Inc — réplica do site atual (focalinc.com.br).
export const site = {
  nome: "Focal Inc",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://focalinc.com.br",
  descricao:
    "Uma incorporadora focada na realização de projetos especiais. Empreendimentos residenciais em São Paulo: Pinheiros, Moema e Butantã.",
  endereco: "Rua Diogo Moreira, 132, 20ª Andar",
  telefone: "(11) 3136-0142",
  telefoneHref: "tel:+551131360142",
  email: "contato@focalinc.com.br",
  // Número do widget de WhatsApp (Joinchat do site atual)
  whatsapp: "551148589385",
  // Número usado nos CTAs de WhatsApp das páginas (Parcerias/Atendimento)
  whatsappComercial: "551131360142",
  clientesUrl: "http://cliente.focalinc.com.br",
};

export function waLink(numero: string, texto?: string) {
  const base = `https://wa.me/${numero}`;
  return texto ? `${base}?text=${encodeURIComponent(texto)}` : base;
}

export const menu = [
  { label: "Sobre", href: "/sobre" },
  { label: "Empreendimentos", href: "/#empreendimentos" },
  { label: "Parcerias", href: "/parcerias-2" },
  {
    label: "Atendimento",
    href: "/atendimento",
    children: [
      { label: "Atendimento", href: "/atendimento" },
      { label: "Clientes", href: site.clientesUrl },
      { label: "Política de Privacidade", href: "/politica-de-privacidade-e-seguranca" },
    ],
  },
];
