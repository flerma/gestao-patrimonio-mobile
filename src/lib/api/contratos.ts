import { apiFetch } from "./client";
import type { ContratoRequest, ContratoResponse, UUID } from "@/lib/types";

const BASE = "/api/contratos";

export const contratosApi = {
  listar: () => apiFetch<ContratoResponse[]>(BASE),
  buscarPorId: (id: UUID) => apiFetch<ContratoResponse>(`${BASE}/${id}`),
  criar: (body: ContratoRequest) =>
    apiFetch<ContratoResponse>(BASE, { method: "POST", body }),
  atualizar: (id: UUID, body: ContratoRequest) =>
    apiFetch<ContratoResponse>(`${BASE}/${id}`, { method: "PUT", body }),
  deletar: (id: UUID) =>
    apiFetch<void>(`${BASE}/${id}`, { method: "DELETE" }),
};
