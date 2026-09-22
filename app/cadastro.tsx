import * as React from "react";
import { View } from "react-native";
import { useRouter } from "expo-router";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Ionicons } from "@expo/vector-icons";

import { useAuth } from "@/providers/auth";
import { ApiError } from "@/lib/api";
import { toast } from "@/lib/toast";
import { colors, spacing } from "@/lib/theme";
import { Screen } from "@/components/ui/Screen";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Txt } from "@/components/ui/Txt";
import { TextField } from "@/components/forms/fields";

const CRITERIOS_SENHA = [
  {
    label: "Pelo menos 8 caracteres",
    testar: (senha: string) => senha.length >= 8,
  },
  {
    label: "Uma letra maiúscula",
    testar: (senha: string) => /[A-Z]/.test(senha),
  },
  {
    label: "Uma letra minúscula",
    testar: (senha: string) => /[a-z]/.test(senha),
  },
  {
    label: "Um número",
    testar: (senha: string) => /[0-9]/.test(senha),
  },
  {
    label: "Um caractere especial",
    testar: (senha: string) => /[^A-Za-z0-9]/.test(senha),
  },
];

const schema = z
  .object({
    nome: z.string().trim().min(1, "Informe o nome"),
    email: z.string().trim().email("E-mail inválido"),
    telefone: z.string().trim().min(1, "Informe o telefone"),
    senha: z
      .string()
      .refine((senha) => CRITERIOS_SENHA.every((c) => c.testar(senha)), {
        message: "A senha não atende aos critérios exigidos",
      }),
    confirmarSenha: z.string().min(1, "Confirme a senha"),
  })
  .refine((data) => data.senha === data.confirmarSenha, {
    message: "As senhas não conferem",
    path: ["confirmarSenha"],
  });
type FormValues = z.infer<typeof schema>;

function avaliarCriterios(senha: string, confirmarSenha: string) {
  return [
    ...CRITERIOS_SENHA.map((c) => ({
      label: c.label,
      atendido: c.testar(senha),
    })),
    {
      label: "As senhas coincidem",
      atendido: senha.length > 0 && senha === confirmarSenha,
    },
  ];
}

function PasswordChecklist({
  senha,
  confirmarSenha,
}: {
  senha: string;
  confirmarSenha: string;
}) {
  const criterios = avaliarCriterios(senha, confirmarSenha);
  return (
    <View style={{ gap: 4 }}>
      {criterios.map((criterio) => {
        const cor = criterio.atendido ? colors.success : colors.danger;
        return (
          <View
            key={criterio.label}
            style={{ flexDirection: "row", alignItems: "center", gap: 6 }}
          >
            <Ionicons
              name={criterio.atendido ? "checkmark-circle" : "close-circle"}
              size={14}
              color={cor}
            />
            <Txt style={{ color: cor, fontSize: 13 }}>{criterio.label}</Txt>
          </View>
        );
      })}
    </View>
  );
}

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

  const senha = useWatch({ control, name: "senha" }) ?? "";
  const confirmarSenha = useWatch({ control, name: "confirmarSenha" }) ?? "";
  const criteriosAtendidos = avaliarCriterios(senha, confirmarSenha).every(
    (c) => c.atendido,
  );

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
          <PasswordChecklist senha={senha} confirmarSenha={confirmarSenha} />
        </Card>

        <Button
          title={enviando ? "Cadastrando…" : "Cadastrar"}
          loading={enviando}
          disabled={!criteriosAtendidos}
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
