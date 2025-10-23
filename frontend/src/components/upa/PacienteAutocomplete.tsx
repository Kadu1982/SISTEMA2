/**
 * PacienteAutocomplete.tsx (UPA)
 * -----------------------------------------------------------------------------
 * UPDATED: Now uses the unified PacienteBusca component for consistent
 * patient search functionality across the entire application.
 *
 * This is a simple wrapper that adapts PacienteBusca to work with UPA's
 * PacienteList type while maintaining backward compatibility.
 */

import React from 'react';
import PacienteBusca from '@/components/agendamento/PacienteBusca';
import { PacienteList } from '@/types/paciente/Paciente';
import { Paciente } from '@/types/paciente/Paciente';

interface Props {
    onPacienteSelecionado: (paciente: PacienteList) => void;
    pacienteSelecionado?: PacienteList | null;
    placeholder?: string;
}

const PacienteAutocomplete: React.FC<Props> = ({
    onPacienteSelecionado,
    pacienteSelecionado,
    placeholder = "Digite o nome do paciente..."
}) => {
    // Convert PacienteList to Paciente format for PacienteBusca
    const pacienteForBusca = pacienteSelecionado ? {
        id: pacienteSelecionado.id,
        nomeCompleto: pacienteSelecionado.nomeCompleto,
        cpf: pacienteSelecionado.cpf,
    } as Paciente : null;

    // Convert Paciente back to PacienteList when selected
    const handlePacienteSelected = (paciente: Paciente | null) => {
        if (paciente) {
            const pacienteList: PacienteList = {
                id: paciente.id!,
                nomeCompleto: paciente.nomeCompleto ?? '',
                cpf: paciente.cpf
            };
            onPacienteSelecionado(pacienteList);
        } else {
            onPacienteSelecionado(null as any);
        }
    };

    return (
        <PacienteBusca
            onPacienteSelecionado={handlePacienteSelected}
            placeholder={placeholder}
            pacienteSelecionado={pacienteForBusca}
        />
    );
};

export default PacienteAutocomplete;
