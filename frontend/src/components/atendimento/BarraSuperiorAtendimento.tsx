// src/components/atendimento/BarraSuperiorAtendimento.tsx
// -----------------------------------------------------------------------------
// Barra Superior Fixa com Informações do Paciente e Timer de Atendimento
// -----------------------------------------------------------------------------

import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Clock, User, MapPin, Stethoscope, Settings, Search, RefreshCw, Maximize2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface BarraSuperiorAtendimentoProps {
    pacienteNome?: string;
    pacienteIdade?: number | null;
    pacienteSexo?: string;
    pacienteMunicipio?: string;
    pacienteEndereco?: string;
    unidadeSaude?: string;
    setor?: string;
    especialidade?: string;
    dataInicioAtendimento?: Date | string;
    onSettingsClick?: () => void;
    onSearchClick?: () => void;
    onRefreshClick?: () => void;
    onExpandClick?: () => void;
}

export const BarraSuperiorAtendimento: React.FC<BarraSuperiorAtendimentoProps> = ({
    pacienteNome,
    pacienteIdade,
    pacienteSexo,
    pacienteMunicipio,
    pacienteEndereco,
    unidadeSaude,
    setor,
    especialidade,
    dataInicioAtendimento,
    onSettingsClick,
    onSearchClick,
    onRefreshClick,
    onExpandClick,
}) => {
    const [tempoDecorrido, setTempoDecorrido] = useState<string>("00:00:00");

    // Calcula o tempo decorrido desde o início do atendimento
    useEffect(() => {
        if (!dataInicioAtendimento) {
            setTempoDecorrido("00:00:00");
            return;
        }

        const calcularTempo = () => {
            const inicio = new Date(dataInicioAtendimento);
            const agora = new Date();
            const diff = agora.getTime() - inicio.getTime();

            const horas = Math.floor(diff / (1000 * 60 * 60));
            const minutos = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const segundos = Math.floor((diff % (1000 * 60)) / 1000);

            setTempoDecorrido(
                `${String(horas).padStart(2, "0")}:${String(minutos).padStart(2, "0")}:${String(segundos).padStart(2, "0")}`
            );
        };

        calcularTempo();
        const interval = setInterval(calcularTempo, 1000);

        return () => clearInterval(interval);
    }, [dataInicioAtendimento]);

    if (!pacienteNome) {
        return null;
    }

    return (
        <div className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
            <div className="container mx-auto px-4 py-3">
                <div className="flex items-center justify-between gap-4">
                    {/* Informações do Paciente */}
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 flex-wrap">
                            <div className="flex items-center gap-2 min-w-0">
                                <User className="h-5 w-5 text-blue-600 flex-shrink-0" />
                                <div className="min-w-0">
                                    <div className="font-semibold text-gray-900 truncate">
                                        {pacienteNome}
                                        {pacienteIdade !== null && pacienteIdade !== undefined && (
                                            <span className="text-gray-600 font-normal ml-2">
                                                {pacienteIdade} {pacienteIdade === 1 ? "ano" : "anos"}
                                            </span>
                                        )}
                                        {pacienteSexo && (
                                            <Badge variant="outline" className="ml-2 text-xs">
                                                {pacienteSexo}
                                            </Badge>
                                        )}
                                    </div>
                                    {pacienteMunicipio && (
                                        <div className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                                            <MapPin className="h-3 w-3" />
                                            <span className="truncate">{pacienteMunicipio}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                        {pacienteEndereco && (
                            <div className="text-xs text-gray-500 mt-1 truncate">{pacienteEndereco}</div>
                        )}
                    </div>

                    {/* Informações do Atendimento */}
                    <div className="flex items-center gap-4 flex-wrap">
                        {setor && (
                            <div className="flex items-center gap-1 text-sm text-gray-600">
                                <Stethoscope className="h-4 w-4" />
                                <span className="truncate max-w-[150px]">{setor}</span>
                            </div>
                        )}
                        {especialidade && (
                            <div className="text-sm text-gray-600 truncate max-w-[200px]">{especialidade}</div>
                        )}
                    </div>

                    {/* Timer de Atendimento */}
                    <div className="flex items-center gap-2 bg-blue-50 px-3 py-1.5 rounded-md border border-blue-200">
                        <Clock className="h-4 w-4 text-blue-600" />
                        <div className="text-sm font-mono font-semibold text-blue-900">
                            <span className="text-xs text-gray-600 mr-1">Tempo de atendimento</span>
                            <div className="flex items-center gap-1">
                                <span>{tempoDecorrido.split(":")[0]}</span>
                                <span className="text-gray-400">:</span>
                                <span>{tempoDecorrido.split(":")[1]}</span>
                                <span className="text-gray-400">:</span>
                                <span>{tempoDecorrido.split(":")[2]}</span>
                            </div>
                        </div>
                    </div>

                    {/* Botões de Ação */}
                    <div className="flex items-center gap-2">
                        {onSearchClick && (
                            <Button variant="ghost" size="icon" onClick={onSearchClick} title="Pesquisar">
                                <Search className="h-4 w-4" />
                            </Button>
                        )}
                        {onRefreshClick && (
                            <Button variant="ghost" size="icon" onClick={onRefreshClick} title="Atualizar">
                                <RefreshCw className="h-4 w-4" />
                            </Button>
                        )}
                        {onExpandClick && (
                            <Button variant="ghost" size="icon" onClick={onExpandClick} title="Expandir painel">
                                <Maximize2 className="h-4 w-4" />
                            </Button>
                        )}
                        {onSettingsClick && (
                            <Button variant="ghost" size="icon" onClick={onSettingsClick} title="Configurações">
                                <Settings className="h-4 w-4" />
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

