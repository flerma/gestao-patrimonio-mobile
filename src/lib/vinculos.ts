import type { ContratoResponse, UUID } from "@/lib/types";

export const MSG_IMOVEL_COM_CONTRATO =
  "Não é possível excluir o imóvel. O imóvel está associado a um contrato.";

export const MSG_INQUILINO_COM_CONTRATO =
  "Não é possível excluir o inquilino. O inquilino está associado a um contrato.";

export function contarContratosDoImovel(
  contratos: ContratoResponse[] | undefined,
  imovelId: UUID,
): number {
  return (contratos ?? []).filter((c) => c.imovel?.id === imovelId).length;
}

export function contarContratosDoInquilino(
  contratos: ContratoResponse[] | undefined,
  inquilinoId: UUID,
): number {
  return (contratos ?? []).filter((c) => c.inquilino?.id === inquilinoId)
    .length;
}
