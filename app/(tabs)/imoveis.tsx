import * as React from "react";
import { View } from "react-native";
import { useRouter } from "expo-router";

import { useExcluirImovel, useImoveis } from "@/hooks/use-imoveis";
import { useContratos } from "@/hooks/use-contratos";
import { formatCurrency } from "@/lib/format";
import {
  statusImovelLabels,
  statusImovelTone,
  tipoImovelLabels,
} from "@/lib/labels";
import {
  MSG_IMOVEL_COM_CONTRATO,
  contarContratosDoImovel,
} from "@/lib/vinculos";
import { spacing } from "@/lib/theme";
import type { ImovelResponse } from "@/lib/types";
import { Screen } from "@/components/ui/Screen";
import { SearchBar } from "@/components/ui/SearchBar";
import { Txt } from "@/components/ui/Txt";
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from "@/components/ui/states";
import { EntityRow } from "@/components/EntityRow";
import { Fab } from "@/components/Fab";
import { ConfirmDelete } from "@/components/ConfirmDelete";

export default function ImoveisScreen() {
  const router = useRouter();
  const { data, isLoading, error, refetch, isRefetching } = useImoveis();
  const { data: contratos, isLoading: contratosLoading } = useContratos();
  const excluir = useExcluirImovel();
  const [busca, setBusca] = React.useState("");
  const [alvo, setAlvo] = React.useState<ImovelResponse | null>(null);

  const filtrados = React.useMemo(() => {
    const termo = busca.trim().toLowerCase();
    const lista = data ?? [];
    if (!termo) return lista;
    return lista.filter((i) =>
      [
        i.nome,
        tipoImovelLabels[i.tipo],
        i.endereco?.cidade,
        i.endereco?.estado,
        i.usuario?.nome,
      ]
        .filter(Boolean)
        .some((c) => c!.toLowerCase().includes(termo)),
    );
  }, [data, busca]);

  const blockedReason = alvo
    ? contratosLoading
      ? "Aguarde o carregamento dos contratos…"
      : contarContratosDoImovel(contratos, alvo.id) > 0
        ? MSG_IMOVEL_COM_CONTRATO
        : null
    : null;

  return (
    <View style={{ flex: 1 }}>
      <Screen refreshing={isRefetching} onRefresh={refetch}>
        <SearchBar
          value={busca}
          onChangeText={setBusca}
          placeholder="Buscar por nome, cidade, tipo…"
        />
        {data ? (
          <Txt variant="muted" style={{ marginVertical: spacing.sm }}>
            {filtrados.length} de {data.length} imóvel(is)
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
                ? "Nenhum imóvel encontrado"
                : "Nenhum imóvel cadastrado"
            }
            actionLabel="Cadastrar imóvel"
            onAction={() => router.push("/imoveis/novo")}
          />
        ) : (
          <View style={{ gap: spacing.sm }}>
            {filtrados.map((imovel) => (
              <EntityRow
                key={imovel.id}
                title={imovel.nome}
                lines={[
                  `${tipoImovelLabels[imovel.tipo]}${
                    imovel.usuario?.nome ? ` · ${imovel.usuario.nome}` : ""
                  }`,
                  [imovel.endereco?.cidade, imovel.endereco?.estado]
                    .filter(Boolean)
                    .join(" / "),
                ]}
                badge={{
                  label: statusImovelLabels[imovel.status],
                  tone: statusImovelTone[imovel.status],
                }}
                rightText={formatCurrency(imovel.valorAtual)}
                onPress={() => router.push(`/imoveis/${imovel.id}`)}
                onDelete={() => setAlvo(imovel)}
              />
            ))}
          </View>
        )}
      </Screen>
      <Fab onPress={() => router.push("/imoveis/novo")} />

      <ConfirmDelete
        visible={Boolean(alvo)}
        itemLabel={alvo?.nome ?? ""}
        blockedReason={blockedReason}
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
