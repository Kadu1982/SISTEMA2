import React from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertTriangle } from 'lucide-react';

interface PrioridadeFieldProps {
    value: string;
    onChange: (value: string) => void;
    error?: string;
    disabled?: boolean;
}

const prioridades = [
    { value: 'normal', label: 'Normal', color: 'text-green-600' },
    { value: 'urgente', label: 'Urgente', color: 'text-yellow-600' },
    { value: 'emergencia', label: 'Emergência', color: 'text-red-600' }
];

export const PrioridadeField: React.FC<PrioridadeFieldProps> = ({
                                                                    value,
                                                                    onChange,
                                                                    error,
                                                                    disabled = false
                                                                }) => {
    return (
        <div className="space-y-2">
            <Label htmlFor="prioridade" className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                Prioridade *
            </Label>
            <Select value={value} onValueChange={onChange} disabled={disabled}>
                <SelectTrigger className={error ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Selecione a prioridade" />
                </SelectTrigger>
                <SelectContent>
                    {prioridades.map((prioridade) => (
                        <SelectItem key={prioridade.value} value={prioridade.value}>
              <span className={prioridade.color}>
                {prioridade.label}
              </span>
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