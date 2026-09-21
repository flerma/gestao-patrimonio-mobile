import * as React from "react";
import { View } from "react-native";
import { useRouter } from "expo-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import {
  PROVEDOR_AUTENTICACAO,
  ROLE_USUARIO,
  STATUS_USUARIO,
  type UsuarioRequest,
  type UsuarioResponse,
} from "@/lib/types";
import {
  enumOptions,
  provedorAutenticacaoLabels,
  roleUsuarioLabels,
  statusUsuarioLabels,
} from "@/lib/labels";
import { spacing } from "@/lib/theme";
import { useSalvarUsuario } from "@/hooks/use-usuarios";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { SelectField, TextField } from "./fields";

const schema = z.object({
  nome: z.string().trim().min(1, "Informe o nome"),
  email: z.string().trim().email("E-mail inválido"),
  telefone: z.string().trim().optional(),
  provedorAutenticacao: z.enum(PROVEDOR_AUTENTICACAO),
  idUsuarioProvedor: z.string().optional(),
  status: z.enum(STATUS_USUARIO),
  role: z.enum(ROLE_USUARIO, { required_error: "Selecione o perfil" }),
});
type FormValues = z.infer<typeof schema>;

export function UsuarioForm({ usuario }: { usuario?: UsuarioResponse }) {
  const router = useRouter();
  const salvar = useSalvarUsuario(usuario?.id);

  const { control, handleSubmit } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      nome: usuario?.nome ?? "",
      email: usuario?.email ?? "",
      telefone: usuario?.telefone ?? "",
      provedorAutenticacao: usuario?.provedorAutenticacao ?? "LOCAL",
      idUsuarioProvedor: usuario?.idUsuarioProvedor ?? "",
      status: usuario?.status ?? "ATIVO",
      role: usuario?.role ?? "USUARIO",
    },
  });

  const onSubmit = (values: FormValues) => {
    const payload: UsuarioRequest = {
      nome: values.nome,
      email: values.email,
      telefone: values.telefone || undefined,
      provedorAutenticacao: values.provedorAutenticacao,
      idUsuarioProvedor: values.idUsuarioProvedor || undefined,
      status: values.status,
      role: values.role,
    };
    salvar.mutate(payload, { onSuccess: () => router.back() });
  };

  return (
    <View style={{ gap: spacing.lg }}>
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
          label="Telefone (opcional)"
          keyboardType="phone-pad"
        />
        <SelectField
          control={control}
          name="provedorAutenticacao"
          label="Provedor de autenticação"
          options={enumOptions(PROVEDOR_AUTENTICACAO, provedorAutenticacaoLabels)}
        />
        <SelectField
          control={control}
          name="status"
          label="Status"
          options={enumOptions(STATUS_USUARIO, statusUsuarioLabels)}
        />
        <SelectField
          control={control}
          name="role"
          label="Perfil"
          placeholder="Selecione o perfil"
          options={enumOptions(ROLE_USUARIO, roleUsuarioLabels)}
        />
        <TextField
          control={control}
          name="idUsuarioProvedor"
          label="ID no provedor (opcional)"
          autoCapitalize="none"
        />
      </Card>

      <Button
        title={salvar.isPending ? "Salvando…" : "Salvar usuário"}
        loading={salvar.isPending}
        onPress={handleSubmit(onSubmit)}
      />
      <Button title="Cancelar" variant="ghost" onPress={() => router.back()} />
    </View>
  );
}
