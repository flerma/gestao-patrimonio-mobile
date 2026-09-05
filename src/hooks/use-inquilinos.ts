
import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "@/lib/toast";

import { ApiError, inquilinosApi } from "@/lib/api";
import type { InquilinoRequest, UUID } from "@/lib/types";
import { MSG_INQUILINO_COM_CONTRATO } from "@/lib/vinculos";

export const inquilinosKeys = {
  all: ["inquilinos"] as const,
  detail: (id: UUID) => ["inquilinos", id] as const,
};

export function useInquilinos() {
  return useQuery({
    queryKey: inquilinosKeys.all,
    queryFn: inquilinosApi.listar,
  });
}

export function useInquilino(id: UUID | undefined) {
  return useQuery({
    queryKey: id ? inquilinosKeys.detail(id) : inquilinosKeys.all,
    queryFn: () => inquilinosApi.buscarPorId(id as UUID),
    enabled: Boolean(id),
  });
}

function errorMessage(error: unknown, fallback: string) {
  return error instanceof ApiError ? error.message : fallback;
}

/** Erro de integridade referencial (inquilino vinculado a contrato). */
function isConflitoDeVinculo(error: unknown) {
  if (!(error instanceof ApiError)) return false;
  if (error.status === 409) return true;
  const texto = `${error.message} ${JSON.stringify(error.body ?? "")}`.toLowerCase();
  return (
    error.status >= 500 &&
    /constraint|foreign key|integrity|viola|referen/.test(texto)
  );
}

export function useSalvarInquilino(id?: UUID) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: InquilinoRequest) =>
      id ? inquilinosApi.atualizar(id, body) : inquilinosApi.criar(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: inquilinosKeys.all });
      queryClient.invalidateQueries({ queryKey: ["contratos"] });
      toast.success(id ? "Inquilino atualizado." : "Inquilino cadastrado.");
    },
    onError: (error) =>
      toast.error(errorMessage(error, "Não foi possível salvar o inquilino.")),
  });
}

export function useExcluirInquilino() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: UUID) => inquilinosApi.deletar(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: inquilinosKeys.all });
      toast.success("Inquilino excluído.");
    },
    onError: (error) =>
      toast.error(
        isConflitoDeVinculo(error)
          ? MSG_INQUILINO_COM_CONTRATO
          : errorMessage(error, "Não foi possível excluir o inquilino."),
      ),
  });
}
