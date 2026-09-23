import * as React from "react";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";

import { useExcluirImovel, useImovel } from "@/hooks/use-imoveis";
import { useContratos } from "@/hooks/use-contratos";
import { MSG_IMOVEL_COM_CONTRATO, contarContratosDoImovel } from "@/lib/vinculos";
import { Screen } from "@/components/ui/Screen";
import { ErrorState, LoadingState } from "@/components/ui/states";
import { ImovelForm } from "@/components/forms/ImovelForm";
import { DeleteHeaderButton } from "@/components/DeleteHeaderButton";
import { ConfirmDelete } from "@/components/ConfirmDelete";

export default function ImovelDetalheScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { data, isLoading, error, refetch } = useImovel(id);
  const { data: contratos, isLoading: contratosLoading } = useContratos();
  const excluir = useExcluirImovel();
  const [confirmOpen, setConfirmOpen] = React.useState(false);

  const blockedReason = contratosLoading
    ? "Aguarde o carregamento dos contratos…"
    : data && contarContratosDoImovel(contratos, data.id) > 0
      ? MSG_IMOVEL_COM_CONTRATO
      : null;

  return (
    <Screen>
      <Stack.Screen
        options={{
          title: data?.nome ?? "Imóvel",
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
        <ImovelForm imovel={data} />
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
