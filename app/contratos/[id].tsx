import * as React from "react";
import { Stack, useLocalSearchParams } from "expo-router";

import { useContrato } from "@/hooks/use-contratos";
import { Screen } from "@/components/ui/Screen";
import { ErrorState, LoadingState } from "@/components/ui/states";
import { ContratoForm } from "@/components/forms/ContratoForm";

export default function ContratoDetalheScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data, isLoading, error, refetch } = useContrato(id);

  return (
    <Screen>
      <Stack.Screen
        options={{
          title: data ? `Contrato · ${data.imovel?.nome ?? "Imóvel"}` : "Contrato",
        }}
      />
      {isLoading ? (
        <LoadingState />
      ) : error || !data ? (
        <ErrorState error={error} onRetry={refetch} />
      ) : (
        <ContratoForm contrato={data} />
      )}
    </Screen>
  );
}
