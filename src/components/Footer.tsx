import Link from "next/link";
import { site } from "@/lib/site";
import { publicados } from "@/data/empreendimentos";

export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-[#0a0a0a]">
      <div className="mx-auto grid w-full max-w-6xl gap-10 px-5 py-14 md:grid-cols-4">
        <div>
          <p className="text-lg font-bold uppercase tracking-[0.35em]">Focal</p>
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-[#a3a39c]">
            {site.slogan}
          </p>
        </div>

        <nav aria-label="Empreendimentos">
          <p className="text-xs font-semibold uppercase tracking-widest text-white/50">
            Empreendimentos
          </p>
          <ul className="mt-4 space-y-2 text-sm">
            {publicados.map((e) => (
              <li key={e.slug}>
                <Link
                  href={`/empreendimentos/${e.slug}`}
                  className="text-white/80 hover:text-[#7fb89a]"
                >
                  {e.nome} — {e.bairro}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/empreendimentos" className="text-[#7fb89a]">
                Ver portfólio completo →
              </Link>
            </li>
          </ul>
        </nav>

        <nav aria-label="Institucional">
          <p className="text-xs font-semibold uppercase tracking-widest text-white/50">
            A Focal
          </p>
          <ul className="mt-4 space-y-2 text-sm">
            <li><Link href="/sobre" className="text-white/80 hover:text-[#7fb89a]">Sobre</Link></li>
            <li><Link href="/parcerias" className="text-white/80 hover:text-[#7fb89a]">Parcerias</Link></li>
            <li><Link href="/atendimento" className="text-white/80 hover:text-[#7fb89a]">Atendimento</Link></li>
            <li><Link href="/clientes" className="text-white/80 hover:text-[#7fb89a]">Área de clientes</Link></li>
            <li><Link href="/privacidade" className="text-white/80 hover:text-[#7fb89a]">Privacidade</Link></li>
          </ul>
        </nav>

        <div className="text-sm text-[#a3a39c]">
          <p className="text-xs font-semibold uppercase tracking-widest text-white/50">
            Contato
          </p>
          <p className="mt-4">{site.endereco}</p>
          <p className="mt-2">
            <a href={`tel:+55${site.telefone.replace(/\D/g, "")}`} className="hover:text-[#7fb89a]">
              {site.telefone}
            </a>
          </p>
          <p className="mt-1">
            <a href={`mailto:${site.email}`} className="hover:text-[#7fb89a]">
              {site.email}
            </a>
          </p>
          <p className="mt-4 flex gap-4">
            <a href={site.instagram} target="_blank" rel="noopener noreferrer" className="hover:text-[#7fb89a]">
              Instagram
            </a>
            <a href={site.linkedin} target="_blank" rel="noopener noreferrer" className="hover:text-[#7fb89a]">
              LinkedIn
            </a>
          </p>
        </div>
      </div>
      <div className="border-t border-white/10 py-5 text-center text-xs text-white/40">
        Focal Incorporadora e Desenvolvimento Imobiliário Ltda · CNPJ {site.cnpj} · São
        Paulo/SP
      </div>
    </footer>
  );
}
