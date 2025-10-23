// frontend/src/components/upa/TriagemModal.tsx
// Modal grande para TRIAGEM UPA: sinais vitais, queixa, alergias, observações,
// campos de saúde da mulher, e sugestão de classificação de risco (apenas sugestão).
// Envio SEM agendamento: payload contém ocorrenciaId + pacienteId.

import React, { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { X, Stethoscope, Heart, Activity, ThermometerSun, Ruler, Scale, AlertTriangle } from 'lucide-react';
import {
    salvarTriagemUPA,
    type CriarTriagemUPARequest,
} from '@/services/upaService';

interface Props {
    pacienteId: number;
    ocorrenciaId: number;
    pacienteNome?: string;
    onClose: () => void;
}

// Sugestão de classificação de risco, NÃO substitui o backend.
// (Regra simples só para “pintar” uma dica)
function sugerirRisco(d: CriarTriagemUPARequest): 'VERMELHO'|'LARANJA'|'AMARELO'|'VERDE'|'AZUL'|undefined {
    const temp = d.temperatura ?? 0;
    const spO2 = d.saturacaoOxigenio ?? 100;
    const pa   = (d.pressaoArterial||'').split(/[xX/]/).map(n=>parseInt(n.trim(),10));
    const pas  = pa[0] || 0;
    const pad  = pa[1] || 0;

    if (spO2 < 90 || pas < 70 || (temp >= 40.0)) return 'VERMELHO';
    if (spO2 < 92 || pas < 90 || (temp >= 39.0)) return 'LARANJA';
    if (temp >= 38.0) return 'AMARELO';
    return 'VERDE';
}

const TriagemModal: React.FC<Props> = ({ pacienteId, ocorrenciaId, pacienteNome, onClose }) => {
    const [dados, setDados] = useState<CriarTriagemUPARequest>({
        ocorrenciaId,
        pacienteId,
        motivoConsulta: 'CONSULTA',
        queixaPrincipal: '',
    });

    const [salvando, setSalvando] = useState(false);
    const riscoSugerido = useMemo(() => sugerirRisco(dados), [dados]);

    const onChange = <K extends keyof CriarTriagemUPARequest>(k: K, v: CriarTriagemUPARequest[K]) =>
        setDados(prev => ({ ...prev, [k]: v }));

    const salvar = async () => {
        try {
            if (!dados.queixaPrincipal?.trim()) {
                alert('Informe a queixa principal.'); return;
            }
            setSalvando(true);
            await salvarTriagemUPA({
                ...dados,
                classificacaoRisco: riscoSugerido // envie apenas se seu backend aceitar; senão remova
            });
            alert('Triagem salva com sucesso!');
            onClose();
        } catch (e: any) {
            console.error('Erro ao salvar triagem UPA:', e);
            alert(e?.response?.data?.message || 'Erro ao salvar triagem');
        } finally {
            setSalvando(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-md w-full max-w-5xl overflow-hidden shadow-lg">
                {/* Cabeçalho */}
                <div className="p-4 border-b flex items-center justify-between bg-purple-50">
                    <div className="flex items-center gap-3">
                        <Stethoscope className="text-purple-700" />
                        <div>
                            <h2 className="text-lg font-semibold">Triagem – UPA</h2>
                            <p className="text-xs text-gray-500">
                                Paciente #{pacienteId}{pacienteNome ? ` — ${pacienteNome}` : ''} • Ocorrência #{ocorrenciaId}
                            </p>
                        </div>
                    </div>
                    <Button variant="outline" onClick={onClose}><X className="h-4 w-4" /></Button>
                </div>

                {/* Corpo */}
                <div className="p-4 grid grid-cols-1 lg:grid-cols-3 gap-4">
                    {/* Coluna 1 — Queixa/Observações/Alergias */}
                    <div className="lg:col-span-2 space-y-4">
                        <div className="space-y-2">
                            <Label>Queixa principal *</Label>
                            <Textarea value={dados.queixaPrincipal} onChange={e => onChange('queixaPrincipal', e.target.value)} />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Observações</Label>
                                <Textarea value={dados.observacoes || ''} onChange={e => onChange('observacoes', e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label>Alergias</Label>
                                <Textarea value={dados.alergias || ''} onChange={e => onChange('alergias', e.target.value)} />
                            </div>
                        </div>

                        {/* Saúde da mulher */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <div>
                                <Label>DUM (opcional)</Label>
                                <Input type="date" value={dados.dumInformada || ''} onChange={e => onChange('dumInformada', e.target.value)} />
                            </div>
                            <div className="flex items-center gap-2 pt-6">
                                <Checkbox checked={!!dados.gestanteInformado} onCheckedChange={c => onChange('gestanteInformado', !!c)} />
                                <Label>Gestante</Label>
                            </div>
                            <div>
                                <Label>Semanas</Label>
                                <Input type="number" min={1} max={40} value={dados.semanasGestacaoInformadas ?? ''} onChange={e => onChange('semanasGestacaoInformadas', Number(e.target.value))} />
                            </div>
                        </div>
                    </div>

                    {/* Coluna 2 — Sinais Vitais + Sugestão de Risco */}
                    <div className="border rounded-md p-3 space-y-3">
                        <div className="font-medium text-sm flex items-center gap-2"><Activity className="h-4 w-4" />Sinais vitais</div>

                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <Label>PA</Label>
                                <Input placeholder="120x80" value={dados.pressaoArterial || ''} onChange={e => onChange('pressaoArterial', e.target.value)} />
                            </div>
                            <div>
                                <Label className="flex items-center gap-1"><ThermometerSun className="h-4 w-4" />Temp (°C)</Label>
                                <Input type="number" step="0.1" value={dados.temperatura ?? ''} onChange={e => onChange('temperatura', Number(e.target.value))} />
                            </div>
                            <div>
                                <Label className="flex items-center gap-1"><Scale className="h-4 w-4" />Peso (kg)</Label>
                                <Input type="number" step="0.1" value={dados.peso ?? ''} onChange={e => onChange('peso', Number(e.target.value))} />
                            </div>
                            <div>
                                <Label className="flex items-center gap-1"><Ruler className="h-4 w-4" />Altura (m)</Label>
                                <Input type="number" step="0.01" value={dados.altura ?? ''} onChange={e => onChange('altura', Number(e.target.value))} />
                            </div>
                            <div>
                                <Label>FC (bpm)</Label>
                                <Input type="number" value={dados.frequenciaCardiaca ?? ''} onChange={e => onChange('frequenciaCardiaca', Number(e.target.value))} />
                            </div>
                            <div>
                                <Label>FR (irpm)</Label>
                                <Input type="number" value={dados.frequenciaRespiratoria ?? ''} onChange={e => onChange('frequenciaRespiratoria', Number(e.target.value))} />
                            </div>
                            <div>
                                <Label>% SpO₂</Label>
                                <Input type="number" value={dados.saturacaoOxigenio ?? ''} onChange={e => onChange('saturacaoOxigenio', Number(e.target.value))} />
                            </div>
                            <div>
                                <Label className="flex items-center gap-1"><Heart className="h-4 w-4" />Dor (0–10)</Label>
                                <Input type="number" min={0} max={10} value={dados.escalaDor ?? ''} onChange={e => onChange('escalaDor', Number(e.target.value))} />
                            </div>
                        </div>

                        <div className="border rounded-md p-2 bg-gray-50">
                            <div className="text-xs text-gray-600 flex items-center gap-2">
                                <AlertTriangle className="h-4 w-4" />
                                <span>Sugestão de risco (não vinculante):</span>
                            </div>
                            <div className="mt-1">
                                {({VERMELHO:'bg-red-100 text-red-800',LARANJA:'bg-orange-100 text-orange-800',AMARELO:'bg-yellow-100 text-yellow-800',VERDE:'bg-green-100 text-green-800',AZUL:'bg-blue-100 text-blue-800'} as any)[riscoSugerido||'VERDE'] && (
                                    <span className={`px-2 py-1 text-xs rounded ${({VERMELHO:'bg-red-100 text-red-800',LARANJA:'bg-orange-100 text-orange-800',AMARELO:'bg-yellow-100 text-yellow-800',VERDE:'bg-green-100 text-green-800',AZUL:'bg-blue-100 text-blue-800'} as any)[riscoSugerido||'VERDE']}`}>
                    {riscoSugerido || 'VERDE'}
                  </span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Rodapé */}
                <div className="p-4 border-t flex justify-end gap-2 bg-white">
                    <Button variant="outline" onClick={onClose}>Cancelar</Button>
                    <Button onClick={salvar} disabled={!dados.queixaPrincipal?.trim() || salvando}>
                        <Stethoscope className="mr-2 h-4 w-4" />
                        {salvando ? 'Salvando...' : 'Salvar triagem'}
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default TriagemModal;
