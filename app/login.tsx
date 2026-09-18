import * as React from "react";
import { View } from "react-native";
import { useRouter } from "expo-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { useAuth } from "@/providers/auth";
import { ApiError } from "@/lib/api";
import { colors, spacing } from "@/lib/theme";
import { Screen } from "@/components/ui/Screen";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Txt } from "@/components/ui/Txt";
import { TextField } from "@/components/forms/fields";

const schema = z.object({
  usuario: z
    .string()
    .trim()
    .min(1, "Informe o e-mail")
    .email("E-mail inválido"),
  senha: z.string().min(1, "Informe a senha"),
});
type FormValues = z.infer<typeof schema>;

export default function LoginScreen() {
  const router = useRouter();
  const { login } = useAuth();
  const [enviando, setEnviando] = React.useState(false);
  const [erro, setErro] = React.useState<string | null>(null);

  const { control, handleSubmit } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { usuario: "", senha: "" },
  });

  const onSubmit = async (values: FormValues) => {
    setErro(null);
    setEnviando(true);
    try {
      await login(values.usuario, values.senha);
      // A navegação para (tabs) acontece sozinha: assim que `usuario` muda no
      // AuthProvider, o guard do Stack.Protected em app/_layout.tsx troca de
      // grupo automaticamente.
    } catch (e) {
      setErro(
        e instanceof ApiError
          ? e.message
          : "Não foi possível entrar. Tente novamente.",
      );
    } finally {
      setEnviando(false);
    }
  };

  return (
    <Screen>
      <View style={{ gap: spacing.lg, marginTop: spacing.xxl }}>
        <View style={{ alignItems: "center", gap: spacing.xs }}>
          <Txt variant="title">Gestão de Patrimônio</Txt>
          <Txt variant="muted">Entre com seu e-mail e senha</Txt>
        </View>

        <Card>
          <TextField
            control={control}
            name="usuario"
            label="Usuário (e-mail)"
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <TextField
            control={control}
            name="senha"
            label="Senha"
            autoCapitalize="none"
            secureTextEntry
          />
          {erro ? (
            <Txt variant="muted" style={{ color: colors.danger }}>
              {erro}
            </Txt>
          ) : null}
        </Card>

        <Button
          title={enviando ? "Entrando…" : "Login"}
          loading={enviando}
          onPress={handleSubmit(onSubmit)}
        />
        <Button
          title="Cadastrar"
          variant="outline"
          onPress={() => router.push("/cadastro")}
        />
      </View>
    </Screen>
  );
}
