import * as React from "react";
import { View } from "react-native";
import { useRouter } from "expo-router";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import {
  STATUS_IMOVEL,
  TIPO_IMOVEL,
  type Endereco,
  type ImovelRequest,
  type ImovelResponse,
} from "@/lib/types";
import { enumOptions, statusImovelLabels, tipoImovelLabels } from "@/lib/labels";
import { ufOptions } from "@/lib/uf";
import { spacing } from "@/lib/theme";
import { useSalvarImovel } from "@/hooks/use-imoveis";
import { Button } from "@/components/ui/Button";
import { Card, CardTitle } from "@/components/ui/Card";
import { SelectField, TextField } from "./fields";
import { CepField } from "./CepField";
import { CidadeField } from "./CidadeField";
import { MoneyField } from "./MoneyField";

const schema = z.object({
  nome: z.string().trim().min(1, "Informe o nome do imóvel"),
  tipo: z.enum(TIPO_IMOVEL),
  status: z.enum(STATUS_IMOVEL),
  valorAquisicao: z
    .number({ invalid_type_error: "Informe o valor de aquisição" })
    .min(0, "Valor inválido"),
  valorAtual: z
    .number({ invalid_type_error: "Informe o valor atual" })
    .min(0, "Valor inválido"),
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
});
type FormValues = z.infer<typeof schema>;

export function ImovelForm({ imovel }: { imovel?: ImovelResponse }) {
  const router = useRouter();
  const salvar = useSalvarImovel(imovel?.id);

  const { control, handleSubmit, setValue, setFocus } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      nome: imovel?.nome ?? "",
      tipo: imovel?.tipo ?? "APARTAMENTO",
      status: imovel?.status ?? "DISPONIVEL",
      valorAquisicao: imovel?.valorAquisicao,
      valorAtual: imovel?.valorAtual,
      endereco: {
        cep: imovel?.endereco?.cep ?? "",
        logradouro: imovel?.endereco?.logradouro ?? "",
        numero: imovel?.endereco?.numero ?? "",
        complemento: imovel?.endereco?.complemento ?? "",
        bairro: imovel?.endereco?.bairro ?? "",
        cidade: imovel?.endereco?.cidade ?? "",
        estado: imovel?.endereco?.estado ?? "",
        pais: imovel?.endereco?.pais ?? "Brasil",
      },
    },
  });

  const estado = useWatch({ control, name: "endereco.estado" });

  const preencherEndereco = (endereco: Endereco) => {
    setValue("endereco.logradouro", endereco.logradouro ?? "");
    setValue("endereco.bairro", endereco.bairro ?? "");
    // Estado antes de cidade: o combo de cidade depende do estado para
    // buscar a lista de municípios do IBGE.
    setValue("endereco.estado", endereco.estado ?? "");
    setValue("endereco.cidade", endereco.cidade ?? "");
    if (endereco.pais) setValue("endereco.pais", endereco.pais);
    setFocus("endereco.numero");
  };

  const onSubmit = (values: FormValues) => {
    const payload: ImovelRequest = {
      ...values,
      endereco: Object.fromEntries(
        Object.entries(values.endereco).map(([k, v]) => [k, v || undefined]),
      ) as Endereco,
    } as ImovelRequest;
    salvar.mutate(payload, { onSuccess: () => router.back() });
  };

  return (
    <View style={{ gap: spacing.lg }}>
      <Card>
        <TextField
          control={control}
          name="nome"
          label="Nome do imóvel"
          placeholder="Ex.: Apto 302 - Ed. Aurora"
        />
        <SelectField
          control={control}
          name="tipo"
          label="Tipo"
          options={enumOptions(TIPO_IMOVEL, tipoImovelLabels)}
        />
        <SelectField
          control={control}
          name="status"
          label="Status"
          options={enumOptions(STATUS_IMOVEL, statusImovelLabels)}
        />
        <MoneyField
          control={control}
          name="valorAquisicao"
          label="Valor de aquisição (R$)"
        />
        <MoneyField
          control={control}
          name="valorAtual"
          label="Valor atual (R$)"
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
        <SelectField
          control={control}
          name="endereco.estado"
          label="Estado (UF)"
          options={ufOptions}
          onValueChange={() => setValue("endereco.cidade", "")}
        />
        <CidadeField control={control} name="endereco.cidade" uf={estado} />
        <TextField control={control} name="endereco.pais" label="País" />
      </Card>

      <Button
        title={salvar.isPending ? "Salvando…" : "Salvar imóvel"}
        loading={salvar.isPending}
        onPress={handleSubmit(onSubmit)}
      />
      <Button title="Cancelar" variant="ghost" onPress={() => router.back()} />
    </View>
  );
}
