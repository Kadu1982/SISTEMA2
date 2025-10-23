// src/types/AtendimentoFormProps.ts

export interface AtendimentoFormData {
    pacienteId: string;
    profissionalId?: string;
    cid10: string;
    diagnostico?: string;
    sintomas?: string;
    examesFisicos?: string;
    prescricao?: string;
    medicamentosPrescritos?: string;
    orientacoes?: string;
    retorno?: string;
    observacoes?: string;
    observacoesInternas?: string;
    statusAtendimento?: string;

    // Compatibilidade com versões anteriores
    anamnese?: string;
    queixaPrincipal?: string;
    solicitacaoExames?: string;
    exameClinico?: string;
    condutaMedica?: string;

    // 🔹 CIAP-2
    ciapRfe?: string;
    ciapDiagnosticos?: string[];
    ciapProcedimentos?: string[];

    // 🔹 NOVOS: Motivo de desfecho
    motivoDesfecho: string;
    especialidadeEncaminhamento?: string;
}

export interface AtendimentoFormProps {
    onSave: (data: AtendimentoFormData) => Promise<void>;
    onCancel?: () => void;
    onClose?: () => void;
    isLoading?: boolean;
    title: string;
    description: string;
    initialData?: Partial<AtendimentoFormData>;
    atendimentoId?: string;
    readOnly?: boolean;
    tipo?: "medico" | "odontologico";
}