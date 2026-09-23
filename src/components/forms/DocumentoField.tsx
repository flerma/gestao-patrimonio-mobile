import * as React from "react";
import { TextInput } from "react-native";
import {
  Controller,
  type Control,
  type FieldPath,
  type FieldValues,
} from "react-hook-form";

import { colors, radius, spacing } from "@/lib/theme";
import { maskCnpj, maskCpf } from "@/lib/documento";
import { Field } from "./fields";

export function DocumentoField<T extends FieldValues>({
  control,
  name,
  pessoaFisica,
}: {
  control: Control<T>;
  name: FieldPath<T>;
  pessoaFisica: boolean;
}) {
  const label = pessoaFisica ? "CPF" : "CNPJ";
  const placeholder = pessoaFisica ? "000.000.000-00" : "00.000.000/0000-00";

  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <Field label={label} error={fieldState.error?.message}>
          <TextInput
            style={{
              minHeight: 46,
              backgroundColor: colors.surface,
              borderWidth: 1,
              borderColor: fieldState.error ? colors.danger : colors.border,
              borderRadius: radius.sm,
              paddingHorizontal: spacing.md,
              fontSize: 15,
              color: colors.text,
            }}
            value={field.value ?? ""}
            onChangeText={(text) =>
              field.onChange(pessoaFisica ? maskCpf(text) : maskCnpj(text))
            }
            onBlur={field.onBlur}
            placeholder={placeholder}
            placeholderTextColor={colors.textFaint}
            autoCapitalize="characters"
            keyboardType={pessoaFisica ? "numeric" : "default"}
          />
        </Field>
      )}
    />
  );
}
