import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Info, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import CadastroPacienteComAutoComplete, { CadastroPacienteFormDataType } from '@/components/pacientes/CadastroPacienteComAutoComplete';
import { createPaciente, PacienteInput } from '@/services/pacientesService.ts';
import { toast } from '@/components/ui/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const NovoPacientePage: React.FC = () => {
    const navigate = useNavigate();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [alertaIdade, setAlertaIdade] = useState<{
        mostrar: boolean;
        tipo: 'info' | 'warning' | 'error';
        mensagem: string;
        idade?: string;
    }>({
        mostrar: false,
        tipo: 'info',
        mensagem: ''
    });

    const validarCpfPorIdade = (data: CadastroPacienteFormDataType): boolean => {
        if (!data.dataNascimento) return true;
        const dataNascimento = new Date(data.dataNascimento);
        const hoje = new Date();
        const diffTime = Math.abs(hoje.getTime() - dataNascimento.getTime());
        const diffMonths = Math.floor(diffTime / (1000 * 60 * 60 * 30.44)); // Média de dias no mês

        let idadeFormatada = '';
        if (diffMonths < 12) {
            idadeFormatada = `${diffMonths} mês(es)`;
        } else {
            const anos = Math.floor(diffMonths / 12);
            idadeFormatada = `${anos} ano(s)`;
        }

        if (diffMonths < 6) {
            if (!data.cpf && !data.justificativaAusenciaCpf) {
                setAlertaIdade({ mostrar: true, tipo: 'warning', mensagem: `Para pacientes com ${idadeFormatada}, o CPF não é obrigatório, mas a justificativa é.`, idade: idadeFormatada });
                return false;
            }
            setAlertaIdade({ mostrar: true, tipo: 'info', mensagem: `Paciente com ${idadeFormatada}. CPF não obrigatório.`, idade: idadeFormatada });
        } else {
            if (!data.cpf) {
                setAlertaIdade({ mostrar: true, tipo: 'error', mensagem: `CPF é obrigatório para pacientes com ${idadeFormatada}.`, idade: idadeFormatada });
                return false;
            }
            setAlertaIdade({ mostrar: false, tipo: 'info', mensagem: '' });
        }
        return true;
    };

    const handleFormSubmit = async (data: CadastroPacienteFormDataType) => {
        console.log("🔍 NovoPacientePage: handleFormSubmit chamado com dados:", data);

        if (!validarCpfPorIdade(data)) {
            console.log("⚠️ Validação de CPF por idade falhou");
            toast({
                title: "Validação Pendente",
                description: "Por favor, verifique os alertas sobre o CPF e a idade do paciente.",
                variant: "destructive",
            });
            return;
        }

        setIsSubmitting(true);
        try {
            console.log("🔄 Preparando dados para createPaciente");

            // ✅ CORREÇÃO: O tipo PacienteInput já corresponde ao data, não precisa de campos extras.
            const pacienteInput: PacienteInput = {
                ...data,
                // A propriedade 'usaNomeSocial' foi removida pois não existe no tipo 'PacienteInput'.
                // A lógica de negócio (se o nome social está em uso) deve ser tratada pelo backend.
            };

            console.log("🔄 Chamando createPaciente com dados:", pacienteInput);
            const novoPaciente = await createPaciente(pacienteInput);
            console.log("✅ Paciente criado com sucesso:", novoPaciente);

            toast({
                title: 'Sucesso!',
                description: 'Paciente cadastrado com sucesso.',
            });

            console.log("🔄 Redirecionando para /recepcao/cadastro");
            navigate('/recepcao/cadastro');

        } catch (error: any) {
            console.error("❌ Erro ao criar paciente:", error);
            console.error("❌ Detalhes do erro:", {
                message: error.message,
                response: error.response?.data,
                status: error.response?.status
            });

            toast({
                title: 'Erro ao Cadastrar',
                description: error.response?.data?.message || 'Não foi possível cadastrar o paciente.',
                variant: 'destructive',
            });
        } finally {
            console.log("🔄 Finalizando submissão do formulário");
            setIsSubmitting(false);
        }
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-2xl">Novo Paciente</CardTitle>
                        <Button variant="outline" onClick={() => navigate(-1)}>
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Voltar
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    {alertaIdade.mostrar && (
                        <Alert variant={alertaIdade.tipo === 'error' ? 'destructive' : 'default'} className="mb-4">
                            {alertaIdade.tipo === 'warning' && <AlertTriangle className="h-4 w-4" />}
                            {alertaIdade.tipo === 'info' && <Info className="h-4 w-4" />}
                            <AlertDescription>{alertaIdade.mensagem}</AlertDescription>
                        </Alert>
                    )}
                    {/* ✅ CORREÇÃO: A prop foi renomeada de 'onFormSubmit' para 'onSubmit' */}
                    <CadastroPacienteComAutoComplete
                        onSubmit={handleFormSubmit}
                        isSubmitting={isSubmitting}
                        submitButtonText="Cadastrar Paciente"
                    />
                </CardContent>
            </Card>
        </div>
    );
};

export default NovoPacientePage;
