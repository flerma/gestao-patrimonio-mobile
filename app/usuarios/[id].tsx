import * as React from "react";
import { Stack, useLocalSearchParams } from "expo-router";

import { useUsuario } from "@/hooks/use-usuarios";
import { useExigirAdmin } from "@/hooks/use-exigir-admin";
import { Screen } from "@/components/ui/Screen";
import { ErrorState, LoadingState } from "@/components/ui/states";
import { UsuarioForm } from "@/components/forms/UsuarioForm";

export default function UsuarioDetalheScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const autorizado = useExigirAdmin();
  const { data, isLoading, error, refetch } = useUsuario(id);

  return (
    <Screen>
      <Stack.Screen options={{ title: data?.nome ?? "Usuário" }} />
      {!autorizado ? (
        <LoadingState />
      ) : isLoading ? (
        <LoadingState />
      ) : error || !data ? (
        <ErrorState error={error} onRetry={refetch} />
      ) : (
        <UsuarioForm usuario={data} />
      )}
    </Screen>
  );
}
