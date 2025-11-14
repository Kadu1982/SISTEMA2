// frontend/src/pages/upa/AtendimentoUPAPage.tsx
// Página completa para ATENDIMENTO médico na UPA (sem agendamento).
// Versão em página completa do modal AtendimentoMedicoModal.

import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, FileText, ClipboardList, Stethoscope, Pill, FilePlus, FileCheck2, Printer, Activity } from 'lucide-react';
import CidBusca from '@/components/atendimento/CidBusca';
import PrescricaoMedicamentoForm from '@/components/prescricao/PrescricaoMedicamentoForm';
import MotivoDesfechoSelect from '@/components/atendimento/MotivoDesfechoSelect';
import { Cid } from '@/types/Cid';
import { PrescricaoMedicamento } from '@/types/prescricao';
import {
    salvarAtendimentoUPA,
    liberarAtendimentoUPA,
    observacaoAtendimentoUPA,
    encaminhamentoAtendimentoUPA,
    reavaliacaoAtendimentoUPA,
} from '@/services/upaService';
import {
    gerarAtestado,
    gerarReceituario,
    type AtestadoPayload,
    type ReceituarioPayload,
} from '@/services/documentosService';
import { useToast } from '@/hooks/use-toast';

// Helper local para abrir PDFs base64 em nova aba
function openPdfBase64(b64: string, filename = 'documento.pdf') {
    try {
        const bin = atob(b64);
        const bytes = new Uint8Array(bin.length);
        for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
        const blob = new Blob([bytes], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        window.open(url, '_blank', 'noopener,noreferrer');
    } catch (e) {
        console.error('Falha ao abrir PDF base64:', e);
    }
}

const AtendimentoUPAPage: React.FC = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { toast } = useToast();

    // Parâmetros da URL
    const pacienteId = parseInt(searchParams.get('pacienteId') || '0');
    const ocorrenciaId = parseInt(searchParams.get('ocorrenciaId') || '0');
    const triagemId = parseInt(searchParams.get('triagemId') || '0');
    const pacienteNome = searchParams.get('pacienteNome') || '';

    // Validação de parâmetros
    useEffect(() => {
        if (!pacienteId || !ocorrenciaId || !triagemId) {
            toast({
                title: 'Erro',
                description: 'Parâmetros inválidos. Redirecionando...',
                variant: 'destructive',
            });
            navigate('/upa');
        }
    }, [pacienteId, ocorrenciaId, triagemId, navigate, toast]);

    const [cid10, setCid10] = useState('');
    const [cidSelecionado, setCidSelecionado] = useState<Cid | null>(null);
    const [anamnese, setAnamnese] = useState('');
    const [exameFisico, setExameFisico] = useState('');
    const [hipoteseDiagnostica, setHipoteseDiagnostica] = useState('');
    const [conduta, setConduta] = useState('');
    const [prescricao, setPrescricao] = useState('');
    const [observacoes, setObservacoes] = useState('');
    const [retorno, setRetorno] = useState('');
    const [salvando, setSalvando] = useState(false);
    const [atendimentoId, setAtendimentoId] = useState<number | null>(null);

    // Prescrições de medicamentos
    const [prescricoesMedicamentos, setPrescricoesMedicamentos] = useState<PrescricaoMedicamento[]>([]);
    
    // Motivo de desfecho e setores
    const [motivoDesfecho, setMotivoDesfecho] = useState('01');
    const [especialidadeEncaminhamento, setEspecialidadeEncaminhamento] = useState('');
    const [setorEncaminhamento, setSetorEncaminhamento] = useState('');
    const [tiposCuidadosEnfermagem, setTiposCuidadosEnfermagem] = useState<string[]>([]);
    const [orientacoes, setOrientacoes] = useState('');

    // Checkboxes de impressão
    const [printAtestado, setPrintAtestado] = useState(false);
    const [printReceita, setPrintReceita] = useState(false);

    // Handler para quando um CID é selecionado
    const handleCidSelecionado = (cid: Cid | null) => {
        setCidSelecionado(cid);
        if (cid) {
            setCid10(cid.codigo);
            if (!hipoteseDiagnostica.trim()) {
                setHipoteseDiagnostica(cid.descricao);
            }
        } else {
            setCid10('');
        }
    };

    // Handlers para Motivo de Desfecho
    const handleMotivoChange = useCallback((value: string) => {
        setMotivoDesfecho(value);
        if (value !== "03") {
            setEspecialidadeEncaminhamento("");
        }
        if (value !== "02" && value !== "04") {
            setSetorEncaminhamento("");
            setTiposCuidadosEnfermagem([]);
        }
    }, []);

    const handleEspecialidadeChange = useCallback((value: string) => {
        setEspecialidadeEncaminhamento(value);
    }, []);

    const handleSetorChange = useCallback((value: string) => {
        setSetorEncaminhamento(value);
    }, []);

    const handleTiposCuidadosChange = useCallback((value: string[]) => {
        setTiposCuidadosEnfermagem(value);
    }, []);

    const salvar = async (status: 'EM_ANDAMENTO'|'CONCLUIDO' = 'CONCLUIDO') => {
        try {
            if (!cid10.trim()) { 
                toast({
                    title: 'Erro',
                    description: 'Informe o CID-10.',
                    variant: 'destructive',
                });
                return; 
            }
            setSalvando(true);

            const payload: any = {
                ocorrenciaId,
                triagemId,
                pacienteId,
                cid10: cid10.trim(),
                anamnese: anamnese || undefined,
                exameFisico: exameFisico || undefined,
                hipoteseDiagnostica: hipoteseDiagnostica || undefined,
                conduta: conduta || undefined,
                prescricao: prescricao || undefined,
                observacoes: observacoes || undefined,
                retorno: retorno || undefined,
                orientacoes: orientacoes || undefined,
                statusAtendimento: status,
                motivoDesfecho: motivoDesfecho || "01",
                especialidadeEncaminhamento: especialidadeEncaminhamento || undefined,
                setorEncaminhamento: setorEncaminhamento || undefined,
                tiposCuidadosEnfermagem: tiposCuidadosEnfermagem.length > 0 ? tiposCuidadosEnfermagem : undefined,
                prescricoesMedicamentos: prescricoesMedicamentos.length > 0 ? prescricoesMedicamentos : undefined
            };

            const id = await salvarAtendimentoUPA(payload);
            if (status === 'CONCLUIDO') {
                await tryPrintDocuments(id);
                toast({
                    title: 'Sucesso',
                    description: 'Atendimento concluído!',
                });
                navigate('/upa');
            } else {
                setAtendimentoId(id);
                toast({
                    title: 'Sucesso',
                    description: 'Rascunho salvo! Agora você pode registrar um desfecho rápido abaixo.',
                });
            }
        } catch (e: any) {
            console.error('Erro ao salvar atendimento UPA:', e);
            toast({
                title: 'Erro',
                description: e?.response?.data?.message || e?.message || 'Erro ao salvar atendimento',
                variant: 'destructive',
            });
        } finally {
            setSalvando(false);
        }
    };

    const tryPrintDocuments = async (id: number) => {
        if (!printAtestado && !printReceita) return;
        if (!pacienteId) return;

        try {
            if (printAtestado) {
                const payloadAtestado: AtestadoPayload = {
                    tipo: 'COMPARECIMENTO',
                    motivo: `Atendimento médico na UPA - Ocorrência #${ocorrenciaId}`,
                    horaInicio: new Date().toISOString().split('T')[0],
                    horaFim: new Date().toISOString().split('T')[0],
                    consentimentoCid: !!cid10,
                    cid: cid10 || undefined,
                    pacienteId,
                };
                const resp = await gerarAtestado(payloadAtestado);
                if (resp?.success && resp.pdfBase64) {
                    openPdfBase64(resp.pdfBase64, 'Atestado.pdf');
                }
            }

            if (printReceita && prescricoesMedicamentos.length > 0) {
                const payloadReceita: ReceituarioPayload = {
                    pacienteId,
                    itens: prescricoesMedicamentos.map(p => ({
                        nome: p.medicamentoNome,
                        dosagem: `${p.quantidade || ''} ${p.unidade || ''}`,
                        instrucoes: p.instrucaoDosagem || '',
                        via: p.viaAdministracao || '',
                        posologia: p.aprazamento || '',
                        duracao: p.duracaoDias ? `${p.duracaoDias} dias` : '',
                        quantidade: p.quantidade?.toString() || '',
                    })),
                };
                const resp = await gerarReceituario(payloadReceita);
                if (resp?.success && resp.pdfBase64) {
                    openPdfBase64(resp.pdfBase64, 'Receituario.pdf');
                }
            }
        } catch (e) {
            console.error('Erro ao imprimir documentos:', e);
        }
    };

    const requireId = () => {
        if (!atendimentoId) {
            toast({
                title: 'Erro',
                description: 'Salve o atendimento primeiro.',
                variant: 'destructive',
            });
            return null;
        }
        return atendimentoId;
    };

    const acaoLiberar = async () => {
        const id = requireId();
        if (!id) return;
        try {
            await liberarAtendimentoUPA(id);
            toast({ title: 'Sucesso', description: 'Paciente liberado.' });
        } catch (e: any) {
            toast({
                title: 'Erro',
                description: e?.response?.data?.message || 'Erro ao liberar paciente',
                variant: 'destructive',
            });
        }
    };

    const acaoObservacao = async () => {
        const id = requireId();
        if (!id) return;
        const obs = prompt('Observação:');
        if (!obs) return;
        try {
            await observacaoAtendimentoUPA(id, obs);
            toast({ title: 'Sucesso', description: 'Observação registrada.' });
        } catch (e: any) {
            toast({
                title: 'Erro',
                description: e?.response?.data?.message || 'Erro ao registrar observação',
                variant: 'destructive',
            });
        }
    };

    const acaoEncaminhamento = async () => {
        const id = requireId();
        if (!id) return;
        const esp = prompt('Especialidade:');
        if (!esp) return;
        try {
            await encaminhamentoAtendimentoUPA(id, esp);
            toast({ title: 'Sucesso', description: 'Encaminhamento registrado.' });
        } catch (e: any) {
            toast({
                title: 'Erro',
                description: e?.response?.data?.message || 'Erro ao registrar encaminhamento',
                variant: 'destructive',
            });
        }
    };

    const acaoReavaliacao = async () => {
        const id = requireId();
        if (!id) return;
        try {
            await reavaliacaoAtendimentoUPA(id);
            toast({ title: 'Sucesso', description: 'Reavaliação registrada.' });
        } catch (e: any) {
            toast({
                title: 'Erro',
                description: e?.response?.data?.message || 'Erro ao registrar reavaliação',
                variant: 'destructive',
            });
        }
    };

    if (!pacienteId || !ocorrenciaId || !triagemId) {
        return (
            <div className="p-4">
                <Card>
                    <CardContent className="p-6 text-center">
                        <p className="text-gray-600">Carregando informações do paciente...</p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="p-4 space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate('/upa')}
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Voltar
                    </Button>
                    <Stethoscope className="text-purple-700" />
                    <div>
                        <h1 className="text-2xl font-semibold">Atendimento – UPA</h1>
                        <p className="text-sm text-gray-500">
                            Paciente #{pacienteId}{pacienteNome ? ` — ${pacienteNome}` : ''} • Ocorrência #{ocorrenciaId} • Triagem #{triagemId}
                        </p>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <Tabs defaultValue="clinico" className="w-full">
                <TabsList className="grid grid-cols-5 gap-2">
                    <TabsTrigger value="clinico"><ClipboardList className="h-4 w-4 mr-1" />Clínico</TabsTrigger>
                    <TabsTrigger value="prescricao"><Pill className="h-4 w-4 mr-1" />Prescrição</TabsTrigger>
                    <TabsTrigger value="desfecho"><Activity className="h-4 w-4 mr-1" />Desfecho</TabsTrigger>
                    <TabsTrigger value="docs"><FilePlus className="h-4 w-4 mr-1" />Documentos</TabsTrigger>
                    <TabsTrigger value="resumo"><FileCheck2 className="h-4 w-4 mr-1" />Resumo</TabsTrigger>
                </TabsList>

                <TabsContent value="clinico" className="pt-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Dados Clínicos</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Anamnese</Label>
                                    <Textarea value={anamnese} onChange={e=>setAnamnese(e.target.value)} rows={4} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Exame físico</Label>
                                    <Textarea value={exameFisico} onChange={e=>setExameFisico(e.target.value)} rows={4} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Hipótese diagnóstica</Label>
                                    <Textarea value={hipoteseDiagnostica} onChange={e=>setHipoteseDiagnostica(e.target.value)} rows={3} />
                                </div>
                                <div className="space-y-2">
                                    <Label>CID-10 *</Label>
                                    <CidBusca
                                        onCidSelecionado={handleCidSelecionado}
                                        cidSelecionado={cidSelecionado}
                                        placeholder="Digite o código ou descrição do CID..."
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Conduta</Label>
                                    <Textarea value={conduta} onChange={e=>setConduta(e.target.value)} rows={3} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Observações</Label>
                                    <Textarea value={observacoes} onChange={e=>setObservacoes(e.target.value)} rows={3} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Retorno</Label>
                                    <Input value={retorno} onChange={e=>setRetorno(e.target.value)} placeholder="Ex.: 7 dias" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="prescricao" className="pt-4">
                    <PrescricaoMedicamentoForm
                        value={prescricoesMedicamentos}
                        onChange={setPrescricoesMedicamentos}
                        disabled={false}
                        atendimentoId={atendimentoId ? String(atendimentoId) : undefined}
                    />

                    <Card className="mt-4">
                        <CardHeader>
                            <CardTitle>Impressão de Documentos</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-col gap-2">
                                <label className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        className="h-4 w-4"
                                        checked={printAtestado}
                                        onChange={(e)=>setPrintAtestado(e.target.checked)}
                                    />
                                    <span className="flex items-center gap-2">
                                        <Printer className="h-4 w-4" />
                                        Imprimir <b>Atestado</b> ao concluir
                                    </span>
                                </label>

                                <label className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        className="h-4 w-4"
                                        checked={printReceita}
                                        onChange={(e)=>setPrintReceita(e.target.checked)}
                                    />
                                    <span className="flex items-center gap-2">
                                        <Printer className="h-4 w-4" />
                                        Imprimir <b>Receituário</b> ao concluir
                                    </span>
                                </label>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="desfecho" className="pt-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Activity className="h-5 w-5" />
                                Motivo de Desfecho e Encaminhamentos
                            </CardTitle>
                            <CardDescription>
                                Selecione o motivo de desfecho do atendimento conforme tabela oficial do SUS.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <MotivoDesfechoSelect
                                    motivoValue={motivoDesfecho}
                                    especialidadeValue={especialidadeEncaminhamento}
                                    setorValue={setorEncaminhamento}
                                    tiposCuidadosValue={tiposCuidadosEnfermagem}
                                    onMotivoChange={handleMotivoChange}
                                    onEspecialidadeChange={handleEspecialidadeChange}
                                    onSetorChange={handleSetorChange}
                                    onTiposCuidadosChange={handleTiposCuidadosChange}
                                    disabled={false}
                                />

                                <div className="space-y-2">
                                    <Label>Orientações ao Paciente</Label>
                                    <Textarea
                                        value={orientacoes}
                                        onChange={e=>setOrientacoes(e.target.value)}
                                        placeholder="Cuidados, restrições, sinais de alerta..."
                                        rows={3}
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="docs" className="pt-4">
                    <Card>
                        <CardContent className="p-6">
                            <p className="text-sm text-gray-700">
                                Espaço reservado para anexos e outras impressões. As opções de Atestado e Receituário
                                ficam no tab <b>Prescrição</b>.
                            </p>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="resumo" className="pt-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Resumo do Atendimento</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-sm space-y-2">
                                <p><b>Paciente:</b> #{pacienteId}{pacienteNome ? ` — ${pacienteNome}` : ''}</p>
                                <p><b>Ocorrência:</b> #{ocorrenciaId} • <b>Triagem:</b> #{triagemId}</p>
                                <p><b>CID-10:</b> {cid10 || '—'}</p>
                                <p><b>Hipótese:</b> {hipoteseDiagnostica || '—'}</p>
                                <p><b>Conduta:</b> {conduta || '—'}</p>
                                <p><b>Prescrições:</b> {prescricoesMedicamentos.length > 0 ? `${prescricoesMedicamentos.length} medicamento(s)` : 'Nenhuma'}</p>
                                <p><b>Motivo de Desfecho:</b> {
                                    motivoDesfecho === '01' ? 'Alta' :
                                    motivoDesfecho === '02' ? 'Alta se melhora' :
                                    motivoDesfecho === '03' ? 'Encaminhamento' :
                                    motivoDesfecho === '04' ? 'Alta após medicação/procedimento' :
                                    motivoDesfecho === '05' ? 'Óbito' : '—'
                                }</p>
                                {especialidadeEncaminhamento && <p><b>Especialidade:</b> {especialidadeEncaminhamento}</p>}
                                {setorEncaminhamento && <p><b>Setor:</b> {setorEncaminhamento}</p>}
                                {tiposCuidadosEnfermagem.length > 0 && (
                                    <p><b>Cuidados de Enfermagem:</b> {tiposCuidadosEnfermagem.join(', ')}</p>
                                )}
                                <p><b>Observações:</b> {observacoes || '—'}</p>
                                <p><b>Orientações:</b> {orientacoes || '—'}</p>
                                <p><b>Retorno:</b> {retorno || '—'}</p>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            {/* Footer */}
            <div className="flex flex-wrap items-center justify-between gap-2 border-t pt-4">
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => navigate('/upa')}>
                        Cancelar
                    </Button>
                    <Button variant="outline" disabled={salvando} onClick={()=>salvar('EM_ANDAMENTO')}>
                        <FileText className="mr-2 h-4 w-4" />Salvar rascunho
                    </Button>
                    <Button onClick={()=>salvar('CONCLUIDO')} disabled={!cid10.trim() || salvando}>
                        <FileText className="mr-2 h-4 w-4" />Concluir atendimento
                    </Button>
                </div>
                {atendimentoId && (
                    <div className="flex flex-wrap gap-2">
                        <Button variant="secondary" onClick={acaoLiberar}>Liberar</Button>
                        <Button variant="secondary" onClick={acaoObservacao}>Observação</Button>
                        <Button variant="secondary" onClick={acaoEncaminhamento}>Encaminhamento</Button>
                        <Button variant="secondary" onClick={acaoReavaliacao}>Reavaliação</Button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AtendimentoUPAPage;

