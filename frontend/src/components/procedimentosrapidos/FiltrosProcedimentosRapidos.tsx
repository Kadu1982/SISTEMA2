import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon, Filter, X } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { StatusProcedimento } from "@/services/procedimentosRapidosService";

interface FiltrosProcedimentosRapidosProps {
  dataInicio?: Date;
  dataFim?: Date;
  statusesSelecionados: StatusProcedimento[];
  especialidade?: string;
  termoPesquisa?: string;
  onDataInicioChange: (date: Date | undefined) => void;
  onDataFimChange: (date: Date | undefined) => void;
  onStatusesChange: (statuses: StatusProcedimento[]) => void;
  onEspecialidadeChange: (especialidade: string) => void;
  onTermoPesquisaChange: (termo: string) => void;
  onLimparFiltros: () => void;
}

const SITUACOES_DISPONIVEIS: Array<{ value: StatusProcedimento; label: string }> = [
  { value: StatusProcedimento.AGUARDANDO, label: "Aguardando" },
  { value: StatusProcedimento.EM_ATENDIMENTO, label: "Em Atendimento" },
  { value: StatusProcedimento.FINALIZADO, label: "Finalizado" },
  { value: StatusProcedimento.CANCELADO, label: "Cancelado" },
];

const FiltrosProcedimentosRapidos: React.FC<FiltrosProcedimentosRapidosProps> = ({
  dataInicio,
  dataFim,
  statusesSelecionados,
  especialidade,
  termoPesquisa,
  onDataInicioChange,
  onDataFimChange,
  onStatusesChange,
  onEspecialidadeChange,
  onTermoPesquisaChange,
  onLimparFiltros,
}) => {
  const [mostrarFiltros, setMostrarFiltros] = useState(false);

  const toggleStatus = (status: StatusProcedimento) => {
    if (statusesSelecionados.includes(status)) {
      onStatusesChange(statusesSelecionados.filter((s) => s !== status));
    } else {
      onStatusesChange([...statusesSelecionados, status]);
    }
  };

  const temFiltrosAtivos =
    dataInicio ||
    dataFim ||
    statusesSelecionados.length > 0 ||
    especialidade ||
    termoPesquisa;

  return (
    <Card className="mb-6">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Filtros
          </CardTitle>
          {temFiltrosAtivos && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onLimparFiltros}
              className="text-xs"
            >
              <X className="h-3 w-3 mr-1" />
              Limpar
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Campo de Pesquisa */}
        <div>
          <Label htmlFor="pesquisa">Pesquisa</Label>
          <Input
            id="pesquisa"
            placeholder="Código, nome do paciente, profissional, setor..."
            value={termoPesquisa || ""}
            onChange={(e) => onTermoPesquisaChange(e.target.value)}
            className="mt-1"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Filtro por Período - Data Início */}
          <div>
            <Label>Data Início</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal mt-1",
                    !dataInicio && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dataInicio ? (
                    format(dataInicio, "dd/MM/yyyy", { locale: ptBR })
                  ) : (
                    <span>Selecione a data</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={dataInicio}
                  onSelect={onDataInicioChange}
                  initialFocus
                  locale={ptBR}
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Filtro por Período - Data Fim */}
          <div>
            <Label>Data Fim</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal mt-1",
                    !dataFim && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dataFim ? (
                    format(dataFim, "dd/MM/yyyy", { locale: ptBR })
                  ) : (
                    <span>Selecione a data</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={dataFim}
                  onSelect={onDataFimChange}
                  initialFocus
                  locale={ptBR}
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Filtro por Especialidade/Setor */}
          <div>
            <Label htmlFor="especialidade">Setor/Especialidade</Label>
            <Input
              id="especialidade"
              placeholder="Digite o setor ou especialidade"
              value={especialidade || ""}
              onChange={(e) => onEspecialidadeChange(e.target.value)}
              className="mt-1"
            />
          </div>
        </div>

        {/* Filtro por Situação (múltipla seleção) */}
        <div>
          <Label>Situação</Label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-2">
            {SITUACOES_DISPONIVEIS.map((situacao) => (
              <div key={situacao.value} className="flex items-center space-x-2">
                <Checkbox
                  id={`situacao-${situacao.value}`}
                  checked={statusesSelecionados.includes(situacao.value)}
                  onCheckedChange={() => toggleStatus(situacao.value)}
                />
                <Label
                  htmlFor={`situacao-${situacao.value}`}
                  className="text-sm font-normal cursor-pointer"
                >
                  {situacao.label}
                </Label>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default FiltrosProcedimentosRapidos;

