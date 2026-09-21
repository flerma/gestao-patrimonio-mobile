import * as React from "react";
import { Modal, Pressable, StyleSheet, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { colors, radius, spacing } from "@/lib/theme";
import type { PagamentoAluguelResponse, UUID } from "@/lib/types";
import { useExcluirPagamentoAluguel } from "@/hooks/use-pagamentos-aluguel";
import { Txt } from "@/components/ui/Txt";
import { Button } from "@/components/ui/Button";

/**
 * Ícone de lixeira que pede confirmação antes de excluir permanentemente
 * um aluguel.
 */
export function ExcluirPagamentoButton({
  pagamento,
  onExcluido,
}: {
  pagamento: PagamentoAluguelResponse;
  onExcluido: (id: UUID) => void;
}) {
  const excluir = useExcluirPagamentoAluguel();
  const [open, setOpen] = React.useState(false);

  return (
    <>
      <Pressable
        onPress={() => setOpen(true)}
        hitSlop={8}
        accessibilityRole="button"
        accessibilityLabel="Excluir aluguel"
      >
        <Ionicons name="trash-outline" size={22} color={colors.danger} />
      </Pressable>

      <Modal
        visible={open}
        transparent
        animationType="fade"
        onRequestClose={() => setOpen(false)}
      >
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)}>
          <Pressable style={styles.sheet} onPress={() => {}}>
            <Txt variant="subtitle" style={{ marginBottom: spacing.sm }}>
              Excluir aluguel
            </Txt>
            <Txt variant="muted" style={{ marginBottom: spacing.lg }}>
              Tem certeza de que deseja excluir permanentemente este aluguel?
              Esta ação não pode ser desfeita.
            </Txt>
            <View style={styles.acoes}>
              <Button
                title="Cancelar"
                variant="outline"
                onPress={() => setOpen(false)}
                style={{ flex: 1 }}
              />
              <Button
                title={excluir.isPending ? "Excluindo…" : "Excluir"}
                variant="danger"
                loading={excluir.isPending}
                onPress={() =>
                  excluir.mutate(pagamento.id, {
                    onSuccess: () => {
                      onExcluido(pagamento.id);
                      setOpen(false);
                    },
                  })
                }
                style={{ flex: 1 }}
              />
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    padding: spacing.lg,
  },
  acoes: { flexDirection: "row", gap: spacing.sm },
});
