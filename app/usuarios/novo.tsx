import * as React from "react";
import { Screen } from "@/components/ui/Screen";
import { LoadingState } from "@/components/ui/states";
import { UsuarioForm } from "@/components/forms/UsuarioForm";
import { useExigirAdmin } from "@/hooks/use-exigir-admin";

export default function NovoUsuarioScreen() {
  const autorizado = useExigirAdmin();

  return (
    <Screen>
      {autorizado ? <UsuarioForm /> : <LoadingState />}
    </Screen>
  );
}
