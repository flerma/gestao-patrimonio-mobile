import * as React from "react";
import { StyleSheet, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import type { Alerta, AlertaSeveridade } from "@/lib/dashboard";
import { colors, radius, spacing } from "@/lib/theme";
import { Txt } from "@/components/ui/Txt";

const cfg: Record<
  AlertaSeveridade,
  { icon: keyof typeof Ionicons.glyphMap; color: string; bg: string }
> = {
  danger: { icon: "alert-circle", color: colors.danger, bg: colors.dangerSoft },
  warning: { icon: "warning", color: colors.warning, bg: colors.warningSoft },
  info: { icon: "information-circle", color: colors.primary, bg: colors.primarySoft },
};

export function AlertsList({ alertas }: { alertas: Alerta[] }) {
  if (alertas.length === 0) {
    return (
      <Txt variant="muted" style={styles.empty}>
        Nenhum alerta no momento. Está tudo em dia. 🎉
      </Txt>
    );
  }
  return (
    <View style={{ gap: spacing.sm }}>
      {alertas.map((a) => {
        const c = cfg[a.severidade];
        return (
          <View key={a.id} style={[styles.item, { backgroundColor: c.bg }]}>
            <Ionicons name={c.icon} size={18} color={c.color} />
            <View style={styles.text}>
              <Txt variant="subtitle">{a.titulo}</Txt>
              <Txt variant="muted">{a.descricao}</Txt>
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  empty: { textAlign: "center", paddingVertical: spacing.lg },
  item: {
    flexDirection: "row",
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.md,
  },
  text: { flex: 1, gap: 2 },
});
