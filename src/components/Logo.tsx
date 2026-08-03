import { asset } from "@/lib/asset";

// Logos originais do site (Focal-Negative = branco, Focal-Positive = preto)
export default function Logo({
  tone = "branco",
  className = "h-7 w-auto",
}: {
  tone?: "branco" | "preto";
  className?: string;
}) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={asset(tone === "branco" ? "/wp/Focal-Negative.png" : "/wp/Focal-Positive.png")}
      alt="Focal Inc"
      className={className}
    />
  );
}
