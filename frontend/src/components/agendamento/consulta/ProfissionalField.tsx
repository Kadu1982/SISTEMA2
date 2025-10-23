import React from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UserCheck } from 'lucide-react';

interface ProfissionalFieldProps {
    especialidade: string;
    unidade: string;
    value: string;
    onChange: (value: string) => void;
    error?: string;
    disabled?: boolean;
}

// Mock de profissionais por especialidade
const profissionaisPorEspecialidade: Record<string, string[]> = {
    'clinica_geral': ['Dr. João Silva', 'Dra. Maria Santos', 'Dr. Pedro Costa'],
    'cardiologia': ['Dr. Carlos Lima', 'Dra. Ana Ferreira'],
    'pediatria': ['Dra. Lucia Oliveira', 'Dr. Roberto Mendes'],
    'ginecologia': ['Dra. Teresa Rodrigues', 'Dra. Fernanda Alves']
};

export const ProfissionalField: React.FC<ProfissionalFieldProps> = ({
                                                                        especialidade,
                                                                        unidade,
                                                                        value,
                                                                        onChange,
                                                                        error,
                                                                        disabled = false
                                                                    }) => {
    const profissionaisDisponiveis = especialidade ?
        profissionaisPorEspecialidade[especialidade] || [] : [];

    return (
        <div className="space-y-2">
            <Label htmlFor="profissional" className="flex items-center gap-2">
                <UserCheck className="w-4 h-4" />
                Profissional (opcional)
            </Label>
            <Select
                value={value}
                onValueChange={onChange}
                disabled={disabled || !especialidade}
            >
                <SelectTrigger className={error ? 'border-red-500' : ''}>
                    <SelectValue placeholder={
                        especialidade ? "Selecione o profissional" : "Selecione a especialidade primeiro"
                    } />
                </SelectTrigger>
                <SelectContent>
                    {profissionaisDisponiveis.map((profissional) => (
                        <SelectItem key={profissional} value={profissional}>
                            {profissional}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
            {error && (
                <p className="text-red-500 text-sm">{error}</p>
            )}
        </div>
    );
};