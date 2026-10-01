import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";

const STORAGE_KEY = "gpi:apiBaseUrl";

function normalize(value: string): string {
  return value.trim().replace(/\/+$/, "");
}

const extra = (Constants.expoConfig?.extra ?? {}) as {
  apiBaseUrl?: string;
  appEnv?: string;
};

/**
 * Build de produção (loja / perfis `production` e `preview` do eas.json, ou
 * `npm run start:prod`). Nele a URL da API é fixa: a troca manual em Ajustes
 * fica oculta e um valor salvo anteriormente é ignorado.
 */
export const IS_PRODUCTION = extra.appEnv === "production";

/**
 * Valor padrão (env EXPO_PUBLIC_API_BASE_URL > app.json extra > fallback).
 * Produção: definido por perfil no eas.json (https://api.gestaoseupatrimonio.com.br).
 * Local: app.json extra.apiBaseUrl (emulador Android) ou .env.local.
 */
export const DEFAULT_API_BASE_URL = normalize(
  process.env.EXPO_PUBLIC_API_BASE_URL ||
    extra.apiBaseUrl ||
    "http://10.0.2.2:8080",
);

let current = DEFAULT_API_BASE_URL;
const listeners = new Set<(url: string) => void>();

export function getApiBaseUrl(): string {
  return current;
}

export function onApiBaseUrlChange(cb: (url: string) => void): () => void {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}

/** Carrega o valor salvo pelo usuário (chamar no boot). */
export async function loadApiBaseUrl(): Promise<string> {
  if (IS_PRODUCTION) return current;
  try {
    const saved = await AsyncStorage.getItem(STORAGE_KEY);
    if (saved) {
      current = normalize(saved);
      emit();
    }
  } catch {
    /* ignore */
  }
  return current;
}

export async function setApiBaseUrl(url: string): Promise<void> {
  current = normalize(url);
  try {
    await AsyncStorage.setItem(STORAGE_KEY, current);
  } catch {
    /* ignore */
  }
  emit();
}

export async function resetApiBaseUrl(): Promise<void> {
  current = DEFAULT_API_BASE_URL;
  try {
    await AsyncStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
  emit();
}

function emit() {
  listeners.forEach((cb) => cb(current));
}
