
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import CadastroPacienteComAutoComplete, { CadastroPacienteFormDataType } from '@/components/pacientes/CadastroPacienteComAutoComplete';
import { getPacienteById, updatePaciente, PacienteInput } from '@/services/pacientesService.ts';
import { toast } from '@/components/ui/use-toast';
import { Paciente } from '@/types/paciente/Paciente';

// ✅ FUNÇÃO PARA CONVERTER PACIENTE PARA DADOS DO FORMULÁRIO - CORRIGIDA
const converterPacienteParaFormulario = (paciente: Paciente | null): Partial<CadastroPacienteFormDataType> => {
    // ✅ CORREÇÃO: Verifica se paciente não é null antes de tentar acessar as propriedades
    if (!paciente) {
        return {};
    }

    return {
        nomeCompleto: paciente.nomeCompleto ?? undefined,
        nomeSocial: paciente.nomeSocial ?? undefined,
        cpf: paciente.cpf ?? undefined,
        justificativaAusenciaCpf: paciente.justificativaAusenciaCpf ?? undefined,
        cns: paciente.cns ?? undefined,
        sexo: paciente.sexo ?? undefined,
        dataNascimento: paciente.dataNascimento ?? undefined,
        acamado: paciente.acamado ?? false,
        domiciliado: paciente.domiciliado ?? false,
        condSaudeMental: paciente.condSaudeMental ?? false,
        usaPlantas: paciente.usaPlantas ?? false,
        outrasCondicoes: paciente.outrasCondicoes ?? undefined,
        municipio: paciente.municipio ?? undefined,
        cep: paciente.cep ?? undefined,
        logradouro: paciente.logradouro ?? undefined,
        numero: paciente.numero ?? undefined,
        bairro: paciente.bairro ?? undefined,
        complemento: paciente.complemento ?? undefined,
        telefoneCelular: paciente.telefoneCelular ?? undefined,
        telefoneContato: paciente.telefoneContato ?? undefined,
        tipoSanguineo: paciente.tipoSanguineo ?? undefined,
        rg: paciente.rg ?? undefined,
        orgaoEmissor: paciente.orgaoEmissor ?? undefined,
        certidaoNascimento: paciente.certidaoNascimento ?? undefined,
        carteiraTrabalho: paciente.carteiraTrabalho ?? undefined,
        tituloEleitor: paciente.tituloEleitor ?? undefined,
        prontuarioFamiliar: paciente.prontuarioFamiliar ?? undefined,
        corRaca: paciente.corRaca ?? undefined,
        etnia: paciente.etnia ?? undefined,
        escolaridade: paciente.escolaridade ?? undefined,
        situacaoFamiliar: paciente.situacaoFamiliar ?? undefined,
    };
};

const EditarPacientePage: React.FC = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [dadosIniciais, setDadosIniciais] = useState<Partial<CadastroPacienteFormDataType> | undefined>(undefined);
    const [pacienteOriginal, setPacienteOriginal] = useState<Paciente | null>(null);

    useEffect(() => {
        const fetchPaciente = async () => {
            if (!id) {
                navigate('/pacientes');
                return;
            }

            try {
                const pacienteData = await getPacienteById(parseInt(id));
                console.log('📝 Dados do paciente carregados:', pacienteData);

                setPacienteOriginal(pacienteData);
                // ✅ CORREÇÃO: Agora a função aceita Paciente | null
                const dadosConvertidos = converterPacienteParaFormulario(pacienteData);
                console.log('📝 Dados convertidos para o formulário:', dadosConvertidos);

                setDadosIniciais(dadosConvertidos);
            } catch (error) {
                console.error('❌ Erro ao buscar paciente:', error);
                toast({
                    title: "Erro!",
                    description: "Erro ao carregar dados do paciente.",
                    variant: "destructive",
                });
                navigate('/pacientes');
            } finally {
                setIsLoading(false);
            }
        };

        fetchPaciente();
    }, [id, navigate]);

    const handleUpdate = async (data: CadastroPacienteFormDataType) => {
        if (!id) {
            console.error('❌ ID não fornecido para atualização');
            return;
        }

        console.log('📝 Dados recebidos do formulário para atualização:', data);

        // VALIDAÇÃO: Se sexo for "OUTRO", nome social é obrigatório
        if (data.sexo === 'OUTRO' && (!data.nomeSocial || data.nomeSocial.trim() === '')) {
            console.log('⚠️ Validação falhou: Nome social é obrigatório quando sexo é "Outro"');
            toast({
                title: "Erro de Validação!",
                description: "Quando o sexo é 'Outro', o Nome Social é obrigatório.",
                variant: "destructive",
            });
            return;
        }

        setIsSubmitting(true);
        try {
            console.log('🔄 Preparando dados para updatePaciente');

            // ✅ CORREÇÃO: Trocar null por undefined para todos os campos opcionais
            const pacienteData: PacienteInput = {
                nomeCompleto: data.nomeCompleto,
                nomeSocial: data.nomeSocial || undefined,
                cpf: data.cpf || undefined,
                justificativaAusenciaCpf: data.justificativaAusenciaCpf || undefined,
                cns: data.cns || undefined,
                sexo: data.sexo || undefined,
                dataNascimento: data.dataNascimento || undefined,
                acamado: data.acamado || false,
                domiciliado: data.domiciliado || false,
                condSaudeMental: data.condSaudeMental || false,
                usaPlantas: data.usaPlantas || false,
                outrasCondicoes: data.outrasCondicoes || undefined,
                municipio: data.municipio || undefined,
                cep: data.cep || undefined,
                logradouro: data.logradouro || undefined,
                numero: data.numero || undefined,
                bairro: data.bairro || undefined,
                complemento: data.complemento || undefined,
                telefoneCelular: data.telefoneCelular || undefined,
                telefoneContato: data.telefoneContato || undefined,
                tipoSanguineo: data.tipoSanguineo || undefined,
                rg: data.rg || undefined,
                orgaoEmissor: data.orgaoEmissor || undefined,
                certidaoNascimento: data.certidaoNascimento || undefined,
                carteiraTrabalho: data.carteiraTrabalho || undefined,
                tituloEleitor: data.tituloEleitor || undefined,
                prontuarioFamiliar: data.prontuarioFamiliar || undefined,
                corRaca: data.corRaca || undefined,
                etnia: data.etnia || undefined,
                escolaridade: data.escolaridade || undefined,
                situacaoFamiliar: data.situacaoFamiliar || undefined,
            };

            console.log('📤 Enviando dados para atualização:', pacienteData);
            console.log('📤 ID do paciente para atualização:', id);

            const pacienteAtualizado = await updatePaciente({ ...pacienteData, id: parseInt(id) });
            console.log('✅ Paciente atualizado com sucesso:', pacienteAtualizado);

            toast({
                title: "Sucesso!",
                description: "Paciente atualizado com sucesso.",
                className: "bg-green-100 text-green-800",
            });

            console.log('🔄 Redirecionando para /pacientes');
            navigate('/pacientes');
        } catch (error: any) {
            console.error('❌ Erro ao atualizar paciente:', error);
            console.error('❌ Detalhes do erro:', {
                message: error.message,
                response: error.response?.data,
                status: error.response?.status
            });

            let mensagemErro = "Erro ao atualizar paciente. Tente novamente.";
            if (error.response?.data?.message) {
                mensagemErro = error.response.data.message;
            } else if (error.message) {
                mensagemErro = error.message;
            }

            toast({
                title: "Erro!",
                description: mensagemErro,
                variant: "destructive",
            });
        } finally {
            console.log('🔄 Finalizando submissão do formulário de atualização');
            setIsSubmitting(false);
        }
    };

    // Mantemos o handleSubmit para compatibilidade, mas ele apenas chama handleUpdate
    const handleSubmit = handleUpdate;

    const handleCancel = () => {
        navigate('/pacientes');
    };

    if (isLoading) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <span className="ml-2">Carregando dados do paciente...</span>
                </div>
            </div>
        );
    }

    if (!dadosIniciais || !pacienteOriginal) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="text-center">
                    <p className="text-red-600">Paciente não encontrado.</p>
                    <Button onClick={() => navigate('/pacientes')} className="mt-4">
                        Voltar para Lista de Pacientes
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-6">
                <Button
                    variant="outline"
                    onClick={() => navigate('/pacientes')}
                    className="flex items-center gap-2"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Voltar para Lista de Pacientes
                </Button>
            </div>

            <div className="mb-4">
                <h1 className="text-2xl font-bold">Editar Paciente</h1>
                <p className="text-gray-600">
                    Editando: {pacienteOriginal.nomeCompleto}
                    {pacienteOriginal.sexo === 'OUTRO' && pacienteOriginal.nomeSocial &&
                        ` (${pacienteOriginal.nomeSocial})`}
                </p>
            </div>

            <CadastroPacienteComAutoComplete
                onSubmit={handleSubmit}
                onUpdate={handleUpdate}
                isSubmitting={isSubmitting}
                submitButtonText="Cadastrar"
                updateButtonText="Atualizar Paciente"
                initialData={dadosIniciais}
                onCancel={handleCancel}
                isEditMode={true}
            />
        </div>
    );
};

export default EditarPacientePage;