/** ...comentários no topo... (mantidos para te servir de “aula”) */
export interface ApiResponse<T> { success: boolean; message: string; data: T; }

/* ===== Enums de negócio ===== */
export enum TipoOperacao { ENTRADA = 'ENTRADA', SAIDA = 'SAIDA' }
export enum TipoEntrada { COMPRA='COMPRA', TRANSFERENCIA='TRANSFERENCIA', AJUSTE='AJUSTE', DEVOLUCAO_USUARIO='DEVOLUCAO_USUARIO', OUTRAS='OUTRAS' }
export enum TipoSaida { USUARIO='USUARIO', CONSUMO_PROPRIO='CONSUMO_PROPRIO', AJUSTE='AJUSTE', TRANSFERENCIA='TRANSFERENCIA', OUTRAS='OUTRAS', PROFISSIONAL='PROFISSIONAL' }
export enum TipoControleEstoque { NAO='NAO', QUANTIDADE='QUANTIDADE', VENCIMENTO='VENCIMENTO', LOTE='LOTE' }
export enum PoliticaCodigoSequencial { NAO='NAO', POR_LOTE='POR_LOTE', POR_FABRICANTE='POR_FABRICANTE' }
export enum GeracaoEntradaTransferencia { NAO_GERAR='NAO_GERAR', AO_TRANSFERIR='AO_TRANSFERIR', AO_CONFIRMAR='AO_CONFIRMAR' }
export enum StatusTransferencia { PENDENTE='PENDENTE', PARCIAL='PARCIAL', CANCELADA='CANCELADA', RECEBIDA='RECEBIDA' }

/* ===== Entidades simplificadas ===== */
export interface LocalArmazenamento {
    id: number; nome: string; unidadeSaudeId: number;
    politicaCodigoSequencial: PoliticaCodigoSequencial;
    geracaoEntradaTransferencia: GeracaoEntradaTransferencia;
    usaCodigoBarrasPorLote: boolean; ativo: boolean;
}
export interface Operacao {
    id: number; descricao: string; tipo: TipoOperacao;
    tipoEntrada?: TipoEntrada; tipoSaida?: TipoSaida; exigeProfissional?: boolean;
}
export interface Insumo {
    id: number; descricao: string; apresentacao?: string; dosagem?: string;
    descricaoCompleta?: string; unidadeMedida?: string; controleEstoque: TipoControleEstoque;
    diasAlertaVencimento?: number; codigoBarrasPadrao?: string; ativo: boolean;
}
export interface Fabricante { id: number; razaoSocial: string; }
export interface Fornecedor { id: number; razaoSocial: string; cnpj?: string; }
export interface Lote {
    id: number; insumo: Insumo; fabricante?: Fabricante; loteFabricante: string;
    codigoBarras?: string; dataVencimento?: string; localizacaoFisica?: string;
}

/* ===== Consultas ===== */
export interface SaldoPorLoteDTO {
    loteId: number; insumoId: number; insumoDescricao: string;
    loteFabricante: string; codigoBarras?: string; dataVencimento?: string; saldo: number;
}

/* ===== Movimentações ===== */
// ENTRADA
export interface EntradaItemDTO {
    insumoId: number; fabricanteId?: number; loteFabricante?: string; codigoBarras?: string;
    dataVencimento?: string; quantidade: number; valorUnitario?: number; localizacaoFisica?: string;
}
export interface EntradaDTO { localId: number; operacaoId: number; observacao?: string; itens: EntradaItemDTO[]; }

// SAÍDA
export interface SaidaItemDTO { loteId: number; quantidade: number; }
export interface SaidaDTO {
    localId: number; operacaoId: number; tipoSaida: TipoSaida;
    pacienteId?: number; profissionalId?: number; setorConsumo?: string; observacao?: string;
    itens: SaidaItemDTO[];
}

// TRANSFERÊNCIA
export interface TransferenciaItemDTO { loteId: number; quantidade: number; }
export interface TransferenciaDTO {
    unidadeOrigemId: number; localOrigemId: number; unidadeDestinoId: number; localDestinoId: number;
    observacoes?: string; itens: TransferenciaItemDTO[];
}
export interface AceiteTransferenciaItemDTO { transferenciaItemId: number; quantidadeRecebida: number; }
export interface AceiteTransferenciaDTO { transferenciaId: number; itens: AceiteTransferenciaItemDTO[]; }
