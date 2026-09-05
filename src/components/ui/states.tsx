import * as React from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";

import { ApiError } from "@/lib/api";
import { getApiBaseUrl } from "@/lib/config";
import { colors, spacing } from "@/lib/theme";
import { Button } from "./Button";
import { Txt } from "./Txt";

export function LoadingState({ label = "Carregando…" }: { label?: string }) {
  return (
    <View style={styles.box}>
      <ActivityIndicator color={colors.primary} />
      <Txt variant="muted">{label}</Txt>
    </View>
  );
}

export function EmptyState({
  title = "Nada por aqui",
  description,
  actionLabel,
  onAction,
}: {
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <View style={styles.box}>
      <Txt variant="subtitle">{title}</Txt>
      {description ? (
        <Txt variant="muted" style={styles.center}>
          {description}
        </Txt>
      ) : null}
      {actionLabel && onAction ? (
        <Button title={actionLabel} variant="outline" size="sm" onPress={onAction} />
      ) : null}
    </View>
  );
}

export function ErrorState({
  error,
  onRetry,
}: {
  error: unknown;
  onRetry?: () => void;
}) {
  const isNetwork = !(error instanceof ApiError);
  const message =
    error instanceof ApiError
      ? error.message
      : "Não foi possível conectar à API.";
  return (
    <View style={[styles.box, styles.error]}>
      <Txt variant="subtitle" style={{ color: colors.danger }}>
        {message}
      </Txt>
      {isNetwork ? (
        <Txt variant="muted" style={styles.center}>
          Servidor configurado: {getApiBaseUrl()}
          {"\n"}Ajuste o endereço na aba Ajustes se necessário.
        </Txt>
      ) : null}
      {onRetry ? (
        <Button
          title="Tentar novamente"
          variant="outline"
          size="sm"
          onPress={onRetry}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    alignItems: "center",
    gap: spacing.md,
    paddingVertical: spacing.xxl,
  },
  center: { textAlign: "center" },
  error: {
    backgroundColor: colors.dangerSoft,
    borderRadius: 12,
    paddingHorizontal: spacing.lg,
  },
});
