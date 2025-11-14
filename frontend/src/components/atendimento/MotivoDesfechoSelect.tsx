// src/components/atendimento/MotivoDesfechoSelect.tsx
// -----------------------------------------------------------------------------
// Componente controlado para seleção do Motivo de Desfecho (+ Especialidade).
// - Garante SEMPRE retornar UM ÚNICO elemento React (div) -> evita erro no <Slot/>.
// - Nunca retorna null/false no caminho feliz (mantém a árvore estável).
// - Mostra a seleção de Especialidade SOMENTE quando o motivo = "03" (Encaminhamento).
// - Exposição via props para integração com react-hook-form (on*Change, values).
// - Mantém a identidade visual (usa Select do seu design system shadcn/ui).
// -----------------------------------------------------------------------------

import React, { useEffect, useMemo, useState, useRef, useCallback } from "react";
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
    // ✅ Normalizar tiposCuidadosValue para evitar problemas de referência
    // Comparar arrays por conteúdo usando JSON.stringify para estabilidade
    const tiposCuidadosNormalized = useMemo(() => {
        if (!Array.isArray(tiposCuidadosValue)) {
            return [];
        }
        // Retornar array ordenado para garantir estabilidade na comparação
        return [...tiposCuidadosValue].sort();
    }, [JSON.stringify(tiposCuidadosValue || [])]);
    
    console.log("🎯 [MOTIVO] Componente renderizado - motivoValue:", motivoValue);
    
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
    
    // Ref para rastrear se já tentou carregar setores
    const setoresCarregadosRef = useRef<boolean>(false);

    // Carregar setores quando necessário
    useEffect(() => {
        console.log("🔍 [SETORES] useEffect executado - showSetor:", showSetor, "setores.length:", setores.length, "setoresCarregadosRef:", setoresCarregadosRef.current);
        
        // Se showSetor mudou para false, reseta o flag
        if (!showSetor) {
            setoresCarregadosRef.current = false;
            setSetores([]);
            return;
        }
        
        // Se showSetor é true mas já carregou, não recarrega
        if (showSetor && setoresCarregadosRef.current) {
            console.log("⏭️ [SETORES] Setores já foram carregados anteriormente, pulando requisição");
            return;
        }
        
        const carregarSetores = async () => {
            console.log("🔍 [SETORES] carregarSetores chamado - showSetor:", showSetor);
            
            if (showSetor && !setoresCarregadosRef.current) {
                try {
                    setLoadingSetores(true);
                    console.log("🔍 [SETORES] ========== INICIANDO BUSCA DE SETORES ==========");
                    console.log("🔍 [SETORES] URL:", "/dominios/setores");
                    
                    // Verifica se há token antes de fazer a requisição
                    const token = localStorage.getItem("token") || 
                                  localStorage.getItem("access_token") || 
                                  localStorage.getItem("authToken");
                    console.log("🔍 [SETORES] Token encontrado:", token ? "SIM" : "NÃO");
                    if (token) {
                        console.log("🔍 [SETORES] Token (primeiros 20 chars):", token.substring(0, 20) + "...");
                    } else {
                        console.error("❌ [SETORES] ERRO: Token não encontrado! Faça login novamente.");
                        setSetores([]);
                        setLoadingSetores(false);
                        return;
                    }
                    
                    console.log("🔍 [SETORES] Fazendo requisição para /api/dominios/setores...");
                    
                    // TESTE DIRETO: Tenta fazer fetch manual para debug
                    console.log("🧪 [SETORES] TESTE DIRETO - Tentando fetch manual...");
                    try {
                        const testResponse = await fetch("http://localhost:8080/api/dominios/setores", {
                            headers: {
                                "Authorization": `Bearer ${token}`,
                                "Content-Type": "application/json"
                            }
                        });
                        console.log("🧪 [SETORES] TESTE DIRETO - Status:", testResponse.status);
                        const testData = await testResponse.json();
                        console.log("🧪 [SETORES] TESTE DIRETO - Data:", testData);
                    } catch (testError) {
                        console.error("🧪 [SETORES] TESTE DIRETO - Erro:", testError);
                    }
                    
                    // Buscar setores do domínio
                    const response = await apiService.get("/dominios/setores");
                    console.log("🔍 [SETORES] ========== RESPOSTA RECEBIDA ==========");
                    console.log("📦 [SETORES] Resposta completa:", response);
                    console.log("📦 [SETORES] response.data:", response.data);
                    console.log("📦 [SETORES] response.status:", response.status);
                    
                    // Tenta diferentes formatos de resposta
                    let data: any[] = [];
                    
                    if (response.data) {
                        // Formato 1: ApiResponse { success: true, data: [...] }
                        if (response.data.success && Array.isArray(response.data.data)) {
                            data = response.data.data;
                            console.log("✅ [SETORES] Formato ApiResponse detectado, data:", data);
                        }
                        // Formato 2: Array direto
                        else if (Array.isArray(response.data)) {
                            data = response.data;
                            console.log("✅ [SETORES] Formato Array direto detectado, data:", data);
                        }
                        // Formato 3: { data: [...] }
                        else if (response.data.data && Array.isArray(response.data.data)) {
                            data = response.data.data;
                            console.log("✅ [SETORES] Formato { data: [...] } detectado, data:", data);
                        } else {
                            console.warn("⚠️ [SETORES] Formato de resposta não reconhecido:", response.data);
                        }
                    } else {
                        console.warn("⚠️ [SETORES] response.data é null ou undefined");
                    }
                    
                    // Filtrar setores ativos e mapear para o formato esperado
                    const setoresFiltrados = data
                        .filter((s: any) => s.ativo !== false)
                        .map((s: any) => ({ 
                            id: s.id || s.codigo || s.value, 
                            nome: s.nome || s.descricao || s.label || String(s.id || s.codigo || s.value)
                        }));
                    
                    console.log(`✅ [SETORES] ${setoresFiltrados.length} setor(es) carregado(s):`, setoresFiltrados);
                    
                    if (setoresFiltrados.length === 0) {
                        console.warn("⚠️ [SETORES] Nenhum setor encontrado. Verifique se há dados na tabela setores_atendimento.");
                    }
                    
                    setSetores(setoresFiltrados);
                    setoresCarregadosRef.current = true; // Marca como carregado
                } catch (error: any) {
                    console.error("❌ [SETORES] Erro ao carregar setores:", error);
                    console.error("❌ [SETORES] Status:", error?.response?.status);
                    console.error("❌ [SETORES] Detalhes do erro:", error?.response?.data || error?.message);
                    console.error("❌ [SETORES] URL:", error?.config?.url);
                    console.error("❌ [SETORES] Stack:", error?.stack);
                    
                    // Mostra mensagem de erro mais detalhada
                    if (error?.response?.status === 404) {
                        console.error("❌ [SETORES] Endpoint não encontrado. Verifique se o backend está rodando e o endpoint /api/dominios/setores existe.");
                    } else if (error?.response?.status === 500) {
                        console.error("❌ [SETORES] Erro interno do servidor. Verifique os logs do backend.");
                    } else if (error?.response?.status === 401) {
                        console.error("❌ [SETORES] Não autorizado. Verifique se está autenticado.");
                    } else if (!error?.response) {
                        console.error("❌ [SETORES] Sem resposta do servidor. Verifique se o backend está rodando.");
                    }
                    
                    // Fallback: lista vazia (usuário pode informar manualmente se necessário)
                    setSetores([]);
                } finally {
                    setLoadingSetores(false);
                    console.log("🔍 [SETORES] Carregamento finalizado");
                }
            } else {
                console.log("⏭️ [SETORES] showSetor é false, não carregando setores");
            }
        };
        
        carregarSetores();
    }, [showSetor]); // Removido setores.length das dependências para evitar loops

    // Ref para rastrear o motivo anterior e evitar chamadas desnecessárias
    const prevMotivoRef = useRef<string | undefined>(motivoValue);
    
    // Ref para rastrear valores anteriores de visibilidade
    const prevVisibilityRef = useRef({
        showEspecialidade: motivoValue === "03",
        showSetor: motivoValue === "02" || motivoValue === "04",
        showAtividades: motivoValue === "02" || motivoValue === "04"
    });
    
    // Ref para armazenar callbacks e evitar loops infinitos
    const callbacksRef = useRef({
        onEspecialidadeChange,
        onSetorChange,
        onTiposCuidadosChange
    });
    
    // Atualizar ref quando callbacks mudarem (sem causar re-render)
    useEffect(() => {
        callbacksRef.current = {
            onEspecialidadeChange,
            onSetorChange,
            onTiposCuidadosChange
        };
    }, [onEspecialidadeChange, onSetorChange, onTiposCuidadosChange]);

    // Atualizar visibilidade de campos conforme motivo
    useEffect(() => {
        // Evitar processamento se o motivo não mudou
        if (prevMotivoRef.current === motivoValue) {
            return;
        }
        
        const shouldShowEspecialidade = motivoValue === "03"; // "Encaminhamento"
        const shouldShowSetor = motivoValue === "02" || motivoValue === "04"; // "Alta se melhora", "Alta após medicação/procedimento"
        const shouldShowAtividades = motivoValue === "02" || motivoValue === "04";

        console.log("🔍 [MOTIVO] Atualizando visibilidade - motivoValue:", motivoValue, "shouldShowSetor:", shouldShowSetor, "shouldShowAtividades:", shouldShowAtividades);

        // Usar valores anteriores do ref
        const prevShowEspecialidade = prevVisibilityRef.current.showEspecialidade;
        const prevShowSetor = prevVisibilityRef.current.showSetor;
        const prevShowAtividades = prevVisibilityRef.current.showAtividades;

        // Atualizar estados
        setShowEspecialidade(shouldShowEspecialidade);
        setShowSetor(shouldShowSetor);
        setShowAtividadesEnfermagem(shouldShowAtividades);

        // Atualizar refs
        prevMotivoRef.current = motivoValue;
        prevVisibilityRef.current = {
            showEspecialidade: shouldShowEspecialidade,
            showSetor: shouldShowSetor,
            showAtividades: shouldShowAtividades
        };

        // Limpar valores APENAS quando o campo é DESABILITADO (não quando é habilitado)
        // Usar valores capturados para evitar problemas de closure
        if (prevShowEspecialidade && !shouldShowEspecialidade && callbacksRef.current.onEspecialidadeChange) {
            // Limpar imediatamente quando campo é desabilitado
            callbacksRef.current.onEspecialidadeChange("");
        }
        if (prevShowSetor && !shouldShowSetor && callbacksRef.current.onSetorChange) {
            callbacksRef.current.onSetorChange("");
            // Limpa setores quando o campo é ocultado
            setSetores([]);
            setoresCarregadosRef.current = false; // Reseta o flag
        }
        if (prevShowAtividades && !shouldShowAtividades && callbacksRef.current.onTiposCuidadosChange) {
            callbacksRef.current.onTiposCuidadosChange([]);
        }
    }, [motivoValue]); // Apenas motivoValue como dependência

    // Handlers
    const handleMotivoChange = (value: string) => {
        // Evitar processar se o valor não mudou
        if (value === motivoValue) {
            console.log("⏭️ [MOTIVO] Valor não mudou, ignorando:", value);
            return;
        }
        
        console.log("🎯 [MOTIVO] handleMotivoChange chamado com valor:", value);
        console.log("🎯 [MOTIVO] Valor anterior:", motivoValue);
        console.log("🎯 [MOTIVO] Valor '04' ou '02'?", value === "04" || value === "02");
        
        // Chamar callback apenas uma vez
        if (onMotivoChange) {
            onMotivoChange(value);
        }
    };

    const handleEspecialidadeChange = (value: string) => {
        onEspecialidadeChange?.(value);
    };

    const handleSetorChange = (value: string) => {
        // Evitar processar se o valor não mudou
        if (value === setorValue) {
            console.log("⏭️ [SETOR] Valor não mudou, ignorando:", value);
            return;
        }
        
        console.log("🎯 [SETOR] handleSetorChange chamado com valor:", value);
        console.log("🎯 [SETOR] Valor anterior:", setorValue);
        
        // Chamar callback apenas uma vez
        if (onSetorChange) {
            onSetorChange(value);
        }
    };

    const handleAtividadeChange = useCallback((atividade: string, checked: boolean) => {
        // Evitar processamento se o estado já está correto
        const current = tiposCuidadosNormalized || [];
        const alreadyChecked = current.includes(atividade);
        
        if (checked && alreadyChecked) {
            console.log("⏭️ [ATIVIDADE] Atividade já está selecionada, ignorando:", atividade);
            return;
        }
        
        if (!checked && !alreadyChecked) {
            console.log("⏭️ [ATIVIDADE] Atividade já está desmarcada, ignorando:", atividade);
            return;
        }
        
        console.log("🎯 [ATIVIDADE] handleAtividadeChange chamado - atividade:", atividade, "checked:", checked);
        console.log("🎯 [ATIVIDADE] Valores atuais:", current);
        
        // Criar novo array para evitar mutação
        let newValue: string[];
        if (checked) {
            newValue = [...current, atividade];
        } else {
            newValue = current.filter(a => a !== atividade);
        }
        
        console.log("🎯 [ATIVIDADE] Novos valores:", newValue);
        
        // Chamar callback apenas uma vez
        if (onTiposCuidadosChange) {
            onTiposCuidadosChange(newValue);
        }
    }, [tiposCuidadosNormalized, onTiposCuidadosChange]);

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
                            {loadingSetores ? (
                                <div className="p-2 text-sm text-gray-500 text-center">
                                    Carregando setores...
                                </div>
                            ) : setores.length === 0 ? (
                                <div className="p-2 text-sm text-gray-500 text-center">
                                    Nenhum setor disponível
                                </div>
                            ) : (
                                setores.map((setor) => (
                                    <SelectItem key={setor.id} value={String(setor.id)}>
                                        {setor.nome}
                                    </SelectItem>
                                ))
                            )}
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
                                    checked={tiposCuidadosNormalized?.includes(tipo.value) || false}
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
