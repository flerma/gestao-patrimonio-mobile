import { getApiBaseUrl } from "@/lib/config";

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

export async function apiFetch<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const { body, query, headers, ...rest } = options;

  let response: Response;
  try {
    response = await fetch(buildUrl(path, query), {
      ...rest,
      headers: {
        Accept: "application/json",
        ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
        ...headers,
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch (cause) {
    throw new Error(
      "Falha de conexão com a API. Confira o endereço do servidor em Ajustes.",
    );
  }

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

function safeJsonParse(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}
