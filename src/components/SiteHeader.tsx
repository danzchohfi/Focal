"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Logo from "./Logo";
import { menu } from "@/lib/site";

// Cabeçalho institucional: menu à direita, como no site atual.
// tone "claro" = texto branco (páginas com hero escuro); "escuro" = texto preto.
//
// Como no original (Uncode menu-sticky): assim que a página começa a rolar,
// uma barra fixa escura (#222) com logo e menu entra com fade no topo — em
// todas as viewports. Na home (heroMenu), o topo desktop fica sem menu, pois
// o hero tem a própria barra de navegação na base.
function NavDesktop({ base, dim, active }: { base: string; dim: string; active?: string }) {
  return (
    <nav className="hidden items-center gap-9 md:flex on-dark">
      {menu.map((item) => (
        <div key={item.label} className="group relative">
          {item.children ? (
            <Link
              href={item.href}
              aria-haspopup="menu"
              className={`nav-link inline-flex items-center gap-1.5 text-[15px] ${
                active === item.label ? `${dim} is-active` : base
              }`}
            >
              {item.label}
              <svg
                width="10"
                height="10"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="transition-transform duration-200 group-hover:rotate-180"
                aria-hidden
              >
                <path d="m6 9 6 6 6-6" />
              </svg>
            </Link>
          ) : (
            <Link
              href={item.href}
              className={`nav-link text-[15px] ${active === item.label ? `${dim} is-active` : base}`}
            >
              {item.label}
            </Link>
          )}
          {item.children && (
            <div className="invisible absolute right-0 top-full z-50 min-w-52 translate-y-1 rounded-md bg-ink py-2 opacity-0 shadow-[0_4px_12px_rgba(0,0,0,.12),0_16px_48px_-12px_rgba(0,0,0,.24)] transition-[opacity,transform,visibility] delay-100 duration-200 group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100 group-hover:delay-0"
              role="menu"
            >
              {item.children.map((c) => (
                <Link
                  key={c.label}
                  href={c.href}
                  role="menuitem"
                  className="on-dark block px-5 py-2 text-[14px] text-white/90 transition-colors duration-200 hover:bg-white/10"
                >
                  {c.label}
                </Link>
              ))}
            </div>
          )}
        </div>
      ))}
    </nav>
  );
}

function NavMobile({ onNavigate }: { onNavigate: () => void }) {
  return (
    <nav className="bg-ink px-6 pb-6 md:hidden">
      {menu.map((item) => (
        <div key={item.label}>
          <Link
            href={item.href}
            onClick={onNavigate}
            className="block border-b border-white/10 py-3 text-[15px] text-white"
          >
            {item.label}
          </Link>
          {item.children?.slice(1).map((c) => (
            <Link
              key={c.label}
              href={c.href}
              onClick={onNavigate}
              className="block border-b border-white/10 py-3 pl-5 text-[14px] text-white/80"
            >
              {c.label}
            </Link>
          ))}
        </div>
      ))}
    </nav>
  );
}

function Hamburger({
  open,
  onClick,
  className = "",
}: {
  open: boolean;
  onClick: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      aria-label={open ? "Fechar menu" : "Abrir menu"}
      aria-expanded={open}
      onClick={onClick}
      className={`md:hidden ${className}`}
    >
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
      </svg>
    </button>
  );
}

export default function SiteHeader({
  tone = "claro",
  active,
  fixed = true,
  showLogo = true,
  heroMenu = false,
}: {
  tone?: "claro" | "escuro";
  active?: string;
  fixed?: boolean;
  showLogo?: boolean;
  /** Home: o hero tem menu próprio na base — o topo desktop fica limpo. */
  heroMenu?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [stuck, setStuck] = useState(false);
  const stuckRef = useRef(false);
  const base = tone === "claro" ? "text-white" : "text-black";
  const dim = tone === "claro" ? "text-white/60" : "text-black/50";

  useEffect(() => {
    const onScroll = () => {
      const next = window.scrollY > 24;
      if (next !== stuckRef.current) {
        stuckRef.current = next;
        setStuck(next);
        // Trocar de barra com o menu mobile aberto o deixaria no lugar errado.
        setOpen(false);
      }
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      {/* Barra do topo (transparente sobre o hero) */}
      <header
        className={`${fixed ? "absolute" : "relative"} inset-x-0 top-0 z-40 transition-opacity duration-300 ${
          stuck ? "pointer-events-none opacity-0" : "opacity-100"
        }`}
        inert={stuck || undefined}
      >
        <div className={`flex items-center justify-between px-6 py-6 md:px-10 ${heroMenu ? "md:hidden" : ""}`}>
          {showLogo ? (
            <Link href="/" aria-label="Focal Inc — Home">
              <Logo tone={tone === "claro" ? "branco" : "preto"} className="h-6 w-auto md:h-7" />
            </Link>
          ) : (
            <span />
          )}
          <NavDesktop base={base} dim={dim} active={active} />
          <Hamburger open={open && !stuck} onClick={() => setOpen(!open)} className={base} />
        </div>
        {open && !stuck && <NavMobile onNavigate={() => setOpen(false)} />}
      </header>

      {/* Barra fixa que entra quando a página rola (como o menu sticky do original) */}
      <header
        className={`fixed inset-x-0 top-0 z-50 bg-ink-2 shadow-[0_1px_0_rgba(255,255,255,.06),0_10px_30px_rgba(0,0,0,.25)] transition-[transform,opacity] duration-500 [transition-timing-function:ease-out] ${
          stuck ? "translate-y-0 opacity-100" : "pointer-events-none -translate-y-full opacity-0"
        }`}
        inert={!stuck || undefined}
      >
        <div className="flex h-16 items-center justify-between px-6 md:px-10">
          <Link href="/" aria-label="Focal Inc — Home">
            <Logo tone="branco" className="h-5 w-auto" />
          </Link>
          <NavDesktop base="text-white" dim="text-white/60" active={active} />
          <Hamburger open={open && stuck} onClick={() => setOpen(!open)} className="text-white" />
        </div>
        {open && stuck && <NavMobile onNavigate={() => setOpen(false)} />}
      </header>
    </>
  );
}
