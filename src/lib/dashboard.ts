import type {
  ContratoResponse,
  ImovelResponse,
  PagamentoAluguelResponse,
  UUID,
} from "@/lib/types";

export interface DashboardResumo {
  totalPatrimonio: number;
  totalInvestido: number;
  valorizacao: number;
  aluguelMensal: number;
  aluguelAnual: number;
  aluguelRecebidoAcumulado: number;
  /** razão aluguel anual / patrimônio (ex.: 0.072). */
  resultadoPercentual: number | null;
  qtdImoveis: number;
  qtdImoveisAlugados: number;
  qtdContratosAtivos: number;
}

export interface PontoEvolucao {
  mes: string; // yyyy-MM
  previsto: number;
  acumulado: number;
}

export interface ResumoPagamentos {
  /** Quitados (PAGO ou PAGO_COM_ATRASO). */
  pagos: number;
  /** A vencer / parcialmente pagos e ainda no prazo. */
  pendentes: number;
  /** Vencidos e não quitados (status efetivo EM_ATRASO). */
  emAtraso: number;
  totalPrevisto: number;
  /** Soma de `valorPago` das cobranças com status PAGO, PAGO_COM_ATRASO ou PAGO_PARCIALMENTE. */
  totalRecebido: number;
  /** Saldo em aberto das cobranças em atraso. */
  totalEmAtraso: number;
  /** Total de cobranças consideradas (exclui CANCELADO). */
  quantidade: number;
}

/**
 * Consolida os pagamentos de aluguel para o quadro do dashboard.
 * Usa `statusEfetivo` (a API já converte PENDENTE/PARCIAL vencido em EM_ATRASO).
 * `contratosPermitidos`, quando informado, restringe aos contratos do usuário
 * selecionado (os pagamentos só trazem `contratoId`).
 */
export function calcularResumoPagamentos(
  pagamentos: PagamentoAluguelResponse[],
  contratosPermitidos?: Set<UUID>,
): ResumoPagamentos {
  const resumo: ResumoPagamentos = {
    pagos: 0,
    pendentes: 0,
    emAtraso: 0,
    totalPrevisto: 0,
    totalRecebido: 0,
    totalEmAtraso: 0,
    quantidade: 0,
  };

  for (const pagamento of pagamentos) {
    if (
      contratosPermitidos &&
      (pagamento.contratoId == null ||
        !contratosPermitidos.has(pagamento.contratoId))
    ) {
      continue;
    }

    const status = pagamento.statusEfetivo ?? pagamento.status;
    if (status === "CANCELADO") continue;

    const previsto = Number(pagamento.valorPrevisto ?? 0);
    const recebido = Number(pagamento.valorPago ?? 0);
    const saldo = Number(
      pagamento.saldo ?? Math.max(previsto - recebido, 0),
    );
    // "Recebido" conta apenas onde um pagamento foi efetivamente registrado
    // (status persistido), independente de estar vencido.
    const foiPago =
      pagamento.status === "PAGO" ||
      pagamento.status === "PAGO_COM_ATRASO" ||
      pagamento.status === "PAGO_PARCIALMENTE";

    resumo.quantidade += 1;
    resumo.totalPrevisto += previsto;
    if (foiPago) resumo.totalRecebido += recebido;

    if (status === "PAGO" || status === "PAGO_COM_ATRASO") {
      resumo.pagos += 1;
    } else if (status === "EM_ATRASO") {
      resumo.emAtraso += 1;
      resumo.totalEmAtraso += Math.max(saldo, 0);
    } else {
      // PENDENTE, PAGO_PARCIALMENTE (ainda no prazo)
      resumo.pendentes += 1;
    }
  }

  return resumo;
}

export type AlertaSeveridade = "info" | "warning" | "danger";

export interface Alerta {
  id: string;
  severidade: AlertaSeveridade;
  titulo: string;
  descricao: string;
}

function monthKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function parseDate(value: string | null | undefined): Date | null {
  if (!value) return null;
  const d = new Date(value.length <= 10 ? `${value}T00:00:00` : value);
  return Number.isNaN(d.getTime()) ? null : d;
}

function monthsBetween(start: Date, end: Date): number {
  return (
    (end.getFullYear() - start.getFullYear()) * 12 +
    (end.getMonth() - start.getMonth())
  );
}

/** Filtra imóveis/contratos pertencentes a um usuário (ou todos se usuarioId indefinido). */
export function filtrarPorUsuario(
  imoveis: ImovelResponse[],
  contratos: ContratoResponse[],
  usuarioId?: UUID,
) {
  const imoveisUsuario = usuarioId
    ? imoveis.filter((i) => i.usuario?.id === usuarioId)
    : imoveis;
  const idsImoveis = new Set(imoveisUsuario.map((i) => i.id));
  const contratosUsuario = usuarioId
    ? contratos.filter(
        (c) => c.imovel != null && idsImoveis.has(c.imovel.id),
      )
    : contratos;
  return { imoveisUsuario, contratosUsuario };
}

export function calcularResumo(
  imoveis: ImovelResponse[],
  contratos: ContratoResponse[],
  hoje = new Date(),
): DashboardResumo {
  const totalPatrimonio = imoveis.reduce(
    (acc, i) => acc + Number(i.valorAtual ?? 0),
    0,
  );
  const totalInvestido = imoveis.reduce(
    (acc, i) => acc + Number(i.valorAquisicao ?? 0),
    0,
  );

  const contratosAtivos = contratos.filter((c) => c.status === "ATIVO");
  const aluguelMensal = contratosAtivos.reduce(
    (acc, c) => acc + Number(c.valorAluguel ?? 0),
    0,
  );
  const aluguelAnual = aluguelMensal * 12;

  const aluguelRecebidoAcumulado = contratos
    .filter((c) => c.status === "ATIVO" || c.status === "ENCERRADO")
    .reduce((acc, c) => {
      const inicio = parseDate(c.dataInicio);
      if (!inicio) return acc;
      const fim = parseDate(c.dataFim) ?? hoje;
      const limite = fim.getTime() < hoje.getTime() ? fim : hoje;
      const meses = Math.max(0, monthsBetween(inicio, limite));
      return acc + meses * Number(c.valorAluguel ?? 0);
    }, 0);

  return {
    totalPatrimonio,
    totalInvestido,
    valorizacao: totalPatrimonio - totalInvestido,
    aluguelMensal,
    aluguelAnual,
    aluguelRecebidoAcumulado,
    resultadoPercentual:
      totalPatrimonio > 0 ? aluguelAnual / totalPatrimonio : null,
    qtdImoveis: imoveis.length,
    qtdImoveisAlugados: imoveis.filter((i) => i.status === "ALUGADO").length,
    qtdContratosAtivos: contratosAtivos.length,
  };
}

/** Série dos últimos `meses` meses: aluguel previsto por mês + acumulado. */
export function calcularEvolucao(
  contratos: ContratoResponse[],
  meses = 12,
  hoje = new Date(),
): PontoEvolucao[] {
  const pontos: PontoEvolucao[] = [];
  let acumulado = 0;

  for (let offset = meses - 1; offset >= 0; offset--) {
    const ref = new Date(hoje.getFullYear(), hoje.getMonth() - offset, 1);
    const inicioMes = new Date(ref.getFullYear(), ref.getMonth(), 1);
    const fimMes = new Date(ref.getFullYear(), ref.getMonth() + 1, 0);

    const previsto = contratos
      .filter((c) => c.status === "ATIVO" || c.status === "ENCERRADO")
      .reduce((acc, c) => {
        const inicio = parseDate(c.dataInicio);
        if (!inicio || inicio > fimMes) return acc;
        const fim = parseDate(c.dataFim);
        if (fim && fim < inicioMes) return acc;
        return acc + Number(c.valorAluguel ?? 0);
      }, 0);

    acumulado += previsto;
    pontos.push({ mes: monthKey(ref), previsto, acumulado });
  }

  return pontos;
}

export function gerarAlertas(
  imoveis: ImovelResponse[],
  contratos: ContratoResponse[],
  hoje = new Date(),
): Alerta[] {
  const alertas: Alerta[] = [];
  const em60Dias = new Date(hoje.getTime() + 60 * 24 * 60 * 60 * 1000);
  const em30Dias = new Date(hoje.getTime() + 30 * 24 * 60 * 60 * 1000);

  if (imoveis.length === 0) {
    alertas.push({
      id: "sem-imoveis",
      severidade: "info",
      titulo: "Nenhum imóvel cadastrado",
      descricao: "Cadastre seu primeiro imóvel para começar a acompanhar o patrimônio.",
    });
  }

  for (const contrato of contratos) {
    if (contrato.status !== "ATIVO") continue;
    const nomeImovel = contrato.imovel?.nome ?? "Imóvel";
    const fim = parseDate(contrato.dataFim);
    if (fim) {
      if (fim < hoje) {
        alertas.push({
          id: `contrato-vencido-${contrato.id}`,
          severidade: "danger",
          titulo: `Contrato vencido — ${nomeImovel}`,
          descricao: `O contrato encerrou em ${fim.toLocaleDateString("pt-BR")} e ainda consta como ativo.`,
        });
      } else if (fim <= em60Dias) {
        alertas.push({
          id: `contrato-vence-${contrato.id}`,
          severidade: "warning",
          titulo: `Contrato próximo do vencimento — ${nomeImovel}`,
          descricao: `Vence em ${fim.toLocaleDateString("pt-BR")}. Avalie renovação ou reajuste.`,
        });
      }
    }

    const inicio = parseDate(contrato.dataInicio);
    if (
      inicio &&
      contrato.periodoReajuste &&
      contrato.indiceReajuste &&
      contrato.indiceReajuste !== "SEM_REAJUSTE"
    ) {
      const proximoReajuste = new Date(inicio);
      while (proximoReajuste <= hoje) {
        proximoReajuste.setMonth(
          proximoReajuste.getMonth() + contrato.periodoReajuste,
        );
      }
      if (proximoReajuste <= em30Dias) {
        alertas.push({
          id: `reajuste-${contrato.id}`,
          severidade: "info",
          titulo: `Reajuste previsto — ${nomeImovel}`,
          descricao: `Reajuste (${contrato.indiceReajuste}) em ${proximoReajuste.toLocaleDateString("pt-BR")}.`,
        });
      }
    }
  }

  const idsImoveisComContratoAtivo = new Set(
    contratos
      .filter((c) => c.status === "ATIVO" && c.imovel)
      .map((c) => c.imovel!.id),
  );

  for (const imovel of imoveis) {
    if (imovel.status === "DISPONIVEL") {
      alertas.push({
        id: `imovel-disponivel-${imovel.id}`,
        severidade: "warning",
        titulo: `Imóvel disponível — ${imovel.nome}`,
        descricao: "Sem contrato ativo. Potencial de receita não aproveitado.",
      });
    } else if (
      imovel.status === "ALUGADO" &&
      !idsImoveisComContratoAtivo.has(imovel.id)
    ) {
      alertas.push({
        id: `imovel-inconsistente-${imovel.id}`,
        severidade: "danger",
        titulo: `Inconsistência — ${imovel.nome}`,
        descricao: "Marcado como alugado, mas não há contrato ativo vinculado.",
      });
    }
  }

  const ordem: Record<AlertaSeveridade, number> = {
    danger: 0,
    warning: 1,
    info: 2,
  };
  return alertas.sort((a, b) => ordem[a.severidade] - ordem[b.severidade]);
}
