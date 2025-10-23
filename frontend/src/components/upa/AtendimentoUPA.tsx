// frontend/src/components/upa/AtendimentoUPA.tsx
// Lista de pacientes TRIADOS (prontos para atendimento médico) — sem agendamento.
// Busca, auto-refresh opcional e abertura do modal de atendimento.

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { UserCheck, Search, User, Clock, AlertTriangle, RefreshCw } from 'lucide-react';
import { listarTriadosUPA, type UpaTriadoDTO } from '@/services/upaService';
import AtendimentoMedicoModal from './AtendimentoMedicoModal';

type Ctx = { pacienteId: number; ocorrenciaId: number; triagemId: number; nome: string } | null;
const REFRESH_MS_DEFAULT = 30000;

const AtendimentoUPA: React.FC = () => {
    const [lista, setLista] = useState<UpaTriadoDTO[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [busca, setBusca] = useState('');
    const [autoRefresh, setAutoRefresh] = useState(true);
    const [ctx, setCtx] = useState<Ctx>(null);
    const [show, setShow] = useState(false);
    const timerRef = useRef<any>(null);

    const carregar = async () => {
        try {
            setIsLoading(true);
            const data = await listarTriadosUPA();
            setLista(data);
        } catch (e) {
            console.error('Erro ao carregar triados:', e);
            alert('Erro ao carregar os pacientes triados.');
        } finally { setIsLoading(false); }
    };

    useEffect(() => { carregar(); }, []);
    useEffect(() => {
        if (!autoRefresh) { if (timerRef.current) clearInterval(timerRef.current); timerRef.current = null; return; }
        timerRef.current = setInterval(carregar, REFRESH_MS_DEFAULT);
        return () => { if (timerRef.current) clearInterval(timerRef.current); };
    }, [autoRefresh]);

    const filtrados = useMemo(() => {
        const q = busca.trim().toLowerCase();
        return (lista||[])
            .filter(p => !q || (p.pacienteNome||'').toLowerCase().includes(q))
            .sort((a,b) => (a.criadoEm||'').localeCompare(b.criadoEm||''));
    }, [lista, busca]);

    return (
        <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
                <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                    <Input className="pl-8 w-72" placeholder="Buscar por nome..." value={busca} onChange={e=>setBusca(e.target.value)} />
                </div>
                <Button variant="outline" onClick={carregar}><Clock className="mr-2 h-4 w-4" />Atualizar</Button>
                <div className="ml-auto flex items-center gap-2">
                    <Checkbox checked={autoRefresh} onCheckedChange={v=>setAutoRefresh(!!v)} />
                    <span className="text-sm text-gray-700 flex items-center gap-1"><RefreshCw className="h-4 w-4" />Auto-refresh</span>
                </div>
            </div>

            <div className="border rounded-md divide-y">
                {isLoading && <div className="p-4 text-sm text-gray-600 flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 animate-pulse" />Carregando pacientes triados...
                </div>}
                {!isLoading && filtrados.length === 0 && <div className="p-4 text-sm text-gray-600">Nenhum paciente triado no momento.</div>}

                {filtrados.map(p => (
                    <div key={p.triagemId} className="p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <User className="h-5 w-5 text-blue-600" />
                            <div>
                                <div className="font-medium">{p.pacienteNome}</div>
                                <div className="text-xs text-gray-500">
                                    Triagem: {p.criadoEm || '--'} • Ocorrência #{p.upaId}
                                    {p.classificacaoRisco ? ` • Risco: ${p.classificacaoRisco}` : ''}
                                </div>
                            </div>
                        </div>
                        <Button onClick={() => { setCtx({ pacienteId:p.pacienteId, ocorrenciaId:p.upaId, triagemId:p.triagemId, nome:p.pacienteNome }); setShow(true); }}>
                            <UserCheck className="mr-2 h-4 w-4" />Atender
                        </Button>
                    </div>
                ))}
            </div>

            {show && ctx && (
                <AtendimentoMedicoModal
                    pacienteId={ctx.pacienteId}
                    ocorrenciaId={ctx.ocorrenciaId}
                    triagemId={ctx.triagemId}
                    pacienteNome={ctx.nome}
                    onClose={() => { setShow(false); setCtx(null); carregar(); }}
                />
            )}
        </div>
    );
};

export default AtendimentoUPA;
