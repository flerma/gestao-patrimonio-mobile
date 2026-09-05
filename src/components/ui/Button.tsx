import * as React from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
  type PressableProps,
} from "react-native";

import { colors, radius, spacing } from "@/lib/theme";

type Variant = "primary" | "outline" | "ghost" | "danger";
type Size = "md" | "sm";

interface ButtonProps extends PressableProps {
  title: string;
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  icon?: React.ReactNode;
}

export function Button({
  title,
  variant = "primary",
  size = "md",
  loading,
  icon,
  disabled,
  style,
  ...props
}: ButtonProps) {
  const isDisabled = disabled || loading;
  return (
    <Pressable
      accessibilityRole="button"
      disabled={isDisabled}
      style={(state) => [
        styles.base,
        size === "sm" && styles.sm,
        variantStyles[variant].container,
        isDisabled && styles.disabled,
        state.pressed && !isDisabled && styles.pressed,
        typeof style === "function" ? style(state) : style,
      ]}
      {...props}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === "primary" || variant === "danger" ? "#fff" : colors.primary}
          size="small"
        />
      ) : (
        <View style={styles.content}>
          {icon}
          <Text
            style={[
              styles.text,
              size === "sm" && styles.textSm,
              variantStyles[variant].text,
            ]}
          >
            {title}
          </Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 46,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    alignItems: "center",
    justifyContent: "center",
  },
  sm: { minHeight: 38, paddingHorizontal: spacing.md, borderRadius: radius.sm },
  content: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  text: { fontSize: 15, fontWeight: "600" },
  textSm: { fontSize: 13 },
  disabled: { opacity: 0.5 },
  pressed: { opacity: 0.85 },
});

const variantStyles: Record<
  Variant,
  { container: object; text: object }
> = {
  primary: {
    container: { backgroundColor: colors.primary },
    text: { color: "#fff" },
  },
  danger: {
    container: { backgroundColor: colors.danger },
    text: { color: "#fff" },
  },
  outline: {
    container: {
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
    },
    text: { color: colors.text },
  },
  ghost: {
    container: { backgroundColor: "transparent" },
    text: { color: colors.primary },
  },
};
