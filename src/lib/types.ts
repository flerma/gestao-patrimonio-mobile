// Tipos espelhando os DTOs da API gestao-patrimonio-imobiliario (Spring Boot).

export type UUID = string;
/** LocalDate serializado como "yyyy-MM-dd". */
export type IsoDate = string;
/** LocalDateTime serializado como "yyyy-MM-ddTHH:mm:ss". */
export type IsoDateTime = string;
/** YearMonth serializado como "yyyy-MM". */
export type IsoYearMonth = string;

// ---------- Enums ----------
export const PROVEDOR_AUTENTICACAO = ["LOCAL", "GOOGLE", "FACEBOOK"] as const;
export type ProvedorAutenticacao = (typeof PROVEDOR_AUTENTICACAO)[number];

export const STATUS_USUARIO = ["ATIVO", "INATIVO"] as const;
export type StatusUsuario = (typeof STATUS_USUARIO)[number];

export const TIPO_IMOVEL = [
  "CASA",
  "APARTAMENTO",
  "SALA_COMERCIAL",
  "LOJA",
  "GALPAO",
  "TERRENO",
  "SITIO",
  "FAZENDA",
  "KITNET",
  "GARAGEM",
  "OUTRO",
] as const;
export type TipoImovel = (typeof TIPO_IMOVEL)[number];

export const STATUS_IMOVEL = [
  "ALUGADO",
  "DISPONIVEL",
  "OCUPADO_PELO_PROPRIETARIO",
] as const;
export type StatusImovel = (typeof STATUS_IMOVEL)[number];

export const TIPO_PESSOA = ["FISICA", "JURIDICA"] as const;
export type TipoPessoa = (typeof TIPO_PESSOA)[number];

export const STATUS_INQUILINO = ["ATIVO", "INATIVO"] as const;
export type StatusInquilino = (typeof STATUS_INQUILINO)[number];

export const TIPO_CONTRATO = [
  "RESIDENCIAL",
  "COMERCIAL",
  "TEMPORADA",
  "ARRENDAMENTO_RURAL",
] as const;
export type TipoContrato = (typeof TIPO_CONTRATO)[number];

export const STATUS_CONTRATO = [
  "RASCUNHO",
  "ATIVO",
  "ENCERRADO",
  "RESCINDIDO",
] as const;
export type StatusContrato = (typeof STATUS_CONTRATO)[number];

export const INDICE_REAJUSTE = [
  "IPCA",
  "IGP_M",
  "INPC",
  "FIXO",
  "SEM_REAJUSTE",
] as const;
export type IndiceReajuste = (typeof INDICE_REAJUSTE)[number];

export const TIPO_GARANTIA = [
  "SEM_GARANTIA",
  "CAUCAO",
  "FIADOR",
  "SEGURO_FIANCA",
  "TITULO_CAPITALIZACAO",
  "OUTRA",
] as const;
export type TipoGarantia = (typeof TIPO_GARANTIA)[number];

export const STATUS_PAGAMENTO_ALUGUEL = [
  "PENDENTE",
  "PAGO",
  "PAGO_COM_ATRASO",
  "PAGO_PARCIALMENTE",
  "EM_ATRASO",
  "CANCELADO",
] as const;
export type StatusPagamentoAluguel = (typeof STATUS_PAGAMENTO_ALUGUEL)[number];

export const FORMA_PAGAMENTO = [
  "PIX",
  "TRANSFERENCIA",
  "BOLETO",
  "DINHEIRO",
  "CARTAO",
  "CHEQUE",
  "OUTRA",
] as const;
export type FormaPagamento = (typeof FORMA_PAGAMENTO)[number];

// ---------- Endereço ----------
export interface Endereco {
  cep?: string | null;
  logradouro?: string | null;
  numero?: string | null;
  complemento?: string | null;
  bairro?: string | null;
  cidade?: string | null;
  estado?: string | null;
  pais?: string | null;
}

// ---------- Usuário ----------
export interface UsuarioResponse {
  id: UUID;
  nome: string;
  email: string;
  provedorAutenticacao: ProvedorAutenticacao;
  idUsuarioProvedor?: string | null;
  status: StatusUsuario;
  dataCriacao: IsoDateTime;
  dataAtualizacao: IsoDateTime;
}

export interface UsuarioRequest {
  nome: string;
  email: string;
  provedorAutenticacao: ProvedorAutenticacao;
  idUsuarioProvedor?: string | null;
  status?: StatusUsuario | null;
}

// ---------- Imóvel ----------
export interface ImovelResponse {
  id: UUID;
  usuario: UsuarioResponse | null;
  nome: string;
  tipo: TipoImovel;
  status: StatusImovel;
  valorAquisicao: number;
  valorAtual: number;
  endereco: Endereco | null;
  dataCriacao: IsoDateTime;
  dataAtualizacao: IsoDateTime;
}

export interface ImovelRequest {
  usuarioId: UUID;
  nome: string;
  tipo: TipoImovel;
  status: StatusImovel;
  valorAquisicao: number;
  valorAtual: number;
  endereco: Endereco;
}

// ---------- Inquilino ----------
export interface InquilinoResponse {
  id: UUID;
  tipoPessoa: TipoPessoa;
  nome: string;
  documento: string;
  email?: string | null;
  telefone?: string | null;
  dataNascimento?: IsoDate | null;
  endereco?: Endereco | null;
  observacoes?: string | null;
  status: StatusInquilino;
  dataCriacao: IsoDateTime;
  dataAtualizacao: IsoDateTime;
}

export interface InquilinoRequest {
  tipoPessoa: TipoPessoa;
  nome: string;
  documento: string;
  email?: string | null;
  telefone?: string | null;
  dataNascimento?: IsoDate | null;
  endereco?: Endereco | null;
  observacoes?: string | null;
  status?: StatusInquilino | null;
}

// ---------- Contrato ----------
export interface ContratoResponse {
  id: UUID;
  imovel: ImovelResponse | null;
  inquilino: InquilinoResponse | null;
  tipo: TipoContrato;
  status: StatusContrato;
  dataInicio: IsoDate;
  dataFim?: IsoDate | null;
  valorAluguel: number;
  diaVencimento: number;
  indiceReajuste?: IndiceReajuste | null;
  percentualReajuste?: number | null;
  periodoReajuste?: number | null;
  tipoGarantia?: TipoGarantia | null;
  valorGarantia?: number | null;
  observacoes?: string | null;
  dataCriacao: IsoDateTime;
  dataAtualizacao: IsoDateTime;
}

export interface ContratoRequest {
  imovelId: UUID;
  inquilinoId: UUID;
  tipo: TipoContrato;
  status?: StatusContrato | null;
  dataInicio: IsoDate;
  dataFim?: IsoDate | null;
  valorAluguel: number;
  diaVencimento: number;
  indiceReajuste?: IndiceReajuste | null;
  percentualReajuste?: number | null;
  periodoReajuste?: number | null;
  tipoGarantia?: TipoGarantia | null;
  valorGarantia?: number | null;
  observacoes?: string | null;
}

// ---------- Pagamento de aluguel ----------
export interface PagamentoAluguelResponse {
  id: UUID;
  contratoId: UUID | null;
  competencia: IsoYearMonth;
  dataVencimento: IsoDate;
  valorPrevisto: number;
  valorPago?: number | null;
  dataPagamento?: IsoDate | null;
  /** Status persistido. */
  status: StatusPagamentoAluguel;
  /** Status "real" na data de hoje (PENDENTE vencido vira EM_ATRASO). */
  statusEfetivo: StatusPagamentoAluguel;
  emAtraso: boolean;
  /** valorPrevisto - valorPago (positivo => ainda há valor em aberto). */
  saldo: number;
  formaPagamento?: FormaPagamento | null;
  observacoes?: string | null;
  dataCriacao: IsoDateTime;
  dataAtualizacao: IsoDateTime;
}

export interface PagamentoAluguelRequest {
  contratoId: UUID;
  competencia: IsoYearMonth;
  dataVencimento: IsoDate;
  valorPrevisto: number;
  valorPago?: number | null;
  dataPagamento?: IsoDate | null;
  status?: StatusPagamentoAluguel | null;
  formaPagamento?: FormaPagamento | null;
  observacoes?: string | null;
}

export interface RegistrarPagamentoRequest {
  valorPago: number;
  dataPagamento?: IsoDate | null;
  formaPagamento?: FormaPagamento | null;
  observacoes?: string | null;
}
