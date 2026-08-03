"use client";

import { useState } from "react";
import Link from "next/link";
import Logo from "./Logo";
import { menu } from "@/lib/site";

// Cabeçalho institucional: menu à direita, como no site atual.
// tone "claro" = texto branco (páginas com hero escuro); "escuro" = texto preto.
export default function SiteHeader({
  tone = "claro",
  active,
  fixed = true,
  showLogo = true,
}: {
  tone?: "claro" | "escuro";
  active?: string;
  fixed?: boolean;
  showLogo?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const base = tone === "claro" ? "text-white" : "text-black";
  const dim = tone === "claro" ? "text-white/60" : "text-black/50";

  return (
    <header className={`${fixed ? "absolute" : "relative"} inset-x-0 top-0 z-40`}>
      <div className="flex items-center justify-between px-6 py-6 md:px-10">
        {showLogo ? (
          <Link href="/" aria-label="Focal Inc — Home">
            <Logo tone={tone === "claro" ? "branco" : "preto"} className="h-6 w-auto md:h-7" />
          </Link>
        ) : (
          <span />
        )}

        {/* Menu desktop */}
        <nav className={`hidden items-center gap-9 md:flex ${tone === "claro" ? "on-dark" : ""}`}>
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

        {/* Hamburger mobile */}
        <button
          type="button"
          aria-label="Abrir menu"
          aria-expanded={open}
          onClick={() => setOpen(!open)}
          className={`md:hidden ${base}`}
        >
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
          </svg>
        </button>
      </div>

      {open && (
        <nav className="bg-ink px-6 pb-6 md:hidden">
          {menu.map((item) => (
            <div key={item.label}>
              <Link
                href={item.href}
                onClick={() => setOpen(false)}
                className="block border-b border-white/10 py-3 text-[15px] text-white"
              >
                {item.label}
              </Link>
              {item.children?.slice(1).map((c) => (
                <Link
                  key={c.label}
                  href={c.href}
                  onClick={() => setOpen(false)}
                  className="block border-b border-white/10 py-3 pl-5 text-[14px] text-white/80"
                >
                  {c.label}
                </Link>
              ))}
            </div>
          ))}
        </nav>
      )}
    </header>
  );
}
