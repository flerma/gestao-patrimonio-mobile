import * as React from "react";
import { Pressable, View } from "react-native";
import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import { colors, spacing } from "@/lib/theme";
import { useAuth } from "@/providers/auth";
import { Txt } from "@/components/ui/Txt";

function HeaderUsuario() {
  const { usuario, logout } = useAuth();
  const primeiroNome = usuario?.nome?.trim().split(/\s+/)[0] ?? "";

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: spacing.sm,
        paddingRight: spacing.md,
      }}
    >
      {primeiroNome ? <Txt variant="muted">{primeiroNome}</Txt> : null}
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Sair"
        hitSlop={8}
        onPress={() => logout()}
      >
        <Ionicons name="log-out-outline" size={20} color={colors.textMuted} />
      </Pressable>
    </View>
  );
}

export default function TabsLayout() {
  const { usuario } = useAuth();
  const isAdmin = usuario?.role === "ADMIN";

  return (
    <Tabs
      screenOptions={{
        headerShadowVisible: false,
        headerStyle: { backgroundColor: colors.surface },
        headerTintColor: colors.text,
        headerTitleStyle: { fontWeight: "700" },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: { backgroundColor: colors.surface, borderTopColor: colors.border },
        headerRight: () => <HeaderUsuario />,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Painel",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="grid-outline" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="imoveis"
        options={{
          title: "Imóveis",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="business-outline" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="inquilinos"
        options={{
          title: "Inquilinos",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="people-outline" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="contratos"
        options={{
          title: "Contratos",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="document-text-outline" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="usuarios"
        options={{
          title: "Usuários",
          // Gestão de usuários é exclusiva de ADMIN (o backend também bloqueia
          // /api/usuarios/** para quem não tem essa role) — href: null tira a
          // aba da tab bar sem remover a rota do arquivo.
          href: isAdmin ? undefined : null,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-outline" color={color} size={size} />
          ),
        }}
      />
    </Tabs>
  );
}
