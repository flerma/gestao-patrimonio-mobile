import * as React from "react";
import { View } from "react-native";
import { useRouter } from "expo-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { useAuth } from "@/providers/auth";
import { ApiError } from "@/lib/api";
import { toast } from "@/lib/toast";
import { spacing } from "@/lib/theme";
import { Screen } from "@/components/ui/Screen";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Txt } from "@/components/ui/Txt";
import { TextField } from "@/components/forms/fields";

const schema = z
  .object({
    nome: z.string().trim().min(1, "Informe o nome"),
    email: z.string().trim().email("E-mail inválido"),
    telefone: z.string().trim().min(1, "Informe o telefone"),
    senha: z.string().min(6, "A senha deve ter ao menos 6 caracteres"),
    confirmarSenha: z.string().min(1, "Confirme a senha"),
  })
  .refine((data) => data.senha === data.confirmarSenha, {
    message: "As senhas não conferem",
    path: ["confirmarSenha"],
  });
type FormValues = z.infer<typeof schema>;

export default function CadastroScreen() {
  const router = useRouter();
  const { registrar } = useAuth();
  const [enviando, setEnviando] = React.useState(false);

  const { control, handleSubmit, setError } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      nome: "",
      email: "",
      telefone: "",
      senha: "",
      confirmarSenha: "",
    },
  });

  const onSubmit = async (values: FormValues) => {
    setEnviando(true);
    try {
      await registrar({
        nome: values.nome,
        email: values.email,
        telefone: values.telefone,
        senha: values.senha,
        confirmarSenha: values.confirmarSenha,
      });
      toast.success("Cadastro realizado. Faça login para continuar.");
      router.replace("/login");
    } catch (e) {
      if (e instanceof ApiError && e.status === 409) {
        const body = e.body as { campo?: string; message?: string } | null;
        if (body?.campo === "email" || body?.campo === "telefone") {
          setError(body.campo, { message: body.message ?? e.message });
        } else {
          toast.error(e.message);
        }
      } else if (e instanceof ApiError) {
        toast.error(e.message);
      } else {
        toast.error("Não foi possível concluir o cadastro.");
      }
    } finally {
      setEnviando(false);
    }
  };

  return (
    <Screen>
      <View style={{ gap: spacing.lg, marginTop: spacing.xl }}>
        <View style={{ alignItems: "center", gap: spacing.xs }}>
          <Txt variant="title">Criar conta</Txt>
          <Txt variant="muted">Preencha seus dados para se cadastrar</Txt>
        </View>

        <Card>
          <TextField control={control} name="nome" label="Nome" />
          <TextField
            control={control}
            name="email"
            label="E-mail"
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <TextField
            control={control}
            name="telefone"
            label="Telefone"
            keyboardType="phone-pad"
          />
          <TextField
            control={control}
            name="senha"
            label="Senha"
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
        </Card>

        <Button
          title={enviando ? "Cadastrando…" : "Cadastrar"}
          loading={enviando}
          onPress={handleSubmit(onSubmit)}
        />
        <Button
          title="Já tenho conta"
          variant="ghost"
          onPress={() => router.back()}
        />
      </View>
    </Screen>
  );
}
