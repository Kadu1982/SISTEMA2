import React, { useState, useEffect, useMemo, useRef } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
    User, Calendar, Phone, Mail, MapPin, FileText, ClipboardCheck,
    AlertCircle, CheckCircle, Clock, Printer
} from 'lucide-react';

// UI Components
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// Histórico de agendamentos (lista com filtros) — reaproveita endpoint existente
// @ts-ignore: import tardio será resolvido pelo bundler
import HistoricoAgendamentosPaciente from '@/components/recepcao/agendamento/HistoricoAgendamentosPaciente';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/components/ui/use-toast';

// Tipos e Hooks
import { AgendamentoDTO, formatarTipoAtendimento } from '@/types/Agendamento';
import { useAtendimentos } from '@/hooks/useAtendimentos';

// ⚠️ Ajuste este caminho se seu serviço estiver em outra pasta:
import { atendimentoService } from '@/services/AtendimentoService';

import apiService from '@/services/apiService';

// ✅ Formulário de atendimento e Documentos
import { AtendimentoForm, type AtendimentoFormData } from '@/components/atendimento/AtendimentoForm';
import DocumentosMedicos from '@/components/atendimento/DocumentosMedicos';

// ✅ Serviços de documentos (para gerar PDFs no pop-up)
import { gerarAtestado, gerarReceituario, type AtestadoPayload, type ReceituarioPayload } from '@/services/documentosService';

// ------------------------------------------------------------
// Helpers locais para abrir PDFs (sem criar arquivo novo)
function openPdfArrayBuffer(data: ArrayBuffer, filename = 'documento.pdf') {
    // evita warning de parâmetro não usado quando o download automático está comentado
    void filename;
    try {
        const blob = new Blob([data], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        window.open(url, '_blank', 'noopener,noreferrer');
        // Para forçar download automático, descomente:
        // const a = document.createElement('a');
        // a.href = url; a.download = filename; a.click();
        // setTimeout(() => URL.revokeObjectURL(url), 60_000);
    } catch (e) {
        console.error('Falha ao abrir PDF (ArrayBuffer):', e);
    }
}
function openPdfBase64(b64: string, filename = 'documento.pdf') {
    try {
        const bin = atob(b64);
        const bytes = new Uint8Array(bin.length);
        for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
        openPdfArrayBuffer(bytes.buffer, filename);
    } catch (e) {
        console.error('Falha ao abrir PDF (Base64):', e);
    }
}
async function baixarFichaPdf(atendimentoId: string) {
    // 1) tenta usar o serviço (se existir)
    try {
        // @ts-ignore — alguns projetos têm este método
        if (typeof atendimentoService?.baixarPdf === 'function') {
            const blob: Blob = await atendimentoService.baixarPdf(atendimentoId);
            const buf = await blob.arrayBuffer();
            openPdfArrayBuffer(buf, `FichaAtendimento_${atendimentoId}.pdf`);
            return;
        }
    } catch (e) {
        console.warn('Falha no AtendimentoService.baixarPdf, usando fallback:', e);
    }
    // 2) fallback direto no endpoint
    const resp = await apiService.get<ArrayBuffer>(`/atendimentos/${atendimentoId}/pdf`, { responseType: 'arraybuffer' });
    openPdfArrayBuffer(resp.data, `FichaAtendimento_${atendimentoId}.pdf`);
}

// ------------------------------------------------------------
// Helpers de payload (corrigem o 400 do backend)
function sanitizePayloadForApi<T extends Record<string, any>>(obj: T): T {
    // remove undefined/null e strings só com espaços, para não quebrar validação do backend
    const clean: any = {};
    Object.keys(obj).forEach((k) => {
        const v = (obj as any)[k];
        if (v === undefined || v === null) return;
        if (typeof v === 'string' && v.trim() === '') return;
        clean[k] = v;
    });
    return clean;
}
function getProfissionalIdFromAgendamento(ag: any): number | undefined {
    const cand =
        ag?.profissionalId ??
        ag?.profissional?.id ??
        ag?.idProfissional ??
        ag?.profissional?.profissionalId;
    const n = Number(cand);
    return Number.isFinite(n) ? n : undefined;
}

// ------------------------------------------------------------
// Modal leve inline para opções de impressão (reutilizável)
type PrintOption = {
    key: 'ATESTADO' | 'RECEITUARIO' | 'FICHA';
    label: string;
    checked: boolean;
    disabled?: boolean;
    hint?: string;
    onPrint: () => Promise<void>;
};
const PrintOptionsModal: React.FC<{
    open: boolean;
    title?: string;
    options: PrintOption[];
    onClose: () => void;
}> = ({ open, title = 'Impressões ao finalizar', options, onClose }) => {
    const [items, setItems] = useState<PrintOption[]>(options);
    useEffect(() => setItems(options), [open, options]);
    if (!open) return null;
    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50">
            <div className="w-full max-w-lg rounded-2xl bg-white text-zinc-900 shadow-xl p-6">
                <h2 className="text-xl font-semibold mb-4">{title}</h2>
                <div className="space-y-3 mb-6">
                    {items.map((it, idx) => (
                        <label key={it.key} className={`flex items-start gap-3 ${it.disabled ? 'opacity-60' : ''}`}>
                            <input
                                type="checkbox"
                                className="h-4 w-4 mt-1"
                                checked={it.checked}
                                disabled={it.disabled}
                                onChange={(e) => {
                                    const next = [...items];
                                    next[idx] = { ...next[idx], checked: e.target.checked };
                                    setItems(next);
                                }}
                            />
                            <div>
                                <div className="font-medium">{it.label}</div>
                                {it.hint && <div className="text-xs text-zinc-500">{it.hint}</div>}
                            </div>
                        </label>
                    ))}
                </div>
                <div className="flex items-center justify-end gap-2">
                    <Button variant="outline" onClick={onClose}>Cancelar</Button>
                    <Button
                        className="bg-emerald-600 hover:bg-emerald-500"
                        onClick={async () => {
                            for (const it of items) {
                                if (it.checked && !it.disabled) {
                                    try { await it.onPrint(); } catch (e) { console.error(`Falha ao imprimir ${it.label}:`, e); }
                                }
                            }
                            onClose();
                        }}
                    >
                        Imprimir selecionados
                    </Button>
                </div>
            </div>
        </div>
    );
};

// ------------------------------------------------------------
// Tipagens locais (iguais às que você já usa)
interface PacienteDetalhesProps {
    pacienteId: string;
    agendamento: AgendamentoDTO;
    onClose: () => void;
}
interface Paciente {
    id: number;
    nomeCompleto: string;
    dataNascimento?: string;
    cpf?: string;
    cartaoSus?: string;
    telefone?: string;
    email?: string;
    endereco?: {
        logradouro?: string; numero?: string; bairro?: string;
        cidade?: string; uf?: string; cep?: string;
    };
}
interface Exame {
    id: string; nome: string; tipo: string;
    dataRequisicao?: string; dataRealizacao?: string;
    status: 'PENDENTE' | 'REALIZADO' | 'CANCELADO';
    resultado?: string;
}

// ------------------------------------------------------------
// Componente principal
export const PacienteDetalhes: React.FC<PacienteDetalhesProps> = ({ pacienteId, agendamento, onClose }) => {
    const { toast } = useToast();

    const [paciente, setPaciente] = useState<Paciente | null>(null);
    const [exames, setExames] = useState<Exame[]>([]);
    const [loading, setLoading] = useState({ paciente: true, exames: true });
    const [error, setError] = useState({ paciente: false, exames: false });

    // ✅ CONTROLES DO ATENDIMENTO AMBULATORIAL
    const [emAtendimento, setEmAtendimento] = useState(false);
    const [salvandoAtendimento, setSalvandoAtendimento] = useState(false);
    const [atendimentoId, setAtendimentoId] = useState<string>('');

    // ✅ PRINT MODAL
    const [printOpen, setPrintOpen] = useState(false);

    // ✅ REF para ler preferências de Documentos (checkboxes e payloads)
    const docsRef = useRef<any>(null);

    // ==========================================================
    // Fetch patient data
    useEffect(() => {
        const fetchPaciente = async () => {
            if (!pacienteId) {
                setError(prev => ({ ...prev, paciente: true }));
                setLoading(prev => ({ ...prev, paciente: false }));
                return;
            }
            try {
                const { data } = await apiService.get(`/pacientes/${pacienteId}`);
                setPaciente(data);
                setError(prev => ({ ...prev, paciente: false }));
            } catch (err: any) {
                console.error('Erro ao buscar dados do paciente:', err);
                setError(prev => ({ ...prev, paciente: true }));
            } finally {
                setLoading(prev => ({ ...prev, paciente: false }));
            }
        };
        fetchPaciente();
    }, [pacienteId]);

    // Fetch exams data
    useEffect(() => {
        const fetchExames = async () => {
            if (!pacienteId) {
                setError(prev => ({ ...prev, exames: true }));
                setLoading(prev => ({ ...prev, exames: false }));
                return;
            }
            try {
                const { data } = await apiService.get(`/exames/paciente/${pacienteId}`);
                setExames(data || []);
                setError(prev => ({ ...prev, exames: false }));
            } catch (err: any) {
                console.error('Erro ao buscar exames do paciente:', err);
                setError(prev => ({ ...prev, exames: true }));
            } finally {
                setLoading(prev => ({ ...prev, exames: false }));
            }
        };
        fetchExames();
    }, [pacienteId]);

    // Histórico de atendimentos
    const { data: atendimentos, isLoading: loadingAtendimentos, isError: errorAtendimentos, error: errHist } = useAtendimentos(pacienteId);

    // Utils (datas opcionais corrigidas)
    const formatarData = (dataString?: string) => {
        if (!dataString) return '-';
        try { return format(new Date(dataString), 'dd/MM/yyyy', { locale: ptBR }); } catch { return dataString; }
    };
    const formatarDataHora = (dataString?: string) => {
        if (!dataString) return '-';
        try { return format(new Date(dataString), 'dd/MM/yyyy HH:mm', { locale: ptBR }); } catch { return dataString; }
    };

    const getStatusExameBadge = (status: string) => {
        switch (status) {
            case 'PENDENTE':  return <Badge variant="outline" className="bg-yellow-100 text-yellow-800">Pendente</Badge>;
            case 'REALIZADO': return <Badge variant="outline" className="bg-green-100  text-green-800">Realizado</Badge>;
            case 'CANCELADO': return <Badge variant="outline" className="bg-red-100    text-red-800">Cancelado</Badge>;
            default:          return <Badge variant="outline">{status}</Badge>;
        }
    };

    // ==========================================================
    // Iniciar Atendimento → muda status e abre a etapa de formulário + documentos
    const iniciarAtendimento = async () => {
        try {
            if (!pacienteId) {
                toast({ title: "Erro", description: "ID do paciente inválido.", variant: "destructive" });
                return;
            }
            await apiService.patch(`/agendamentos/${agendamento.id}/status`, { status: 'EM_ATENDIMENTO' });
            setEmAtendimento(true);
            toast({ title: "Atendimento iniciado", description: "Você pode registrar o atendimento e gerar os documentos." });
            // NÃO fechamos o modal aqui — mantemos aberto para preencher o atendimento
        } catch (statusError: any) {
            console.error('Erro ao atualizar status do agendamento:', statusError);
            const code = statusError?.response?.status;
            if (code === 403) toast({ title: "Permissão negada", description: "Sem permissão para iniciar este atendimento.", variant: "destructive" });
            else if (code === 404) toast({ title: "Agendamento não encontrado", description: "Verifique a seleção e tente novamente.", variant: "destructive" });
            else toast({ title: "Erro ao iniciar", description: "Não foi possível iniciar o atendimento.", variant: "destructive" });
        }
    };

    // ==========================================================
    // Salvar Atendimento (Ambulatorial) → abre pop-up de impressão
    const onSaveAtendimento = async (data: AtendimentoFormData) => {
        setSalvandoAtendimento(true);
        try {
            // 1) profissionalId: pega do agendamento, cai pro que vier do formulário
            const profissionalFromAg = getProfissionalIdFromAgendamento(agendamento);
            const profissionalFromForm =
                data.profissionalId !== undefined ? Number(data.profissionalId) : undefined;
            const profissionalIdFinal = Number.isFinite(profissionalFromAg!)
                ? Number(profissionalFromAg)
                : Number.isFinite(profissionalFromForm!)
                    ? Number(profissionalFromForm)
                    : undefined;

            if (!profissionalIdFinal) {
                toast({
                    title: "Profissional obrigatório",
                    description:
                        "Não foi possível identificar o profissional do atendimento. Abra o agendamento com um profissional válido ou selecione no formulário.",
                    variant: "destructive",
                });
                setSalvandoAtendimento(false);
                return;
            }

            // 2) pacienteId numérico e campos normalizados
            const payloadBase: any = {
                ...data,
                pacienteId: Number(data.pacienteId?.toString?.() || pacienteId),
                profissionalId: profissionalIdFinal,
                cid10: data.cid10 ? String(data.cid10).trim() : undefined, // se obrigatório, evita vazio
            };
            const payload = sanitizePayloadForApi(payloadBase);

            // 3) dispara para o serviço
            const novo = await atendimentoService.salvar(payload);
            if (!novo?.id) throw new Error('ID do atendimento não retornado');

            setAtendimentoId(String(novo.id));

            // 4) abre o pop-up de impressão
            setPrintOpen(true);
            toast({ title: "Atendimento salvo", description: "Selecione os documentos para imprimir." });
        } catch (e: any) {
            console.error('Erro ao salvar atendimento:', e);
            const msg = e?.response?.data?.message || e?.message || 'Não foi possível salvar o atendimento.';
            toast({ title: "Erro ao salvar", description: msg, variant: "destructive" });
        } finally {
            setSalvandoAtendimento(false);
        }
    };

    // ==========================================================
    // Monta as opções do pop-up lendo os checkboxes/payloads de Documentos
    const buildPrintOptions = useMemo<PrintOption[]>(() => {
        const prefs = docsRef.current?.getPrintPreferences?.(); // seguro mesmo se não existir
        return [
            {
                key: 'ATESTADO',
                label: 'Atestado Médico',
                checked: !!prefs?.atestadoChecked,
                disabled: !prefs?.atestadoChecked || !prefs?.atestadoPayload,
                hint: !prefs?.atestadoChecked ? "Marque 'Imprimir Atestado' na aba Documentos" :
                    !prefs?.atestadoPayload ? "Preencha os campos do Atestado" : undefined,
                onPrint: async () => {
                    const p: AtestadoPayload | undefined = prefs?.atestadoPayload;
                    if (!p) return;
                    const resp = await gerarAtestado(p);
                    if (!resp?.success || !resp?.pdfBase64) throw new Error(resp?.message || 'Falha ao gerar atestado');
                    openPdfBase64(resp.pdfBase64, 'Atestado.pdf');
                },
            },
            {
                key: 'RECEITUARIO',
                label: 'Receituário Médico',
                checked: !!prefs?.receituarioChecked,
                disabled: !prefs?.receituarioChecked || !prefs?.receituarioPayload,
                hint: !prefs?.receituarioChecked ? "Marque 'Imprimir Receituário' na aba Documentos" :
                    !prefs?.receituarioPayload ? "Adicione ao menos um item na prescrição" : undefined,
                onPrint: async () => {
                    const p: ReceituarioPayload | undefined = prefs?.receituarioPayload;
                    if (!p) return;
                    const resp = await gerarReceituario(p);
                    if (!resp?.success || !resp?.pdfBase64) throw new Error(resp?.message || 'Falha ao gerar receituário');
                    openPdfBase64(resp.pdfBase64, 'Receituario.pdf');
                },
            },
            {
                key: 'FICHA',
                label: 'Ficha de Atendimento',
                checked: true,
                onPrint: async () => {
                    if (!atendimentoId) throw new Error('ID do atendimento ausente');
                    await baixarFichaPdf(atendimentoId);
                },
            },
        ];
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [atendimentoId]); // depende do id salvo; prefs são lidos sob demanda

    // ==========================================================
    // Render
    return (
        <div className="space-y-6">
            {/* Dados do Paciente */}
            <Card>
                <CardHeader className="pb-2">
                    <CardTitle>Dados do Paciente</CardTitle>
                </CardHeader>
                <CardContent>
                    {loading.paciente ? (
                        <div className="flex items-center justify-center p-4">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                            <span className="ml-3">Carregando dados do paciente...</span>
                        </div>
                    ) : error.paciente ? (
                        <Alert className="bg-red-50 border-red-200">
                            <AlertCircle className="h-4 w-4 text-red-600" />
                            <AlertDescription className="text-red-600">
                                Erro ao carregar dados do paciente. Verifique se o ID é válido.
                            </AlertDescription>
                        </Alert>
                    ) : paciente ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <User className="h-4 w-4 text-blue-600" />
                                    <span className="font-semibold">Nome:</span> {paciente.nomeCompleto}
                                </div>
                                <div className="flex items-center gap-2">
                                    <Calendar className="h-4 w-4 text-blue-600" />
                                    <span className="font-semibold">Nascimento:</span> {formatarData(paciente.dataNascimento)}
                                </div>
                                <div className="flex items-center gap-2">
                                    <FileText className="h-4 w-4 text-blue-600" />
                                    <span className="font-semibold">CPF:</span> {paciente.cpf || '-'}
                                </div>
                                <div className="flex items-center gap-2">
                                    <FileText className="h-4 w-4 text-blue-600" />
                                    <span className="font-semibold">Cartão SUS:</span> {paciente.cartaoSus || '-'}
                                </div>
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <Phone className="h-4 w-4 text-blue-600" />
                                    <span className="font-semibold">Telefone:</span> {paciente.telefone || '-'}
                                </div>
                                <div className="flex items-center gap-2">
                                    <Mail className="h-4 w-4 text-blue-600" />
                                    <span className="font-semibold">Email:</span> {paciente.email || '-'}
                                </div>
                                <div className="flex items-center gap-2">
                                    <MapPin className="h-4 w-4 text-blue-600" />
                                    <span className="font-semibold">Endereço:</span> {paciente.endereco
                                    ? `${paciente.endereco.logradouro || ''}${paciente.endereco.numero ? `, ${paciente.endereco.numero}` : ''} - ${paciente.endereco.bairro || ''}, ${paciente.endereco.cidade || ''}/${paciente.endereco.uf || ''}`
                                    : '-'}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-4">Nenhum dado encontrado para o paciente.</div>
                    )}
                </CardContent>
            </Card>

            {/* Histórico e Exames */}
            <Tabs defaultValue="atendimentos">
                <TabsList className="grid grid-cols-3">
                    <TabsTrigger value="atendimentos">Histórico de Atendimentos</TabsTrigger>
                    <TabsTrigger value="agendamentos">Histórico de Agendamentos</TabsTrigger>
                    <TabsTrigger value="exames">Exames</TabsTrigger>
                </TabsList>

                <TabsContent value="atendimentos">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle>Histórico de Atendimentos</CardTitle>
                            <CardDescription>Atendimentos anteriores do paciente</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {loadingAtendimentos ? (
                                <div className="flex items-center justify-center p-4">
                                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                                    <span className="ml-3">Carregando histórico de atendimentos...</span>
                                </div>
                            ) : errorAtendimentos ? (
                                <Alert className="bg-red-50 border-red-200">
                                    <AlertCircle className="h-4 w-4 text-red-600" />
                                    <AlertDescription className="text-red-600">
                                        {errHist?.message || 'Erro ao carregar histórico.'}
                                    </AlertDescription>
                                </Alert>
                            ) : atendimentos && atendimentos.length > 0 ? (
                                <div className="rounded-md border">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Data</TableHead>
                                                <TableHead>CID</TableHead>
                                                <TableHead>Diagnóstico</TableHead>
                                                <TableHead>Prescrição</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {atendimentos.map((a) => (
                                                <TableRow key={a.id}>
                                                    <TableCell>{formatarDataHora(a.dataHora)}</TableCell>
                                                    <TableCell>{a.cid10}</TableCell>
                                                    <TableCell>{a.diagnostico}</TableCell>
                                                    <TableCell>{a.prescricao}</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            ) : (
                                <div className="text-center py-4">Nenhum atendimento anterior encontrado.</div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="exames">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle>Exames</CardTitle>
                            <CardDescription>Exames solicitados e resultados</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {loading.exames ? (
                                <div className="flex items-center justify-center p-4">
                                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                                    <span className="ml-3">Carregando exames...</span>
                                </div>
                            ) : error.exames ? (
                                <Alert className="bg-red-50 border-red-200">
                                    <AlertCircle className="h-4 w-4 text-red-600" />
                                    <AlertDescription className="text-red-600">
                                        Erro ao carregar exames do paciente.
                                    </AlertDescription>
                                </Alert>
                            ) : exames.length > 0 ? (
                                <div className="rounded-md border">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Exame</TableHead>
                                                <TableHead>Tipo</TableHead>
                                                <TableHead>Data Requisição</TableHead>
                                                <TableHead>Data Realização</TableHead>
                                                <TableHead>Status</TableHead>
                                                <TableHead>Resultado</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {exames.map((exame) => (
                                                <TableRow key={exame.id}>
                                                    <TableCell>{exame.nome}</TableCell>
                                                    <TableCell>{exame.tipo}</TableCell>
                                                    <TableCell>{formatarData(exame.dataRequisicao)}</TableCell>
                                                    <TableCell>{formatarData(exame.dataRealizacao)}</TableCell>
                                                    <TableCell>{getStatusExameBadge(exame.status)}</TableCell>
                                                    <TableCell>{(exame.status === 'REALIZADO' && exame.resultado) ? (
                                                        <Button variant="outline" size="sm">
                                                            <FileText className="mr-2 h-4 w-4" />
                                                            Ver Resultado
                                                        </Button>
                                                    ) : '-'}</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            ) : (
                                <div className="text-center py-4">Nenhum exame encontrado.</div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* ✅ Novo: Histórico de Agendamentos com filtros (não polui visual, fica em aba própria) */
                <TabsContent value="agendamentos">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle>Histórico de Agendamentos</CardTitle>
                            <CardDescription>Agendamentos do paciente, com filtros de período/status/busca</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {/* pacienteId aqui é string; convertemos para number quando possível */}
                            {pacienteId ? (
                                <HistoricoAgendamentosPaciente pacienteId={Number(pacienteId)} />
                            ) : (
                                <div className="text-center py-4">Paciente não informado.</div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            {/* Agendamento Atual */}
            <Card>
                <CardHeader className="pb-2">
                    <CardTitle>Agendamento Atual</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4 text-blue-600" />
                                <span className="font-semibold">Data/Hora:</span> {formatarDataHora(agendamento.dataHora)}
                            </div>
                            <div className="flex items-center gap-2">
                                <FileText className="h-4 w-4 text-blue-600" />
                                <span className="font-semibold">Tipo:</span> {formatarTipoAtendimento(agendamento.tipo)}
                            </div>
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <User className="h-4 w-4 text-blue-600" />
                                <span className="font-semibold">Profissional:</span> {agendamento.profissionalNome || '-'}
                            </div>
                            <div className="flex items-center gap-2">
                                <ClipboardCheck className="h-4 w-4 text-blue-600" />
                                <span className="font-semibold">Especialidade:</span>
                                {agendamento.especialidade
                                    ? agendamento.especialidade.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
                                    : (agendamento.examesSelecionados?.length ? agendamento.examesSelecionados.join(', ') : '-')}
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Ações principais */}
            {!emAtendimento ? (
                <div className="flex justify-end gap-4">
                    <Button variant="outline" onClick={onClose}>Fechar</Button>
                    <Button onClick={iniciarAtendimento} disabled={!pacienteId || error.paciente || loading.paciente}>
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Iniciar Atendimento
                    </Button>
                </div>
            ) : (
                <>
                    {/* ===== ETAPA DE ATENDIMENTO (FORM + DOCUMENTOS) ===== */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <StethoscopeIcon />
                                Atendimento em andamento
                            </CardTitle>
                            <CardDescription>Registre o atendimento e selecione os documentos para impressão.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-8">
                            {/* Formulário clínico */}
                            <AtendimentoForm
                                title=""
                                description=""
                                isLoading={salvandoAtendimento}
                                onSave={onSaveAtendimento}
                                onCancel={() => setEmAtendimento(false)}
                                initialData={{
                                    pacienteId: pacienteId,
                                    queixaPrincipal: '',
                                    observacoes: ''
                                }}
                            />

                            {/* Documentos Médicos (com checkboxes internos) */}
                            <div className="border rounded-lg">
                                <div className="p-4 border-b font-medium flex items-center gap-2">
                                    <Printer className="h-4 w-4" />
                                    Documentos do Atendimento
                                </div>
                                <div className="p-4">
                                    <DocumentosMedicos
                                        ref={docsRef as any}
                                        pacienteId={pacienteId}
                                        atendimentoId={atendimentoId || '0'}
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="flex justify-end gap-3">
                        <Button variant="outline" onClick={() => setEmAtendimento(false)}>Cancelar</Button>
                        <Button
                            className="bg-emerald-600 hover:bg-emerald-500"
                            onClick={() => {
                                // o SALVAR do formulário dispara o fluxo e abrirá este pop-up
                                toast({ title: "Dica", description: "Use o botão SALVAR do formulário para concluir e imprimir." });
                            }}
                        >
                            Concluir / Imprimir
                        </Button>
                    </div>
                </>
            )}

            {/* ✅ Pop-up de Impressões */}
            <PrintOptionsModal
                open={printOpen}
                onClose={() => setPrintOpen(false)}
                title="Impressões ao finalizar o atendimento"
                options={buildPrintOptions}
            />
        </div>
    );
};

// Ícone pequeno para título (evita importar outro pacote)
const StethoscopeIcon: React.FC = () => (
    <svg viewBox="0 0 24 24" className="h-5 w-5 text-blue-600" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M6 3v6a6 6 0 0 0 12 0V3" />
        <path d="M3 3h6" />
        <path d="M15 3h6" />
        <circle cx="18" cy="17" r="3" />
        <path d="M18 20v1a3 3 0 0 1-3 3H9a3 3 0 0 1-3-3v-5" />
    </svg>
);

export default PacienteDetalhes;
