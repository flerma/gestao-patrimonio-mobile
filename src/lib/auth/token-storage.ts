import * as SecureStore from "expo-secure-store";

import type { UUID } from "@/lib/types";

const ACCESS_TOKEN_KEY = "gpi_access_token";
const REFRESH_TOKEN_KEY = "gpi_refresh_token";
const USUARIO_KEY = "gpi_usuario";

/** Cache leve para exibição imediata na UI — a fonte de verdade da sessão são os tokens. */
export interface UsuarioSessao {
  id: UUID;
  nome: string;
  email: string;
}

export interface Sessao {
  accessToken: string;
  refreshToken: string;
  usuario: UsuarioSessao;
}

export interface SessaoCarregada {
  accessToken: string | null;
  refreshToken: string | null;
  usuario: UsuarioSessao | null;
}

// Cache em memória: permite montar o header Authorization de forma síncrona,
// sem precisar aguardar o SecureStore em cada chamada de API.
let accessTokenAtual: string | null = null;
let refreshTokenAtual: string | null = null;

export function getAccessToken(): string | null {
  return accessTokenAtual;
}

export function getRefreshToken(): string | null {
  return refreshTokenAtual;
}

// SecureStore não existe/funciona em todo ambiente (ex.: web) — mesmo padrão
// defensivo usado em src/lib/push.ts: tenta, loga e trata como "sem sessão".
async function setItem(key: string, value: string): Promise<void> {
  try {
    await SecureStore.setItemAsync(key, value);
  } catch (erro) {
    console.warn(`SecureStore: falha ao salvar "${key}"`, erro);
  }
}

async function getItem(key: string): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync(key);
  } catch (erro) {
    console.warn(`SecureStore: falha ao ler "${key}"`, erro);
    return null;
  }
}

async function deleteItem(key: string): Promise<void> {
  try {
    await SecureStore.deleteItemAsync(key);
  } catch (erro) {
    console.warn(`SecureStore: falha ao remover "${key}"`, erro);
  }
}

export async function saveSession(sessao: Sessao): Promise<void> {
  accessTokenAtual = sessao.accessToken;
  refreshTokenAtual = sessao.refreshToken;
  await Promise.all([
    setItem(ACCESS_TOKEN_KEY, sessao.accessToken),
    setItem(REFRESH_TOKEN_KEY, sessao.refreshToken),
    setItem(USUARIO_KEY, JSON.stringify(sessao.usuario)),
  ]);
}

/** Atualiza só o access token, usado após um refresh silencioso bem-sucedido. */
export async function updateAccessToken(accessToken: string): Promise<void> {
  accessTokenAtual = accessToken;
  await setItem(ACCESS_TOKEN_KEY, accessToken);
}

export async function loadSession(): Promise<SessaoCarregada> {
  const [accessToken, refreshToken, usuarioRaw] = await Promise.all([
    getItem(ACCESS_TOKEN_KEY),
    getItem(REFRESH_TOKEN_KEY),
    getItem(USUARIO_KEY),
  ]);

  accessTokenAtual = accessToken;
  refreshTokenAtual = refreshToken;

  let usuario: UsuarioSessao | null = null;
  if (usuarioRaw) {
    try {
      usuario = JSON.parse(usuarioRaw) as UsuarioSessao;
    } catch {
      usuario = null;
    }
  }

  return { accessToken, refreshToken, usuario };
}

export async function clearSession(): Promise<void> {
  accessTokenAtual = null;
  refreshTokenAtual = null;
  await Promise.all([
    deleteItem(ACCESS_TOKEN_KEY),
    deleteItem(REFRESH_TOKEN_KEY),
    deleteItem(USUARIO_KEY),
  ]);
}

// ---- Sessão expirada ----
// Disparado pelo cliente HTTP (src/lib/api/client.ts) quando um refresh
// silencioso falha após um 401. O AuthProvider escuta isso para limpar o
// estado de usuário sem precisar importar o cliente HTTP (evita ciclo).
type SessionExpiredListener = () => void;
const sessionExpiredListeners = new Set<SessionExpiredListener>();

export function onSessionExpired(cb: SessionExpiredListener): () => void {
  sessionExpiredListeners.add(cb);
  return () => {
    sessionExpiredListeners.delete(cb);
  };
}

export function emitSessionExpired(): void {
  sessionExpiredListeners.forEach((cb) => cb());
}
