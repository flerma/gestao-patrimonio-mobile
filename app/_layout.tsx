import "react-native-gesture-handler";
import * as React from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

import { AppProviders } from "@/providers";
import { colors } from "@/lib/theme";

export default function RootLayout() {
  return (
    <AppProviders>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerShadowVisible: false,
          headerStyle: { backgroundColor: colors.surface },
          headerTintColor: colors.text,
          headerTitleStyle: { fontWeight: "700" },
          contentStyle: { backgroundColor: colors.background },
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="imoveis/novo" options={{ title: "Novo imóvel" }} />
        <Stack.Screen name="imoveis/[id]" options={{ title: "Imóvel" }} />
        <Stack.Screen
          name="inquilinos/novo"
          options={{ title: "Novo inquilino" }}
        />
        <Stack.Screen name="inquilinos/[id]" options={{ title: "Inquilino" }} />
        <Stack.Screen
          name="contratos/novo"
          options={{ title: "Novo contrato" }}
        />
        <Stack.Screen name="contratos/[id]" options={{ title: "Contrato" }} />
        <Stack.Screen name="usuarios/novo" options={{ title: "Novo usuário" }} />
        <Stack.Screen name="usuarios/[id]" options={{ title: "Usuário" }} />
        <Stack.Screen name="ajustes" options={{ title: "Ajustes" }} />
      </Stack>
    </AppProviders>
  );
}
