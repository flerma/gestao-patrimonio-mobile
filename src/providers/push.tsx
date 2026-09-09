import * as React from "react";
import { Platform } from "react-native";

import { notificacoesApi } from "@/lib/api/notificacoes";
import { isExpoGo, registrarParaPush, statusPermissao } from "@/lib/push";
import { useSelectedUser } from "./selected-user";

/**
 * Registra o token de push no backend quando a permissão JÁ foi concedida
 * (a concessão acontece na tela de Ajustes). Reexecuta ao trocar de
 * proprietário. Inerte no Expo Go.
 */
export function PushRegistrar() {
  const { usuarioId, hydrated } = useSelectedUser();
  const ultimoRef = React.useRef<string | null>(null);

  React.useEffect(() => {
    if (!hydrated || isExpoGo) return;
    let cancelado = false;

    (async () => {
      try {
        if ((await statusPermissao()) !== "granted") return;

        const registro = await registrarParaPush(false);
        if (cancelado || !registro.ok) return;

        const chave = `${registro.token}|${usuarioId ?? ""}`;
        if (ultimoRef.current === chave) return;

        await notificacoesApi.registrarDispositivo({
          expoPushToken: registro.token,
          usuarioId: usuarioId ?? null,
          plataforma: Platform.OS,
        });
        ultimoRef.current = chave;
      } catch (erro) {
        console.warn("Falha ao registrar push", erro);
      }
    })();

    return () => {
      cancelado = true;
    };
  }, [hydrated, usuarioId]);

  return null;
}
