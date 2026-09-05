
import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "@/lib/toast";

import { usuariosApi } from "@/lib/api";
import { ApiError } from "@/lib/api";
import type { UUID, UsuarioRequest } from "@/lib/types";

export const usuariosKeys = {
  all: ["usuarios"] as const,
  detail: (id: UUID) => ["usuarios", id] as const,
};

export function useUsuarios() {
  return useQuery({
    queryKey: usuariosKeys.all,
    queryFn: usuariosApi.listar,
  });
}

export function useUsuario(id: UUID | undefined) {
  return useQuery({
    queryKey: id ? usuariosKeys.detail(id) : usuariosKeys.all,
    queryFn: () => usuariosApi.buscarPorId(id as UUID),
    enabled: Boolean(id),
  });
}

function errorMessage(error: unknown, fallback: string) {
  return error instanceof ApiError ? error.message : fallback;
}

export function useSalvarUsuario(id?: UUID) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: UsuarioRequest) =>
      id ? usuariosApi.atualizar(id, body) : usuariosApi.criar(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: usuariosKeys.all });
      toast.success(id ? "Usuário atualizado." : "Usuário cadastrado.");
    },
    onError: (error) =>
      toast.error(errorMessage(error, "Não foi possível salvar o usuário.")),
  });
}

export function useExcluirUsuario() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: UUID) => usuariosApi.deletar(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: usuariosKeys.all });
      toast.success("Usuário excluído.");
    },
    onError: (error) =>
      toast.error(errorMessage(error, "Não foi possível excluir o usuário.")),
  });
}
