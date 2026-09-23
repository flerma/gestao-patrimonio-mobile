import * as React from "react";
import { Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { colors } from "@/lib/theme";

/** Ícone de lixeira vermelho para o headerRight das telas de cadastro/edição. */
export function DeleteHeaderButton({ onPress }: { onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      hitSlop={8}
      accessibilityRole="button"
      accessibilityLabel="Excluir"
      style={{ paddingHorizontal: 4 }}
    >
      <Ionicons name="trash-outline" size={22} color={colors.danger} />
    </Pressable>
  );
}
