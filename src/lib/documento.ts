/** Máscara e validação de CPF e CNPJ (numérico e o novo CNPJ alfanumérico da Receita Federal). */

export function maskCpf(raw: string): string {
  const digits = raw.replace(/\D/g, "").slice(0, 11);
  let out = "";
  for (let i = 0; i < digits.length; i++) {
    if (i === 3 || i === 6) out += ".";
    if (i === 9) out += "-";
    out += digits[i];
  }
  return out;
}

/**
 * Máscara do CNPJ alfanumérico: 12 caracteres alfanuméricos (base) + 2
 * dígitos verificadores sempre numéricos, no formato XX.XXX.XXX/XXXX-XX.
 * Também aceita o CNPJ tradicional (só dígitos), que é um caso particular.
 */
export function maskCnpj(raw: string): string {
  const upper = raw.toUpperCase();
  let clean = "";
  for (const char of upper) {
    if (clean.length < 12) {
      if (/[0-9A-Z]/.test(char)) clean += char;
    } else if (clean.length < 14) {
      if (/[0-9]/.test(char)) clean += char;
    } else {
      break;
    }
  }

  let out = "";
  for (let i = 0; i < clean.length; i++) {
    if (i === 2 || i === 5) out += ".";
    if (i === 8) out += "/";
    if (i === 12) out += "-";
    out += clean[i];
  }
  return out;
}

export function isValidCpf(value: string): boolean {
  const digits = value.replace(/\D/g, "");
  if (digits.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(digits)) return false;

  const calcularDigito = (base: string, fatorInicial: number) => {
    let total = 0;
    let fator = fatorInicial;
    for (const digito of base) {
      total += Number(digito) * fator;
      fator -= 1;
    }
    const resto = total % 11;
    return resto < 2 ? 0 : 11 - resto;
  };

  const base = digits.slice(0, 9);
  const dv1 = calcularDigito(base, 10);
  const dv2 = calcularDigito(base + dv1, 11);
  return digits === base + String(dv1) + String(dv2);
}

/**
 * Valida CNPJ numérico (formato antigo) e alfanumérico (novo formato da
 * Receita Federal). Os dígitos verificadores continuam sempre numéricos; o
 * cálculo usa o valor ASCII de cada caractere da base menos 48 (ver Nota
 * Técnica RFB), que para dígitos 0-9 coincide com o valor numérico usual.
 */
export function isValidCnpj(value: string): boolean {
  const clean = value.toUpperCase().replace(/[^0-9A-Z]/g, "");
  if (clean.length !== 14) return false;

  const base = clean.slice(0, 12);
  const dv = clean.slice(12, 14);
  if (!/^\d{2}$/.test(dv)) return false;
  if (/^(.)\1{13}$/.test(clean)) return false;

  const valorCaractere = (char: string) => char.charCodeAt(0) - 48;
  const calcularDigito = (base: string, pesos: number[]) => {
    let total = 0;
    for (let i = 0; i < base.length; i++) {
      total += valorCaractere(base[i]) * pesos[i];
    }
    const resto = total % 11;
    return resto < 2 ? 0 : 11 - resto;
  };

  const pesos1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  const pesos2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  const dv1 = calcularDigito(base, pesos1);
  const dv2 = calcularDigito(base + String(dv1), pesos2);
  return dv === `${dv1}${dv2}`;
}
