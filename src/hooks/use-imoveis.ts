
import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "@/lib/toast";

import { ApiError, imoveisApi } from "@/lib/api";
import type { ImovelRequest, UUID } from "@/lib/types";
import { MSG_IMOVEL_COM_CONTRATO } from "@/lib/vinculos";

export const imoveisKeys = {
  all: ["imoveis"] as const,
  detail: (id: UUID) => ["imoveis", id] as const,
};

export function useImoveis() {
  return useQuery({ queryKey: imoveisKeys.all, queryFn: imoveisApi.listar });
}

export function useImovel(id: UUID | undefined) {
  return useQuery({
    queryKey: id ? imoveisKeys.detail(id) : imoveisKeys.all,
    queryFn: () => imoveisApi.buscarPorId(id as UUID),
    enabled: Boolean(id),
  });
}

function errorMessage(error: unknown, fallback: string) {
  return error instanceof ApiError ? error.message : fallback;
}

/** Erro de integridade referencial (imóvel vinculado a contrato). */
function isConflitoDeVinculo(error: unknown) {
  if (!(error instanceof ApiError)) return false;
  if (error.status === 409) return true;
  const texto = `${error.message} ${JSON.stringify(error.body ?? "")}`.toLowerCase();
  return (
    error.status >= 500 &&
    /constraint|foreign key|integrity|viola|referen/.test(texto)
  );
}

export function useSalvarImovel(id?: UUID) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: ImovelRequest) =>
      id ? imoveisApi.atualizar(id, body) : imoveisApi.criar(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: imoveisKeys.all });
      queryClient.invalidateQueries({ queryKey: ["contratos"] });
      toast.success(id ? "Imóvel atualizado." : "Imóvel cadastrado.");
    },
    onError: (error) =>
      toast.error(errorMessage(error, "Não foi possível salvar o imóvel.")),
  });
}

export function useExcluirImovel() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: UUID) => imoveisApi.deletar(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: imoveisKeys.all });
      toast.success("Imóvel excluído.");
    },
    onError: (error) =>
      toast.error(
        isConflitoDeVinculo(error)
          ? MSG_IMOVEL_COM_CONTRATO
          : errorMessage(error, "Não foi possível excluir o imóvel."),
      ),
  });
}
