import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "@/lib/toast";

import { ApiError, pagamentosAluguelApi } from "@/lib/api";
import type {
  PagamentoAluguelRequest,
  RegistrarPagamentoRequest,
  UUID,
} from "@/lib/types";

export const pagamentosAluguelKeys = {
  all: ["pagamentos-aluguel"] as const,
  list: (contratoId?: UUID) =>
    ["pagamentos-aluguel", { contratoId: contratoId ?? null }] as const,
  detail: (id: UUID) => ["pagamentos-aluguel", id] as const,
};

export function usePagamentosAluguel(contratoId?: UUID) {
  return useQuery({
    queryKey: pagamentosAluguelKeys.list(contratoId),
    queryFn: () => pagamentosAluguelApi.listar(contratoId),
  });
}

export function usePagamentoAluguel(id: UUID | undefined) {
  return useQuery({
    queryKey: id ? pagamentosAluguelKeys.detail(id) : pagamentosAluguelKeys.all,
    queryFn: () => pagamentosAluguelApi.buscarPorId(id as UUID),
    enabled: Boolean(id),
  });
}

function errorMessage(error: unknown, fallback: string) {
  return error instanceof ApiError ? error.message : fallback;
}

export function useSalvarPagamentoAluguel(id?: UUID) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: PagamentoAluguelRequest) =>
      id
        ? pagamentosAluguelApi.atualizar(id, body)
        : pagamentosAluguelApi.criar(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: pagamentosAluguelKeys.all });
      toast.success(id ? "Pagamento atualizado." : "Pagamento cadastrado.");
    },
    onError: (error) =>
      toast.error(errorMessage(error, "Não foi possível salvar o pagamento.")),
  });
}

export function useRegistrarPagamentoAluguel(id: UUID) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: RegistrarPagamentoRequest) =>
      pagamentosAluguelApi.registrarPagamento(id, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: pagamentosAluguelKeys.all });
      toast.success("Pagamento registrado.");
    },
    onError: (error) =>
      toast.error(errorMessage(error, "Não foi possível registrar o pagamento.")),
  });
}

export function useExcluirPagamentoAluguel() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: UUID) => pagamentosAluguelApi.deletar(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: pagamentosAluguelKeys.all });
      toast.success("Pagamento excluído.");
    },
    onError: (error) =>
      toast.error(errorMessage(error, "Não foi possível excluir o pagamento.")),
  });
}
