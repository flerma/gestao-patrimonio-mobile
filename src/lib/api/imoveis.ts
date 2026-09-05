import { apiFetch } from "./client";
import type { ImovelRequest, ImovelResponse, UUID } from "@/lib/types";

const BASE = "/api/imoveis";

export const imoveisApi = {
  listar: () => apiFetch<ImovelResponse[]>(BASE),
  buscarPorId: (id: UUID) => apiFetch<ImovelResponse>(`${BASE}/${id}`),
  criar: (body: ImovelRequest) =>
    apiFetch<ImovelResponse>(BASE, { method: "POST", body }),
  atualizar: (id: UUID, body: ImovelRequest) =>
    apiFetch<ImovelResponse>(`${BASE}/${id}`, { method: "PUT", body }),
  deletar: (id: UUID) =>
    apiFetch<void>(`${BASE}/${id}`, { method: "DELETE" }),
};
