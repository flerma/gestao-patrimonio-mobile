import * as React from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { colors, radius, spacing } from "@/lib/theme";
import { Badge } from "@/components/ui/Badge";
import { Txt } from "@/components/ui/Txt";
import type { BadgeTone } from "@/lib/theme";

export function EntityRow({
  title,
  lines,
  badge,
  rightText,
  onPress,
  onDelete,
}: {
  title: string;
  lines?: string[];
  badge?: { label: string; tone: BadgeTone };
  rightText?: string;
  onPress: () => void;
  onDelete?: () => void;
}) {
  return (
    <Pressable
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
      onPress={onPress}
    >
      <View style={styles.main}>
        <View style={styles.titleRow}>
          <Txt variant="subtitle" numberOfLines={1} style={styles.title}>
            {title}
          </Txt>
          {badge ? <Badge label={badge.label} tone={badge.tone} /> : null}
        </View>
        {lines
          ?.filter(Boolean)
          .map((line, i) => (
            <Txt key={i} variant="muted" numberOfLines={1}>
              {line}
            </Txt>
          ))}
        {rightText ? (
          <Txt variant="subtitle" style={styles.rightText}>
            {rightText}
          </Txt>
        ) : null}
      </View>
      <View style={styles.actions}>
        {onDelete ? (
          <Pressable onPress={onDelete} hitSlop={10} style={styles.iconBtn}>
            <Ionicons name="trash-outline" size={18} color={colors.textMuted} />
          </Pressable>
        ) : null}
        <Ionicons name="chevron-forward" size={18} color={colors.textFaint} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
  },
  pressed: { backgroundColor: colors.surfaceMuted },
  main: { flex: 1, gap: 2 },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.sm,
  },
  title: { flex: 1 },
  rightText: { marginTop: 2 },
  actions: { flexDirection: "row", alignItems: "center", gap: spacing.xs },
  iconBtn: { padding: 4 },
});
