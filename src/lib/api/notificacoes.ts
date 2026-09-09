import { apiFetch } from "./client";
import type { UUID } from "@/lib/types";

const BASE = "/api/notificacoes";

export interface RegistrarDispositivoBody {
  expoPushToken: string;
  usuarioId?: UUID | null;
  plataforma?: string | null;
}

export interface DispositivoPushResponse {
  id: UUID;
  expoPushToken: string;
  usuarioId: UUID | null;
  plataforma: string | null;
  ativo: boolean;
  dataCriacao: string;
  dataAtualizacao: string;
}

export interface ResultadoEnvio {
  dispositivos: number;
  mensagensEnviadas: number;
  falhas: number;
  detalhes: string[];
}

export const notificacoesApi = {
  registrarDispositivo: (body: RegistrarDispositivoBody) =>
    apiFetch<DispositivoPushResponse>(`${BASE}/dispositivos`, {
      method: "POST",
      body,
    }),
  removerDispositivo: (token: string) =>
    apiFetch<void>(`${BASE}/dispositivos`, {
      method: "DELETE",
      query: { token },
    }),
  enviarTeste: (token: string) =>
    apiFetch<ResultadoEnvio>(`${BASE}/testar`, {
      method: "POST",
      query: { token },
    }),
};
