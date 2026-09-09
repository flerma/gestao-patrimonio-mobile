import { Platform } from "react-native";
import Constants, { ExecutionEnvironment } from "expo-constants";
import * as Device from "expo-device";

export const CANAL_ALERTAS = "alertas";

/**
 * O Expo Go removeu o push remoto no Android (SDK 53+). Nesse ambiente o módulo
 * `expo-notifications` quebra só de ser importado, então ele é carregado sob
 * demanda e só fora do Expo Go.
 */
export const isExpoGo =
  Constants.executionEnvironment === ExecutionEnvironment.StoreClient;

type NotificationsModule = typeof import("expo-notifications");
let cache: NotificationsModule | null | undefined;

function getNotifications(): NotificationsModule | null {
  if (isExpoGo) return null;
  if (cache === undefined) {
    try {
      cache = require("expo-notifications") as NotificationsModule;
    } catch (erro) {
      console.warn("expo-notifications indisponível", erro);
      cache = null;
    }
  }
  return cache;
}

/** Define como exibir notificações com o app aberto. No-op no Expo Go. */
export function configurarHandlerNotificacoes(): void {
  const N = getNotifications();
  if (!N) return;
  N.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
}

export type MotivoPush =
  | "expo-go"
  | "sem-suporte"
  | "sem-project-id"
  | "permissao-negada"
  | "erro";

export type RegistroPush =
  | { ok: true; token: string }
  | { ok: false; motivo: MotivoPush };

/** projectId do EAS — necessário para o token de push da Expo. */
export function getProjectId(): string | undefined {
  const extra = Constants.expoConfig?.extra as
    | { eas?: { projectId?: string } }
    | undefined;
  return (
    extra?.eas?.projectId ??
    (Constants as unknown as { easConfig?: { projectId?: string } }).easConfig
      ?.projectId ??
    undefined
  );
}

export async function garantirCanalAndroid(): Promise<void> {
  const N = getNotifications();
  if (!N || Platform.OS !== "android") return;
  await N.setNotificationChannelAsync(CANAL_ALERTAS, {
    name: "Alertas",
    importance: N.AndroidImportance.HIGH,
    lockscreenVisibility: N.AndroidNotificationVisibility.PUBLIC,
    vibrationPattern: [0, 250, 250, 250],
  });
}

/** "granted" | "denied" | "undetermined" | "unavailable" (Expo Go). */
export async function statusPermissao(): Promise<string> {
  const N = getNotifications();
  if (!N) return "unavailable";
  const settings = await N.getPermissionsAsync();
  return settings.status;
}

/**
 * Garante permissão + canal e devolve o token de push da Expo.
 * Retorna `ok: false` no Expo Go, sem aparelho físico ou sem projectId.
 */
export async function registrarParaPush(
  solicitarPermissao = true,
): Promise<RegistroPush> {
  const N = getNotifications();
  if (!N) return { ok: false, motivo: "expo-go" };
  if (!Device.isDevice) return { ok: false, motivo: "sem-suporte" };

  await garantirCanalAndroid();

  let { status } = await N.getPermissionsAsync();
  if (status !== "granted" && solicitarPermissao) {
    status = (await N.requestPermissionsAsync()).status;
  }
  if (status !== "granted") return { ok: false, motivo: "permissao-negada" };

  const projectId = getProjectId();
  if (!projectId) return { ok: false, motivo: "sem-project-id" };

  try {
    const { data } = await N.getExpoPushTokenAsync({ projectId });
    return { ok: true, token: data };
  } catch (erro) {
    console.warn("getExpoPushTokenAsync falhou", erro);
    return { ok: false, motivo: "erro" };
  }
}
