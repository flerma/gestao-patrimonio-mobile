import "react-native-gesture-handler";
import * as React from "react";
import { ActivityIndicator, View } from "react-native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

import { AppProviders } from "@/providers";
import { useAuth } from "@/providers/auth";
import { configurarHandlerNotificacoes } from "@/lib/push";
import { colors } from "@/lib/theme";

// No-op no Expo Go; ativa o handler de notificações num dev build.
configurarHandlerNotificacoes();

/**
 * Tela inicial depende do estado de autenticação: `Stack.Protected` só monta
 * as rotas do grupo cujo `guard` é verdadeiro, então um usuário deslogado
 * nunca chega a montar `(tabs)` (nem vice-versa) — sem flash da tela errada
 * e sem precisar de useEffect + router.replace.
 */
function RootNavigator() {
  const { usuario, carregando } = useAuth();

  if (carregando) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: colors.background,
        }}
      >
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  return (
    <Stack
      screenOptions={{
        headerShadowVisible: false,
        headerStyle: { backgroundColor: colors.surface },
        headerTintColor: colors.text,
        headerTitleStyle: { fontWeight: "700" },
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Protected guard={Boolean(usuario)}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="imoveis/novo" options={{ title: "Novo imóvel" }} />
        <Stack.Screen name="imoveis/[id]" options={{ title: "Imóvel" }} />
        <Stack.Screen
          name="inquilinos/novo"
          options={{ title: "Novo inquilino" }}
        />
        <Stack.Screen
          name="inquilinos/[id]"
          options={{ title: "Inquilino" }}
        />
        <Stack.Screen
          name="contratos/novo"
          options={{ title: "Novo contrato" }}
        />
        <Stack.Screen name="contratos/[id]" options={{ title: "Contrato" }} />
        <Stack.Screen
          name="usuarios/novo"
          options={{ title: "Novo usuário" }}
        />
        <Stack.Screen name="usuarios/[id]" options={{ title: "Usuário" }} />
        <Stack.Screen name="ajustes" options={{ title: "Ajustes" }} />
        <Stack.Screen
          name="alugueis-atrasados"
          options={{ title: "Aluguéis em atraso" }}
        />
        <Stack.Screen
          name="pagamentos-contrato"
          options={{ title: "Aluguéis" }}
        />
        <Stack.Screen
          name="pagamentos-contrato-novo"
          options={{ title: "Incluir aluguel" }}
        />
      </Stack.Protected>

      <Stack.Protected guard={!usuario}>
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen name="cadastro" options={{ headerShown: false }} />
      </Stack.Protected>
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <AppProviders>
      <StatusBar style="dark" />
      <RootNavigator />
    </AppProviders>
  );
}
