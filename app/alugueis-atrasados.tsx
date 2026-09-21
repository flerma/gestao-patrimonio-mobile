import * as React from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { Stack, useRouter } from "expo-router";

import { useImoveis } from "@/hooks/use-imoveis";
import { useContratos } from "@/hooks/use-contratos";
import { usePagamentosAluguel } from "@/hooks/use-pagamentos-aluguel";
import { useAuth } from "@/providers/auth";
import { filtrarPorUsuario, listarAlugueisEmAtraso } from "@/lib/dashboard";
import { formatCompetencia, formatCurrency, formatDate } from "@/lib/format";
import { colors, spacing } from "@/lib/theme";
import type { UUID } from "@/lib/types";
import { Screen } from "@/components/ui/Screen";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Txt } from "@/components/ui/Txt";
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from "@/components/ui/states";
import { RegistrarPagamentoControls } from "@/components/dashboard/RegistrarPagamentoControls";
import { ExcluirPagamentoButton } from "@/components/dashboard/ExcluirPagamentoButton";

export default function AlugueisAtrasadosScreen() {
  const router = useRouter();
  const { usuario } = useAuth();
  const usuarioId = usuario?.id ?? null;
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

  // Some da lista assim que marcado como pago, sem esperar o refetch (que
  // de qualquer forma o excluiria, já que deixa de estar em atraso).
  const [idsPagos, setIdsPagos] = React.useState<Set<UUID>>(new Set());
  const [idsExcluidos, setIdsExcluidos] = React.useState<Set<UUID>>(new Set());
  const linhasExibidas = React.useMemo(
    () =>
      linhas.filter(
        (l) => !idsPagos.has(l.pagamento.id) && !idsExcluidos.has(l.pagamento.id),
      ),
    [linhas, idsPagos, idsExcluidos],
  );

  const totalEmAberto = linhasExibidas.reduce(
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
      ) : linhasExibidas.length === 0 ? (
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
                <Txt variant="value">{linhasExibidas.length}</Txt>
              </View>
              <View style={{ flex: 1 }}>
                <Txt variant="muted">Total em aberto</Txt>
                <Txt variant="value" style={{ color: colors.danger }}>
                  {formatCurrency(totalEmAberto)}
                </Txt>
              </View>
            </View>
          </Card>

          {linhasExibidas.map(({ pagamento, contrato, imovel, diasEmAtraso }) => (
            <Card key={pagamento.id}>
              <Pressable
                style={{ gap: 2 }}
                onPress={() => {
                  if (imovel) router.push(`/imoveis/${imovel.id}`);
                  else if (contrato) router.push(`/contratos/${contrato.id}`);
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: spacing.sm,
                  }}
                >
                  <Txt variant="subtitle" numberOfLines={1} style={{ flex: 1 }}>
                    {imovel?.nome ?? "Imóvel não encontrado"}
                  </Txt>
                  <Badge
                    label={`${diasEmAtraso} dia${diasEmAtraso === 1 ? "" : "s"}`}
                    tone="danger"
                  />
                </View>
                <Txt variant="muted" numberOfLines={1}>
                  {contrato?.inquilino?.nome
                    ? `Inquilino: ${contrato.inquilino.nome}`
                    : "Inquilino não informado"}
                </Txt>
                <Txt variant="muted" numberOfLines={1}>
                  {`Competência ${formatCompetencia(pagamento.competencia)} · venc. ${formatDate(pagamento.dataVencimento)}`}
                </Txt>
                <Txt variant="muted" numberOfLines={1}>
                  {`Previsto ${formatCurrency(pagamento.valorPrevisto)} · recebido ${formatCurrency(pagamento.valorPago)}`}
                </Txt>
                <Txt variant="subtitle">
                  {`${formatCurrency(Math.max(Number(pagamento.saldo ?? 0), 0))} em aberto`}
                </Txt>
              </Pressable>

              <View style={styles.acoes}>
                <RegistrarPagamentoControls
                  pagamento={pagamento}
                  onRegistrado={(id) =>
                    setIdsPagos((prev) => new Set(prev).add(id))
                  }
                />
                <ExcluirPagamentoButton
                  pagamento={pagamento}
                  onExcluido={(id) =>
                    setIdsExcluidos((prev) => new Set(prev).add(id))
                  }
                />
              </View>
            </Card>
          ))}
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  acoes: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
});
