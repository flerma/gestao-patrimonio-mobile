import * as React from "react";
import { View } from "react-native";
import { Stack, useRouter } from "expo-router";

import { useImoveis } from "@/hooks/use-imoveis";
import { useContratos } from "@/hooks/use-contratos";
import { usePagamentosAluguel } from "@/hooks/use-pagamentos-aluguel";
import { useSelectedUser } from "@/providers/selected-user";
import { filtrarPorUsuario, listarAlugueisEmAtraso } from "@/lib/dashboard";
import { formatCurrency, formatDate, formatMonthLabel } from "@/lib/format";
import { colors, spacing } from "@/lib/theme";
import { Screen } from "@/components/ui/Screen";
import { Card } from "@/components/ui/Card";
import { Txt } from "@/components/ui/Txt";
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from "@/components/ui/states";
import { EntityRow } from "@/components/EntityRow";

export default function AlugueisAtrasadosScreen() {
  const router = useRouter();
  const { usuarioId } = useSelectedUser();
  const imoveisQuery = useImoveis();
  const contratosQuery = useContratos();
  const pagamentosQuery = usePagamentosAluguel();

  const loading = contratosQuery.isLoading || pagamentosQuery.isLoading;
  const error = contratosQuery.error ?? pagamentosQuery.error;
  const refreshing =
    contratosQuery.isRefetching ||
    pagamentosQuery.isRefetching ||
    imoveisQuery.isRefetching;
  const onRefresh = () => {
    imoveisQuery.refetch();
    contratosQuery.refetch();
    pagamentosQuery.refetch();
  };

  const linhas = React.useMemo(() => {
    const contratos = contratosQuery.data ?? [];
    const { contratosUsuario } = filtrarPorUsuario(
      imoveisQuery.data ?? [],
      contratos,
      usuarioId ?? undefined,
    );
    const contratosPermitidos = usuarioId
      ? new Set(contratosUsuario.map((c) => c.id))
      : undefined;
    return listarAlugueisEmAtraso(
      pagamentosQuery.data ?? [],
      contratos,
      contratosPermitidos,
    );
  }, [imoveisQuery.data, contratosQuery.data, pagamentosQuery.data, usuarioId]);

  const totalEmAberto = linhas.reduce(
    (acc, l) => acc + Math.max(Number(l.pagamento.saldo ?? 0), 0),
    0,
  );

  return (
    <Screen refreshing={refreshing} onRefresh={onRefresh}>
      <Stack.Screen options={{ title: "Aluguéis em atraso" }} />

      {loading && !contratosQuery.data ? (
        <LoadingState label="Carregando cobranças…" />
      ) : error && !contratosQuery.data ? (
        <ErrorState error={error} onRetry={onRefresh} />
      ) : linhas.length === 0 ? (
        <EmptyState
          title="Nenhum aluguel em atraso"
          description="Todas as cobranças de aluguel estão em dia para este proprietário."
        />
      ) : (
        <View style={{ gap: spacing.md }}>
          <Card>
            <View style={{ flexDirection: "row", gap: spacing.xl }}>
              <View style={{ flex: 1 }}>
                <Txt variant="muted">Cobranças em atraso</Txt>
                <Txt variant="value">{linhas.length}</Txt>
              </View>
              <View style={{ flex: 1 }}>
                <Txt variant="muted">Total em aberto</Txt>
                <Txt variant="value" style={{ color: colors.danger }}>
                  {formatCurrency(totalEmAberto)}
                </Txt>
              </View>
            </View>
          </Card>

          {linhas.map(({ pagamento, contrato, imovel, diasEmAtraso }) => (
            <EntityRow
              key={pagamento.id}
              title={imovel?.nome ?? "Imóvel não encontrado"}
              lines={[
                contrato?.inquilino?.nome
                  ? `Inquilino: ${contrato.inquilino.nome}`
                  : "Inquilino não informado",
                `Competência ${formatMonthLabel(pagamento.competencia)} · venc. ${formatDate(pagamento.dataVencimento)}`,
                `Previsto ${formatCurrency(pagamento.valorPrevisto)} · recebido ${formatCurrency(pagamento.valorPago)}`,
              ]}
              badge={{
                label: `${diasEmAtraso} dia${diasEmAtraso === 1 ? "" : "s"}`,
                tone: "danger",
              }}
              rightText={`${formatCurrency(Math.max(Number(pagamento.saldo ?? 0), 0))} em aberto`}
              onPress={() => {
                if (imovel) router.push(`/imoveis/${imovel.id}`);
                else if (contrato) router.push(`/contratos/${contrato.id}`);
              }}
            />
          ))}
        </View>
      )}
    </Screen>
  );
}
