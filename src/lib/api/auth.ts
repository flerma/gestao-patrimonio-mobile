import { apiFetch } from "./client";
import type {
  IsoDateTime,
  ProvedorAutenticacao,
  RoleUsuario,
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
  role: RoleUsuario;
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

export interface RedefinirSenhaRequest {
  email: string;
  codigo: string;
  novaSenha: string;
  confirmarSenha: string;
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
  /** Login (e cadastro no primeiro acesso) com o ID token do Google. */
  loginGoogle: (idToken: string) =>
    apiFetch<LoginResponse>(`${BASE}/google`, { method: "POST", body: { idToken } }),
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
  /** Envia (ou reenvia) o código de redefinição de senha ao e-mail. */
  esqueciSenha: (email: string) =>
    apiFetch<void>(`${BASE}/esqueci-senha`, { method: "POST", body: { email } }),
  redefinirSenha: (body: RedefinirSenhaRequest) =>
    apiFetch<void>(`${BASE}/redefinir-senha`, { method: "POST", body }),
  logout: (refreshToken: string) =>
    apiFetch<void>(`${BASE}/logout`, {
      method: "POST",
      body: { refreshToken },
    }),
};
