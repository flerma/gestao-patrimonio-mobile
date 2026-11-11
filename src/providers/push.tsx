import * as React from "react";
import { Platform } from "react-native";
import { useRouter, type Href } from "expo-router";

import { notificacoesApi } from "@/lib/api/notificacoes";
import {
  isExpoGo,
  ouvirToqueEmNotificacao,
  registrarParaPush,
  statusPermissao,
} from "@/lib/push";
import { useAuth } from "./auth";

/**
 * Registra o token de push no backend quando a permissão JÁ foi concedida
 * (a concessão acontece na tela de Ajustes). Reexecuta ao trocar de usuário
 * logado. Inerte no Expo Go.
 */
export function PushRegistrar() {
  const { usuario, carregando } = useAuth();
  const usuarioId = usuario?.id ?? null;
  const ultimoRef = React.useRef<string | null>(null);

  React.useEffect(() => {
    if (carregando || isExpoGo) return;
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
          usuarioId,
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
  }, [carregando, usuarioId]);

  // Tocar num push com `data.href` abre a tela correspondente (só logado).
  const router = useRouter();
  const ultimaNotificacaoRef = React.useRef<string | null>(null);
  React.useEffect(() => {
    if (carregando || !usuarioId) return;
    return ouvirToqueEmNotificacao((href, notificacaoId) => {
      // evita reabrir a mesma notificação (a que abriu o app é reentregue)
      if (ultimaNotificacaoRef.current === notificacaoId) return;
      ultimaNotificacaoRef.current = notificacaoId;
      router.push(href as Href);
    });
  }, [carregando, usuarioId, router]);

  return null;
}
