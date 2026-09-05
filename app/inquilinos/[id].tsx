import * as React from "react";
import { Stack, useLocalSearchParams } from "expo-router";

import { useInquilino } from "@/hooks/use-inquilinos";
import { Screen } from "@/components/ui/Screen";
import { ErrorState, LoadingState } from "@/components/ui/states";
import { InquilinoForm } from "@/components/forms/InquilinoForm";

export default function InquilinoDetalheScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data, isLoading, error, refetch } = useInquilino(id);

  return (
    <Screen>
      <Stack.Screen options={{ title: data?.nome ?? "Inquilino" }} />
      {isLoading ? (
        <LoadingState />
      ) : error || !data ? (
        <ErrorState error={error} onRetry={refetch} />
      ) : (
        <InquilinoForm inquilino={data} />
      )}
    </Screen>
  );
}
