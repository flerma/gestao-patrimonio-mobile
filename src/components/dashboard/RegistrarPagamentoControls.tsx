import * as React from "react";
import { Modal, Platform, Pressable, StyleSheet, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import DateTimePicker from "@react-native-community/datetimepicker";

import { colors, radius, spacing } from "@/lib/theme";
import { formatDate } from "@/lib/format";
import { formaPagamentoLabels } from "@/lib/labels";
import {
  FORMA_PAGAMENTO,
  type FormaPagamento,
  type PagamentoAluguelResponse,
  type UUID,
} from "@/lib/types";
import { useRegistrarPagamentoAluguel } from "@/hooks/use-pagamentos-aluguel";
import { toast } from "@/lib/toast";
import { Txt } from "@/components/ui/Txt";
import { Button } from "@/components/ui/Button";

function hojeIso() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate(),
  ).padStart(2, "0")}`;
}

/**
 * Ação de pagamento de um item da tela de aluguéis em atraso: o ícone verde
 * abre um modal para confirmar data e forma de pagamento. Ao salvar, o
 * registro é quitado (status PAGO) e sai da lista de atrasados.
 */
export function RegistrarPagamentoControls({
  pagamento,
  onRegistrado,
}: {
  pagamento: PagamentoAluguelResponse;
  onRegistrado: (id: UUID) => void;
}) {
  const registrar = useRegistrarPagamentoAluguel();
  const [open, setOpen] = React.useState(false);
  const [abrirData, setAbrirData] = React.useState(false);
  const [dataPagamento, setDataPagamento] = React.useState(hojeIso());
  const [formaPagamento, setFormaPagamento] = React.useState<
    FormaPagamento | ""
  >("");

  const salvar = () => {
    if (!dataPagamento || !formaPagamento) {
      toast.error("Preencha a data e a forma de pagamento.");
      return;
    }
    registrar.mutate(
      { id: pagamento.id, body: { dataPagamento, formaPagamento } },
      {
        onSuccess: () => {
          onRegistrado(pagamento.id);
          setOpen(false);
        },
      },
    );
  };

  return (
    <View style={styles.linha}>
      <Pressable
        onPress={() => setOpen(true)}
        hitSlop={8}
        accessibilityRole="button"
        accessibilityLabel="Marcar como pago"
      >
        <Ionicons
          name="checkmark-circle-outline"
          size={24}
          color={colors.success}
        />
      </Pressable>

      <Modal
        visible={open}
        transparent
        animationType="fade"
        onRequestClose={() => setOpen(false)}
      >
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)}>
          <Pressable style={styles.sheet} onPress={() => {}}>
            <Txt variant="subtitle" style={{ marginBottom: spacing.md }}>
              Marcar aluguel como pago
            </Txt>

            <Txt variant="label">Data de pagamento</Txt>
            <Pressable
              style={styles.dataBtn}
              onPress={() => setAbrirData(true)}
            >
              <Txt
                style={{
                  color: dataPagamento ? colors.text : colors.textFaint,
                }}
              >
                {dataPagamento ? formatDate(dataPagamento) : "dd/mm/aaaa"}
              </Txt>
            </Pressable>
            {abrirData ? (
              <DateTimePicker
                value={
                  dataPagamento
                    ? new Date(`${dataPagamento}T00:00:00`)
                    : new Date()
                }
                mode="date"
                display={Platform.OS === "ios" ? "inline" : "default"}
                onValueChange={(_event, date) => {
                  setAbrirData(false);
                  if (date) {
                    setDataPagamento(
                      `${date.getFullYear()}-${String(
                        date.getMonth() + 1,
                      ).padStart(2, "0")}-${String(date.getDate()).padStart(
                        2,
                        "0",
                      )}`,
                    );
                  }
                }}
                onDismiss={() => setAbrirData(false)}
              />
            ) : null}

            <Txt variant="label" style={{ marginTop: spacing.md }}>
              Forma de pagamento
            </Txt>
            <View style={styles.pickerWrap}>
              <Picker
                selectedValue={formaPagamento}
                onValueChange={(v) =>
                  setFormaPagamento(v as FormaPagamento | "")
                }
                dropdownIconColor={colors.textMuted}
                style={styles.picker}
              >
                <Picker.Item
                  label="Selecione"
                  value=""
                  color={colors.textFaint}
                />
                {FORMA_PAGAMENTO.map((forma) => (
                  <Picker.Item
                    key={forma}
                    label={formaPagamentoLabels[forma]}
                    value={forma}
                  />
                ))}
              </Picker>
            </View>

            <View style={styles.acoes}>
              <Button
                title="Cancelar"
                variant="outline"
                onPress={() => setOpen(false)}
                style={{ flex: 1 }}
              />
              <Button
                title={registrar.isPending ? "Salvando…" : "Marcar como pago"}
                loading={registrar.isPending}
                onPress={salvar}
                style={{ flex: 1 }}
              />
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  linha: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    padding: spacing.lg,
  },
  dataBtn: {
    minHeight: 46,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    justifyContent: "center",
    marginTop: spacing.xs,
  },
  pickerWrap: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    overflow: "hidden",
    marginTop: spacing.xs,
  },
  picker: { color: colors.text },
  acoes: { flexDirection: "row", gap: spacing.sm, marginTop: spacing.lg },
});
