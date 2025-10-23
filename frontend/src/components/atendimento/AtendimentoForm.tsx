// src/components/atendimento/AtendimentoForm.tsx
// -----------------------------------------------------------------------------
// Formulário de Atendimento Ambulatorial
// Atualizado para CIAP-2 e Motivo de Desfecho.
// NÃO removi funcionalidades existentes; apenas corrigi a seção de desfecho
// para evitar o erro do <Slot.SlotClone> do Radix (via <FormControl>).
// -----------------------------------------------------------------------------

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Loader2, Save } from "lucide-react";

import CidBusca from "@/components/atendimento/CidBusca";
import MotivoDesfechoSelect from "@/components/atendimento/MotivoDesfechoSelect";

import { Paciente } from "@/types/paciente/Paciente";
import { Cid } from "@/types/Cid";

import { toast } from "sonner";
import apiService from "@/services/apiService";

// ✅ CIAP-2
import CiapFields, { CiapFieldsValue } from "@/components/ciap/CiapFields";

// Cache simples para evitar múltiplas tentativas do endpoint de vacinas/status por paciente nesta sessão
const VACINA_STATUS_TRIED = new Set<number>();
// Feature flag simples para habilitar/desabilitar a consulta ao status de vacinas
const HABILITAR_STATUS_VACINAS = false;

// ✅ SCHEMA ATUALIZADO PARA INCLUIR MOTIVO DE DESFECHO
const atendimentoSchema = z
    .object({
        pacienteId: z.string().min(1, "O campo Paciente é obrigatório."),
        profissionalId: z.string().optional(),
        cid10: z.string().min(1, "O campo CID é obrigatório."),
        diagnostico: z.string().optional(),
        sintomas: z.string().optional(),
        examesFisicos: z.string().optional(),
        prescricao: z.string().optional(),
        medicamentosPrescritos: z.string().optional(),
        orientacoes: z.string().optional(),
        retorno: z.string().optional(),
        observacoes: z.string().optional(),
        observacoesInternas: z.string().optional(),
        statusAtendimento: z.string().optional(),
        // Compatibilidade com versões anteriores
        anamnese: z.string().optional(),
        queixaPrincipal: z.string().optional(),
        solicitacaoExames: z.string().optional(),
        exameClinico: z.string().optional(),
        condutaMedica: z.string().optional(),

        // 🔹 CIAP-2 (campos existentes)
        ciapRfe: z.string().optional(), // 01–29 (RFE) — único
        ciapDiagnosticos: z.array(z.string()).max(5).optional(), // 70–99 — até 5
        ciapProcedimentos: z.array(z.string()).max(5).optional(), // 30–69 — até 5

        // 🔹 NOVOS: Motivo de desfecho
        motivoDesfecho: z.string().min(2, "O motivo de desfecho é obrigatório."),
        especialidadeEncaminhamento: z.string().optional(),
    })
    .refine(
        (data) => {
            // Regra de negócio: pelo menos 1 entre RFE e Diagnóstico do CIAP
            const hasRfe = !!data.ciapRfe;
            const hasDiag = Array.isArray(data.ciapDiagnosticos) && data.ciapDiagnosticos.length > 0;
            return hasRfe || hasDiag;
        },
        {
            message: "Informe pelo menos 1 entre RFE (01–29) ou Diagnóstico (70–99) do CIAP-2.",
            path: ["ciapRfe"],
        }
    )
    .refine(
        (data) => {
            // Regra: se motivo for "03" (encaminhamento), especialidade é obrigatória
            if (data.motivoDesfecho === "03") {
                return !!data.especialidadeEncaminhamento && data.especialidadeEncaminhamento.trim().length > 0;
            }
            return true;
        },
        {
            message: "Especialidade é obrigatória quando o motivo for Encaminhamento.",
            path: ["especialidadeEncaminhamento"],
        }
    );

// ✅ TIPO DE DADOS DO FORMULÁRIO
export type AtendimentoFormData = z.infer<typeof atendimentoSchema>;

// ✅ INTERFACE DE PROPS
interface AtendimentoFormProps {
    onSave: (data: AtendimentoFormData) => Promise<void>;
    onCancel?: () => void;
    onClose?: () => void;
    isLoading?: boolean;
    title: string;
    description: string;
    initialData?: Partial<AtendimentoFormData>;
    atendimentoId?: string;
    readOnly?: boolean;
}

// ✅ INTERFACE PARA DADOS DA TRIAGEM
interface DadosTriagem {
    classificacaoRisco?: string;
    escalaDor?: number;
    profissionalTriagem?: string;
    horarioTriagem?: string;
    pressaoArterial?: string;
    temperatura?: number;
    peso?: number;
    altura?: number;
    frequenciaCardiaca?: number;
    saturacaoOxigenio?: number;
    observacoes?: string;
}

export const AtendimentoForm = ({
                                    onSave,
                                    onCancel = () => {},
                                    onClose = () => {},
                                    isLoading = false,
                                    title,
                                    description,
                                    initialData,
                                    atendimentoId,
                                    readOnly = false,
                                }: AtendimentoFormProps) => {
    // ✅ ESTADOS LOCAIS
    const [pacienteSelecionado, setPacienteSelecionado] = useState<Paciente | null>(null);
    const [cidSelecionado, setCidSelecionado] = useState<Cid | null>(null);
    const [dadosTriagem, setDadosTriagem] = useState<DadosTriagem | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isEditing, setIsEditing] = useState(!atendimentoId);

    // Saúde da Mulher (DUM) vindo do Acolhimento
    const [dumData, setDumData] = useState<string>("");
    const [gestante, setGestante] = useState<boolean>(false);
    const [semanasGestacao, setSemanasGestacao] = useState<number | "">("");

    // Info adicional (última triagem)
    const [vinculoTerritorio, setVinculoTerritorio] = useState<string>("");
    const [statusVacinas, setStatusVacinas] = useState<"EM_DIA" | "ATRASADA" | "INDISPONIVEL">("INDISPONIVEL");
    const [alergiasTriagem, setAlergiasTriagem] = useState<string>("");

    // 🔹 Estado local da CIAP-2 (usado pelo componente visual)
    const [ciap, setCiap] = useState<CiapFieldsValue>({
        ciapRfe: [],
        ciapDiagnosticos: [],
        ciapProcedimentos: [],
    });

    // ✅ VALORES PADRÃO
    const getDefaultValues = (): AtendimentoFormData => ({
        pacienteId: initialData?.pacienteId || "",
        profissionalId: initialData?.profissionalId || "",
        cid10: initialData?.cid10 || "",
        diagnostico: initialData?.diagnostico || "",
        sintomas: initialData?.sintomas || "",
        examesFisicos: initialData?.examesFisicos || "",
        prescricao: initialData?.prescricao || "",
        medicamentosPrescritos: initialData?.medicamentosPrescritos || "",
        orientacoes: initialData?.orientacoes || "",
        retorno: initialData?.retorno || "",
        observacoes: initialData?.observacoes || "",
        observacoesInternas: initialData?.observacoesInternas || "",
        statusAtendimento: initialData?.statusAtendimento || "CONCLUIDO",
        // Compat com versões antigas
        anamnese: initialData?.anamnese || initialData?.sintomas || "",
        queixaPrincipal: initialData?.queixaPrincipal || "",
        solicitacaoExames: initialData?.solicitacaoExames || "",
        exameClinico: initialData?.exameClinico || initialData?.examesFisicos || "",
        condutaMedica: initialData?.condutaMedica || "",

        // 🔹 Defaults CIAP-2
        ciapRfe: (initialData as any)?.ciapRfe || undefined,
        ciapDiagnosticos: (initialData as any)?.ciapDiagnosticos || [],
        ciapProcedimentos: (initialData as any)?.ciapProcedimentos || [],

        // 🔹 NOVOS: Defaults motivo de desfecho
        motivoDesfecho: (initialData as any)?.motivoDesfecho || "01", // Default: Alta
        especialidadeEncaminhamento: (initialData as any)?.especialidadeEncaminhamento || "",
    });

    // ✅ INICIALIZAÇÃO DO FORMULÁRIO
    const form = useForm<AtendimentoFormData>({
        resolver: zodResolver(atendimentoSchema),
        defaultValues: getDefaultValues(),
    });

    // ✅ EFEITO: dados iniciais / prefill / triagem
    useEffect(() => {
        if (!initialData) return;

        form.reset(getDefaultValues());

        // Prefill CIAP no estado visual
        setCiap({
            ciapRfe: initialData.ciapRfe ? [initialData.ciapRfe] : [],
            ciapDiagnosticos: initialData.ciapDiagnosticos || [],
            ciapProcedimentos: initialData.ciapProcedimentos || [],
        });

        // Extrai dados da triagem se vierem nas observações
        if (initialData.observacoes && initialData.observacoes.includes("DADOS DA TRIAGEM:")) {
            const dadosExtraidos = extrairDadosTriagem(initialData.observacoes);
            setDadosTriagem(dadosExtraidos);
        }

        // Configurar paciente se tiver ID
        if (initialData.pacienteId) {
            setPacienteSelecionado({
                id: parseInt(initialData.pacienteId),
                nomeCompleto: "Paciente Selecionado",
                cpf: "",
                dataNascimento: "",
            } as Paciente);
        }

        // Configurar CID se tiver
        if (initialData.cid10) {
            setCidSelecionado({
                codigo: initialData.cid10,
                descricao: initialData.diagnostico || "CID Selecionado",
            } as Cid);
        }
    }, [initialData, form]);

    // Limpa semanas se não gestante
    useEffect(() => {
        if (!gestante) setSemanasGestacao("");
    }, [gestante]);

    // ✅ Extrai dados da triagem (a partir de texto)
    const extrairDadosTriagem = (observacoes: string): DadosTriagem => {
        const linhas = observacoes.split("\n");
        const dados: DadosTriagem = {};
        linhas.forEach((linha) => {
            if (linha.includes("Classificação de Risco:")) dados.classificacaoRisco = linha.split(":")[1]?.trim();
            if (linha.includes("Escala de Dor:")) {
                const dor = linha.split(":")[1]?.trim().split("/")[0];
                dados.escalaDor = dor ? parseInt(dor) : undefined;
            }
            if (linha.includes("Profissional da Triagem:")) dados.profissionalTriagem = linha.split(":")[1]?.trim();
            if (linha.includes("Horário da Triagem:")) dados.horarioTriagem = linha.split(":")[1]?.trim();
            if (linha.includes("Pressão:")) dados.pressaoArterial = linha.split(":")[1]?.trim();
            if (linha.includes("Temperatura:")) {
                const temp = linha.split(":")[1]?.trim().replace("°C", "");
                dados.temperatura = temp ? parseFloat(temp) : undefined;
            }
            if (linha.includes("Peso:")) {
                const peso = linha.split(":")[1]?.trim().replace("kg", "");
                dados.peso = peso ? parseFloat(peso) : undefined;
            }
            if (linha.includes("Altura:")) {
                const altura = linha.split(":")[1]?.trim().replace("m", "");
                dados.altura = altura ? parseFloat(altura) : undefined;
            }
            if (linha.includes("Freq. Cardíaca:")) {
                const freq = linha.split(":")[1]?.trim().replace("bpm", "");
                dados.frequenciaCardiaca = freq ? parseInt(freq) : undefined;
            }
            if (linha.includes("Saturação O₂:")) {
                const sat = linha.split(":")[1]?.trim().replace("%", "");
                dados.saturacaoOxigenio = sat ? parseInt(sat) : undefined;
            }
        });
        return dados;
    };

    // ✅ Carrega informações adicionais do paciente
    useEffect(() => {
        const carregarInfoAdicionais = async () => {
            const p = pacienteSelecionado;
            if (!p || !p.id) {
                setVinculoTerritorio("");
                setStatusVacinas("INDISPONIVEL");
                setAlergiasTriagem("");
                return;
            }

            try {
                const { data } = await apiService.get(`/pacientes/${p.id}`);
                const bairro = (data as any)?.bairro || "";
                const municipio = (data as any)?.municipio || "";
                const equipe = (data as any)?.prontuarioFamiliar || "";
                const texto = [bairro, municipio, equipe].filter(Boolean).join(" • ");
                setVinculoTerritorio(texto);
            } catch {
                setVinculoTerritorio("");
            }

            try {
                const { data } = await apiService.get("/triagem/triados");
                if (Array.isArray(data)) {
                    const triagensDoPaciente = data.filter((t: any) => t.pacienteId === p.id);
                    if (triagensDoPaciente.length > 0) {
                        triagensDoPaciente.sort((a: any, b: any) => {
                            const ad = new Date(a.horarioTriagem || 0).getTime();
                            const bd = new Date(b.horarioTriagem || 0).getTime();
                            if (bd !== ad) return bd - ad;
                            return (b.triagemId || 0) - (a.triagemId || 0);
                        });
                        const ultima = triagensDoPaciente[0];
                        setAlergiasTriagem(ultima.alergias || "");
                        // Prefill Saúde da Mulher a partir do Acolhimento
                        setDumData(ultima.dumInformada || "");
                        setGestante(!!ultima.gestanteInformado);
                        setSemanasGestacao(ultima.semanasGestacaoInformadas ?? "");
                    }
                }
            } catch {
                setAlergiasTriagem("");
            }

            // Evita tentativas em ambientes sem o módulo de vacinas
            if (!HABILITAR_STATUS_VACINAS) {
                setStatusVacinas("INDISPONIVEL");
                VACINA_STATUS_TRIED.add(p.id);
            } else if (VACINA_STATUS_TRIED.has(p.id)) {
                setStatusVacinas("INDISPONIVEL");
            } else {
                try {
                    const resp = await apiService.get(`/vacinas/status/${p.id}`);
                    const status = (resp?.data?.status || "").toString().toUpperCase();
                    if (status === "EM_DIA") setStatusVacinas("EM_DIA");
                    else if (["ATRASADA", "ATRASADO", "FORA_DO_PRAZO"].includes(status)) setStatusVacinas("ATRASADA");
                    else setStatusVacinas("INDISPONIVEL");
                } catch {
                    setStatusVacinas("INDISPONIVEL");
                } finally {
                    VACINA_STATUS_TRIED.add(p.id);
                }
            }
        };
        carregarInfoAdicionais();
    }, [pacienteSelecionado]);

    const handlePacienteSelecionado = (paciente: Paciente | null) => {
        setPacienteSelecionado(paciente);
        form.setValue("pacienteId", paciente && paciente.id !== undefined ? String(paciente.id) : "");
    };

    const handleCidSelecionado = (cid: Cid | null) => {
        setCidSelecionado(cid);
        if (cid) {
            form.setValue("cid10", cid.codigo);
            const currentDiagnostico = form.getValues("diagnostico");
            if (!currentDiagnostico || currentDiagnostico.trim() === "") {
                form.setValue("diagnostico", cid.descricao);
            }
        } else {
            form.setValue("cid10", "");
        }
    };

    const getClassificacaoRiscoBadge = (classificacao?: string) => {
        if (!classificacao) return null;

        const cores = {
            VERMELHO: "bg-red-600 text-white",
            LARANJA: "bg-orange-500 text-white",
            AMARELO: "bg-yellow-500 text-black",
            VERDE: "bg-green-500 text-white",
            AZUL: "bg-blue-500 text-white",
        };

        const textos = {
            VERMELHO: "Emergência",
            LARANJA: "Muito Urgente",
            AMARELO: "Urgente",
            VERDE: "Pouco Urgente",
            AZUL: "Não Urgente",
        };

        return <Badge className={cores[classificacao as keyof typeof cores] || "bg-gray-500 text-white"}>{textos[classificacao as keyof typeof textos] || classificacao}</Badge>;
    };

    // ✅ SUBMISSÃO
    const handleSubmit = async (data: AtendimentoFormData) => {
        setIsSubmitting(true);
        try {
            // 🔹 Normaliza CIAP (RFE único + listas de 0..5)
            const norm3 = (c: string) => (c || "").toUpperCase().trim().slice(0, 3);
            const payloadCiap = {
                ciapRfe: ciap.ciapRfe[0] ? norm3(ciap.ciapRfe[0]) : undefined,
                ciapDiagnosticos: (ciap.ciapDiagnosticos || []).map(norm3).slice(0, 5),
                ciapProcedimentos: (ciap.ciapProcedimentos || []).map(norm3).slice(0, 5),
            };

            // 🔹 Compatibilidade com campos antigos + Novos campos de desfecho
            const dadosParaEnvio: AtendimentoFormData = {
                ...data,
                sintomas: data.sintomas || data.anamnese || "",
                examesFisicos: data.examesFisicos || data.exameClinico || "",
                orientacoes: data.orientacoes || data.condutaMedica || "",
                // Merge CIAP no form (mantém tipos)
                ciapRfe: payloadCiap.ciapRfe,
                ciapDiagnosticos: payloadCiap.ciapDiagnosticos,
                ciapProcedimentos: payloadCiap.ciapProcedimentos,
                // Campos de desfecho
                motivoDesfecho: data.motivoDesfecho,
                especialidadeEncaminhamento: data.especialidadeEncaminhamento || "",
            };

            await onSave(dadosParaEnvio);
            toast.success("Atendimento salvo com sucesso!");
        } catch (error: any) {
            console.error("Erro ao salvar atendimento:", error);
            toast.error(error?.message || "Erro ao salvar atendimento");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="w-full max-w-6xl mx-auto space-y-6">
            {/* Barra de Ações */}
            <div className="flex items-center justify-end gap-2">
                {!readOnly && atendimentoId && (
                    <Button type="button" variant="outline" onClick={() => setIsEditing(!isEditing)} disabled={isSubmitting}>
                        {isEditing ? "Cancelar Edição" : "Editar"}
                    </Button>
                )}
            </div>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                    {/* ✅ SEÇÃO: SINAIS E SINTOMAS + CID */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Sinais e sintomas</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* Vínculo de Território e Status de Vacinas */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div className="text-sm bg-gray-50 border border-gray-200 rounded-md p-3">
                                    <div className="font-medium text-gray-700">Vínculo de Território</div>
                                    <div className="text-gray-800">{vinculoTerritorio || "Não informado"}</div>
                                </div>
                                <div className="text-sm bg-gray-50 border border-gray-200 rounded-md p-3">
                                    <div className="font-medium text-gray-700">Status de Vacinas</div>
                                    <div className={statusVacinas === "ATRASADA" ? "text-red-700" : statusVacinas === "EM_DIA" ? "text-green-700" : "text-gray-700"}>
                                        {statusVacinas === "EM_DIA" ? "Em dia" : statusVacinas === "ATRASADA" ? "Atrasada / Fora do prazo" : "Indisponível"}
                                    </div>
                                </div>
                            </div>

                            {/* Queixa principal (triagem) */}
                            {initialData?.queixaPrincipal && (
                                <FormField
                                    control={form.control}
                                    name="queixaPrincipal"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Queixa Principal (da Triagem)</FormLabel>
                                            <FormControl>
                                                <Textarea {...field} readOnly className="bg-gray-50" rows={2} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            )}

                            {/* Alergias (triagem) */}
                            {alergiasTriagem && (
                                <div>
                                    <Label>Alergias (da Triagem)</Label>
                                    <Textarea value={alergiasTriagem} readOnly className="bg-gray-50" rows={2} />
                                </div>
                            )}

                            {/* SINTOMAS / ANAMNESE */}
                            <FormField
                                control={form.control}
                                name="sintomas"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Sintomas / Anamnese</FormLabel>
                                        <FormControl>
                                            <Textarea {...field} placeholder="Descreva os sintomas e histórico do paciente..." rows={4} disabled={!isEditing || readOnly} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* EXAMES FÍSICOS */}
                            <FormField
                                control={form.control}
                                name="examesFisicos"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Exames Físicos</FormLabel>
                                        <FormControl>
                                            <Textarea {...field} placeholder="Achados do exame físico..." rows={4} disabled={!isEditing || readOnly} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Saúde da Mulher (somente visualização, vindo do Acolhimento) */}
                            <div className="border border-gray-200 rounded-md p-3 bg-gray-50">
                                <Label className="text-sm font-medium">Saúde da Mulher (Acolhimento)</Label>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-2 text-sm">
                                    <div>
                                        <div className="text-gray-600">Data da Última Menstruação (DUM)</div>
                                        <div className="mt-1 font-medium text-gray-800">{dumData || "Não informado"}</div>
                                    </div>
                                    <div>
                                        <div className="text-gray-600">Gestante</div>
                                        <div className="mt-1 font-medium text-gray-800">{gestante ? "Sim" : "Não"}</div>
                                    </div>
                                    <div>
                                        <div className="text-gray-600">Semanas de Gestação</div>
                                        <div className="mt-1 font-medium text-gray-800">
                                            {gestante && semanasGestacao ? `${semanasGestacao} semana${Number(semanasGestacao) > 1 ? "s" : ""}` : "—"}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Hipótese Diagnóstica */}
                            <FormField
                                control={form.control}
                                name="diagnostico"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Hipótese Diagnóstica</FormLabel>
                                        <FormControl>
                                            <Textarea {...field} placeholder="Detalhes adicionais sobre a hipótese diagnóstica..." rows={3} disabled={!isEditing || readOnly} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* CID-10 */}
                            <FormField
                                control={form.control}
                                name="cid10"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>CID-10 *</FormLabel>
                                        <FormControl>
                                            <CidBusca
                                                onCidSelecionado={handleCidSelecionado}
                                                cidSelecionado={cidSelecionado}
                                                placeholder="Digite o código ou descrição do CID..."
                                                disabled={!isEditing || readOnly}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* 🔹 CIAP-2 (card existente) */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-base">Classificação CIAP-2</CardTitle>
                                    <CardDescription>
                                        Selecione <strong>1 RFE (01–29)</strong> e/ou até <strong>5 Diagnósticos (70–99)</strong>. Processos/Procedimentos (30–69) são
                                        opcionais (até 5).
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <CiapFields value={ciap} onChange={setCiap} disabled={!isEditing || readOnly} />
                                </CardContent>
                            </Card>
                        </CardContent>
                    </Card>

                    {/* ✅ SEÇÃO: CONDUTA MÉDICA */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Conduta Médica</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* Exemplos/placeholder de estoque/integrações */}
                            <div className="border border-gray-200 rounded-lg p-4">
                                <h3 className="text-sm font-semibold text-gray-800 mb-3">Medicamentos por Disponibilidade</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <div className="text-xs font-medium text-green-700 mb-2">Disponíveis</div>
                                        <ul className="min-h-[120px] border border-green-100 rounded p-2 text-sm text-gray-700 bg-green-50/30">
                                            <li className="py-1">Ex.: Dipirona 500mg</li>
                                            <li className="py-1">Ex.: Paracetamol 750mg</li>
                                        </ul>
                                    </div>
                                    <div>
                                        <div className="text-xs font-medium text-red-700 mb-2">Não Disponíveis</div>
                                        <ul className="min-h-[120px] border border-red-100 rounded p-2 text-sm text-gray-700 bg-red-50/30">
                                            <li className="py-1">Ex.: Amoxicilina 500mg</li>
                                            <li className="py-1">Ex.: Ibuprofeno 400mg</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                {/* PRESCRIÇÃO */}
                                <FormField
                                    control={form.control}
                                    name="prescricao"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Prescrição</FormLabel>
                                            <FormControl>
                                                <Textarea {...field} placeholder="Medicamentos, dosagens, posologia..." rows={5} disabled={!isEditing || readOnly} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                {/* MEDICAMENTOS PRESCRITOS */}
                                <FormField
                                    control={form.control}
                                    name="medicamentosPrescritos"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Lista de Medicamentos</FormLabel>
                                            <FormControl>
                                                <Textarea {...field} placeholder="Lista detalhada dos medicamentos..." rows={5} disabled={!isEditing || readOnly} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            {/* ORIENTAÇÕES */}
                            <FormField
                                control={form.control}
                                name="orientacoes"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Orientações ao Paciente</FormLabel>
                                        <FormControl>
                                            <Textarea {...field} placeholder="Cuidados, restrições, sinais de alerta..." rows={3} disabled={!isEditing || readOnly} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* RETORNO */}
                            <FormField
                                control={form.control}
                                name="retorno"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Orientações de Retorno</FormLabel>
                                        <FormControl>
                                            <Input {...field} placeholder="Ex: 7 dias, 15 dias, 1 mês, SN (se necessário)..." disabled={!isEditing || readOnly} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </CardContent>
                    </Card>

                    {/* ✅ SEÇÃO: Motivo de Desfecho (CORRIGIDA) */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Motivo de Desfecho</CardTitle>
                            <CardDescription>
                                Selecione o motivo de desfecho do atendimento conforme tabela oficial do SUS.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {/* Manter UM ÚNICO FormField (motivoDesfecho). */}
                                <FormField
                                    control={form.control}
                                    name="motivoDesfecho"
                                    render={({ field }) => (
                                        <FormItem>
                                            {/* Podemos manter o FormControl aqui porque o componente retorna UM único nó (<div>) */}
                                            <FormControl>
                                                <MotivoDesfechoSelect
                                                    motivoValue={field.value}
                                                    especialidadeValue={form.getValues("especialidadeEncaminhamento")}
                                                    onMotivoChange={(value) => {
                                                        field.onChange(value);
                                                        // Limpa especialidade se não for Encaminhamento
                                                        if (value !== "03") {
                                                            form.setValue("especialidadeEncaminhamento", "");
                                                        }
                                                    }}
                                                    onEspecialidadeChange={(value) => {
                                                        form.setValue("especialidadeEncaminhamento", value);
                                                    }}
                                                    disabled={!isEditing || readOnly}
                                                />
                                            </FormControl>

                                            {/* Mensagens de erro atreladas a este FormField */}
                                            <FormMessage />
                                            {/* Caso queira exibir erro da especialidade condicionalmente aqui: */}
                                            {form.watch("motivoDesfecho") === "03" &&
                                                !form.getValues("especialidadeEncaminhamento") && (
                                                    <FormMessage>Especialidade é obrigatória quando o motivo for Encaminhamento.</FormMessage>
                                                )}
                                        </FormItem>
                                    )}
                                />

                                {/* ❌ REMOVIDO: o FormField "especialidadeEncaminhamento" que só tinha <div/> dentro de <FormControl> */}
                            </div>
                        </CardContent>
                    </Card>

                    {/* ✅ BOTÕES DE AÇÃO */}
                    {isEditing && !readOnly && (
                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex justify-end space-x-4">
                                    <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
                                        Cancelar
                                    </Button>
                                    <Button type="submit" disabled={isLoading || isSubmitting} className="min-w-32">
                                        {isLoading || isSubmitting ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Salvando...
                                            </>
                                        ) : (
                                            <>
                                                <Save className="mr-2 h-4 w-4" />
                                                {atendimentoId ? "Atualizar" : "Salvar"}
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </form>
            </Form>
        </div>
    );
};