/**
 * src/pages/upa/UpaForm.tsx
 * Formulário de criação/edição do atendimento UPA.
 *
 * ✔ Mantém identidade visual (shadcn/ui + lucide-react) e UX do projeto
 * ✔ Usa PacienteAutocomplete para selecionar paciente
 * ✔ Se existir :id na rota, carrega e faz UPDATE; senão, faz CREATE
 * ✔ Chama exatamente os exports do serviço: obterUpaPorId, criarUpa, atualizarUpa
 */

import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { obterUpaPorId, criarUpa, atualizarUpa, Upa, UpaPayload } from '@/services/upaService';
import PacienteAutocomplete from '@/components/upa/PacienteAutocomplete';

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

// Se você já usa o Select do shadcn, mantenha estes imports.
// Caso não tenha o Select, troque por um <select> nativo mantendo os mesmos valores.
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
} from '@/components/ui/select';

type PacienteList = {
    id: number;
    nomeCompleto: string;
    cpf?: string;
};

const UpaForm: React.FC = () => {
    const navigate = useNavigate();
    const params = useParams<{ id?: string }>();

    const isEdit = Boolean(params.id);
    const idEdicao = params.id ? Number(params.id) : null;

    // Estado do formulário (mantido simples e explícito para didática)
    const [paciente, setPaciente] = useState<PacienteList | null>(null);
    const [dataEntrada, setDataEntrada] = useState<string>('');
    const [horaEntrada, setHoraEntrada] = useState<string>('');
    const [prioridade, setPrioridade] = useState<'BAIXA'|'MEDIA'|'ALTA'|'URGENTE'|undefined>(undefined);
    const [motivo, setMotivo] = useState<string>('');
    const [status, setStatus] = useState<'ABERTO'|'EM_ATENDIMENTO'|'ALTA'|'ENCAMINHADO'|undefined>('ABERTO');
    const [observacoes, setObservacoes] = useState<string>('');

    const [salvando, setSalvando] = useState<boolean>(false);
    const [carregando, setCarregando] = useState<boolean>(false);
    const [erro, setErro] = useState<string>('');

    // Carrega dados para edição
    useEffect(() => {
        if (!isEdit || !idEdicao) return;

        (async () => {
            try {
                setCarregando(true);
                const upa = await obterUpaPorId(idEdicao);
                if (!upa) {
                    setErro('Registro não encontrado.');
                    return;
                }

                // Preenche os campos
                setPaciente(upa.pacienteId ? { id: upa.pacienteId, nomeCompleto: '' } : null);
                setDataEntrada(upa.dataEntrada ?? '');
                setHoraEntrada(upa.horaEntrada ?? '');
                setPrioridade(upa.prioridade);
                setMotivo(upa.motivo ?? '');
                setStatus(upa.status ?? 'ABERTO');
                setObservacoes(upa.observacoes ?? '');
            } catch (e: any) {
                console.error(e);
                setErro('Erro ao carregar dados da UPA.');
            } finally {
                setCarregando(false);
            }
        })();
    }, [isEdit, idEdicao]);

    // Monta payload de envio
    const montarPayload = (): UpaPayload => {
        if (!paciente?.id) {
            throw new Error('Selecione um paciente.');
        }

        if (!dataEntrada) {
            throw new Error('Informe a data de entrada.');
        }

        return {
            pacienteId: paciente.id,
            dataEntrada,
            horaEntrada: horaEntrada || undefined,
            prioridade,
            motivo: motivo || undefined,
            status: status || 'ABERTO',
            observacoes: observacoes || undefined,
            // unidadeId: se você controla via contexto (OperadorContext), pode setar aqui
        };
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErro('');

        try {
            setSalvando(true);
            const payload = montarPayload();

            if (isEdit && idEdicao) {
                await atualizarUpa(idEdicao, payload);
            } else {
                await criarUpa(payload);
            }

            // Volta para a lista da UPA (ajuste a rota conforme seu projeto)
            navigate('/upa');
        } catch (e: any) {
            console.error(e);
            const msg = e?.message || 'Erro ao salvar registro da UPA.';
            setErro(msg);
        } finally {
            setSalvando(false);
        }
    };

    return (
        <Card className="max-w-4xl mx-auto">
            <CardHeader>
                <CardTitle>{isEdit ? 'Editar Atendimento UPA' : 'Novo Atendimento UPA'}</CardTitle>
            </CardHeader>

            <CardContent>
                {carregando ? (
                    <div className="text-sm text-gray-500">Carregando...</div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Paciente */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Paciente</label>
                            <PacienteAutocomplete
                                pacienteSelecionado={paciente ? { id: paciente.id, nomeCompleto: paciente.nomeCompleto } as any : null}
                                onPacienteSelecionado={(p) => setPaciente(p ? { id: p.id, nomeCompleto: p.nomeCompleto } : null)}
                                placeholder="Digite o nome do paciente..."
                            />
                            <p className="text-xs text-gray-500">
                                Comece a digitar e selecione o paciente (busca com 1 caractere).
                            </p>
                        </div>

                        {/* Data e hora de entrada */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Data de Entrada</label>
                                <Input
                                    type="date"
                                    value={dataEntrada}
                                    onChange={(e) => setDataEntrada(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Hora de Entrada</label>
                                <Input
                                    type="time"
                                    value={horaEntrada}
                                    onChange={(e) => setHoraEntrada(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Prioridade */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Prioridade</label>
                            <Select
                                value={prioridade}
                                onValueChange={(v) => setPrioridade(v as any)}
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Selecione a prioridade" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="BAIXA">Baixa</SelectItem>
                                    <SelectItem value="MEDIA">Média</SelectItem>
                                    <SelectItem value="ALTA">Alta</SelectItem>
                                    <SelectItem value="URGENTE">Urgente</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Motivo */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Motivo/Queixa</label>
                            <Input
                                value={motivo}
                                onChange={(e) => setMotivo(e.target.value)}
                                placeholder="Ex.: dor abdominal, febre, queda..."
                            />
                        </div>

                        {/* Status */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Status</label>
                            <Select
                                value={status}
                                onValueChange={(v) => setStatus(v as any)}
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Selecione o status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ABERTO">Aberto</SelectItem>
                                    <SelectItem value="EM_ATENDIMENTO">Em atendimento</SelectItem>
                                    <SelectItem value="ALTA">Alta</SelectItem>
                                    <SelectItem value="ENCAMINHADO">Encaminhado</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Observações */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Observações</label>
                            <Textarea
                                value={observacoes}
                                onChange={(e) => setObservacoes(e.target.value)}
                                placeholder="Informações adicionais relevantes..."
                            />
                        </div>

                        {/* Erro geral */}
                        {erro && (
                            <div className="text-sm text-red-600">{erro}</div>
                        )}

                        <div className="flex items-center gap-3">
                            <Button type="submit" disabled={salvando}>
                                {salvando ? 'Salvando...' : (isEdit ? 'Salvar alterações' : 'Cadastrar')}
                            </Button>
                            <Button type="button" variant="outline" onClick={() => navigate('/upa')}>
                                Cancelar
                            </Button>
                        </div>
                    </form>
                )}
            </CardContent>
        </Card>
    );
};

export default UpaForm;
