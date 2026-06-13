import type { Metadata } from "next";
import { Suspense } from "react";
import Atendimento from "./Atendimento";

export const metadata: Metadata = {
  title: "Atendimento",
  description:
    "Fale com a Focal: comprar, investir, apresentar um terreno, parcerias, fornecedores ou assistência técnica — pelo canal certo.",
};

export default function AtendimentoPage() {
  return (
    <Suspense>
      <Atendimento />
    </Suspense>
  );
}
