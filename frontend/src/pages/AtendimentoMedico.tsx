// src/pages/AtendimentoMedico.tsx
// -----------------------------------------------------------------------------
// ATENDIMENTO AMBULATORIAL — "DEMANDA ESPONTÂNEA" + LINHAS DE CUIDADO
// - Mantida a identidade visual (shadcn/Tailwind).
// - Busca de pacientes robusta (várias rotas possíveis).
// - Atualização de status: tenta PATCH e cai para PUT.
// -----------------------------------------------------------------------------

import React, { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
    Search,
    User,
    Clock,
    AlertCircle,
    Stethoscope,
    Loader2,
    UserCheck,
    Pill,
    ArrowLeft,
} from "lucide-react";

import apiService from "@/services/apiService";
import { parseApiError, showErrorToast } from "@/services/errorHandler";

// UI
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";

// Componentes de domínio
import { AtendimentoForm, AtendimentoFormData } from "@/components/atendimento/AtendimentoForm";
import { HistoricoAtendimentos } from "@/components/atendimento/HistoricoAtendimentos";
import DocumentosMedicos from "@/components/atendimento/DocumentosMedicos";
import { BarraSuperiorAtendimento } from "@/components/atendimento/BarraSuperiorAtendimento";
import { atendimentoService } from "@/services/AtendimentoService";
import { procedimentosRapidosService } from "@/services/procedimentosRapidosService";
import HistoricoAgendamentosPaciente from "@/components/recepcao/agendamento/HistoricoAgendamentosPaciente";

// =========================
// Tipagens
// =========================
interface PacienteTriado {
    triagemId: number;
    agendamentoId: number;
    pacienteId: number;
    nomeCompleto: string;
    cartaoSus: string;
    idade: number | null;
    horarioTriagem: string; // ISO
    classificacaoRisco: "VERMELHO" | "LARANJA" | "AMARELO" | "VERDE" | "AZUL";
    queixaPrincipal: string;
    observacoes?: string;
    pressaoArterial?: string;
    temperatura?: number;
    peso?: number;
    altura?: number;
    frequenciaCardiaca?: number;
    saturacaoOxigenio?: number;
    escalaDor?: number;
    profissionalTriagem: string;
}

interface PacienteBusca {
    id: number;
    nome: string;
    cartaoSus?: string;
    cpf?: string;
}

// =========================
// Helpers
// =========================
function sanitize<T extends Record<string, any>>(obj: T): T {
    const clean: any = {};
    for (const k of Object.keys(obj)) {
        const v = (obj as any)[k];
        if (v === undefined || v === null) continue;
        if (typeof v === "string" && v.trim() === "") continue;
        clean[k] = v;
    }
    return clean;
}

function mapProfissionalId(data: any): number | undefined {
    const cand =
        data?.profissionalId ??
        data?.profissional?.id ??
        data?.idProfissional ??
        data?.profissional?.profissionalId ??
        data?.id;
    const n = Number(cand);
    return Number.isFinite(n) ? n : undefined;
}

function tryGetProfFromLocalStorage(): number | undefined {
    const keys = ["user", "usuario", "currentUser", "authUser"];
    for (const k of keys) {
        try {
            const raw = localStorage.getItem(k);
            if (!raw) continue;
            const obj = JSON.parse(raw);
            const id =
                mapProfissionalId(obj) ??
                mapProfissionalId(obj?.perfil) ??
                mapProfissionalId(obj?.dados);
            if (id) return id;
        } catch {}
    }
    return undefined;
}

async function tryFetchCurrentUserProfissionalId(): Promise<number | undefined> {
    const routes = ["/usuarios/me", "/auth/me", "/me"];
    for (const r of routes) {
        try {
            const { data } = await apiService.get(r);
            const id = mapProfissionalId(data);
            if (id) return id;
        } catch {}
    }
    return undefined;
}

async function resolveProfissionalId(params: {
    formProfissionalId?: any;
    agendamentoId?: number;
}): Promise<number | undefined> {
    if (params.formProfissionalId !== undefined && params.formProfissionalId !== "") {
        const n = Number(params.formProfissionalId);
        if (Number.isFinite(n)) return n;
    }
    if (params.agendamentoId) {
        try {
            const { data } = await apiService.get(`/agendamentos/${params.agendamentoId}`);
            const id = mapProfissionalId(data);
            if (id) return id;
        } catch {}
    }
    const fromMe = await tryFetchCurrentUserProfissionalId();
    if (fromMe) return fromMe;

    const fromLocal = tryGetProfFromLocalStorage();
    if (fromLocal) return fromLocal;

    return undefined;
}

// =========================
// Linhas de Cuidado (flags simples)
// =========================
const LINHAS_CUIDADO: Array<{ codigo: string; label: string }> = [
    { codigo: "HIPERTENSAO", label: "Hipertensão" },
    { codigo: "DIABETES", label: "Diabetes" },
    { codigo: "SAUDE_MENTAL", label: "Saúde Mental" },
    { codigo: "SAUDE_MULHER", label: "Saúde da Mulher" },
    { codigo: "SAUDE_IDOSO", label: "Saúde do Idoso" },
];

// =========================
// BUSCA DE PACIENTES (sem triagem) — robusta a variações de API
// =========================
async function buscarPacientesGenerico(term: string): Promise<PacienteBusca[]> {
    const q = term.trim();
    if (q.length < 3) return [];

    // Tentamos múltiplas rotas comuns, parando na primeira que responder OK
    const tentativas = [
        { url: "/pacientes/busca", params: { query: q } },
        { url: "/pacientes/busca", params: { nome: q } },
        { url: "/pacientes", params: { nome: q } },
        { url: "/pacientes/search", params: { q } },
        { url: "/pacientes", params: { q } },
    ];

    for (const t of tentativas) {
        try {
            const resp = await apiService.get(t.url, { params: t.params });
            const payload: any = (resp as any)?.data ?? resp;

            // Aceita formato variado: array direto | { data } | { itens/items/content }
            const arr: any[] = Array.isArray(payload)
                ? payload
                : payload?.data ??
                payload?.itens ??
                payload?.items ??
                payload?.content ??
                [];

            if (!Array.isArray(arr)) continue;

            const list = arr
                .map((p: any) => ({
                    id: Number(p.id ?? p.pacienteId ?? p.codigo ?? p.codigoPaciente),
                    nome: String(p.nomeCompleto ?? p.nome ?? p.nome_social ?? "").trim(),
                    cartaoSus: p.cns ?? p.cartaoSus ?? p.cartao_sus,
                    cpf: p.cpf,
                }))
                .filter((x) => Number.isFinite(x.id) && x.nome);

            if (list.length) return list;
            // se a rota respondeu, mas vazia, ainda assim podemos retornar []
            return list;
        } catch {
            // tenta próxima rota
        }
    }

    // Como último recurso, retorna vazio
    return [];
}

// =========================
// Componente
// =========================
const AtendimentoMedico: React.FC = () => {
    const { toast } = useToast();
    const queryClient = useQueryClient();

    // Estados principais
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedPaciente, setSelectedPaciente] = useState<PacienteTriado | null>(null);
    const [showDetalhes, setShowDetalhes] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [pacienteId, setPacienteId] = useState<string>("");
    const [atendimentoId, setAtendimentoId] = useState<string>("");

    // Controle de abas e paciente em atendimento
    const [activeTab, setActiveTab] = useState<"triados" | "novo" | "documentos" | "historico">("triados");
    const [pacienteParaAtendimento, setPacienteParaAtendimento] = useState<PacienteTriado | null>(null);

    // ===== "Demanda Espontânea"
    const [semTriagem, setSemTriagem] = useState(false);
    const [buscaPaciente, setBuscaPaciente] = useState("");
    const [resultadosBusca, setResultadosBusca] = useState<PacienteBusca[]>([]);
    const [pacienteSelecionadoLivre, setPacienteSelecionadoLivre] = useState<PacienteBusca | null>(null);
    const [buscandoPac, setBuscandoPac] = useState(false);

    // ===== Linhas de Cuidado
    const [linhasCuidadoSelecionadas, setLinhasCuidadoSelecionadas] = useState<string[]>([]);

    // ===== Procedimentos Rápidos (Cuidados de Enfermagem)
    const [pacientesComProcedimentoAtivo, setPacientesComProcedimentoAtivo] = useState<Set<number>>(new Set());

    // ===== Timer de Atendimento
    const [dataInicioAtendimento, setDataInicioAtendimento] = useState<Date | null>(null);

    // ===== Informações do Paciente para Barra Superior
    const [infoPacienteBarra, setInfoPacienteBarra] = useState<{
        nome?: string;
        idade?: number | null;
        sexo?: string;
        municipio?: string;
        endereco?: string;
    } | null>(null);

    // =========================
    // Query — triados aguardando atendimento
    // =========================
    const {
        data: pacientesTriados = [],
        isLoading: isLoadingPacientes,
        error,
    } = useQuery<PacienteTriado[]>({
        queryKey: ["pacientesTriados"],
        queryFn: async () => {
            const { data } = await apiService.get("/triagem/triados");
            // se sua API devolve direto o array, unwrap cuida
            return (Array.isArray((data as any)) ? data : (data?.data ?? data)) as PacienteTriado[];
        },
        refetchInterval: 30_000,
    });

    const pacientesFiltrados = useMemo(() => {
        if (!searchTerm.trim()) return pacientesTriados;
        const s = searchTerm.toLowerCase();
        return pacientesTriados.filter(
            (p) =>
                p.nomeCompleto.toLowerCase().includes(s) ||
                (p.cartaoSus || "").toLowerCase().includes(s) ||
                p.queixaPrincipal.toLowerCase().includes(s) ||
                p.profissionalTriagem.toLowerCase().includes(s)
        );
    }, [pacientesTriados, searchTerm]);

    // Verifica quais pacientes têm procedimento ativo
    useQuery({
        queryKey: ["pacientesComProcedimentoAtivo", pacientesTriados.map(p => p.pacienteId)],
        queryFn: async () => {
            const pacientesIds = pacientesTriados.map(p => p.pacienteId);
            const pacientesComAtivo = new Set<number>();
            
            await Promise.all(
                pacientesIds.map(async (pacienteId) => {
                    try {
                        const temAtivo = await procedimentosRapidosService.temProcedimentoAtivo(pacienteId);
                        if (temAtivo) {
                            pacientesComAtivo.add(pacienteId);
                        }
                    } catch (error) {
                        console.error(`Erro ao verificar procedimento ativo para paciente ${pacienteId}:`, error);
                    }
                })
            );
            
            setPacientesComProcedimentoAtivo(pacientesComAtivo);
            return pacientesComAtivo;
        },
        enabled: pacientesTriados.length > 0,
        refetchInterval: 30_000,
    });

    // =========================
    // Atualizar status do agendamento (PATCH -> fallback PUT)
    // =========================
    const atualizarStatusAgendamento = async (agendamentoId: number, status: string) => {
        const normalized = String(status || "").toUpperCase();
        let lastError: any = null;
        
        try {
            // Tenta PATCH padrão
            await apiService.patch(`/agendamentos/${agendamentoId}/status`, { status: normalized });
            toast({
                title: "Sucesso!",
                description: `Agendamento alterado para ${normalized}`,
                className: "bg-green-100 text-green-800",
            });
            return;
        } catch (err: any) {
            lastError = err;
            console.error("Erro no PATCH:", err.response?.data || err.message);
            
            // Fallback para APIs que usam PUT
            try {
            await apiService.put(`/agendamentos/${agendamentoId}/status`, { status: normalized });
        toast({
                    title: "Sucesso!",
            description: `Agendamento alterado para ${normalized}`,
            className: "bg-green-100 text-green-800",
        });
                return;
            } catch (putErr: any) {
                lastError = putErr;
                console.error("Erro no PUT:", putErr.response?.data || putErr.message);
            }
        }
        
        // Se ambos falharam, usa o novo error handler
        const parsedError = parseApiError(lastError);
        showErrorToast(parsedError);
        
        throw lastError;
    };

    // =========================
    // BUSCAR PACIENTE (sem triagem)
    // =========================
    async function executarBuscaPacientes(term: string) {
        const q = term.trim();
        if (q.length < 3) {
            setResultadosBusca([]);
            return;
        }
        try {
            setBuscandoPac(true);
            const itens = await buscarPacientesGenerico(q);
            setResultadosBusca(itens);
        } catch (e) {
            console.error("Falha na busca de pacientes:", e);
            toast({ title: "Erro", description: "Não foi possível buscar pacientes.", variant: "destructive" });
        } finally {
            setBuscandoPac(false);
        }
    }

    // =========================
    // SALVAR ATENDIMENTO
    // =========================
    const handleSaveAtendimento = async (data: AtendimentoFormData) => {
        setIsLoading(true);
        try {
            const pacienteAlvoId = semTriagem ? pacienteSelecionadoLivre?.id : pacienteParaAtendimento?.pacienteId;

            if (!pacienteAlvoId) {
                setIsLoading(false);
                toast({
                    title: "Paciente obrigatório",
                    description: semTriagem
                        ? "Selecione um paciente para demanda espontânea."
                        : 'Abra a partir da lista de triados ou habilite "Demanda Espontânea".',
                    variant: "destructive",
                });
                return;
            }

            const resolvedProfId = await resolveProfissionalId({
                formProfissionalId: (data as any)?.profissionalId,
                agendamentoId: pacienteParaAtendimento?.agendamentoId,
            });

            if (!resolvedProfId) {
                setIsLoading(false);
                toast({
                    title: "Profissional obrigatório",
                    description: "Não foi possível identificar o profissional do atendimento. Selecione no formulário ou entre no /me.",
                    variant: "destructive",
                });
                return;
            }

            const linhasCuidado = [...linhasCuidadoSelecionadas];

            const payload = sanitize({
                ...data,
                pacienteId: pacienteAlvoId,
                profissionalId: resolvedProfId,
                linhasCuidado, // ajuste o nome se seu backend usa outro campo
                cid10: (data as any)?.cid10 ? String((data as any).cid10).trim() : undefined,
            });

            const novoAtendimento = await atendimentoService.salvar(payload as any);

            if (novoAtendimento?.id) {
                setPacienteId(String(novoAtendimento.pacienteId ?? payload.pacienteId));
                setAtendimentoId(String(novoAtendimento.id));

                // Verificar se o motivo de desfecho requer encaminhamento para Cuidados de Enfermagem
                // Códigos: "02" (Alta se melhora), "04" (Alta após medicação/procedimento)
                if (data.motivoDesfecho === "02" || data.motivoDesfecho === "04") {
                    try {
                        // Determinar o tipo de desfecho para o procedimento rápido
                        let tipoDesfecho = "ALTA_APOS_MEDICACAO";
                        if (data.motivoDesfecho === "02") {
                            tipoDesfecho = "ALTA_SE_MELHORA";
                        } else if (data.motivoDesfecho === "04") {
                            tipoDesfecho = "ALTA_APOS_MEDICACAO";
                        }

                        // Converter flags de atividades de enfermagem para atividades
                        const atividades: any[] = [];
                        if (data.tiposCuidadosEnfermagem && Array.isArray(data.tiposCuidadosEnfermagem)) {
                            data.tiposCuidadosEnfermagem.forEach((tipo: string) => {
                                atividades.push({
                                    tipo: tipo,
                                    descricao: tipo === "APLICACAO" ? "Aplicação de medicamentos" :
                                              tipo === "CURATIVOS" ? "Curativos" :
                                              tipo === "VACINAS" ? "Aplicação de vacinas" : tipo,
                                    situacao: "PENDENTE",
                                    urgente: false
                                });
                            });
                        }

                        // Encaminhar para Procedimentos Rápidos
                        await procedimentosRapidosService.encaminharDeAtendimento({
                            atendimentoId: novoAtendimento.id,
                            pacienteId: pacienteAlvoId,
                            medicoSolicitante: novoAtendimento.profissionalNome || "",
                            especialidadeOrigem: data.especialidadeEncaminhamento || "",
                            setorId: data.setorEncaminhamento ? Number(data.setorEncaminhamento) : undefined,
                            tipoDesfecho: tipoDesfecho,
                            alergias: pacienteParaAtendimento?.observacoes || "",
                            observacoes: data.observacoes || "",
                            atividades: atividades
                        });

                        const mensagemDesfecho = data.motivoDesfecho === "02" 
                            ? "Atendimento salvo e paciente encaminhado para Cuidados de Enfermagem (Alta se melhora)."
                            : data.motivoDesfecho === "04"
                            ? "Atendimento salvo e paciente encaminhado para Cuidados de Enfermagem (Alta após medicação/procedimento)."
                            : "Atendimento salvo e paciente encaminhado para Cuidados de Enfermagem.";

                        toast({
                            title: "Sucesso!",
                            description: mensagemDesfecho,
                        });
                    } catch (error: any) {
                        console.error("Erro ao encaminhar para Procedimentos Rápidos:", error);
                        toast({
                            title: "Atendimento salvo com ressalvas",
                            description: `Atendimento salvo, mas houve erro ao encaminhar: ${error.message || "Erro desconhecido"}`,
                            variant: "default",
                        });
                    }
                }

                if (pacienteParaAtendimento) {
                    try {
                        await atualizarStatusAgendamento(pacienteParaAtendimento.agendamentoId, "FINALIZADO");
                        await queryClient.invalidateQueries({ queryKey: ["pacientesTriados"] });
                        setPacienteParaAtendimento(null);
                        if (data.motivoDesfecho !== "02" && data.motivoDesfecho !== "04") {
                            toast({ title: "Sucesso!", description: "Atendimento salvo e paciente finalizado." });
                        }
                    } catch {
                        toast({
                            title: "Atendimento salvo",
                            description: "Houve um problema ao finalizar o agendamento.",
                            variant: "default",
                        });
                    }
                } else {
                    if (data.motivoDesfecho !== "02" && data.motivoDesfecho !== "04") {
                        toast({ title: "Sucesso!", description: "Atendimento salvo com sucesso." });
                    }
                }

                setPacienteSelecionadoLivre(null);
                setBuscaPaciente("");
                setResultadosBusca([]);
                setLinhasCuidadoSelecionadas([]);
            } else {
                toast({
                    title: "Erro Inesperado",
                    description: "Não foi possível obter o ID do atendimento salvo.",
                    variant: "destructive",
                });
            }
        } catch (error: any) {
            console.error("Erro ao salvar atendimento:", error);
            toast({
                title: "Erro!",
                description: error?.message || "Não foi possível salvar o atendimento.",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    // =========================
    // Utils visuais
    // =========================
    const formatarHorario = (horario: string) => {
        try {
            return format(new Date(horario), "HH:mm", { locale: ptBR });
        } catch {
            return horario;
        }
    };

    const handleIniciarAtendimento = async (paciente: PacienteTriado) => {
        try {
            // ✅ VERIFICAR PERMISSÕES ANTES DE TENTAR
            const operadorData = localStorage.getItem('operadorData');
            if (!operadorData) {
                toast({
                    title: "Erro de Autenticação",
                    description: "Você não está autenticado. Faça login novamente.",
                    variant: "destructive"
                });
                return;
            }

            const operador = JSON.parse(operadorData);
            const perfisPermitidos = ['RECEPCAO', 'ADMIN', 'MEDICO', 'ENFERMEIRO', 'MASTER', 'MASTER_USER', 'ADMINISTRADOR_SISTEMA', 'ADMINISTRADOR', 'TRIAGEM'];
            const temPermissao = operador.perfis?.some((perfil: string) => perfisPermitidos.includes(perfil));

            if (!temPermissao) {
                const perfisDoUsuario = operador.perfis?.join(', ') || 'Nenhum perfil';
                toast({
                    title: "Acesso Negado",
                    description: `Você não tem permissão para iniciar atendimento. Seus papéis: ${perfisDoUsuario}. Papéis necessários: ${perfisPermitidos.join(', ')}`,
                    variant: "destructive"
                });
                return;
            }

            // Buscar informações completas do paciente para a barra superior
            try {
                const { data: pacienteData } = await apiService.get(`/pacientes/${paciente.pacienteId}`);
                setInfoPacienteBarra({
                    nome: paciente.nomeCompleto,
                    idade: paciente.idade,
                    sexo: (pacienteData as any)?.sexo || undefined,
                    municipio: (pacienteData as any)?.municipioResidencia || (pacienteData as any)?.municipio || undefined,
                    endereco: (pacienteData as any)?.enderecoCompleto || (pacienteData as any)?.endereco || undefined,
                });
            } catch (error) {
                console.error("Erro ao buscar dados do paciente:", error);
                setInfoPacienteBarra({
                    nome: paciente.nomeCompleto,
                    idade: paciente.idade,
                    sexo: undefined,
                    municipio: undefined,
                    endereco: undefined,
                });
            }

            await atualizarStatusAgendamento(paciente.agendamentoId, "EM_ATENDIMENTO");
            setPacienteParaAtendimento(paciente);
            setDataInicioAtendimento(new Date()); // Inicia o timer
            setShowDetalhes(false);
            setActiveTab("novo");
            await queryClient.invalidateQueries({ queryKey: ["pacientesTriados"] });
        } catch (error) {
            console.error("Erro ao iniciar atendimento:", error);
            toast({ title: "Erro", description: "Erro ao iniciar o atendimento.", variant: "destructive" });
        }
    };

    // =========================
    // RETORNAR PARA AVALIAÇÃO (após Cuidados de Enfermagem)
    // =========================
    const handleRetornarParaAvaliacao = async (paciente: PacienteTriado) => {
        try {
            // Busca o procedimento ativo do paciente
            const procedimentoAtivo = await procedimentosRapidosService.buscarProcedimentoAtivoPorPaciente(paciente.pacienteId);
            
            if (!procedimentoAtivo) {
                toast({
                    title: "Aviso",
                    description: "Nenhum procedimento ativo encontrado para este paciente.",
                    variant: "default",
                });
                return;
            }

            // Verifica se há médico solicitante para retornar
            if (procedimentoAtivo.medicoSolicitante) {
                toast({
                    title: "Retornando para Avaliação",
                    description: `Paciente retornará para avaliação com ${procedimentoAtivo.medicoSolicitante}.`,
                });
            }

            // Inicia o atendimento normalmente
            await handleIniciarAtendimento(paciente);
        } catch (error: any) {
            console.error("Erro ao retornar para avaliação:", error);
            const parsedError = parseApiError(error);
            showErrorToast(parsedError);
        }
    };

    const toggleLinha = (codigo: string) => {
        setLinhasCuidadoSelecionadas((prev) =>
            prev.includes(codigo) ? prev.filter((c) => c !== codigo) : [...prev, codigo]
        );
    };

    // =========================
    // Render
    // =========================
    return (
        <div className="container mx-auto py-8">
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
                <TabsList className="mb-4">
                    <TabsTrigger value="triados">Pacientes Triados</TabsTrigger>
                    <TabsTrigger value="novo">
                        Novo Atendimento
                        {pacienteParaAtendimento && (
                            <Badge variant="outline" className="ml-2 bg-blue-100 text-blue-800">
                                Em Atendimento
                            </Badge>
                        )}
                    </TabsTrigger>
                    <TabsTrigger value="documentos" disabled={!pacienteId}>
                        Documentos
                    </TabsTrigger>
                    <TabsTrigger value="historico" disabled={!pacienteId}>
                        Histórico
                    </TabsTrigger>
                </TabsList>

                {/* TRIADOS */}
                <TabsContent value="triados">
                    <Card>
                        <CardHeader>
                            <CardTitle>Pacientes Aguardando Atendimento Médico</CardTitle>
                            <CardDescription>
                                Pacientes já triados, aguardando atendimento médico. Clique em um paciente para iniciar.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="relative max-w-md">
                                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Buscar por nome, cartão SUS, queixa ou profissional..."
                                    className="pl-8"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>

                            {isLoadingPacientes && (
                                <div className="flex items-center justify-center p-8">
                                    <Loader2 className="mr-2 h-6 w-6 animate-spin" />
                                    <span>Carregando pacientes triados...</span>
                                </div>
                            )}

                            {error && (
                                <Alert>
                                    <AlertCircle className="h-4 w-4" />
                                    <AlertDescription className="text-red-600">
                                        Erro ao buscar pacientes triados. Tente novamente.
                                    </AlertDescription>
                                </Alert>
                            )}

                            <div className="rounded-md border">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Paciente</TableHead>
                                            <TableHead>Idade</TableHead>
                                            <TableHead>Horário Triagem</TableHead>
                                            <TableHead>Profissional</TableHead>
                                            <TableHead>Queixa Principal</TableHead>
                                            <TableHead>Sinais Vitais</TableHead>
                                            <TableHead>Ações</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {pacientesFiltrados.length > 0 ? (
                                            pacientesFiltrados.map((paciente) => (
                                                <TableRow
                                                    key={paciente.triagemId}
                                                    className="cursor-pointer hover:bg-gray-50"
                                                    onClick={() => handleIniciarAtendimento(paciente)}
                                                >
                                                    <TableCell>
                                                        <div className="flex items-center gap-2">
                                                            <User className="h-4 w-4 text-gray-500" />
                                                            <div className="flex-1">
                                                                <div className="flex items-center gap-2">
                                                                    <span className="font-medium">{paciente.nomeCompleto}</span>
                                                                    {/* Badge azul indicando que está em Cuidados de Enfermagem */}
                                                                    {pacientesComProcedimentoAtivo.has(paciente.pacienteId) && (
                                                                        <Badge className="bg-blue-500 text-white text-xs">
                                                                            <Pill className="h-3 w-3 mr-1" />
                                                                            Em Cuidados de Enfermagem
                                                                        </Badge>
                                                                    )}
                                                                </div>
                                                                <div className="text-sm text-gray-500">SUS: {paciente.cartaoSus}</div>
                                                            </div>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>{paciente.idade ? `${paciente.idade} anos` : "N/I"}</TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center gap-2">
                                                            <Clock className="h-4 w-4 text-gray-500" />
                                                            {formatarHorario(paciente.horarioTriagem)}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center gap-2">
                                                            <UserCheck className="h-4 w-4 text-blue-500" />
                                                            <div className="text-sm">{paciente.profissionalTriagem || "N/I"}</div>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="max-w-xs truncate" title={paciente.queixaPrincipal}>
                                                            {paciente.queixaPrincipal}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex flex-wrap gap-1 text-xs">
                                                            {paciente.escalaDor !== undefined && (
                                                                <Badge variant="outline" className="text-xs">Dor: {paciente.escalaDor}/10</Badge>
                                                            )}
                                                            {paciente.temperatura !== undefined && (
                                                                <Badge variant="outline" className="text-xs">{paciente.temperatura}°C</Badge>
                                                            )}
                                                            {paciente.pressaoArterial && (
                                                                <Badge variant="outline" className="text-xs">{paciente.pressaoArterial}</Badge>
                                                            )}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        {pacientesComProcedimentoAtivo.has(paciente.pacienteId) && (
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                className="text-blue-600 border-blue-300 hover:bg-blue-50"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleRetornarParaAvaliacao(paciente);
                                                                }}
                                                            >
                                                                <ArrowLeft className="h-3 w-3 mr-1" />
                                                                Retornar
                                                            </Button>
                                                        )}
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        ) : (
                                            <TableRow>
                                                <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                                                    <div className="flex flex-col items-center gap-2">
                                                        <Stethoscope className="h-12 w-12 text-gray-300" />
                                                        <span>
                              {searchTerm
                                  ? "Nenhum paciente encontrado para esta busca"
                                  : "Nenhum paciente aguardando atendimento"}
                            </span>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* NOVO ATENDIMENTO */}
                <TabsContent value="novo">
                    {/* ✅ BARRA SUPERIOR FIXA */}
                    {(pacienteParaAtendimento || pacienteSelecionadoLivre) && (
                        <BarraSuperiorAtendimento
                            pacienteNome={infoPacienteBarra?.nome || pacienteParaAtendimento?.nomeCompleto || pacienteSelecionadoLivre?.nome}
                            pacienteIdade={infoPacienteBarra?.idade ?? pacienteParaAtendimento?.idade ?? null}
                            pacienteSexo={infoPacienteBarra?.sexo || undefined}
                            pacienteMunicipio={infoPacienteBarra?.municipio || undefined}
                            pacienteEndereco={infoPacienteBarra?.endereco || undefined}
                            setor={pacienteParaAtendimento?.setor || undefined}
                            especialidade={pacienteParaAtendimento?.especialidade || undefined}
                            dataInicioAtendimento={dataInicioAtendimento || undefined}
                            onRefreshClick={() => {
                                queryClient.invalidateQueries({ queryKey: ["pacientesTriados"] });
                                toast({ title: "Atualizado", description: "Lista de pacientes atualizada." });
                            }}
                        />
                    )}

                    <Card className="mb-6">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle>Novo Atendimento</CardTitle>
                                <CardDescription>Você pode iniciar a partir da triagem ou pela demanda espontânea.</CardDescription>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="text-sm text-muted-foreground">Demanda Espontânea</span>
                                <Switch checked={semTriagem} onCheckedChange={setSemTriagem} />
                            </div>
                        </CardHeader>

                        {semTriagem && (
                            <CardContent className="space-y-3">
                                <div className="grid gap-2">
                                    <label className="text-sm font-medium text-gray-700">Buscar paciente (nome/CPF/SUS)</label>
                                    <div className="flex gap-2">
                                        <Input
                                            placeholder="Digite pelo menos 3 letras…"
                                            value={buscaPaciente}
                                            onChange={(e) => setBuscaPaciente(e.target.value)}
                                            onKeyUp={(e) => {
                                                const val = (e.target as HTMLInputElement).value;
                                                if (val.trim().length >= 3) executarBuscaPacientes(val);
                                            }}
                                        />
                                        <Button
                                            type="button"
                                            variant="secondary"
                                            onClick={() => executarBuscaPacientes(buscaPaciente)}
                                            disabled={buscaPaciente.trim().length < 3 || buscandoPac}
                                        >
                                            {buscandoPac ? "Buscando…" : "Buscar"}
                                        </Button>
                                    </div>

                                    {!!resultadosBusca.length && (
                                        <div className="rounded-md border divide-y">
                                            {resultadosBusca.map((p) => (
                                                <button
                                                    key={p.id}
                                                    type="button"
                                                    onClick={() => {
                                                        setPacienteSelecionadoLivre(p);
                                                        setResultadosBusca([]);
                                                    }}
                                                    className="w-full text-left p-2 hover:bg-gray-50"
                                                >
                                                    <div className="font-medium">{p.nome}</div>
                                                    <div className="text-xs text-muted-foreground">
                                                        {p.cpf ? `CPF: ${p.cpf}` : ""} {p.cartaoSus ? ` | SUS: ${p.cartaoSus}` : ""}
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    )}

                                    {pacienteSelecionadoLivre && (
                                        <div className="flex items-center gap-2">
                                            <Badge>{pacienteSelecionadoLivre.nome}</Badge>
                                            <Button type="button" size="sm" variant="ghost" onClick={() => setPacienteSelecionadoLivre(null)}>
                                                Trocar
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        )}
                    </Card>

                    {pacienteParaAtendimento && !semTriagem && (
                        <Card className="mb-6">
                            <CardHeader>
                                <CardTitle className="text-xl text-blue-900">{pacienteParaAtendimento.nomeCompleto}</CardTitle>
                                <CardDescription className="text-sm">SUS: {pacienteParaAtendimento.cartaoSus}</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {pacienteParaAtendimento.queixaPrincipal && (
                                    <div>
                                        <div className="text-sm font-medium text-gray-700">Queixa Acolhimento</div>
                                        <div className="mt-1 p-2 bg-gray-50 border border-gray-200 rounded text-gray-800 whitespace-pre-wrap">
                                            {pacienteParaAtendimento.queixaPrincipal}
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    )}

                    {/* Linhas de Cuidado */}
                    <Card className="mb-6">
                        <CardHeader>
                            <CardTitle className="text-base">Linhas de Cuidado</CardTitle>
                            <CardDescription>Selecione as linhas aplicáveis a este atendimento.</CardDescription>
                        </CardHeader>
                        <CardContent className="flex flex-wrap gap-2">
                            {LINHAS_CUIDADO.map((l) => {
                                const ativo = linhasCuidadoSelecionadas.includes(l.codigo);
                                return (
                                    <button
                                        key={l.codigo}
                                        type="button"
                                        onClick={() => toggleLinha(l.codigo)}
                                        className={`rounded-full px-3 py-1 text-sm border transition ${
                                            ativo
                                                ? "bg-emerald-600 text-white border-emerald-600"
                                                : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                                        }`}
                                    >
                                        {l.label}
                                    </button>
                                );
                            })}
                            {!linhasCuidadoSelecionadas.length && (
                                <p className="text-sm text-muted-foreground">Nenhuma linha selecionada.</p>
                            )}
                        </CardContent>
                    </Card>

                    <AtendimentoForm
                        title=""
                        description=""
                        onSave={handleSaveAtendimento}
                        onCancel={() => {
                            setPacienteParaAtendimento(null);
                            setActiveTab("triados");
                        }}
                        isLoading={isLoading}
                        initialData={
                            pacienteParaAtendimento && !semTriagem
                                ? {
                                    pacienteId: pacienteParaAtendimento.pacienteId.toString(),
                                    queixaPrincipal: pacienteParaAtendimento.queixaPrincipal,
                                    observacoes: `DADOS DA TRIAGEM:
${pacienteParaAtendimento.escalaDor !== undefined ? `Escala de Dor: ${pacienteParaAtendimento.escalaDor}/10` : ""}
Profissional da Triagem: ${pacienteParaAtendimento.profissionalTriagem}
Horário da Triagem: ${formatarHorario(pacienteParaAtendimento.horarioTriagem)}
${pacienteParaAtendimento.pressaoArterial ? `Pressão: ${pacienteParaAtendimento.pressaoArterial}` : ""}
${pacienteParaAtendimento.temperatura !== undefined ? `Temperatura: ${pacienteParaAtendimento.temperatura}°C` : ""}
${pacienteParaAtendimento.peso !== undefined ? `Peso: ${pacienteParaAtendimento.peso}kg` : ""}
${pacienteParaAtendimento.altura !== undefined ? `Altura: ${pacienteParaAtendimento.altura}m` : ""}
${pacienteParaAtendimento.frequenciaCardiaca !== undefined ? `Freq. Cardíaca: ${pacienteParaAtendimento.frequenciaCardiaca}bpm` : ""}
${pacienteParaAtendimento.saturacaoOxigenio !== undefined ? `Saturação O₂: ${pacienteParaAtendimento.saturacaoOxigenio}%` : ""}

OBSERVAÇÕES DA TRIAGEM:
${pacienteParaAtendimento.observacoes || "Nenhuma observação registrada"}`,
                                }
                                : undefined
                        }
                    />
                </TabsContent>

                <TabsContent value="documentos">
                    {pacienteId && <DocumentosMedicos pacienteId={pacienteId} atendimentoId={atendimentoId} />}
                </TabsContent>

                <TabsContent value="historico">
                    {pacienteId && (
                        <div className="space-y-6">
                            {/* Histórico clínico existente */}
                            <HistoricoAtendimentos pacienteId={pacienteId} />

                            {/* Histórico de agendamentos com filtros (reuso do endpoint já existente) */}
                            <div className="mt-2">
                                <h3 className="text-lg font-semibold mb-2">Histórico de Agendamentos</h3>
                                <HistoricoAgendamentosPaciente pacienteId={pacienteId} />
                            </div>
                        </div>
                    )}
                </TabsContent>
            </Tabs>

            {/* Modal Detalhes da Triagem — conteúdo poderá ser expandido conforme necessidade */}
            <Dialog open={showDetalhes} onOpenChange={setShowDetalhes}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <User className="h-5 w-5" />
                            Detalhes da Triagem{selectedPaciente ? ` - ${selectedPaciente.nomeCompleto}` : ""}
                        </DialogTitle>
                        <DialogDescription>Informações completas da triagem realizada.</DialogDescription>
                    </DialogHeader>
                    {/* TODO: renderizar dados completos de `selectedPaciente` quando você quiser detalhar */}
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default AtendimentoMedico;
