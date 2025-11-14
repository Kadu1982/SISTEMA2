import React, { useState, useEffect } from "react";
import {
    Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
    User, CheckCircle, Clock, Loader2, Calendar, ChevronDown, ChevronUp,
} from "lucide-react";
import apiService from "@/services/apiService";
import {
    useTriagemOperations,
    PacienteParaTriagem,
    CriarTriagemRequest,
    MOTIVOS_CONSULTA,
    SEMANAS_GESTACAO,
    MotivoConsulta,
} from "@/hooks/useTriagemOperations";
// ⚠️ Import sem extensão para evitar erro de resolução (.tsx)
import { CalendarWithIndicators } from "@/components/ui/CalendarWithIndicators";

// Feature flag para habilitar/desabilitar a consulta ao status de vacinas
const HABILITAR_STATUS_VACINAS = false;

// -----------------------------------------------------------------------------
// Linhas de Cuidado (Ministério da Saúde) — conjunto consolidado
// -----------------------------------------------------------------------------
const CONDICOES_LINHAS_CUIDADO: string[] = [
    "Hipertensão Arterial Sistêmica (HAS)",
    "Diabetes Mellitus",
    "Doenças Cardiovasculares (DAC/AVC)",
    "Infarto Agudo do Miocárdio (IAM)",
    "Acidente Vascular Cerebral (AVC)",
    "Doenças Respiratórias Crônicas (Asma/DPOC)",
    "Doença Renal Crônica",
    "Obesidade",
    "Oncologia (Câncer)",
    "Saúde Mental",
    "Saúde da Mulher (Pré-natal/Puerpério)",
    "Saúde da Criança",
    "Saúde do Homem",
    "Pessoa Idosa/Envelhecimento",
    "IST/HIV/Aids e Hepatites Virais",
    "Tuberculose",
    "Hanseníase",
    "Doenças Raras",
    "Doenças Negligenciadas (Chagas/Leishmaniose)",
    "Saúde Bucal",
    "Tabagismo",
];

// -----------------------------------------------------------------------------
// Estado inicial — campos de triagem
// -----------------------------------------------------------------------------
const initialState = {
    pressaoArterial: "",
    temperatura: "",
    peso: "",
    altura: "",
    frequenciaCardiaca: "",
    frequenciaRespiratoria: "",
    saturacaoOxigenio: "",
    motivoConsulta: "CONSULTA" as MotivoConsulta,
    queixaPrincipal: "",
    anamnese: "",
    observacoes: "",
    alergias: "",
    // Saúde da Mulher
    dumInformada: "",
    gestanteInformado: false,
    semanasGestacaoInformadas: "",
    // Linhas de cuidado (seleções)
    linhasCuidado: [] as string[],
    dataReferencia: new Date().toISOString().slice(0, 10),
};

// -----------------------------------------------------------------------------
// Componente
// -----------------------------------------------------------------------------
export const TriagemPaciente: React.FC = () => {
    const [selectedDate, setSelectedDate] = useState<string>(
        new Date().toISOString().slice(0, 10)
    );
    const [showCalendar, setShowCalendar] = useState<boolean>(false);

    const {
        pacientesAguardando,
        isLoadingAguardando,
        salvarTriagem,
        isSaving,
        datasComPacientesRecepcionados,
        isLoadingDatasRecepcionados,
        hasRecepcioandosPorData,
    } = useTriagemOperations(selectedDate);

    const [pacienteSelecionado, setPacienteSelecionado] =
        useState<PacienteParaTriagem | null>(null);

    const [formData, setFormData] = useState({
        ...initialState,
        dataReferencia: selectedDate,
    });

    const [vinculoTerritorio, setVinculoTerritorio] = useState<string>("");
    const [statusVacinas, setStatusVacinas] = useState<
        "EM_DIA" | "ATRASADA" | "INDISPONIVEL"
    >("INDISPONIVEL");

    // Sempre que trocar o dia, refletir no payload
    useEffect(() => {
        setFormData((prev) => ({ ...prev, dataReferencia: selectedDate }));
    }, [selectedDate]);

    // ---------------------------------------------------------------------------
    // Helpers (inputs / máscaras / IMC)
    // ---------------------------------------------------------------------------
    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;
        
        // Campo de alergias sempre em maiúsculas
        if (name === "alergias") {
            setFormData((prev) => ({ ...prev, [name]: value.toUpperCase() }));
        } else {
            setFormData((prev) => ({ ...prev, [name]: value }));
        }
    };

    const handleSelectChange = (name: string, value: string) => {
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const toggleLinhaCuidado = (item: string) => {
        setFormData((prev) => {
            const atual = new Set(prev.linhasCuidado as string[]);
            if (atual.has(item)) atual.delete(item);
            else atual.add(item);
            return { ...prev, linhasCuidado: Array.from(atual) };
        });
    };

    const classificarImc = (
        imc: number
    ): { rotulo: string; cor: string } => {
        if (imc < 18.5) return { rotulo: "Baixo peso", cor: "text-yellow-700 bg-yellow-50 border-yellow-200" };
        if (imc < 25) return { rotulo: "Eutrofia", cor: "text-green-700 bg-green-50 border-green-200" };
        if (imc < 30) return { rotulo: "Sobrepeso", cor: "text-amber-700 bg-amber-50 border-amber-200" };
        if (imc < 35) return { rotulo: "Obesidade I", cor: "text-orange-700 bg-orange-50 border-orange-200" };
        if (imc < 40) return { rotulo: "Obesidade II", cor: "text-red-700 bg-red-50 border-red-200" };
        return { rotulo: "Obesidade III", cor: "text-red-800 bg-red-100 border-red-200" };
    };

    const parseNum = (s: string): number | null => {
        if (!s) return null;
        const n = parseFloat(s.replace(",", "."));
        return isNaN(n) ? null : n;
    };

    const pesoNum = parseNum(formData.peso);
    const alturaNum = parseNum(formData.altura);
    const imcValor =
        pesoNum != null &&
        alturaNum != null &&
        alturaNum > 0.3 &&
        alturaNum <= 3
            ? parseFloat((pesoNum / (alturaNum * alturaNum)).toFixed(1))
            : null;
    const imcInfo = imcValor != null ? classificarImc(imcValor) : null;

    // ---------------------------------------------------------------------------
    // Carrega informações do paciente (vínculo e status vacinas)
    // ---------------------------------------------------------------------------
    useEffect(() => {
        const carregarInfoPaciente = async () => {
            if (!pacienteSelecionado) {
                setVinculoTerritorio("");
                setStatusVacinas("INDISPONIVEL");
                return;
            }
            try {
                // ⚠️ axios costuma devolver { data }, mas se houver interceptor,
                // resp pode já ser o payload. Tratamos os dois casos:
                const resp = await apiService.get(
                    `/pacientes/${pacienteSelecionado.pacienteId}`
                );
                const paciente = (resp as any)?.data ?? resp;

                // Em nosso DTO, bairro/município ficam dentro de `endereco`
                const bairro =
                    paciente?.endereco?.bairro ?? paciente?.bairro ?? "";
                const municipio =
                    paciente?.endereco?.municipio ?? paciente?.municipio ?? "";
                const equipe = paciente?.prontuarioFamiliar ?? "";
                const texto = [bairro, municipio, equipe]
                    .filter(Boolean)
                    .join(" • ");
                setVinculoTerritorio(texto);
            } catch (error: any) {
                console.error(`Erro ao carregar informações do paciente ${pacienteSelecionado.pacienteId}:`, error);
                // Define valores padrão em caso de erro para não quebrar a aplicação
                setVinculoTerritorio("");
            }

            // Status de vacinas (se o endpoint existir)
            // Desabilitado por padrão - endpoint pode não estar disponível
            if (!HABILITAR_STATUS_VACINAS) {
                setStatusVacinas("INDISPONIVEL");
            } else {
                try {
                    const resp = await apiService.get(
                        `/vacinas/status/${pacienteSelecionado.pacienteId}`
                    ).catch(() => {
                        // Erro já tratado no interceptor - retorna null silenciosamente
                        return { data: null };
                    });
                    
                    if (resp && resp.data) {
                        const status = (resp as any)?.data?.status ?? (resp as any)?.status;
                        const upper = String(status || "").toUpperCase();
                        if (upper === "EM_DIA") setStatusVacinas("EM_DIA");
                        else if (
                            upper === "ATRASADA" ||
                            upper === "ATRASADO" ||
                            upper === "FORA_DO_PRAZO"
                        )
                            setStatusVacinas("ATRASADA");
                        else setStatusVacinas("INDISPONIVEL");
                    } else {
                        setStatusVacinas("INDISPONIVEL");
                    }
                } catch (error: any) {
                    // Erro silencioso - endpoint pode não estar disponível
                    setStatusVacinas("INDISPONIVEL");
                }
            }
        };
        carregarInfoPaciente();
    }, [pacienteSelecionado]);

    const isPacienteFeminino = () => {
        const sexo = pacienteSelecionado?.sexo?.toUpperCase() || "";
        return sexo.startsWith("F");
    };

    // Máscaras para campos numéricos
    const aplicarMascara = (campo: string, valor: string): string => {
        if (!valor || valor.trim() === "") return "";

        switch (campo) {
            case "pressaoArterial": {
                // Formato: 120/80
                // Remove tudo exceto números e barra
                let pressao = valor.replace(/[^0-9/]/g, "");
                
                // Se não tem barra ainda, adiciona automaticamente após 3 dígitos
                if (!pressao.includes("/")) {
                    if (pressao.length > 3) {
                        pressao = pressao.slice(0, 3) + "/" + pressao.slice(3);
                    }
                } else {
                    // Se já tem barra, garante que só tenha uma e limita tamanho
                    const partes = pressao.split("/");
                    if (partes.length > 2) {
                        pressao = partes[0] + "/" + partes.slice(1).join("");
                    }
                }
                
                // Limita tamanho (ex: 220/120 = 7 caracteres)
                const partes = pressao.split("/");
                let sistolica = partes[0].slice(0, 3);
                let diastolica = partes[1] ? partes[1].slice(0, 3) : "";
                
                // Valida valores razoáveis
                const sistolicaNum = parseInt(sistolica);
                const diastolicaNum = diastolica ? parseInt(diastolica) : null;
                
                if (sistolicaNum > 0 && sistolicaNum <= 300) {
                    if (diastolicaNum === null) {
                        return sistolica + (pressao.includes("/") ? "/" : "");
                    } else if (diastolicaNum > 0 && diastolicaNum <= 200) {
                        return sistolica + "/" + diastolica;
                    }
                    return sistolica + "/" + diastolica.slice(0, 2);
                }
                return pressao.slice(0, 7);
            }
            case "temperatura": {
                // Formato: 36.5 ou 36,5 (aceita até 2 casas decimais)
                // Remove tudo exceto números, vírgula e ponto
                let temp = valor.replace(/[^0-9.,]/g, "");
                
                // Converte vírgula para ponto
                temp = temp.replace(",", ".");
                
                // Se tem mais de 2 dígitos sem ponto, insere ponto antes dos últimos dígitos
                // Ex: "368" -> "36.8", "365" -> "36.5"
                if (!temp.includes(".") && temp.length > 2) {
                    const parteInteira = temp.slice(0, -1);
                    const parteDecimal = temp.slice(-1);
                    temp = parteInteira + "." + parteDecimal;
                }
                
                // Permite apenas um ponto decimal
                const partes = temp.split(".");
                if (partes.length > 2) {
                    temp = partes[0] + "." + partes.slice(1).join("");
                }
                
                // Limita casas decimais a 2
                if (partes.length === 2 && partes[1].length > 2) {
                    temp = partes[0] + "." + partes[1].slice(0, 2);
                }
                
                // Limita tamanho total (ex: 50.99 = 5 caracteres)
                if (temp.length > 5) {
                    temp = temp.slice(0, 5);
                }
                
                // Garante que a parte inteira não tenha mais de 2 dígitos antes do ponto
                if (partes.length >= 1 && partes[0].length > 2) {
                    const parteInteira = partes[0].slice(0, 2);
                    const parteDecimal = partes.length > 1 ? "." + partes[1].slice(0, 2) : "";
                    temp = parteInteira + parteDecimal;
                }
                
                return temp;
            }
            case "peso": {
                // Formato: 70.5 ou 70,5 (aceita até 2 casas decimais)
                // Remove tudo exceto números, vírgula e ponto
                let peso = valor.replace(/[^0-9.,]/g, "");
                
                // Converte vírgula para ponto
                peso = peso.replace(",", ".");
                
                // Se tem 3 ou mais dígitos sem ponto, insere ponto antes do último dígito
                // Ex: "754" -> "75.4", "7545" -> "754.5" (mas depois limita)
                if (!peso.includes(".") && peso.length >= 3) {
                    const parteInteira = peso.slice(0, -1);
                    const parteDecimal = peso.slice(-1);
                    peso = parteInteira + "." + parteDecimal;
                }
                
                // Permite apenas um ponto decimal
                const partes = peso.split(".");
                if (partes.length > 2) {
                    peso = partes[0] + "." + partes.slice(1).join("");
                }
                
                // Limita casas decimais a 2
                if (partes.length === 2 && partes[1].length > 2) {
                    peso = partes[0] + "." + partes[1].slice(0, 2);
                }
                
                // Garante que a parte inteira não tenha mais de 3 dígitos antes do ponto
                if (partes.length >= 1 && partes[0].length > 3) {
                    const parteInteira = partes[0].slice(0, 3);
                    const parteDecimal = partes.length > 1 ? "." + partes[1].slice(0, 2) : "";
                    peso = parteInteira + parteDecimal;
                }
                
                // Limita tamanho total (ex: 999.99 = 6 caracteres)
                if (peso.length > 6) {
                    peso = peso.slice(0, 6);
                }
                
                return peso;
            }
            case "altura": {
                // Formato: 1.70 ou 1,70 (aceita até 2 casas decimais)
                // Remove tudo exceto números, vírgula e ponto
                let altura = valor.replace(/[^0-9.,]/g, "");
                
                // Converte vírgula para ponto
                altura = altura.replace(",", ".");
                
                // Se tem 2 ou mais dígitos sem ponto, insere ponto após o primeiro dígito
                // Ex: "15" -> "1.5", "158" -> "1.58", "175" -> "1.75"
                if (!altura.includes(".") && altura.length >= 2) {
                    const primeiro = altura[0];
                    const resto = altura.slice(1);
                    altura = primeiro + "." + resto;
                }
                
                // Permite apenas um ponto decimal
                const partes = altura.split(".");
                if (partes.length > 2) {
                    altura = partes[0] + "." + partes.slice(1).join("");
                }
                
                // Limita casas decimais a 2
                if (partes.length === 2 && partes[1].length > 2) {
                    altura = partes[0] + "." + partes[1].slice(0, 2);
                }
                
                // Limita tamanho total (ex: 3.00 = 4 caracteres)
                if (altura.length > 5) {
                    altura = altura.slice(0, 5);
                }
                
                // Após inserir ponto e limitar, garante que a parte inteira tenha apenas 1 dígito
                // Isso só executa depois da formatação inicial
                const partesFinais = altura.split(".");
                if (partesFinais.length >= 1 && partesFinais[0].length > 1 && partesFinais[0] !== "0") {
                    // Se ainda tem mais de 1 dígito na parte inteira, ajusta
                    const parteInteira = partesFinais[0].slice(0, 1);
                    const parteDecimal = partesFinais.length > 1 ? "." + partesFinais[1].slice(0, 2) : "";
                    altura = parteInteira + parteDecimal;
                }
                
                return altura;
            }
            case "frequenciaCardiaca": {
                // Apenas números inteiros (30-220 bpm)
                let fc = valor.replace(/[^0-9]/g, "");
                const fcNum = parseInt(fc);
                if (!isNaN(fcNum) && fcNum >= 30 && fcNum <= 220) return fc;
                
                // Se ainda está digitando números válidos, permite
                if (fc.length <= 3 && (fcNum === 0 || fcNum >= 30)) return fc;
                return fc.slice(0, 3);
            }
            case "saturacaoOxigenio": {
                // Apenas números inteiros (70-100%)
                let sat = valor.replace(/[^0-9]/g, "");
                const satNum = parseInt(sat);
                if (!isNaN(satNum) && satNum >= 70 && satNum <= 100) return sat;
                
                // Se ainda está digitando números válidos, permite
                if (sat.length <= 3 && (satNum === 0 || satNum >= 70)) return sat;
                return sat.slice(0, 3);
            }
            case "frequenciaRespiratoria": {
                // Apenas números inteiros (6-60 rpm)
                let fr = valor.replace(/[^0-9]/g, "");
                const frNum = parseInt(fr);
                if (!isNaN(frNum) && frNum >= 6 && frNum <= 60) return fr;
                
                // Se ainda está digitando números válidos, permite
                if (fr.length <= 2 && (frNum === 0 || frNum >= 6)) return fr;
                return fr.slice(0, 2);
            }
            default:
                return valor;
        }
    };

    const handleMaskedInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        if (
            [
                "pressaoArterial",
                "temperatura",
                "peso",
                "altura",
                "frequenciaCardiaca",
                "frequenciaRespiratoria",
                "saturacaoOxigenio",
            ].includes(name)
        ) {
            const valorMascarado = aplicarMascara(name, value);
            setFormData((prev) => ({ ...prev, [name]: valorMascarado }));
        } else {
            setFormData((prev) => ({ ...prev, [name]: value }));
        }
    };

    // Validação simples dos campos importantes
    const validarDados = (): string | null => {
        if (!formData.queixaPrincipal.trim()) return "A queixa principal é obrigatória.";

        if (formData.altura && (parseFloat(formData.altura) < 0.3 || parseFloat(formData.altura) > 3.0))
            return "Altura deve estar entre 0.30m e 3.00m.";

        if (formData.peso && (parseFloat(formData.peso) < 0.5 || parseFloat(formData.peso) > 999))
            return "Peso deve estar entre 0.5kg e 999kg.";

        if (formData.temperatura && (parseFloat(formData.temperatura) < 30 || parseFloat(formData.temperatura) > 50))
            return "Temperatura deve estar entre 30°C e 50°C.";

        if (formData.frequenciaCardiaca && (parseInt(formData.frequenciaCardiaca) < 30 || parseInt(formData.frequenciaCardiaca) > 220))
            return "Frequência cardíaca deve estar entre 30 e 220 bpm.";

        if (formData.saturacaoOxigenio && (parseInt(formData.saturacaoOxigenio) < 70 || parseInt(formData.saturacaoOxigenio) > 100))
            return "Saturação de oxigênio deve estar entre 70% e 100%.";

        if (formData.frequenciaRespiratoria && (parseInt(formData.frequenciaRespiratoria) < 6 || parseInt(formData.frequenciaRespiratoria) > 60))
            return "Frequência respiratória deve estar entre 6 e 60 irpm.";

        return null;
    };

    // ---------------------------------------------------------------------------
    // Finalização da triagem (POST /triagem)
    // ---------------------------------------------------------------------------
    const handleFinalizarTriagem = () => {
        if (!pacienteSelecionado) return;

        const erroValidacao = validarDados();
        if (erroValidacao) {
            alert(erroValidacao);
            return;
        }

        const dadosParaApi: CriarTriagemRequest = {
            pacienteId: pacienteSelecionado.pacienteId,
            agendamentoId: pacienteSelecionado.agendamentoId,
            motivoConsulta: formData.motivoConsulta as MotivoConsulta,
            queixaPrincipal: formData.queixaPrincipal,
            pressaoArterial: formData.pressaoArterial || undefined,
            temperatura: formData.temperatura ? parseFloat(formData.temperatura) : undefined,
            peso: formData.peso ? parseFloat(formData.peso) : undefined,
            altura: formData.altura ? parseFloat(formData.altura) : undefined,
            frequenciaCardiaca: formData.frequenciaCardiaca ? parseInt(formData.frequenciaCardiaca) : undefined,
            frequenciaRespiratoria: formData.frequenciaRespiratoria ? parseInt(formData.frequenciaRespiratoria) : undefined,
            saturacaoOxigenio: formData.saturacaoOxigenio ? parseInt(formData.saturacaoOxigenio) : undefined,
            observacoes: [
                formData.anamnese,
                formData.observacoes,
                (formData.linhasCuidado && (formData.linhasCuidado as string[]).length > 0)
                    ? `Linhas de Cuidado (MS): ${(formData.linhasCuidado as string[]).join(", ")}`
                    : undefined,
            ]
                .filter(Boolean)
                .join("\n")
                .trim() || undefined,
            alergias: formData.alergias || undefined,
            // Saúde da Mulher
            dumInformada: formData.dumInformada || undefined,
            gestanteInformado: formData.gestanteInformado || undefined,
            semanasGestacaoInformadas: formData.semanasGestacaoInformadas
                ? parseInt(formData.semanasGestacaoInformadas as any, 10)
                : undefined,
            // Data de referência (YYYY-MM-DD)
            dataReferencia: formData.dataReferencia,
        };

        // Processa alergias: separa por palavras e salva individualmente
        const processarAlergias = async (pacienteId: number, alergiasTexto: string) => {
            if (!alergiasTexto || alergiasTexto.trim() === "") return;
            
            try {
                // Separa por espaços, vírgulas, ponto-e-vírgula ou quebra de linha
                const palavrasAlergias = alergiasTexto
                    .toUpperCase()
                    .split(/[\s,;]+/)
                    .map(p => p.trim())
                    .filter(p => p.length > 0);
                
                if (palavrasAlergias.length === 0) return;
                
                // Busca paciente atual para obter alergias existentes
                const pacienteAtual = await apiService.get(`/pacientes/${pacienteId}`);
                const pacienteData = (pacienteAtual as any)?.data || pacienteAtual;
                
                // Obtém alergias existentes (se houver campo alergias no paciente)
                const alergiasExistentes: string[] = pacienteData?.alergias 
                    ? pacienteData.alergias.split(/[\s,;]+/).map((a: string) => a.trim().toUpperCase()).filter(Boolean)
                    : [];
                
                // Combina alergias existentes com novas, removendo duplicatas
                const todasAlergias = [...new Set([...alergiasExistentes, ...palavrasAlergias])];
                
                // Atualiza paciente com todas as alergias
                // ✅ CORREÇÃO: Garante que o ID está presente e não envia campos desnecessários
                await apiService.put(`/pacientes/${pacienteId}`, {
                    id: pacienteId, // Garante que o ID está presente
                    ...pacienteData,
                    alergias: todasAlergias.join(", "),
                });
            } catch (error) {
                // Erro silencioso - não bloqueia o salvamento da triagem
                console.warn("Não foi possível salvar alergias no histórico do paciente:", error);
            }
        };
        
        // react-query mutate: aceita callbacks pontuais
        (salvarTriagem as any)(dadosParaApi, {
            onSuccess: async () => {
                // Processa e salva alergias no histórico do paciente
                if (pacienteSelecionado?.pacienteId && formData.alergias) {
                    await processarAlergias(pacienteSelecionado.pacienteId, formData.alergias);
                }
                
                setPacienteSelecionado(null);
                setFormData({
                    ...initialState,
                    dataReferencia: selectedDate,
                });
            },
        });
    };

    // ---------------------------------------------------------------------------
    // Render — Fila aguardando triagem
    // ---------------------------------------------------------------------------
    if (!pacienteSelecionado) {
        return (
            <div className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Pacientes Aguardando Triagem</CardTitle>
                        <CardDescription>
                            Selecione uma data e um paciente para iniciar a triagem.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {/* Seletor de Data + Calendário com indicadores */}
                        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2">
                                    <Calendar className="h-5 w-5 text-blue-600" />
                                    <Label className="text-sm font-medium text-blue-800">
                                        Data para Triagem:
                                    </Label>
                                </div>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setShowCalendar(!showCalendar)}
                                    className="text-blue-600 border-blue-300 hover:bg-blue-50"
                                >
                                    {showCalendar ? (
                                        <>
                                            <ChevronUp className="h-4 w-4 mr-1" /> Ocultar Calendário
                                        </>
                                    ) : (
                                        <>
                                            <ChevronDown className="h-4 w-4 mr-1" /> Mostrar Calendário
                                        </>
                                    )}
                                </Button>
                            </div>

                            <div className="flex items-center gap-4 mb-3">
                                <Input
                                    type="date"
                                    value={selectedDate}
                                    onChange={(e) => setSelectedDate(e.target.value)}
                                    className="w-auto min-w-[150px] border-blue-300 focus:border-blue-500"
                                />
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                        setSelectedDate(new Date().toISOString().slice(0, 10))
                                    }
                                    className="text-blue-600 border-blue-300 hover:bg-blue-50"
                                >
                                    Hoje
                                </Button>

                                {/* Indicador da quantidade naquele dia */}
                                {(() => {
                                    const info = hasRecepcioandosPorData(selectedDate);
                                    return info.has ? (
                                        <div className="flex items-center gap-2 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                                            <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                                            {info.quantidade} recepcionado{info.quantidade !== 1 ? "s" : ""}
                                        </div>
                                    ) : null;
                                })()}
                            </div>

                            {showCalendar && (
                                <div className="mt-4">
                                    <CalendarWithIndicators
                                        selectedDate={selectedDate}
                                        onDateSelect={(date: string) => {
                                            setSelectedDate(date);
                                            setShowCalendar(false);
                                        }}
                                        datesWithIndicators={datasComPacientesRecepcionados}
                                        isLoading={isLoadingDatasRecepcionados}
                                        className="max-w-sm mx-auto"
                                    />
                                </div>
                            )}

                            <p className="text-xs text-blue-600 mt-2">
                                ℹ️ Datas destacadas têm pacientes com status{" "}
                                <strong>RECEPCIONADO</strong> aguardando triagem
                            </p>
                        </div>

                        {isLoadingAguardando && (
                            <div className="flex justify-center items-center p-6 text-gray-600">
                                <Loader2 className="mr-2 h-6 w-6 animate-spin" /> Carregando
                                pacientes...
                            </div>
                        )}

                        {!isLoadingAguardando && pacientesAguardando.length === 0 && (
                            <Alert>
                                <User className="h-4 w-4" />
                                <AlertDescription>
                                    Não há pacientes recepcionados aguardando triagem na data
                                    selecionada.
                                </AlertDescription>
                            </Alert>
                        )}

                        <div className="space-y-3">
                            {pacientesAguardando.map((paciente) => (
                                <Card
                                    key={paciente.agendamentoId}
                                    className="cursor-pointer hover:shadow-md transition-all hover:border-blue-300"
                                    onClick={() => setPacienteSelecionado(paciente)}
                                >
                                    <CardContent className="p-4 flex justify-between items-center">
                                        <div>
                                            <h4 className="font-semibold text-lg">
                                                {paciente.nomeCompleto}
                                            </h4>
                                            <p className="text-sm text-gray-600">
                                                Cartão SUS: {paciente.cartaoSus} | Idade:{" "}
                                                {paciente.idade} anos
                                            </p>
                                            <p className="text-xs text-blue-600 font-medium">
                                                ✅ Status: RECEPCIONADO
                                            </p>
                                        </div>
                                        <div className="text-right flex items-center gap-2 text-sm text-gray-600">
                                            <Clock className="h-4 w-4" />
                                            <span>Recepção: {paciente.horarioRecepcao}</span>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    // ---------------------------------------------------------------------------
    // Render — Formulário de Triagem do paciente selecionado
    // ---------------------------------------------------------------------------
    return (
        <div className="space-y-6">
            <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                    <strong>Paciente em Triagem:</strong>{" "}
                    {pacienteSelecionado.nomeCompleto}
                </AlertDescription>
            </Alert>

            {/* Informações de território e vacinas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="text-sm bg-gray-50 border border-gray-200 rounded-md p-3">
                    <div className="font-medium text-gray-700">Vínculo de Território</div>
                    <div className="text-gray-800">
                        {vinculoTerritorio || "Não informado"}
                    </div>
                </div>
                <div className="text-sm bg-gray-50 border border-gray-200 rounded-md p-3">
                    <div className="font-medium text-gray-700">Status de Vacinas</div>
                    <div
                        className={
                            statusVacinas === "ATRASADA"
                                ? "text-red-700"
                                : statusVacinas === "EM_DIA"
                                    ? "text-green-700"
                                    : "text-gray-700"
                        }
                    >
                        {statusVacinas === "EM_DIA"
                            ? "Em dia"
                            : statusVacinas === "ATRASADA"
                                ? "Atrasada / Fora do prazo"
                                : "Indisponível"}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Coluna 1 - Sinais Vitais */}
                <Card>
                    <CardHeader>
                        <CardTitle>🩺 Sinais Vitais</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="pressaoArterial">Pressão Arterial</Label>
                                <Input
                                    name="pressaoArterial"
                                    type="text"
                                    placeholder="120/80"
                                    value={formData.pressaoArterial}
                                    onChange={handleMaskedInputChange}
                                    inputMode="numeric"
                                />
                            </div>
                            <div>
                                <Label htmlFor="frequenciaCardiaca">Freq. Cardíaca (bpm)</Label>
                                <Input
                                    name="frequenciaCardiaca"
                                    type="text"
                                    placeholder="75"
                                    value={formData.frequenciaCardiaca}
                                    onChange={handleMaskedInputChange}
                                    inputMode="numeric"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="temperatura">Temperatura (°C)</Label>
                                <Input
                                    name="temperatura"
                                    type="text"
                                    placeholder="36.5"
                                    value={formData.temperatura}
                                    onChange={handleMaskedInputChange}
                                    inputMode="decimal"
                                />
                            </div>
                            <div>
                                <Label htmlFor="saturacaoOxigenio">Saturação O₂ (%)</Label>
                                <Input
                                    name="saturacaoOxigenio"
                                    type="text"
                                    placeholder="98"
                                    value={formData.saturacaoOxigenio}
                                    onChange={handleMaskedInputChange}
                                    inputMode="numeric"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="frequenciaRespiratoria">
                                    Freq. Respiratória (irpm)
                                </Label>
                                <Input
                                    name="frequenciaRespiratoria"
                                    type="text"
                                    placeholder="16"
                                    value={formData.frequenciaRespiratoria}
                                    onChange={handleMaskedInputChange}
                                    inputMode="numeric"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="peso">Peso (kg)</Label>
                                <Input
                                    name="peso"
                                    type="text"
                                    placeholder="70.5"
                                    value={formData.peso}
                                    onChange={handleMaskedInputChange}
                                    inputMode="decimal"
                                />
                            </div>
                            <div>
                                <Label htmlFor="altura">Altura (m)</Label>
                                <Input
                                    name="altura"
                                    type="text"
                                    placeholder="1.75"
                                    value={formData.altura}
                                    onChange={handleMaskedInputChange}
                                    inputMode="decimal"
                                />
                            </div>
                        </div>

                        {/* IMC */}
                        <div className="mt-2">
                            <Label>IMC</Label>
                            <div
                                className={`mt-1 text-sm inline-flex items-center gap-2 px-3 py-2 border rounded-md ${
                                    imcInfo
                                        ? imcInfo.cor
                                        : "text-gray-700 bg-gray-50 border-gray-200"
                                }`}
                            >
                                <span>{imcValor != null ? `${imcValor}` : "—"}</span>
                                <span className="text-xs">
                  {imcInfo ? `(${imcInfo.rotulo})` : "(informe peso e altura)"}
                </span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Coluna 2 */}
                <div className="space-y-6">
                    {/* Motivo de Consulta */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Motivo de Consulta</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <Label htmlFor="motivoConsulta">Motivo de Consulta *</Label>
                                <Select
                                    value={formData.motivoConsulta as string}
                                    onValueChange={(value) =>
                                        handleSelectChange("motivoConsulta", value)
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecione o motivo" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {MOTIVOS_CONSULTA.map((op) => (
                                            <SelectItem key={op.value} value={op.value}>
                                                {op.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Queixa Principal */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Queixa Principal</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <Label htmlFor="queixaPrincipal">Queixa Principal *</Label>
                                <Textarea
                                    name="queixaPrincipal"
                                    placeholder="Descreva a queixa principal do paciente..."
                                    value={formData.queixaPrincipal}
                                    onChange={handleInputChange}
                                    rows={4}
                                />
                            </div>
                            <div>
                                <Label htmlFor="alergias">Alergias Conhecidas</Label>
                                <Textarea
                                    name="alergias"
                                    placeholder="Liste alergias conhecidas..."
                                    value={formData.alergias}
                                    onChange={handleInputChange}
                                    rows={2}
                                />
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Informações adicionais */}
            <Card>
                <CardHeader>
                    <CardTitle>📝 Informações Adicionais</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* Saúde da Mulher */}
                    <div className="space-y-2">
                        <Label>Saúde da Mulher</Label>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <div>
                                <Label htmlFor="dumInformada">
                                    Data da Última Menstruação (DUM)
                                </Label>
                                <Input
                                    type="date"
                                    name="dumInformada"
                                    value={formData.dumInformada}
                                    onChange={handleInputChange}
                                />
                            </div>
                            <div className="flex items-end gap-2">
                                <input
                                    id="gestanteInformado"
                                    type="checkbox"
                                    checked={!!formData.gestanteInformado}
                                    onChange={(e) =>
                                        setFormData((prev) => ({
                                            ...prev,
                                            gestanteInformado: e.target.checked,
                                            semanasGestacaoInformadas: e.target.checked
                                                ? prev.semanasGestacaoInformadas
                                                : "",
                                        }))
                                    }
                                />
                                <Label htmlFor="gestanteInformado">Gestante</Label>
                            </div>
                            <div>
                                <Label htmlFor="semanasGestacaoInformadas">
                                    Semanas de Gestação
                                </Label>
                                <Select
                                    value={(formData.semanasGestacaoInformadas || "").toString()}
                                    onValueChange={(value) =>
                                        handleSelectChange("semanasGestacaoInformadas", value)
                                    }
                                    disabled={!formData.gestanteInformado}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecione..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {SEMANAS_GESTACAO.map((op) => (
                                            <SelectItem key={op.value} value={op.value.toString()}>
                                                {op.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>

                    {/* Linhas de Cuidado */}
                    <div>
                        <div className="flex items-center justify-between">
                            <Label>Linhas de Cuidado (Ministério da Saúde)</Label>
                            <a
                                href="https://linhasdecuidado.saude.gov.br/portal/todas-linhas"
                                target="_blank"
                                rel="noreferrer"
                                className="text-blue-600 text-xs hover:underline"
                            >
                                Ver referência oficial
                            </a>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 mt-2">
                            {CONDICOES_LINHAS_CUIDADO.map((item) => (
                                <label
                                    key={item}
                                    className="flex items-start gap-2 text-sm bg-gray-50 border border-gray-200 rounded-md p-2"
                                >
                                    <input
                                        type="checkbox"
                                        className="mt-1"
                                        checked={(formData.linhasCuidado as string[]).includes(item)}
                                        onChange={() => toggleLinhaCuidado(item)}
                                    />
                                    <span>{item}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    <div>
                        <Label htmlFor="observacoes">Observações</Label>
                        <Textarea
                            name="observacoes"
                            placeholder="Observações adicionais..."
                            value={formData.observacoes}
                            onChange={handleInputChange}
                            rows={3}
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Ações */}
            <div className="flex justify-between">
                <Button
                    variant="outline"
                    onClick={() => {
                        setPacienteSelecionado(null);
                        setFormData({
                            ...initialState,
                            dataReferencia: selectedDate,
                        });
                    }}
                >
                    ← Voltar à Fila
                </Button>
                <Button
                    onClick={handleFinalizarTriagem}
                    disabled={isSaving || !formData.queixaPrincipal.trim()}
                    className="bg-green-600 hover:bg-green-700"
                >
                    {isSaving ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Salvando...
                        </>
                    ) : (
                        "Finalizar Triagem"
                    )}
                </Button>
            </div>
        </div>
    );
};

// (Opcional) export default para permitir import default ou nomeado
export default TriagemPaciente;
