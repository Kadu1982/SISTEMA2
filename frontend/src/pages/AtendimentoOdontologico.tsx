// src/pages/AtendimentoOdontologico.tsx
// -----------------------------------------------------------------------------
// Página de Atendimento Odontológico
// - Lista pacientes com agendamentos odontológicos
// - Formulário de atendimento odontológico
// - Odontograma e Procedimentos SIA/SUS
// -----------------------------------------------------------------------------

import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, User, Clock, AlertCircle, Loader2, ArrowLeft } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

import apiService from "@/services/apiService";
import { AtendimentoForm, type AtendimentoFormData } from "@/components/atendimento/AtendimentoForm";
import OdontogramaDigitalAvancado, { type Dente } from "@/components/odontologico/OdontogramaDigitalAvancado";
import ProcedimentosSUS from "@/components/odontologico/ProcedimentosSUS";
import type { ProcedimentoSelecionado } from "@/services/odontologiaService";
import * as odontoServiceModule from "@/services/odontologiaService";
import * as atendimentoServiceModule from "@/services/AtendimentoService";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Save, Loader2 as Loader2Icon } from "lucide-react";

// Resolve export default/named do serviço de atendimento (evita quebrar build)
const atendimentoSvc: any =
    // @ts-ignore
    (atendimentoServiceModule as any).default ??
    // @ts-ignore
    (atendimentoServiceModule as any).atendimentoService ??
    atendimentoServiceModule;

// Resolve função de salvar procedimentos (default/named)
const salvarProcedimentosAtendimento: any =
    // @ts-ignore
    (odontoServiceModule as any).salvarProcedimentosAtendimento ??
    // @ts-ignore
    (odontoServiceModule as any).default?.salvarProcedimentosAtendimento ??
    null;

function extractId(resp: any): number | string | undefined {
    return (
        resp?.id ??
        resp?.data?.id ??
        resp?.atendimentoId ??
        resp?.data?.atendimentoId ??
        undefined
    );
}

interface AgendamentoOdontologico {
    id: number;
    pacienteId: number;
    pacienteNome: string;
    cartaoSus?: string;
    cpf?: string;
    dataHora: string;
    especialidade?: string;
    observacoes?: string;
    status: string;
}

const AtendimentoOdontologico = () => {
    const { toast } = useToast();

    const [activeTab, setActiveTab] = useState<"agendamentos" | "novo">("agendamentos");
    const [searchTerm, setSearchTerm] = useState("");
    const [pacienteSelecionado, setPacienteSelecionado] = useState<AgendamentoOdontologico | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [odontograma, setOdontograma] = useState<Dente[]>([]);
    const [procedimentos, setProcedimentos] = useState<ProcedimentoSelecionado[]>([]);

    // Query — agendamentos odontológicos
    const {
        data: agendamentos = [],
        isLoading: isLoadingAgendamentos,
        error,
    } = useQuery<AgendamentoOdontologico[]>({
        queryKey: ["agendamentosOdontologicos"],
        queryFn: async () => {
            try {
                // Busca todos os agendamentos
                const { data } = await apiService.get("/agendamentos");
                const agendamentosList = Array.isArray(data) ? data : (data?.data || []);
                
                // Filtra apenas agendamentos odontológicos
                const odontologicos = agendamentosList.filter((ag: any) => 
                    ag.tipo === "consulta_odontologica" || 
                    ag.tipoAtendimento === "consulta_odontologica" ||
                    ag.especialidade?.toLowerCase().includes("odontolog")
                );
                
                // Mapeia para o formato esperado
                return odontologicos.map((ag: any) => ({
                    id: ag.id,
                    pacienteId: ag.pacienteId || ag.paciente?.id,
                    pacienteNome: ag.pacienteNome || ag.paciente?.nomeCompleto || ag.paciente?.nome || "Paciente",
                    cartaoSus: ag.cartaoSus || ag.paciente?.cartaoSus,
                    cpf: ag.cpf || ag.paciente?.cpf,
                    dataHora: ag.dataHora || ag.dataHoraAgendamento,
                    especialidade: ag.especialidade,
                    observacoes: ag.observacoes,
                    status: ag.status || "AGENDADO",
                }));
            } catch (error) {
                console.error("Erro ao buscar agendamentos odontológicos:", error);
                return [];
            }
        },
        refetchInterval: 30_000,
    });

    const agendamentosFiltrados = useMemo(() => {
        if (!searchTerm.trim()) return agendamentos;
        const s = searchTerm.toLowerCase();
        return agendamentos.filter(
            (ag) =>
                ag.pacienteNome.toLowerCase().includes(s) ||
                (ag.cartaoSus || "").toLowerCase().includes(s) ||
                (ag.cpf || "").includes(s) ||
                (ag.especialidade || "").toLowerCase().includes(s)
        );
    }, [agendamentos, searchTerm]);

    const handleIniciarAtendimento = (agendamento: AgendamentoOdontologico) => {
        setPacienteSelecionado(agendamento);
        setActiveTab("novo");
    };

    const handleSaveAtendimento = async (data: AtendimentoFormData) => {
        setIsLoading(true);
        try {
            // 1) Salva o atendimento
            const resp = await atendimentoSvc.salvar?.(data);

            // 2) Captura o ID retornado
            const atendimentoId = extractId(resp);

            // 3) Se houver ID e houver itens, salva também os procedimentos
            if (atendimentoId && salvarProcedimentosAtendimento && procedimentos.length > 0) {
                const r = await salvarProcedimentosAtendimento(atendimentoId, procedimentos);
                if (!r?.success) {
                    toast({
                        title: "Procedimentos não salvos",
                        description: r?.message ?? "Ocorreram erros ao salvar os procedimentos SIA/SUS.",
                        variant: "destructive",
                    });
                }
            }

            toast({
                title: "Sucesso!",
                description: "Atendimento odontológico salvo com sucesso.",
            });

            // Limpa o formulário e volta para a lista
            setPacienteSelecionado(null);
            setOdontograma([]);
            setProcedimentos([]);
            setActiveTab("agendamentos");
        } catch (error) {
            console.error("Erro ao salvar atendimento:", error);
            toast({
                title: "Erro!",
                description: "Não foi possível salvar o atendimento. Verifique o console para mais detalhes.",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="w-full px-4 py-4">
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
                <TabsList className="mb-4">
                    <TabsTrigger value="agendamentos">Agendamentos Odontológicos</TabsTrigger>
                    <TabsTrigger value="novo">
                        Novo Atendimento
                        {pacienteSelecionado && (
                            <Badge variant="outline" className="ml-2 bg-blue-100 text-blue-800">
                                Em Atendimento
                            </Badge>
                        )}
                    </TabsTrigger>
                </TabsList>

                {/* ABA: AGENDAMENTOS */}
                <TabsContent value="agendamentos">
                    <Card>
                        <CardHeader>
                            <CardTitle>Pacientes com Agendamentos Odontológicos</CardTitle>
                            <CardDescription>
                                Pacientes agendados para consulta odontológica. Clique em um paciente para iniciar o atendimento.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="relative max-w-md">
                                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Buscar por nome, cartão SUS, CPF ou especialidade..."
                                    className="pl-8"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>

                            {isLoadingAgendamentos && (
                                <div className="flex items-center justify-center p-8">
                                    <Loader2 className="mr-2 h-6 w-6 animate-spin" />
                                    <span>Carregando agendamentos...</span>
                                </div>
                            )}

                            {error && (
                                <Alert>
                                    <AlertCircle className="h-4 w-4" />
                                    <AlertDescription className="text-red-600">
                                        Erro ao buscar agendamentos. Tente novamente.
                                    </AlertDescription>
                                </Alert>
                            )}

                            <div className="rounded-md border">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Paciente</TableHead>
                                            <TableHead>Data/Hora</TableHead>
                                            <TableHead>Especialidade</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Ações</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {agendamentosFiltrados.length > 0 ? (
                                            agendamentosFiltrados.map((agendamento) => (
                                                <TableRow
                                                    key={agendamento.id}
                                                    className="cursor-pointer hover:bg-gray-50"
                                                    onClick={() => handleIniciarAtendimento(agendamento)}
                                                >
                                                    <TableCell>
                                                        <div className="flex items-center gap-2">
                                                            <User className="h-4 w-4 text-gray-500" />
                                                            <div>
                                                                <div className="font-medium">{agendamento.pacienteNome}</div>
                                                                {agendamento.cartaoSus && (
                                                                    <div className="text-sm text-gray-500">SUS: {agendamento.cartaoSus}</div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        {agendamento.dataHora ? (
                                                            format(new Date(agendamento.dataHora), "dd/MM/yyyy HH:mm", { locale: ptBR })
                                                        ) : (
                                                            "-"
                                                        )}
                                                    </TableCell>
                                                    <TableCell>{agendamento.especialidade || "-"}</TableCell>
                                                    <TableCell>
                                                        <Badge variant="outline">{agendamento.status}</Badge>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Button
                                                            size="sm"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleIniciarAtendimento(agendamento);
                                                            }}
                                                        >
                                                            Iniciar Atendimento
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        ) : (
                                            <TableRow>
                                                <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                                                    {isLoadingAgendamentos
                                                        ? "Carregando..."
                                                        : searchTerm
                                                        ? "Nenhum agendamento encontrado com os filtros aplicados."
                                                        : "Nenhum agendamento odontológico encontrado."}
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* ABA: NOVO ATENDIMENTO */}
                <TabsContent value="novo">
                    <div className="w-full space-y-6">
                        {/* Odontograma fixo no topo */}
                        <OdontogramaDigitalAvancado
                            value={odontograma}
                            onChange={setOdontograma}
                        />

                        {/* Formulário de atendimento */}
                        <AtendimentoForm
                            title="Registro de Atendimento Odontológico"
                            description="Preencha os dados da consulta."
                            onSave={handleSaveAtendimento}
                            isLoading={isLoading}
                            hideSaveButton={true}
                            initialData={
                                pacienteSelecionado
                                    ? {
                                          pacienteId: pacienteSelecionado.pacienteId.toString(),
                                          observacoes: pacienteSelecionado.observacoes || "",
                                      }
                                    : undefined
                            }
                        />

                        {/* Procedimentos SIA/SUS - largura total */}
                        <ProcedimentosSUS
                            value={procedimentos}
                            onChange={setProcedimentos}
                        />

                        {/* Botão de Salvar no final da página */}
                        <div className="flex justify-end pt-4">
                            <Button
                                type="button"
                                onClick={() => {
                                    const form = document.getElementById("atendimento-form") as HTMLFormElement;
                                    if (form) {
                                        form.requestSubmit();
                                    }
                                }}
                                disabled={isLoading}
                                className="min-w-32"
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
                                        Salvando...
                                    </>
                                ) : (
                                    <>
                                        <Save className="mr-2 h-4 w-4" />
                                        Salvar Atendimento
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default AtendimentoOdontologico;
