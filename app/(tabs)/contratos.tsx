import * as React from "react";
import { View } from "react-native";
import { useRouter } from "expo-router";

import { useContratos, useExcluirContrato } from "@/hooks/use-contratos";
import { formatCurrency, formatDate } from "@/lib/format";
import {
  statusContratoLabels,
  statusContratoTone,
  tipoContratoLabels,
} from "@/lib/labels";
import { spacing } from "@/lib/theme";
import type { ContratoResponse } from "@/lib/types";
import { Screen } from "@/components/ui/Screen";
import { SearchBar } from "@/components/ui/SearchBar";
import { Txt } from "@/components/ui/Txt";
import { EmptyState, ErrorState, LoadingState } from "@/components/ui/states";
import { EntityRow } from "@/components/EntityRow";
import { Fab } from "@/components/Fab";
import { ConfirmDelete } from "@/components/ConfirmDelete";

export default function ContratosScreen() {
  const router = useRouter();
  const { data, isLoading, error, refetch, isRefetching } = useContratos();
  const excluir = useExcluirContrato();
  const [busca, setBusca] = React.useState("");
  const [alvo, setAlvo] = React.useState<ContratoResponse | null>(null);

  const filtrados = React.useMemo(() => {
    const termo = busca.trim().toLowerCase();
    const lista = data ?? [];
    if (!termo) return lista;
    return lista.filter((c) =>
      [
        c.imovel?.nome,
        c.inquilino?.nome,
        tipoContratoLabels[c.tipo],
        statusContratoLabels[c.status],
      ]
        .filter(Boolean)
        .some((v) => v!.toLowerCase().includes(termo)),
    );
  }, [data, busca]);

  return (
    <View style={{ flex: 1 }}>
      <Screen refreshing={isRefetching} onRefresh={refetch}>
        <SearchBar
          value={busca}
          onChangeText={setBusca}
          placeholder="Buscar por imóvel, inquilino, status…"
        />
        {data ? (
          <Txt variant="muted" style={{ marginVertical: spacing.sm }}>
            {filtrados.length} de {data.length} contrato(s)
          </Txt>
        ) : null}

        {isLoading ? (
          <LoadingState />
        ) : error ? (
          <ErrorState error={error} onRetry={refetch} />
        ) : filtrados.length === 0 ? (
          <EmptyState
            title={
              data && data.length > 0
                ? "Nenhum contrato encontrado"
                : "Nenhum contrato cadastrado"
            }
            actionLabel="Cadastrar contrato"
            onAction={() => router.push("/contratos/novo")}
          />
        ) : (
          <View style={{ gap: spacing.sm }}>
            {filtrados.map((c) => (
              <EntityRow
                key={c.id}
                title={c.imovel?.nome ?? "—"}
                lines={[
                  c.inquilino?.nome ?? "—",
                  `${formatDate(c.dataInicio)} — ${
                    c.dataFim ? formatDate(c.dataFim) : "indeterminado"
                  }`,
                ]}
                badge={{
                  label: statusContratoLabels[c.status],
                  tone: statusContratoTone[c.status],
                }}
                rightText={`${formatCurrency(c.valorAluguel)}/mês`}
                onPress={() => router.push(`/contratos/${c.id}`)}
                onDelete={() => setAlvo(c)}
              />
            ))}
          </View>
        )}
      </Screen>
      <Fab onPress={() => router.push("/contratos/novo")} />

      <ConfirmDelete
        visible={Boolean(alvo)}
        itemLabel={
          alvo ? `contrato de ${alvo.imovel?.nome ?? "imóvel"}` : ""
        }
        deleting={excluir.isPending}
        onCancel={() => setAlvo(null)}
        onConfirm={() => {
          if (alvo) excluir.mutate(alvo.id);
          setAlvo(null);
        }}
      />
    </View>
  );
}
