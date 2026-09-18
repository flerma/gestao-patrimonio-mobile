import * as React from "react";
import { View } from "react-native";
import { Stack, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import { useContrato } from "@/hooks/use-contratos";
import { usePagamentosAluguel } from "@/hooks/use-pagamentos-aluguel";
import { listarPagamentosDoContrato } from "@/lib/dashboard";
import { formatCurrency, formatDate, formatMonthLabel } from "@/lib/format";
import { formaPagamentoLabels } from "@/lib/labels";
import { colors, spacing } from "@/lib/theme";
import { Screen } from "@/components/ui/Screen";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Txt } from "@/components/ui/Txt";
import { EmptyState, ErrorState, LoadingState } from "@/components/ui/states";
import { RegistrarPagamentoControls } from "@/components/dashboard/RegistrarPagamentoControls";

export default function PagamentosContratoScreen() {
  const { contratoId, atraso } = useLocalSearchParams<{
    contratoId: string;
    atraso?: string;
  }>();
  const somenteAtraso = atraso === "1";

  const contratoQuery = useContrato(contratoId);
  const pagamentosQuery = usePagamentosAluguel(contratoId);

  const loading = contratoQuery.isLoading || pagamentosQuery.isLoading;
  const error = contratoQuery.error ?? pagamentosQuery.error;
  const refreshing = contratoQuery.isRefetching || pagamentosQuery.isRefetching;
  const onRefresh = () => {
    contratoQuery.refetch();
    pagamentosQuery.refetch();
  };

  const linhas = React.useMemo(() => {
    if (!contratoQuery.data) return [];
    const todas = listarPagamentosDoContrato(
      pagamentosQuery.data ?? [],
      contratoQuery.data,
    );
    return somenteAtraso
      ? todas.filter((l) => l.pagamento.statusEfetivo === "EM_ATRASO")
      : todas;
  }, [contratoQuery.data, pagamentosQuery.data, somenteAtraso]);

  const titulo = somenteAtraso ? "Aluguéis em atraso" : "Todos os aluguéis";
  const contrato = contratoQuery.data;

  return (
    <Screen refreshing={refreshing} onRefresh={onRefresh}>
      <Stack.Screen options={{ title: titulo }} />

      {contrato ? (
        <Txt variant="muted" style={{ marginBottom: spacing.md }}>
          {`${contrato.imovel?.nome ?? "Imóvel"} · ${contrato.inquilino?.nome ?? "Inquilino"}`}
        </Txt>
      ) : null}

      {loading && !contratoQuery.data ? (
        <LoadingState label="Carregando aluguéis…" />
      ) : error && !contratoQuery.data ? (
        <ErrorState error={error} onRetry={onRefresh} />
      ) : linhas.length === 0 ? (
        <EmptyState
          title={
            somenteAtraso ? "Nenhum aluguel em atraso" : "Nenhum aluguel encontrado"
          }
          description={
            somenteAtraso
              ? "Todas as cobranças deste contrato estão em dia."
              : "Este contrato ainda não tem cobranças geradas."
          }
        />
      ) : (
        <View style={{ gap: spacing.md }}>
          {linhas.map(({ pagamento, diasEmAtraso }) => {
            const emAberto = Math.max(Number(pagamento.saldo ?? 0), 0);
            const emAtraso = pagamento.statusEfetivo === "EM_ATRASO";
            return (
              <Card key={pagamento.id}>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <Txt variant="subtitle">
                    {formatMonthLabel(pagamento.competencia)}
                  </Txt>
                  {emAtraso ? (
                    <Badge
                      label={`${diasEmAtraso} dia${diasEmAtraso === 1 ? "" : "s"}`}
                      tone="danger"
                    />
                  ) : pagamento.status === "PAGO" ? (
                    <Ionicons
                      name="checkmark-circle"
                      size={20}
                      color={colors.success}
                    />
                  ) : null}
                </View>
                <Txt variant="muted">
                  {`Venc. ${formatDate(pagamento.dataVencimento)}`}
                </Txt>
                <Txt variant="muted">
                  {`Previsto ${formatCurrency(pagamento.valorPrevisto)} · recebido ${formatCurrency(pagamento.valorPago)}`}
                </Txt>
                <Txt variant="muted">
                  {`Em aberto ${formatCurrency(emAberto)}`}
                </Txt>
                <Txt variant="muted">
                  {`Pagamento: ${pagamento.dataPagamento ? formatDate(pagamento.dataPagamento) : "—"}`}
                  {pagamento.formaPagamento
                    ? ` · ${formaPagamentoLabels[pagamento.formaPagamento]}`
                    : ""}
                </Txt>

                {emAtraso ? (
                  <RegistrarPagamentoControls
                    pagamento={pagamento}
                    onRegistrado={() => {}}
                  />
                ) : null}
              </Card>
            );
          })}
        </View>
      )}
    </Screen>
  );
}
