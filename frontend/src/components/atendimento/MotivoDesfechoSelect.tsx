// src/components/atendimento/MotivoDesfechoSelect.tsx
// -----------------------------------------------------------------------------
// Componente controlado para seleção do Motivo de Desfecho (+ Especialidade).
// - Garante SEMPRE retornar UM ÚNICO elemento React (div) -> evita erro no <Slot/>.
// - Nunca retorna null/false no caminho feliz (mantém a árvore estável).
// - Mostra a seleção de Especialidade SOMENTE quando o motivo = "03" (Encaminhamento).
// - Exposição via props para integração com react-hook-form (on*Change, values).
// - Mantém a identidade visual (usa Select do seu design system shadcn/ui).
// -----------------------------------------------------------------------------

import React, { useEffect, useMemo, useState } from "react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

// -------------------- Tipos --------------------

export interface MotivoDesfecho {
    codigo: string;
    nome: string;
    descricao?: string;
}

export interface MotivoDesfechoSelectProps {
    // Valores controlados
    motivoValue?: string;                 // ex.: "01", "02", "03", ...
    especialidadeValue?: string;          // ex.: "CARDIOLOGIA", "PEDIATRIA", ...
    tiposCuidadosValue?: string[];        // ex.: ["VACINAS", "MEDICACAO"]
    // Callbacks para o form pai (react-hook-form)
    onMotivoChange?: (value: string) => void;
    onEspecialidadeChange?: (value: string) => void;
    onTiposCuidadosChange?: (value: string[]) => void;

    // Estado geral
    disabled?: boolean;

    // Placeholders customizáveis
    placeholderMotivo?: string;
    placeholderEspecialidade?: string;

    // Lista custom de especialidades (opcional). Se não vier, usa a lista padrão.
    especialidadesLista?: string[];
}

// -------------------- Constantes --------------------

// Motivos oficiais (exemplo compatível com seu back; mantenha conforme seu domínio)
const MOTIVOS_PADRAO: MotivoDesfecho[] = [
    { codigo: "01", nome: "Alta", descricao: "Saída do paciente com alta" },
    { codigo: "03", nome: "Encaminhamento", descricao: "Encaminhamento para outro serviço" },
    { codigo: "05", nome: "Internação", descricao: "Internação no hospital" },
    { codigo: "06", nome: "Contra-referência", descricao: "Retorno ao serviço de origem" },
    { codigo: "08", nome: "Retorno", descricao: "Retorno para continuidade" },
    { codigo: "09", nome: "Transferência", descricao: "Transferência para outro serviço" },
    { codigo: "10", nome: "Cuidados de Enfermagem", descricao: "Encaminhamento para procedimentos rápidos de enfermagem" },
    { codigo: "99", nome: "Sem registro", descricao: "Não consta no modelo de origem" },
];

// Lista padrão de especialidades (ajuste conforme catálogo do seu município/serviço)
const ESPECIALIDADES_PADRAO = [
    "ALERGOLOGIA",
    "ANGIOLOGIA",
    "CARDIOLOGIA",
    "CIRURGIA_GERAL",
    "DERMATOLOGIA",
    "ENDOCRINOLOGIA",
    "GASTROENTEROLOGIA",
    "GINECOLOGIA",
    "INFECTOLOGIA",
    "NEFROLOGIA",
    "NEUROLOGIA",
    "OFTALMOLOGIA",
    "ORTOPEDIA",
    "OTORRINOLARINGOLOGIA",
    "PEDIATRIA",
    "PSIQUIATRIA",
    "PNEUMOLOGIA",
    "REUMATOLOGIA",
    "UROLOGIA",
];

// Tipos de Cuidados de Enfermagem
const TIPOS_CUIDADOS_ENFERMAGEM = [
    { value: "VACINAS", label: "Aplicação de Vacinas" },
    { value: "INALACAO", label: "Inalação" },
    { value: "MEDICACAO", label: "Medicação" },
    { value: "EXAMES", label: "Exames" },
    { value: "CURATIVOS", label: "Curativos" },
];

// Helper para formatar rótulos bonitos a partir de constantes COM_UNDERSCORE
const pretty = (text: string) =>
    text
        .replace(/_/g, " ")
        .toLowerCase()
        .replace(/(^|\s)\S/g, (c) => c.toUpperCase());

// -------------------- Componente --------------------

const MotivoDesfechoSelect: React.FC<MotivoDesfechoSelectProps> = ({
                                                                       motivoValue,
                                                                       especialidadeValue,
                                                                       onMotivoChange,
                                                                       onEspecialidadeChange,
                                                                       disabled = false,
                                                                       placeholderMotivo = "Selecione o motivo de desfecho...",
                                                                       placeholderEspecialidade = "Selecione a especialidade...",
                                                                       especialidadesLista,
                                                                   }) => {
    // Motivos e especialidades (memoizados)
    const motivos = useMemo(() => MOTIVOS_PADRAO, []);
    const especialidades = useMemo(
        () => (especialidadesLista && especialidadesLista.length > 0 ? especialidadesLista : ESPECIALIDADES_PADRAO),
        [especialidadesLista]
    );

    // Mostrar/ocultar especialidade conforme motivo
    const [showEspecialidade, setShowEspecialidade] = useState<boolean>(motivoValue === "03");

    useEffect(() => {
        const shouldShow = motivoValue === "03"; // "Encaminhamento"
        setShowEspecialidade(shouldShow);
        if (!shouldShow && onEspecialidadeChange) {
            // Se deixou de ser encaminhamento, limpamos o valor de especialidade no form pai
            onEspecialidadeChange("");
        }
    }, [motivoValue, onEspecialidadeChange]);

    // Handlers
    const handleMotivoChange = (value: string) => {
        onMotivoChange?.(value);
    };

    const handleEspecialidadeChange = (value: string) => {
        onEspecialidadeChange?.(value);
    };

    // ⚠️ Importante: SEMPRE retornar um ÚNICO nó (div). Nunca null/false.
    return (
        <div className="space-y-3">
            {/* Campo Motivo */}
            <div className="space-y-1">
                <Label className="block">Motivo de desfecho</Label>
                <Select value={motivoValue ?? ""} onValueChange={handleMotivoChange} disabled={disabled}>
                    {/* Observação: se este componente estiver DENTRO de <FormControl>, o <Slot/> irá
             clonar este <SelectTrigger/> sem problemas, pois há um único nó raiz <div> acima. */}
                    <SelectTrigger>
                        <SelectValue placeholder={placeholderMotivo} />
                    </SelectTrigger>
                    <SelectContent className="max-h-64 overflow-y-auto">
                        {motivos.map((m) => (
                            <SelectItem key={m.codigo} value={m.codigo}>
                                {m.codigo} — {m.nome}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* Campo Especialidade (condicional) */}
            {showEspecialidade ? (
                <div className="space-y-1">
                    <Label className="block">Especialidade (para encaminhamento)</Label>
                    <Select
                        value={especialidadeValue ?? ""}
                        onValueChange={handleEspecialidadeChange}
                        disabled={disabled}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder={placeholderEspecialidade} />
                        </SelectTrigger>
                        <SelectContent className="max-h-64 overflow-y-auto">
                            {especialidades.map((esp) => (
                                <SelectItem key={esp} value={esp}>
                                    {pretty(esp)}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            ) : (
                // Mantemos um placeholder “neutro” (altura zero) para não criar/retirar nós
                // do DOM abruptamente (evita falsos negativos/condicionais dentro do FormControl).
                <div aria-hidden="true" className="h-0" />
            )}
        </div>
    );
};

export default MotivoDesfechoSelect;
