// ✅ INTERFACES EXISTENTES (mantidas)
export interface TipoAgendamento {
    id: string;
    nome: string;
    categoria: 'consulta' | 'exame_laboratorial' | 'exame_imagem';
    icone: string;
    cor: string;
    descricao?: string;
}

export interface EspecialidadeMedica {
    id: string;
    nome: string;
    cbo: string;
    disponivel: boolean;
    profissionais: string[];
}

export interface ExameLaboratorial {
    id: string;
    nome: string;
    codigo: string;
    preparo?: string;
    jejum: boolean;
    disponivel: boolean;
}

export interface ExameImagem {
    id: string;
    nome: string;
    tipo: 'ultrassom' | 'raio_x' | 'tomografia' | 'ressonancia' | 'mamografia';
    preparo?: string;
    disponivel: boolean;
    equipamento: string;
}

export interface NovoAgendamento {
    pacienteId: number;
    tipoAgendamento: 'consulta' | 'exame_laboratorial' | 'exame_imagem';
    especialidadeId?: string;
    exameId?: string;
    dataHora: Date;
    observacoes?: string;
    status: 'agendado' | 'confirmado' | 'realizado' | 'cancelado';
}

// ✅ INTERFACE ATUALIZADA: AgendamentoDTO com examesSelecionados
export interface AgendamentoDTO {
    id: number;
    pacienteId: number;
    pacienteNome: string;
    pacienteDataNascimento?: string; // ✅ NOVO: Data de nascimento do paciente
    profissionalNome: string;
    dataHora: string;
    status: string;
    tipo: string;
    especialidade?: string;
    examesSelecionados?: string[];
    prioridade?: string;
    unidade?: string;
    observacoes?: string;

    // ✅ CAMPOS ADICIONADOS PARA CORRIGIR OS ERROS
    dataHoraFormatada: string;
    comprovantePdfBase64?: string;
}

// ✅ INTERFACE para criar agendamento (usada nos formulários)
export interface CriarAgendamentoRequest {
    pacienteId: number;
    tipo: string;
    especialidade?: string;
    examesSelecionados?: string[];
    dataHora: string;
    prioridade?: string;
    observacoes?: string;
    unidade?: string; // ✅ ADICIONADO: Campo unidade para compatibilidade com o backend
}

// ✅ INTERFACE para atualizar agendamento
export interface AtualizarAgendamentoRequest {
    id: number;
    status?: string;
    dataHora?: string;
    observacoes?: string;
    prioridade?: string;
}

// ✅ INTERFACE para resposta da análise de agendamento
export interface AnaliseAgendamento {
    ocupacaoMedia: number;
    horariosComMaiorFalta: string[];
    especialidadesComMaiorDemanda: string[];
    sugestoesMelhoria: string[];
}

// ✅ INTERFACE CORRIGIDA para especialidades disponíveis por tipo
export interface EspecialidadeDisponivel {
    label: string;
    value: string;
    icon?: React.ComponentType<{ className?: string }>;
}

// ✅ INTERFACE para filtros de busca
export interface FiltrosAgendamento {
    dataInicio?: Date;
    dataFim?: Date;
    status?: string[];
    tipo?: string[];
    especialidade?: string;
    pacienteNome?: string;
    profissionalNome?: string;
    unidade?: string; // ✅ NOVO
    prioridade?: string; // ✅ NOVO
}

// ✅ INTERFACE para estatísticas de agendamentos
export interface EstatisticasAgendamento {
    total: number;
    agendados: number;
    confirmados: number;
    realizados: number;
    cancelados: number;
    faltaram: number;
    taxaComparecimento: number;
    especialidadeMaisDemandada: string;
    horarioMaisDemandado: string;
    taxaCancelamento?: number; // ✅ NOVO
    mediaDiariaPorTipo?: Record<string, number>; // ✅ NOVO
}

// ✅ INTERFACE para conflitos de agendamento
export interface ConflitoAgendamento {
    existe: boolean;
    motivo?: string;
    agendamentoConflitante?: AgendamentoDTO;
    sugestoes?: string[];
    proximoHorarioDisponivel?: string; // ✅ NOVO
}

// ✅ === NOVAS INTERFACES PARA REIMPRESSÃO ===

// Interface para dados de reimpressão
export interface DadosReimpressao {
    agendamentoId: number;
    pacienteId: number;
    pacienteNome?: string;
    pacienteDataNascimento?: string; // ✅ NOVO: Data de nascimento do paciente
    tipo: string;
    especialidade?: string;
    examesSelecionados?: string[];
    prioridade?: string;
    observacoes?: string;
    unidade?: string;
    dataHora: string;
    profissionalNome?: string;
    dataOriginalImpressao?: string; // ✅ NOVO
    motivoReimpressao?: string; // ✅ NOVO
}

// Tipos de documento que podem ser reimpressos
export type TipoDocumentoReimpressao = 'sadt' | 'comprovante';

// Interface para configuração de reimpressão
export interface ConfiguracaoReimpressao {
    mostrarBannerReimpressao: boolean;
    incluirDataOriginal: boolean;
    incluirMotivoReimpressao?: string;
    limitarReimpressoes?: number; // ✅ NOVO: Limite de reimpressões permitidas
    exigirJustificativaApos?: number; // ✅ NOVO: Exigir justificativa após X reimpressões
}

// Interface para resultado da reimpressão
export interface ResultadoReimpressao {
    sucesso: boolean;
    mensagem: string;
    documentoGerado?: string;
    erro?: string;
    numeroReimpressao?: number; // ✅ NOVO: Contador de reimpressões
    proximaReimpressaoDisponivel?: boolean; // ✅ NOVO
}

// ✅ === NOVAS INTERFACES PARA MELHOR ESTRUTURAÇÃO ===

// Interface para opções de agendamento
export interface OpcaoAgendamento {
    value: string;
    label: string;
    descricao?: string;
    icone?: string;
    categoria?: string;
    requisitos?: string[];
    duracaoEstimada?: number;
}

// Interface para validação de agendamento
export interface ValidacaoAgendamento {
    valido: boolean;
    erros: string[];
    avisos?: string[];
    sugestoes?: string[];
}

// Interface para busca avançada
export interface BuscaAvancadaAgendamento {
    termo?: string;
    filtros: FiltrosAgendamento;
    ordenacao?: {
        campo: 'dataHora' | 'pacienteNome' | 'status' | 'tipo';
        direcao: 'asc' | 'desc';
    };
    paginacao?: {
        pagina: number;
        itensPorPagina: number;
    };
}

// ✅ ENUMS para padronizar valores
export enum StatusAgendamento {
    AGENDADO = 'AGENDADO',
    CONFIRMADO = 'CONFIRMADO',
    REALIZADO = 'REALIZADO',
    CANCELADO = 'CANCELADO',
    FALTOU = 'FALTOU',
    EM_ATENDIMENTO = 'EM_ATENDIMENTO' // ✅ NOVO
}

export enum TipoAtendimento {
    CONSULTA_MEDICA = 'consulta_medica',
    CONSULTA_ENFERMAGEM = 'consulta_enfermagem',
    EXAME_LABORATORIAL = 'exame_laboratorial',
    EXAME_IMAGEM = 'exame_imagem',
    PROCEDIMENTO = 'procedimento',
    VACINA = 'vacina',
    RETORNO = 'retorno' // ✅ NOVO
}

export enum PrioridadeAtendimento {
    BAIXA = 'baixa', // ✅ NOVO
    NORMAL = 'normal',
    ALTA = 'alta', // ✅ NOVO
    URGENTE = 'urgente',
    EMERGENCIA = 'emergencia'
}

export enum TipoExame {
    ULTRASSOM = 'ultrassom',
    RAIO_X = 'raio_x',
    TOMOGRAFIA = 'tomografia',
    RESSONANCIA = 'ressonancia',
    MAMOGRAFIA = 'mamografia',
    ECOCARDIOGRAMA = 'ecocardiograma', // ✅ NOVO
    ELETROCARDIOGRAMA = 'eletrocardiograma' // ✅ NOVO
}

// ✅ TYPES HELPERS para autocompletar
export type StatusAgendamentoType = keyof typeof StatusAgendamento;
export type TipoAtendimentoType = keyof typeof TipoAtendimento;
export type PrioridadeAtendimentoType = keyof typeof PrioridadeAtendimento;
export type TipoExameType = keyof typeof TipoExame;

// ✅ CONSTANTES ATUALIZADAS com mais especialidades
export const ESPECIALIDADES_MEDICAS: readonly OpcaoAgendamento[] = [
    { value: 'clinica_geral', label: 'Clínica Geral', categoria: 'clinica', duracaoEstimada: 30 },
    { value: 'cardiologia', label: 'Cardiologia', categoria: 'especialidade', duracaoEstimada: 45 },
    { value: 'ginecologia', label: 'Ginecologia', categoria: 'especialidade', duracaoEstimada: 40 },
    { value: 'pediatria', label: 'Pediatria', categoria: 'especialidade', duracaoEstimada: 30 },
    { value: 'ortopedia', label: 'Ortopedia', categoria: 'especialidade', duracaoEstimada: 35 },
    { value: 'dermatologia', label: 'Dermatologia', categoria: 'especialidade', duracaoEstimada: 25 },
    { value: 'psiquiatria', label: 'Psiquiatria', categoria: 'mental', duracaoEstimada: 50 },
    { value: 'neurologia', label: 'Neurologia', categoria: 'especialidade', duracaoEstimada: 45 },
    { value: 'urologia', label: 'Urologia', categoria: 'especialidade', duracaoEstimada: 35 },
    { value: 'oftalmologia', label: 'Oftalmologia', categoria: 'especialidade', duracaoEstimada: 30 },
    { value: 'endocrinologia', label: 'Endocrinologia', categoria: 'especialidade', duracaoEstimada: 45 }, // ✅ NOVO
    { value: 'gastroenterologia', label: 'Gastroenterologia', categoria: 'especialidade', duracaoEstimada: 40 } // ✅ NOVO
] as const;

export const ESPECIALIDADES_ENFERMAGEM: readonly OpcaoAgendamento[] = [
    { value: 'triagem', label: 'Triagem', categoria: 'avaliacao', duracaoEstimada: 15 },
    { value: 'curativo', label: 'Curativos', categoria: 'procedimento', duracaoEstimada: 20 },
    { value: 'medicacao', label: 'Medicação', categoria: 'procedimento', duracaoEstimada: 10 },
    { value: 'pre_natal', label: 'Pré-natal', categoria: 'acompanhamento', duracaoEstimada: 30 },
    { value: 'puericultura', label: 'Puericultura', categoria: 'acompanhamento', duracaoEstimada: 25 },
    { value: 'coleta_exames', label: 'Coleta de Exames', categoria: 'procedimento', duracaoEstimada: 15 } // ✅ NOVO
] as const;

// ✅ CONSTANTES CORRIGIDAS - ESTRUTURA SIMPLES PARA MULTISELECT
export const EXAMES_LABORATORIAIS: readonly EspecialidadeDisponivel[] = [
    { value: 'hemograma_completo', label: 'Hemograma Completo' },
    { value: 'glicemia_jejum', label: 'Glicemia de Jejum' },
    { value: 'colesterol_total', label: 'Colesterol Total e Frações' },
    { value: 'tsh', label: 'TSH - Hormônio Tireoestimulante' },
    { value: 'ureia_creatinina', label: 'Ureia e Creatinina' },
    { value: 'exame_urina', label: 'Exame de Urina (EAS)' },
    { value: 'vitamina_d', label: 'Vitamina D' },
    { value: 'pcr', label: 'Proteína C Reativa' },
    { value: 'hepatite_b', label: 'Hepatite B (HBsAg)' },
    { value: 'hiv', label: 'Anti-HIV' }
] as const;

export const EXAMES_IMAGEM: readonly EspecialidadeDisponivel[] = [
    { value: 'rx_torax', label: 'Raio-X de Tórax' },
    { value: 'us_abdomen', label: 'Ultrassom de Abdômen' },
    { value: 'mamografia', label: 'Mamografia Bilateral' },
    { value: 'tc_cranio', label: 'Tomografia de Crânio' },
    { value: 'rm_coluna', label: 'Ressonância de Coluna' },
    { value: 'ecocardiograma', label: 'Ecocardiograma' },
    { value: 'rx_coluna', label: 'Raio-X de Coluna' },
    { value: 'us_pelvico', label: 'Ultrassom Pélvico' },
    { value: 'tc_abdomen', label: 'Tomografia de Abdômen' },
    { value: 'rm_cranio', label: 'Ressonância de Crânio' }
] as const;

export const TIPOS_PROCEDIMENTO: readonly OpcaoAgendamento[] = [
    { value: 'pequena_cirurgia', label: 'Pequena Cirurgia', categoria: 'cirurgia', duracaoEstimada: 90 },
    { value: 'sutura', label: 'Sutura', categoria: 'procedimento', duracaoEstimada: 30 },
    { value: 'cauterizacao', label: 'Cauterização', categoria: 'procedimento', duracaoEstimada: 20 },
    { value: 'biopsia', label: 'Biópsia', categoria: 'diagnostico', duracaoEstimada: 45 },
    { value: 'infiltracao', label: 'Infiltração', categoria: 'terapeutico', duracaoEstimada: 25 }
] as const;

export const TIPOS_VACINA: readonly OpcaoAgendamento[] = [
    { value: 'covid19', label: 'COVID-19', categoria: 'preventiva', duracaoEstimada: 15 },
    { value: 'influenza', label: 'Influenza (Gripe)', categoria: 'preventiva', duracaoEstimada: 10 },
    { value: 'tetano', label: 'Tétano', categoria: 'preventiva', duracaoEstimada: 10 },
    { value: 'hepatite_b', label: 'Hepatite B', categoria: 'preventiva', duracaoEstimada: 10 },
    { value: 'febre_amarela', label: 'Febre Amarela', categoria: 'preventiva', duracaoEstimada: 15 }
] as const;

// ✅ === FUNÇÕES UTILITÁRIAS PARA REIMPRESSÃO MELHORADAS ===

/**
 * Verifica se um tipo de agendamento pode gerar SADT
 */
export const podeGerarSadt = (tipo: string): boolean => {
    const tiposComSadt = [
        TipoAtendimento.EXAME_LABORATORIAL,
        TipoAtendimento.EXAME_IMAGEM,
        TipoAtendimento.PROCEDIMENTO
    ];
    return tiposComSadt.includes(tipo as TipoAtendimento);
};

/**
 * Verifica se um tipo de agendamento pode gerar comprovante
 */
export const podeGerarComprovante = (tipo: string): boolean => {
    const tiposComComprovante = [
        TipoAtendimento.CONSULTA_MEDICA,
        TipoAtendimento.CONSULTA_ENFERMAGEM,
        TipoAtendimento.VACINA,
        TipoAtendimento.RETORNO
    ];
    return tiposComComprovante.includes(tipo as TipoAtendimento);
};

/**
 * Obtém o nome do documento baseado no tipo
 */
export const getNomeDocumento = (tipo: TipoDocumentoReimpressao): string => {
    return tipo === 'sadt' ? 'SADT - Solicitação de Atendimento' : 'Comprovante de Agendamento';
};

/**
 * ✅ NOVA: Verifica se precisa de autorização para reimpressão
 */
export const precisaAutorizacaoReimpressao = (numeroReimpressao: number, config: ConfiguracaoReimpressao): boolean => {
    return config.exigirJustificativaApos ? numeroReimpressao >= config.exigirJustificativaApos : false;
};

// ✅ === FUNÇÕES UTILITÁRIAS CORRIGIDAS ===

/**
 * Retorna as especialidades disponíveis baseado no tipo de atendimento
 */
export function getEspecialidadesPorTipo(tipoAtendimento: string): EspecialidadeDisponivel[] {
    console.log('🔍 getEspecialidadesPorTipo chamada:', tipoAtendimento);

    switch (tipoAtendimento) {
        case TipoAtendimento.CONSULTA_MEDICA:
        case TipoAtendimento.RETORNO:
            return ESPECIALIDADES_MEDICAS.map(esp => ({
                value: esp.value,
                label: esp.label
            }));

        case TipoAtendimento.CONSULTA_ENFERMAGEM:
            return ESPECIALIDADES_ENFERMAGEM.map(esp => ({
                value: esp.value,
                label: esp.label
            }));

        case TipoAtendimento.PROCEDIMENTO:
            return TIPOS_PROCEDIMENTO.map(proc => ({
                value: proc.value,
                label: proc.label
            }));

        case TipoAtendimento.VACINA:
            return TIPOS_VACINA.map(vac => ({
                value: vac.value,
                label: vac.label
            }));

        default:
            console.warn('⚠️ Tipo não encontrado:', tipoAtendimento);
            return [];
    }
}

/**
 * ✅ FUNÇÃO CORRIGIDA para obter exames por tipo - ESTRUTURA SIMPLES
 */
export function getExamesPorTipo(tipoExame: string): EspecialidadeDisponivel[] {
    console.log('🔍 getExamesPorTipo chamada:', tipoExame);

    // ✅ CORREÇÃO: Remove cases duplicados usando if-else
    if (tipoExame === TipoAtendimento.EXAME_LABORATORIAL || tipoExame === 'exame_laboratorial') {
        console.log('📋 Retornando exames laboratoriais:', EXAMES_LABORATORIAIS.length);
        return [...EXAMES_LABORATORIAIS]; // ✅ RETORNA CÓPIA DO ARRAY
    }

    if (tipoExame === TipoAtendimento.EXAME_IMAGEM || tipoExame === 'exame_imagem') {
        console.log('📋 Retornando exames de imagem:', EXAMES_IMAGEM.length);
        return [...EXAMES_IMAGEM]; // ✅ RETORNA CÓPIA DO ARRAY
    }

    console.warn('⚠️ Tipo de exame não encontrado:', tipoExame);
    return [];
}

/**
 * ✅ FUNÇÃO MELHORADA de validação com mais verificações
 */
export function validarAgendamento(dados: Partial<CriarAgendamentoRequest>): ValidacaoAgendamento {
    const erros: string[] = [];
    const avisos: string[] = [];
    const sugestoes: string[] = [];

    // Validações obrigatórias
    if (!dados.pacienteId) {
        erros.push('Paciente é obrigatório');
    }

    if (!dados.tipo) {
        erros.push('Tipo de atendimento é obrigatório');
    }

    if (!dados.dataHora) {
        erros.push('Data e hora são obrigatórias');
    } else {
        // Validar se a data não é no passado
        const dataAgendamento = new Date(dados.dataHora);
        const agora = new Date();

        if (dataAgendamento < agora) {
            erros.push('Data e hora não podem ser no passado');
        }

        // Avisar se agendamento é fora do horário comercial
        if (!isHorarioComercial(dados.dataHora)) {
            avisos.push('Agendamento fora do horário comercial padrão');
        }
    }

    // Validações específicas por tipo
    const tiposComEspecialidade = [
        TipoAtendimento.CONSULTA_MEDICA,
        TipoAtendimento.CONSULTA_ENFERMAGEM,
        TipoAtendimento.PROCEDIMENTO,
        TipoAtendimento.VACINA,
        TipoAtendimento.RETORNO
    ];

    if (tiposComEspecialidade.includes(dados.tipo as TipoAtendimento) && !dados.especialidade) {
        erros.push('Especialidade é obrigatória para este tipo de atendimento');
    }

    const tiposComExames = [TipoAtendimento.EXAME_LABORATORIAL, TipoAtendimento.EXAME_IMAGEM];
    if (tiposComExames.includes(dados.tipo as TipoAtendimento) && (!dados.examesSelecionados || dados.examesSelecionados.length === 0)) {
        erros.push('Pelo menos um exame deve ser selecionado');
    }

    // Sugestões baseadas no tipo
    if (dados.tipo === TipoAtendimento.EXAME_LABORATORIAL) {
        sugestoes.push('Verifique se o paciente está ciente dos requisitos de preparo');
    }

    return {
        valido: erros.length === 0,
        erros,
        avisos: avisos.length > 0 ? avisos : undefined,
        sugestoes: sugestoes.length > 0 ? sugestoes : undefined
    };
}

/**
 * ✅ FUNÇÃO CORRIGIDA: Formata o tipo de atendimento para exibição
 */
export function formatarTipoAtendimento(tipo: string): string {
    // ✅ Verificação de segurança no início
    if (!tipo) {
        return 'Não informado';
    }

    // ✅ Mapeamento correto dos tipos
    const tipos: Record<string, string> = {
        [TipoAtendimento.CONSULTA_MEDICA]: 'Consulta Médica',
        [TipoAtendimento.CONSULTA_ENFERMAGEM]: 'Consulta de Enfermagem',
        [TipoAtendimento.EXAME_LABORATORIAL]: 'Exame Laboratorial',
        [TipoAtendimento.EXAME_IMAGEM]: 'Exame de Imagem',
        [TipoAtendimento.PROCEDIMENTO]: 'Procedimento',
        [TipoAtendimento.VACINA]: 'Vacinação',
        [TipoAtendimento.RETORNO]: 'Retorno'
    };

    return tipos[tipo] || tipo.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
}

/**
 * Formata o status para exibição
 */
export function formatarStatus(status: string): string {
    const statusMap: Record<string, string> = {
        [StatusAgendamento.AGENDADO]: 'Agendado',
        [StatusAgendamento.CONFIRMADO]: 'Confirmado',
        [StatusAgendamento.REALIZADO]: 'Realizado',
        [StatusAgendamento.CANCELADO]: 'Cancelado',
        [StatusAgendamento.FALTOU]: 'Faltou',
        [StatusAgendamento.EM_ATENDIMENTO]: 'Em Atendimento'
    };

    return statusMap[status] || status;
}

/**
 * ✅ FUNÇÃO MELHORADA para formatar exames selecionados
 */
export function formatarExamesSelecionados(exames?: string[], tipo?: string, opcoes?: {
    maxItems?: number;
    mostrarTodos?: boolean;
    separador?: string;
}): string {
    if (!exames || exames.length === 0) {
        return 'Nenhum exame selecionado';
    }

    const { maxItems = 3, mostrarTodos = false, separador = ', ' } = opcoes || {};

    // ✅ BUSCAR LABELS REAIS DOS EXAMES
    const examesDisponiveis = tipo ? getExamesPorTipo(tipo) : [];
    const examesComLabel = exames.map(exameValue => {
        const exameEncontrado = examesDisponiveis.find(e => e.value === exameValue);
        return exameEncontrado?.label || exameValue;
    });

    if (examesComLabel.length === 1) {
        return examesComLabel[0];
    }

    if (mostrarTodos || examesComLabel.length <= maxItems) {
        return examesComLabel.join(separador);
    }

    const primeiros = examesComLabel.slice(0, maxItems - 1);
    const restante = examesComLabel.length - (maxItems - 1);

    return `${primeiros.join(separador)} e mais ${restante} exame${restante > 1 ? 's' : ''}`;
}

/**
 * Retorna a cor do status
 */
export function getCorStatus(status: string): string {
    const cores: Record<string, string> = {
        [StatusAgendamento.AGENDADO]: 'blue',
        [StatusAgendamento.CONFIRMADO]: 'green',
        [StatusAgendamento.REALIZADO]: 'emerald',
        [StatusAgendamento.CANCELADO]: 'red',
        [StatusAgendamento.FALTOU]: 'orange',
        [StatusAgendamento.EM_ATENDIMENTO]: 'purple'
    };

    return cores[status] || 'gray';
}

/**
 * Verifica se é horário comercial
 */
export function isHorarioComercial(dataHora: string): boolean {
    const data = new Date(dataHora);
    const hora = data.getHours();
    const diaSemana = data.getDay();

    // Segunda a sexta, 7h às 17h
    return diaSemana >= 1 && diaSemana <= 5 && hora >= 7 && hora <= 17;
}

/**
 * ✅ FUNÇÃO MELHORADA para calcular duração estimada
 */
export function getDuracaoEstimada(tipo: string, especialidade?: string): number {
    // Primeiro, verifica se há duração específica na especialidade
    if (especialidade) {
        const allOptions = [
            ...ESPECIALIDADES_MEDICAS,
            ...ESPECIALIDADES_ENFERMAGEM,
            ...TIPOS_PROCEDIMENTO,
            ...TIPOS_VACINA
        ];

        const opcaoEncontrada = allOptions.find(opt => opt.value === especialidade);
        if (opcaoEncontrada?.duracaoEstimada) {
            return opcaoEncontrada.duracaoEstimada;
        }
    }

    // Duração padrão por tipo
    const duracoes: Record<string, number> = {
        [TipoAtendimento.CONSULTA_MEDICA]: 30,
        [TipoAtendimento.CONSULTA_ENFERMAGEM]: 20,
        [TipoAtendimento.EXAME_LABORATORIAL]: 15,
        [TipoAtendimento.EXAME_IMAGEM]: 45,
        [TipoAtendimento.PROCEDIMENTO]: 60,
        [TipoAtendimento.VACINA]: 10,
        [TipoAtendimento.RETORNO]: 20
    };

    return duracoes[tipo] || 30;
}

/**
 * ✅ NOVA: Verifica se o tipo permite múltiplos exames
 */
export function isExameMultiplo(tipo: string): boolean {
    return tipo === TipoAtendimento.EXAME_LABORATORIAL || tipo === TipoAtendimento.EXAME_IMAGEM;
}

/**
 * ✅ NOVA: Verifica se é tipo de consulta
 */
export function isConsulta(tipo: string): boolean {
    return tipo === TipoAtendimento.CONSULTA_MEDICA ||
        tipo === TipoAtendimento.CONSULTA_ENFERMAGEM ||
        tipo === TipoAtendimento.RETORNO;
}

/**
 * ✅ NOVA: Obtém ícone para o tipo de atendimento
 */
export function getIconeTipoAtendimento(tipo: string): string {
    const icones: Record<string, string> = {
        [TipoAtendimento.CONSULTA_MEDICA]: '🩺',
        [TipoAtendimento.CONSULTA_ENFERMAGEM]: '👩‍⚕️',
        [TipoAtendimento.EXAME_LABORATORIAL]: '🧪',
        [TipoAtendimento.EXAME_IMAGEM]: '📷',
        [TipoAtendimento.PROCEDIMENTO]: '⚕️',
        [TipoAtendimento.VACINA]: '💉',
        [TipoAtendimento.RETORNO]: '🔄'
    };

    return icones[tipo] || '📋';
}

/**
 * ✅ NOVA: Calcula próximo horário disponível
 */
export function calcularProximoHorario(dataBase: string, duracaoMinutos: number = 30): string {
    const data = new Date(dataBase);
    data.setMinutes(data.getMinutes() + duracaoMinutos);
    return data.toISOString();
}

/**
 * ✅ NOVA: Formata prioridade para exibição
 */
export function formatarPrioridade(prioridade: string): { label: string; cor: string } {
    const prioridades: Record<string, { label: string; cor: string }> = {
        [PrioridadeAtendimento.BAIXA]: { label: 'Baixa', cor: 'gray' },
        [PrioridadeAtendimento.NORMAL]: { label: 'Normal', cor: 'blue' },
        [PrioridadeAtendimento.ALTA]: { label: 'Alta', cor: 'orange' },
        [PrioridadeAtendimento.URGENTE]: { label: 'Urgente', cor: 'red' },
        [PrioridadeAtendimento.EMERGENCIA]: { label: 'Emergência', cor: 'red' }
    };

    return prioridades[prioridade] || { label: prioridade, cor: 'gray' };
}