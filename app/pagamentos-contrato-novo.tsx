import * as React from "react";
import { useLocalSearchParams } from "expo-router";

import { Screen } from "@/components/ui/Screen";
import { EmptyState } from "@/components/ui/states";
import { PagamentoAluguelForm } from "@/components/forms/PagamentoAluguelForm";

export default function NovoPagamentoAluguelScreen() {
  const { contratoId } = useLocalSearchParams<{ contratoId: string }>();

  return (
    <Screen>
      {contratoId ? (
        <PagamentoAluguelForm contratoId={contratoId} />
      ) : (
        <EmptyState
          title="Nenhum contrato informado"
          description="Acesse esta tela a partir da página de um contrato."
        />
      )}
    </Screen>
  );
}
