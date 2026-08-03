import Link from "next/link";
import Logo from "./Logo";
import { site, waLink } from "@/lib/site";

// Topbar escura das páginas de empreendimento: logo, "+ Empreendimentos"
// e CTAs de Telefone, E-mail e WhatsApp (como no site atual).
export default function LpHeader({ contexto }: { contexto?: string }) {
  const waTexto = contexto ? `Olá Focal Inc! Quero mais informações sobre o ${contexto}.` : undefined;

  return (
    <header className="sticky top-0 z-40 bg-ink">
      <div className="mx-auto flex max-w-[1400px] items-center justify-between gap-4 px-5 py-4 md:px-8">
        <div className="flex items-center gap-8">
          <Link href="/" aria-label="Focal Inc — Home">
            <Logo tone="branco" className="h-6 w-auto md:h-7" />
          </Link>
          <Link
            href="/#empreendimentos"
            className="hidden text-[14px] text-white transition-opacity hover:opacity-70 sm:block"
          >
            + Empreendimentos
          </Link>
        </div>
        <div className="flex items-center gap-2 md:gap-3">
          <a
            href={site.telefoneHref}
            className="hidden items-center gap-2 rounded-md bg-white px-4 py-2 text-[12px] font-semibold uppercase tracking-wide text-ink transition-opacity hover:opacity-85 md:flex"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
              <path d="M6.6 10.8a15.6 15.6 0 0 0 6.6 6.6l2.2-2.2a1 1 0 0 1 1-.24 11.4 11.4 0 0 0 3.6.6 1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1 11.4 11.4 0 0 0 .6 3.6 1 1 0 0 1-.3 1l-2.2 2.2z" />
            </svg>
            Telefone
          </a>
          <a
            href={`mailto:${site.email}`}
            className="hidden items-center gap-2 rounded-md bg-white px-4 py-2 text-[12px] font-semibold uppercase tracking-wide text-ink transition-opacity hover:opacity-85 md:flex"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
              <path d="M2 5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5zm2 .5 8 5.6 8-5.6V5H4v.5zm16 2.4-8 5.6-8-5.6V19h16V7.9z" />
            </svg>
            E-mail
          </a>
          <a
            href={waLink(site.whatsapp, waTexto)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 rounded-md bg-verde px-4 py-2 text-[12px] font-semibold uppercase tracking-wide text-white transition-opacity hover:opacity-85"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
              <path d="M3.5 3.5c4.7-4.7 12.3-4.7 17 0a12 12 0 0 1-13.8 19.3l-5.8.7a.4.4 0 0 1-.4-.4l.7-5.8A12 12 0 0 1 3.5 3.5zm10 10.2-.9 1.2a9.8 9.8 0 0 1-3.5-3.5l1.2-.9a.8.8 0 0 0 .2-.9l-1.3-2.9a.8.8 0 0 0-.9-.4l-2 .5a.8.8 0 0 0-.6.9A11.8 11.8 0 0 0 15.8 17.5a.8.8 0 0 0 .9-.6l.5-2a.8.8 0 0 0-.4-.9l-2.9-1.3a.8.8 0 0 0-.9.2z" />
            </svg>
            WhatsApp
          </a>
        </div>
      </div>
    </header>
  );
}
