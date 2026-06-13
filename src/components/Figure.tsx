import Image from "next/image";
import { asset } from "@/lib/asset";

/**
 * Imagem editorial com fallback: enquanto os assets finais (fotos, drones,
 * books) não chegam, renderiza um placeholder coerente com a identidade.
 */
export default function Figure({
  src,
  alt,
  legenda,
  className = "",
  aspect = "aspect-[4/3]",
  sizes = "(min-width: 1024px) 50vw, 100vw",
  priority = false,
}: {
  src?: string;
  alt: string;
  legenda?: string;
  className?: string;
  aspect?: string;
  sizes?: string;
  priority?: boolean;
}) {
  return (
    <figure className={className}>
      <div className={`card-foto relative ${aspect} w-full rounded-sm`}>
        {src ? (
          <Image
            src={asset(src)!}
            alt={alt}
            fill
            sizes={sizes}
            priority={priority}
            className="rounded-sm object-cover"
          />
        ) : (
          <div
            role="img"
            aria-label={alt}
            className="foto-placeholder absolute inset-0 flex items-end rounded-sm p-4"
          >
            <span className="text-xs uppercase tracking-widest text-white/35">
              Focal · imagem em produção
            </span>
          </div>
        )}
      </div>
      {legenda ? (
        <figcaption className="mt-2 text-sm text-[#a3a39c]">{legenda}</figcaption>
      ) : null}
    </figure>
  );
}
