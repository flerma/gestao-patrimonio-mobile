import * as React from "react";
import { View } from "react-native";
import { useRouter } from "expo-router";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { FORMA_PAGAMENTO, type PagamentoAluguelRequest, type UUID } from "@/lib/types";
import { enumOptions, formaPagamentoLabels } from "@/lib/labels";
import { spacing } from "@/lib/theme";
import { useSalvarPagamentoAluguel } from "@/hooks/use-pagamentos-aluguel";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { DateField, SelectField, TextField } from "./fields";

const PAGO_OPCOES = [
  { value: "NAO", label: "Não" },
  { value: "SIM", label: "Sim" },
];

const schema = z
  .object({
    competencia: z.string().min(1, "Informe a competência"),
    dataVencimento: z.string().min(1, "Informe a data de vencimento"),
    valorPrevisto: z
      .number({ invalid_type_error: "Informe o valor previsto" })
      .positive("O valor deve ser maior que zero"),
    pago: z.enum(["SIM", "NAO"]),
    dataPagamento: z.string().optional(),
    formaPagamento: z.enum(FORMA_PAGAMENTO).optional(),
  })
  .refine((data) => data.pago !== "SIM" || Boolean(data.dataPagamento), {
    path: ["dataPagamento"],
    message: "Informe a data de pagamento",
  })
  .refine((data) => data.pago !== "SIM" || Boolean(data.formaPagamento), {
    path: ["formaPagamento"],
    message: "Informe a forma de pagamento",
  });

type FormValues = z.infer<typeof schema>;

/** yyyy-MM-dd -> yyyy-MM (competência é sempre o 1º dia do mês escolhido). */
function paraCompetencia(dataIso: string): string {
  return dataIso.slice(0, 7);
}

export function PagamentoAluguelForm({ contratoId }: { contratoId: UUID }) {
  const router = useRouter();
  const salvar = useSalvarPagamentoAluguel();

  const { control, handleSubmit } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      competencia: "",
      dataVencimento: "",
      valorPrevisto: undefined,
      pago: "NAO",
      dataPagamento: "",
      formaPagamento: undefined,
    },
  });

  const pagoValue = useWatch({ control, name: "pago" });
  const pago = pagoValue === "SIM";

  const onSubmit = (values: FormValues) => {
    const payload: PagamentoAluguelRequest = {
      contratoId,
      competencia: paraCompetencia(values.competencia),
      dataVencimento: values.dataVencimento,
      valorPrevisto: values.valorPrevisto,
      valorPago: pago ? values.valorPrevisto : undefined,
      dataPagamento: pago ? values.dataPagamento : undefined,
      status: pago ? "PAGO" : "PENDENTE",
      formaPagamento: pago ? values.formaPagamento : undefined,
    };
    salvar.mutate(payload, {
      onSuccess: () =>
        router.replace(`/pagamentos-contrato?contratoId=${contratoId}`),
    });
  };

  return (
    <View style={{ gap: spacing.lg }}>
      <Card>
        <DateField
          control={control}
          name="competencia"
          label="Competência"
          hint="Escolha qualquer dia do mês desejado"
        />
        <DateField
          control={control}
          name="dataVencimento"
          label="Data de vencimento"
        />
        <TextField
          control={control}
          name="valorPrevisto"
          label="Valor previsto (R$)"
          numeric
        />
        <SelectField
          control={control}
          name="pago"
          label="Aluguel já foi pago?"
          options={PAGO_OPCOES}
        />
        {pago ? (
          <>
            <DateField
              control={control}
              name="dataPagamento"
              label="Data de pagamento"
            />
            <SelectField
              control={control}
              name="formaPagamento"
              label="Forma de pagamento"
              options={enumOptions(FORMA_PAGAMENTO, formaPagamentoLabels)}
            />
          </>
        ) : null}
      </Card>

      <Button
        title={salvar.isPending ? "Salvando…" : "Salvar aluguel"}
        loading={salvar.isPending}
        onPress={handleSubmit(onSubmit)}
      />
      <Button title="Cancelar" variant="ghost" onPress={() => router.back()} />
    </View>
  );
}
