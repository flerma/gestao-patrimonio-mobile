import * as React from "react";
import { View } from "react-native";
import { useRouter } from "expo-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import {
  STATUS_INQUILINO,
  TIPO_PESSOA,
  type Endereco,
  type InquilinoRequest,
  type InquilinoResponse,
} from "@/lib/types";
import {
  enumOptions,
  statusInquilinoLabels,
  tipoPessoaLabels,
} from "@/lib/labels";
import { spacing } from "@/lib/theme";
import { useSalvarInquilino } from "@/hooks/use-inquilinos";
import { Button } from "@/components/ui/Button";
import { Card, CardTitle } from "@/components/ui/Card";
import { DateField, SelectField, TextAreaField, TextField } from "./fields";
import { CepField } from "./CepField";

const schema = z.object({
  tipoPessoa: z.enum(TIPO_PESSOA),
  nome: z.string().trim().min(1, "Informe o nome"),
  documento: z.string().trim().min(1, "Informe o CPF/CNPJ"),
  email: z.string().trim().email("E-mail inválido").optional().or(z.literal("")),
  telefone: z.string().optional(),
  dataNascimento: z.string().optional(),
  status: z.enum(STATUS_INQUILINO),
  endereco: z.object({
    cep: z.string().optional(),
    logradouro: z.string().optional(),
    numero: z.string().optional(),
    complemento: z.string().optional(),
    bairro: z.string().optional(),
    cidade: z.string().optional(),
    estado: z.string().max(2, "Use a sigla (ex.: SP)").optional(),
    pais: z.string().optional(),
  }),
  observacoes: z.string().max(1000).optional(),
});
type FormValues = z.infer<typeof schema>;

export function InquilinoForm({ inquilino }: { inquilino?: InquilinoResponse }) {
  const router = useRouter();
  const salvar = useSalvarInquilino(inquilino?.id);

  const { control, handleSubmit, setValue, setFocus } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      tipoPessoa: inquilino?.tipoPessoa ?? "FISICA",
      nome: inquilino?.nome ?? "",
      documento: inquilino?.documento ?? "",
      email: inquilino?.email ?? "",
      telefone: inquilino?.telefone ?? "",
      dataNascimento: inquilino?.dataNascimento ?? undefined,
      status: inquilino?.status ?? "ATIVO",
      endereco: {
        cep: inquilino?.endereco?.cep ?? "",
        logradouro: inquilino?.endereco?.logradouro ?? "",
        numero: inquilino?.endereco?.numero ?? "",
        complemento: inquilino?.endereco?.complemento ?? "",
        bairro: inquilino?.endereco?.bairro ?? "",
        cidade: inquilino?.endereco?.cidade ?? "",
        estado: inquilino?.endereco?.estado ?? "",
        pais: inquilino?.endereco?.pais ?? "Brasil",
      },
      observacoes: inquilino?.observacoes ?? "",
    },
  });

  const preencherEndereco = (endereco: Endereco) => {
    setValue("endereco.logradouro", endereco.logradouro ?? "");
    setValue("endereco.bairro", endereco.bairro ?? "");
    setValue("endereco.cidade", endereco.cidade ?? "");
    setValue("endereco.estado", endereco.estado ?? "");
    if (endereco.pais) setValue("endereco.pais", endereco.pais);
    setFocus("endereco.numero");
  };

  const onSubmit = (values: FormValues) => {
    const endereco = Object.fromEntries(
      Object.entries(values.endereco).map(([k, v]) => [k, v || undefined]),
    );
    const temEndereco = Object.values(endereco).some(Boolean);
    const payload: InquilinoRequest = {
      tipoPessoa: values.tipoPessoa,
      nome: values.nome,
      documento: values.documento,
      email: values.email || undefined,
      telefone: values.telefone || undefined,
      dataNascimento: values.dataNascimento || undefined,
      status: values.status,
      endereco: temEndereco
        ? (endereco as InquilinoRequest["endereco"])
        : undefined,
      observacoes: values.observacoes || undefined,
    };
    salvar.mutate(payload, { onSuccess: () => router.back() });
  };

  return (
    <View style={{ gap: spacing.lg }}>
      <Card>
        <SelectField
          control={control}
          name="tipoPessoa"
          label="Tipo de pessoa"
          options={enumOptions(TIPO_PESSOA, tipoPessoaLabels)}
        />
        <SelectField
          control={control}
          name="status"
          label="Status"
          options={enumOptions(STATUS_INQUILINO, statusInquilinoLabels)}
        />
        <TextField control={control} name="nome" label="Nome / Razão social" />
        <TextField control={control} name="documento" label="CPF / CNPJ" />
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
        <DateField
          control={control}
          name="dataNascimento"
          label="Data de nascimento"
        />
      </Card>

      <Card>
        <CardTitle>Endereço</CardTitle>
        <CepField
          control={control}
          name="endereco.cep"
          onResolved={preencherEndereco}
        />
        <TextField
          control={control}
          name="endereco.logradouro"
          label="Logradouro"
        />
        <TextField control={control} name="endereco.numero" label="Número" />
        <TextField
          control={control}
          name="endereco.complemento"
          label="Complemento"
        />
        <TextField control={control} name="endereco.bairro" label="Bairro" />
        <TextField control={control} name="endereco.cidade" label="Cidade" />
        <TextField
          control={control}
          name="endereco.estado"
          label="Estado (UF)"
          autoCapitalize="words"
        />
        <TextField control={control} name="endereco.pais" label="País" />
      </Card>

      <Card>
        <TextAreaField
          control={control}
          name="observacoes"
          label="Observações"
        />
      </Card>

      <Button
        title={salvar.isPending ? "Salvando…" : "Salvar inquilino"}
        loading={salvar.isPending}
        onPress={handleSubmit(onSubmit)}
      />
      <Button title="Cancelar" variant="ghost" onPress={() => router.back()} />
    </View>
  );
}
