
import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "@/lib/toast";

import { ApiError, contratosApi } from "@/lib/api";
import type { ContratoRequest, UUID } from "@/lib/types";

export const contratosKeys = {
  all: ["contratos"] as const,
  detail: (id: UUID) => ["contratos", id] as const,
};

export function useContratos() {
  return useQuery({
    queryKey: contratosKeys.all,
    queryFn: contratosApi.listar,
  });
}

export function useContrato(id: UUID | undefined) {
  return useQuery({
    queryKey: id ? contratosKeys.detail(id) : contratosKeys.all,
    queryFn: () => contratosApi.buscarPorId(id as UUID),
    enabled: Boolean(id),
  });
}

function errorMessage(error: unknown, fallback: string) {
  return error instanceof ApiError ? error.message : fallback;
}

export function useSalvarContrato(id?: UUID) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: ContratoRequest) =>
      id ? contratosApi.atualizar(id, body) : contratosApi.criar(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: contratosKeys.all });
      queryClient.invalidateQueries({ queryKey: ["imoveis"] });
      // criar/atualizar contrato gera/afeta as parcelas de aluguel no backend
      queryClient.invalidateQueries({ queryKey: ["pagamentos-aluguel"] });
      toast.success(id ? "Contrato atualizado." : "Contrato cadastrado.");
    },
    onError: (error) =>
      toast.error(errorMessage(error, "Não foi possível salvar o contrato.")),
  });
}

export function useExcluirContrato() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: UUID) => contratosApi.deletar(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: contratosKeys.all });
      queryClient.invalidateQueries({ queryKey: ["imoveis"] });
      // excluir contrato remove as parcelas de aluguel vinculadas no backend
      queryClient.invalidateQueries({ queryKey: ["pagamentos-aluguel"] });
      toast.success("Contrato excluído.");
    },
    onError: (error) =>
      toast.error(errorMessage(error, "Não foi possível excluir o contrato.")),
  });
}
