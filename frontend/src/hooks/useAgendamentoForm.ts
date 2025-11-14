
import { useState, useCallback, useMemo, useEffect } from 'react';
import { Paciente } from '@/types/paciente/Paciente';
import { getEspecialidadesPorTipo } from '@/types/Agendamento';

// Interfaces para os tipos de dados
export interface AgendamentoFormData {
    pacienteId?: number;
    tipo: string;
    dataHora: string;
    especialidade: string;
    examesSelecionados: string[];
    prioridade: string;
    observacoes: string;
}

export interface AgendamentoFormErrors {
    paciente?: string;
    tipo?: string;
    dataHora?: string;
    especialidade?: string;
    exames?: string;
    prioridade?: string;
}

// ✅ CORREÇÃO: Especialidades com estrutura value/label para SelectItem
const ESPECIALIDADES_MOCK = [
    { id: '1', nome: 'Clínica Geral', value: 'clinica_geral', label: 'Clínica Geral' },
    { id: '2', nome: 'Cardiologia', value: 'cardiologia', label: 'Cardiologia' },
    { id: '3', nome: 'Dermatologia', value: 'dermatologia', label: 'Dermatologia' },
    { id: '4', nome: 'Pediatria', value: 'pediatria', label: 'Pediatria' },
    { id: '5', nome: 'Ginecologia', value: 'ginecologia', label: 'Ginecologia' },
    { id: '6', nome: 'Neurologia', value: 'neurologia', label: 'Neurologia' },
    { id: '7', nome: 'Ortopedia', value: 'ortopedia', label: 'Ortopedia' },
    { id: '8', nome: 'Oftalmologia', value: 'oftalmologia', label: 'Oftalmologia' },
    { id: '9', nome: 'Psiquiatria', value: 'psiquiatria', label: 'Psiquiatria' },
    { id: '10', nome: 'Urologia', value: 'urologia', label: 'Urologia' },
];

export const useAgendamentoForm = () => {
    // Estados do formulário
    const [formData, setFormData] = useState<AgendamentoFormData>({
        tipo: '',
        dataHora: '',
        especialidade: '',
        examesSelecionados: [],
        prioridade: 'NORMAL',
        observacoes: '',
    });

    const [errors, setErrors] = useState<AgendamentoFormErrors>({});

    // Estados individuais (para compatibilidade com o código existente)
    const [pacienteSelecionado, setPacienteSelecionado] = useState<Paciente | null>(null);
    const [tipoAtendimento, setTipoAtendimento] = useState<string>('');
    const [dataHoraAgendamento, setDataHoraAgendamento] = useState<string>('');
    const [especialidade, setEspecialidade] = useState<string>('');
    const [examesSelecionados, setExamesSelecionados] = useState<string[]>([]);
    const [prioridade, setPrioridade] = useState<string>('NORMAL');
    const [observacoes, setObservacoes] = useState<string>('');

    // ✅ CORREÇÃO: Especialidades disponíveis baseadas no tipo de atendimento
    const especialidadesDisponiveis = useMemo(() => {
        if (!tipoAtendimento) {
            return [];
        }
        return getEspecialidadesPorTipo(tipoAtendimento);
    }, [tipoAtendimento]);

    // Limpar especialidade quando o tipo de atendimento mudar
    useEffect(() => {
        if (tipoAtendimento) {
            setEspecialidade('');
        }
    }, [tipoAtendimento]);

    // Função de validação
    const validateForm = useCallback((): AgendamentoFormErrors => {
        const newErrors: AgendamentoFormErrors = {};

        if (!pacienteSelecionado) {
            newErrors.paciente = 'Selecione um paciente';
        }

        if (!tipoAtendimento) {
            newErrors.tipo = 'Selecione o tipo de atendimento';
        }

        if (!dataHoraAgendamento) {
            newErrors.dataHora = 'Selecione data e hora do agendamento';
        }

        // ✅ CORREÇÃO: Verificar tipos de consulta corretos
        if ((tipoAtendimento === 'consulta_medica' || tipoAtendimento === 'consulta_enfermagem' || tipoAtendimento === 'consulta_odontologica') && !especialidade) {
            newErrors.especialidade = 'Selecione uma especialidade para consulta';
        }

        // ✅ CORREÇÃO: Verificar tipos de exame corretos
        if ((tipoAtendimento === 'exame_laboratorial' || tipoAtendimento === 'exame_imagem') && examesSelecionados.length === 0) {
            newErrors.exames = 'Selecione pelo menos um exame';
        }

        if (!prioridade) {
            newErrors.prioridade = 'Selecione a prioridade';
        }

        return newErrors;
    }, [pacienteSelecionado, tipoAtendimento, dataHoraAgendamento, especialidade, examesSelecionados, prioridade]);

    // Função de reset do formulário
    const resetForm = useCallback(() => {
        setFormData({
            tipo: '',
            dataHora: '',
            especialidade: '',
            examesSelecionados: [],
            prioridade: 'NORMAL',
            observacoes: '',
        });
        setErrors({});
        setPacienteSelecionado(null);
        setTipoAtendimento('');
        setDataHoraAgendamento('');
        setEspecialidade('');
        setExamesSelecionados([]);
        setPrioridade('NORMAL');
        setObservacoes('');
    }, []);

    // Função de validação principal (compatibilidade)
    const validarAgendamento = useCallback(() => {
        const formErrors = validateForm();
        setErrors(formErrors);

        if (Object.keys(formErrors).length > 0) {
            return {
                valido: false,
                erros: Object.values(formErrors),
                avisos: [],
                sugestoes: []
            };
        }

        return null;
    }, [validateForm]);

    // Função de reset (compatibilidade)
    const resetarFormulario = useCallback(() => {
        resetForm();
    }, [resetForm]);

    // ✅ CORREÇÃO: Funções auxiliares com lógica correta para tipos de atendimento
    const isEspecialidadeObrigatoria = useCallback(() => {
        return tipoAtendimento === 'consulta_medica' || tipoAtendimento === 'consulta_enfermagem' || tipoAtendimento === 'consulta_odontologica';
    }, [tipoAtendimento]);

    const getLabelCampoEspecialidade = useCallback(() => {
        if (tipoAtendimento === 'consulta_medica' || tipoAtendimento === 'consulta_enfermagem' || tipoAtendimento === 'consulta_odontologica') {
            return 'Especialidade *';
        }
        return 'Especialidade';
    }, [tipoAtendimento]);

    const getPlaceholderCampoEspecialidade = useCallback(() => {
        if (tipoAtendimento === 'consulta_medica' || tipoAtendimento === 'consulta_enfermagem') {
            return 'Selecione a especialidade';
        }
        if (tipoAtendimento === 'consulta_odontologica') {
            return 'Selecione a especialidade odontológica';
        }
        if (tipoAtendimento === 'exame_laboratorial') {
            return 'Selecione os exames laboratoriais';
        }
        if (tipoAtendimento === 'exame_imagem') {
            return 'Selecione os exames de imagem';
        }
        return 'Especialidade (opcional)';
    }, [tipoAtendimento]);

    const isExameMultiplo = useCallback(() => {
        return tipoAtendimento === 'exame_laboratorial' || tipoAtendimento === 'exame_imagem';
    }, [tipoAtendimento]);

    const isConsulta = useCallback(() => {
        return tipoAtendimento === 'consulta_medica' || tipoAtendimento === 'consulta_enfermagem' || tipoAtendimento === 'consulta_odontologica';
    }, [tipoAtendimento]);

    return {
        // Dados do formulário
        formData,
        setFormData,
        errors,
        setErrors,
        validateForm,
        resetForm,

        // Estados individuais (para compatibilidade)
        pacienteSelecionado,
        setPacienteSelecionado,
        tipoAtendimento,
        setTipoAtendimento,
        dataHoraAgendamento,
        setDataHoraAgendamento,
        especialidade,
        setEspecialidade,
        examesSelecionados,
        setExamesSelecionados,
        prioridade,
        setPrioridade,
        observacoes,
        setObservacoes,

        // Funções
        resetarFormulario,
        validarAgendamento,

        // Dados auxiliares
        especialidadesDisponiveis,

        // Funções auxiliares
        isEspecialidadeObrigatoria,
        getLabelCampoEspecialidade,
        getPlaceholderCampoEspecialidade,
        isExameMultiplo,
        isConsulta,
    };
};