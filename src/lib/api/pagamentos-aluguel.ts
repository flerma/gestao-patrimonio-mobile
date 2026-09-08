import { apiFetch } from "./client";
import type {
  PagamentoAluguelRequest,
  PagamentoAluguelResponse,
  RegistrarPagamentoRequest,
  UUID,
} from "@/lib/types";

const BASE = "/api/pagamentos-aluguel";

export const pagamentosAluguelApi = {
  listar: (contratoId?: UUID) =>
    apiFetch<PagamentoAluguelResponse[]>(BASE, {
      query: { contratoId: contratoId ?? undefined },
    }),
  buscarPorId: (id: UUID) =>
    apiFetch<PagamentoAluguelResponse>(`${BASE}/${id}`),
  criar: (body: PagamentoAluguelRequest) =>
    apiFetch<PagamentoAluguelResponse>(BASE, { method: "POST", body }),
  atualizar: (id: UUID, body: PagamentoAluguelRequest) =>
    apiFetch<PagamentoAluguelResponse>(`${BASE}/${id}`, { method: "PUT", body }),
  registrarPagamento: (id: UUID, body: RegistrarPagamentoRequest) =>
    apiFetch<PagamentoAluguelResponse>(`${BASE}/${id}/registrar-pagamento`, {
      method: "POST",
      body,
    }),
  deletar: (id: UUID) =>
    apiFetch<void>(`${BASE}/${id}`, { method: "DELETE" }),
};
