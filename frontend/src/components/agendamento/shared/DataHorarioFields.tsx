import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Calendar, Clock } from 'lucide-react';

interface DataHorarioFieldsProps {
    data: string;
    horario: string;
    onDataChange: (value: string) => void;
    onHorarioChange: (value: string) => void;
    errors: {
        data?: string;
        horario?: string;
    };
    disabled?: boolean;
}

export const DataHorarioFields: React.FC<DataHorarioFieldsProps> = ({
                                                                        data,
                                                                        horario,
                                                                        onDataChange,
                                                                        onHorarioChange,
                                                                        errors,
                                                                        disabled = false
                                                                    }) => {
    // Data mínima: hoje
    const dataMinima = new Date().toISOString().split('T')[0];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Data */}
            <div className="space-y-2">
                <Label htmlFor="data" className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Data *
                </Label>
                <Input
                    id="data"
                    type="date"
                    value={data}
                    onChange={(e) => onDataChange(e.target.value)}
                    min={dataMinima}
                    disabled={disabled}
                    className={errors.data ? 'border-red-500' : ''}
                />
                {errors.data && (
                    <p className="text-red-500 text-sm">{errors.data}</p>
                )}
            </div>

            {/* Horário */}
            <div className="space-y-2">
                <Label htmlFor="horario" className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Horário *
                </Label>
                <Input
                    id="horario"
                    type="time"
                    value={horario}
                    onChange={(e) => onHorarioChange(e.target.value)}
                    min="07:00"
                    max="18:00"
                    step="900" // 15 minutos
                    disabled={disabled}
                    className={errors.horario ? 'border-red-500' : ''}
                />
                {errors.horario && (
                    <p className="text-red-500 text-sm">{errors.horario}</p>
                )}
            </div>
        </div>
    );
};