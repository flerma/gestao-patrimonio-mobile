// Formatação pt-BR sem depender de recursos de Intl instáveis no Hermes
// (notation: "compact", toLocaleDateString com opções, style: "percent").

let currencyFormatter: { format: (n: number) => string };
try {
  currencyFormatter = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
} catch {
  currencyFormatter = {
    format: (n: number) => `R$ ${n.toFixed(2).replace(".", ",")}`,
  };
}

export function formatCurrency(value: number | null | undefined): string {
  return currencyFormatter.format(Number(value ?? 0));
}

export function formatCompactCurrency(value: number | null | undefined): string {
  const n = Number(value ?? 0);
  const abs = Math.abs(n);
  const sinal = n < 0 ? "-" : "";
  if (abs >= 1_000_000) {
    return `${sinal}R$ ${trim(abs / 1_000_000)} mi`;
  }
  if (abs >= 1_000) {
    return `${sinal}R$ ${trim(abs / 1_000)} mil`;
  }
  return `${sinal}R$ ${Math.round(abs)}`;
}

function trim(n: number): string {
  return n.toFixed(1).replace(/\.0$/, "").replace(".", ",");
}

/** Recebe a razão já calculada (ex.: 0.072 => "7,2%"). */
export function formatPercent(ratio: number | null | undefined): string {
  if (ratio === null || ratio === undefined || Number.isNaN(ratio)) return "—";
  return `${(ratio * 100).toFixed(1).replace(".", ",")}%`;
}

export function formatDate(value: string | null | undefined): string {
  if (!value) return "—";
  const date = new Date(value.length <= 10 ? `${value}T00:00:00` : value);
  if (Number.isNaN(date.getTime())) return value;
  const d = String(date.getDate()).padStart(2, "0");
  const m = String(date.getMonth() + 1).padStart(2, "0");
  return `${d}/${m}/${date.getFullYear()}`;
}

export function formatDateTime(value: string | null | undefined): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  const hh = String(date.getHours()).padStart(2, "0");
  const mm = String(date.getMinutes()).padStart(2, "0");
  return `${formatDate(value)} ${hh}:${mm}`;
}

const MESES_ABREV = [
  "jan",
  "fev",
  "mar",
  "abr",
  "mai",
  "jun",
  "jul",
  "ago",
  "set",
  "out",
  "nov",
  "dez",
];

export function formatMonthLabel(monthKey: string): string {
  const [year, month] = monthKey.split("-").map(Number);
  const idx = ((month ?? 1) - 1 + 12) % 12;
  return `${MESES_ABREV[idx]}/${String(year).slice(2)}`;
}

/** Converte SNAKE_CASE / UPPER para "Snake case" legível. */
export function humanizeEnum(value: string | null | undefined): string {
  if (!value) return "—";
  const lower = value.replace(/_/g, " ").toLowerCase();
  return lower.charAt(0).toUpperCase() + lower.slice(1);
}
