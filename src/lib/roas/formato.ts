// Formatação dos números do relatório — um lugar só, para o painel e o CSV
// contarem a mesma história.

const REAIS = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  maximumFractionDigits: 0,
});
const REAIS_CURTO = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  notation: "compact",
  maximumFractionDigits: 1,
});
const NUMERO = new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 1 });
const INTEIRO = new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 0 });
const PERCENTUAL = new Intl.NumberFormat("pt-BR", { style: "percent", maximumFractionDigits: 1 });

export const TRACO = "—";

export function reais(valor?: number) {
  return valor === undefined || !Number.isFinite(valor) ? TRACO : REAIS.format(valor);
}

export function reaisCurto(valor?: number) {
  return valor === undefined || !Number.isFinite(valor) ? TRACO : REAIS_CURTO.format(valor);
}

export function numero(valor?: number) {
  return valor === undefined || !Number.isFinite(valor) ? TRACO : NUMERO.format(valor);
}

export function inteiro(valor?: number) {
  return valor === undefined || !Number.isFinite(valor) ? TRACO : INTEIRO.format(valor);
}

export function percentual(valor?: number) {
  return valor === undefined || !Number.isFinite(valor) ? TRACO : PERCENTUAL.format(valor);
}

/** ROAS é sempre "quantas vezes" — 3,2x lê melhor que 320%. */
export function multiplicador(valor?: number) {
  return valor === undefined || !Number.isFinite(valor) ? TRACO : `${NUMERO.format(valor)}x`;
}

export function dias(valor?: number) {
  return valor === undefined || !Number.isFinite(valor) ? TRACO : `${INTEIRO.format(valor)} d`;
}

export function dataCurta(iso: string) {
  const data = new Date(`${iso.slice(0, 10)}T12:00:00Z`);
  return Number.isNaN(data.getTime())
    ? iso
    : data.toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" });
}
