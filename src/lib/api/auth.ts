import { apiFetch } from "./client";
import type {
  IsoDateTime,
  ProvedorAutenticacao,
  StatusUsuario,
  UUID,
} from "@/lib/types";

const BASE = "/api/auth";

export interface LoginRequest {
  usuario: string;
  senha: string;
}

/** Usuário autenticado, conforme devolvido por /api/auth/login e /api/auth/registrar. */
export interface UsuarioAutenticado {
  id: UUID;
  nome: string;
  email: string;
  telefone?: string | null;
  provedorAutenticacao: ProvedorAutenticacao;
  idUsuarioProvedor?: string | null;
  status: StatusUsuario;
  dataCriacao: IsoDateTime;
  dataAtualizacao: IsoDateTime;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  usuario: UsuarioAutenticado;
}

export interface RefreshResponse {
  accessToken: string;
  refreshToken: string | null;
  expiresIn: number;
  usuario: null;
}

export interface RegistrarRequest {
  nome: string;
  email: string;
  telefone: string;
  senha: string;
  confirmarSenha: string;
}

export const authApi = {
  login: (body: LoginRequest) =>
    apiFetch<LoginResponse>(`${BASE}/login`, { method: "POST", body }),
  registrar: (body: RegistrarRequest) =>
    apiFetch<UsuarioAutenticado>(`${BASE}/registrar`, {
      method: "POST",
      body,
    }),
  refresh: (refreshToken: string) =>
    apiFetch<RefreshResponse>(`${BASE}/refresh`, {
      method: "POST",
      body: { refreshToken },
    }),
  logout: (refreshToken: string) =>
    apiFetch<void>(`${BASE}/logout`, {
      method: "POST",
      body: { refreshToken },
    }),
};
