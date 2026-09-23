import * as React from "react";
import { View } from "react-native";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";

import { useContrato, useExcluirContrato } from "@/hooks/use-contratos";
import { usePagamentosAluguel } from "@/hooks/use-pagamentos-aluguel";
import { calcularResumoPagamentos } from "@/lib/dashboard";
import { formatCurrency } from "@/lib/format";
import { colors, spacing } from "@/lib/theme";
import { Screen } from "@/components/ui/Screen";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Txt } from "@/components/ui/Txt";
import { ErrorState, LoadingState } from "@/components/ui/states";
import { ContratoForm } from "@/components/forms/ContratoForm";
import { DeleteHeaderButton } from "@/components/DeleteHeaderButton";
import { ConfirmDelete } from "@/components/ConfirmDelete";

export default function ContratoDetalheScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { data, isLoading, error, refetch } = useContrato(id);
  const pagamentosQuery = usePagamentosAluguel(id);
  const excluir = useExcluirContrato();
  const [confirmOpen, setConfirmOpen] = React.useState(false);

  const resumo = React.useMemo(
    () => calcularResumoPagamentos(pagamentosQuery.data ?? []),
    [pagamentosQuery.data],
  );

  return (
    <Screen>
      <Stack.Screen
        options={{
          title: data ? `Contrato · ${data.imovel?.nome ?? "Imóvel"}` : "Contrato",
          headerRight: data
            ? () => <DeleteHeaderButton onPress={() => setConfirmOpen(true)} />
            : undefined,
        }}
      />
      {isLoading ? (
        <LoadingState />
      ) : error || !data ? (
        <ErrorState error={error} onRetry={refetch} />
      ) : (
        <>
          <View
            style={{
              flexDirection: "row",
              gap: spacing.sm,
              marginBottom: spacing.lg,
            }}
          >
            <Button
              title="Aluguéis em atraso"
              variant="outline"
              size="sm"
              style={{ flex: 1 }}
              onPress={() =>
                router.push({
                  pathname: "/pagamentos-contrato",
                  params: { contratoId: id, atraso: "1" },
                })
              }
            />
            <Button
              title="Todos aluguéis"
              variant="outline"
              size="sm"
              style={{ flex: 1 }}
              onPress={() =>
                router.push({
                  pathname: "/pagamentos-contrato",
                  params: { contratoId: id },
                })
              }
            />
          </View>

          <Card style={{ marginBottom: spacing.lg }}>
            <View style={{ flexDirection: "row", gap: spacing.md }}>
              <View style={{ flex: 1 }}>
                <Txt variant="muted">Atrasados</Txt>
                <Txt variant="value">{resumo.emAtraso}</Txt>
              </View>
              <View style={{ flex: 1 }}>
                <Txt variant="muted">Em aberto</Txt>
                <Txt variant="value" style={{ color: colors.danger }}>
                  {formatCurrency(resumo.totalEmAtraso)}
                </Txt>
              </View>
              <View style={{ flex: 1 }}>
                <Txt variant="muted">Recebidos</Txt>
                <Txt variant="value" style={{ color: colors.success }}>
                  {formatCurrency(resumo.totalRecebido)}
                </Txt>
              </View>
            </View>
          </Card>

          <ContratoForm contrato={data} />
        </>
      )}

      <ConfirmDelete
        visible={confirmOpen}
        itemLabel={data ? `contrato de ${data.imovel?.nome ?? "imóvel"}` : ""}
        deleting={excluir.isPending}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={() => {
          if (data) {
            excluir.mutate(data.id, { onSuccess: () => router.back() });
          }
          setConfirmOpen(false);
        }}
      />
    </Screen>
  );
}
