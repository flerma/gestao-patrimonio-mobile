import * as React from "react";
import { StyleSheet, Text, type TextProps } from "react-native";

import { colors, font } from "@/lib/theme";

type Variant =
  | "title"
  | "heading"
  | "subtitle"
  | "body"
  | "muted"
  | "label"
  | "value";

export function Txt({
  variant = "body",
  style,
  ...props
}: TextProps & { variant?: Variant }) {
  return <Text style={[styles[variant], style]} {...props} />;
}

const styles = StyleSheet.create({
  title: { fontSize: font.size.xxl, fontWeight: "700", color: colors.text },
  heading: { fontSize: font.size.lg, fontWeight: "700", color: colors.text },
  subtitle: { fontSize: font.size.md, fontWeight: "600", color: colors.text },
  body: { fontSize: font.size.md, color: colors.text },
  muted: { fontSize: font.size.sm, color: colors.textMuted },
  label: {
    fontSize: font.size.xs,
    fontWeight: "600",
    color: colors.textMuted,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  value: { fontSize: font.size.xl, fontWeight: "700", color: colors.text },
});
