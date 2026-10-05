import * as React from "react";
import { View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { colors } from "@/lib/theme";
import { Txt } from "@/components/ui/Txt";

/** Critérios de senha — os mesmos validados pelo backend (regex de CadastroRequest/RedefinirSenhaRequest). */
export const CRITERIOS_SENHA = [
  { label: "Pelo menos 8 caracteres", testar: (senha: string) => senha.length >= 8 },
  { label: "Uma letra maiúscula", testar: (senha: string) => /[A-Z]/.test(senha) },
  { label: "Uma letra minúscula", testar: (senha: string) => /[a-z]/.test(senha) },
  { label: "Um número", testar: (senha: string) => /[0-9]/.test(senha) },
  { label: "Um caractere especial", testar: (senha: string) => /[^A-Za-z0-9]/.test(senha) },
];

export function senhaAtendeCriterios(senha: string) {
  return CRITERIOS_SENHA.every((c) => c.testar(senha));
}

export function avaliarCriterios(senha: string, confirmarSenha: string) {
  return [
    ...CRITERIOS_SENHA.map((c) => ({ label: c.label, atendido: c.testar(senha) })),
    {
      label: "As senhas coincidem",
      atendido: senha.length > 0 && senha === confirmarSenha,
    },
  ];
}

/** Lista dos critérios, cada um verde quando cumprido e vermelho quando não. */
export function PasswordChecklist({
  senha,
  confirmarSenha,
}: {
  senha: string;
  confirmarSenha: string;
}) {
  const criterios = avaliarCriterios(senha, confirmarSenha);
  return (
    <View style={{ gap: 4 }}>
      {criterios.map((criterio) => {
        const cor = criterio.atendido ? colors.success : colors.danger;
        return (
          <View
            key={criterio.label}
            style={{ flexDirection: "row", alignItems: "center", gap: 6 }}
          >
            <Ionicons
              name={criterio.atendido ? "checkmark-circle" : "close-circle"}
              size={14}
              color={cor}
            />
            <Txt style={{ color: cor, fontSize: 13 }}>{criterio.label}</Txt>
          </View>
        );
      })}
    </View>
  );
}
