// Prefixa o basePath (GitHub Pages usa /Focal) em assets servidos de public/.
const base = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export function asset(path: string) {
  return `${base}${path}`;
}
