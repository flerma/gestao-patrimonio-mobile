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
import { usePagamentosAluguel } from "@/hooks/use-pagamentos-aluguel";
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

function ultimoDiaDoMes(ano: number, mesUm: number): number {
  return new Date(ano, mesUm, 0).getDate();
}

/** Mês atual no formato "yyyy-MM", comparável lexicograficamente com IsoYearMonth. */
function mesAtualIso(): string {
  const hoje = new Date();
  return `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, "0")}`;
}

/**
 * Sugere a data da primeira parcela: soma-se 30 dias à data de início da
 * vigência; a partir dessa data-base, a primeira parcela cai no próximo dia
 * igual ao dia de vencimento (no mesmo mês da data-base, se esse dia ainda
 * não tiver passado; no mês seguinte, caso contrário).
 * Ex.: início 02/01, vencimento dia 10 -> base 01/02 -> parcela 10/02.
 * Início 15/01, vencimento dia 10 -> base 14/02 -> parcela 10/03.
 */
function sugerirDataPrimeiraParcela(
  dataInicio: string | undefined,
  diaVencimento: number | undefined,
): string | undefined {
  if (!dataInicio || !diaVencimento) return undefined;
  const match = dataInicio.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return undefined;
  const [, anoStr, mesStr, diaStr] = match;
  const inicio = new Date(Number(anoStr), Number(mesStr) - 1, Number(diaStr));
  const base = new Date(inicio);
  base.setDate(base.getDate() + 30);

  let anoAlvo = base.getFullYear();
  let mesAlvo = base.getMonth() + 1;
  if (base.getDate() > diaVencimento) {
    mesAlvo += 1;
    if (mesAlvo > 12) {
      mesAlvo = 1;
      anoAlvo += 1;
    }
  }
  const dia = Math.min(diaVencimento, ultimoDiaDoMes(anoAlvo, mesAlvo));
  return `${anoAlvo}-${String(mesAlvo).padStart(2, "0")}-${String(dia).padStart(2, "0")}`;
}

/** Primeira parcela deve vencer, no mínimo, 30 dias após o início da vigência. */
const DIAS_MINIMOS_PRIMEIRA_PARCELA = 30;

/** Soma dias a uma data yyyy-MM-dd, retornando yyyy-MM-dd (ou undefined se inválida). */
function somarDiasIso(data: string, dias: number): string | undefined {
  const match = data.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return undefined;
  const [, anoStr, mesStr, diaStr] = match;
  const d = new Date(Number(anoStr), Number(mesStr) - 1, Number(diaStr) + dias);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
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
    dataPrimeiraParcela: z.string().min(1, "Informe a data da primeira parcela"),
    // nullish: o MoneyField grava null quando o campo é apagado (ver MoneyField).
    valorPrimeiraParcela: z.number().positive("O valor deve ser maior que zero").nullish(),
    indiceReajuste: z.enum(INDICE_REAJUSTE),
    percentualReajuste: z.number().min(0).optional(),
    periodoReajuste: z.number().int().positive().optional(),
    tipoGarantia: z.enum(TIPO_GARANTIA),
    valorGarantia: z.number().min(0).nullish(),
    observacoes: z.string().max(1000).optional(),
  })
  .refine((d) => !d.dataFim || d.dataFim >= d.dataInicio, {
    path: ["dataFim"],
    message: "A data fim deve ser posterior ao início",
  })
  .refine(
    (d) => {
      const minima = somarDiasIso(d.dataInicio, DIAS_MINIMOS_PRIMEIRA_PARCELA);
      return !minima || d.dataPrimeiraParcela >= minima;
    },
    {
      path: ["dataPrimeiraParcela"],
      message: `A data da primeira parcela deve ser, no mínimo, ${DIAS_MINIMOS_PRIMEIRA_PARCELA} dias após o início da vigência`,
    },
  )
  .refine((d) => d.indiceReajuste !== "FIXO" || !!d.percentualReajuste, {
    path: ["percentualReajuste"],
    message: 'Informe o percentual de reajuste quando o índice for "Percentual fixo"',
  });
type FormValues = z.infer<typeof schema>;

export function ContratoForm({ contrato }: { contrato?: ContratoResponse }) {
  const router = useRouter();
  const salvar = useSalvarContrato(contrato?.id);
  const { data: imoveis } = useImoveis();
  const { data: inquilinos } = useInquilinos();
  const { data: pagamentos } = usePagamentosAluguel(contrato?.id, Boolean(contrato?.id));

  const { control, handleSubmit, watch, setValue, formState } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      imovelId: contrato?.imovel?.id ?? "",
      inquilinoId: contrato?.inquilino?.id ?? "",
      tipo: contrato?.tipo ?? "RESIDENCIAL",
      status: contrato?.status ?? "ATIVO",
      dataInicio: contrato?.dataInicio ?? "",
      dataFim: contrato?.dataFim ?? undefined,
      valorAluguel: contrato?.valorAluguel,
      diaVencimento: contrato?.diaVencimento ?? 5,
      dataPrimeiraParcela: contrato?.dataPrimeiraParcela ?? "",
      valorPrimeiraParcela: contrato?.valorPrimeiraParcela ?? undefined,
      indiceReajuste: contrato?.indiceReajuste ?? "IPCA",
      percentualReajuste: contrato?.percentualReajuste ?? undefined,
      periodoReajuste: contrato?.periodoReajuste ?? 12,
      tipoGarantia: contrato?.tipoGarantia ?? "SEM_GARANTIA",
      valorGarantia: contrato?.valorGarantia ?? undefined,
      observacoes: contrato?.observacoes ?? "",
    },
  });

  const dataInicio = watch("dataInicio");
  const diaVencimento = watch("diaVencimento");
  const indiceReajuste = watch("indiceReajuste");
  const tipoGarantia = watch("tipoGarantia");
  // Recalcula a data da primeira parcela sempre que o início da vigência ou
  // o dia de vencimento mudam (criação e edição) — inclusive se o usuário já
  // tiver alterado a data manualmente. Compara com os valores anteriores em vez
  // de pular a "primeira execução", para não sobrescrever o valor carregado na
  // montagem (nem sob a dupla execução de efeitos do StrictMode).
  const anterioresSugestaoRef = React.useRef({ dataInicio, diaVencimento });
  React.useEffect(() => {
    const anteriores = anterioresSugestaoRef.current;
    anterioresSugestaoRef.current = { dataInicio, diaVencimento };
    if (anteriores.dataInicio === dataInicio && anteriores.diaVencimento === diaVencimento) return;
    const sugestao = sugerirDataPrimeiraParcela(dataInicio, diaVencimento);
    if (sugestao) {
      setValue("dataPrimeiraParcela", sugestao, { shouldValidate: formState.isSubmitted });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dataInicio, diaVencimento]);

  const valorAluguel = watch("valorAluguel");
  const primeiraExecucaoValorRef = React.useRef(true);
  React.useEffect(() => {
    if (primeiraExecucaoValorRef.current) {
      // Não sobrescreve o valor carregado (edição) nem o campo vazio
      // (criação) já na montagem — só reage a mudanças feitas pelo usuário.
      primeiraExecucaoValorRef.current = false;
      return;
    }
    // Só na inclusão: na alteração de um contrato existente, valor do aluguel
    // e valor da primeira parcela são campos independentes.
    if (contrato) return;
    if (formState.dirtyFields.valorPrimeiraParcela) return;
    if (valorAluguel != null) {
      setValue("valorPrimeiraParcela", valorAluguel);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [valorAluguel]);

  type EtapaConfirmacao = "parcelas-anteriores" | "valor-aluguel" | "vencimento-futuro";
  const [confirmacao, setConfirmacao] = React.useState<{
    payload: ContratoRequest;
    fila: EtapaConfirmacao[];
  } | null>(null);

  const enviar = (payload: ContratoRequest) => {
    salvar.mutate(payload, { onSuccess: () => router.back() });
  };

  /** Envia se não houver mais etapas pendentes; senão, abre o próximo modal da fila. */
  const avancar = (payload: ContratoRequest, filaRestante: EtapaConfirmacao[]) => {
    if (filaRestante.length === 0) {
      enviar(payload);
      setConfirmacao(null);
      return;
    }
    setConfirmacao({ payload, fila: filaRestante });
  };

  const onSubmit = (values: FormValues) => {
    let payload: ContratoRequest = {
      imovelId: values.imovelId,
      inquilinoId: values.inquilinoId,
      tipo: values.tipo,
      status: values.status,
      dataInicio: values.dataInicio,
      dataFim: values.dataFim || undefined,
      valorAluguel: values.valorAluguel,
      diaVencimento: values.diaVencimento,
      dataPrimeiraParcela: values.dataPrimeiraParcela,
      valorPrimeiraParcela: values.valorPrimeiraParcela ?? undefined,
      indiceReajuste: values.indiceReajuste,
      percentualReajuste: values.percentualReajuste,
      periodoReajuste: values.periodoReajuste,
      tipoGarantia: values.tipoGarantia,
      valorGarantia: values.valorGarantia ?? undefined,
      observacoes: values.observacoes || undefined,
    };

    const dataInicioMudou = contrato === undefined || contrato.dataInicio !== values.dataInicio;
    const precisaParcelasAnteriores =
      dataInicioMudou && competenciaAnteriorAoMesAtual(values.dataInicio);
    const precisaVencimentoFuturo =
      contrato !== undefined && contrato.diaVencimento !== values.diaVencimento;

    const valorAluguelMudou =
      contrato !== undefined && contrato.valorAluguel !== values.valorAluguel;
    const existemParcelasAnterioresAoMesAtual = (pagamentos ?? []).some(
      (p) => p.competencia < mesAtualIso(),
    );
    const precisaValorAluguel = valorAluguelMudou && existemParcelasAnterioresAoMesAtual;
    if (valorAluguelMudou && !precisaValorAluguel) {
      // Não há parcelas anteriores ao mês atual: não há distinção entre
      // "todas" e "a partir do mês atual" — atualiza direto, sem perguntar.
      payload = { ...payload, atualizarValorParcelas: true };
    }

    const fila: EtapaConfirmacao[] = [
      ...(precisaParcelasAnteriores ? (["parcelas-anteriores"] as const) : []),
      ...(precisaValorAluguel ? (["valor-aluguel"] as const) : []),
      ...(precisaVencimentoFuturo ? (["vencimento-futuro"] as const) : []),
    ];

    avancar(payload, fila);
  };

  const confirmarParcelasAnteriores = (marcarComoPagas: boolean) => {
    if (!confirmacao) return;
    avancar(
      { ...confirmacao.payload, marcarParcelasAnterioresComoPagas: marcarComoPagas },
      confirmacao.fila.slice(1),
    );
  };

  const confirmarValorAluguel = (todasParcelas: boolean) => {
    if (!confirmacao) return;
    avancar(
      { ...confirmacao.payload, atualizarValorParcelas: todasParcelas },
      confirmacao.fila.slice(1),
    );
  };

  const confirmarVencimentoFuturo = (atualizar: boolean) => {
    if (!confirmacao) return;
    avancar(
      { ...confirmacao.payload, atualizarVencimentoParcelasFuturas: atualizar },
      confirmacao.fila.slice(1),
    );
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
        <DateField
          control={control}
          name="dataPrimeiraParcela"
          label="Data da primeira parcela"
        />
        <MoneyField
          control={control}
          name="valorPrimeiraParcela"
          label="Valor da primeira parcela (R$, opcional)"
        />
      </Card>

      <Card>
        <CardTitle>Reajuste e garantia</CardTitle>
        <SelectField
          control={control}
          name="indiceReajuste"
          label="Índice de reajuste"
          options={enumOptions(INDICE_REAJUSTE, indiceReajusteLabels)}
          onValueChange={() => setValue("percentualReajuste", undefined)}
        />
        <TextField
          control={control}
          name="percentualReajuste"
          label="Percentual de reajuste (%)"
          numeric
          disabled={indiceReajuste !== "FIXO"}
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
          onValueChange={() => setValue("valorGarantia", 0)}
        />
        <MoneyField
          control={control}
          name="valorGarantia"
          label="Valor da garantia (R$)"
          disabled={tipoGarantia !== "CAUCAO"}
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
        visible={confirmacao?.fila[0] === "parcelas-anteriores"}
        transparent
        animationType="fade"
        onRequestClose={() => setConfirmacao(null)}
      >
        <Pressable style={styles.backdrop} onPress={() => setConfirmacao(null)}>
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

      <Modal
        visible={confirmacao?.fila[0] === "valor-aluguel"}
        transparent
        animationType="fade"
        onRequestClose={() => setConfirmacao(null)}
      >
        <Pressable style={styles.backdrop} onPress={() => setConfirmacao(null)}>
          <Pressable style={styles.card} onPress={() => {}}>
            <Txt variant="subtitle">
              Atualizar valor das parcelas de aluguel?
            </Txt>
            <Txt variant="muted">
              O valor do aluguel foi alterado e existem parcelas com
              competência anterior ao mês atual. Deseja atualizar o valor de
              todas as parcelas ou somente das parcelas a partir do mês
              atual?
            </Txt>
            <View style={styles.acoes}>
              <Button
                title="A partir do mês atual"
                variant="outline"
                onPress={() => confirmarValorAluguel(false)}
                style={styles.flex}
              />
              <Button
                title="Todas"
                onPress={() => confirmarValorAluguel(true)}
                style={styles.flex}
              />
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      <Modal
        visible={confirmacao?.fila[0] === "vencimento-futuro"}
        transparent
        animationType="fade"
        onRequestClose={() => setConfirmacao(null)}
      >
        <Pressable style={styles.backdrop} onPress={() => setConfirmacao(null)}>
          <Pressable style={styles.card} onPress={() => {}}>
            <Txt variant="subtitle">
              Atualizar vencimento das parcelas futuras?
            </Txt>
            <Txt variant="muted">
              O dia de vencimento foi alterado. As parcelas de aluguel com
              competência posterior ao mês atual terão a data de vencimento
              alterada para o novo dia selecionado. Deseja confirmar essa
              alteração?
            </Txt>
            <View style={styles.acoes}>
              <Button
                title="Não alterar"
                variant="outline"
                onPress={() => confirmarVencimentoFuturo(false)}
                style={styles.flex}
              />
              <Button
                title="Confirmar"
                onPress={() => confirmarVencimentoFuturo(true)}
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
