// src/components/atendimento/RemumeBusca.tsx
// -----------------------------------------------------------------------------
// Busca de Medicamentos REMUME (Relação Municipal de Medicamentos Essenciais)
// Similar ao CidBusca, mas para medicamentos do REMUME
// -----------------------------------------------------------------------------

import React, { useState, useEffect, useRef, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, X, Loader2 } from "lucide-react";
import { MedicamentoRemume } from "@/types/Remume";
import medicamentosRemume from "@/data/remume-medicamentos.json";

interface RemumeBuscaProps {
    onMedicamentoSelecionado: (medicamento: MedicamentoRemume | null) => void;
    medicamentoSelecionado: MedicamentoRemume | null;
    placeholder?: string;
    disabled?: boolean;
    /** caracteres mínimos para iniciar a busca (padrão: 2) */
    minChars?: number;
}

const RemumeBusca: React.FC<RemumeBuscaProps> = ({
                                                      onMedicamentoSelecionado,
                                                      medicamentoSelecionado,
                                                      placeholder = "Busque medicamentos do REMUME...",
                                                      disabled = false,
                                                      minChars = 2,
                                                  }) => {
    const [busca, setBusca] = useState("");
    const [resultados, setResultados] = useState<MedicamentoRemume[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [showResultados, setShowResultados] = useState(false);
    const [activeIndex, setActiveIndex] = useState<number>(-1);

    // refs
    const containerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Converte o JSON para o tipo MedicamentoRemume
    const medicamentosLista = useMemo(() => {
        const data = Array.isArray(medicamentosRemume) ? medicamentosRemume : [];
        return data.map((med: any, idx: number): MedicamentoRemume => ({
            id: med.id || idx + 1,
            nome: med.nome || "",
            apresentacao: med.apresentacao || "",
            principioAtivo: med.principioAtivo || "",
            concentracao: med.concentracao || "",
            formaFarmaceutica: med.formaFarmaceutica || "",
            codigo: med.codigo || "",
            ativo: med.ativo !== undefined ? med.ativo : true,
        }));
    }, []);

    // ----------------------------- efeitos -----------------------------------

    // Mostra o texto do medicamento selecionado quando vier por prop
    useEffect(() => {
        if (medicamentoSelecionado) {
            const texto = medicamentoSelecionado.apresentacao
                ? `${medicamentoSelecionado.nome} ${medicamentoSelecionado.apresentacao}`
                : medicamentoSelecionado.nome;
            setBusca(texto);
            setShowResultados(false);
            setResultados([]);
            setActiveIndex(-1);
        }
    }, [medicamentoSelecionado]);

    // Clique fora fecha a lista
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setShowResultados(false);
                setActiveIndex(-1);
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    // Debounce de busca
    useEffect(() => {
        // Não busca se já tem medicamento selecionado (evita loop)
        if (medicamentoSelecionado) {
            return;
        }

        // limpa último timer
        if (debounceRef.current) clearTimeout(debounceRef.current);

        const termo = busca.trim().toLowerCase();
        if (termo.length >= minChars) {
            setIsLoading(true);
            debounceRef.current = setTimeout(() => {
                buscarMedicamentos(termo);
                setIsLoading(false);
            }, 300);
        } else {
            setResultados([]);
            setShowResultados(false);
            setActiveIndex(-1);
            setIsLoading(false);
        }

        return () => {
            if (debounceRef.current) clearTimeout(debounceRef.current);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [busca, minChars, medicamentoSelecionado]);

    // ------------------------------ busca -------------------------------------

    const buscarMedicamentos = (termo: string) => {
        const termoLower = termo.toLowerCase();

        // Filtra medicamentos ativos que contenham o termo no nome, princípio ativo ou apresentação
        const filtrados = medicamentosLista
            .filter((med) => {
                if (!med.ativo) return false;

                const nomeMatch = med.nome.toLowerCase().includes(termoLower);
                const principioMatch = med.principioAtivo?.toLowerCase().includes(termoLower);
                const apresentacaoMatch = med.apresentacao?.toLowerCase().includes(termoLower);
                const formaMatch = med.formaFarmaceutica?.toLowerCase().includes(termoLower);

                return nomeMatch || principioMatch || apresentacaoMatch || formaMatch;
            })
            .slice(0, 10); // Limita a 10 resultados

        setResultados(filtrados);
        setShowResultados(true);
        setActiveIndex(filtrados.length > 0 ? 0 : -1);
    };

    // --------------------------- handlers UI ----------------------------------

    const handleSelecionarMedicamento = (med: MedicamentoRemume) => {
        onMedicamentoSelecionado(med);
        const texto = med.apresentacao ? `${med.nome} ${med.apresentacao}` : med.nome;
        setBusca(texto);
        setShowResultados(false);
        setResultados([]);
        setActiveIndex(-1);
    };

    const handleLimpar = () => {
        setBusca("");
        setResultados([]);
        setShowResultados(false);
        setActiveIndex(-1);
        onMedicamentoSelecionado(null);
        inputRef.current?.focus();
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const valor = e.target.value;
        setBusca(valor);
        if (!valor.trim()) onMedicamentoSelecionado(null);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (!showResultados || resultados.length === 0) return;

        if (e.key === "ArrowDown") {
            e.preventDefault();
            setActiveIndex((i) => (i < resultados.length - 1 ? i + 1 : 0));
        } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setActiveIndex((i) => (i > 0 ? i - 1 : resultados.length - 1));
        } else if (e.key === "Enter") {
            e.preventDefault();
            if (activeIndex >= 0 && activeIndex < resultados.length) {
                handleSelecionarMedicamento(resultados[activeIndex]);
            }
        } else if (e.key === "Escape") {
            setShowResultados(false);
            setActiveIndex(-1);
        }
    };

    return (
        <div ref={containerRef} className="relative w-full">
            {/* INPUT */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                    ref={inputRef}
                    type="text"
                    value={busca}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    placeholder={placeholder}
                    disabled={disabled}
                    className="pl-10 pr-10"
                    onFocus={() => {
                        // Só mostra resultados se não houver medicamento selecionado
                        if (!medicamentoSelecionado && resultados.length > 0) {
                            setShowResultados(true);
                        }
                    }}
                />

                {/* LOADING */}
                {isLoading && (
                    <Loader2 className="absolute right-8 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-gray-400" />
                )}

                {/* LIMPAR */}
                {busca && !isLoading && (
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 p-0"
                        onClick={handleLimpar}
                    >
                        <X className="h-4 w-4" />
                    </Button>
                )}
            </div>

            {/* RESULTADOS */}
            {showResultados && resultados.length > 0 && !medicamentoSelecionado && (
                <Card className="absolute top-full left-0 right-0 z-50 mt-1 max-h-60 overflow-y-auto shadow-lg">
                    <CardContent className="p-0">
                        {resultados.map((med, idx) => {
                            const active = idx === activeIndex;
                            return (
                                <div
                                    key={med.id}
                                    className={`p-3 cursor-pointer border-b last:border-b-0 transition-colors ${
                                        active ? "bg-blue-50" : "hover:bg-gray-50"
                                    }`}
                                    onMouseEnter={() => setActiveIndex(idx)}
                                    onClick={() => handleSelecionarMedicamento(med)}
                                >
                                    <div className="flex justify-between items-start gap-2">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <p className="text-sm font-semibold text-blue-900">{med.nome}</p>
                                                {med.apresentacao && (
                                                    <Badge variant="outline" className="text-xs">
                                                        {med.apresentacao}
                                                    </Badge>
                                                )}
                                            </div>
                                            {med.principioAtivo && (
                                                <p className="text-xs text-gray-600 mt-1">
                                                    {med.principioAtivo}
                                                    {med.formaFarmaceutica && ` • ${med.formaFarmaceutica}`}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </CardContent>
                </Card>
            )}

            {/* NADA ENCONTRADO */}
            {showResultados && resultados.length === 0 && !isLoading && busca.trim().length >= minChars && !medicamentoSelecionado && (
                <Card className="absolute top-full left-0 right-0 z-50 mt-1 shadow-lg">
                    <CardContent className="p-4 text-center text-gray-500">
                        <Search className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                        <p className="text-sm">
                            Nenhum medicamento encontrado para "<span className="font-medium">{busca}</span>"
                        </p>
                        <p className="text-xs mt-1">Tente buscar pelo nome do medicamento ou princípio ativo.</p>
                    </CardContent>
                </Card>
            )}
        </div>
    );
};

export default RemumeBusca;

