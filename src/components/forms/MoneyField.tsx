import * as React from "react";
import { TextInput } from "react-native";
import {
  Controller,
  type Control,
  type FieldPath,
  type FieldValues,
} from "react-hook-form";

import { colors, radius, spacing } from "@/lib/theme";
import { formatMoneyValue, maskMoney, parseMoneyMask } from "@/lib/money";
import { Field } from "./fields";

function MoneyInput({
  value,
  onChange,
  onBlur,
  hasError,
}: {
  value: number | undefined;
  onChange: (value: number | undefined) => void;
  onBlur: () => void;
  hasError: boolean;
}) {
  const [display, setDisplay] = React.useState(() => formatMoneyValue(value));
  const [ultimoValor, setUltimoValor] = React.useState(value);

  // Ressincroniza durante a renderização (sem efeito) quando o valor muda
  // por outro motivo que não a digitação aqui — ex.: reset do formulário ao
  // carregar um registro para edição.
  if (value !== ultimoValor && parseMoneyMask(display) !== value) {
    setUltimoValor(value);
    setDisplay(formatMoneyValue(value));
  }

  return (
    <TextInput
      style={{
        minHeight: 46,
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: hasError ? colors.danger : colors.border,
        borderRadius: radius.sm,
        paddingHorizontal: spacing.md,
        fontSize: 15,
        color: colors.text,
      }}
      value={display}
      onChangeText={(text) => {
        const masked = maskMoney(text);
        setDisplay(masked);
        onChange(parseMoneyMask(masked));
      }}
      onBlur={onBlur}
      placeholder="0,00"
      placeholderTextColor={colors.textFaint}
      keyboardType="decimal-pad"
    />
  );
}

export function MoneyField<T extends FieldValues>({
  control,
  name,
  label,
}: {
  control: Control<T>;
  name: FieldPath<T>;
  label: string;
}) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <Field label={label} error={fieldState.error?.message}>
          <MoneyInput
            value={field.value}
            onChange={field.onChange}
            onBlur={field.onBlur}
            hasError={Boolean(fieldState.error)}
          />
        </Field>
      )}
    />
  );
}
