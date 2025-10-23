import React from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Stethoscope } from 'lucide-react';

interface EspecialidadeFieldProps {
    value: string;
    onChange: (value: string) => void;
    error?: string;
    disabled?: boolean;
}

const especialidades = [
    { value: 'clinica_geral', label: 'Clínica Geral' },
    { value: 'cardiologia', label: 'Cardiologia' },
    { value: 'dermatologia', label: 'Dermatologia' },
    { value: 'endocrinologia', label: 'Endocrinologia' },
    { value: 'ginecologia', label: 'Ginecologia' },
    { value: 'neurologia', label: 'Neurologia' },
    { value: 'ortopedia', label: 'Ortopedia' },
    { value: 'pediatria', label: 'Pediatria' },
    { value: 'psiquiatria', label: 'Psiquiatria' },
    { value: 'urologia', label: 'Urologia' }
];

export const EspecialidadeField: React.FC<EspecialidadeFieldProps> = ({
                                                                          value,
                                                                          onChange,
                                                                          error,
                                                                          disabled = false
                                                                      }) => {
    return (
        <div className="space-y-2">
            <Label htmlFor="especialidade" className="flex items-center gap-2">
                <Stethoscope className="w-4 h-4" />
                Especialidade *
            </Label>
            <Select value={value} onValueChange={onChange} disabled={disabled}>
                <SelectTrigger className={error ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Selecione a especialidade" />
                </SelectTrigger>
                <SelectContent>
                    {especialidades.map((especialidade) => (
                        <SelectItem key={especialidade.value} value={especialidade.value}>
                            {especialidade.label}
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