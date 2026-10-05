import * as React from "react";
import { Image, Pressable, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Ionicons } from "@expo/vector-icons";

import { authApi } from "@/lib/api/auth";
import { ApiError } from "@/lib/api";
import { toast } from "@/lib/toast";
import { colors, spacing } from "@/lib/theme";
import { Screen } from "@/components/ui/Screen";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Txt } from "@/components/ui/Txt";
import { TextField } from "@/components/forms/fields";
import {
  PasswordChecklist,
  avaliarCriterios,
  senhaAtendeCriterios,
} from "@/components/auth/PasswordChecklist";

const schema = z
  .object({
    codigo: z.string().trim().min(1, "Informe o código recebido por e-mail"),
    novaSenha: z.string().refine(senhaAtendeCriterios, {
      message: "A senha não atende aos critérios exigidos",
    }),
    confirmarSenha: z.string().min(1, "Confirme a senha"),
  })
  .refine((d) => d.novaSenha === d.confirmarSenha, {
    message: "As senhas não conferem",
    path: ["confirmarSenha"],
  });
type FormValues = z.infer<typeof schema>;

type Aviso = { tipo: "sucesso" | "erro"; texto: string } | null;

export default function RedefinirSenhaScreen() {
  const router = useRouter();
  const { email } = useLocalSearchParams<{ email?: string }>();
  const [enviando, setEnviando] = React.useState(false);
  const [reenviando, setReenviando] = React.useState(false);
  const [aviso, setAviso] = React.useState<Aviso>(null);

  const { control, handleSubmit, setError, clearErrors, setValue } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { codigo: "", novaSenha: "", confirmarSenha: "" },
  });

  const novaSenha = useWatch({ control, name: "novaSenha" }) ?? "";
  const confirmarSenha = useWatch({ control, name: "confirmarSenha" }) ?? "";
  const criteriosAtendidos = avaliarCriterios(novaSenha, confirmarSenha).every((c) => c.atendido);

  const onSubmit = async (values: FormValues) => {
    if (!email) return;
    setAviso(null);
    setEnviando(true);
    try {
      await authApi.redefinirSenha({ email, ...values });
      toast.success("Senha atualizada. Faça login com a nova senha.");
      router.dismissTo("/login");
    } catch (e) {
      const body = e instanceof ApiError ? (e.body as { campo?: string; message?: string } | null) : null;
      if (body?.campo === "codigo") {
        setError("codigo", { message: body.message ?? "Código inválido." });
      } else {
        setAviso({
          tipo: "erro",
          texto: e instanceof ApiError ? e.message : "Não foi possível atualizar a senha.",
        });
      }
    } finally {
      setEnviando(false);
    }
  };

  const reenviarCodigo = async () => {
    if (!email) return;
    setAviso(null);
    setReenviando(true);
    try {
      await authApi.esqueciSenha(email);
      clearErrors("codigo");
      setValue("codigo", "");
      setAviso({ tipo: "sucesso", texto: "E-mail enviado com sucesso" });
    } catch (e) {
      setAviso({
        tipo: "erro",
        texto: e instanceof ApiError ? e.message : "Não foi possível reenviar o código.",
      });
    } finally {
      setReenviando(false);
    }
  };

  return (
    <Screen>
      <View style={{ gap: spacing.lg, marginTop: spacing.xl }}>
        <View style={{ alignItems: "center", gap: spacing.xs }}>
          <Image
            source={require("../assets/logo.png")}
            style={{ width: 80, height: 80, marginBottom: spacing.sm }}
            accessibilityLabel="Logo Gestão de Patrimônio"
          />
          <Txt variant="title">Redefinir senha</Txt>
          <Txt variant="muted" style={{ textAlign: "center" }}>
            Enviamos um código de verificação para {email ?? "o seu e-mail"}. Ele vale por 30 minutos.
          </Txt>
        </View>

        <Card>
          {aviso ? (
            <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
              <Ionicons
                name={aviso.tipo === "sucesso" ? "checkmark-circle" : "close-circle"}
                size={16}
                color={aviso.tipo === "sucesso" ? colors.success : colors.danger}
              />
              <Txt
                style={{
                  color: aviso.tipo === "sucesso" ? colors.success : colors.danger,
                  fontWeight: "600",
                  flexShrink: 1,
                }}
              >
                {aviso.texto}
              </Txt>
            </View>
          ) : null}
          <TextField
            control={control}
            name="codigo"
            label="Seu código de verificação"
            keyboardType="numeric"
            autoCapitalize="none"
          />
          <TextField
            control={control}
            name="novaSenha"
            label="Nova senha"
            autoCapitalize="none"
            secureTextEntry
          />
          <TextField
            control={control}
            name="confirmarSenha"
            label="Confirmar senha"
            autoCapitalize="none"
            secureTextEntry
          />
          <PasswordChecklist senha={novaSenha} confirmarSenha={confirmarSenha} />
        </Card>

        <Button
          title={enviando ? "Atualizando…" : "Atualizar senha"}
          loading={enviando}
          disabled={!email || !criteriosAtendidos}
          onPress={handleSubmit(onSubmit)}
        />
        <Pressable
          onPress={reenviarCodigo}
          disabled={reenviando}
          accessibilityRole="link"
          style={{ alignItems: "center", paddingVertical: spacing.sm, opacity: reenviando ? 0.5 : 1 }}
        >
          <Txt style={{ color: colors.primary, fontWeight: "600" }}>
            {reenviando ? "Reenviando…" : "Reenviar código"}
          </Txt>
        </Pressable>
      </View>
    </Screen>
  );
}
