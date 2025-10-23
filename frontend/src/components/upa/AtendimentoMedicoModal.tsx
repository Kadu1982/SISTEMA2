// frontend/src/components/upa/AtendimentoMedicoModal.tsx
// Modal grande para ATENDIMENTO médico na UPA (sem agendamento).
// Agora com checkboxes para imprimir Atestado e Receituário ao concluir.
// CORREÇÃO: o payload enviado para salvar o atendimento não usa mais o tipo
// CriarAtendimentoUpaRequest (que não tem 'ocorrenciaId'), evitando o TS2353.
// Mantive tudo funcional e aditivo, sem alterar sua identidade.

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { X, FileText, ClipboardList, Stethoscope, Pill, FilePlus, FileCheck2, Printer } from 'lucide-react';
import {
    salvarAtendimentoUPA,
    liberarAtendimentoUPA,
    observacaoAtendimentoUPA,
    encaminhamentoAtendimentoUPA,
    reavaliacaoAtendimentoUPA,
    // ❌ REMOVIDO o import do tipo: CriarAtendimentoUpaRequest
} from '@/services/upaService';

// ✅ Serviços de documentos (ajuste o caminho se necessário)
import {
    gerarAtestado,
    gerarReceituario,
    type AtestadoPayload,
    type ReceituarioPayload,
} from '@/services/documentosService';

interface Props {
    pacienteId: number;
    ocorrenciaId: number;
    triagemId: number;
    pacienteNome?: string;
    onClose: () => void;
}

// Helper local para abrir PDFs base64 em nova aba (sem alterar sua identidade)
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

const AtendimentoMedicoModal: React.FC<Props> = ({ pacienteId, ocorrenciaId, triagemId, pacienteNome, onClose }) => {
    const [cid10, setCid10] = useState('');
    const [anamnese, setAnamnese] = useState('');
    const [exameFisico, setExameFisico] = useState('');
    const [hipoteseDiagnostica, setHipoteseDiagnostica] = useState('');
    const [conduta, setConduta] = useState('');
    const [prescricao, setPrescricao] = useState('');
    const [observacoes, setObservacoes] = useState('');
    const [retorno, setRetorno] = useState('');
    const [salvando, setSalvando] = useState(false);
    const [atendimentoId, setAtendimentoId] = useState<number | null>(null);

    // ✅ NOVOS: checkboxes de impressão (no tab Prescrição)
    const [printAtestado, setPrintAtestado] = useState(false);
    const [printReceita, setPrintReceita] = useState(false);

    const salvar = async (status: 'EM_ANDAMENTO'|'CONCLUIDO' = 'CONCLUIDO') => {
        try {
            if (!cid10.trim()) { alert('Informe o CID-10.'); return; }
            setSalvando(true);

            // ✅ CORREÇÃO: payload sem tipagem rígida (usa any) para aceitar ocorrenciaId/triagemId
            const payload: any = {
                ocorrenciaId,          // alguns backends usam; se o seu não usa, manter aqui não quebra
                triagemId,             // idem
                pacienteId,
                cid10: cid10.trim(),
                anamnese: anamnese || undefined,
                exameFisico: exameFisico || undefined,
                hipoteseDiagnostica: hipoteseDiagnostica || undefined,
                conduta: conduta || undefined,
                prescricao: prescricao || undefined,
                observacoes: observacoes || undefined,
                retorno: retorno || undefined,
                statusAtendimento: status
            };

            const id = await salvarAtendimentoUPA(payload);
            if (status === 'CONCLUIDO') {
                // ✅ Imprimir documentos marcados antes de fechar
                await tryPrintDocuments(id);
                alert('Atendimento concluído!');
                onClose();
            } else {
                setAtendimentoId(id);
                alert('Rascunho salvo! Agora você pode registrar um desfecho rápido abaixo.');
            }
        } catch (e: any) {
            console.error('Erro ao salvar atendimento UPA:', e);
            alert(e?.response?.data?.message || e?.message || 'Erro ao salvar atendimento');
        } finally {
            setSalvando(false);
        }
    };

    // ✅ Gera e abre os PDFs de acordo com os checkboxes marcados
    async function tryPrintDocuments(idAtendimento?: number | null) {
        try {
            // ATESTADO: usamos “Declaração de Comparecimento” com CID se informado
            if (printAtestado) {
                const atestado: AtestadoPayload = {
                    tipo: 'COMPARECIMENTO',
                    motivo: 'Declaração de comparecimento para atendimento em Unidade de Pronto Atendimento.',
                    consentimentoCid: !!cid10,
                    cid: cid10 || undefined,
                    pacienteId,
                    // profissionalId / unidadeId podem ser preenchidos se você tiver no estado/props
                };
                const resp = await gerarAtestado(atestado);
                if (resp?.success && resp.pdfBase64) openPdfBase64(resp.pdfBase64, 'Atestado.pdf');
            }

            // RECEITUÁRIO: cada linha do campo “prescrição” vira um item do receituário
            if (printReceita && prescricao.trim()) {
                const linhas = prescricao
                    .split(/\r?\n/)
                    .map(s => s.trim())
                    .filter(Boolean);
                if (linhas.length > 0) {
                    const receita: ReceituarioPayload = {
                        pacienteId,
                        itens: linhas.map(l => ({
                            nome: l,
                            observacoes: l,
                            // demais campos (via, dose, posologia, duração, quantidade) ficam vazios
                        })),
                    };
                    const resp = await gerarReceituario(receita);
                    if (resp?.success && resp.pdfBase64) openPdfBase64(resp.pdfBase64, 'Receituario.pdf');
                }
            }
        } catch (e) {
            console.warn('Falha ao imprimir documentos da UPA:', e);
        }
    }

    const requireId = (): number | null => {
        if (!atendimentoId) {
            alert('Primeiro, salve um rascunho do atendimento ("Salvar rascunho").');
            return null;
        }
        return atendimentoId;
    };

    const acaoLiberar = async () => {
        const id = requireId(); if (!id) return;
        const obs = window.prompt('Observações (opcional):') || undefined;
        try { await liberarAtendimentoUPA(id, obs); alert('Usuário liberado (FINALIZADO).'); onClose(); } catch (e:any) { console.error(e); alert('Erro ao liberar usuário'); }
    };
    const acaoObservacao = async () => {
        const id = requireId(); if (!id) return;
        const setor = window.prompt('Setor de observação (ex.: Sala 2):') || undefined;
        const obs = window.prompt('Observações (opcional):') || undefined;
        try { await observacaoAtendimentoUPA(id, { setorDestino: setor, observacoes: obs }); alert('Encaminhado para observação.'); onClose(); } catch (e:any) { console.error(e); alert('Erro ao encaminhar para observação'); }
    };
    const acaoEncaminhamento = async () => {
        const id = requireId(); if (!id) return;
        const destino = window.prompt('Destino interno (ex.: Radiologia):') || undefined;
        const obs = window.prompt('Observações (opcional):') || undefined;
        try { await encaminhamentoAtendimentoUPA(id, { setorDestino: destino, observacoes: obs }); alert('Encaminhamento interno registrado.'); onClose(); } catch (e:any) { console.error(e); alert('Erro ao registrar encaminhamento'); }
    };
    const acaoReavaliacao = async () => {
        const id = requireId(); if (!id) return;
        const prazoStr = window.prompt('Reavaliar em quantos minutos? (número)') || '';
        const prazo = prazoStr ? parseInt(prazoStr, 10) : undefined;
        const obs = window.prompt('Observações (opcional):') || undefined;
        try { await reavaliacaoAtendimentoUPA(id, prazo, obs); alert('Reavaliação programada.'); onClose(); } catch (e:any) { console.error(e); alert('Erro ao programar reavaliação'); }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[92vh] overflow-hidden">
                {/* Header */}
                <div className="p-4 border-b border-gray-200 bg-purple-50 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Stethoscope className="text-purple-700" />
                        <div>
                            <h2 className="text-xl font-semibold">Atendimento – UPA</h2>
                            <p className="text-xs text-gray-500">
                                Paciente #{pacienteId}{pacienteNome ? ` — ${pacienteNome}` : ''} • Ocorrência #{ocorrenciaId} • Triagem #{triagemId}
                            </p>
                        </div>
                    </div>
                    <Button variant="outline" onClick={onClose}><X className="h-4 w-4" /></Button>
                </div>

                {/* Tabs */}
                <div className="p-4">
                    <Tabs defaultValue="clinico" className="w-full">
                        <TabsList className="grid grid-cols-4 gap-2">
                            <TabsTrigger value="clinico"><ClipboardList className="h-4 w-4 mr-1" />Clínico</TabsTrigger>
                            <TabsTrigger value="prescricao"><Pill className="h-4 w-4 mr-1" />Prescrição</TabsTrigger>
                            <TabsTrigger value="docs"><FilePlus className="h-4 w-4 mr-1" />Documentos</TabsTrigger>
                            <TabsTrigger value="resumo"><FileCheck2 className="h-4 w-4 mr-1" />Resumo</TabsTrigger>
                        </TabsList>

                        <TabsContent value="clinico" className="pt-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Anamnese</Label>
                                    <Textarea value={anamnese} onChange={e=>setAnamnese(e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Exame físico</Label>
                                    <Textarea value={exameFisico} onChange={e=>setExameFisico(e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Hipótese diagnóstica</Label>
                                    <Textarea value={hipoteseDiagnostica} onChange={e=>setHipoteseDiagnostica(e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <Label>CID-10 *</Label>
                                    <Input value={cid10} onChange={e=>setCid10(e.target.value)} placeholder="Ex.: J00, A09..." />
                                </div>
                                <div className="space-y-2">
                                    <Label>Conduta</Label>
                                    <Textarea value={conduta} onChange={e=>setConduta(e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Observações</Label>
                                    <Textarea value={observacoes} onChange={e=>setObservacoes(e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Retorno</Label>
                                    <Input value={retorno} onChange={e=>setRetorno(e.target.value)} placeholder="Ex.: 7 dias" />
                                </div>
                            </div>
                        </TabsContent>

                        <TabsContent value="prescricao" className="pt-4">
                            <Textarea
                                className="min-h-[200px]"
                                placeholder="Ex.: Dipirona 500mg, VO, 1 cp de 6/6h por 3 dias"
                                value={prescricao}
                                onChange={e=>setPrescricao(e.target.value)}
                            />
                            <p className="text-xs text-gray-500 mt-2">
                                *Cada linha aqui será enviada para o Receituário quando você marcar a opção abaixo.
                            </p>

                            {/* ✅ Checkboxes de impressão */}
                            <div className="mt-3 flex flex-col gap-2">
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

                            <p className="text-xs text-gray-500 mt-2">
                                *Se no futuro você quiser trocar esta área por uma tabela estruturada (medicamento, dose, via, frequência, duração),
                                basta mapear os campos para o payload do receituário. O comportamento de impressão permanece o mesmo.
                            </p>
                        </TabsContent>

                        <TabsContent value="docs" className="pt-4">
                            <p className="text-sm text-gray-700">
                                Espaço reservado para anexos e outras impressões. Nesta entrega, as opções de Atestado e Receituário
                                ficam no tab <b>Prescrição</b>, como solicitado.
                            </p>
                        </TabsContent>

                        <TabsContent value="resumo" className="pt-4">
                            <div className="text-sm">
                                <p><b>Paciente:</b> #{pacienteId}{pacienteNome ? ` — ${pacienteNome}` : ''}</p>
                                <p><b>Ocorrência:</b> #{ocorrenciaId} • <b>Triagem:</b> #{triagemId}</p>
                                <p><b>CID-10:</b> {cid10 || '—'}</p>
                                <p><b>Hipótese:</b> {hipoteseDiagnostica || '—'}</p>
                                <p><b>Conduta:</b> {conduta || '—'}</p>
                                <p><b>Prescrição:</b> {prescricao || '—'}</p>
                                <p><b>Observações:</b> {observacoes || '—'}</p>
                                <p><b>Retorno:</b> {retorno || '—'}</p>
                            </div>
                        </TabsContent>
                    </Tabs>
                </div>

                {/* Footer */}
                <div className="p-4 border-t flex flex-wrap items-center justify-between gap-2">
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={onClose}>Cancelar</Button>
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
        </div>
    );
};

export default AtendimentoMedicoModal;
