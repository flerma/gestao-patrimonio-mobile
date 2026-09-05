import * as React from "react";
import { View } from "react-native";
import { useRouter } from "expo-router";

import {
  useExcluirInquilino,
  useInquilinos,
} from "@/hooks/use-inquilinos";
import { useContratos } from "@/hooks/use-contratos";
import { statusInquilinoLabels, statusInquilinoTone, tipoPessoaLabels } from "@/lib/labels";
import {
  MSG_INQUILINO_COM_CONTRATO,
  contarContratosDoInquilino,
} from "@/lib/vinculos";
import { spacing } from "@/lib/theme";
import type { InquilinoResponse } from "@/lib/types";
import { Screen } from "@/components/ui/Screen";
import { SearchBar } from "@/components/ui/SearchBar";
import { Txt } from "@/components/ui/Txt";
import { EmptyState, ErrorState, LoadingState } from "@/components/ui/states";
import { EntityRow } from "@/components/EntityRow";
import { Fab } from "@/components/Fab";
import { ConfirmDelete } from "@/components/ConfirmDelete";

export default function InquilinosScreen() {
  const router = useRouter();
  const { data, isLoading, error, refetch, isRefetching } = useInquilinos();
  const { data: contratos, isLoading: contratosLoading } = useContratos();
  const excluir = useExcluirInquilino();
  const [busca, setBusca] = React.useState("");
  const [alvo, setAlvo] = React.useState<InquilinoResponse | null>(null);

  const filtrados = React.useMemo(() => {
    const termo = busca.trim().toLowerCase();
    const lista = data ?? [];
    if (!termo) return lista;
    return lista.filter((i) =>
      [
        i.nome,
        i.documento,
        i.email,
        i.telefone,
        i.endereco?.cidade,
        i.endereco?.estado,
      ]
        .filter(Boolean)
        .some((c) => c!.toLowerCase().includes(termo)),
    );
  }, [data, busca]);

  const blockedReason = alvo
    ? contratosLoading
      ? "Aguarde o carregamento dos contratos…"
      : contarContratosDoInquilino(contratos, alvo.id) > 0
        ? MSG_INQUILINO_COM_CONTRATO
        : null
    : null;

  return (
    <View style={{ flex: 1 }}>
      <Screen refreshing={isRefetching} onRefresh={refetch}>
        <SearchBar
          value={busca}
          onChangeText={setBusca}
          placeholder="Buscar por nome, documento, cidade…"
        />
        {data ? (
          <Txt variant="muted" style={{ marginVertical: spacing.sm }}>
            {filtrados.length} de {data.length} inquilino(s)
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
                ? "Nenhum inquilino encontrado"
                : "Nenhum inquilino cadastrado"
            }
            actionLabel="Cadastrar inquilino"
            onAction={() => router.push("/inquilinos/novo")}
          />
        ) : (
          <View style={{ gap: spacing.sm }}>
            {filtrados.map((inq) => (
              <EntityRow
                key={inq.id}
                title={inq.nome}
                lines={[
                  `${tipoPessoaLabels[inq.tipoPessoa]} · ${inq.documento}`,
                  inq.email ||
                    inq.telefone ||
                    [inq.endereco?.cidade, inq.endereco?.estado]
                      .filter(Boolean)
                      .join(" / "),
                ]}
                badge={{
                  label: statusInquilinoLabels[inq.status],
                  tone: statusInquilinoTone[inq.status],
                }}
                onPress={() => router.push(`/inquilinos/${inq.id}`)}
                onDelete={() => setAlvo(inq)}
              />
            ))}
          </View>
        )}
      </Screen>
      <Fab onPress={() => router.push("/inquilinos/novo")} />

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
