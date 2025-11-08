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
import { Checkbox } from "@/components/ui/checkbox";
import apiService from "@/services/apiService";

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
    setorValue?: string;                  // ex.: "1", "2", ... (ID do setor)
    tiposCuidadosValue?: string[];        // ex.: ["APLICACAO", "CURATIVOS", "VACINAS"]
    // Callbacks para o form pai (react-hook-form)
    onMotivoChange?: (value: string) => void;
    onEspecialidadeChange?: (value: string) => void;
    onSetorChange?: (value: string) => void;
    onTiposCuidadosChange?: (value: string[]) => void;

    // Estado geral
    disabled?: boolean;

    // Placeholders customizáveis
    placeholderMotivo?: string;
    placeholderEspecialidade?: string;
    placeholderSetor?: string;

    // Lista custom de especialidades (opcional). Se não vier, usa a lista padrão.
    especialidadesLista?: string[];
}

// -------------------- Constantes --------------------

// Motivos oficiais (exemplo compatível com seu back; mantenha conforme seu domínio)
const MOTIVOS_PADRAO: MotivoDesfecho[] = [
    { codigo: "01", nome: "Alta", descricao: "Saída do paciente com alta" },
    { codigo: "02", nome: "Alta se melhora", descricao: "Alta após avaliação de melhora pela enfermagem (geralmente para soroterapia)" },
    { codigo: "03", nome: "Encaminhamento", descricao: "Encaminhamento para outro serviço" },
    { codigo: "04", nome: "Alta após medicação/procedimento", descricao: "Alta após realização de medicação ou procedimento pela enfermagem" },
    { codigo: "05", nome: "Internação", descricao: "Internação no hospital" },
    { codigo: "06", nome: "Contra-referência", descricao: "Retorno ao serviço de origem" },
    { codigo: "08", nome: "Retorno", descricao: "Retorno para continuidade" },
    { codigo: "09", nome: "Transferência", descricao: "Transferência para outro serviço" },
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

// Tipos de Cuidados de Enfermagem (Flags de Atividades)
const TIPOS_CUIDADOS_ENFERMAGEM = [
    { value: "APLICACAO", label: "Aplicação" },
    { value: "CURATIVOS", label: "Curativos" },
    { value: "VACINAS", label: "Vacinas" },
];

// Helper para formatar rótulos bonitos a partir de constantes COM_UNDERSCORE
const pretty = (text: string) =>
    text
        .replace(/_/g, " ")
        .toLowerCase()
        .replace(/(^|\s)\S/g, (c) => c.toUpperCase());

// -------------------- Componente --------------------

// Interface para Setor
interface Setor {
    id: number;
    nome: string;
    tipo?: string;
}

const MotivoDesfechoSelect: React.FC<MotivoDesfechoSelectProps> = ({
                                                                       motivoValue,
                                                                       especialidadeValue,
                                                                       setorValue,
                                                                       tiposCuidadosValue = [],
                                                                       onMotivoChange,
                                                                       onEspecialidadeChange,
                                                                       onSetorChange,
                                                                       onTiposCuidadosChange,
                                                                       disabled = false,
                                                                       placeholderMotivo = "Selecione o motivo de desfecho...",
                                                                       placeholderEspecialidade = "Selecione a especialidade...",
                                                                       placeholderSetor = "Selecione o setor...",
                                                                       especialidadesLista,
                                                                   }) => {
    // Motivos e especialidades (memoizados)
    const motivos = useMemo(() => MOTIVOS_PADRAO, []);
    const especialidades = useMemo(
        () => (especialidadesLista && especialidadesLista.length > 0 ? especialidadesLista : ESPECIALIDADES_PADRAO),
        [especialidadesLista]
    );

    // Estados para setores e flags de atividades
    const [setores, setSetores] = useState<Setor[]>([]);
    const [loadingSetores, setLoadingSetores] = useState(false);
    const [showEspecialidade, setShowEspecialidade] = useState<boolean>(motivoValue === "03");
    const [showSetor, setShowSetor] = useState<boolean>(motivoValue === "02" || motivoValue === "04");
    const [showAtividadesEnfermagem, setShowAtividadesEnfermagem] = useState<boolean>(
        motivoValue === "02" || motivoValue === "04"
    );

    // Carregar setores quando necessário
    useEffect(() => {
        const carregarSetores = async () => {
            if (showSetor && setores.length === 0) {
                try {
                    setLoadingSetores(true);
                    // Buscar setores do domínio (endpoint existente)
                    const response = await apiService.get("/dominios/setores");
                    const data = response.data?.data || response.data || [];
                    // Filtrar setores ativos e mapear para o formato esperado
                    const setoresFiltrados = (Array.isArray(data) ? data : [])
                        .filter((s: any) => s.ativo !== false)
                        .map((s: any) => ({ 
                            id: s.id || s.codigo || s.value, 
                            nome: s.nome || s.descricao || s.label || String(s.id || s.codigo || s.value)
                        }));
                    setSetores(setoresFiltrados);
                } catch (error) {
                    console.error("Erro ao carregar setores:", error);
                    // Fallback: lista vazia (usuário pode informar manualmente se necessário)
                    setSetores([]);
                } finally {
                    setLoadingSetores(false);
                }
            }
        };
        carregarSetores();
    }, [showSetor, setores.length]);

    // Atualizar visibilidade de campos conforme motivo
    useEffect(() => {
        const shouldShowEspecialidade = motivoValue === "03"; // "Encaminhamento"
        const shouldShowSetor = motivoValue === "02" || motivoValue === "04"; // "Alta se melhora", "Alta após medicação/procedimento"
        const shouldShowAtividades = motivoValue === "02" || motivoValue === "04";

        setShowEspecialidade(shouldShowEspecialidade);
        setShowSetor(shouldShowSetor);
        setShowAtividadesEnfermagem(shouldShowAtividades);

        // Limpar valores quando desabilitar campos
        if (!shouldShowEspecialidade && onEspecialidadeChange) {
            onEspecialidadeChange("");
        }
        if (!shouldShowSetor && onSetorChange) {
            onSetorChange("");
        }
        if (!shouldShowAtividades && onTiposCuidadosChange) {
            onTiposCuidadosChange([]);
        }
    }, [motivoValue, onEspecialidadeChange, onSetorChange, onTiposCuidadosChange]);

    // Handlers
    const handleMotivoChange = (value: string) => {
        onMotivoChange?.(value);
    };

    const handleEspecialidadeChange = (value: string) => {
        onEspecialidadeChange?.(value);
    };

    const handleSetorChange = (value: string) => {
        onSetorChange?.(value);
    };

    const handleAtividadeChange = (atividade: string, checked: boolean) => {
        const current = tiposCuidadosValue || [];
        if (checked) {
            onTiposCuidadosChange?.([...current, atividade]);
        } else {
            onTiposCuidadosChange?.(current.filter(a => a !== atividade));
        }
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
                    <Label className="block">Especialidade (para encaminhamento) *</Label>
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
                <div aria-hidden="true" className="h-0" />
            )}

            {/* Campo Setor (condicional - obrigatório para Alta se melhora e Alta após medicação/procedimento) */}
            {showSetor ? (
                <div className="space-y-1">
                    <Label className="block">Setor (Medicação/Procedimento) *</Label>
                    <Select
                        value={setorValue ?? ""}
                        onValueChange={handleSetorChange}
                        disabled={disabled || loadingSetores}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder={loadingSetores ? "Carregando setores..." : placeholderSetor} />
                        </SelectTrigger>
                        <SelectContent className="max-h-64 overflow-y-auto">
                            {setores.map((setor) => (
                                <SelectItem key={setor.id} value={String(setor.id)}>
                                    {setor.nome}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">
                        Selecione o setor onde serão realizadas as atividades de enfermagem
                    </p>
                </div>
            ) : (
                <div aria-hidden="true" className="h-0" />
            )}

            {/* Flags de Atividades de Enfermagem (condicional) */}
            {showAtividadesEnfermagem ? (
                <div className="space-y-2">
                    <Label className="block">Atividades de Enfermagem</Label>
                    <div className="space-y-2 border rounded-md p-3 bg-muted/50">
                        {TIPOS_CUIDADOS_ENFERMAGEM.map((tipo) => (
                            <div key={tipo.value} className="flex items-center space-x-2">
                                <Checkbox
                                    id={`atividade-${tipo.value}`}
                                    checked={tiposCuidadosValue?.includes(tipo.value) || false}
                                    onCheckedChange={(checked) => handleAtividadeChange(tipo.value, checked as boolean)}
                                    disabled={disabled}
                                />
                                <Label
                                    htmlFor={`atividade-${tipo.value}`}
                                    className="text-sm font-normal cursor-pointer"
                                >
                                    {tipo.label}
                                </Label>
                            </div>
                        ))}
                    </div>
                    <p className="text-xs text-muted-foreground">
                        Selecione as atividades que serão realizadas pela equipe de enfermagem
                    </p>
                </div>
            ) : (
                <div aria-hidden="true" className="h-0" />
            )}
        </div>
    );
};

export default MotivoDesfechoSelect;
