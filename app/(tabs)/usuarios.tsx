import * as React from "react";
import { View } from "react-native";
import { useRouter } from "expo-router";

import { useExcluirUsuario, useUsuarios } from "@/hooks/use-usuarios";
import { formatDate } from "@/lib/format";
import {
  provedorAutenticacaoLabels,
  statusUsuarioLabels,
  statusUsuarioTone,
} from "@/lib/labels";
import { spacing } from "@/lib/theme";
import type { UsuarioResponse } from "@/lib/types";
import { Screen } from "@/components/ui/Screen";
import { SearchBar } from "@/components/ui/SearchBar";
import { Txt } from "@/components/ui/Txt";
import { EmptyState, ErrorState, LoadingState } from "@/components/ui/states";
import { EntityRow } from "@/components/EntityRow";
import { Fab } from "@/components/Fab";
import { ConfirmDelete } from "@/components/ConfirmDelete";

export default function UsuariosScreen() {
  const router = useRouter();
  const { data, isLoading, error, refetch, isRefetching } = useUsuarios();
  const excluir = useExcluirUsuario();
  const [busca, setBusca] = React.useState("");
  const [alvo, setAlvo] = React.useState<UsuarioResponse | null>(null);

  const filtrados = React.useMemo(() => {
    const termo = busca.trim().toLowerCase();
    const lista = data ?? [];
    if (!termo) return lista;
    return lista.filter((u) =>
      [u.nome, u.email]
        .filter(Boolean)
        .some((v) => v.toLowerCase().includes(termo)),
    );
  }, [data, busca]);

  return (
    <View style={{ flex: 1 }}>
      <Screen refreshing={isRefetching} onRefresh={refetch}>
        <SearchBar
          value={busca}
          onChangeText={setBusca}
          placeholder="Buscar por nome ou e-mail…"
        />
        {data ? (
          <Txt variant="muted" style={{ marginVertical: spacing.sm }}>
            {filtrados.length} de {data.length} usuário(s)
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
                ? "Nenhum usuário encontrado"
                : "Nenhum usuário cadastrado"
            }
            actionLabel="Cadastrar usuário"
            onAction={() => router.push("/usuarios/novo")}
          />
        ) : (
          <View style={{ gap: spacing.sm }}>
            {filtrados.map((u) => (
              <EntityRow
                key={u.id}
                title={u.nome}
                lines={[
                  u.email,
                  `${provedorAutenticacaoLabels[u.provedorAutenticacao]} · ${formatDate(
                    u.dataCriacao,
                  )}`,
                ]}
                badge={{
                  label: statusUsuarioLabels[u.status],
                  tone: statusUsuarioTone[u.status],
                }}
                onPress={() => router.push(`/usuarios/${u.id}`)}
                onDelete={() => setAlvo(u)}
              />
            ))}
          </View>
        )}
      </Screen>
      <Fab onPress={() => router.push("/usuarios/novo")} />

      <ConfirmDelete
        visible={Boolean(alvo)}
        itemLabel={alvo?.nome ?? ""}
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
