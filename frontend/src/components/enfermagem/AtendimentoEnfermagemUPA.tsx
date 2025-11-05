import React, { useEffect, useState } from 'react';
import { Badge, Button, Card, Input, Select, Textarea, Table, Modal } from '@/components/ui';
import { Activity, AlertCircle, CheckCircle, Clock, FileText, Plus, Search, XCircle } from 'lucide-react';
import { useOperador } from '@/contexts/OperadorContext';
import { toast } from 'react-hot-toast';
import api from '@/services/api';

interface AtendimentoEnfermagem {
    id: number;
    pacienteNome: string;
    pacienteCpf: string;
    unidadeNome: string;
    enfermeiroNome?: string;
    origemAtendimento: 'AMBULATORIAL' | 'UPA';
    origemId: number;
    prioridade: 'ROTINA' | 'URGENTE' | 'EMERGENCIA';
    status: 'AGUARDANDO' | 'EM_ATENDIMENTO' | 'FINALIZADO' | 'CANCELADO';
    pressaoArterial?: string;
    frequenciaCardiaca?: number;
    frequenciaRespiratoria?: number;
    temperatura?: number;
    saturacaoO2?: number;
    glicemia?: number;
    escalaDor?: number;
    queixaPrincipal?: string;
    observacoes?: string;
    condicoesGerais?: string;
    dataHoraInicio: string;
    dataHoraFim?: string;
    procedimentos?: ProcedimentoEnfermagem[];
}

interface ProcedimentoEnfermagem {
    id: number;
    tipoProcedimento: string;
    descricao: string;
    status: 'PENDENTE' | 'EM_EXECUCAO' | 'CONCLUIDO' | 'CANCELADO';
    executorNome?: string;
    dataHoraInicio?: string;
    dataHoraFim?: string;
    observacoes?: string;
}

const AtendimentoEnfermagemUPA: React.FC = () => {
    const { operador } = useOperador();
    const [atendimentos, setAtendimentos] = useState<AtendimentoEnfermagem[]>([]);
    const [filaAtendimento, setFilaAtendimento] = useState<AtendimentoEnfermagem[]>([]);
    const [loading, setLoading] = useState(false);
    const [modalAberto, setModalAberto] = useState(false);
    const [modalSinaisVitais, setModalSinaisVitais] = useState(false);
    const [modalProcedimento, setModalProcedimento] = useState(false);
    const [atendimentoSelecionado, setAtendimentoSelecionado] = useState<AtendimentoEnfermagem | null>(null);

    // Formulário de sinais vitais
    const [sinaisVitais, setSinaisVitais] = useState({
        pressaoArterial: '',
        frequenciaCardiaca: '',
        frequenciaRespiratoria: '',
        temperatura: '',
        saturacaoO2: '',
        glicemia: '',
        escalaDor: '',
        condicoesGerais: ''
    });

    // Formulário de procedimento
    const [novoProcedimento, setNovoProcedimento] = useState({
        tipoProcedimento: '',
        descricao: '',
        observacoes: ''
    });

    // Carregar fila de atendimentos
    useEffect(() => {
        carregarFilaAtendimento();
        const interval = setInterval(carregarFilaAtendimento, 30000); // Atualiza a cada 30s
        return () => clearInterval(interval);
    }, []);

    const carregarFilaAtendimento = async () => {
        if (!operador?.unidadeId) return;

        try {
            const response = await api.get(`/api/enfermagem/atendimentos/fila`, {
                params: { unidadeId: operador.unidadeId }
            });
            setFilaAtendimento(response.data);
        } catch (error) {
            console.error('Erro ao carregar fila:', error);
        }
    };

    const iniciarAtendimento = async (atendimentoId: number) => {
        if (!operador?.id) {
            toast.error('Operador não identificado');
            return;
        }

        setLoading(true);
        try {
            const response = await api.put(
                `/api/enfermagem/atendimentos/${atendimentoId}/iniciar`,
                null,
                { params: { enfermeiroId: operador.id } }
            );

            toast.success('Atendimento iniciado com sucesso');
            setAtendimentoSelecionado(response.data);
            setModalAberto(true);
            carregarFilaAtendimento();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Erro ao iniciar atendimento');
        } finally {
            setLoading(false);
        }
    };

    const registrarSinaisVitais = async () => {
        if (!atendimentoSelecionado) return;

        setLoading(true);
        try {
            const response = await api.put(
                `/api/enfermagem/atendimentos/${atendimentoSelecionado.id}/sinais-vitais`,
                {
                    pressaoArterial: sinaisVitais.pressaoArterial || null,
                    frequenciaCardiaca: sinaisVitais.frequenciaCardiaca ? parseInt(sinaisVitais.frequenciaCardiaca) : null,
                    frequenciaRespiratoria: sinaisVitais.frequenciaRespiratoria ? parseInt(sinaisVitais.frequenciaRespiratoria) : null,
                    temperatura: sinaisVitais.temperatura ? parseFloat(sinaisVitais.temperatura) : null,
                    saturacaoO2: sinaisVitais.saturacaoO2 ? parseInt(sinaisVitais.saturacaoO2) : null,
                    glicemia: sinaisVitais.glicemia ? parseInt(sinaisVitais.glicemia) : null,
                    escalaDor: sinaisVitais.escalaDor ? parseInt(sinaisVitais.escalaDor) : null,
                    condicoesGerais: sinaisVitais.condicoesGerais || null
                }
            );

            setAtendimentoSelecionado(response.data);
            setModalSinaisVitais(false);
            toast.success('Sinais vitais registrados');
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Erro ao registrar sinais vitais');
        } finally {
            setLoading(false);
        }
    };

    const criarProcedimento = async () => {
        if (!atendimentoSelecionado || !novoProcedimento.tipoProcedimento || !novoProcedimento.descricao) {
            toast.error('Preencha tipo e descrição do procedimento');
            return;
        }

        setLoading(true);
        try {
            await api.post('/api/enfermagem/procedimentos', {
                atendimentoId: atendimentoSelecionado.id,
                tipoProcedimento: novoProcedimento.tipoProcedimento,
                descricao: novoProcedimento.descricao,
                observacoes: novoProcedimento.observacoes,
                status: 'PENDENTE'
            });

            toast.success('Procedimento registrado');
            setModalProcedimento(false);
            setNovoProcedimento({ tipoProcedimento: '', descricao: '', observacoes: '' });
            // Recarregar atendimento para ver o procedimento
            const response = await api.get(`/api/enfermagem/atendimentos/${atendimentoSelecionado.id}`);
            setAtendimentoSelecionado(response.data);
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Erro ao criar procedimento');
        } finally {
            setLoading(false);
        }
    };

    const finalizarAtendimento = async () => {
        if (!atendimentoSelecionado) return;

        setLoading(true);
        try {
            await api.put(
                `/api/enfermagem/atendimentos/${atendimentoSelecionado.id}/finalizar`,
                { observacoes: 'Atendimento concluído' }
            );

            toast.success('Atendimento finalizado');
            setModalAberto(false);
            setAtendimentoSelecionado(null);
            carregarFilaAtendimento();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Erro ao finalizar atendimento');
        } finally {
            setLoading(false);
        }
    };

    const getBadgeColor = (status: string) => {
        switch (status) {
            case 'AGUARDANDO': return 'bg-yellow-100 text-yellow-800';
            case 'EM_ATENDIMENTO': return 'bg-blue-100 text-blue-800';
            case 'FINALIZADO': return 'bg-green-100 text-green-800';
            case 'CANCELADO': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getPrioridadeBadge = (prioridade: string) => {
        switch (prioridade) {
            case 'EMERGENCIA': return 'bg-red-600 text-white';
            case 'URGENTE': return 'bg-orange-500 text-white';
            case 'ROTINA': return 'bg-green-500 text-white';
            default: return 'bg-gray-500 text-white';
        }
    };

    return (
        <div className="space-y-6">
            {/* Header com estatísticas */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-center gap-2">
                        <Clock className="text-yellow-600" size={24} />
                        <div>
                            <p className="text-sm text-yellow-600 font-medium">Aguardando</p>
                            <p className="text-2xl font-bold text-yellow-800">
                                {filaAtendimento.filter(a => a.status === 'AGUARDANDO').length}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center gap-2">
                        <Activity className="text-blue-600" size={24} />
                        <div>
                            <p className="text-sm text-blue-600 font-medium">Em Atendimento</p>
                            <p className="text-2xl font-bold text-blue-800">
                                {filaAtendimento.filter(a => a.status === 'EM_ATENDIMENTO').length}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center gap-2">
                        <CheckCircle className="text-green-600" size={24} />
                        <div>
                            <p className="text-sm text-green-600 font-medium">Total na Fila</p>
                            <p className="text-2xl font-bold text-green-800">{filaAtendimento.length}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Fila de Atendimentos */}
            <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                        <FileText size={20} />
                        Fila de Atendimentos
                    </h3>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Prioridade</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Paciente</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Origem</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Status</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Enfermeiro</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {filaAtendimento.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                                        Nenhum atendimento na fila
                                    </td>
                                </tr>
                            ) : (
                                filaAtendimento.map(atendimento => (
                                    <tr key={atendimento.id} className="hover:bg-gray-50">
                                        <td className="px-4 py-3">
                                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPrioridadeBadge(atendimento.prioridade)}`}>
                                                {atendimento.prioridade}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div>
                                                <p className="font-medium text-gray-900">{atendimento.pacienteNome}</p>
                                                <p className="text-sm text-gray-500">{atendimento.pacienteCpf}</p>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className="text-sm text-gray-700">{atendimento.origemAtendimento}</span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getBadgeColor(atendimento.status)}`}>
                                                {atendimento.status}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-700">
                                            {atendimento.enfermeiroNome || '-'}
                                        </td>
                                        <td className="px-4 py-3">
                                            {atendimento.status === 'AGUARDANDO' && (
                                                <button
                                                    onClick={() => iniciarAtendimento(atendimento.id)}
                                                    disabled={loading}
                                                    className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 disabled:opacity-50"
                                                >
                                                    Iniciar
                                                </button>
                                            )}
                                            {atendimento.status === 'EM_ATENDIMENTO' && (
                                                <button
                                                    onClick={() => {
                                                        setAtendimentoSelecionado(atendimento);
                                                        setModalAberto(true);
                                                    }}
                                                    className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                                                >
                                                    Continuar
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal de Atendimento */}
            {modalAberto && atendimentoSelecionado && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="bg-blue-600 text-white px-6 py-4 flex justify-between items-center">
                            <h2 className="text-xl font-bold">Atendimento de Enfermagem</h2>
                            <button onClick={() => setModalAberto(false)} className="text-white hover:text-gray-200">
                                <XCircle size={24} />
                            </button>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* Dados do Paciente */}
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <h3 className="font-semibold text-gray-800 mb-2">Dados do Paciente</h3>
                                <p><strong>Nome:</strong> {atendimentoSelecionado.pacienteNome}</p>
                                <p><strong>CPF:</strong> {atendimentoSelecionado.pacienteCpf}</p>
                                <p><strong>Origem:</strong> {atendimentoSelecionado.origemAtendimento}</p>
                                <p><strong>Queixa:</strong> {atendimentoSelecionado.queixaPrincipal || 'Não informada'}</p>
                            </div>

                            {/* Sinais Vitais */}
                            <div>
                                <div className="flex justify-between items-center mb-3">
                                    <h3 className="font-semibold text-gray-800">Sinais Vitais</h3>
                                    <button
                                        onClick={() => setModalSinaisVitais(true)}
                                        className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                                    >
                                        Registrar
                                    </button>
                                </div>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <div className="bg-gray-50 p-3 rounded">
                                        <p className="text-xs text-gray-600">PA</p>
                                        <p className="font-semibold">{atendimentoSelecionado.pressaoArterial || '-'}</p>
                                    </div>
                                    <div className="bg-gray-50 p-3 rounded">
                                        <p className="text-xs text-gray-600">FC</p>
                                        <p className="font-semibold">{atendimentoSelecionado.frequenciaCardiaca || '-'} bpm</p>
                                    </div>
                                    <div className="bg-gray-50 p-3 rounded">
                                        <p className="text-xs text-gray-600">Temp</p>
                                        <p className="font-semibold">{atendimentoSelecionado.temperatura || '-'}°C</p>
                                    </div>
                                    <div className="bg-gray-50 p-3 rounded">
                                        <p className="text-xs text-gray-600">SatO2</p>
                                        <p className="font-semibold">{atendimentoSelecionado.saturacaoO2 || '-'}%</p>
                                    </div>
                                </div>
                            </div>

                            {/* Procedimentos */}
                            <div>
                                <div className="flex justify-between items-center mb-3">
                                    <h3 className="font-semibold text-gray-800">Procedimentos</h3>
                                    <button
                                        onClick={() => setModalProcedimento(true)}
                                        className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 flex items-center gap-1"
                                    >
                                        <Plus size={16} />
                                        Novo
                                    </button>
                                </div>
                                {atendimentoSelecionado.procedimentos && atendimentoSelecionado.procedimentos.length > 0 ? (
                                    <div className="space-y-2">
                                        {atendimentoSelecionado.procedimentos.map(proc => (
                                            <div key={proc.id} className="border border-gray-200 rounded p-3">
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <p className="font-medium">{proc.tipoProcedimento.replace(/_/g, ' ')}</p>
                                                        <p className="text-sm text-gray-600">{proc.descricao}</p>
                                                    </div>
                                                    <span className={`text-xs px-2 py-1 rounded ${getBadgeColor(proc.status)}`}>
                                                        {proc.status}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-gray-500 text-sm">Nenhum procedimento registrado</p>
                                )}
                            </div>

                            {/* Ações */}
                            <div className="flex justify-end gap-3 pt-4 border-t">
                                <button
                                    onClick={() => setModalAberto(false)}
                                    className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
                                >
                                    Fechar
                                </button>
                                <button
                                    onClick={finalizarAtendimento}
                                    disabled={loading}
                                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
                                >
                                    Finalizar Atendimento
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Sinais Vitais */}
            {modalSinaisVitais && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
                    <div className="bg-white rounded-lg max-w-2xl w-full">
                        <div className="bg-blue-600 text-white px-6 py-4">
                            <h3 className="text-lg font-bold">Registrar Sinais Vitais</h3>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Pressão Arterial</label>
                                    <input
                                        type="text"
                                        placeholder="120/80"
                                        value={sinaisVitais.pressaoArterial}
                                        onChange={(e) => setSinaisVitais({...sinaisVitais, pressaoArterial: e.target.value})}
                                        className="w-full border border-gray-300 rounded px-3 py-2"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">FC (bpm)</label>
                                    <input
                                        type="number"
                                        value={sinaisVitais.frequenciaCardiaca}
                                        onChange={(e) => setSinaisVitais({...sinaisVitais, frequenciaCardiaca: e.target.value})}
                                        className="w-full border border-gray-300 rounded px-3 py-2"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">FR (irpm)</label>
                                    <input
                                        type="number"
                                        value={sinaisVitais.frequenciaRespiratoria}
                                        onChange={(e) => setSinaisVitais({...sinaisVitais, frequenciaRespiratoria: e.target.value})}
                                        className="w-full border border-gray-300 rounded px-3 py-2"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Temperatura (°C)</label>
                                    <input
                                        type="number"
                                        step="0.1"
                                        value={sinaisVitais.temperatura}
                                        onChange={(e) => setSinaisVitais({...sinaisVitais, temperatura: e.target.value})}
                                        className="w-full border border-gray-300 rounded px-3 py-2"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">SatO2 (%)</label>
                                    <input
                                        type="number"
                                        value={sinaisVitais.saturacaoO2}
                                        onChange={(e) => setSinaisVitais({...sinaisVitais, saturacaoO2: e.target.value})}
                                        className="w-full border border-gray-300 rounded px-3 py-2"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Glicemia (mg/dL)</label>
                                    <input
                                        type="number"
                                        value={sinaisVitais.glicemia}
                                        onChange={(e) => setSinaisVitais({...sinaisVitais, glicemia: e.target.value})}
                                        className="w-full border border-gray-300 rounded px-3 py-2"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Condições Gerais</label>
                                <textarea
                                    value={sinaisVitais.condicoesGerais}
                                    onChange={(e) => setSinaisVitais({...sinaisVitais, condicoesGerais: e.target.value})}
                                    className="w-full border border-gray-300 rounded px-3 py-2"
                                    rows={3}
                                />
                            </div>
                            <div className="flex justify-end gap-3">
                                <button
                                    onClick={() => setModalSinaisVitais(false)}
                                    className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={registrarSinaisVitais}
                                    disabled={loading}
                                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                                >
                                    Salvar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Novo Procedimento */}
            {modalProcedimento && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
                    <div className="bg-white rounded-lg max-w-2xl w-full">
                        <div className="bg-green-600 text-white px-6 py-4">
                            <h3 className="text-lg font-bold">Novo Procedimento</h3>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Tipo de Procedimento *</label>
                                <select
                                    value={novoProcedimento.tipoProcedimento}
                                    onChange={(e) => setNovoProcedimento({...novoProcedimento, tipoProcedimento: e.target.value})}
                                    className="w-full border border-gray-300 rounded px-3 py-2"
                                >
                                    <option value="">Selecione...</option>
                                    <option value="CURATIVO_SIMPLES">Curativo Simples</option>
                                    <option value="CURATIVO_COMPLEXO">Curativo Complexo</option>
                                    <option value="MEDICACAO_IM">Medicação IM</option>
                                    <option value="MEDICACAO_EV">Medicação EV</option>
                                    <option value="MEDICACAO_SC">Medicação SC</option>
                                    <option value="MEDICACAO_ORAL">Medicação Oral</option>
                                    <option value="NEBULIZACAO">Nebulização</option>
                                    <option value="OXIGENIOTERAPIA">Oxigenioterapia</option>
                                    <option value="SUTURA_SIMPLES">Sutura Simples</option>
                                    <option value="RETIRADA_PONTOS">Retirada de Pontos</option>
                                    <option value="SONDAGEM_VESICAL">Sondagem Vesical</option>
                                    <option value="GLICEMIA_CAPILAR">Glicemia Capilar</option>
                                    <option value="AFERACAO_PA">Aferição de PA</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Descrição *</label>
                                <textarea
                                    value={novoProcedimento.descricao}
                                    onChange={(e) => setNovoProcedimento({...novoProcedimento, descricao: e.target.value})}
                                    className="w-full border border-gray-300 rounded px-3 py-2"
                                    rows={3}
                                    placeholder="Descreva o procedimento..."
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Observações</label>
                                <textarea
                                    value={novoProcedimento.observacoes}
                                    onChange={(e) => setNovoProcedimento({...novoProcedimento, observacoes: e.target.value})}
                                    className="w-full border border-gray-300 rounded px-3 py-2"
                                    rows={2}
                                />
                            </div>
                            <div className="flex justify-end gap-3">
                                <button
                                    onClick={() => setModalProcedimento(false)}
                                    className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={criarProcedimento}
                                    disabled={loading}
                                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
                                >
                                    Criar Procedimento
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AtendimentoEnfermagemUPA;
