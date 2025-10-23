// frontend/src/components/upa/TriagemUPA.tsx
// Lista de pacientes aguardando triagem (sem agendamento), com busca, filtros básicos,
// auto-refresh (opcional) e abertura do modal de triagem.

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Stethoscope, Search, User, Clock, AlertCircle, Filter, RefreshCw } from 'lucide-react';
import {
    listarAguardandoUPA,
    type UpaAguardandoDTO,
} from '@/services/upaService';
import TriagemModal from './TriagemModal';

type Ctx = { pacienteId: number; ocorrenciaId: number; nome: string } | null;

const REFRESH_MS_DEFAULT = 30000; // 30s

const TriagemUPA: React.FC = () => {
    const [lista, setLista] = useState<UpaAguardandoDTO[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [ctx, setCtx] = useState<Ctx>(null);
    const [showTriagem, setShowTriagem] = useState(false);

    // Busca/Filtro
    const [busca, setBusca] = useState('');
    const [apenasPrioridade, setApenasPrioridade] = useState(false);

    // Auto refresh
    const [autoRefresh, setAutoRefresh] = useState(true);
    const timerRef = useRef<any>(null);

    const carregar = async () => {
        try {
            setIsLoading(true);
            const data = await listarAguardandoUPA();
            setLista(data);
        } catch (e) {
            console.error('Erro ao carregar aguardando triagem:', e);
            alert('Erro ao carregar a fila de triagem.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        carregar();
    }, []);

    useEffect(() => {
        if (!autoRefresh) {
            if (timerRef.current) clearInterval(timerRef.current);
            timerRef.current = null;
            return;
        }
        timerRef.current = setInterval(carregar, REFRESH_MS_DEFAULT);
        return () => { if (timerRef.current) clearInterval(timerRef.current); };
    }, [autoRefresh]);

    const filtrados = useMemo(() => {
        const q = busca.trim().toLowerCase();
        return (lista || [])
            .filter(p => {
                const okNome = !q || (p.pacienteNome || '').toLowerCase().includes(q);
                const okPri = !apenasPrioridade || !!p.prioridade;
                return okNome && okPri;
            })
            .sort((a, b) => (a.dataHoraRegistro || '').localeCompare(b.dataHoraRegistro || ''));
    }, [lista, busca, apenasPrioridade]);

    return (
        <div className="space-y-4">
            {/* Barra de ações */}
            <div className="flex flex-wrap items-center gap-2">
                <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                    <Input className="pl-8 w-72" placeholder="Buscar por nome/documento..." value={busca} onChange={e => setBusca(e.target.value)} />
                </div>

                <div className="flex items-center gap-2 px-3 py-1.5 border rounded-md">
                    <Filter className="h-4 w-4 text-gray-500" />
                    <Checkbox checked={apenasPrioridade} onCheckedChange={(v)=>setApenasPrioridade(!!v)} />
                    <span className="text-sm text-gray-700">Mostrar apenas com prioridade</span>
                </div>

                <Button variant="outline" onClick={carregar}><Clock className="mr-2 h-4 w-4" />Atualizar</Button>

                <div className="ml-auto flex items-center gap-2">
                    <Checkbox checked={autoRefresh} onCheckedChange={(v)=>setAutoRefresh(!!v)} />
                    <span className="text-sm text-gray-700 flex items-center gap-1">
            <RefreshCw className="h-4 w-4" />Auto-refresh
          </span>
                </div>
            </div>

            {/* Lista */}
            <div className="border rounded-md divide-y">
                {isLoading && (
                    <div className="p-4 text-sm text-gray-600 flex items-center gap-2">
                        <AlertCircle className="h-4 w-4 animate-pulse" />
                        Carregando fila de triagem...
                    </div>
                )}

                {!isLoading && filtrados.length === 0 && (
                    <div className="p-4 text-sm text-gray-600">Nenhum paciente aguardando triagem.</div>
                )}

                {filtrados.map((p) => (
                    <div key={p.upaId} className="p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <User className="h-5 w-5 text-purple-600" />
                            <div>
                                <div className="font-medium">{p.pacienteNome}</div>
                                <div className="text-xs text-gray-500">
                                    Chegada: {p.dataHoraRegistro || '--'}
                                    {p.prioridade ? ` • Prioridade: ${p.prioridade}` : ''}
                                </div>
                            </div>
                        </div>
                        <Button onClick={() => { setCtx({pacienteId:p.pacienteId, ocorrenciaId:p.upaId, nome:p.pacienteNome}); setShowTriagem(true); }}>
                            <Stethoscope className="mr-2 h-4 w-4" />
                            Triar
                        </Button>
                    </div>
                ))}
            </div>

            {/* Modal Triagem */}
            {showTriagem && ctx && (
                <TriagemModal
                    pacienteId={ctx.pacienteId}
                    ocorrenciaId={ctx.ocorrenciaId}
                    pacienteNome={ctx.nome}
                    onClose={() => { setShowTriagem(false); setCtx(null); carregar(); }}
                />
            )}
        </div>
    );
};

export default TriagemUPA;
