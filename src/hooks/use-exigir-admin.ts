import * as React from "react";
import { useRouter } from "expo-router";

import { useAuth } from "@/providers/auth";

/**
 * Gestão de usuários é exclusiva de ADMIN (o backend também bloqueia
 * `/api/usuarios/**` para quem não tem essa role — ver SecurityConfig). Isso
 * aqui é defesa extra para acesso direto às telas (a aba já fica escondida em
 * `app/(tabs)/_layout.tsx`): redireciona quem não é admin e evita mostrar o
 * conteúdo antes do redirecionamento.
 */
export function useExigirAdmin(): boolean {
  const { usuario, carregando } = useAuth();
  const router = useRouter();
  const autorizado = usuario?.role === "ADMIN";

  React.useEffect(() => {
    if (!carregando && usuario && !autorizado) {
      router.replace("/(tabs)");
    }
  }, [carregando, usuario, autorizado, router]);

  return autorizado;
}
