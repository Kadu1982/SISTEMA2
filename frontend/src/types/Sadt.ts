// ✅ INTERFACE ADICIONADA PARA CORRIGIR O ERRO DE IMPORTAÇÃO
// Esta interface representa um item da lista de SADTs de um paciente.
export interface SadtDTO {
    id: number;
    numeroSadt: string;
    agendamentoId: number;
    pacienteId: number;
    dataEmissao: string; // ISO String
    tipoSadt: string;
    status: string;
    observacoes?: string;
    urgente?: boolean;
}

// ✅ INTERFACE para dados completos da SADT
export interface SadtData {
    // Dados do estabelecimento
    estabelecimento: {
        nome: string;
        cnes: string;
        endereco: string;
        telefone: string;
        municipio: string;
        uf: string;
    };

    // Dados do paciente
    paciente: {
        id: number;
        nome: string;
        cpf?: string;
        cns?: string;
        dataNascimento?: string;
        sexo?: string;
        endereco?: string;
        telefone?: string;
    };

    // Dados do solicitante
    solicitante: {
        nome: string;
        cbo: string;
        conselho: string; // CRM, CRO, etc.
        numeroConselho: string;
    };

    // Dados da solicitação
    solicitacao: {
        numero: string;
        dataEmissao: Date;
        tipoSadt: 'laboratorial' | 'imagem' | 'terapeutico';
        procedimentos: ProcedimentoSadt[];
        observacoes?: string;
        urgente: boolean;
    };
}

// ✅ INTERFACE para procedimento da SADT
export interface ProcedimentoSadt {
    codigo: string; // Código SIGTAP
    nome: string;
    quantidade: number;
    cid10?: string;
    justificativa?: string;
    preparo?: string;
}

// ✅ INTERFACE para request de geração da SADT
export interface GerarSadtRequest {
    agendamentoId: number;
    pacienteId?: number;
    procedimentos: ProcedimentoSadt[];
    observacoes?: string;
    urgente?: boolean;
}

// ✅ INTERFACE para resposta da geração da SADT (ESTAVA FALTANDO!)
export interface SadtResponseDTO {
    numeroSadt: string;
    pdfBase64: string;
    sadtData?: SadtData;
    dataGeracao?: string;
    status?: 'GERADA' | 'CANCELADA' | 'REALIZADA';
    observacoes?: string;
}

// ✅ INTERFACE para status da SADT do recepcao
export interface VerificarSadtResponse {
    precisaSadt: boolean;
    temSadt: boolean;
    podeGerar: boolean;
    numeroSadt?: string;
    dataGeracao?: string;
    motivo?: string;
}

// ✅ ENUM para tipos de SADT
export enum TipoSadt {
    LABORATORIAL = 'laboratorial',
    IMAGEM = 'imagem',
    TERAPEUTICO = 'terapeutico'
}

// ✅ ENUM para status da SADT
export enum StatusSadt {
    GERADA = 'GERADA',
    CANCELADA = 'CANCELADA',
    REALIZADA = 'REALIZADA'
}

// ✅ INTERFACE para configurações da SADT
export interface ConfiguracaoSadt {
    estabelecimento: {
        nome: string;
        cnes: string;
        endereco: string;
        telefone: string;
        municipio: string;
        uf: string;
        responsavelTecnico: string;
        crmResponsavel: string;
    };
    layout: {
        logoUrl?: string;
        corPrimaria: string;
        corSecundaria: string;
        fonte: string;
    };
}

// ✅ INTERFACE para dados de impressão
export interface DadosImpressaoSadt {
    numeroSadt: string;
    agendamentoId: number;
    pacienteNome: string;
    dataEmissao: string;
    procedimentos: string[];
    observacoes?: string;
}

// ✅ HELPER TYPES
export type TipoSadtType = keyof typeof TipoSadt;
export type StatusSadtType = keyof typeof StatusSadt;

// ✅ CONSTANTES úteis
export const TIPOS_SADT_OPTIONS = [
    { value: TipoSadt.LABORATORIAL, label: 'Exames Laboratoriais' },
    { value: TipoSadt.IMAGEM, label: 'Exames de Imagem' },
    { value: TipoSadt.TERAPEUTICO, label: 'Procedimentos Terapêuticos' }
] as const;

export const STATUS_SADT_OPTIONS = [
    { value: StatusSadt.GERADA, label: 'Gerada', color: 'blue' },
    { value: StatusSadt.CANCELADA, label: 'Cancelada', color: 'red' },
    { value: StatusSadt.REALIZADA, label: 'Realizada', color: 'green' }
] as const;

// ✅ FUNÇÕES UTILITÁRIAS

/**
 * Formatar número da SADT para exibição
 */
export const formatarNumeroSadt = (numero: string): string => {
    if (!numero) return '';

    // Remove caracteres não numéricos
    const digits = numero.replace(/\D/g, '');

    // Formata como XXXX.XXXX.XXXX.XXXX
    if (digits.length === 16) {
        return digits.replace(/(\d{4})(\d{4})(\d{4})(\d{4})/, '$1.$2.$3.$4');
    }

    return numero;
};

/**
 * Validar se um número de SADT é válido
 */
export const validarNumeroSadt = (numero: string): boolean => {
    if (!numero) return false;

    const digits = numero.replace(/\D/g, '');
    return digits.length === 16;
};

/**
 * Gerar número de SADT sequencial
 */
export const gerarNumeroSadt = (): string => {
    const timestamp = Date.now().toString();
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');

    // Formato: YYYYMMDDHHMMSSRRRR
    const now = new Date();
    const year = now.getFullYear().toString();
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const day = now.getDate().toString().padStart(2, '0');
    const hour = now.getHours().toString().padStart(2, '0');
    const minute = now.getMinutes().toString().padStart(2, '0');
    const second = now.getSeconds().toString().padStart(2, '0');

    return `${year}${month}${day}${hour}${minute}${second}${random}`;
};

/**
 * Obter descrição do tipo de SADT
 */
export const obterDescricaoTipoSadt = (tipo: TipoSadt): string => {
    const opcao = TIPOS_SADT_OPTIONS.find(opt => opt.value === tipo);
    return opcao ? opcao.label : tipo;
};

/**
 * Obter configuração de cor do status
 */
export const obterCorStatus = (status: StatusSadt): string => {
    const opcao = STATUS_SADT_OPTIONS.find(opt => opt.value === status);
    return opcao ? opcao.color : 'gray';
};

/**
 * Validar dados da SADT antes da geração
 */
export const validarDadosSadt = (dados: Partial<GerarSadtRequest>): string | null => {
    if (!dados.agendamentoId) {
        return 'ID do recepcao é obrigatório';
    }

    if (!dados.procedimentos || dados.procedimentos.length === 0) {
        return 'Pelo menos um procedimento é obrigatório';
    }

    for (const proc of dados.procedimentos) {
        if (!proc.codigo || !proc.nome) {
            return 'Todos os procedimentos devem ter código e nome';
        }

        if (proc.quantidade <= 0) {
            return 'Quantidade deve ser maior que zero';
        }
    }

    return null;
};

/**
 * Converter dados do recepcao para request da SADT
 */
export const converterAgendamentoParaSadt = (
    agendamento: any,
    procedimentos: ProcedimentoSadt[]
): GerarSadtRequest => {
    return {
        agendamentoId: agendamento.id,
        pacienteId: agendamento.pacienteId,
        procedimentos,
        observacoes: agendamento.observacoes,
        urgente: agendamento.prioridade === 'urgente' || agendamento.prioridade === 'emergencia'
    };
};