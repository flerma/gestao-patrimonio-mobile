import * as React from "react";
import {
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { useSelectedUser } from "@/providers/selected-user";
import { useUsuarios } from "@/hooks/use-usuarios";
import { colors, radius, spacing } from "@/lib/theme";
import { Txt } from "@/components/ui/Txt";

export function UserSwitcher() {
  const { usuarioId, setUsuarioId, hydrated } = useSelectedUser();
  const { data: usuarios } = useUsuarios();
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    if (!hydrated || !usuarios || usuarios.length === 0) return;
    if (!usuarioId || !usuarios.some((u) => u.id === usuarioId)) {
      setUsuarioId(usuarios[0].id);
    }
  }, [hydrated, usuarios, usuarioId, setUsuarioId]);

  const atual = usuarios?.find((u) => u.id === usuarioId);

  return (
    <>
      <Pressable style={styles.trigger} onPress={() => setOpen(true)}>
        <Ionicons name="person-circle-outline" size={18} color={colors.primaryText} />
        <Txt style={styles.triggerText} numberOfLines={1}>
          {atual?.nome ?? "Selecionar usuário"}
        </Txt>
        <Ionicons name="chevron-down" size={16} color={colors.primaryText} />
      </Pressable>

      <Modal
        visible={open}
        transparent
        animationType="fade"
        onRequestClose={() => setOpen(false)}
      >
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)}>
          <Pressable style={styles.sheet} onPress={() => {}}>
            <Txt variant="subtitle" style={styles.sheetTitle}>
              Usuário
            </Txt>
            <FlatList
              data={usuarios ?? []}
              keyExtractor={(u) => u.id}
              ItemSeparatorComponent={() => <View style={styles.sep} />}
              renderItem={({ item }) => {
                const selected = item.id === usuarioId;
                return (
                  <Pressable
                    style={styles.option}
                    onPress={() => {
                      setUsuarioId(item.id);
                      setOpen(false);
                    }}
                  >
                    <Txt style={selected ? styles.optionSelected : undefined}>
                      {item.nome}
                    </Txt>
                    {selected ? (
                      <Ionicons
                        name="checkmark"
                        size={18}
                        color={colors.primary}
                      />
                    ) : null}
                  </Pressable>
                );
              }}
              ListEmptyComponent={
                <Txt variant="muted">Nenhum usuário cadastrado.</Txt>
              }
            />
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  trigger: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    backgroundColor: colors.primarySoft,
    borderRadius: radius.pill,
    paddingVertical: 6,
    paddingHorizontal: spacing.md,
    maxWidth: 220,
  },
  triggerText: {
    color: colors.primaryText,
    fontWeight: "600",
    fontSize: 13,
    flexShrink: 1,
  },
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
    maxHeight: "60%",
  },
  sheetTitle: { marginBottom: spacing.md },
  option: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: spacing.md,
  },
  optionSelected: { fontWeight: "700", color: colors.primaryText },
  sep: { height: StyleSheet.hairlineWidth, backgroundColor: colors.border },
});
