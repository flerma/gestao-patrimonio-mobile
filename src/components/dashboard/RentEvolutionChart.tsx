import * as React from "react";
import { StyleSheet, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Svg, {
  Circle,
  Line,
  Polyline,
  Rect,
  Text as SvgText,
} from "react-native-svg";

import type { PontoEvolucao } from "@/lib/dashboard";
import {
  formatCompactCurrency,
  formatCurrency,
  formatMonthLabel,
} from "@/lib/format";
import { colors, radius, spacing } from "@/lib/theme";
import { Txt } from "@/components/ui/Txt";

const HEIGHT = 200;
const PADDING = { top: 12, right: 8, bottom: 26, left: 52 };
const TOOLTIP_W = 190;

export function RentEvolutionChart({ data }: { data: PontoEvolucao[] }) {
  const [width, setWidth] = React.useState(0);

  const innerW = Math.max(0, width - PADDING.left - PADDING.right);
  const innerH = HEIGHT - PADDING.top - PADDING.bottom;

  const max = Math.max(
    1,
    ...data.map((d) => Math.max(d.previsto, d.acumulado)),
  );
  const stepX = data.length > 0 ? innerW / data.length : 0;
  const barW = Math.min(18, stepX * 0.55);

  const y = (v: number) => PADDING.top + innerH - (v / max) * innerH;
  const xCenter = (i: number) => PADDING.left + stepX * i + stepX / 2;

  const linePoints = data
    .map((d, i) => `${xCenter(i)},${y(d.acumulado)}`)
    .join(" ");

  const gridValues = [0, 0.5, 1].map((f) => f * max);

  // Equivalente ao <Tooltip> do Recharts no frontend: toque ou arraste na
  // horizontal para ver os valores do mês sob o dedo. O arraste só ativa
  // com movimento horizontal, deixando a rolagem vertical da tela livre.
  const [selected, setSelected] = React.useState<number | null>(null);

  React.useEffect(() => setSelected(null), [data]);

  const select = React.useCallback(
    (touchX: number) => {
      if (data.length === 0 || stepX <= 0) return;
      const i = Math.floor((touchX - PADDING.left) / stepX);
      setSelected(Math.min(data.length - 1, Math.max(0, i)));
    },
    [data.length, stepX],
  );

  const gesture = React.useMemo(() => {
    const pan = Gesture.Pan()
      .runOnJS(true)
      .activeOffsetX([-8, 8])
      .failOffsetY([-12, 12])
      .onBegin((e) => select(e.x))
      .onUpdate((e) => select(e.x));
    const tap = Gesture.Tap()
      .runOnJS(true)
      .onEnd((e) => select(e.x));
    return Gesture.Exclusive(pan, tap);
  }, [select]);

  const ponto = selected !== null ? data[selected] : null;
  const tooltipLeft =
    selected !== null
      ? Math.min(
          Math.max(0, xCenter(selected) - TOOLTIP_W / 2),
          Math.max(0, width - TOOLTIP_W),
        )
      : 0;

  return (
    <View onLayout={(e) => setWidth(e.nativeEvent.layout.width)}>
      {width > 0 ? (
        <GestureDetector gesture={gesture}>
          <View>
            <Svg width={width} height={HEIGHT}>
              {gridValues.map((gv, i) => (
                <React.Fragment key={i}>
                  <Line
                    x1={PADDING.left}
                    x2={width - PADDING.right}
                    y1={y(gv)}
                    y2={y(gv)}
                    stroke={colors.border}
                    strokeWidth={1}
                  />
                  <SvgText
                    x={PADDING.left - 6}
                    y={y(gv) + 4}
                    fontSize={10}
                    fill={colors.textMuted}
                    textAnchor="end"
                  >
                    {formatCompactCurrency(gv)}
                  </SvgText>
                </React.Fragment>
              ))}

              {data.map((d, i) => (
                <Rect
                  key={`bar-${i}`}
                  x={xCenter(i) - barW / 2}
                  y={y(d.previsto)}
                  width={barW}
                  height={Math.max(0, PADDING.top + innerH - y(d.previsto))}
                  rx={3}
                  fill={colors.chart1}
                  opacity={0.85}
                />
              ))}

              <Polyline
                points={linePoints}
                fill="none"
                stroke={colors.chart2}
                strokeWidth={2}
              />

              {data.map((d, i) =>
                i % 2 === 0 ? (
                  <SvgText
                    key={`lbl-${i}`}
                    x={xCenter(i)}
                    y={HEIGHT - 8}
                    fontSize={10}
                    fill={colors.textMuted}
                    textAnchor="middle"
                  >
                    {formatMonthLabel(d.mes)}
                  </SvgText>
                ) : null,
              )}

              {ponto && selected !== null ? (
                <>
                  <Line
                    x1={xCenter(selected)}
                    x2={xCenter(selected)}
                    y1={PADDING.top}
                    y2={PADDING.top + innerH}
                    stroke={colors.textFaint}
                    strokeWidth={1}
                    strokeDasharray="3 3"
                  />
                  <Circle
                    cx={xCenter(selected)}
                    cy={y(ponto.acumulado)}
                    r={4}
                    fill={colors.surface}
                    stroke={colors.chart2}
                    strokeWidth={2}
                  />
                </>
              ) : null}
            </Svg>

            {ponto ? (
              <View
                pointerEvents="none"
                style={[styles.tooltip, { left: tooltipLeft }]}
              >
                <Txt style={styles.tooltipTitle}>
                  Mês: {formatMonthLabel(ponto.mes)}
                </Txt>
                <View style={styles.tooltipRow}>
                  <View
                    style={[styles.swatch, { backgroundColor: colors.chart1 }]}
                  />
                  <Txt style={styles.tooltipText}>
                    Aluguel no mês: {formatCurrency(ponto.previsto)}
                  </Txt>
                </View>
                <View style={styles.tooltipRow}>
                  <View
                    style={[styles.swatch, { backgroundColor: colors.chart2 }]}
                  />
                  <Txt style={styles.tooltipText}>
                    Acumulado: {formatCurrency(ponto.acumulado)}
                  </Txt>
                </View>
              </View>
            ) : null}
          </View>
        </GestureDetector>
      ) : (
        <View style={{ height: HEIGHT }} />
      )}

      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.swatch, { backgroundColor: colors.chart1 }]} />
          <Txt variant="muted">Aluguel no mês</Txt>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.swatch, { backgroundColor: colors.chart2 }]} />
          <Txt variant="muted">Acumulado</Txt>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  legend: {
    flexDirection: "row",
    gap: spacing.lg,
    marginTop: spacing.sm,
  },
  legendItem: { flexDirection: "row", alignItems: "center", gap: spacing.xs },
  swatch: { width: 10, height: 10, borderRadius: 3 },
  tooltip: {
    position: "absolute",
    top: 0,
    width: TOOLTIP_W,
    padding: spacing.sm,
    gap: 2,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  tooltipTitle: { fontSize: 12, fontWeight: "600", color: colors.text },
  tooltipRow: { flexDirection: "row", alignItems: "center", gap: spacing.xs },
  tooltipText: { fontSize: 12, color: colors.text },
});
