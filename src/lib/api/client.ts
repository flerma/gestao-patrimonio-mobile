import { getApiBaseUrl } from "@/lib/config";
import {
  clearSession,
  emitSessionExpired,
  getAccessToken,
  getRefreshToken,
  updateAccessToken,
} from "@/lib/auth/token-storage";

export class ApiError extends Error {
  status: number;
  body: unknown;

  constructor(status: number, message: string, body: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.body = body;
  }
}

interface RequestOptions extends Omit<RequestInit, "body"> {
  body?: unknown;
  query?: Record<string, string | number | boolean | null | undefined>;
}

const AUTH_PATH_PREFIX = "/api/auth/";

function isAuthPath(path: string): boolean {
  return path.startsWith(AUTH_PATH_PREFIX);
}

function buildUrl(path: string, query?: RequestOptions["query"]): string {
  const base = getApiBaseUrl();
  let url = path.startsWith("http") ? path : `${base}${path}`;
  if (query) {
    const params = Object.entries(query)
      .filter(([, v]) => v !== null && v !== undefined && v !== "")
      .map(
        ([k, v]) =>
          `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`,
      );
    if (params.length) url += `?${params.join("&")}`;
  }
  return url;
}

async function rawFetch(
  path: string,
  options: RequestOptions,
): Promise<Response> {
  const { body, query, headers, ...rest } = options;

  const authHeaders: Record<string, string> = {};
  if (!isAuthPath(path)) {
    const token = getAccessToken();
    if (token) authHeaders.Authorization = `Bearer ${token}`;
  }

  return fetch(buildUrl(path, query), {
    ...rest,
    headers: {
      Accept: "application/json",
      ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
      ...authHeaders,
      ...headers,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
}

// Evita disparar vários refreshes em paralelo quando várias chamadas
// tomam 401 ao mesmo tempo — todas aguardam a mesma tentativa.
let refreshEmAndamento: Promise<boolean> | null = null;

async function tentarRefreshSilencioso(): Promise<boolean> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return false;

  if (!refreshEmAndamento) {
    refreshEmAndamento = (async () => {
      try {
        const response = await fetch(buildUrl("/api/auth/refresh"), {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ refreshToken }),
        });
        if (!response.ok) return false;

        const text = await response.text();
        const parsed = text ? safeJsonParse(text) : null;
        const accessToken =
          parsed && typeof parsed === "object"
            ? (parsed as { accessToken?: unknown }).accessToken
            : undefined;
        if (typeof accessToken !== "string" || !accessToken) return false;

        await updateAccessToken(accessToken);
        return true;
      } catch {
        return false;
      }
    })().finally(() => {
      refreshEmAndamento = null;
    });
  }

  return refreshEmAndamento;
}

async function toResult<T>(response: Response, path: string): Promise<T> {
  const text = await response.text();
  const parsed = text ? safeJsonParse(text) : null;

  if (!response.ok) {
    const record =
      parsed && typeof parsed === "object"
        ? (parsed as Record<string, unknown>)
        : null;
    const message =
      (record &&
        (record.message
          ? String(record.message)
          : record.detail
            ? String(record.detail)
            : record.error
              ? String(record.error)
              : null)) ||
      `Erro ${response.status} ao chamar ${path}`;
    throw new ApiError(response.status, message, parsed);
  }

  return parsed as T;
}

export async function apiFetch<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  let response: Response;
  try {
    response = await rawFetch(path, options);
  } catch (cause) {
    throw new Error(
      "Falha de conexão com a API. Confira o endereço do servidor em Ajustes.",
    );
  }

  if (response.status === 401 && !isAuthPath(path)) {
    const renovou = await tentarRefreshSilencioso();
    if (renovou) {
      try {
        response = await rawFetch(path, options);
      } catch (cause) {
        throw new Error(
          "Falha de conexão com a API. Confira o endereço do servidor em Ajustes.",
        );
      }
    } else {
      await clearSession();
      emitSessionExpired();
    }
  }

  return toResult<T>(response, path);
}

function safeJsonParse(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}
