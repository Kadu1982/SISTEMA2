
import React, { useState, useRef, useEffect } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Search, User, Phone, FileText, Edit2, AlertTriangle } from 'lucide-react';

// UI Components
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';

// Hooks e Utils
import { usePacienteBusca } from '@/hooks/usePacienteBusca';
import { Paciente } from '@/types/paciente/Paciente';
import {
    obterNomeExibicao,
    formatarNomeComIndicador,
    formatarCpf,
    formatarTelefone,
    aplicarMascaraCpf,
    removerMascaraCpf,
    aplicarMascaraTelefoneCelular,
    aplicarMascaraTelefoneFixo,
    aplicarMascaraData,
    removerMascaraTelefone,
    removerMascaraData,
    validarDataBrasil
} from '@/lib/pacienteUtils';

// ✅ Função helper para validar o formato do CPF
const validarCpfFormatoDigitos = (cpf: string): boolean => {
    if (!cpf) return false;
    const cpfLimpo = removerMascaraCpf(cpf);
    if (cpfLimpo.length !== 11 || /^(.)\1+$/.test(cpfLimpo)) return false;

    try {
        let soma = 0;
        for (let i = 1; i <= 9; i++) soma += parseInt(cpfLimpo.substring(i - 1, i)) * (11 - i);
        let resto = (soma * 10) % 11;
        if ((resto === 10) || (resto === 11)) resto = 0;
        if (resto !== parseInt(cpfLimpo.substring(9, 10))) return false;

        soma = 0;
        for (let i = 1; i <= 10; i++) soma += parseInt(cpfLimpo.substring(i - 1, i)) * (12 - i);
        resto = (soma * 10) % 11;
        if ((resto === 10) || (resto === 11)) resto = 0;
        if (resto !== parseInt(cpfLimpo.substring(10, 11))) return false;

        return true;
    } catch {
        return false;
    }
};

// ✅ CORREÇÃO DEFINITIVA: Schema que produz tipos obrigatórios não-undefined
const cadastroPacienteSchema = z.object({
    nomeCompleto: z.string().min(3, 'Nome completo deve ter pelo menos 3 caracteres.'),
    nomeSocial: z.string(),
    cpf: z.string(),
    justificativaAusenciaCpf: z.string(),
    cns: z.string(),
    sexo: z.string(),
    dataNascimento: z.string(),
    acamado: z.boolean(),
    domiciliado: z.boolean(),
    condSaudeMental: z.boolean(),
    usaPlantas: z.boolean(),
    outrasCondicoes: z.string(),
    municipio: z.string(),
    cep: z.string(),
    logradouro: z.string(),
    numero: z.string(),
    bairro: z.string(),
    complemento: z.string(),
    telefoneCelular: z.string(),
    telefoneContato: z.string(),
    tipoSanguineo: z.string(),
    rg: z.string(),
    orgaoEmissor: z.string(),
    certidaoNascimento: z.string(),
    carteiraTrabalho: z.string(),
    tituloEleitor: z.string(),
    prontuarioFamiliar: z.string(),
    corRaca: z.string(),
    etnia: z.string(),
    escolaridade: z.string(),
    situacaoFamiliar: z.string(),
}).superRefine((data, ctx) => {
    // REGRA 1: Nome social obrigatório APENAS quando sexo = 'OUTRO'
    if (data.sexo === 'OUTRO' && (!data.nomeSocial || data.nomeSocial.trim() === '')) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Nome Social é obrigatório quando o sexo for 'Outro'",
            path: ["nomeSocial"],
        });
    }

    // REGRA 2: Validação de CPF baseada na idade
    if (data.dataNascimento) {
        const hoje = new Date();
        const nascimento = new Date(data.dataNascimento);
        const diffMonths = (hoje.getFullYear() - nascimento.getFullYear()) * 12 + (hoje.getMonth() - nascimento.getMonth());
        const cpfObrigatorio = diffMonths >= 6;

        if (cpfObrigatorio && !data.cpf) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "CPF é obrigatório para pacientes com 6 meses ou mais.",
                path: ["cpf"],
            });
        }

        if (!cpfObrigatorio && !data.cpf && !data.justificativaAusenciaCpf) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Justificativa é obrigatória se o CPF não for informado para menores de 6 meses.",
                path: ["justificativaAusenciaCpf"],
            });
        }
    }

    // REGRA 3: Validação do formato do CPF, se ele for preenchido
    if (data.cpf && !validarCpfFormatoDigitos(data.cpf)) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "O CPF informado é inválido.",
            path: ["cpf"],
        });
    }
});

// ✅ Definir tipo explicitamente - compatível com o schema
export interface CadastroPacienteFormDataType {
    nomeCompleto: string;
    nomeSocial: string;
    cpf: string;
    justificativaAusenciaCpf: string;
    cns: string;
    sexo: string;
    dataNascimento: string;
    acamado: boolean;
    domiciliado: boolean;
    condSaudeMental: boolean;
    usaPlantas: boolean;
    outrasCondicoes: string;
    municipio: string;
    cep: string;
    logradouro: string;
    numero: string;
    bairro: string;
    complemento: string;
    telefoneCelular: string;
    telefoneContato: string;
    tipoSanguineo: string;
    rg: string;
    orgaoEmissor: string;
    certidaoNascimento: string;
    carteiraTrabalho: string;
    tituloEleitor: string;
    prontuarioFamiliar: string;
    corRaca: string;
    etnia: string;
    escolaridade: string;
    situacaoFamiliar: string;
}

interface CadastroPacienteComAutoCompleteProps {
    onSubmit: (data: CadastroPacienteFormDataType) => void | Promise<void>;
    onUpdate?: (data: CadastroPacienteFormDataType) => void | Promise<void>;
    onEditExistingPatient?: (paciente: Paciente) => void;
    isSubmitting?: boolean;
    submitButtonText?: string;
    updateButtonText?: string;
    initialData?: Partial<CadastroPacienteFormDataType>;
    onCancel?: () => void;
    isEditMode?: boolean;
}

const CadastroPacienteComAutoComplete: React.FC<CadastroPacienteComAutoCompleteProps> = ({
                                                                                             onSubmit,
                                                                                             onUpdate,
                                                                                             onEditExistingPatient,
                                                                                             isSubmitting = false,
                                                                                             submitButtonText = "Cadastrar",
                                                                                             updateButtonText = "Atualizar",
                                                                                             initialData,
                                                                                             onCancel,
                                                                                             isEditMode = false,
                                                                                         }) => {
    const [mostrarResultados, setMostrarResultados] = useState(false);
    const [pacienteSelecionado, setPacienteSelecionado] = useState<Paciente | null>(null);
    const [alert, setAlert] = useState<{ type: 'warning' | 'error' | 'info', message: string } | null>(null);
    const [pacienteExistente, setPacienteExistente] = useState<Paciente | null>(null);

    const inputRef = useRef<HTMLInputElement>(null);
    const resultadosRef = useRef<HTMLDivElement>(null);

    // ✅ Valores default completos
    const getDefaultValues = (): CadastroPacienteFormDataType => ({
        nomeCompleto: '',
        nomeSocial: '',
        cpf: '',
        justificativaAusenciaCpf: '',
        cns: '',
        sexo: '',
        dataNascimento: '',
        acamado: false,
        domiciliado: false,
        condSaudeMental: false,
        usaPlantas: false,
        outrasCondicoes: '',
        municipio: '',
        cep: '',
        logradouro: '',
        numero: '',
        bairro: '',
        complemento: '',
        telefoneCelular: '',
        telefoneContato: '',
        tipoSanguineo: '',
        rg: '',
        orgaoEmissor: '',
        certidaoNascimento: '',
        carteiraTrabalho: '',
        tituloEleitor: '',
        prontuarioFamiliar: '',
        corRaca: '',
        etnia: '',
        escolaridade: '',
        situacaoFamiliar: '',
    });

    // ✅ Processar dados iniciais usando o tipo correto
    const processInitialData = (data?: Partial<CadastroPacienteFormDataType>): CadastroPacienteFormDataType => {
        const defaultData = getDefaultValues();

        if (!data) return defaultData;

        return {
            ...defaultData,
            ...Object.fromEntries(
                Object.entries(data).map(([key, value]) => [
                    key,
                    value === null || value === undefined ?
                        (typeof defaultData[key as keyof CadastroPacienteFormDataType] === 'boolean' ? false : '') :
                        value
                ])
            )
        };
    };

    const {
        register,
        handleSubmit,
        reset,
        setValue,
        watch,
        formState: { errors, isSubmitting: formIsSubmitting, isValid }
    } = useForm<CadastroPacienteFormDataType>({
        resolver: zodResolver(cadastroPacienteSchema),
        defaultValues: processInitialData(initialData),
        mode: 'onChange'
    });

    // ✅ CORREÇÃO: Removido loop de validação que causava centenas de logs
    // Função de debug para logs de erros (apenas quando necessário)
    const logFormErrors = (errors: any) => {
        if (Object.keys(errors).length > 0) {
            console.log('🔍 Erros do formulário:', errors);
            Object.entries(errors).forEach(([field, error]: [string, any]) => {
                console.log(`❌ Campo ${field}:`, error?.message || error);
            });
        }
    };

    // Usar o valor do formulário como única fonte da verdade para a busca
    const nomeCompletoValue = watch('nomeCompleto') || '';
    const sexoValue = watch('sexo') || '';
    const cpfValue = watch('cpf') || '';

    // ✅ CORREÇÃO: Debug temporário removido (logs de debug não são mais necessários)

    const {
        pacientes,
        isLoading: loadingNome,
        buscarAutomatico
    } = usePacienteBusca();

    // ✅ CORREÇÃO: Usar reset para preencher o formulário quando initialData mudar
    useEffect(() => {
        if (initialData) {
            const maskedData = processInitialData({
                ...initialData,
                cpf: initialData.cpf ? aplicarMascaraCpf(initialData.cpf) : '',
                telefoneCelular: initialData.telefoneCelular ? aplicarMascaraTelefoneCelular(initialData.telefoneCelular) : '',
                telefoneContato: initialData.telefoneContato ? aplicarMascaraTelefoneFixo(initialData.telefoneContato) : '',
                dataNascimento: initialData.dataNascimento ? aplicarMascaraData(initialData.dataNascimento) : ''
            });
            // ✅ CORREÇÃO: Só resetar se realmente houver dados iniciais válidos
            if (Object.values(maskedData).some(value => value !== '' && value !== false)) {
                reset(maskedData);
            }
        }
    }, [initialData, reset]);

    // ✅ CORREÇÃO: Buscar automaticamente quando o nome muda com debounce
    useEffect(() => {
        // ✅ CORREÇÃO: Adicionar debounce para evitar interferência na validação
        const timeoutId = setTimeout(() => {
            if (nomeCompletoValue.trim().length >= 2) {
                buscarAutomatico(nomeCompletoValue.trim(), 'nome');
                setMostrarResultados(true);
            } else {
                setMostrarResultados(false);
            }
        }, 300); // 300ms de debounce

        return () => clearTimeout(timeoutId);
    }, [nomeCompletoValue, buscarAutomatico]);

    // ✅ CORREÇÃO: Verificar se paciente já existe baseado no CPF
    useEffect(() => {
        if (cpfValue && cpfValue.length >= 14 && !isEditMode) { // CPF com máscara completa
            const cpfLimpo = removerMascaraCpf(cpfValue);
            if (cpfLimpo.length === 11) {
                buscarAutomatico(cpfLimpo, 'cpf');

                // Verificar se encontrou paciente com o mesmo CPF após busca
                setTimeout(() => {
                    const pacienteComMesmoCpf = pacientes.find(p =>
                        removerMascaraCpf(p.cpf || '') === cpfLimpo
                    );

                    if (pacienteComMesmoCpf) {
                        setPacienteExistente(pacienteComMesmoCpf);
                        setAlert({
                            type: 'warning',
                            message: `Já existe um paciente cadastrado com este CPF: ${pacienteComMesmoCpf.nomeCompleto}`
                        });
                    } else {
                        setPacienteExistente(null);
                        setAlert(null);
                    }
                }, 500); // Pequeno delay para aguardar a busca
            }
        }
    }, [cpfValue, pacientes, buscarAutomatico, isEditMode]);

    // Lógica para fechar resultados quando clicar fora
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                resultadosRef.current && !resultadosRef.current.contains(event.target as Node) &&
                inputRef.current && !inputRef.current.contains(event.target as Node)
            ) {
                setMostrarResultados(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // ✅ CORREÇÃO: Corrigir tipos na função handlePacienteClick
    const handlePacienteClick = (paciente: Paciente) => {
        const dadosFormatados = processInitialData({
            ...paciente,
            cpf: paciente.cpf ? aplicarMascaraCpf(paciente.cpf) : '',
            telefoneCelular: paciente.telefoneCelular ? aplicarMascaraTelefoneCelular(paciente.telefoneCelular) : '',
            telefoneContato: paciente.telefoneContato ? aplicarMascaraTelefoneFixo(paciente.telefoneContato) : '',
            dataNascimento: paciente.dataNascimento ? aplicarMascaraData(paciente.dataNascimento) : '',
        });

        // ✅ CORREÇÃO: Usar reset em vez de setValue para evitar conflitos
        reset(dadosFormatados);

        setPacienteSelecionado(paciente);
        setMostrarResultados(false);
    };

    // ✅ CORREÇÃO: Handlers usando SubmitHandler explicitamente
    const handleFormSubmit: SubmitHandler<CadastroPacienteFormDataType> = async (data) => {
        console.log('🔍 handleFormSubmit chamado com dados:', data);

        // ✅ NOVA VALIDAÇÃO: Impedir cadastro se paciente já existe
        if (pacienteExistente && !isEditMode) {
            setAlert({
                type: 'error',
                message: 'Não é possível cadastrar. Este paciente já existe no sistema!'
            });
            return;
        }

        // Remover máscaras
        const dadosLimpos = { ...data };
        if (dadosLimpos.cpf) {
            dadosLimpos.cpf = removerMascaraCpf(dadosLimpos.cpf);
        }
        if (dadosLimpos.telefoneCelular) {
            dadosLimpos.telefoneCelular = removerMascaraTelefone(dadosLimpos.telefoneCelular);
        }
        if (dadosLimpos.telefoneContato) {
            dadosLimpos.telefoneContato = removerMascaraTelefone(dadosLimpos.telefoneContato);
        }
        if (dadosLimpos.dataNascimento) {
            dadosLimpos.dataNascimento = removerMascaraData(dadosLimpos.dataNascimento);
        }

        console.log('🔍 Dados limpos para envio:', dadosLimpos);
        console.log('🔄 Chamando onSubmit com dados limpos');

        try {
            await onSubmit(dadosLimpos);
            console.log('✅ onSubmit chamado com sucesso');
        } catch (error) {
            console.error('❌ Erro no onSubmit:', error);
        }
    };

    const handleManualSubmit = async () => {
        console.log('🔍 Cadastrar button clicked (manual)');
        await handleSubmit(handleFormSubmit)();
    };

    // ✅ NOVA FUNCIONALIDADE: Botão para editar paciente existente
    const handleEditExistingPatient = () => {
        if (pacienteExistente && onEditExistingPatient) {
            onEditExistingPatient(pacienteExistente);
        }
    };

    // ✅ CORREÇÃO: Handler para onUpdate tipado corretamente
    const handleUpdateSubmit: SubmitHandler<CadastroPacienteFormDataType> = async (data) => {
        if (!onUpdate) return;

        const dadosLimpos = { ...data };
        if (dadosLimpos.cpf) {
            dadosLimpos.cpf = removerMascaraCpf(dadosLimpos.cpf);
        }
        if (dadosLimpos.telefoneCelular) {
            dadosLimpos.telefoneCelular = removerMascaraTelefone(dadosLimpos.telefoneCelular);
        }
        if (dadosLimpos.telefoneContato) {
            dadosLimpos.telefoneContato = removerMascaraTelefone(dadosLimpos.telefoneContato);
        }
        if (dadosLimpos.dataNascimento) {
            dadosLimpos.dataNascimento = removerMascaraData(dadosLimpos.dataNascimento);
        }

        try {
            await onUpdate(dadosLimpos);
        } catch (error) {
            console.error('❌ Erro no onUpdate:', error);
        }
    };

    return (
        <div className="w-full max-w-4xl mx-auto p-6 space-y-6">
            {/* Header com informações do contexto */}
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                    <User className="h-6 w-6 text-blue-600" />
                    <h2 className="text-2xl font-bold text-gray-900">
                        {isEditMode ? 'Editar Paciente' : 'Cadastro de Paciente'}
                    </h2>
                </div>
            </div>

            {/* Alert para paciente existente */}
            {alert && (
                <Alert variant={alert.type === 'error' ? 'destructive' : 'default'} className="mb-4">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription className="flex justify-between items-center">
                        <span>{alert.message}</span>
                        {pacienteExistente && !isEditMode && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleEditExistingPatient}
                                className="ml-4"
                            >
                                <Edit2 className="h-4 w-4 mr-1" />
                                Editar Paciente
                            </Button>
                        )}
                    </AlertDescription>
                </Alert>
            )}

            <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
                {/* Seção 1: Dados Pessoais */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                            <User className="h-5 w-5" />
                            <span>Dados Pessoais</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {/* Campo Nome com AutoComplete */}
                        <div className="relative">
                            <Label htmlFor="nomeCompleto">Nome Completo *</Label>
                            <div className="relative">
                                <Input
                                    {...register('nomeCompleto')}
                                    placeholder="Digite o nome completo do paciente"
                                    className={`pr-10 ${errors.nomeCompleto ? 'border-red-500' : ''}`}
                                    autoComplete="off"
                                />
                                <Search className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
                            </div>
                            {errors.nomeCompleto && (
                                <p className="mt-1 text-sm text-red-600">{errors.nomeCompleto.message}</p>
                            )}

                            {/* Resultados da busca */}
                            {mostrarResultados && pacientes.length > 0 && (
                                <div
                                    ref={resultadosRef}
                                    className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto"
                                >
                                    {pacientes.slice(0, 10).map((paciente) => (
                                        <div
                                            key={paciente.id}
                                            onClick={() => handlePacienteClick(paciente)}
                                            className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                                        >
                                            <div className="font-medium text-gray-900">
                                                {formatarNomeComIndicador(paciente)}
                                            </div>
                                            <div className="text-sm text-gray-600 mt-1 space-y-1">
                                                {paciente.cpf && (
                                                    <div>CPF: {formatarCpf(paciente.cpf)}</div>
                                                )}
                                                {paciente.dataNascimento && (
                                                    <div>Nascimento: {new Date(paciente.dataNascimento).toLocaleDateString('pt-BR')}</div>
                                                )}
                                                {paciente.telefoneCelular && (
                                                    <div>Celular: {formatarTelefone(paciente.telefoneCelular)}</div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="nomeSocial">Nome Social</Label>
                                <Input
                                    {...register('nomeSocial')}
                                    placeholder="Nome social (se diferente do nome completo)"
                                    className={errors.nomeSocial ? 'border-red-500' : ''}
                                />
                                {errors.nomeSocial && (
                                    <p className="mt-1 text-sm text-red-600">{errors.nomeSocial.message}</p>
                                )}
                            </div>

                            <div>
                                <Label htmlFor="sexo">Sexo</Label>
                                <Select onValueChange={(value) => setValue('sexo', value)} value={sexoValue}>
                                    <SelectTrigger className={errors.sexo ? 'border-red-500' : ''}>
                                        <SelectValue placeholder="Selecione o sexo" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="MASCULINO">Masculino</SelectItem>
                                        <SelectItem value="FEMININO">Feminino</SelectItem>
                                        <SelectItem value="OUTRO">Outro</SelectItem>
                                    </SelectContent>
                                </Select>
                                {errors.sexo && (
                                    <p className="mt-1 text-sm text-red-600">{errors.sexo.message}</p>
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="cpf">CPF</Label>
                                <Input
                                    {...register('cpf')}
                                    placeholder="000.000.000-00"
                                    className={errors.cpf ? 'border-red-500' : ''}
                                    onChange={(e) => {
                                        const maskedValue = aplicarMascaraCpf(e.target.value);
                                        setValue('cpf', maskedValue);
                                    }}
                                />
                                {errors.cpf && (
                                    <p className="mt-1 text-sm text-red-600">{errors.cpf.message}</p>
                                )}
                            </div>

                            <div>
                                <Label htmlFor="dataNascimento">Data de Nascimento</Label>
                                <Input
                                    {...register('dataNascimento')}
                                    placeholder="dd/mm/aaaa"
                                    className={errors.dataNascimento ? 'border-red-500' : ''}
                                    onChange={(e) => {
                                        const maskedValue = aplicarMascaraData(e.target.value);
                                        setValue('dataNascimento', maskedValue);
                                    }}
                                />
                                {errors.dataNascimento && (
                                    <p className="mt-1 text-sm text-red-600">{errors.dataNascimento.message}</p>
                                )}
                            </div>
                        </div>

                        <div>
                            <Label htmlFor="justificativaAusenciaCpf">Justificativa para Ausência do CPF</Label>
                            <Textarea
                                {...register('justificativaAusenciaCpf')}
                                placeholder="Informe a justificativa caso o CPF não seja fornecido"
                                rows={3}
                                className={errors.justificativaAusenciaCpf ? 'border-red-500' : ''}
                            />
                            {errors.justificativaAusenciaCpf && (
                                <p className="mt-1 text-sm text-red-600">{errors.justificativaAusenciaCpf.message}</p>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Seção 2: Documentos e Contato */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                            <FileText className="h-5 w-5" />
                            <span>Documentos e Contato</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="cns">Cartão SUS (CNS)</Label>
                                <Input
                                    {...register('cns')}
                                    placeholder="000000000000000"
                                    maxLength={15}
                                    className={errors.cns ? 'border-red-500' : ''}
                                />
                                {errors.cns && (
                                    <p className="mt-1 text-sm text-red-600">{errors.cns.message}</p>
                                )}
                            </div>

                            <div>
                                <Label htmlFor="rg">RG</Label>
                                <Input
                                    {...register('rg')}
                                    placeholder="00.000.000-0"
                                    className={errors.rg ? 'border-red-500' : ''}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="telefoneCelular">Telefone Celular</Label>
                                <Input
                                    {...register('telefoneCelular')}
                                    placeholder="(00) 00000-0000"
                                    className={errors.telefoneCelular ? 'border-red-500' : ''}
                                    onChange={(e) => {
                                        const maskedValue = aplicarMascaraTelefoneCelular(e.target.value);
                                        setValue('telefoneCelular', maskedValue);
                                    }}
                                />
                                {errors.telefoneCelular && (
                                    <p className="mt-1 text-sm text-red-600">{errors.telefoneCelular.message}</p>
                                )}
                            </div>

                            <div>
                                <Label htmlFor="telefoneContato">Telefone de Contato</Label>
                                <Input
                                    {...register('telefoneContato')}
                                    placeholder="(00) 0000-0000"
                                    className={errors.telefoneContato ? 'border-red-500' : ''}
                                    onChange={(e) => {
                                        const maskedValue = aplicarMascaraTelefoneFixo(e.target.value);
                                        setValue('telefoneContato', maskedValue);
                                    }}
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Seção 3: Endereço */}
                <Card>
                    <CardHeader>
                        <CardTitle>Endereço</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="municipio">Município</Label>
                                <Input
                                    {...register('municipio')}
                                    placeholder="Nome do município"
                                    className={errors.municipio ? 'border-red-500' : ''}
                                />
                                {errors.municipio && (
                                    <p className="mt-1 text-sm text-red-600">{errors.municipio.message}</p>
                                )}
                            </div>

                            <div>
                                <Label htmlFor="cep">CEP</Label>
                                <Input
                                    {...register('cep')}
                                    placeholder="00000-000"
                                    className={errors.cep ? 'border-red-500' : ''}
                                />
                            </div>
                        </div>

                        <div>
                            <Label htmlFor="logradouro">Logradouro</Label>
                            <Input
                                {...register('logradouro')}
                                placeholder="Rua, Avenida, etc."
                                className={errors.logradouro ? 'border-red-500' : ''}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <Label htmlFor="numero">Número</Label>
                                <Input
                                    {...register('numero')}
                                    placeholder="123"
                                    className={errors.numero ? 'border-red-500' : ''}
                                />
                            </div>

                            <div>
                                <Label htmlFor="bairro">Bairro</Label>
                                <Input
                                    {...register('bairro')}
                                    placeholder="Nome do bairro"
                                    className={errors.bairro ? 'border-red-500' : ''}
                                />
                            </div>

                            <div>
                                <Label htmlFor="complemento">Complemento</Label>
                                <Input
                                    {...register('complemento')}
                                    placeholder="Apto, Bloco, etc."
                                    className={errors.complemento ? 'border-red-500' : ''}
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Seção 4: Condições de Saúde */}
                <Card>
                    <CardHeader>
                        <CardTitle>Condições de Saúde</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        {...register('acamado')}
                                        id="acamado"
                                    />
                                    <Label htmlFor="acamado">Acamado</Label>
                                </div>

                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        {...register('domiciliado')}
                                        id="domiciliado"
                                    />
                                    <Label htmlFor="domiciliado">Domiciliado</Label>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        {...register('condSaudeMental')}
                                        id="condSaudeMental"
                                    />
                                    <Label htmlFor="condSaudeMental">Condições de Saúde Mental</Label>
                                </div>

                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        {...register('usaPlantas')}
                                        id="usaPlantas"
                                    />
                                    <Label htmlFor="usaPlantas">Usa Plantas Medicinais</Label>
                                </div>
                            </div>
                        </div>

                        <div>
                            <Label htmlFor="outrasCondicoes">Outras Condições</Label>
                            <Textarea
                                {...register('outrasCondicoes')}
                                placeholder="Descreva outras condições de saúde relevantes"
                                rows={3}
                                className={errors.outrasCondicoes ? 'border-red-500' : ''}
                            />
                        </div>
                    </CardContent>
                </Card>

                <Separator />

                {/* Botões de Ação */}
                <div className="flex flex-col sm:flex-row gap-4 pt-6">
                    {isEditMode && onUpdate ? (
                        <Button
                            type="button"
                            onClick={handleSubmit(handleUpdateSubmit)}
                            disabled={isSubmitting || formIsSubmitting || !isValid}
                            className="flex-1 bg-blue-600 hover:bg-blue-700"
                        >
                            {isSubmitting || formIsSubmitting ? 'Atualizando...' : updateButtonText}
                        </Button>
                    ) : (
                        <Button
                            type="button"
                            onClick={handleManualSubmit}
                            disabled={isSubmitting || formIsSubmitting || !isValid || !!pacienteExistente}
                            className="flex-1 bg-green-600 hover:bg-green-700"
                        >
                            {isSubmitting || formIsSubmitting ? 'Cadastrando...' : submitButtonText}
                        </Button>
                    )}

                    {onCancel && (
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onCancel}
                            disabled={isSubmitting || formIsSubmitting}
                            className="flex-1"
                        >
                            Cancelar
                        </Button>
                    )}
                </div>
            </form>
        </div>
    );
};

export default CadastroPacienteComAutoComplete;