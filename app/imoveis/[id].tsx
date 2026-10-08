import * as React from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import { useExcluirImovel, useImovel } from "@/hooks/use-imoveis";
import { useContratos } from "@/hooks/use-contratos";
import { MSG_IMOVEL_COM_CONTRATO } from "@/lib/vinculos";
import { formatCurrency, formatDate, formatPercent } from "@/lib/format";
import {
  statusContratoLabels,
  statusContratoTone,
  statusImovelLabels,
  statusImovelTone,
} from "@/lib/labels";
import { colors, radius, spacing } from "@/lib/theme";
import { Screen } from "@/components/ui/Screen";
import { ErrorState, LoadingState } from "@/components/ui/states";
import { Card, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Txt } from "@/components/ui/Txt";
import { ImovelForm } from "@/components/forms/ImovelForm";
import { DeleteHeaderButton } from "@/components/DeleteHeaderButton";
import { ConfirmDelete } from "@/components/ConfirmDelete";

export default function ImovelDetalheScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { data, isLoading, error, refetch } = useImovel(id);
  const { data: contratos, isLoading: contratosLoading } = useContratos();
  const excluir = useExcluirImovel();
  const [confirmOpen, setConfirmOpen] = React.useState(false);

  const contratosDoImovel = (contratos ?? []).filter((c) => c.imovel?.id === id);

  // Mesma regra do web: valorização + aluguéis pagos, desde a aquisição.
  const percentualRetorno =
    data && data.valorAquisicao > 0
      ? (data.valorAtual - data.valorAquisicao + (data.totalAlugueisPagos ?? 0)) /
        data.valorAquisicao
      : null;

  const blockedReason = contratosLoading
    ? "Aguarde o carregamento dos contratos…"
    : contratosDoImovel.length > 0
      ? MSG_IMOVEL_COM_CONTRATO
      : null;

  return (
    <Screen>
      <Stack.Screen
        options={{
          title: data?.nome ?? "Imóvel",
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
        <View style={{ gap: spacing.lg }}>
          <View style={styles.resumo}>
            <Card style={styles.quadro}>
              <Txt variant="muted">Valor atual</Txt>
              <Txt style={styles.valor}>{formatCurrency(data.valorAtual)}</Txt>
              <Txt variant="muted" style={styles.detalhe}>
                Aquisição: {formatCurrency(data.valorAquisicao)}
              </Txt>
            </Card>
            <Card style={styles.quadro}>
              <Txt variant="muted">Percentual de retorno</Txt>
              <Txt
                style={[
                  styles.valor,
                  percentualRetorno !== null && percentualRetorno < 0 && { color: colors.danger },
                ]}
              >
                {formatPercent(percentualRetorno)}
              </Txt>
              <Txt variant="muted" style={styles.detalhe}>
                Valorização + aluguéis pagos, desde a aquisição
              </Txt>
            </Card>
          </View>
          <Card style={styles.linhaStatus}>
            <Txt variant="muted">Status</Txt>
            <Badge label={statusImovelLabels[data.status]} tone={statusImovelTone[data.status]} />
          </Card>

          {contratosDoImovel.length > 0 ? (
            <Card>
              <CardTitle>Contratos vinculados</CardTitle>
              <View style={{ gap: spacing.sm }}>
                {contratosDoImovel.map((contrato) => (
                  <Pressable
                    key={contrato.id}
                    onPress={() => router.push(`/contratos/${contrato.id}`)}
                    accessibilityRole="link"
                    style={({ pressed }) => [styles.contrato, pressed && styles.contratoPressionado]}
                  >
                    <View style={{ flex: 1, gap: 2 }}>
                      <Txt style={{ fontWeight: "600" }} numberOfLines={1}>
                        {contrato.inquilino?.nome ?? "Inquilino"}
                      </Txt>
                      <Txt variant="muted" style={styles.detalhe}>
                        {formatCurrency(contrato.valorAluguel)}/mês · início {formatDate(contrato.dataInicio)}
                      </Txt>
                    </View>
                    <Badge
                      label={statusContratoLabels[contrato.status]}
                      tone={statusContratoTone[contrato.status]}
                    />
                    <Ionicons name="chevron-forward" size={18} color={colors.textFaint} />
                  </Pressable>
                ))}
              </View>
            </Card>
          ) : null}

          <Txt variant="subtitle">Editar imóvel</Txt>
          <ImovelForm imovel={data} />
        </View>
      )}

      <ConfirmDelete
        visible={confirmOpen}
        itemLabel={data?.nome ?? ""}
        blockedReason={blockedReason}
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

const styles = StyleSheet.create({
  resumo: { flexDirection: "row", gap: spacing.md },
  quadro: { flex: 1, gap: 4 },
  valor: { fontSize: 18, fontWeight: "700", color: colors.text },
  detalhe: { fontSize: 12 },
  linhaStatus: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  contrato: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    padding: spacing.md,
  },
  contratoPressionado: { backgroundColor: colors.surfaceMuted },
});
