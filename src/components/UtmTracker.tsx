"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { captureOrigem, track } from "@/lib/tracking";

/** Captura UTMs na entrada e dispara view_empreendimento nas páginas de produto. */
export default function UtmTracker() {
  const pathname = usePathname();

  useEffect(() => {
    captureOrigem();
  }, []);

  useEffect(() => {
    const match = pathname.match(/^\/empreendimentos\/([^/]+)$/);
    if (match) {
      track("view_empreendimento", { empreendimento: match[1] });
    }
  }, [pathname]);

  return null;
}
