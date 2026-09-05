import * as React from "react";
import { StyleSheet, TextInput, View } from "react-native";
import { useRouter } from "expo-router";

import {
  DEFAULT_API_BASE_URL,
  getApiBaseUrl,
  onApiBaseUrlChange,
  resetApiBaseUrl,
  setApiBaseUrl,
} from "@/lib/config";
import { queryClient } from "@/providers/query";
import { toast } from "@/lib/toast";
import { colors, radius, spacing } from "@/lib/theme";
import { Screen } from "@/components/ui/Screen";
import { Card, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Txt } from "@/components/ui/Txt";

export default function AjustesScreen() {
  const router = useRouter();
  const [url, setUrl] = React.useState(getApiBaseUrl());
  const [current, setCurrent] = React.useState(getApiBaseUrl());

  React.useEffect(() => onApiBaseUrlChange(setCurrent), []);

  const aplicar = async (value: string) => {
    await setApiBaseUrl(value);
    queryClient.clear();
    toast.success("Servidor atualizado.");
    router.back();
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
