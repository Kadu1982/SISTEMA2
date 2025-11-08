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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Save, AlertCircle, User, ClipboardList, Stethoscope, Pill, FileText, CheckCircle, FlaskConical, Activity, Send } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

import CidBusca from "@/components/atendimento/CidBusca";
import MotivoDesfechoSelect from "@/components/atendimento/MotivoDesfechoSelect";
import RemumeBusca from "@/components/atendimento/RemumeBusca";

import { Paciente } from "@/types/paciente/Paciente";
import { Cid } from "@/types/Cid";
import { MedicamentoRemume } from "@/types/Remume";

import { toast } from "sonner";
import apiService from "@/services/apiService";
import laboratorioService from "@/services/laboratorio/laboratorioService";
import type { Exame } from "@/services/laboratorio/laboratorioService";
import { buscarProcedimentos, type ProcedimentoSUS } from "@/services/odontologiaService";

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
        procedimentosRealizados: z.string().optional(),
        encaminhamentos: z.string().optional(),

        // 🔹 CIAP-2 (campos existentes)
        ciapRfe: z.string().optional(), // 01–29 (RFE) — único
        ciapDiagnosticos: z.array(z.string()).max(5).optional(), // 70–99 — até 5
        ciapProcedimentos: z.array(z.string()).max(5).optional(), // 30–69 — até 5

        // 🔹 NOVOS: Motivo de desfecho
        motivoDesfecho: z.string().min(2, "O motivo de desfecho é obrigatório."),
        especialidadeEncaminhamento: z.string().optional(),
        setorEncaminhamento: z.string().optional(),
        tiposCuidadosEnfermagem: z.array(z.string()).optional(),

        // 🔹 NOVO: Aprazamento de receitas
        aprazamento: z.string().optional(),
        diasTratamento: z.string().optional(),
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
    )
    .refine(
        (data) => {
            // Regra: se motivo for "02" (Alta se melhora) ou "04" (Alta após medicação/procedimento), setor é obrigatório
            if (data.motivoDesfecho === "02" || data.motivoDesfecho === "04") {
                return !!data.setorEncaminhamento && data.setorEncaminhamento.trim().length > 0;
            }
            return true;
        },
        {
            message: "Setor é obrigatório quando o motivo for Alta se melhora ou Alta após medicação/procedimento.",
            path: ["setorEncaminhamento"],
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
    const [medicamentoRemumeSelecionado, setMedicamentoRemumeSelecionado] = useState<MedicamentoRemume | null>(null);
    const [dadosTriagem, setDadosTriagem] = useState<DadosTriagem | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isEditing, setIsEditing] = useState(!atendimentoId);

    // Estados para Solicitar Exames
    const [examesSelecionados, setExamesSelecionados] = useState<Exame[]>([]);
    const [procedimentosSelecionados, setProcedimentosSelecionados] = useState<ProcedimentoSUS[]>([]);
    const [buscaExame, setBuscaExame] = useState("");
    const [buscaProcedimento, setBuscaProcedimento] = useState("");
    const [resultadosBuscaExame, setResultadosBuscaExame] = useState<Exame[]>([]);
    const [resultadosBuscaProcedimento, setResultadosBuscaProcedimento] = useState<ProcedimentoSUS[]>([]);
    const [buscandoExame, setBuscandoExame] = useState(false);
    const [buscandoProcedimento, setBuscandoProcedimento] = useState(false);

    // Estados para Procedimentos Realizados
    const [procedimentosRealizadosLista, setProcedimentosRealizadosLista] = useState<Array<{
        id: string;
        descricao: string;
        dataHora: string;
    }>>([]);

    // Estados para Encaminhamentos
    const [encaminhamentosLista, setEncaminhamentosLista] = useState<Array<{
        id: string;
        especialidade: string;
        motivo: string;
        dataHora: string;
    }>>([]);

    // Saúde da Mulher (DUM) vindo do Acolhimento
    const [dumData, setDumData] = useState<string>("");
    const [gestante, setGestante] = useState<boolean>(false);
    const [semanasGestacao, setSemanasGestacao] = useState<number | "">("");

    // Info adicional (última triagem)
    const [vinculoTerritorio, setVinculoTerritorio] = useState<string>("");
    const [statusVacinas, setStatusVacinas] = useState<"EM_DIA" | "ATRASADA" | "INDISPONIVEL">("INDISPONIVEL");
    const [alergiasTriagem, setAlergiasTriagem] = useState<string>("");
    const [alergiasPaciente, setAlergiasPaciente] = useState<string[]>([]);

    // 🔹 Estado local da CIAP-2 (usado pelo componente visual)
    const [ciap, setCiap] = useState<CiapFieldsValue>({
        ciapRfe: [],
        ciapDiagnosticos: [],
        ciapProcedimentos: [],
    });

    // Funções de busca
    const buscarExames = async (termo: string) => {
        if (termo.trim().length < 3) return;
        try {
            setBuscandoExame(true);
            const response = await laboratorioService.buscarExames(termo);
            const exames = Array.isArray(response.data) ? response.data : (response.data?.data || []);
            setResultadosBuscaExame(exames.slice(0, 10));
        } catch (error) {
            console.error("Erro ao buscar exames:", error);
            setResultadosBuscaExame([]);
        } finally {
            setBuscandoExame(false);
        }
    };

    const buscarProcedimentosLista = async (termo: string) => {
        if (termo.trim().length < 3) return;
        try {
            setBuscandoProcedimento(true);
            const procedimentos = await buscarProcedimentos(termo, 10);
            setResultadosBuscaProcedimento(procedimentos);
        } catch (error) {
            console.error("Erro ao buscar procedimentos:", error);
            setResultadosBuscaProcedimento([]);
        } finally {
            setBuscandoProcedimento(false);
        }
    };

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
        procedimentosRealizados: (initialData as any)?.procedimentosRealizados || "",
        encaminhamentos: (initialData as any)?.encaminhamentos || "",

        // 🔹 Defaults CIAP-2
        ciapRfe: (initialData as any)?.ciapRfe || undefined,
        ciapDiagnosticos: (initialData as any)?.ciapDiagnosticos || [],
        ciapProcedimentos: (initialData as any)?.ciapProcedimentos || [],

        // 🔹 NOVOS: Defaults motivo de desfecho
        motivoDesfecho: (initialData as any)?.motivoDesfecho || "01", // Default: Alta
        especialidadeEncaminhamento: (initialData as any)?.especialidadeEncaminhamento || "",
        setorEncaminhamento: (initialData as any)?.setorEncaminhamento || "",
        tiposCuidadosEnfermagem: (initialData as any)?.tiposCuidadosEnfermagem || [],

        // 🔹 NOVO: Default aprazamento
        aprazamento: (initialData as any)?.aprazamento || "",
        diasTratamento: (initialData as any)?.diasTratamento || "",
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

    // ✅ SINCRONIZA ESTADO CIAP COM O FORMULÁRIO
    useEffect(() => {
        // Sincroniza ciapRfe (array -> string)
        const ciapRfeValue = ciap.ciapRfe[0] || undefined;
        form.setValue("ciapRfe", ciapRfeValue, { shouldValidate: true, shouldDirty: false });
        
        // Sincroniza ciapDiagnosticos (array -> array)
        form.setValue("ciapDiagnosticos", ciap.ciapDiagnosticos || [], { shouldValidate: true, shouldDirty: false });
        
        // Sincroniza ciapProcedimentos (array -> array)
        form.setValue("ciapProcedimentos", ciap.ciapProcedimentos || [], { shouldValidate: true, shouldDirty: false });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [ciap.ciapRfe, ciap.ciapDiagnosticos, ciap.ciapProcedimentos]);

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
                setAlergiasPaciente([]);
                return;
            }

            try {
                const { data } = await apiService.get(`/pacientes/${p.id}`);
                const bairro = (data as any)?.bairro || "";
                const municipio = (data as any)?.municipio || "";
                const equipe = (data as any)?.prontuarioFamiliar || "";
                const texto = [bairro, municipio, equipe].filter(Boolean).join(" • ");
                setVinculoTerritorio(texto);
                
                // Carrega alergias do paciente (histórico completo)
                const alergiasTexto = (data as any)?.alergias || "";
                if (alergiasTexto) {
                    const alergiasLista = alergiasTexto
                        .split(/[\s,;]+/)
                        .map((a: string) => a.trim().toUpperCase())
                        .filter((a: string) => a.length > 0);
                    setAlergiasPaciente(alergiasLista);
                } else {
                    setAlergiasPaciente([]);
                }
            } catch {
                setVinculoTerritorio("");
                setAlergiasPaciente([]);
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
        console.log("🔵 handleSubmit chamado com dados:", data);
        console.log("🔵 Estado CIAP:", ciap);
        console.log("🔵 isEditing:", isEditing);
        console.log("🔵 readOnly:", readOnly);
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
                setorEncaminhamento: data.setorEncaminhamento || "",
                tiposCuidadosEnfermagem: data.tiposCuidadosEnfermagem || [],
                // Aprazamento
                aprazamento: data.aprazamento || "",
                diasTratamento: data.diasTratamento || "",
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
                <form 
                    onSubmit={form.handleSubmit(
                        handleSubmit,
                        (errors) => {
                            console.error("Erros de validação:", errors);
                            console.error("Estado CIAP atual:", ciap);
                            console.error("Valores do formulário:", form.getValues());
                            
                            // Exibir mensagens de erro para o usuário
                            const errorMessages: string[] = [];
                            
                            // Verifica erros específicos
                            if (errors.ciapRfe) {
                                errorMessages.push(errors.ciapRfe.message || "Informe pelo menos 1 RFE (01–29) ou Diagnóstico (70–99) do CIAP-2.");
                            }
                            if (errors.cid10) {
                                errorMessages.push(errors.cid10.message || "O campo CID é obrigatório.");
                            }
                            if (errors.pacienteId) {
                                errorMessages.push(errors.pacienteId.message || "O campo Paciente é obrigatório.");
                            }
                            if (errors.motivoDesfecho) {
                                errorMessages.push(errors.motivoDesfecho.message || "O motivo de desfecho é obrigatório.");
                            }
                            if (errors.especialidadeEncaminhamento) {
                                errorMessages.push(errors.especialidadeEncaminhamento.message || "Especialidade é obrigatória quando o motivo for Encaminhamento.");
                            }
                            
                            // Se não encontrou erros específicos, tenta pegar o primeiro erro
                            if (errorMessages.length === 0) {
                                const firstErrorKey = Object.keys(errors)[0];
                                if (firstErrorKey) {
                                    const firstError = errors[firstErrorKey as keyof typeof errors];
                                    if (firstError?.message) {
                                        errorMessages.push(firstError.message);
                                    }
                                }
                            }
                            
                            // Exibe mensagem de erro
                            if (errorMessages.length > 0) {
                                toast.error(errorMessages[0]);
                            } else {
                                toast.error("Por favor, corrija os erros no formulário.");
                            }
                        }
                    )} 
                    className="space-y-6"
                >
                    {/* ✅ ESTRUTURA DE TABS */}
                    <Tabs defaultValue="dados-clinicos" className="w-full">
                        <TabsList className="grid w-full grid-cols-9">
                            <TabsTrigger value="dados-usuario" className="flex items-center gap-2">
                                <User className="h-4 w-4" />
                                <span className="hidden sm:inline">Dados do Usuário</span>
                            </TabsTrigger>
                            <TabsTrigger value="dados-triagem" className="flex items-center gap-2">
                                <ClipboardList className="h-4 w-4" />
                                <span className="hidden sm:inline">Triagem</span>
                            </TabsTrigger>
                            <TabsTrigger value="dados-clinicos" className="flex items-center gap-2">
                                <Stethoscope className="h-4 w-4" />
                                <span className="hidden sm:inline">Dados Clínicos</span>
                            </TabsTrigger>
                            <TabsTrigger value="prescricao" className="flex items-center gap-2">
                                <Pill className="h-4 w-4" />
                                <span className="hidden sm:inline">Prescrição</span>
                            </TabsTrigger>
                            <TabsTrigger value="solicitar-exames" className="flex items-center gap-2">
                                <FlaskConical className="h-4 w-4" />
                                <span className="hidden sm:inline">Solicitar Exames</span>
                            </TabsTrigger>
                            <TabsTrigger value="procedimentos-realizados" className="flex items-center gap-2">
                                <Activity className="h-4 w-4" />
                                <span className="hidden sm:inline">Procedimentos</span>
                            </TabsTrigger>
                            <TabsTrigger value="diagnostico" className="flex items-center gap-2">
                                <FileText className="h-4 w-4" />
                                <span className="hidden sm:inline">Diagnóstico</span>
                            </TabsTrigger>
                            <TabsTrigger value="encaminhamentos" className="flex items-center gap-2">
                                <Send className="h-4 w-4" />
                                <span className="hidden sm:inline">Encaminhamentos</span>
                            </TabsTrigger>
                            <TabsTrigger value="desfecho" className="flex items-center gap-2">
                                <CheckCircle className="h-4 w-4" />
                                <span className="hidden sm:inline">Desfecho</span>
                            </TabsTrigger>
                        </TabsList>

                        {/* ✅ ABA: DADOS DO USUÁRIO */}
                        <TabsContent value="dados-usuario" className="space-y-4 mt-4">
                    <Card>
                        <CardHeader>
                                    <CardTitle className="text-lg flex items-center gap-2">
                                        <User className="h-5 w-5" />
                                        Dados do Usuário
                                    </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                                    {/* Informações Básicas */}
                                    {pacienteSelecionado && (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="text-sm bg-gray-50 border border-gray-200 rounded-md p-3">
                                                <div className="font-medium text-gray-700">Nome Completo</div>
                                                <div className="text-gray-800">{pacienteSelecionado.nomeCompleto || "Não informado"}</div>
                                            </div>
                                            <div className="text-sm bg-gray-50 border border-gray-200 rounded-md p-3">
                                                <div className="font-medium text-gray-700">ID do Paciente</div>
                                                <div className="text-gray-800">{pacienteSelecionado.id || "Não informado"}</div>
                                            </div>
                                        </div>
                                    )}

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

                            {/* Alergias do paciente - Tags vermelhas de alerta */}
                            {alergiasPaciente.length > 0 && (
                                <div>
                                    <Label className="text-red-700 font-semibold flex items-center gap-2">
                                        <AlertCircle className="h-4 w-4" />
                                        Alergias Conhecidas - ATENÇÃO!
                                    </Label>
                                    <div className="mt-2 flex flex-wrap gap-2">
                                        {alergiasPaciente.map((alergia, idx) => (
                                            <Badge
                                                key={idx}
                                                variant="destructive"
                                                className="bg-red-600 hover:bg-red-700 text-white font-semibold px-3 py-1 text-sm"
                                            >
                                                ⚠️ {alergia}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            )}
                            
                            {/* Alergias (triagem) - apenas se não estiverem no histórico */}
                            {alergiasTriagem && alergiasTriagem.trim() && alergiasPaciente.length === 0 && (
                                <div>
                                    <Label>Alergias (da Triagem)</Label>
                                    <Textarea value={alergiasTriagem} readOnly className="bg-gray-50" rows={2} />
                                </div>
                            )}

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
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* ✅ ABA: DADOS DA TRIAGEM */}
                        <TabsContent value="dados-triagem" className="space-y-4 mt-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg flex items-center gap-2">
                                        <ClipboardList className="h-5 w-5" />
                                        Dados da Triagem
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {dadosTriagem ? (
                                        <>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {dadosTriagem.profissionalTriagem && (
                                                    <div className="text-sm bg-gray-50 border border-gray-200 rounded-md p-3">
                                                        <div className="font-medium text-gray-700">Profissional da Triagem</div>
                                                        <div className="text-gray-800">{dadosTriagem.profissionalTriagem}</div>
                                                    </div>
                                                )}
                                                {dadosTriagem.horarioTriagem && (
                                                    <div className="text-sm bg-gray-50 border border-gray-200 rounded-md p-3">
                                                        <div className="font-medium text-gray-700">Horário da Triagem</div>
                                                        <div className="text-gray-800">{dadosTriagem.horarioTriagem}</div>
                                                    </div>
                                                )}
                                                {dadosTriagem.pressaoArterial && (
                                                    <div className="text-sm bg-gray-50 border border-gray-200 rounded-md p-3">
                                                        <div className="font-medium text-gray-700">Pressão Arterial</div>
                                                        <div className="text-gray-800">{dadosTriagem.pressaoArterial}</div>
                                                    </div>
                                                )}
                                                {dadosTriagem.temperatura !== undefined && (
                                                    <div className="text-sm bg-gray-50 border border-gray-200 rounded-md p-3">
                                                        <div className="font-medium text-gray-700">Temperatura</div>
                                                        <div className="text-gray-800">{dadosTriagem.temperatura} °C</div>
                                                    </div>
                                                )}
                                                {dadosTriagem.frequenciaCardiaca !== undefined && (
                                                    <div className="text-sm bg-gray-50 border border-gray-200 rounded-md p-3">
                                                        <div className="font-medium text-gray-700">Frequência Cardíaca</div>
                                                        <div className="text-gray-800">{dadosTriagem.frequenciaCardiaca} bpm</div>
                                                    </div>
                                                )}
                                                {dadosTriagem.saturacaoOxigenio !== undefined && (
                                                    <div className="text-sm bg-gray-50 border border-gray-200 rounded-md p-3">
                                                        <div className="font-medium text-gray-700">Saturação O₂</div>
                                                        <div className="text-gray-800">{dadosTriagem.saturacaoOxigenio}%</div>
                                                    </div>
                                                )}
                                                {dadosTriagem.peso !== undefined && (
                                                    <div className="text-sm bg-gray-50 border border-gray-200 rounded-md p-3">
                                                        <div className="font-medium text-gray-700">Peso</div>
                                                        <div className="text-gray-800">{dadosTriagem.peso} kg</div>
                                                    </div>
                                                )}
                                                {dadosTriagem.altura !== undefined && (
                                                    <div className="text-sm bg-gray-50 border border-gray-200 rounded-md p-3">
                                                        <div className="font-medium text-gray-700">Altura</div>
                                                        <div className="text-gray-800">{dadosTriagem.altura} m</div>
                                                    </div>
                                                )}
                                            </div>
                                            {dadosTriagem.classificacaoRisco && (
                                                <div className="mt-4">
                                                    <Label className="text-sm font-medium">Classificação de Risco</Label>
                                                    <div className="mt-2">
                                                        {getClassificacaoRiscoBadge(dadosTriagem.classificacaoRisco)}
                                                    </div>
                                                </div>
                                            )}
                                            {dadosTriagem.escalaDor !== undefined && (
                                                <div className="mt-4">
                                                    <Label className="text-sm font-medium">Escala de Dor</Label>
                                                    <div className="mt-2 text-gray-800">{dadosTriagem.escalaDor}/10</div>
                                                </div>
                                            )}
                                            {dadosTriagem.observacoes && (
                                                <div className="mt-4">
                                                    <Label className="text-sm font-medium">Observações</Label>
                                                    <Textarea value={dadosTriagem.observacoes} readOnly className="bg-gray-50 mt-2" rows={3} />
                                                </div>
                                            )}
                                        </>
                                    ) : (
                                        <div className="text-center text-gray-500 py-8">
                                            Nenhum dado de triagem disponível
                                        </div>
                                    )}

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
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* ✅ ABA: DADOS CLÍNICOS */}
                        <TabsContent value="dados-clinicos" className="space-y-4 mt-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg flex items-center gap-2">
                                        <Stethoscope className="h-5 w-5" />
                                        Dados Clínicos
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
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
                        </TabsContent>

                        {/* ✅ ABA: PRESCRIÇÃO */}
                        <TabsContent value="prescricao" className="space-y-4 mt-4">
                    <Card>
                        <CardHeader>
                                    <CardTitle className="text-lg flex items-center gap-2">
                                        <Pill className="h-5 w-5" />
                                        Prescrição de Medicamentos
                                    </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* REMUME - Relação Municipal de Medicamentos Essenciais */}
                            <div className="border border-blue-200 rounded-lg p-4 bg-blue-50/30">
                                <h3 className="text-sm font-semibold text-blue-900 mb-2">REMUME - Relação Municipal de Medicamentos Essenciais</h3>
                                <p className="text-xs text-blue-700 mb-3">
                                    Busque medicamentos disponíveis na rede municipal de saúde
                                </p>
                                <div className="border border-blue-100 rounded p-3 bg-white">
                                    <RemumeBusca
                                        onMedicamentoSelecionado={setMedicamentoRemumeSelecionado}
                                        medicamentoSelecionado={medicamentoRemumeSelecionado}
                                        placeholder="Digite o nome do medicamento ou princípio ativo..."
                                        disabled={!isEditing || readOnly}
                                    />
                                </div>
                            </div>

                            {/* PRESCRIÇÃO */}
                            <FormField
                                control={form.control}
                                name="prescricao"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Prescrição</FormLabel>
                                        <FormControl>
                                            <Textarea {...field} placeholder="Medicamentos, dosagens, posologia..." rows={6} disabled={!isEditing || readOnly} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* APRAZAMENTO DE RECEITAS E DIAS DE TRATAMENTO */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="aprazamento"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Aprazamento de Receitas</FormLabel>
                                            <Select onValueChange={field.onChange} value={field.value} disabled={!isEditing || readOnly}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Selecione o aprazamento..." />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="1_1_HORA">1/1 Hora</SelectItem>
                                                    <SelectItem value="2_2_HORAS">2/2 Horas</SelectItem>
                                                    <SelectItem value="4_4_HORAS">4/4 Horas</SelectItem>
                                                    <SelectItem value="6_6_HORAS">6/6 Horas</SelectItem>
                                                    <SelectItem value="8_8_HORAS">8/8 Horas</SelectItem>
                                                    <SelectItem value="12_12_HORAS">12/12 Horas</SelectItem>
                                                    <SelectItem value="1X_AO_DIA">1x Ao Dia</SelectItem>
                                                    <SelectItem value="2X_AO_DIA">2x Ao Dia</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="diasTratamento"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Dias de Tratamento</FormLabel>
                                            <FormControl>
                                                <Input
                                                    {...field}
                                                    type="number"
                                                    placeholder="Ex: 7, 14, 30..."
                                                    min="1"
                                                    disabled={!isEditing || readOnly}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* ✅ ABA: HIPÓTESE DIAGNÓSTICA (CID) */}
                        <TabsContent value="diagnostico" className="space-y-4 mt-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg flex items-center gap-2">
                                        <FileText className="h-5 w-5" />
                                        Hipótese Diagnóstica (CID)
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
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

                                    {/* 🔹 CIAP-2 */}
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
                        </TabsContent>

                        {/* ✅ ABA: SOLICITAR PROCEDIMENTOS E EXAMES */}
                        <TabsContent value="solicitar-exames" className="space-y-4 mt-4">
                    <Card>
                        <CardHeader>
                                    <CardTitle className="text-lg flex items-center gap-2">
                                        <FlaskConical className="h-5 w-5" />
                                        Solicitar Procedimentos e Exames
                                    </CardTitle>
                                    <CardDescription>
                                        Solicite exames e procedimentos para o paciente.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {/* Busca de Exames */}
                                    <div className="space-y-2">
                                        <Label>Buscar Exame</Label>
                                        <div className="flex gap-2">
                                            <Input
                                                placeholder="Digite o nome ou código do exame..."
                                                value={buscaExame}
                                                onChange={(e) => {
                                                    setBuscaExame(e.target.value);
                                                    if (e.target.value.trim().length >= 3) {
                                                        buscarExames(e.target.value);
                                                    } else {
                                                        setResultadosBuscaExame([]);
                                                    }
                                                }}
                                                disabled={!isEditing || readOnly}
                                            />
                                        </div>
                                        {resultadosBuscaExame.length > 0 && (
                                            <div className="border border-gray-200 rounded-md max-h-48 overflow-y-auto">
                                                {resultadosBuscaExame.map((exame) => (
                                                    <div
                                                        key={exame.id}
                                                        className="p-2 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                                                        onClick={() => {
                                                            if (!isEditing || readOnly) return;
                                                            if (!examesSelecionados.find((e) => e.id === exame.id)) {
                                                                setExamesSelecionados([...examesSelecionados, exame]);
                                                            }
                                                            setBuscaExame("");
                                                            setResultadosBuscaExame([]);
                                                        }}
                                                    >
                                                        <div className="font-medium text-sm">{exame.nome}</div>
                                                        <div className="text-xs text-gray-500">{exame.codigo}</div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    {/* Busca de Procedimentos */}
                                    <div className="space-y-2">
                                        <Label>Buscar Procedimento</Label>
                                        <div className="flex gap-2">
                                            <Input
                                                placeholder="Digite o nome ou código do procedimento..."
                                                value={buscaProcedimento}
                                                onChange={(e) => {
                                                    setBuscaProcedimento(e.target.value);
                                                    if (e.target.value.trim().length >= 3) {
                                                        buscarProcedimentosLista(e.target.value);
                                                    } else {
                                                        setResultadosBuscaProcedimento([]);
                                                    }
                                                }}
                                                disabled={!isEditing || readOnly}
                                            />
                                        </div>
                                        {resultadosBuscaProcedimento.length > 0 && (
                                            <div className="border border-gray-200 rounded-md max-h-48 overflow-y-auto">
                                                {resultadosBuscaProcedimento.map((proc) => (
                                                    <div
                                                        key={proc.codigo}
                                                        className="p-2 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                                                        onClick={() => {
                                                            if (!isEditing || readOnly) return;
                                                            if (!procedimentosSelecionados.find((p) => p.codigo === proc.codigo)) {
                                                                setProcedimentosSelecionados([...procedimentosSelecionados, proc]);
                                                            }
                                                            setBuscaProcedimento("");
                                                            setResultadosBuscaProcedimento([]);
                                                        }}
                                                    >
                                                        <div className="font-medium text-sm">{proc.descricao}</div>
                                                        <div className="text-xs text-gray-500">{proc.codigo}</div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    {/* Lista de Exames Selecionados */}
                                    {examesSelecionados.length > 0 && (
                                        <div className="space-y-2">
                                            <Label>Exames Selecionados</Label>
                                            <div className="space-y-2">
                                                {examesSelecionados.map((exame) => (
                                                    <div key={exame.id} className="flex items-center justify-between p-2 bg-blue-50 border border-blue-200 rounded-md">
                                                        <div>
                                                            <div className="font-medium text-sm">{exame.nome}</div>
                                                            <div className="text-xs text-gray-500">{exame.codigo}</div>
                                                        </div>
                                                        {!readOnly && (
                                                            <Button
                                                                type="button"
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => {
                                                                    setExamesSelecionados(examesSelecionados.filter((e) => e.id !== exame.id));
                                                                }}
                                                            >
                                                                Remover
                                                            </Button>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Lista de Procedimentos Selecionados */}
                                    {procedimentosSelecionados.length > 0 && (
                                        <div className="space-y-2">
                                            <Label>Procedimentos Selecionados</Label>
                                            <div className="space-y-2">
                                                {procedimentosSelecionados.map((proc) => (
                                                    <div key={proc.codigo} className="flex items-center justify-between p-2 bg-green-50 border border-green-200 rounded-md">
                                                        <div>
                                                            <div className="font-medium text-sm">{proc.descricao}</div>
                                                            <div className="text-xs text-gray-500">{proc.codigo}</div>
                                                        </div>
                                                        {!readOnly && (
                                                            <Button
                                                                type="button"
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => {
                                                                    setProcedimentosSelecionados(procedimentosSelecionados.filter((p) => p.codigo !== proc.codigo));
                                                                }}
                                                            >
                                                                Remover
                                                            </Button>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Campo de Observações */}
                                    <FormField
                                        control={form.control}
                                        name="solicitacaoExames"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Observações</FormLabel>
                                                <FormControl>
                                                    <Textarea 
                                                        {...field} 
                                                        placeholder="Observações adicionais sobre os exames e procedimentos solicitados..." 
                                                        rows={4} 
                                                        disabled={!isEditing || readOnly} 
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* ✅ ABA: PROCEDIMENTOS REALIZADOS */}
                        <TabsContent value="procedimentos-realizados" className="space-y-4 mt-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg flex items-center gap-2">
                                        <Activity className="h-5 w-5" />
                                        Procedimentos Realizados
                                    </CardTitle>
                                    <CardDescription>
                                        Registre os procedimentos já realizados durante o atendimento.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {/* Adicionar Novo Procedimento */}
                                    {!readOnly && (
                                        <div className="space-y-2">
                                            <Label>Adicionar Procedimento Realizado</Label>
                                            <div className="flex gap-2">
                                                <Input
                                                    placeholder="Descrição do procedimento..."
                                                    onKeyDown={(e) => {
                                                        if (e.key === "Enter" && e.currentTarget.value.trim()) {
                                                            const novoProcedimento = {
                                                                id: Date.now().toString(),
                                                                descricao: e.currentTarget.value.trim(),
                                                                dataHora: new Date().toISOString(),
                                                            };
                                                            setProcedimentosRealizadosLista([...procedimentosRealizadosLista, novoProcedimento]);
                                                            e.currentTarget.value = "";
                                                        }
                                                    }}
                                                    disabled={!isEditing || readOnly}
                                                />
                                                <Button
                                                    type="button"
                                                    onClick={() => {
                                                        const input = document.querySelector('input[placeholder="Descrição do procedimento..."]') as HTMLInputElement;
                                                        if (input && input.value.trim()) {
                                                            const novoProcedimento = {
                                                                id: Date.now().toString(),
                                                                descricao: input.value.trim(),
                                                                dataHora: new Date().toISOString(),
                                                            };
                                                            setProcedimentosRealizadosLista([...procedimentosRealizadosLista, novoProcedimento]);
                                                            input.value = "";
                                                        }
                                                    }}
                                                    disabled={!isEditing || readOnly}
                                                >
                                                    Adicionar
                                                </Button>
                                            </div>
                                        </div>
                                    )}

                                    {/* Lista de Procedimentos Realizados */}
                                    {procedimentosRealizadosLista.length > 0 ? (
                                        <div className="space-y-2">
                                            <Label>Procedimentos Realizados</Label>
                                            <div className="space-y-2">
                                                {procedimentosRealizadosLista.map((proc) => (
                                                    <div key={proc.id} className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-md">
                                                        <div className="flex-1">
                                                            <div className="font-medium text-sm">{proc.descricao}</div>
                                                            <div className="text-xs text-gray-500">
                                                                {new Date(proc.dataHora).toLocaleString("pt-BR")}
                                                            </div>
                                                        </div>
                                                        {!readOnly && (
                                                            <Button
                                                                type="button"
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => {
                                                                    setProcedimentosRealizadosLista(procedimentosRealizadosLista.filter((p) => p.id !== proc.id));
                                                                }}
                                                            >
                                                                Remover
                                                            </Button>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="text-center text-gray-500 py-8">
                                            Nenhum procedimento realizado registrado.
                                        </div>
                                    )}

                                    {/* Campo de Observações (fallback) */}
                                    <FormField
                                        control={form.control}
                                        name="procedimentosRealizados"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Observações Adicionais</FormLabel>
                                                <FormControl>
                                                    <Textarea 
                                                        {...field} 
                                                        placeholder="Observações adicionais sobre os procedimentos realizados..." 
                                                        rows={3} 
                                                        disabled={!isEditing || readOnly} 
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* ✅ ABA: ENCAMINHAMENTOS */}
                        <TabsContent value="encaminhamentos" className="space-y-4 mt-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg flex items-center gap-2">
                                        <Send className="h-5 w-5" />
                                        Encaminhamentos
                                    </CardTitle>
                                    <CardDescription>
                                        Gerencie os encaminhamentos do paciente.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {/* Adicionar Novo Encaminhamento */}
                                    {!readOnly && (
                                        <div className="space-y-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Label>Especialidade</Label>
                                                    <Input
                                                        id="novaEspecialidade"
                                                        placeholder="Ex.: Cardiologia, Dermatologia..."
                                                        disabled={!isEditing || readOnly}
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>Motivo</Label>
                                                    <Input
                                                        id="novoMotivo"
                                                        placeholder="Motivo do encaminhamento..."
                                                        disabled={!isEditing || readOnly}
                                                    />
                                                </div>
                                            </div>
                                            <Button
                                                type="button"
                                                onClick={() => {
                                                    const especialidadeInput = document.getElementById("novaEspecialidade") as HTMLInputElement;
                                                    const motivoInput = document.getElementById("novoMotivo") as HTMLInputElement;
                                                    if (especialidadeInput && motivoInput && especialidadeInput.value.trim() && motivoInput.value.trim()) {
                                                        const novoEncaminhamento = {
                                                            id: Date.now().toString(),
                                                            especialidade: especialidadeInput.value.trim(),
                                                            motivo: motivoInput.value.trim(),
                                                            dataHora: new Date().toISOString(),
                                                        };
                                                        setEncaminhamentosLista([...encaminhamentosLista, novoEncaminhamento]);
                                                        especialidadeInput.value = "";
                                                        motivoInput.value = "";
                                                    } else {
                                                        toast.error("Preencha a especialidade e o motivo do encaminhamento.");
                                                    }
                                                }}
                                                disabled={!isEditing || readOnly}
                                            >
                                                Adicionar Encaminhamento
                                            </Button>
                                        </div>
                                    )}

                                    {/* Lista de Encaminhamentos */}
                                    {encaminhamentosLista.length > 0 ? (
                                        <div className="space-y-2">
                                            <Label>Encaminhamentos Registrados</Label>
                                            <div className="space-y-2">
                                                {encaminhamentosLista.map((enc) => (
                                                    <div key={enc.id} className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                                                        <div className="flex items-start justify-between">
                                                            <div className="flex-1">
                                                                <div className="font-medium text-sm">{enc.especialidade}</div>
                                                                <div className="text-sm text-gray-700 mt-1">{enc.motivo}</div>
                                                                <div className="text-xs text-gray-500 mt-1">
                                                                    {new Date(enc.dataHora).toLocaleString("pt-BR")}
                                                                </div>
                                                            </div>
                                                            {!readOnly && (
                                                                <Button
                                                                    type="button"
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    onClick={() => {
                                                                        setEncaminhamentosLista(encaminhamentosLista.filter((e) => e.id !== enc.id));
                                                                    }}
                                                                >
                                                                    Remover
                                                                </Button>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="text-center text-gray-500 py-8">
                                            Nenhum encaminhamento registrado.
                                        </div>
                                    )}

                                    {/* Campo de Observações (fallback) */}
                                    <FormField
                                        control={form.control}
                                        name="encaminhamentos"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Observações Adicionais</FormLabel>
                                                <FormControl>
                                                    <Textarea 
                                                        {...field} 
                                                        placeholder="Observações adicionais sobre os encaminhamentos..." 
                                                        rows={3} 
                                                        disabled={!isEditing || readOnly} 
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* ✅ ABA: DESFECHO DA CONSULTA */}
                        <TabsContent value="desfecho" className="space-y-4 mt-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg flex items-center gap-2">
                                        <CheckCircle className="h-5 w-5" />
                                        Desfecho da Consulta
                                    </CardTitle>
                            <CardDescription>
                                Selecione o motivo de desfecho do atendimento conforme tabela oficial do SUS.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <FormField
                                    control={form.control}
                                    name="motivoDesfecho"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormControl>
                                                <MotivoDesfechoSelect
                                                    motivoValue={field.value}
                                                    especialidadeValue={form.getValues("especialidadeEncaminhamento")}
                                                            setorValue={form.getValues("setorEncaminhamento")}
                                                            tiposCuidadosValue={form.getValues("tiposCuidadosEnfermagem") || []}
                                                    onMotivoChange={(value) => {
                                                        field.onChange(value);
                                                        if (value !== "03") {
                                                            form.setValue("especialidadeEncaminhamento", "");
                                                        }
                                                                if (value !== "02" && value !== "04") {
                                                                    form.setValue("setorEncaminhamento", "");
                                                                    form.setValue("tiposCuidadosEnfermagem", []);
                                                                }
                                                    }}
                                                    onEspecialidadeChange={(value) => {
                                                        form.setValue("especialidadeEncaminhamento", value);
                                                    }}
                                                            onSetorChange={(value) => {
                                                                form.setValue("setorEncaminhamento", value);
                                                            }}
                                                            onTiposCuidadosChange={(value) => {
                                                                form.setValue("tiposCuidadosEnfermagem", value);
                                                            }}
                                                    disabled={!isEditing || readOnly}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                            {form.watch("motivoDesfecho") === "03" &&
                                                !form.getValues("especialidadeEncaminhamento") && (
                                                    <FormMessage>Especialidade é obrigatória quando o motivo for Encaminhamento.</FormMessage>
                                                )}
                                                    {(form.watch("motivoDesfecho") === "02" || 
                                                      form.watch("motivoDesfecho") === "04") &&
                                                        !form.getValues("setorEncaminhamento") && (
                                                            <FormMessage>Setor é obrigatório quando o motivo for Alta se melhora ou Alta após medicação/procedimento.</FormMessage>
                                                        )}
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </CardContent>
                    </Card>
                        </TabsContent>
                    </Tabs>

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