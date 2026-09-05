import type { BadgeTone } from "@/lib/theme";
import type {
  IndiceReajuste,
  ProvedorAutenticacao,
  StatusContrato,
  StatusImovel,
  StatusInquilino,
  StatusUsuario,
  TipoContrato,
  TipoGarantia,
  TipoImovel,
  TipoPessoa,
} from "@/lib/types";

export const tipoImovelLabels: Record<TipoImovel, string> = {
  CASA: "Casa",
  APARTAMENTO: "Apartamento",
  SALA_COMERCIAL: "Sala comercial",
  LOJA: "Loja",
  GALPAO: "Galpão",
  TERRENO: "Terreno",
  SITIO: "Sítio",
  FAZENDA: "Fazenda",
  KITNET: "Kitnet",
  GARAGEM: "Garagem",
  OUTRO: "Outro",
};

export const statusImovelLabels: Record<StatusImovel, string> = {
  ALUGADO: "Alugado",
  DISPONIVEL: "Disponível",
  OCUPADO_PELO_PROPRIETARIO: "Uso próprio",
};

export const statusImovelTone: Record<StatusImovel, BadgeTone> = {
  ALUGADO: "success",
  DISPONIVEL: "warning",
  OCUPADO_PELO_PROPRIETARIO: "muted",
};

export const tipoPessoaLabels: Record<TipoPessoa, string> = {
  FISICA: "Pessoa física",
  JURIDICA: "Pessoa jurídica",
};

export const statusInquilinoLabels: Record<StatusInquilino, string> = {
  ATIVO: "Ativo",
  INATIVO: "Inativo",
};

export const statusInquilinoTone: Record<StatusInquilino, BadgeTone> = {
  ATIVO: "success",
  INATIVO: "muted",
};

export const tipoContratoLabels: Record<TipoContrato, string> = {
  RESIDENCIAL: "Residencial",
  COMERCIAL: "Comercial",
  TEMPORADA: "Temporada",
  ARRENDAMENTO_RURAL: "Arrendamento rural",
};

export const statusContratoLabels: Record<StatusContrato, string> = {
  RASCUNHO: "Rascunho",
  ATIVO: "Ativo",
  ENCERRADO: "Encerrado",
  RESCINDIDO: "Rescindido",
};

export const statusContratoTone: Record<StatusContrato, BadgeTone> = {
  RASCUNHO: "muted",
  ATIVO: "success",
  ENCERRADO: "muted",
  RESCINDIDO: "danger",
};

export const indiceReajusteLabels: Record<IndiceReajuste, string> = {
  IPCA: "IPCA",
  IGP_M: "IGP-M",
  INPC: "INPC",
  FIXO: "Percentual fixo",
  SEM_REAJUSTE: "Sem reajuste",
};

export const tipoGarantiaLabels: Record<TipoGarantia, string> = {
  SEM_GARANTIA: "Sem garantia",
  CAUCAO: "Caução",
  FIADOR: "Fiador",
  SEGURO_FIANCA: "Seguro-fiança",
  TITULO_CAPITALIZACAO: "Título de capitalização",
  OUTRA: "Outra",
};

export const provedorAutenticacaoLabels: Record<ProvedorAutenticacao, string> = {
  LOCAL: "Local",
  GOOGLE: "Google",
  FACEBOOK: "Facebook",
};

export const statusUsuarioLabels: Record<StatusUsuario, string> = {
  ATIVO: "Ativo",
  INATIVO: "Inativo",
};

export const statusUsuarioTone: Record<StatusUsuario, BadgeTone> = {
  ATIVO: "success",
  INATIVO: "muted",
};

export function enumOptions<T extends string>(
  values: readonly T[],
  labels: Record<T, string>,
): { value: T; label: string }[] {
  return values.map((value) => ({ value, label: labels[value] }));
}
