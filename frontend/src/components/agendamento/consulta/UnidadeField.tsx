import React from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MapPin } from 'lucide-react';

interface UnidadeFieldProps {
    value: string;
    onChange: (value: string) => void;
    error?: string;
    disabled?: boolean;
}

const unidades = [
    { value: 'ubs_centro', label: 'UBS Centro' },
    { value: 'ubs_norte', label: 'UBS Norte' },
    { value: 'ubs_sul', label: 'UBS Sul' },
    { value: 'policlinica', label: 'Policlínica Municipal' },
    { value: 'hospital', label: 'Hospital Municipal' }
];

export const UnidadeField: React.FC<UnidadeFieldProps> = ({
                                                              value,
                                                              onChange,
                                                              error,
                                                              disabled = false
                                                          }) => {
    return (
        <div className="space-y-2">
            <Label htmlFor="unidade" className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Unidade de Saúde *
            </Label>
            <Select value={value} onValueChange={onChange} disabled={disabled}>
                <SelectTrigger className={error ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Selecione a unidade" />
                </SelectTrigger>
                <SelectContent>
                    {unidades.map((unidade) => (
                        <SelectItem key={unidade.value} value={unidade.value}>
                            {unidade.label}
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