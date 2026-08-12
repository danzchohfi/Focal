"use client";

import { useEffect, useRef, useState } from "react";
import "leaflet/dist/leaflet.css";
import { asset } from "@/lib/asset";

// Mapa como no site atual (WP Go Maps): mapa claro interativo com o pin
// preto da Focal no endereço exato (zoom 17). Tiles CARTO/OSM — sem chave —
// e carregamento adiado até a seção aproximar do viewport.
export default function MapEmbed({
  query,
  coord,
}: {
  query: string;
  coord: { lat: number; lng: number };
}) {
  const ref = useRef<HTMLDivElement>(null);
  const mapEl = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let map: import("leaflet").Map | null = null;
    let cancelled = false;

    const io = new IntersectionObserver(
      (entries) => {
        if (!entries[0].isIntersecting) return;
        io.disconnect();
        import("leaflet").then((L) => {
          if (cancelled || !mapEl.current) return;
          map = L.map(mapEl.current, {
            center: [coord.lat, coord.lng],
            zoom: 17,
            scrollWheelZoom: false,
          });
          L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", {
            attribution:
              '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
            subdomains: "abcd",
            maxZoom: 20,
          }).addTo(map);
          // Pin original do site (retina 224px → 112px), ponta na base
          const icon = L.icon({
            iconUrl: asset("/wp/localizacao-focal2.png"),
            iconSize: [112, 112],
            iconAnchor: [56, 112],
          });
          L.marker([coord.lat, coord.lng], { icon, title: query, alt: query }).addTo(map);
          map.whenReady(() => setReady(true));
        });
      },
      { rootMargin: "300px" }
    );
    io.observe(el);
    return () => {
      cancelled = true;
      io.disconnect();
      map?.remove();
    };
  }, [coord.lat, coord.lng, query]);

  return (
    <div
      ref={ref}
      className="isolate relative h-[560px] w-full overflow-hidden rounded-lg bg-light md:h-[600px]"
    >
      {/* Skeleton */}
      <div
        className={`absolute inset-0 z-10 flex items-center justify-center bg-light transition-opacity duration-500 ${
          ready ? "pointer-events-none opacity-0" : "opacity-100"
        }`}
        aria-hidden
      >
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#707070" strokeWidth="1.6">
          <path d="M12 21s-7-5.5-7-11a7 7 0 0 1 14 0c0 5.5-7 11-7 11z" />
          <circle cx="12" cy="10" r="2.5" />
        </svg>
      </div>
      <div ref={mapEl} title={`Mapa — ${query}`} className="h-full w-full" />
    </div>
  );
}
