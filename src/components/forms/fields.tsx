import * as React from "react";
import {
  Platform,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import {
  Controller,
  type Control,
  type FieldPath,
  type FieldValues,
} from "react-hook-form";
import { Picker } from "@react-native-picker/picker";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Ionicons } from "@expo/vector-icons";

import { colors, radius, spacing } from "@/lib/theme";
import { formatDate } from "@/lib/format";
import { Txt } from "@/components/ui/Txt";

export function Field({
  label,
  error,
  hint,
  children,
}: {
  label: string;
  error?: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.field}>
      <Txt variant="label">{label}</Txt>
      {children}
      {hint && !error ? <Txt variant="muted">{hint}</Txt> : null}
      {error ? (
        <Txt variant="muted" style={styles.error}>
          {error}
        </Txt>
      ) : null}
    </View>
  );
}

interface BaseProps<T extends FieldValues> {
  control: Control<T>;
  name: FieldPath<T>;
  label: string;
  placeholder?: string;
  hint?: string;
}

export function TextField<T extends FieldValues>({
  control,
  name,
  label,
  placeholder,
  hint,
  keyboardType,
  autoCapitalize = "sentences",
  numeric,
}: BaseProps<T> & {
  keyboardType?: "default" | "email-address" | "numeric" | "phone-pad";
  autoCapitalize?: "none" | "sentences" | "words";
  numeric?: boolean;
}) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <Field label={label} error={fieldState.error?.message} hint={hint}>
          <TextInput
            style={[styles.input, fieldState.error && styles.inputError]}
            value={field.value == null ? "" : String(field.value)}
            onChangeText={(text) => {
              if (numeric) {
                const clean = text.replace(/[^0-9.,]/g, "").replace(",", ".");
                field.onChange(clean === "" ? undefined : Number(clean));
              } else {
                field.onChange(text);
              }
            }}
            onBlur={field.onBlur}
            placeholder={placeholder}
            placeholderTextColor={colors.textFaint}
            keyboardType={numeric ? "numeric" : keyboardType}
            autoCapitalize={autoCapitalize}
          />
        </Field>
      )}
    />
  );
}

export function TextAreaField<T extends FieldValues>({
  control,
  name,
  label,
  placeholder,
}: BaseProps<T>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <Field label={label} error={fieldState.error?.message}>
          <TextInput
            style={[styles.input, styles.textarea]}
            value={field.value ?? ""}
            onChangeText={field.onChange}
            onBlur={field.onBlur}
            placeholder={placeholder}
            placeholderTextColor={colors.textFaint}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </Field>
      )}
    />
  );
}

export interface Option {
  value: string;
  label: string;
}

export function SelectField<T extends FieldValues>({
  control,
  name,
  label,
  options,
  placeholder = "Selecione…",
  hint,
}: BaseProps<T> & { options: Option[] }) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <Field label={label} error={fieldState.error?.message} hint={hint}>
          <View style={[styles.input, styles.pickerWrap, fieldState.error && styles.inputError]}>
            <Picker
              selectedValue={field.value ?? ""}
              onValueChange={(v) => field.onChange(v === "" ? undefined : v)}
              dropdownIconColor={colors.textMuted}
              style={styles.picker}
            >
              <Picker.Item label={placeholder} value="" color={colors.textFaint} />
              {options.map((o) => (
                <Picker.Item key={o.value} label={o.label} value={o.value} />
              ))}
            </Picker>
          </View>
        </Field>
      )}
    />
  );
}

export function DateField<T extends FieldValues>({
  control,
  name,
  label,
  hint,
}: BaseProps<T>) {
  const [open, setOpen] = React.useState(false);
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => {
        const current = field.value ? new Date(`${field.value}T00:00:00`) : new Date();
        return (
          <Field label={label} error={fieldState.error?.message} hint={hint}>
            <Pressable
              style={[styles.input, styles.dateRow, fieldState.error && styles.inputError]}
              onPress={() => setOpen(true)}
            >
              <Txt style={{ color: field.value ? colors.text : colors.textFaint }}>
                {field.value ? formatDate(field.value) : "dd/mm/aaaa"}
              </Txt>
              <View style={styles.dateActions}>
                {field.value ? (
                  <Pressable onPress={() => field.onChange(undefined)} hitSlop={8}>
                    <Ionicons name="close-circle" size={18} color={colors.textFaint} />
                  </Pressable>
                ) : null}
                <Ionicons name="calendar-outline" size={18} color={colors.textMuted} />
              </View>
            </Pressable>
            {open ? (
              <DateTimePicker
                value={current}
                mode="date"
                display={Platform.OS === "ios" ? "inline" : "default"}
                onValueChange={(_event, date) => {
                  setOpen(false);
                  if (date) {
                    const iso = `${date.getFullYear()}-${String(
                      date.getMonth() + 1,
                    ).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
                    field.onChange(iso);
                  }
                }}
                onDismiss={() => setOpen(false)}
              />
            ) : null}
          </Field>
        );
      }}
    />
  );
}

const styles = StyleSheet.create({
  field: { gap: spacing.xs },
  input: {
    minHeight: 46,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
    fontSize: 15,
    color: colors.text,
    justifyContent: "center",
  },
  inputError: { borderColor: colors.danger },
  textarea: { minHeight: 96, paddingTop: spacing.sm },
  error: { color: colors.danger },
  pickerWrap: { paddingHorizontal: 0, paddingVertical: 0, overflow: "hidden" },
  picker: { color: colors.text },
  dateRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  dateActions: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
});
