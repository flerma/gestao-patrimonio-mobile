import * as React from "react";
import { ActivityIndicator, StyleSheet, TextInput, View } from "react-native";
import {
  Controller,
  type Control,
  type FieldPath,
  type FieldValues,
} from "react-hook-form";
import { Ionicons } from "@expo/vector-icons";

import { ApiError, enderecosApi } from "@/lib/api";
import type { Endereco } from "@/lib/types";
import { colors, radius, spacing } from "@/lib/theme";
import { Field } from "./fields";
import { Txt } from "@/components/ui/Txt";

function maskCep(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 8);
  return digits.length > 5 ? `${digits.slice(0, 5)}-${digits.slice(5)}` : digits;
}

type Status = "idle" | "loading" | "ok" | "error";

export function CepField<T extends FieldValues>({
  control,
  name,
  label = "CEP",
  onResolved,
}: {
  control: Control<T>;
  name: FieldPath<T>;
  label?: string;
  onResolved: (endereco: Endereco) => void;
}) {
  const [status, setStatus] = React.useState<Status>("idle");
  const [mensagem, setMensagem] = React.useState<string | null>(null);
  const ultimoRef = React.useRef("");
  const debounceRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const onResolvedRef = React.useRef(onResolved);

  React.useEffect(() => {
    onResolvedRef.current = onResolved;
  }, [onResolved]);

  React.useEffect(
    () => () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    },
    [],
  );

  const consultar = React.useCallback((raw: string) => {
    const digitos = raw.replace(/\D/g, "");
    if (digitos.length !== 8 || digitos === ultimoRef.current) return;
    ultimoRef.current = digitos;
    setStatus("loading");
    setMensagem(null);
    enderecosApi
      .buscarPorCep(digitos)
      .then((endereco) => {
        setStatus("ok");
        onResolvedRef.current(endereco);
      })
      .catch((error: unknown) => {
        ultimoRef.current = "";
        setStatus("error");
        setMensagem(
          error instanceof ApiError && error.status === 404
            ? "CEP não encontrado. Preencha manualmente."
            : error instanceof ApiError && error.status === 400
              ? "CEP inválido."
              : "Não foi possível consultar o CEP.",
        );
      });
  }, []);

  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <Field
          label={label}
          error={fieldState.error?.message}
          hint={status === "loading" ? "Buscando endereço…" : undefined}
        >
          <View
            style={[
              styles.wrap,
              fieldState.error && { borderColor: colors.danger },
            ]}
          >
            <TextInput
              style={styles.input}
              value={field.value ?? ""}
              keyboardType="numeric"
              placeholder="00000-000"
              placeholderTextColor={colors.textFaint}
              maxLength={9}
              onChangeText={(text) => {
                const masked = maskCep(text);
                field.onChange(masked);
                if (masked.replace(/\D/g, "").length < 8) {
                  ultimoRef.current = "";
                  setStatus("idle");
                  setMensagem(null);
                }
                if (debounceRef.current) clearTimeout(debounceRef.current);
                debounceRef.current = setTimeout(() => consultar(masked), 600);
              }}
              onBlur={() => {
                field.onBlur();
                if (debounceRef.current) clearTimeout(debounceRef.current);
                consultar(field.value ?? "");
              }}
            />
            <View style={styles.icon}>
              {status === "loading" ? (
                <ActivityIndicator size="small" color={colors.textMuted} />
              ) : status === "ok" ? (
                <Ionicons name="checkmark-circle" size={18} color={colors.success} />
              ) : (
                <Ionicons name="search" size={16} color={colors.textFaint} />
              )}
            </View>
          </View>
          {mensagem ? (
            <Txt
              variant="muted"
              style={{ color: status === "error" ? colors.danger : colors.textMuted }}
            >
              {mensagem}
            </Txt>
          ) : null}
        </Field>
      )}
    />
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: 46,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
  },
  input: { flex: 1, fontSize: 15, color: colors.text },
  icon: { width: 22, alignItems: "center" },
});
