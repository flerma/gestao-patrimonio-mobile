import { apiFetch } from "./client";
import type { UUID, UsuarioRequest, UsuarioResponse } from "@/lib/types";

const BASE = "/api/usuarios";

export const usuariosApi = {
  listar: () => apiFetch<UsuarioResponse[]>(BASE),
  buscarPorId: (id: UUID) => apiFetch<UsuarioResponse>(`${BASE}/${id}`),
  criar: (body: UsuarioRequest) =>
    apiFetch<UsuarioResponse>(BASE, { method: "POST", body }),
  atualizar: (id: UUID, body: UsuarioRequest) =>
    apiFetch<UsuarioResponse>(`${BASE}/${id}`, { method: "PUT", body }),
  deletar: (id: UUID) =>
    apiFetch<void>(`${BASE}/${id}`, { method: "DELETE" }),
};
