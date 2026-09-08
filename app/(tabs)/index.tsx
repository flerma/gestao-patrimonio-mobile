import * as React from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import { useImoveis } from "@/hooks/use-imoveis";
import { useContratos } from "@/hooks/use-contratos";
import { usePagamentosAluguel } from "@/hooks/use-pagamentos-aluguel";
import { useUsuarios } from "@/hooks/use-usuarios";
import { useSelectedUser } from "@/providers/selected-user";
import {
  calcularEvolucao,
  calcularResumo,
  calcularResumoPagamentos,
  filtrarPorUsuario,
  gerarAlertas,
} from "@/lib/dashboard";
import { formatCurrency, formatPercent } from "@/lib/format";
import {
  statusImovelLabels,
  statusImovelTone,
  tipoImovelLabels,
} from "@/lib/labels";
import { colors, spacing } from "@/lib/theme";
import { Screen } from "@/components/ui/Screen";
import { Card, CardTitle } from "@/components/ui/Card";
import { Txt } from "@/components/ui/Txt";
import { Badge } from "@/components/ui/Badge";
import { ErrorState, LoadingState } from "@/components/ui/states";
import { UserSwitcher } from "@/components/UserSwitcher";
import { StatCard } from "@/components/dashboard/StatCard";
import { RentEvolutionChart } from "@/components/dashboard/RentEvolutionChart";
import { AlertsList } from "@/components/dashboard/AlertsList";
import { RentPaymentsSummary } from "@/components/dashboard/RentPaymentsSummary";

export default function DashboardScreen() {
  const router = useRouter();
  const { usuarioId } = useSelectedUser();
  const imoveisQuery = useImoveis();
  const contratosQuery = useContratos();
  const pagamentosQuery = usePagamentosAluguel();
  const usuariosQuery = useUsuarios();

  const loading = imoveisQuery.isLoading || contratosQuery.isLoading;
  const error = imoveisQuery.error ?? contratosQuery.error;

  const dados = React.useMemo(() => {
    const { imoveisUsuario, contratosUsuario } = filtrarPorUsuario(
      imoveisQuery.data ?? [],
      contratosQuery.data ?? [],
      usuarioId ?? undefined,
    );
    const contratosPermitidos = usuarioId
      ? new Set(contratosUsuario.map((c) => c.id))
      : undefined;
    return {
      imoveisUsuario,
      contratosUsuario,
      resumo: calcularResumo(imoveisUsuario, contratosUsuario),
      resumoPagamentos: calcularResumoPagamentos(
        pagamentosQuery.data ?? [],
        contratosPermitidos,
      ),
      evolucao: calcularEvolucao(contratosUsuario, 12),
      alertas: gerarAlertas(imoveisUsuario, contratosUsuario),
    };
  }, [imoveisQuery.data, contratosQuery.data, pagamentosQuery.data, usuarioId]);

  const nomeUsuario = usuarioId
    ? usuariosQuery.data?.find((u) => u.id === usuarioId)?.nome
    : null;

  const aluguelPorImovel = React.useMemo(() => {
    const map = new Map<string, number>();
    for (const c of dados.contratosUsuario) {
      if (c.status === "ATIVO" && c.imovel) {
        map.set(
          c.imovel.id,
          (map.get(c.imovel.id) ?? 0) + Number(c.valorAluguel ?? 0),
        );
      }
    }
    return map;
  }, [dados.contratosUsuario]);

  const refreshing =
    imoveisQuery.isRefetching ||
    contratosQuery.isRefetching ||
    pagamentosQuery.isRefetching;
  const onRefresh = () => {
    imoveisQuery.refetch();
    contratosQuery.refetch();
    pagamentosQuery.refetch();
    usuariosQuery.refetch();
  };

  const { resumo } = dados;

  return (
    <Screen refreshing={refreshing} onRefresh={onRefresh}>
      <View style={styles.topRow}>
        <UserSwitcher />
        <Pressable
          style={styles.gear}
          onPress={() => router.push("/ajustes")}
          hitSlop={8}
        >
          <Ionicons name="settings-outline" size={20} color={colors.textMuted} />
        </Pressable>
      </View>
      <Txt variant="muted" style={styles.subtitle}>
        {nomeUsuario
          ? `Resumo do patrimônio de ${nomeUsuario}`
          : "Resumo consolidado do patrimônio"}
      </Txt>

      {error && !imoveisQuery.data ? (
        <ErrorState error={error} onRetry={onRefresh} />
      ) : loading && !imoveisQuery.data ? (
        <LoadingState label="Carregando patrimônio…" />
      ) : (
        <View style={{ gap: spacing.lg, marginTop: spacing.md }}>
          <View style={styles.grid}>
            <StatCard
              label="Patrimônio total"
              value={formatCurrency(resumo.totalPatrimonio)}
              hint={`${resumo.qtdImoveis} imóvel(is)`}
              icon="business"
              accent="primary"
            />
            <StatCard
              label="Aluguéis (mês)"
              value={formatCurrency(resumo.aluguelMensal)}
              hint={`${formatCurrency(resumo.aluguelAnual)} / ano`}
              icon="cash"
              accent="success"
            />
            <StatCard
              label="Resultado"
              value={formatPercent(resumo.resultadoPercentual)}
              hint="Aluguel anual ÷ patrimônio"
              icon="stats-chart"
              accent="warning"
            />
            <StatCard
              label="Recebido (acum.)"
              value={formatCurrency(dados.resumoPagamentos.totalRecebido)}
              hint="Pago, pago com atraso ou parcial"
              icon="wallet"
              accent="primary"
            />
          </View>

          <Card>
            <CardTitle>Evolução dos aluguéis</CardTitle>
            <Txt variant="muted">Previsto por mês e acumulado (12 meses)</Txt>
            <RentEvolutionChart data={dados.evolucao} />
          </Card>

          <Card>
            <CardTitle>Pagamentos de aluguel</CardTitle>
            <RentPaymentsSummary
              resumo={dados.resumoPagamentos}
              loading={pagamentosQuery.isLoading && !pagamentosQuery.data}
              error={Boolean(pagamentosQuery.error) && !pagamentosQuery.data}
            />
          </Card>

          <Card>
            <CardTitle>Alertas</CardTitle>
            <AlertsList alertas={dados.alertas} />
          </Card>

          <Card>
            <CardTitle
              right={
                <Pressable onPress={() => router.push("/imoveis")}>
                  <Txt style={{ color: colors.primary }}>Ver todos</Txt>
                </Pressable>
              }
            >
              Imóveis
            </CardTitle>
            {dados.imoveisUsuario.length === 0 ? (
              <Txt variant="muted">Nenhum imóvel para este usuário.</Txt>
            ) : (
              dados.imoveisUsuario.map((imovel) => (
                <Pressable
                  key={imovel.id}
                  style={styles.imovelRow}
                  onPress={() => router.push(`/imoveis/${imovel.id}`)}
                >
                  <View style={styles.flex}>
                    <Txt variant="subtitle" numberOfLines={1}>
                      {imovel.nome}
                    </Txt>
                    <Txt variant="muted">
                      {tipoImovelLabels[imovel.tipo]}
                      {imovel.endereco?.cidade
                        ? ` · ${imovel.endereco.cidade}`
                        : ""}
                    </Txt>
                  </View>
                  <View style={styles.imovelRight}>
                    <Badge
                      label={statusImovelLabels[imovel.status]}
                      tone={statusImovelTone[imovel.status]}
                    />
                    <Txt variant="muted">
                      {aluguelPorImovel.has(imovel.id)
                        ? `${formatCurrency(aluguelPorImovel.get(imovel.id))}/mês`
                        : formatCurrency(imovel.valorAtual)}
                    </Txt>
                  </View>
                </Pressable>
              ))
            )}
          </Card>
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  gear: { padding: 6 },
  subtitle: { marginTop: spacing.xs },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md,
  },
  imovelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  flex: { flex: 1 },
  imovelRight: { alignItems: "flex-end", gap: 4 },
});
