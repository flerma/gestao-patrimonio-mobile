import * as React from "react";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";

import { useExcluirInquilino, useInquilino } from "@/hooks/use-inquilinos";
import { useContratos } from "@/hooks/use-contratos";
import {
  MSG_INQUILINO_COM_CONTRATO,
  contarContratosDoInquilino,
} from "@/lib/vinculos";
import { Screen } from "@/components/ui/Screen";
import { ErrorState, LoadingState } from "@/components/ui/states";
import { InquilinoForm } from "@/components/forms/InquilinoForm";
import { DeleteHeaderButton } from "@/components/DeleteHeaderButton";
import { ConfirmDelete } from "@/components/ConfirmDelete";

export default function InquilinoDetalheScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { data, isLoading, error, refetch } = useInquilino(id);
  const { data: contratos, isLoading: contratosLoading } = useContratos();
  const excluir = useExcluirInquilino();
  const [confirmOpen, setConfirmOpen] = React.useState(false);

  const blockedReason = contratosLoading
    ? "Aguarde o carregamento dos contratos…"
    : data && contarContratosDoInquilino(contratos, data.id) > 0
      ? MSG_INQUILINO_COM_CONTRATO
      : null;

  return (
    <Screen>
      <Stack.Screen
        options={{
          title: data?.nome ?? "Inquilino",
          headerRight: data
            ? () => <DeleteHeaderButton onPress={() => setConfirmOpen(true)} />
            : undefined,
        }}
      />
      {isLoading ? (
        <LoadingState />
      ) : error || !data ? (
        <ErrorState error={error} onRetry={refetch} />
      ) : (
        <InquilinoForm inquilino={data} />
      )}

      <ConfirmDelete
        visible={confirmOpen}
        itemLabel={data?.nome ?? ""}
        blockedReason={blockedReason}
        deleting={excluir.isPending}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={() => {
          if (data) {
            excluir.mutate(data.id, { onSuccess: () => router.back() });
          }
          setConfirmOpen(false);
        }}
      />
    </Screen>
  );
}
