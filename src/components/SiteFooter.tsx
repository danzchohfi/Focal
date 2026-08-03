import Link from "next/link";
import Logo from "./Logo";
import { asset } from "@/lib/asset";
import { site } from "@/lib/site";

// Rodapé preto do site atual: logo, linha de contato e crédito VP.
export default function SiteFooter() {
  return (
    <footer className="bg-black">
      <div className="mx-auto flex max-w-[1400px] flex-col items-center gap-6 px-6 py-10 md:flex-row md:justify-between md:px-10">
        <Link href="/" aria-label="Focal Inc — Home">
          <Logo tone="branco" className="h-8 w-auto md:h-9" />
        </Link>
        <p className="din text-center text-[13px] text-white md:text-[14px]">
          {site.endereco} |{" "}
          <a href={site.telefoneHref} className="hover:opacity-70">
            {site.telefone}
          </a>{" "}
          |{" "}
          <a href={`mailto:${site.email}`} className="hover:opacity-70">
            {site.email}
          </a>
        </p>
        <a
          href="https://vitaminapublicitaria.com.br"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Vitamina Publicitária"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={asset("/wp/VP-e1701204830859.png")} alt="VP" className="h-6 w-auto" />
        </a>
      </div>
    </footer>
  );
}
