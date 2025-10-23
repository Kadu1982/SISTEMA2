import React from "react";
import {
    format,
    startOfMonth,
    endOfMonth,
    eachDayOfInterval,
    isSameMonth,
    isSameDay,
    isToday,
    parseISO,
} from "date-fns";
import { ptBR } from "date-fns/locale";
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";
import { Button } from "./button";
import { cn } from "@/lib/utils";

/**
 * Calendário com indicadores (bolinha/contador).
 * -----------------------------------------------------------------------------
 * Compatibilidade de dados:
 * - Aceita array no padrão do seu projeto: [{ data: "YYYY-MM-DD", quantidade: number }]
 * - Aceita array alternativo:                 [{ date: "YYYY-MM-DD", count: number }]
 * - Aceita índice objeto:                     { "YYYY-MM-DD": number }
 *
 * Identidade visual: mantida (shadcn + Tailwind).
 */

type IndicadoresArrayPT = Array<{ data: string; quantidade: number }>;
type IndicadoresArrayEN = Array<{ date: string; count: number }>;
type IndicadoresIndex = Record<string, number>;

interface CalendarWithIndicatorsProps {
    /** Data selecionada no formato ISO "yyyy-MM-dd" */
    selectedDate: string;
    /** Callback quando o usuário escolhe um dia (formato ISO "yyyy-MM-dd") */
    onDateSelect: (date: string) => void;
    /** Dias com indicadores (aceita PT, EN ou índice) */
    datesWithIndicators?: IndicadoresArrayPT | IndicadoresArrayEN | IndicadoresIndex;
    /** Exibe estado de carregamento (desabilita navegação/itens) */
    isLoading?: boolean;
    className?: string;
}

/** Normaliza qualquer formato recebido para um índice { "YYYY-MM-DD": count } */
function toIndex(
    src?: CalendarWithIndicatorsProps["datesWithIndicators"]
): IndicadoresIndex {
    if (!src) return {};
    if (Array.isArray(src)) {
        const idx: IndicadoresIndex = {};
        for (const item of src) {
            // cobre { data, quantidade } e { date, count }
            const key =
                (item as any).data?.slice(0, 10) ?? (item as any).date?.slice(0, 10);
            const val =
                Number((item as any).quantidade ?? (item as any).count ?? 0) || 0;
            if (key) idx[key] = val;
        }
        return idx;
    }
    // já é índice
    return src as IndicadoresIndex;
}

/** Parse seguro: se vier vazio/ inválido, cai para "hoje" */
function parseIsoDateSafe(iso?: string): Date {
    if (!iso) return new Date();
    try {
        // parseISO lida melhor com strings ISO que new Date(...)
        const d = parseISO(iso);
        return isNaN(d.getTime()) ? new Date() : d;
    } catch {
        return new Date();
    }
}

export const CalendarWithIndicators: React.FC<CalendarWithIndicatorsProps> = ({
                                                                                  selectedDate,
                                                                                  onDateSelect,
                                                                                  datesWithIndicators = [],
                                                                                  isLoading = false,
                                                                                  className,
                                                                              }) => {
    // Estado do mês corrente exibido
    const selected = parseIsoDateSafe(selectedDate);
    const [currentMonth, setCurrentMonth] = React.useState<Date>(
        new Date(selected.getFullYear(), selected.getMonth(), 1)
    );

    // Cálculo de dias do mês
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

    // Índice normalizado { "YYYY-MM-DD": count }
    const index = React.useMemo(() => toIndex(datesWithIndicators), [datesWithIndicators]);

    // Navegação
    const goToPreviousMonth = () => {
        if (isLoading) return;
        setCurrentMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
    };
    const goToNextMonth = () => {
        if (isLoading) return;
        setCurrentMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
    };
    const goToToday = () => {
        if (isLoading) return;
        const today = new Date();
        setCurrentMonth(new Date(today.getFullYear(), today.getMonth(), 1));
        onDateSelect(format(today, "yyyy-MM-dd"));
    };

    // Clique em um dia
    const handleDateClick = (date: Date) => {
        if (isLoading) return;
        onDateSelect(format(date, "yyyy-MM-dd"));
    };

    // Busca contador para um dia
    const getCountForDate = (date: Date) => {
        const key = format(date, "yyyy-MM-dd");
        return index[key] ?? 0;
    };

    // Total de dias com indicador (para legenda)
    const totalDiasComIndicador = React.useMemo(
        () => Object.values(index).filter((v) => (v || 0) > 0).length,
        [index]
    );

    return (
        <div className={cn("bg-white border border-gray-200 rounded-lg shadow-sm p-4", className)}>
            {/* Cabeçalho do Calendário */}
            <div className="flex items-center justify-between mb-4">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={goToPreviousMonth}
                    className="h-8 w-8 p-0"
                    aria-label="Mês anterior"
                    disabled={isLoading}
                >
                    <ChevronLeft className="h-4 w-4" />
                </Button>

                <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-blue-600" />
                    <h3 className="font-semibold text-gray-900">
                        {format(currentMonth, "MMMM yyyy", { locale: ptBR })}
                    </h3>
                </div>

                <Button
                    variant="outline"
                    size="sm"
                    onClick={goToNextMonth}
                    className="h-8 w-8 p-0"
                    aria-label="Próximo mês"
                    disabled={isLoading}
                >
                    <ChevronRight className="h-4 w-4" />
                </Button>
            </div>

            {/* Botão Hoje */}
            <div className="flex justify-center mb-3">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={goToToday}
                    className="text-blue-600 border-blue-300 hover:bg-blue-50"
                    disabled={isLoading}
                >
                    Ir para Hoje
                </Button>
            </div>

            {/* Dias da Semana */}
            <div className="grid grid-cols-7 gap-1 mb-2">
                {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map((day) => (
                    <div
                        key={day}
                        className="h-8 flex items-center justify-center text-xs font-medium text-gray-500"
                    >
                        {day}
                    </div>
                ))}
            </div>

            {/* Calendário - Dias do mês atual */}
            <div className="grid grid-cols-7 gap-1">
                {daysInMonth.map((date) => {
                    const inMonth = isSameMonth(date, currentMonth); // sempre true pois listamos só o mês
                    const isSelected = isSameDay(date, selected);
                    const today = isToday(date);
                    const count = getCountForDate(date);
                    const hasIndicator = count > 0;

                    return (
                        <button
                            key={format(date, "yyyy-MM-dd")}
                            onClick={() => handleDateClick(date)}
                            disabled={!inMonth || isLoading}
                            className={cn(
                                "relative h-9 w-full rounded-md text-sm font-medium transition-all duration-200",
                                "hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1",
                                {
                                    "bg-blue-600 text-white hover:bg-blue-700": isSelected, // selecionado
                                    "bg-blue-100 text-blue-900 font-bold": today && !isSelected, // hoje
                                    "text-gray-900": inMonth && !isSelected && !today, // dia normal
                                    "text-gray-300 cursor-not-allowed": !inMonth, // fora do mês (não ocorre)
                                    "ring-2 ring-green-400 bg-green-50": hasIndicator && !isSelected && !today, // com indicador
                                    "opacity-50 cursor-wait": isLoading, // loading
                                }
                            )}
                            aria-pressed={isSelected}
                            aria-label={format(date, "PPPP", { locale: ptBR })}
                        >
                            <span className="relative z-10">{format(date, "d")}</span>

                            {/* Indicador visual com contador */}
                            {hasIndicator && (
                                <div className="absolute -top-1 -right-1 z-20">
                                    <div
                                        className={cn(
                                            "h-3 min-w-3 px-0.5 rounded-full text-[10px] leading-none font-bold",
                                            "flex items-center justify-center",
                                            "bg-green-500 text-white shadow-sm",
                                            { "bg-white text-green-600": isSelected }
                                        )}
                                        title={`${count} recepcionado${count !== 1 ? "s" : ""}`}
                                    >
                                        {count > 9 ? "9+" : count}
                                    </div>
                                </div>
                            )}
                        </button>
                    );
                })}
            </div>

            {/* Legenda */}
            <div className="mt-4 pt-3 border-t border-gray-100">
                <div className="flex items-center justify-between text-xs text-gray-600">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1">
                            <div className="h-3 w-3 bg-blue-600 rounded" />
                            <span>Selecionado</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <div className="h-3 w-3 bg-green-500 rounded" />
                            <span>Com Recepcionados</span>
                        </div>
                    </div>
                    <div className="text-right">
                        <span>Total: {totalDiasComIndicador} dia(s)</span>
                    </div>
                </div>
            </div>
        </div>
    );
};
