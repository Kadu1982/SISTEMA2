// frontend/src/types/prescricao.ts

export type TipoPrescricao = 'INTERNO' | 'EXTERNO';

export interface PrescricaoMedicamento {
    id?: number;
    atendimentoId?: number;
    tipoPrescricao: TipoPrescricao;
    medicamentoCodigo?: string;
    medicamentoNome: string;
    principioAtivoId?: number;
    principioAtivo: string;
    numeroReceita?: number;
    medicamentoControlado: boolean;
    quantidade?: number;
    unidade?: string;
    viaAdministracao?: string;
    dataHoraInicial?: string; // ISO string
    dataHoraFinal?: string; // ISO string
    duracaoDias?: number;
    aprazamento?: string;
    instrucaoDosagem?: string;
    observacoes?: string;
    ordem?: number;
    ativo?: boolean;
}

// Opções de aprazamento
export const APRAZAMENTOS = [
    { value: '1_1_HORA', label: '1/1 Hora' },
    { value: '2_2_HORAS', label: '2/2 Horas' },
    { value: '4_4_HORAS', label: '4/4 Horas' },
    { value: '6_6_HORAS', label: '6/6 Horas' },
    { value: '8_8_HORAS', label: '8/8 Horas' },
    { value: '12_12_HORAS', label: '12/12 Horas' },
    { value: '1X_AO_DIA', label: '1x Ao Dia' },
    { value: '2X_AO_DIA', label: '2x Ao Dia' },
];

// Unidades de medida comuns
export const UNIDADES_MEDIDA = [
    { value: 'COM', label: 'COM - Comprimido' },
    { value: 'CAP', label: 'CAP - Cápsula' },
    { value: 'ML', label: 'ML - Mililitro' },
    { value: 'MG', label: 'MG - Miligrama' },
    { value: 'G', label: 'G - Grama' },
    { value: 'GTS', label: 'GTS - Gotas' },
    { value: 'AMP', label: 'AMP - Ampola' },
    { value: 'FR', label: 'FR - Frasco' },
    { value: 'CX', label: 'CX - Caixa' },
    { value: 'UN', label: 'UN - Unidade' },
];

// Vias de administração comuns
export const VIAS_ADMINISTRACAO = [
    { value: 'VO', label: 'VO - Via Oral' },
    { value: 'IV', label: 'IV - Intravenosa' },
    { value: 'IM', label: 'IM - Intramuscular' },
    { value: 'SC', label: 'SC - Subcutânea' },
    { value: 'ID', label: 'ID - Intradérmica' },
    { value: 'IN', label: 'IN - Intranasal' },
    { value: 'OF', label: 'OF - Oftálmica' },
    { value: 'OT', label: 'OT - Otológica' },
    { value: 'TD', label: 'TD - Tópica/Dérmica' },
    { value: 'RT', label: 'RT - Retal' },
    { value: 'VG', label: 'VG - Vaginal' },
    { value: 'INH', label: 'INH - Inalatória' },
];
