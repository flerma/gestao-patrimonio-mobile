import * as React from "react";
import { StyleSheet, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { colors, radius, spacing } from "@/lib/theme";
import { Card } from "@/components/ui/Card";
import { Txt } from "@/components/ui/Txt";

type Accent = "primary" | "success" | "warning";

const accentBg: Record<Accent, string> = {
  primary: colors.primarySoft,
  success: colors.successSoft,
  warning: colors.warningSoft,
};
const accentFg: Record<Accent, string> = {
  primary: colors.primary,
  success: colors.success,
  warning: colors.warning,
};

export function StatCard({
  label,
  value,
  hint,
  icon,
  accent = "primary",
}: {
  label: string;
  value: string;
  hint?: string;
  icon: keyof typeof Ionicons.glyphMap;
  accent?: Accent;
}) {
  return (
    <Card style={styles.card}>
      <View style={styles.row}>
        <View style={[styles.iconBox, { backgroundColor: accentBg[accent] }]}>
          <Ionicons name={icon} size={18} color={accentFg[accent]} />
        </View>
        <View style={styles.textCol}>
          <Txt variant="muted" numberOfLines={1}>
            {label}
          </Txt>
          <Txt variant="value" numberOfLines={1} adjustsFontSizeToFit>
            {value}
          </Txt>
        </View>
      </View>
      {hint ? (
        <Txt variant="muted" style={styles.hint}>
          {hint}
        </Txt>
      ) : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { flex: 1, minWidth: "45%", gap: spacing.sm, padding: spacing.md },
  row: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: radius.sm,
    alignItems: "center",
    justifyContent: "center",
  },
  textCol: { flex: 1 },
  hint: { fontSize: 11 },
});
