import * as React from "react";
import { Stack, useLocalSearchParams } from "expo-router";

import { useImovel } from "@/hooks/use-imoveis";
import { Screen } from "@/components/ui/Screen";
import { ErrorState, LoadingState } from "@/components/ui/states";
import { ImovelForm } from "@/components/forms/ImovelForm";

export default function ImovelDetalheScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data, isLoading, error, refetch } = useImovel(id);

  return (
    <Screen>
      <Stack.Screen options={{ title: data?.nome ?? "Imóvel" }} />
      {isLoading ? (
        <LoadingState />
      ) : error || !data ? (
        <ErrorState error={error} onRetry={refetch} />
      ) : (
        <ImovelForm imovel={data} />
      )}
    </Screen>
  );
}
