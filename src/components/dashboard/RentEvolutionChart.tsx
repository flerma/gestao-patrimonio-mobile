import * as React from "react";
import { StyleSheet, View } from "react-native";
import Svg, { Line, Polyline, Rect, Text as SvgText } from "react-native-svg";

import type { PontoEvolucao } from "@/lib/dashboard";
import { formatCompactCurrency, formatMonthLabel } from "@/lib/format";
import { colors, spacing } from "@/lib/theme";
import { Txt } from "@/components/ui/Txt";

const HEIGHT = 200;
const PADDING = { top: 12, right: 8, bottom: 26, left: 52 };

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

  return (
    <View onLayout={(e) => setWidth(e.nativeEvent.layout.width)}>
      {width > 0 ? (
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
        </Svg>
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
});
