// Leitura defensiva dos payloads do CVCRM.
//
// O mesmo dado aparece com nomes diferentes conforme o endpoint (transacional
// x CVDW) e o formato dos valores varia — data em ISO ou "dd/mm/aaaa", dinheiro
// em número ou em "R$ 2.054.000,00". Estas funções absorvem essa variação num
// lugar só.

type Bruto = Record<string, unknown>;

/** Primeiro caminho que existir no objeto. Aceita `a.b.c`. */
export function pega(objeto: Bruto | undefined, ...caminhos: string[]): unknown {
  if (!objeto) return undefined;
  for (const caminho of caminhos) {
    let atual: unknown = objeto;
    for (const parte of caminho.split(".")) {
      if (atual && typeof atual === "object" && parte in (atual as Bruto)) {
        atual = (atual as Bruto)[parte];
      } else {
        atual = undefined;
        break;
      }
    }
    if (atual !== undefined && atual !== null && atual !== "") return atual;
  }
  return undefined;
}

export function texto(valor: unknown): string | undefined {
  if (valor === undefined || valor === null) return undefined;
  if (typeof valor === "object") return undefined;
  const limpo = String(valor).trim();
  return limpo || undefined;
}

/** "R$ 2.054.000,00" · "2054000.00" · 2054000 → 2054000 */
export function paraNumero(valor: unknown): number | undefined {
  if (typeof valor === "number") return Number.isFinite(valor) ? valor : undefined;
  const bruto = texto(valor);
  if (!bruto) return undefined;
  const limpo = bruto.replace(/[^\d,.-]/g, "");
  if (!limpo) return undefined;
  // Formato brasileiro: ponto é separador de milhar, vírgula é decimal.
  const normalizado =
    limpo.includes(",") && limpo.lastIndexOf(",") > limpo.lastIndexOf(".")
      ? limpo.replace(/\./g, "").replace(",", ".")
      : limpo.replace(/,/g, "");
  const numero = Number(normalizado);
  return Number.isFinite(numero) ? numero : undefined;
}

/** ISO, "dd/mm/aaaa [hh:mm[:ss]]" ou "aaaa-mm-dd hh:mm:ss" → ISO 8601. */
export function paraIso(valor: unknown): string | undefined {
  const bruto = texto(valor);
  if (!bruto) return undefined;

  const brasileira = bruto.match(
    /^(\d{2})\/(\d{2})\/(\d{4})(?:[ T](\d{2}):(\d{2})(?::(\d{2}))?)?$/
  );
  if (brasileira) {
    const [, dia, mes, ano, hora = "00", minuto = "00", segundo = "00"] = brasileira;
    // O CV opera em horário de Brasília.
    const data = new Date(`${ano}-${mes}-${dia}T${hora}:${minuto}:${segundo}-03:00`);
    return Number.isNaN(data.getTime()) ? undefined : data.toISOString();
  }

  const semFuso = /^\d{4}-\d{2}-\d{2}[ T]\d{2}:\d{2}(:\d{2})?$/.test(bruto);
  const data = new Date(semFuso ? `${bruto.replace(" ", "T")}-03:00` : bruto);
  return Number.isNaN(data.getTime()) ? undefined : data.toISOString();
}

/** IDs de lead vêm como "168523,4322" em vários endpoints do CVDW. */
export function listaIds(valor: unknown): string[] {
  const bruto = texto(valor);
  if (!bruto) return [];
  return bruto
    .split(/[,;]/)
    .map((item) => item.trim())
    .filter(Boolean);
}
