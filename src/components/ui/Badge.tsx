import * as React from "react";
import { StyleSheet, Text, View } from "react-native";

import { badgeColors, radius, type BadgeTone } from "@/lib/theme";

export function Badge({
  label,
  tone = "muted",
}: {
  label: string;
  tone?: BadgeTone;
}) {
  const c = badgeColors[tone];
  return (
    <View style={[styles.badge, { backgroundColor: c.bg }]}>
      <Text style={[styles.text, { color: c.fg }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: "flex-start",
    borderRadius: radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  text: { fontSize: 12, fontWeight: "600" },
});
