/**
 * Máscara de dinheiro (R$): separador de milhar "." e separador de centavos
 * ",". Só aceita dígitos e, no máximo, um separador decimal (tudo mais é
 * descartado ao digitar).
 *
 * O teclado numérico decimal do celular emite "." em vez de "," dependendo do
 * idioma do aparelho, então um ponto RECÉM-DIGITADO no fim (texto anterior +
 * ".") é tratado como vírgula. Os demais pontos são os separadores de milhar
 * que a própria máscara inseriu e são descartados — tratá-los como vírgula
 * fazia "2.500" + "0" virar "2,50" e travar o campo.
 *
 * @param anterior texto exibido antes desta digitação (para reconhecer o ponto digitado).
 */
export function maskMoney(raw: string, anterior = ""): string {
  let cleaned = raw.replace(/[^\d,.]/g, "");
  const pontoDigitadoAgora =
    cleaned.endsWith(".") && !cleaned.includes(",") && raw.length === anterior.length + 1;
  cleaned = cleaned.replace(/\./g, "") + (pontoDigitadoAgora ? "," : "");

  const primeiraVirgula = cleaned.indexOf(",");
  if (primeiraVirgula !== -1) {
    cleaned =
      cleaned.slice(0, primeiraVirgula + 1) +
      cleaned.slice(primeiraVirgula + 1).replace(/,/g, "");
  }

  const partes = cleaned.split(",");
  const centavos = partes[1];
  const inteiro = partes[0]
    .replace(/^0+(?=\d)/, "")
    .replace(/\B(?=(\d{3})+(?!\d))/g, ".");

  if (centavos === undefined) return inteiro;
  return `${inteiro || "0"},${centavos.slice(0, 2)}`;
}

/** Converte o texto mascarado (ex.: "1.234,56") para número (1234.56). */
export function parseMoneyMask(masked: string): number | undefined {
  if (!masked) return undefined;
  const normalizado = masked.replace(/\./g, "").replace(",", ".");
  const numero = Number(normalizado);
  return Number.isNaN(numero) ? undefined : numero;
}

/**
 * Formata um número (1234.56) como texto mascarado ("1.234,56").
 * Sem `Intl`/`toLocaleString` (instável no Hermes sem ICU completo) — mesma
 * convenção de `lib/format.ts`.
 */
export function formatMoneyValue(value: number | undefined | null): string {
  if (value === undefined || value === null || Number.isNaN(value)) return "";
  const negativo = value < 0;
  const [inteiro, decimais] = Math.abs(value).toFixed(2).split(".");
  const comMilhar = inteiro.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return `${negativo ? "-" : ""}${comMilhar},${decimais}`;
}
