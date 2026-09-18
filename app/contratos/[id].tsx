import * as React from "react";
import { View } from "react-native";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";

import { useContrato } from "@/hooks/use-contratos";
import { spacing } from "@/lib/theme";
import { Screen } from "@/components/ui/Screen";
import { Button } from "@/components/ui/Button";
import { ErrorState, LoadingState } from "@/components/ui/states";
import { ContratoForm } from "@/components/forms/ContratoForm";

export default function ContratoDetalheScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
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
        <>
          <View
            style={{
              flexDirection: "row",
              gap: spacing.sm,
              marginBottom: spacing.lg,
            }}
          >
            <Button
              title="Aluguéis em atraso"
              variant="outline"
              size="sm"
              style={{ flex: 1 }}
              onPress={() =>
                router.push({
                  pathname: "/pagamentos-contrato",
                  params: { contratoId: id, atraso: "1" },
                })
              }
            />
            <Button
              title="Todos aluguéis"
              variant="outline"
              size="sm"
              style={{ flex: 1 }}
              onPress={() =>
                router.push({
                  pathname: "/pagamentos-contrato",
                  params: { contratoId: id },
                })
              }
            />
          </View>
          <ContratoForm contrato={data} />
        </>
      )}
    </Screen>
  );
}
