"use client";

import { useEffect } from "react";
import { track } from "@/lib/track";

// Registra a visualização da página do experimento (uma vez por pageview).
export default function TrackView({
  experiment,
  variant,
}: {
  experiment: string;
  variant: string;
}) {
  useEffect(() => {
    track("lp_view", { experiment, variant });
  }, [experiment, variant]);
  return null;
}
