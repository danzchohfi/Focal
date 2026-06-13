// next/image não prefixa o basePath em `src` string quando `images.unoptimized`
// está ativo (export estático). Para o deploy do GitHub Pages funcionar sob
// /Focal, prefixamos manualmente os caminhos locais. No build de servidor
// (sem NEXT_PUBLIC_BASE_PATH) o prefixo é vazio e nada muda.
const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export function asset(src?: string): string | undefined {
  if (!src) return src;
  if (/^https?:\/\//.test(src)) return src; // URL absoluta
  if (!src.startsWith("/")) return src; // caminho relativo, não mexe
  if (BASE && src.startsWith(`${BASE}/`)) return src; // já prefixado
  return `${BASE}${src}`;
}
