import * as React from "react";
import { Modal, Pressable, StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import {
  INDICE_REAJUSTE,
  STATUS_CONTRATO,
  TIPO_CONTRATO,
  TIPO_GARANTIA,
  type ContratoRequest,
  type ContratoResponse,
} from "@/lib/types";
import {
  enumOptions,
  indiceReajusteLabels,
  statusContratoLabels,
  tipoContratoLabels,
  tipoGarantiaLabels,
} from "@/lib/labels";
import { colors, radius, spacing } from "@/lib/theme";
import { useSalvarContrato } from "@/hooks/use-contratos";
import { useImoveis } from "@/hooks/use-imoveis";
import { useInquilinos } from "@/hooks/use-inquilinos";
import { Button } from "@/components/ui/Button";
import { Card, CardTitle } from "@/components/ui/Card";
import { Txt } from "@/components/ui/Txt";
import {
  DateField,
  NumberSelectField,
  SelectField,
  TextAreaField,
  TextField,
} from "./fields";
import { MoneyField } from "./MoneyField";

const DIAS_VENCIMENTO = Array.from({ length: 31 }, (_, i) => ({
  value: i + 1,
  label: String(i + 1),
}));

/** yyyy-MM-dd está em um mês anterior ao mês corrente. */
function competenciaAnteriorAoMesAtual(dataInicio: string): boolean {
  const match = dataInicio.match(/^(\d{4})-(\d{2})/);
  if (!match) return false;
  const [, anoStr, mesStr] = match;
  const ano = Number(anoStr);
  const mes = Number(mesStr);
  const agora = new Date();
  const anoAtual = agora.getFullYear();
  const mesAtual = agora.getMonth() + 1;
  return ano < anoAtual || (ano === anoAtual && mes < mesAtual);
}

const schema = z
  .object({
    imovelId: z.string().min(1, "Selecione o imóvel"),
    inquilinoId: z.string().min(1, "Selecione o inquilino"),
    tipo: z.enum(TIPO_CONTRATO),
    status: z.enum(STATUS_CONTRATO),
    dataInicio: z.string().min(1, "Informe a data de início"),
    dataFim: z.string().optional(),
    valorAluguel: z
      .number({ invalid_type_error: "Informe o valor do aluguel" })
      .positive("O valor deve ser maior que zero"),
    diaVencimento: z
      .number({ invalid_type_error: "Informe o dia de vencimento" })
      .int()
      .min(1, "Entre 1 e 31")
      .max(31, "Entre 1 e 31"),
    indiceReajuste: z.enum(INDICE_REAJUSTE),
    percentualReajuste: z.number().min(0).optional(),
    periodoReajuste: z.number().int().positive().optional(),
    tipoGarantia: z.enum(TIPO_GARANTIA),
    valorGarantia: z.number().min(0).optional(),
    observacoes: z.string().max(1000).optional(),
  })
  .refine((d) => !d.dataFim || d.dataFim >= d.dataInicio, {
    path: ["dataFim"],
    message: "A data fim deve ser posterior ao início",
  });
type FormValues = z.infer<typeof schema>;

export function ContratoForm({ contrato }: { contrato?: ContratoResponse }) {
  const router = useRouter();
  const salvar = useSalvarContrato(contrato?.id);
  const { data: imoveis } = useImoveis();
  const { data: inquilinos } = useInquilinos();

  const { control, handleSubmit } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      imovelId: contrato?.imovel?.id ?? "",
      inquilinoId: contrato?.inquilino?.id ?? "",
      tipo: contrato?.tipo ?? "RESIDENCIAL",
      status: contrato?.status ?? "RASCUNHO",
      dataInicio: contrato?.dataInicio ?? "",
      dataFim: contrato?.dataFim ?? undefined,
      valorAluguel: contrato?.valorAluguel,
      diaVencimento: contrato?.diaVencimento ?? 5,
      indiceReajuste: contrato?.indiceReajuste ?? "IPCA",
      percentualReajuste: contrato?.percentualReajuste ?? undefined,
      periodoReajuste: contrato?.periodoReajuste ?? 12,
      tipoGarantia: contrato?.tipoGarantia ?? "SEM_GARANTIA",
      valorGarantia: contrato?.valorGarantia ?? undefined,
      observacoes: contrato?.observacoes ?? "",
    },
  });

  const [payloadPendente, setPayloadPendente] =
    React.useState<ContratoRequest | null>(null);

  const enviar = (payload: ContratoRequest) => {
    salvar.mutate(payload, { onSuccess: () => router.back() });
  };

  const onSubmit = (values: FormValues) => {
    const payload: ContratoRequest = {
      imovelId: values.imovelId,
      inquilinoId: values.inquilinoId,
      tipo: values.tipo,
      status: values.status,
      dataInicio: values.dataInicio,
      dataFim: values.dataFim || undefined,
      valorAluguel: values.valorAluguel,
      diaVencimento: values.diaVencimento,
      indiceReajuste: values.indiceReajuste,
      percentualReajuste: values.percentualReajuste,
      periodoReajuste: values.periodoReajuste,
      tipoGarantia: values.tipoGarantia,
      valorGarantia: values.valorGarantia,
      observacoes: values.observacoes || undefined,
    };
    if (competenciaAnteriorAoMesAtual(values.dataInicio)) {
      setPayloadPendente(payload);
      return;
    }
    enviar(payload);
  };

  const confirmarParcelasAnteriores = (marcarComoPagas: boolean) => {
    if (!payloadPendente) return;
    enviar({
      ...payloadPendente,
      marcarParcelasAnterioresComoPagas: marcarComoPagas,
    });
    setPayloadPendente(null);
  };

  return (
    <View style={{ gap: spacing.lg }}>
      <Card>
        <SelectField
          control={control}
          name="imovelId"
          label="Imóvel"
          placeholder="Selecione o imóvel"
          options={(imoveis ?? []).map((i) => ({ value: i.id, label: i.nome }))}
        />
        <SelectField
          control={control}
          name="inquilinoId"
          label="Inquilino"
          placeholder="Selecione o inquilino"
          options={(inquilinos ?? []).map((i) => ({
            value: i.id,
            label: i.nome,
          }))}
        />
        <SelectField
          control={control}
          name="tipo"
          label="Tipo de contrato"
          options={enumOptions(TIPO_CONTRATO, tipoContratoLabels)}
        />
        <SelectField
          control={control}
          name="status"
          label="Status"
          options={enumOptions(STATUS_CONTRATO, statusContratoLabels)}
        />
        <DateField control={control} name="dataInicio" label="Início da vigência" />
        <DateField
          control={control}
          name="dataFim"
          label="Fim da vigência (opcional)"
        />
        <MoneyField
          control={control}
          name="valorAluguel"
          label="Valor do aluguel (R$)"
        />
        <NumberSelectField
          control={control}
          name="diaVencimento"
          label="Dia de vencimento"
          options={DIAS_VENCIMENTO}
        />
      </Card>

      <Card>
        <CardTitle>Reajuste e garantia</CardTitle>
        <SelectField
          control={control}
          name="indiceReajuste"
          label="Índice de reajuste"
          options={enumOptions(INDICE_REAJUSTE, indiceReajusteLabels)}
        />
        <TextField
          control={control}
          name="percentualReajuste"
          label="Percentual de reajuste (%)"
          numeric
        />
        <TextField
          control={control}
          name="periodoReajuste"
          label="Período de reajuste (meses)"
          numeric
        />
        <SelectField
          control={control}
          name="tipoGarantia"
          label="Tipo de garantia"
          options={enumOptions(TIPO_GARANTIA, tipoGarantiaLabels)}
        />
        <MoneyField
          control={control}
          name="valorGarantia"
          label="Valor da garantia (R$)"
        />
      </Card>

      <Card>
        <TextAreaField
          control={control}
          name="observacoes"
          label="Observações"
        />
      </Card>

      <Button
        title={salvar.isPending ? "Salvando…" : "Salvar contrato"}
        loading={salvar.isPending}
        onPress={handleSubmit(onSubmit)}
      />
      <Button title="Cancelar" variant="ghost" onPress={() => router.back()} />

      <Modal
        visible={payloadPendente !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setPayloadPendente(null)}
      >
        <Pressable
          style={styles.backdrop}
          onPress={() => setPayloadPendente(null)}
        >
          <Pressable style={styles.card} onPress={() => {}}>
            <Txt variant="subtitle">Parcelas anteriores ao mês atual</Txt>
            <Txt variant="muted">
              A data de início de vigência gera aluguéis com competência
              anterior ao mês atual. Deseja que essas parcelas sejam criadas
              já como pagas (via Pix, na data de vencimento de cada uma) ou
              como pendentes e em atraso?
            </Txt>
            <View style={styles.acoes}>
              <Button
                title="Pendentes"
                variant="outline"
                onPress={() => confirmarParcelasAnteriores(false)}
                style={styles.flex}
              />
              <Button
                title="Pagas"
                onPress={() => confirmarParcelasAnteriores(true)}
                style={styles.flex}
              />
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    padding: spacing.xl,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    gap: spacing.md,
  },
  acoes: { flexDirection: "row", gap: spacing.sm, marginTop: spacing.xs },
  flex: { flex: 1 },
});
