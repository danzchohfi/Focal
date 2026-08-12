"use client";

import { useCallback, useEffect, useRef } from "react";
import { asset } from "@/lib/asset";

export type LightboxItem = {
  /** Caminho de imagem (public/) — ignorado quando `video` está presente */
  src?: string;
  /** Caminho de vídeo mp4 (public/) */
  video?: string;
  /** Legenda opcional exibida sob a mídia */
  cap?: string;
  alt?: string;
};

// Modal de galeria (como o iLightBox do site atual): fundo escuro, mídia
// centralizada, setas, contador, legenda, Esc/←/→ e swipe no touch.
export default function Lightbox({
  items,
  index,
  onClose,
  onNavigate,
}: {
  items: LightboxItem[];
  index: number;
  onClose: () => void;
  onNavigate: (i: number) => void;
}) {
  const touchX = useRef<number | null>(null);
  const item = items[index];
  const many = items.length > 1;

  const prev = useCallback(
    () => onNavigate((index - 1 + items.length) % items.length),
    [index, items.length, onNavigate]
  );
  const next = useCallback(
    () => onNavigate((index + 1) % items.length),
    [index, items.length, onNavigate]
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowLeft" && many) prev();
      else if (e.key === "ArrowRight" && many) next();
    };
    document.addEventListener("keydown", onKey);
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
    };
  }, [onClose, prev, next, many]);

  if (!item) return null;

  const btnCls =
    "flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-sm transition-[background-color,transform] duration-200 hover:bg-white/20 active:scale-95";

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Galeria de imagens"
      className="lb-overlay on-dark fixed inset-0 z-[100] flex flex-col bg-black/92"
      onClick={onClose}
      onTouchStart={(e) => {
        touchX.current = e.touches[0].clientX;
      }}
      onTouchEnd={(e) => {
        if (touchX.current === null || !many) return;
        const dx = e.changedTouches[0].clientX - touchX.current;
        if (Math.abs(dx) > 48) (dx > 0 ? prev : next)();
        touchX.current = null;
      }}
    >
      {/* Topo: contador + fechar */}
      <div className="flex items-center justify-between p-4 md:p-5">
        <span className="px-2 text-[13px] tabular-nums text-white/70">
          {many ? `${index + 1} / ${items.length}` : ""}
        </span>
        <button type="button" aria-label="Fechar" onClick={onClose} className={btnCls}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>
      </div>

      {/* Mídia */}
      <div className="relative flex min-h-0 flex-1 items-center justify-center px-4 pb-4 md:px-20">
        <div key={index} className="lb-media flex max-h-full max-w-full flex-col items-center" onClick={(e) => e.stopPropagation()}>
          {item.video ? (
            <video
              src={asset(item.video)}
              className="max-h-[78svh] max-w-full rounded-md"
              controls
              autoPlay
              playsInline
            />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={asset(item.src ?? "")}
              alt={item.alt ?? item.cap ?? ""}
              className="max-h-[78svh] max-w-full rounded-md object-contain"
            />
          )}
          {item.cap && <p className="mt-4 text-center text-[14px] text-white/80">{item.cap}</p>}
        </div>

        {many && (
          <>
            <button
              type="button"
              aria-label="Anterior"
              onClick={(e) => {
                e.stopPropagation();
                prev();
              }}
              className={`${btnCls} absolute left-3 top-1/2 -translate-y-1/2 md:left-6`}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="m14 18-6-6 6-6" />
              </svg>
            </button>
            <button
              type="button"
              aria-label="Próxima"
              onClick={(e) => {
                e.stopPropagation();
                next();
              }}
              className={`${btnCls} absolute right-3 top-1/2 -translate-y-1/2 md:right-6`}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="m10 6 6 6-6 6" />
              </svg>
            </button>
          </>
        )}
      </div>
    </div>
  );
}
