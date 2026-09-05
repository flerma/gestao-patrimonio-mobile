import { apiFetch } from "./client";
import type { InquilinoRequest, InquilinoResponse, UUID } from "@/lib/types";

const BASE = "/api/inquilinos";

export const inquilinosApi = {
  listar: () => apiFetch<InquilinoResponse[]>(BASE),
  buscarPorId: (id: UUID) => apiFetch<InquilinoResponse>(`${BASE}/${id}`),
  criar: (body: InquilinoRequest) =>
    apiFetch<InquilinoResponse>(BASE, { method: "POST", body }),
  atualizar: (id: UUID, body: InquilinoRequest) =>
    apiFetch<InquilinoResponse>(`${BASE}/${id}`, { method: "PUT", body }),
  deletar: (id: UUID) =>
    apiFetch<void>(`${BASE}/${id}`, { method: "DELETE" }),
};
