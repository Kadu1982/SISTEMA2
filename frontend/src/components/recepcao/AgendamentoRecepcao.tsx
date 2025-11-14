import React, { useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
    Calendar as CalendarIcon,
    Search,
    PlusCircle,
    Clock,
    User,
    AlertCircle,
    CheckCircle,
    XCircle,
    ArrowLeft,
    Edit3,
    MoreHorizontal,
    RotateCcw,
    Printer,
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

// UI (shadcn) — identidade preservada
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

// Componentes de domínio
import MenuReimpressao from "@/components/agendamento/MenuReimpressao";
import PacienteBusca from "@/components/agendamento/PacienteBusca";
import SeletorExamesCheckbox from "@/components/agendamento/SeletorExamesCheckbox";

// Tipos de domínio
import { Paciente } from "@/types/paciente/Paciente";
import { formatarExamesSelecionados } from "@/types/Agendamento";

// Hooks customizados (mantidos)
import { useAgendamentos } from "@/hooks/useAgendamentos";
import { useEstatisticas } from "@/hooks/useEstatisticas";
import { useAgendamentoForm } from "@/hooks/useAgendamentoForm";
import { useFeedback } from "@/hooks/useFeedback";
import { usePacienteAgendamentos } from "@/hooks/usePacienteAgendamentos";
import { useAgendamentoOperations } from "@/hooks/useAgendamentoOperations";
import { useAgendamentoSearch } from "@/hooks/useAgendamentoSearch";

/** Tipos locais (leves) só para evitar `any` sem engessar sua API */
type AgendamentoStatus = "AGENDADO" | "RECEPCIONADO" | "ATENDIDO" | "REAGENDADO" | "FALTOU" | string;

interface AgendamentoListItem {
    id: number;
    dataHora: string; // ISO
    tipo: string; // consulta_medica | exame_laboratorial | ...
    status: AgendamentoStatus;
    especialidade?: string | null;
    examesSelecionados?: any[];
    pacienteNome?: string | null;
    observacoes?: string | null;
}

interface NovoAgendamentoPayload {
    pacienteId: number;
    tipo: string;
    dataHora: string; // ISO
    prioridade: string;
    observacoes: string | null;
    unidade: string;
    especialidade: string | null;
    examesSelecionados: any[];
}

const AgendamentoRecepcao: React.FC = () => {
    const navigate = useNavigate();

    // Data da Agenda do Dia
    const [date, setDate] = useState<Date | undefined>(new Date());

    // Estado do modal "Novo Agendamento"
    const [isNovoAgendamentoOpen, setIsNovoAgendamentoOpen] = useState(false);

    // Seleção de agendamento (edição de status)
    const [agendamentoSelecionado, setAgendamentoSelecionado] = useState<AgendamentoListItem | null>(null);

    const [isEditStatusOpen, setIsEditStatusOpen] = useState(false);
    const [novoStatus, setNovoStatus] = useState<AgendamentoStatus>("");
    // Controle de abertura do menu de ações por linha
    const [acoesOpenId, setAcoesOpenId] = useState<number | null>(null);
    
    // Estados para cancelamento de agendamento
    const [isCancelarOpen, setIsCancelarOpen] = useState(false);
    const [motivoCancelamento, setMotivoCancelamento] = useState("");

    // Validação do form de agendamento
    const [erroValidacao, setErroValidacao] = useState<string | any>("");

    // ID do agendamento recém-criado (para “Imprimir Comprovante”)
    const [agendamentoCriadoId, setAgendamentoCriadoId] = useState<number | null>(null);

    // Hooks de dados/estado (mantidos)
    const { agendamentos, isLoading, isError, refetch, queryClient, invalidateAgendamentos } = useAgendamentos(date);
    const estatisticas = useEstatisticas();
    const { mensagemFeedback, mostrarFeedback } = useFeedback();
    const { searchTerm, setSearchTerm, filteredAgendamentos } = useAgendamentoSearch(agendamentos);

    const {
        agendamentosPaciente,
        loadingAgendamentosPaciente,
        errorAgendamentosPaciente,
        buscarAgendamentosPaciente,
        limparAgendamentosPaciente,
    } = usePacienteAgendamentos();

    const { salvarAgendamento, atualizarStatus } = useAgendamentoOperations();

    // Estado do form (hook próprio do projeto)
    const {
        pacienteSelecionado,
        setPacienteSelecionado,
        tipoAtendimento,
        setTipoAtendimento,
        dataHoraAgendamento,
        setDataHoraAgendamento,
        especialidade,
        setEspecialidade,
        examesSelecionados,
        setExamesSelecionados,
        prioridade,
        setPrioridade,
        observacoes,
        setObservacoes,
        resetarFormulario,
        validarAgendamento,
        especialidadesDisponiveis,
        isEspecialidadeObrigatoria,
        getLabelCampoEspecialidade,
        getPlaceholderCampoEspecialidade,
        isExameMultiplo,
        isConsulta,
    } = useAgendamentoForm();

    // Listas memoizadas para evitar recomputar a cada render
    const agendamentosPacienteOrdenados = useMemo(
        () =>
            [...agendamentosPaciente].sort(
                (a, b) => new Date(b.dataHora).getTime() - new Date(a.dataHora).getTime()
            ),
        [agendamentosPaciente]
    );

    const agendamentosOrdenados = useMemo(
        () =>
            (filteredAgendamentos && filteredAgendamentos.length > 0)
                ? [...filteredAgendamentos].sort(
                    (a, b) => new Date(a.dataHora).getTime() - new Date(b.dataHora).getTime()
                  )
                : [],
        [filteredAgendamentos]
    );

    // ----------------------------------------------------------------------------
    // Util para abrir comprovante (PDF) direto do backend
    // ----------------------------------------------------------------------------
    const getApiRoot = () => {
        // Em dev, usa proxy do Vite (porta 5173 redireciona /api para backend:8080)
        // Em prod, VITE_API_BASE_URL terá a URL completa
        const envBase = (import.meta as any)?.env?.VITE_API_BASE_URL as string | undefined;
        if (envBase && envBase.trim()) {
            // Se tem /api no final, remove para ter apenas a raiz
            return envBase.replace(/\/api\/?$/i, "");
        }
        // Fallback para desenvolvimento local (usa URL atual do browser)
        return window.location.origin;
    };

    const abrirComprovante = async (agendamentoId: number) => {
        try {
            const token = localStorage.getItem('token');
            const root = getApiRoot();
            const url = `${root}/api/agendamentos/${agendamentoId}/comprovante`;

            const response = await fetch(url, {
                headers: {
                    'Authorization': token ? `Bearer ${token}` : ''
                }
            });

            if (!response.ok) {
                console.error('Erro ao buscar documento:', response.status);
                mostrarFeedback('error', 'Erro ao abrir documento');
                return;
            }

            const blob = await response.blob();
            const blobUrl = URL.createObjectURL(blob);
            window.open(blobUrl, '_blank', 'noopener,noreferrer');
            setTimeout(() => URL.revokeObjectURL(blobUrl), 60000);
        } catch (error) {
            console.error('Erro ao abrir documento:', error);
            mostrarFeedback('error', 'Erro ao abrir documento');
        }
    };

    const abrirSadt = async (agendamentoId: number) => {
        try {
            const token = localStorage.getItem('token');
            const root = getApiRoot();
            const url = `${root}/api/agendamentos/${agendamentoId}/sadt-pdf`;

            const response = await fetch(url, {
                headers: {
                    'Authorization': token ? `Bearer ${token}` : ''
                }
            });

            if (!response.ok) {
                console.error('Erro ao buscar SADT:', response.status);
                mostrarFeedback('error', 'Erro ao abrir SADT');
                return;
            }

            const blob = await response.blob();
            const blobUrl = URL.createObjectURL(blob);
            window.open(blobUrl, '_blank', 'noopener,noreferrer');
            setTimeout(() => URL.revokeObjectURL(blobUrl), 60000);
        } catch (error) {
            console.error('Erro ao abrir SADT:', error);
            mostrarFeedback('error', 'Erro ao abrir SADT');
        }
    };

    const temExames = (ag: AgendamentoListItem): boolean => {
        return ag.examesSelecionados != null && ag.examesSelecionados.length > 0;
    };

    // ----------------------------------------------------------------------------
    // Callbacks de seleção/limpeza de paciente
    // ----------------------------------------------------------------------------
    const handlePacienteSelecionado = (paciente: Paciente | null) => {
        if (paciente) {
            setPacienteSelecionado(paciente);
            setAgendamentoCriadoId(null);

            // 🔧 TS2322: garanti que só chamamos se `id` for número
            if (typeof (paciente as any).id === "number") {
                buscarAgendamentosPaciente((paciente as any).id as number);
            }
        } else {
            setPacienteSelecionado(null);
            setAgendamentoCriadoId(null);
            limparAgendamentosPaciente();
        }
    };

    const limparBusca = () => {
        setPacienteSelecionado(null);
        setAgendamentoCriadoId(null);
        resetarFormulario();
        limparAgendamentosPaciente();
    };

    // ----------------------------------------------------------------------------
    // Renderização de mensagens de validação amigáveis (erros/avisos/sugestões)
    // ----------------------------------------------------------------------------
    const renderizarErroValidacao = (erro: any) => {
        if (typeof erro === "string") return erro;
        if (erro && typeof erro === "object") {
            return (
                <div className="space-y-2">
                    {erro.valido === false && <div className="text-red-600 font-medium">❌ Dados inválidos</div>}

                    {erro.erros?.length > 0 && (
                        <div>
                            <strong className="text-red-600">Erros:</strong>
                            <ul className="list-disc list-inside ml-4 text-red-600">
                                {erro.erros.map((item: string, idx: number) => (
                                    <li key={idx}>{item}</li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {erro.avisos?.length > 0 && (
                        <div>
                            <strong className="text-yellow-600">Avisos:</strong>
                            <ul className="list-disc list-inside ml-4 text-yellow-600">
                                {erro.avisos.map((item: string, idx: number) => (
                                    <li key={idx}>{item}</li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {erro.sugestoes?.length > 0 && (
                        <div>
                            <strong className="text-blue-600">Sugestões:</strong>
                            <ul className="list-disc list-inside ml-4 text-blue-600">
                                {erro.sugestoes.map((item: string, idx: number) => (
                                    <li key={idx}>{item}</li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            );
        }
        return String(erro);
    };

    // ----------------------------------------------------------------------------
    // Salvar agendamento (novo)
    // ----------------------------------------------------------------------------
    const handleSalvarAgendamento = async () => {
        setErroValidacao("");

        const erro = validarAgendamento();
        if (erro) {
            setErroValidacao(erro);
            return;
        }
        if (!pacienteSelecionado) {
            setErroValidacao("Selecione um paciente antes de salvar o agendamento.");
            return;
        }

        // 🔧 TS2322: narrow + validação do id
        const pacienteIdNum = Number((pacienteSelecionado as any).id);
        if (!Number.isFinite(pacienteIdNum)) {
            setErroValidacao("O paciente selecionado está sem ID válido. Tente selecionar novamente.");
            return;
        }

        const payload: NovoAgendamentoPayload = {
            pacienteId: pacienteIdNum, // ✅ agora é number
            tipo: tipoAtendimento,
            // Envia no formato local (sem timezone) para evitar deslocamento de fuso
            dataHora: (dataHoraAgendamento || '').trim(),
            prioridade,
            observacoes: observacoes.trim() || null,
            unidade: "Unidade Principal",
            ...(isExameMultiplo()
                ? { examesSelecionados: examesSelecionados, especialidade: null }
                : { especialidade: especialidade, examesSelecionados: [] }),
        };

        const created: any = await salvarAgendamento(
            payload,
            queryClient,
            () => {
                const msg = isExameMultiplo()
                    ? `Agendamento criado! ${examesSelecionados.length} exame(s) selecionado(s). SADT será gerada automaticamente.`
                    : "Agendamento criado! Você já pode imprimir o comprovante.";
                mostrarFeedback("success", msg);

                resetarFormulario();
                setIsNovoAgendamentoOpen(false);

                // 🔧 TS2322: só chama se id for number
                if (Number.isFinite(pacienteIdNum)) buscarAgendamentosPaciente(pacienteIdNum);
            },
            () => {
                mostrarFeedback("error", "Erro ao criar agendamento.");
            }
        );

        const novoId = created?.id ?? created?.data?.id ?? created?.agendamento?.id ?? null;
        if (novoId) setAgendamentoCriadoId(Number(novoId));
    };

    // ----------------------------------------------------------------------------
    // Atualização de status
    // ----------------------------------------------------------------------------
    const handleAtualizarStatus = async () => {
        if (!agendamentoSelecionado || !novoStatus) return;
        try {
            await atualizarStatus(agendamentoSelecionado.id, novoStatus, queryClient, refetch);
            mostrarFeedback("success", "Status atualizado com sucesso!");
            setIsEditStatusOpen(false);
            setAgendamentoSelecionado(null);
            setNovoStatus("");
        } catch (error) {
            mostrarFeedback("error", `Erro ao atualizar status: ${error}`);
        }
    };

    /**
     * Função para cancelar um agendamento (consultas ou exames).
     * Envia o motivo do cancelamento para o backend e registra na auditoria.
     * ✅ Otimizado com useCallback para evitar re-renders desnecessários
     */
    const handleCancelarAgendamento = useCallback(async () => {
        if (!agendamentoSelecionado) return;
        
        // Valida se o motivo foi preenchido
        if (!motivoCancelamento.trim()) {
            mostrarFeedback("error", "Por favor, informe o motivo do cancelamento.");
            return;
        }

        try {
            // 🔐 Obtém o token do localStorage para autenticação
            const token = localStorage.getItem('token');
            
            if (!token) {
                mostrarFeedback("error", "Sessão expirada. Por favor, faça login novamente.");
                return;
            }

            const root = getApiRoot();
            
            console.log('🔐 Cancelando agendamento:', {
                id: agendamentoSelecionado.id,
                motivo: motivoCancelamento,
                hasToken: !!token
            });
            
            // Faz a requisição POST para o endpoint de cancelamento
            const response = await fetch(`${root}/api/agendamentos/${agendamentoSelecionado.id}/cancelar`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ motivo: motivoCancelamento })
            });

            console.log('📡 Resposta do servidor:', response.status, response.statusText);

            if (!response.ok) {
                // Trata erro 403 especificamente
                if (response.status === 403) {
                    throw new Error('Você não tem permissão para cancelar agendamentos. Verifique suas credenciais.');
                }
                
                const errorData = await response.json().catch(() => ({ message: 'Erro ao cancelar agendamento' }));
                throw new Error(errorData.message || 'Erro ao cancelar agendamento');
            }

            mostrarFeedback("success", "Agendamento cancelado com sucesso!");
            
            // Fecha o modal e limpa os estados
            setIsCancelarOpen(false);
            setAgendamentoSelecionado(null);
            setMotivoCancelamento("");
            
            // ✅ Recarrega a lista de agendamentos de forma otimizada
            // Usando invalidateQueries ao invés de refetch para evitar loops
            setTimeout(() => {
                invalidateAgendamentos();
            }, 100);
        } catch (error: any) {
            console.error('❌ Erro ao cancelar agendamento:', error);
            mostrarFeedback("error", error.message || "Erro ao cancelar agendamento");
        }
    }, [agendamentoSelecionado, motivoCancelamento, mostrarFeedback, invalidateAgendamentos]);

    // ----------------------------------------------------------------------------
    // Helpers de formatação exibidos na tabela
    // ----------------------------------------------------------------------------
    const formatarDataHora = (dataHoraString: string) => format(new Date(dataHoraString), "dd/MM/yyyy HH:mm", { locale: ptBR });
    const formatarHora = (dataHoraString: string) => format(new Date(dataHoraString), "HH:mm", { locale: ptBR });

    const formatarTipoAtendimento = (tipo: string) => {
        if (!tipo) return "Não informado";
        const tipos: Record<string, string> = {
            consulta_medica: "Consulta Médica",
            consulta_enfermagem: "Consulta de Enfermagem",
            exame_laboratorial: "Exame Laboratorial",
            exame_imagem: "Exame de Imagem",
            procedimento: "Procedimento",
            vacina: "Vacinação",
            retorno: "Retorno",
        };
        return tipos[tipo] || tipo.replace("_", " ").replace(/\b\w/g, (l: string) => l.toUpperCase());
    };

    const formatarEspecialidadeOuExames = (ag: AgendamentoListItem): string => {
        if (ag.examesSelecionados && ag.examesSelecionados.length > 0) {
            return formatarExamesSelecionados(ag.examesSelecionados, ag.tipo);
        }
        if (ag.especialidade) {
            return ag.especialidade.replace(/_/g, " ").replace(/\b\w/g, (l: string) => l.toUpperCase());
        }
        return "-";
    };

    // ----------------------------------------------------------------------------
    // Render
    // ----------------------------------------------------------------------------
    return (
        <div className="space-y-6 p-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Button variant="outline" onClick={() => navigate("/dashboard")} className="flex items-center gap-2">
                    <ArrowLeft className="h-4 w-4" />
                    Voltar
                </Button>
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-gray-900">Agendamentos - Recepção</h2>
                    <p className="text-muted-foreground">Gerencie agendamentos dos pacientes</p>
                </div>
            </div>

            {/* Feedback Visual */}
            {mensagemFeedback.tipo && (
                <Alert className={mensagemFeedback.tipo === "success" ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
                    {mensagemFeedback.tipo === "success" ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                        <XCircle className="h-4 w-4 text-red-600" />
                    )}
                    <AlertDescription className={mensagemFeedback.tipo === "success" ? "text-green-800" : "text-red-800"}>
                        {mensagemFeedback.texto}
                    </AlertDescription>
                </Alert>
            )}

            {/* Botão de impressão após criar */}
            {agendamentoCriadoId && (
                <BotaoImpressaoAgendamento
                    agendamentoCriadoId={agendamentoCriadoId}
                    tipoAtendimento={tipoAtendimento}
                    examesSelecionados={examesSelecionados}
                    onOcultar={() => setAgendamentoCriadoId(null)}
                    onAbrirSadt={abrirSadt}
                    onAbrirComprovante={abrirComprovante}
                />
            )}

            {/* Cards de Estatísticas */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Hoje</CardTitle>
                        <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{estatisticas?.total || 0}</div>
                        <p className="text-xs text-muted-foreground">agendamentos</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Agendados</CardTitle>
                        <Clock className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-blue-600">{estatisticas?.agendados || 0}</div>
                        <p className="text-xs text-muted-foreground">aguardando</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Recepcionados</CardTitle>
                        <CheckCircle className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">{estatisticas?.recepcionados || 0}</div>
                        <p className="text-xs text-muted-foreground">recepcionados</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Reagendados</CardTitle>
                        <RotateCcw className="h-4 w-4 text-orange-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-orange-600">{estatisticas?.reagendados || 0}</div>
                        <p className="text-xs text-muted-foreground">reagendados</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Atendidos</CardTitle>
                        <User className="h-4 w-4 text-emerald-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-emerald-600">{estatisticas?.atendidos || 0}</div>
                        <p className="text-xs text-muted-foreground">atendidos</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Faltaram</CardTitle>
                        <XCircle className="h-4 w-4 text-red-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-600">{estatisticas?.faltaram || 0}</div>
                        <p className="text-xs text-muted-foreground">faltaram</p>
                    </CardContent>
                </Card>
            </div>

            {/* Busca de Paciente / criação de agendamento */}
            <Card>
                <CardHeader>
                    <CardTitle>Busca de Paciente e Agendamentos</CardTitle>
                    <CardDescription>Busque um paciente para visualizar ou criar agendamentos</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <h3 className="text-lg font-semibold flex items-center gap-2">
                                <User className="h-5 w-5 text-blue-600" />
                                Buscar Paciente
                            </h3>
                            {pacienteSelecionado && (
                                <Button variant="outline" size="sm" onClick={limparBusca}>
                                    Limpar Busca
                                </Button>
                            )}
                        </div>

                        <PacienteBusca
                            onPacienteSelecionado={handlePacienteSelecionado}
                            placeholder="Digite o nome ou CPF do paciente para buscar agendamentos..."
                        />
                    </div>

                    {/* Agendamentos do paciente selecionado */}
                    {pacienteSelecionado && (
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <h3 className="text-lg font-semibold flex items-center gap-2">
                                    <Clock className="h-5 w-5 text-green-600" />
                                    Agendamentos de {pacienteSelecionado.nomeCompleto}
                                </h3>

                                {/* Novo agendamento */}
                                <Dialog
                                    open={isNovoAgendamentoOpen}
                                    onOpenChange={(open) => {
                                        setIsNovoAgendamentoOpen(open);
                                        if (!open) resetarFormulario();
                                    }}
                                >
                                    <DialogTrigger asChild>
                                        <Button>
                                            <PlusCircle className="mr-2 h-4 w-4" /> Novo Agendamento
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
                                        <DialogHeader>
                                            <DialogTitle>Novo Agendamento</DialogTitle>
                                            <DialogDescription>Criar agendamento para {pacienteSelecionado.nomeCompleto}</DialogDescription>
                                        </DialogHeader>

                                        {erroValidacao && (
                                            <Alert className="border-red-200 bg-red-50">
                                                <XCircle className="h-4 w-4 text-red-600" />
                                                <AlertDescription className="text-red-800">{renderizarErroValidacao(erroValidacao)}</AlertDescription>
                                            </Alert>
                                        )}

                                        <div className="grid gap-6 py-4">
                                            {/* Tipo de atendimento */}
                                            <div className="grid gap-2">
                                                <Label htmlFor="tipo">Tipo de Atendimento</Label>
                                                <Select value={tipoAtendimento} onValueChange={setTipoAtendimento}>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Selecione o tipo" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="consulta_medica">Consulta Médica</SelectItem>
                                                        <SelectItem value="consulta_enfermagem">Consulta de Enfermagem</SelectItem>
                                                        <SelectItem value="consulta_odontologica">Consulta Odontológica</SelectItem>
                                                        <SelectItem value="exame_laboratorial">Exame Laboratorial</SelectItem>
                                                        <SelectItem value="exame_imagem">Exame de Imagem</SelectItem>
                                                        <SelectItem value="procedimento">Procedimento</SelectItem>
                                                        <SelectItem value="vacina">Vacinação</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>

                                            {/* Especialidade (consulta) ou Exames (SADT) */}
                                            {tipoAtendimento && (
                                                <div className="grid gap-2">
                                                    <Label htmlFor="especialidade">
                                                        {getLabelCampoEspecialidade()}
                                                        {isEspecialidadeObrigatoria() && " *"}
                                                    </Label>

                                                    {isConsulta() && (
                                                        <Select value={especialidade} onValueChange={setEspecialidade}>
                                                            <SelectTrigger>
                                                                <SelectValue placeholder={getPlaceholderCampoEspecialidade()} />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {especialidadesDisponiveis.map((esp) => (
                                                                    <SelectItem key={esp.value} value={esp.value}>
                                                                        {esp.label}
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                    )}

                                                    {isExameMultiplo() && (
                                                        <SeletorExamesCheckbox
                                                            tipoExame={tipoAtendimento as "exame_laboratorial" | "exame_imagem"}
                                                            examesSelecionados={examesSelecionados}
                                                            onExamesChange={setExamesSelecionados}
                                                            placeholder={getPlaceholderCampoEspecialidade()}
                                                        />
                                                    )}
                                                </div>
                                            )}

                                            {/* Data e hora */}
                                            <div className="grid gap-2">
                                                <Label htmlFor="dataHora">Data e Hora</Label>
                                                <Input
                                                    id="dataHora"
                                                    type="datetime-local"
                                                    value={dataHoraAgendamento}
                                                    onChange={(e) => setDataHoraAgendamento(e.target.value)}
                                                />
                                            </div>

                                            {/* Prioridade */}
                                            <div className="grid gap-2">
                                                <Label htmlFor="prioridade">Prioridade</Label>
                                                <Select value={prioridade} onValueChange={setPrioridade}>
                                                    <SelectTrigger>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="normal">Normal</SelectItem>
                                                        <SelectItem value="urgente">Urgente</SelectItem>
                                                        <SelectItem value="emergencia">Emergência</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>

                                            {/* Observações */}
                                            <div className="grid gap-2">
                                                <Label htmlFor="observacoes">Observações</Label>
                                                <Textarea
                                                    id="observacoes"
                                                    placeholder="Observações adicionais..."
                                                    value={observacoes}
                                                    onChange={(e) => setObservacoes(e.target.value)}
                                                />
                                            </div>
                                        </div>

                                        <DialogFooter>
                                            <Button variant="outline" onClick={() => setIsNovoAgendamentoOpen(false)}>
                                                Cancelar
                                            </Button>
                                            <Button onClick={handleSalvarAgendamento}>Salvar Agendamento</Button>
                                        </DialogFooter>
                                    </DialogContent>
                                </Dialog>
                            </div>

                            {/* Lista dos agendamentos do paciente */}
                            {loadingAgendamentosPaciente ? (
                                <div className="flex items-center justify-center p-8">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                                    <span className="ml-3 text-gray-600">Carregando agendamentos...</span>
                                </div>
                            ) : errorAgendamentosPaciente ? (
                                <Alert variant="destructive">
                                    <XCircle className="h-4 w-4" />
                                    <AlertDescription className="flex items-center justify-between">
                                        <div>
                                            <strong>Erro ao carregar agendamentos:</strong>
                                            <br />
                                            {errorAgendamentosPaciente}
                                        </div>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            // 🔧 TS2322: só dispara se o id for number
                                            onClick={() => {
                                                const id = Number((pacienteSelecionado as any)?.id);
                                                if (Number.isFinite(id)) buscarAgendamentosPaciente(id);
                                            }}
                                            className="ml-4"
                                        >
                                            Tentar Novamente
                                        </Button>
                                    </AlertDescription>
                                </Alert>
                            ) : agendamentosPaciente.length > 0 ? (
                                <div className="border rounded-lg">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Data/Hora</TableHead>
                                                <TableHead>Tipo</TableHead>
                                                <TableHead>Status</TableHead>
                                                <TableHead>Especialidade/Exames</TableHead>
                                                <TableHead>Observações</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {agendamentosPacienteOrdenados.map((agendamento: AgendamentoListItem) => (
                                                    <TableRow key={agendamento.id}>
                                                        <TableCell>
                                                            <div className="flex items-center gap-2">
                                                                <Clock className="h-4 w-4 text-gray-500" />
                                                                {formatarDataHora(agendamento.dataHora)}
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>{formatarTipoAtendimento(agendamento.tipo)}</TableCell>
                                                        <TableCell>{getStatusBadge(agendamento.status)}</TableCell>
                                                        <TableCell>{formatarEspecialidadeOuExames(agendamento)}</TableCell>
                                                        <TableCell className="max-w-xs">
                                                            <span className="text-sm text-gray-600 truncate">{agendamento.observacoes || "-"}</span>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            ) : (
                                <Alert>
                                    <AlertCircle className="h-4 w-4" />
                                    <AlertDescription>
                                        Este paciente não possui agendamentos cadastrados.
                                        <br />
                                        <span className="text-blue-600 cursor-pointer hover:underline" onClick={() => setIsNovoAgendamentoOpen(true)}>
                      Clique aqui para criar o primeiro agendamento.
                    </span>
                                    </AlertDescription>
                                </Alert>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Agenda do dia (lista geral) */}
            <Card>
                <CardHeader>
                    <CardTitle>Agenda do Dia</CardTitle>
                    <CardDescription>Visualize todos os agendamentos por data</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex justify-between items-center gap-2">
                        <div className="flex-grow flex items-center gap-2">
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button variant="outline" className="w-[280px] justify-start text-left font-normal">
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {date ? format(date, "PPP", { locale: ptBR }) : <span>Escolha uma data</span>}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                    <Calendar mode="single" selected={date} onSelect={setDate} initialFocus />
                                </PopoverContent>
                            </Popover>
                            <div className="relative flex-grow">
                                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Buscar por paciente, tipo ou especialidade..."
                                    className="pl-8"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    {isLoading && (
                        <div className="flex items-center justify-center p-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                            <span className="ml-3">Carregando agendamentos...</span>
                        </div>
                    )}

                    {isError && (
                        <Alert>
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription className="text-red-600">Erro ao buscar agendamentos. Tente novamente.</AlertDescription>
                        </Alert>
                    )}

                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Horário</TableHead>
                                    <TableHead>Paciente</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Especialidade/Exames</TableHead>
                                    <TableHead>Ações</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {agendamentosOrdenados && agendamentosOrdenados.length > 0 ? (
                                    agendamentosOrdenados.map((agendamento: AgendamentoListItem) => (
                                            <TableRow key={agendamento.id}>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <Clock className="h-4 w-4 text-gray-500" />
                                                        {formatarHora(agendamento.dataHora)}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <User className="h-4 w-4 text-blue-600" />
                                                        {agendamento.pacienteNome || "Não informado"}
                                                    </div>
                                                </TableCell>
                                                <TableCell>{getStatusBadge(agendamento.status)}</TableCell>
                                                <TableCell>{formatarEspecialidadeOuExames(agendamento)}</TableCell>
                                                <TableCell>
                                                    <DropdownMenu
                                                        open={acoesOpenId === agendamento.id}
                                                        onOpenChange={(open) => setAcoesOpenId(open ? agendamento.id : null)}
                                                    >
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="outline" size="sm">
                                                                <MoreHorizontal className="h-4 w-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            <DropdownMenuItem
                                                                onSelect={() => {
                                                                    setAgendamentoSelecionado(agendamento);
                                                                    setIsEditStatusOpen(true);
                                                                    setAcoesOpenId(null);
                                                                }}
                                                            >
                                                                <Edit3 className="mr-2 h-4 w-4" />
                                                                Editar Status
                                                            </DropdownMenuItem>

                                                            {/* Reimpressão usando util de abertura do PDF */}
                                                            <MenuReimpressao agendamento={agendamento as any} />
                                                            
                                                            {/* Botão de Cancelar - Exibido apenas para agendamentos que não foram cancelados ou atendidos */}
                                                            {agendamento.status !== 'CANCELADO' && agendamento.status !== 'ATENDIDO' && (
                                                                <DropdownMenuItem
                                                                    onSelect={() => {
                                                                        setAgendamentoSelecionado(agendamento);
                                                                        setIsCancelarOpen(true);
                                                                        setAcoesOpenId(null);
                                                                    }}
                                                                    className="text-red-600 focus:text-red-600"
                                                                >
                                                                    <XCircle className="mr-2 h-4 w-4" />
                                                                    Cancelar
                                                                </DropdownMenuItem>
                                                            )}
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={5} className="h-24 text-center">
                                            {date
                                                ? searchTerm
                                                    ? `Nenhum agendamento encontrado para "${searchTerm}" em ${format(date, "dd/MM/yyyy", { locale: ptBR })}.`
                                                    : `Nenhum agendamento encontrado para ${format(date, "dd/MM/yyyy", { locale: ptBR })}.`
                                                : "Selecione uma data para visualizar os agendamentos."}
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            {/* Modal editar status */}
            <Dialog open={isEditStatusOpen} onOpenChange={setIsEditStatusOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Alterar Status do Agendamento</DialogTitle>
                        <DialogDescription>
                            {agendamentoSelecionado && (
                                <>
                                    Paciente: {agendamentoSelecionado.pacienteNome}
                                    <br />
                                    Data/Hora: {formatarDataHora(agendamentoSelecionado.dataHora)}
                                </>
                            )}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="novoStatus">Novo Status</Label>
                            <Select value={novoStatus} onValueChange={setNovoStatus}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecione o novo status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="AGENDADO">Agendado</SelectItem>
                                    <SelectItem value="RECEPCIONADO">Recepcionado</SelectItem>
                                    <SelectItem value="ATENDIDO">Atendido</SelectItem>
                                    <SelectItem value="REAGENDADO">Reagendado</SelectItem>
                                    <SelectItem value="FALTOU">Faltou</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsEditStatusOpen(false)}>
                            Cancelar
                        </Button>
                        <Button onClick={handleAtualizarStatus}>Salvar</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Modal de Cancelamento de Agendamento */}
            <Dialog open={isCancelarOpen} onOpenChange={setIsCancelarOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Cancelar Agendamento</DialogTitle>
                        <DialogDescription>
                            {agendamentoSelecionado && (
                                <>
                                    Paciente: {agendamentoSelecionado.pacienteNome}
                                    <br />
                                    Data/Hora: {formatarDataHora(agendamentoSelecionado.dataHora)}
                                    <br />
                                    <span className="text-orange-600 font-medium mt-2 inline-block">
                                        ⚠️ Esta ação irá cancelar o agendamento e registrar o motivo no histórico do paciente.
                                    </span>
                                </>
                            )}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="motivoCancelamento">Motivo do Cancelamento *</Label>
                            <Textarea
                                id="motivoCancelamento"
                                placeholder="Descreva o motivo do cancelamento deste agendamento..."
                                value={motivoCancelamento}
                                onChange={(e) => setMotivoCancelamento(e.target.value)}
                                rows={4}
                            />
                            <p className="text-xs text-muted-foreground">
                                Este motivo será registrado no histórico do paciente e na auditoria do sistema.
                            </p>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button 
                            variant="outline" 
                            onClick={() => {
                                setIsCancelarOpen(false);
                                setMotivoCancelamento("");
                                setAgendamentoSelecionado(null);
                            }}
                        >
                            Voltar
                        </Button>
                        <Button 
                            variant="destructive" 
                            onClick={handleCancelarAgendamento}
                            disabled={!motivoCancelamento.trim()}
                        >
                            <XCircle className="mr-2 h-4 w-4" />
                            Confirmar Cancelamento
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

// Badge de status — visual mantido
function getStatusBadge(status: AgendamentoStatus) {
    switch (status) {
        case "AGENDADO":
            return <Badge variant="default" className="bg-blue-100 text-blue-800">Agendado</Badge>;
        case "RECEPCIONADO":
            return <Badge variant="default" className="bg-green-100 text-green-800">Recepcionado</Badge>;
        case "ATENDIDO":
            return <Badge variant="default" className="bg-emerald-100 text-emerald-800">Atendido</Badge>;
        case "REAGENDADO":
            return <Badge variant="default" className="bg-orange-100 text-orange-800">Reagendado</Badge>;
        case "FALTOU":
            return <Badge variant="destructive">Faltou</Badge>;
        default:
            return <Badge variant="outline">{status}</Badge>;
    }
}

// Componente auxiliar para botão de impressão
interface BotaoImpressaoAgendamentoProps {
    agendamentoCriadoId: number;
    tipoAtendimento: string;
    examesSelecionados: string[];
    onOcultar: () => void;
    onAbrirSadt: (id: number) => void;
    onAbrirComprovante: (id: number) => void;
}

const BotaoImpressaoAgendamento: React.FC<BotaoImpressaoAgendamentoProps> = ({
    agendamentoCriadoId,
    tipoAtendimento,
    examesSelecionados,
    onOcultar,
    onAbrirSadt,
    onAbrirComprovante
}) => {
    // Determina se é exame baseado no tipo de atendimento ou exames selecionados
    const isExame = tipoAtendimento === 'exame_laboratorial' ||
                    tipoAtendimento === 'exame_imagem' ||
                    examesSelecionados.length > 0;

    return (
        <div className="flex items-center gap-2">
            {isExame ? (
                <>
                    <Button
                        onClick={() => onAbrirSadt(agendamentoCriadoId)}
                        className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
                    >
                        <Printer className="h-4 w-4" />
                        Imprimir SADT (#{agendamentoCriadoId})
                    </Button>
                    <Button
                        variant="outline"
                        onClick={() => onAbrirComprovante(agendamentoCriadoId)}
                        className="text-xs"
                    >
                        Ver Comprovante
                    </Button>
                </>
            ) : (
                <Button
                    onClick={() => onAbrirComprovante(agendamentoCriadoId)}
                    className="flex items-center gap-2"
                >
                    <Printer className="h-4 w-4" />
                    Imprimir Comprovante (#{agendamentoCriadoId})
                </Button>
            )}
            <Button variant="outline" onClick={onOcultar}>
                Ocultar
            </Button>
        </div>
    );
};

export default AgendamentoRecepcao;
