import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import { Calendar, Search, FileText } from 'lucide-react';

// Componentes internos
import LayoutAgendamento from './shared/LayoutAgendamento';
import PacienteBusca from './PacienteBusca';
import { EspecialidadeField } from './consulta/EspecialidadeField';
import { UnidadeField } from './consulta/UnidadeField';
import { ProfissionalField } from './consulta/ProfissionalField';
import { DataHorarioFields } from './shared/DataHorarioFields';
import { PrioridadeField } from './shared/PrioridadeField';
import { FormActions } from './shared/FormActions';

// Hooks e serviços
import { useAgendamentoForm } from '@/hooks/useAgendamentoForm';
import { agendamentoService } from '@/services/agendamentoService';

// Tipos
import { Paciente } from '@/types/paciente/Paciente';
import { DadosReimpressao } from '@/types/Agendamento';
import { useReimpressao } from '@/hooks/useReimpressao';

// Interface para gerenciar erros dos campos controlados localmente
interface LocalFormErrors {
    unidade?: string;
    profissional?: string;
    data?: string;
    horario?: string;
}

export const AgendarConsulta: React.FC = () => {
    const { reimprimirComprovante } = useReimpressao();
    const [pacienteSelecionado, setPacienteSelecionado] = useState<Paciente | null>(null);
    const [showBuscaPaciente, setShowBuscaPaciente] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string>('');

    // Estado para campos não gerenciados pelo hook central
    const [unidade, setUnidade] = useState('');
    const [profissional, setProfissional] = useState('');
    const [data, setData] = useState('');
    const [horario, setHorario] = useState('');
    const [localErrors, setLocalErrors] = useState<LocalFormErrors>({});

    // Hook central para gerenciar parte do formulário
    const { formData, setFormData, resetForm, validateForm, errors } = useAgendamentoForm();

    useEffect(() => {
        if (errorMessage) setErrorMessage('');
        if (Object.keys(localErrors).length > 0) setLocalErrors({});
    }, [formData, unidade, profissional, data, horario, errorMessage]);

    // ✅ CORREÇÃO: Esta função será passada para o PacienteBusca para receber o paciente selecionado.
    const handleSelecionarPaciente = (paciente: Paciente | null) => {
        setPacienteSelecionado(paciente);
        if (paciente) {
            const parsedId = paciente.id !== undefined && paciente.id !== null ? Number(paciente.id) : undefined;
            const pacienteId = parsedId !== undefined && !Number.isNaN(parsedId) ? parsedId : undefined;
            setFormData(prev => ({ ...prev, pacienteId }));
            setShowBuscaPaciente(false);
        } else {
            // Se o paciente for nulo (limpo), reseta tudo.
            handleTrocarPaciente();
        }
    };

    const handleTrocarPaciente = () => {
        setPacienteSelecionado(null);
        resetForm();
        setUnidade('');
        setProfissional('');
        setData('');
        setHorario('');
        setShowBuscaPaciente(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!pacienteSelecionado) {
            toast({ title: "❌ Erro", description: "Selecione um paciente primeiro", variant: "destructive" });
            return;
        }

        const hookErrors = validateForm();
        const newLocalErrors: LocalFormErrors = {};
        if (!unidade) newLocalErrors.unidade = 'Unidade é obrigatória.';
        if (!profissional) newLocalErrors.profissional = 'Profissional é obrigatório.';
        if (!data) newLocalErrors.data = 'Data é obrigatória.';
        if (!horario) newLocalErrors.horario = 'Horário é obrigatório.';
        setLocalErrors(newLocalErrors);

        if (Object.keys(hookErrors).length > 0 || Object.keys(newLocalErrors).length > 0) {
            setErrorMessage("Preencha todos os campos obrigatórios.");
            return;
        }

        setIsSubmitting(true);
        setErrorMessage('');

        try {
            const dataHorario = `${data}T${horario}:00`;
            if (!pacienteSelecionado.id) throw new Error('ID do paciente inválido');

            const agendamentoData = {
                pacienteId: pacienteSelecionado.id,
                tipo: 'consulta_medica',
                dataHora: dataHorario,
                especialidade: formData.especialidade,
                prioridade: formData.prioridade,
                unidade: unidade,
                observacoes: formData.observacoes || '',
                examesSelecionados: [],
                profissionalNome: profissional,
            };

            const response = await agendamentoService.criarAgendamento(agendamentoData);
            toast({ title: "✅ Sucesso!", description: `Consulta agendada para ${new Date(dataHorario).toLocaleString('pt-BR')}` });

            if (!response.pacienteId) {
                throw new Error("ID do paciente não retornado pelo serviço de agendamento.");
            }

            const dadosDocumento: DadosReimpressao = {
                agendamentoId: response.id,
                pacienteId: response.pacienteId,
                pacienteNome: response.pacienteNome || pacienteSelecionado.nomeCompleto,
                pacienteDataNascimento: response.pacienteDataNascimento || pacienteSelecionado.dataNascimento,
                tipo: 'consulta_medica',
                especialidade: response.especialidade || formData.especialidade,
                unidade: response.unidade || unidade,
                prioridade: response.prioridade || formData.prioridade,
                observacoes: response.observacoes || formData.observacoes || '',
                examesSelecionados: [],
                dataHora: response.dataHora || dataHorario,
                profissionalNome: response.profissionalNome || profissional,
            };

            await reimprimirComprovante(dadosDocumento);
            handleTrocarPaciente();

        } catch (error: any) {
            const errorMsg = error.response?.data?.message || error.message || 'Erro interno do servidor';
            setErrorMessage(errorMsg);
            toast({ title: "❌ Erro ao agendar", description: errorMsg, variant: "destructive" });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <LayoutAgendamento
            title="Agendar Consulta Médica"
            subtitle="Agendamento de consultas médicas para pacientes"
            isLoading={isSubmitting}
            errorMessage={errorMessage}
            paciente={pacienteSelecionado ? {
                nome: pacienteSelecionado.nomeCompleto,
                cartaoSus: pacienteSelecionado.cns,
                dataNascimento: pacienteSelecionado.dataNascimento
            } : undefined}
        >
            {showBuscaPaciente && (
                // ✅ CORREÇÃO FINAL: Passando apenas a prop que PacienteBusca espera.
                // Ele é autônomo e não precisa de `onBusca` ou `pacientes`.
                <PacienteBusca
                    onSelecionarPaciente={handleSelecionarPaciente}
                    // A prop `onPacienteSelecionado` é redundante, mas mantida para compatibilidade
                    // caso seu componente `PacienteBusca` use uma ou outra.
                    onPacienteSelecionado={handleSelecionarPaciente}
                />
            )}

            {pacienteSelecionado && !showBuscaPaciente && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                            <span className="flex items-center gap-2">
                                <Calendar className="w-5 h-5 text-blue-600" />
                                Dados do Agendamento
                            </span>
                            <Button variant="outline" size="sm" onClick={handleTrocarPaciente}>
                                <Search className="w-4 h-4 mr-2" />
                                Trocar Paciente
                            </Button>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <EspecialidadeField
                                    value={formData.especialidade}
                                    onChange={(value) => setFormData(prev => ({ ...prev, especialidade: value }))}
                                    error={errors.especialidade}
                                />
                                <UnidadeField
                                    value={unidade}
                                    onChange={setUnidade}
                                    error={localErrors.unidade}
                                />
                                <ProfissionalField
                                    especialidade={formData.especialidade}
                                    unidade={unidade}
                                    value={profissional}
                                    onChange={setProfissional}
                                    error={localErrors.profissional}
                                />
                                <PrioridadeField
                                    value={formData.prioridade}
                                    onChange={(value) => setFormData(prev => ({ ...prev, prioridade: value }))}
                                    error={errors.prioridade}
                                />
                            </div>

                            <DataHorarioFields
                                data={data}
                                horario={horario}
                                onDataChange={setData}
                                onHorarioChange={setHorario}
                                errors={localErrors}
                            />

                            <div className="space-y-2">
                                <Label htmlFor="observacoes" className="flex items-center gap-2">
                                    <FileText className="w-4 h-4" />
                                    Observações (opcional)
                                </Label>
                                <Textarea
                                    id="observacoes"
                                    placeholder="Observações adicionais para o agendamento..."
                                    value={formData.observacoes || ''}
                                    onChange={(e) => setFormData(prev => ({ ...prev, observacoes: e.target.value }))}
                                    rows={3}
                                />
                            </div>

                            <FormActions
                                onCancel={handleTrocarPaciente}
                                onSubmit={handleSubmit}
                                isSubmitting={isSubmitting}
                                submitText="Agendar Consulta"
                            />
                        </form>
                    </CardContent>
                </Card>
            )}
        </LayoutAgendamento>
    );
};