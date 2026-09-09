import * as React from "react";
import { Platform, StyleSheet, TextInput, View } from "react-native";
import { useRouter } from "expo-router";

import {
  DEFAULT_API_BASE_URL,
  getApiBaseUrl,
  onApiBaseUrlChange,
  resetApiBaseUrl,
  setApiBaseUrl,
} from "@/lib/config";
import { notificacoesApi } from "@/lib/api/notificacoes";
import { isExpoGo, registrarParaPush, statusPermissao } from "@/lib/push";
import { queryClient } from "@/providers/query";
import { useSelectedUser } from "@/providers/selected-user";
import { toast } from "@/lib/toast";
import { colors, radius, spacing } from "@/lib/theme";
import { Screen } from "@/components/ui/Screen";
import { Card, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Txt } from "@/components/ui/Txt";

const LABEL_PERMISSAO: Record<string, string> = {
  granted: "concedida",
  denied: "negada",
  undetermined: "não solicitada",
  unavailable: "indisponível no Expo Go",
};

const MOTIVO_MSG: Record<string, string> = {
  "expo-go":
    "Notificações só funcionam em um build de desenvolvimento, não no Expo Go.",
  "sem-suporte": "Push só funciona em aparelho físico.",
  "sem-project-id":
    "Falta configurar o EAS. Rode `eas init` e use um build de desenvolvimento (não o Expo Go).",
  "permissao-negada":
    "Permissão negada. Habilite as notificações nas configurações do sistema.",
  erro: "Não foi possível obter o token de push.",
};

export default function AjustesScreen() {
  const router = useRouter();
  const { usuarioId } = useSelectedUser();
  const [url, setUrl] = React.useState(getApiBaseUrl());
  const [current, setCurrent] = React.useState(getApiBaseUrl());

  const [permissao, setPermissao] = React.useState<string>("undetermined");
  const [ocupado, setOcupado] = React.useState(false);

  React.useEffect(() => onApiBaseUrlChange(setCurrent), []);
  React.useEffect(() => {
    statusPermissao().then(setPermissao).catch(() => {});
  }, []);

  const aplicar = async (value: string) => {
    await setApiBaseUrl(value);
    queryClient.clear();
    toast.success("Servidor atualizado.");
    router.back();
  };

  const ativarNotificacoes = async () => {
    setOcupado(true);
    try {
      const registro = await registrarParaPush(true);
      setPermissao(await statusPermissao());
      if (!registro.ok) {
        toast.error(MOTIVO_MSG[registro.motivo] ?? "Não foi possível ativar.");
        return;
      }
      await notificacoesApi.registrarDispositivo({
        expoPushToken: registro.token,
        usuarioId: usuarioId ?? null,
        plataforma: Platform.OS,
      });
      toast.success("Notificações ativadas neste aparelho.");
    } catch {
      toast.error("Não foi possível ativar as notificações.");
    } finally {
      setOcupado(false);
    }
  };

  const enviarTeste = async () => {
    setOcupado(true);
    try {
      const registro = await registrarParaPush(false);
      if (!registro.ok) {
        toast.error("Ative as notificações primeiro.");
        return;
      }
      const r = await notificacoesApi.enviarTeste(registro.token);
      toast.success(
        r.mensagensEnviadas > 0
          ? "Push de teste enviado. Deve chegar em alguns segundos."
          : `Nada enviado (${r.falhas} falha(s)).`,
      );
    } catch {
      toast.error("Não foi possível enviar o teste.");
    } finally {
      setOcupado(false);
    }
  };

  return (
    <Screen>
      <Card>
        <CardTitle>Servidor da API</CardTitle>
        <Txt variant="muted">
          Endereço do backend gestao-patrimonio-imobiliario. Use o IP da máquina
          na sua rede para testar em um aparelho físico.
        </Txt>
        <Txt variant="muted">Atual: {current}</Txt>
        <TextInput
          value={url}
          onChangeText={setUrl}
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="url"
          placeholder="http://192.168.0.10:8080"
          placeholderTextColor={colors.textFaint}
          style={styles.input}
        />
        <Button title="Salvar e recarregar" onPress={() => aplicar(url)} />
        <Button
          title={`Restaurar padrão (${DEFAULT_API_BASE_URL})`}
          variant="outline"
          onPress={async () => {
            await resetApiBaseUrl();
            setUrl(DEFAULT_API_BASE_URL);
            queryClient.clear();
            toast.success("Restaurado o servidor padrão.");
          }}
        />
      </Card>

      <View style={{ marginTop: spacing.lg }}>
        <Card>
          <CardTitle>Notificações</CardTitle>
          <Txt variant="muted">
            Recebe um resumo diário dos alertas do dashboard (contratos vencidos,
            imóveis disponíveis etc.). Requer aparelho físico e um build de
            desenvolvimento — não funciona no Expo Go.
          </Txt>
          <Txt variant="muted">
            Permissão: {LABEL_PERMISSAO[permissao] ?? permissao}
          </Txt>
          {isExpoGo ? (
            <Txt variant="muted">
              Rodando no Expo Go — gere um build de desenvolvimento
              (`npx expo run:android`) para ativar.
            </Txt>
          ) : (
            <>
              <Button
                title={
                  permissao === "granted"
                    ? "Reativar / atualizar"
                    : "Ativar notificações"
                }
                onPress={ativarNotificacoes}
                loading={ocupado}
              />
              <Button
                title="Enviar teste"
                variant="outline"
                onPress={enviarTeste}
                loading={ocupado}
              />
            </>
          )}
        </Card>
      </View>

      <View style={{ marginTop: spacing.lg }}>
        <Txt variant="muted">
          Dicas de endereço:{"\n"}• Emulador Android: http://10.0.2.2:8080{"\n"}•
          Simulador iOS: http://localhost:8080{"\n"}• Aparelho físico:
          http://SEU_IP_LOCAL:8080
        </Txt>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  input: {
    minHeight: 46,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
    fontSize: 15,
    color: colors.text,
  },
});
