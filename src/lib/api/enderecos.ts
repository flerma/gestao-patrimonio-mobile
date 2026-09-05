import { apiFetch } from "./client";
import type { Endereco } from "@/lib/types";

const BASE = "/api/enderecos";

export const enderecosApi = {
  /** Consulta o endereço de um CEP (8 dígitos, com ou sem máscara). */
  buscarPorCep: (cep: string) => {
    const limpo = cep.replace(/\D/g, "");
    return apiFetch<Endereco>(`${BASE}/cep/${limpo}`);
  },
};
