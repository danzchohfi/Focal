"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import WhatsAppCta from "@/components/WhatsAppCta";

const nav = [
  { href: "/empreendimentos", label: "Empreendimentos" },
  { href: "/sobre", label: "Sobre" },
  { href: "/parcerias", label: "Parcerias" },
  { href: "/atendimento", label: "Atendimento" },
];

export default function Header() {
  const [compact, setCompact] = useState(false);
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setCompact(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // fecha o menu móvel ao navegar
  const [lastPath, setLastPath] = useState(pathname);
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setOpen(false);
  }

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-[#0a0a0a]/90 backdrop-blur transition-all ${
        compact ? "py-3" : "py-5"
      }`}
    >
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-5">
        <Link
          href="/"
          className="text-xl font-bold uppercase tracking-[0.35em] text-white"
        >
          Focal
        </Link>

        {/* Menu desktop — fonte maior, pedido interno de 22/10 */}
        <nav aria-label="Principal" className="hidden items-center gap-8 md:flex">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`text-base transition-colors hover:text-[#7fb89a] ${
                pathname.startsWith(item.href) ? "text-[#7fb89a]" : "text-white/85"
              }`}
            >
              {item.label}
            </Link>
          ))}
          <WhatsAppCta posicao="header" variant="solid" className="!px-5 !py-2.5">
            WhatsApp
          </WhatsAppCta>
        </nav>

        <button
          type="button"
          className="md:hidden"
          aria-expanded={open}
          aria-label={open ? "Fechar menu" : "Abrir menu"}
          onClick={() => setOpen((v) => !v)}
        >
          <span className="block h-0.5 w-6 bg-white" />
          <span className="mt-1.5 block h-0.5 w-6 bg-white" />
          <span className="mt-1.5 block h-0.5 w-6 bg-white" />
        </button>
      </div>

      {open ? (
        <nav
          aria-label="Principal móvel"
          className="border-t border-white/10 bg-[#0a0a0a] px-5 py-6 md:hidden"
        >
          <ul className="flex flex-col gap-5">
            {nav.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="text-lg text-white">
                  {item.label}
                </Link>
              </li>
            ))}
            <li>
              <WhatsAppCta posicao="header-mobile" variant="solid">
                Falar no WhatsApp
              </WhatsAppCta>
            </li>
          </ul>
        </nav>
      ) : null}
    </header>
  );
}
