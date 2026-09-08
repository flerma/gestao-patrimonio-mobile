import * as React from "react";
import { StyleSheet, View } from "react-native";

import type { ResumoPagamentos } from "@/lib/dashboard";
import { formatCurrency } from "@/lib/format";
import { colors, spacing } from "@/lib/theme";
import { Txt } from "@/components/ui/Txt";

interface Props {
  resumo: ResumoPagamentos;
  loading?: boolean;
  error?: boolean;
}

const statusRows = [
  { key: "pagos", label: "Pagos", color: colors.success },
  { key: "pendentes", label: "Pendentes", color: colors.warning },
  { key: "emAtraso", label: "Em atraso", color: colors.danger },
] as const;

export function RentPaymentsSummary({ resumo, loading, error }: Props) {
  if (error) {
    return (
      <Txt variant="muted" style={styles.empty}>
        Não foi possível carregar os pagamentos de aluguel.
      </Txt>
    );
  }
  if (loading) {
    return (
      <Txt variant="muted" style={styles.empty}>
        Carregando pagamentos…
      </Txt>
    );
  }

  return (
    <View style={{ gap: spacing.md }}>
      <View style={{ gap: spacing.sm }}>
        {statusRows.map((row) => (
          <View key={row.key} style={styles.row}>
            <View style={styles.left}>
              <View style={[styles.dot, { backgroundColor: row.color }]} />
              <Txt variant="muted">{row.label}</Txt>
            </View>
            <Txt variant="subtitle">{resumo[row.key]}</Txt>
          </View>
        ))}
      </View>

      <View style={styles.divider} />

      <View style={{ gap: spacing.sm }}>
        <View style={styles.row}>
          <Txt variant="muted">Total previsto</Txt>
          <Txt variant="subtitle">{formatCurrency(resumo.totalPrevisto)}</Txt>
        </View>
        <View style={styles.row}>
          <Txt variant="muted">Total recebido</Txt>
          <Txt variant="subtitle" style={{ color: colors.success }}>
            {formatCurrency(resumo.totalRecebido)}
          </Txt>
        </View>
        <View style={styles.row}>
          <Txt variant="muted">Total em atraso</Txt>
          <Txt variant="subtitle" style={{ color: colors.danger }}>
            {formatCurrency(resumo.totalEmAtraso)}
          </Txt>
        </View>
      </View>

      {resumo.quantidade === 0 && (
        <Txt variant="muted">Nenhuma cobrança de aluguel gerada ainda.</Txt>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  empty: { textAlign: "center", paddingVertical: spacing.lg },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  left: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  dot: { width: 10, height: 10, borderRadius: 5 },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.border,
  },
});
