import * as React from "react";
import { Image, View } from "react-native";
import { useRouter } from "expo-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { authApi } from "@/lib/api/auth";
import { ApiError } from "@/lib/api";
import { colors, spacing } from "@/lib/theme";
import { Screen } from "@/components/ui/Screen";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Txt } from "@/components/ui/Txt";
import { TextField } from "@/components/forms/fields";

const schema = z.object({
  email: z.string().trim().min(1, "Informe o e-mail").email("E-mail inválido"),
});
type FormValues = z.infer<typeof schema>;

export default function EsqueciSenhaScreen() {
  const router = useRouter();
  const [enviando, setEnviando] = React.useState(false);
  const [erro, setErro] = React.useState<string | null>(null);

  const { control, handleSubmit } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: "" },
  });

  const onSubmit = async ({ email }: FormValues) => {
    setErro(null);
    setEnviando(true);
    try {
      await authApi.esqueciSenha(email.trim());
      router.push({ pathname: "/redefinir-senha", params: { email: email.trim() } });
    } catch (e) {
      setErro(e instanceof ApiError ? e.message : "Não foi possível enviar o código.");
    } finally {
      setEnviando(false);
    }
  };

  return (
    <Screen>
      <View style={{ gap: spacing.lg, marginTop: spacing.xxl }}>
        <View style={{ alignItems: "center", gap: spacing.xs }}>
          <Image
            source={require("../assets/logo.png")}
            style={{ width: 80, height: 80, marginBottom: spacing.sm }}
            accessibilityLabel="Logo Gestão de Patrimônio"
          />
          <Txt variant="title">Esqueceu a sua senha?</Txt>
          <Txt variant="muted" style={{ textAlign: "center" }}>
            Confirme o seu e-mail para receber um código de verificação.
          </Txt>
        </View>

        <Card>
          <TextField
            control={control}
            name="email"
            label="E-mail"
            keyboardType="email-address"
            autoCapitalize="none"
          />
          {erro ? (
            <Txt variant="muted" style={{ color: colors.danger }}>
              {erro}
            </Txt>
          ) : null}
        </Card>

        <Button
          title={enviando ? "Enviando…" : "Receber o código"}
          loading={enviando}
          onPress={handleSubmit(onSubmit)}
        />
        <Button title="Voltar para o login" variant="ghost" onPress={() => router.back()} />
      </View>
    </Screen>
  );
}
