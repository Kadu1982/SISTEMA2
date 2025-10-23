import React, { useState, useMemo } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { getExamesPorTipo } from '@/types/Agendamento';

interface SeletorExamesCheckboxProps {
    tipoExame: string;
    examesSelecionados: string[];
    onExamesChange: (exames: string[]) => void;
    disabled?: boolean;
    placeholder?: string;
    className?: string;
}

const SeletorExamesCheckbox: React.FC<SeletorExamesCheckboxProps> = ({
    tipoExame,
    examesSelecionados,
    onExamesChange,
    disabled = false,
    placeholder = "Buscar exames...",
    className = ""
}) => {
    const [busca, setBusca] = useState('');

    // Obter exames disponíveis
    const examesDisponiveis = useMemo(() => {
        if (!tipoExame) return [];
        return getExamesPorTipo(tipoExame);
    }, [tipoExame]);

    // Filtrar exames pela busca
    const examesFiltrados = useMemo(() => {
        if (!busca.trim()) return examesDisponiveis;
        return examesDisponiveis.filter(exame =>
            exame.label.toLowerCase().includes(busca.toLowerCase())
        );
    }, [examesDisponiveis, busca]);

    // Toggle de um exame específico
    const toggleExame = (value: string) => {
        if (disabled) return;

        const novaLista = examesSelecionados.includes(value)
            ? examesSelecionados.filter(e => e !== value)
            : [...examesSelecionados, value];

        console.log('🔄 SeletorExamesCheckbox - Toggling:', value);
        console.log('📋 Nova lista:', novaLista);

        onExamesChange(novaLista);
    };

    // Selecionar todos
    const selecionarTodos = () => {
        if (disabled) return;
        const todosValores = examesFiltrados.map(e => e.value);
        onExamesChange(todosValores);
    };

    // Limpar seleção
    const limparTodos = () => {
        if (disabled) return;
        onExamesChange([]);
    };

    if (examesDisponiveis.length === 0) {
        return (
            <div className="p-4 border border-dashed border-gray-300 rounded-lg bg-gray-50">
                <div className="text-sm text-gray-600 text-center">
                    ⚠️ Nenhum exame disponível para: <strong>{tipoExame}</strong>
                </div>
            </div>
        );
    }

    return (
        <div className={`space-y-3 ${className}`}>
            {/* Header com contador e ações */}
            <div className="flex items-center justify-between">
                <div className="text-sm font-medium text-gray-700">
                    {examesSelecionados.length > 0 ? (
                        <Badge variant="default" className="bg-green-500">
                            {examesSelecionados.length} selecionado{examesSelecionados.length !== 1 ? 's' : ''}
                        </Badge>
                    ) : (
                        <span className="text-gray-500">Nenhum exame selecionado</span>
                    )}
                </div>
                <div className="flex gap-2">
                    {examesSelecionados.length > 0 && (
                        <button
                            type="button"
                            onClick={limparTodos}
                            disabled={disabled}
                            className="text-xs text-red-600 hover:text-red-700 font-medium disabled:opacity-50"
                        >
                            Limpar
                        </button>
                    )}
                    <button
                        type="button"
                        onClick={selecionarTodos}
                        disabled={disabled}
                        className="text-xs text-blue-600 hover:text-blue-700 font-medium disabled:opacity-50"
                    >
                        Selecionar todos
                    </button>
                </div>
            </div>

            {/* Campo de busca */}
            <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                    placeholder={placeholder}
                    value={busca}
                    onChange={(e) => setBusca(e.target.value)}
                    disabled={disabled}
                    className="pl-10"
                />
            </div>

            {/* Lista de exames com checkboxes */}
            <div className="border rounded-lg bg-white">
                <div className="h-[300px] overflow-y-auto p-4">
                    {examesFiltrados.length === 0 ? (
                        <div className="text-center text-sm text-gray-500 py-8">
                            Nenhum exame encontrado para "{busca}"
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {examesFiltrados.map((exame) => {
                                const isChecked = examesSelecionados.includes(exame.value);

                                return (
                                    <div
                                        key={exame.value}
                                        className={`flex items-start space-x-3 p-3 rounded-lg border transition-colors ${
                                            isChecked
                                                ? 'bg-blue-50 border-blue-300'
                                                : 'bg-white border-gray-200 hover:bg-gray-50'
                                        } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                                        onClick={() => toggleExame(exame.value)}
                                    >
                                        <Checkbox
                                            id={`exame-${exame.value}`}
                                            checked={isChecked}
                                            onCheckedChange={() => toggleExame(exame.value)}
                                            disabled={disabled}
                                            className="mt-0.5"
                                        />
                                        <Label
                                            htmlFor={`exame-${exame.value}`}
                                            className={`flex-1 cursor-pointer text-sm leading-relaxed ${
                                                isChecked ? 'font-medium text-blue-900' : 'text-gray-700'
                                            }`}
                                        >
                                            {exame.label}
                                        </Label>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* Resumo dos selecionados */}
            {examesSelecionados.length > 0 && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="text-xs font-medium text-green-800 mb-2">
                        ✅ Exames selecionados ({examesSelecionados.length}):
                    </div>
                    <div className="flex flex-wrap gap-1">
                        {examesSelecionados.map(value => {
                            const exame = examesDisponiveis.find(e => e.value === value);
                            return (
                                <Badge
                                    key={value}
                                    variant="secondary"
                                    className="text-xs bg-green-100 text-green-800"
                                >
                                    {exame?.label || value}
                                </Badge>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
};

export default SeletorExamesCheckbox;
