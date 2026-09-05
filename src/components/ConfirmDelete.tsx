import * as React from "react";
import { Modal, Pressable, StyleSheet, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { colors, radius, spacing } from "@/lib/theme";
import { Button } from "@/components/ui/Button";
import { Txt } from "@/components/ui/Txt";

export function ConfirmDelete({
  visible,
  itemLabel,
  blockedReason,
  deleting,
  onCancel,
  onConfirm,
}: {
  visible: boolean;
  itemLabel: string;
  blockedReason?: string | null;
  deleting?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  const blocked = Boolean(blockedReason);
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <Pressable style={styles.backdrop} onPress={onCancel}>
        <Pressable style={styles.card} onPress={() => {}}>
          <View style={styles.header}>
            <Ionicons
              name={blocked ? "shield-outline" : "trash-outline"}
              size={20}
              color={blocked ? colors.warning : colors.danger}
            />
            <Txt variant="subtitle">
              {blocked ? "Exclusão não permitida" : "Excluir registro"}
            </Txt>
          </View>
          <Txt variant="muted">
            {blocked
              ? blockedReason
              : `Tem certeza de que deseja excluir “${itemLabel}”? Esta ação não pode ser desfeita.`}
          </Txt>
          <View style={styles.actions}>
            {blocked ? (
              <Button title="Entendi" onPress={onCancel} />
            ) : (
              <>
                <Button
                  title="Cancelar"
                  variant="outline"
                  onPress={onCancel}
                  style={styles.flex}
                />
                <Button
                  title={deleting ? "Excluindo…" : "Excluir"}
                  variant="danger"
                  loading={deleting}
                  onPress={onConfirm}
                  style={styles.flex}
                />
              </>
            )}
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    padding: spacing.xl,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    gap: spacing.md,
  },
  header: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  actions: { flexDirection: "row", gap: spacing.sm, marginTop: spacing.xs },
  flex: { flex: 1 },
});
