import React, { useMemo, useCallback } from 'react';
import { MultiSelect } from "@/components/ui/multi-select";
import { getExamesPorTipo } from '@/types/Agendamento';

interface SeletorExamesMultiplosProps {
    tipoExame: string;
    examesSelecionados: string[];
    onExamesChange: (exames: string[]) => void;
    disabled?: boolean;
    placeholder?: string;
    className?: string;
}

const SeletorExamesMultiplos: React.FC<SeletorExamesMultiplosProps> = ({
                                                                           tipoExame,
                                                                           examesSelecionados,
                                                                           onExamesChange,
                                                                           disabled = false,
                                                                           placeholder = "Selecione os exames...",
                                                                           className = ""
                                                                       }) => {
    // ✅ MEMORIZAR EXAMES DISPONÍVEIS - SEM RE-RENDER
    const examesDisponiveis = useMemo(() => {
        if (!tipoExame) return [];

        console.log('🔍 SeletorExamesMultiplos - Obtendo exames para:', tipoExame);
        const exames = getExamesPorTipo(tipoExame);
        console.log('📋 Exames encontrados:', exames.length);
        return exames;
    }, [tipoExame]);

    // ✅ HANDLER OTIMIZADO COM useCallback
    const handleExamesChange = useCallback((novosExames: string[]) => {
        console.log('🔄 SeletorExamesMultiplos onChange:', {
            tipoExame,
            anterior: examesSelecionados.length,
            novo: novosExames.length,
            exames: novosExames.slice(0, 3) // Log apenas primeiros 3
        });
        onExamesChange(novosExames);
    }, [tipoExame, examesSelecionados.length, onExamesChange]);

    // ✅ VERIFICAR SE HÁ EXAMES DISPONÍVEIS
    if (!examesDisponiveis || examesDisponiveis.length === 0) {
        return (
            <div className="p-4 border border-dashed border-gray-300 rounded-lg">
                <div className="text-sm text-muted-foreground text-center">
                    ⚠️ Nenhum exame disponível para: <strong>{tipoExame}</strong>
                </div>
                <div className="text-xs text-gray-400 mt-1">
                    Verifique se o tipo de exame está correto.
                </div>
            </div>
        );
    }

    return (
        <div className={`space-y-3 ${className}`}>
            {/* ✅ DEBUG COMPACTO - REMOVER EM PRODUÇÃO */}
            <div className="text-xs bg-blue-50 border border-blue-200 p-2 rounded">
                <strong>🔍 Debug:</strong>
                Tipo: <span className="font-mono">{tipoExame}</span> |
                Disponíveis: <span className="text-blue-600">{examesDisponiveis.length}</span> |
                Selecionados: <span className="text-green-600">{examesSelecionados.length}</span>
            </div>

            {/* ✅ COMPONENTE MULTISELECT OTIMIZADO */}
            <MultiSelect
                options={examesDisponiveis}
                onValueChange={handleExamesChange}
                defaultValue={examesSelecionados}
                placeholder={placeholder}
                variant="default"
                maxCount={5}
                disabled={disabled}
                className="w-full"
            />

            {/* ✅ FEEDBACK VISUAL DOS SELECIONADOS */}
            {examesSelecionados.length > 0 && (
                <div className="text-sm bg-green-50 border border-green-200 p-3 rounded">
                    <div className="font-medium text-green-800">
                        ✅ {examesSelecionados.length === 1
                        ? '1 exame selecionado'
                        : `${examesSelecionados.length} exames selecionados`}
                    </div>
                    <div className="text-xs text-green-600 mt-1">
                        {examesSelecionados.map(exame => {
                            const exameObj = examesDisponiveis.find(e => e.value === exame);
                            return exameObj?.label || exame;
                        }).join(', ')}
                    </div>
                </div>
            )}
        </div>
    );
};

// ✅ MEMORIZAR COMPONENTE PARA EVITAR RE-RENDERS DESNECESSÁRIOS
export default React.memo(SeletorExamesMultiplos);