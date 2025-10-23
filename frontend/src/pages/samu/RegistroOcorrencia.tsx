
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card.tsx';
import { Button } from '@/components/ui/button.tsx';
import { Input } from '@/components/ui/input.tsx';
import { Textarea } from '@/components/ui/textarea.tsx';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.tsx';
import { Label } from '@/components/ui/label.tsx';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs.tsx';
import { Alert, AlertDescription } from '@/components/ui/alert.tsx';
import { Badge } from '@/components/ui/badge.tsx';
import { Phone, MapPin, User, Clock, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

// ✅ Schema de validação CORRIGIDO com latitude e longitude
const registroOcorrenciaSchema = z.object({
    tipoOcorrencia: z.enum(['PRE_HOSPITALAR', 'INTER_HOSPITALAR', 'APOIO_TERRESTRE', 'APOIO_AEREO']),
    telefoneSolicitante: z.string().min(10, 'Telefone deve ter pelo menos 10 dígitos'),
    nomeSolicitante: z.string().optional(),
    enderecoCompleto: z.string().min(10, 'Endereço deve ser detalhado'),
    descricaoOcorrencia: z.string().min(10, 'Descrição deve ser detalhada'),
    queixaPrincipal: z.string().optional(),
    centralRegulacaoId: z.number().min(1, 'Central de regulação é obrigatória'),
    prioridade: z.enum(['EMERGENCIA', 'URGENCIA', 'PRIORIDADE_ALTA', 'PRIORIDADE_MEDIA', 'PRIORIDADE_BAIXA']),
    observacoes: z.string().optional(),
    // ✅ CAMPOS DE COORDENADAS ADICIONADOS
    latitude: z.number().optional(),
    longitude: z.number().optional(),
    pacientes: z.array(z.object({
        nomeInformado: z.string().min(2, 'Nome é obrigatório'),
        idadeAnos: z.number().min(0).max(120).optional(),
        idadeMeses: z.number().min(0).max(11).optional(),
        sexo: z.enum(['M', 'F', 'N']).optional(),
        queixaEspecifica: z.string().optional()
    })).optional()
});

type RegistroOcorrencia = z.infer<typeof registroOcorrenciaSchema>;

interface CentralRegulacao {
    id: number;
    nome: string;
    codigo: string;
}

// 🚑 Tipos de ocorrência SAMU
const TIPOS_OCORRENCIA = [
    { value: 'PRE_HOSPITALAR', label: 'Pré-hospitalar', icon: '🚑', description: 'Atendimento em via pública, residências' },
    { value: 'INTER_HOSPITALAR', label: 'Inter-hospitalar', icon: '🏥', description: 'Transferência entre hospitais' },
    { value: 'APOIO_TERRESTRE', label: 'Apoio Terrestre', icon: '🚐', description: 'Suporte com unidade terrestre' },
    { value: 'APOIO_AEREO', label: 'Apoio Aéreo', icon: '🚁', description: 'Resgate com helicóptero/avião' }
];

// 🔥 Prioridades de emergência
const PRIORIDADES = [
    { value: 'EMERGENCIA', label: 'Emergência', color: 'bg-red-500', textColor: 'text-white', description: 'Risco iminente de morte' },
    { value: 'URGENCIA', label: 'Urgência', color: 'bg-orange-500', textColor: 'text-white', description: 'Situação crítica' },
    { value: 'PRIORIDADE_ALTA', label: 'Prioridade Alta', color: 'bg-yellow-500', textColor: 'text-black', description: 'Necessita atendimento rápido' },
    { value: 'PRIORIDADE_MEDIA', label: 'Prioridade Média', color: 'bg-green-500', textColor: 'text-white', description: 'Atendimento dentro do prazo' },
    { value: 'PRIORIDADE_BAIXA', label: 'Prioridade Baixa', color: 'bg-blue-500', textColor: 'text-white', description: 'Não urgente' }
];

export function RegistroOcorrencia() {
    const [centraisRegulacao, setCentralRegulacao] = useState<CentralRegulacao[]>([]);
    const [coordenadas, setCoordenadas] = useState<{ lat: number; lng: number } | null>(null);
    const [buscandoLocalizacao, setBuscandoLocalizacao] = useState(false);
    const [pacientes, setPacientes] = useState([{ id: Date.now() }]);

    const {
        register,
        handleSubmit,
        control,
        watch,
        setValue,
        formState: { errors, isSubmitting }
    } = useForm<RegistroOcorrencia>({
        resolver: zodResolver(registroOcorrenciaSchema),
        defaultValues: {
            pacientes: [{}],
            latitude: undefined,
            longitude: undefined
        }
    });

    const tipoSelecionado = watch('tipoOcorrencia');
    const telefoneSolicitante = watch('telefoneSolicitante');
    const enderecoCompleto = watch('enderecoCompleto');
    const prioridadeSelecionada = watch('prioridade');

    useEffect(() => {
        carregarCentralRegulacao();
    }, []);

    const carregarCentralRegulacao = async () => {
        try {
            // Implementar chamada para API
            const response = await fetch('/api/samu/centrais-regulacao');
            const data = await response.json();
            setCentralRegulacao(data.data || []);
        } catch (error) {
            console.error('Erro ao carregar centrais:', error);
            toast.error('Erro ao carregar centrais de regulação');
        }
    };

    // ✅ BUSCAR COORDENADAS CORRIGIDO
    const buscarCoordenadas = async () => {
        if (!enderecoCompleto) {
            toast.warning('Digite um endereço primeiro');
            return;
        }

        setBuscandoLocalizacao(true);
        try {
            // Implementar geocoding
            const response = await fetch(`/api/samu/geocode?endereco=${encodeURIComponent(enderecoCompleto)}`);
            const data = await response.json();

            if (data.success && data.data) {
                const { latitude, longitude } = data.data;

                setCoordenadas({ lat: latitude, lng: longitude });

                // ✅ CORREÇÃO: setValue agora usa os campos corretos do schema
                setValue('latitude', latitude);
                setValue('longitude', longitude);

                toast.success('📍 Localização encontrada no mapa');
            } else {
                toast.error('❌ Endereço não encontrado');
            }
        } catch (error) {
            console.error('Erro ao buscar coordenadas:', error);
            toast.error('Erro ao localizar endereço');
        } finally {
            setBuscandoLocalizacao(false);
        }
    };

    const obterLocalizacaoAtual = () => {
        if (!navigator.geolocation) {
            toast.error('Geolocalização não suportada pelo navegador');
            return;
        }

        setBuscandoLocalizacao(true);
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const lat = position.coords.latitude;
                const lng = position.coords.longitude;

                setCoordenadas({ lat, lng });
                setValue('latitude', lat);
                setValue('longitude', lng);

                toast.success('📍 Localização atual obtida');
                setBuscandoLocalizacao(false);
            },
            (error) => {
                console.error('Erro ao obter localização:', error);
                toast.error('Erro ao obter localização atual');
                setBuscandoLocalizacao(false);
            }
        );
    };

    const copiarTelefone = () => {
        if (telefoneSolicitante) {
            navigator.clipboard.writeText(telefoneSolicitante);
            toast.success('📞 Telefone copiado para área de transferência');
        }
    };

    const adicionarPaciente = () => {
        setPacientes(prev => [...prev, { id: Date.now() }]);
        toast.success('👤 Paciente adicionado');
    };

    const removerPaciente = (index: number) => {
        if (pacientes.length > 1) {
            setPacientes(prev => prev.filter((_, i) => i !== index));
            toast.success('👤 Paciente removido');
        } else {
            toast.warning('Deve haver pelo menos um paciente');
        }
    };

    const onSubmit = async (data: RegistroOcorrencia) => {
        try {
            const payload = {
                ...data,
                // Garantir que as coordenadas sejam incluídas
                latitude: coordenadas?.lat || data.latitude,
                longitude: coordenadas?.lng || data.longitude,
                // Adicionar metadados do registro
                dataHoraRegistro: new Date().toISOString(),
                statusOcorrencia: 'REGISTRADA'
            };

            const response = await fetch('/api/samu/ocorrencias', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Operador-Id': '1' // Pegar do contexto de auth
                },
                body: JSON.stringify(payload)
            });

            const result = await response.json();

            if (result.success) {
                toast.success('🎉 Ocorrência registrada com sucesso!');
                // Reset form ou redirect para dashboard
                // window.location.href = '/samu/dashboard';
            } else {
                toast.error(result.message || 'Erro ao registrar ocorrência');
            }
        } catch (error) {
            console.error('Erro ao registrar ocorrência:', error);
            toast.error('❌ Erro interno do sistema');
        }
    };

    const getPrioridadeConfig = (prioridade: string) => {
        return PRIORIDADES.find(p => p.value === prioridade) || PRIORIDADES[4];
    };

    const getTipoConfig = (tipo: string) => {
        return TIPOS_OCORRENCIA.find(t => t.value === tipo);
    };

    return (
        <div className="container mx-auto p-6 max-w-6xl">
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    🚑 Registro de Ocorrência SAMU
                </h1>
                <p className="text-gray-600">
                    Registre uma nova ocorrência de urgência/emergência
                </p>

                {/* ✅ INDICADOR DE PRIORIDADE */}
                {prioridadeSelecionada && (
                    <div className="mt-3">
                        <Badge className={`${getPrioridadeConfig(prioridadeSelecionada).color} ${getPrioridadeConfig(prioridadeSelecionada).textColor}`}>
                            🚨 {getPrioridadeConfig(prioridadeSelecionada).label}
                        </Badge>
                    </div>
                )}
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <Tabs defaultValue="basico" className="w-full">
                    <TabsList className="grid w-full grid-cols-4">
                        <TabsTrigger value="basico">📋 Dados Básicos</TabsTrigger>
                        <TabsTrigger value="localizacao">📍 Localização</TabsTrigger>
                        <TabsTrigger value="pacientes">👥 Pacientes</TabsTrigger>
                        <TabsTrigger value="observacoes">📝 Observações</TabsTrigger>
                    </TabsList>

                    {/* ✅ ABA DADOS BÁSICOS APRIMORADA */}
                    <TabsContent value="basico" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Phone className="h-5 w-5" />
                                    Informações da Ocorrência
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="tipoOcorrencia">Tipo de Ocorrência *</Label>
                                        <Select onValueChange={(value) => setValue('tipoOcorrencia', value as any)}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Selecione o tipo" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {TIPOS_OCORRENCIA.map(tipo => (
                                                    <SelectItem key={tipo.value} value={tipo.value}>
                                                        <div className="flex flex-col">
                                                            <span className="flex items-center gap-2">
                                                                <span>{tipo.icon}</span>
                                                                {tipo.label}
                                                            </span>
                                                            <span className="text-xs text-gray-500">{tipo.description}</span>
                                                        </div>
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {errors.tipoOcorrencia && (
                                            <p className="text-sm text-red-500 mt-1">{errors.tipoOcorrencia.message}</p>
                                        )}
                                    </div>

                                    <div>
                                        <Label htmlFor="centralRegulacaoId">Central de Regulação *</Label>
                                        <Select onValueChange={(value) => setValue('centralRegulacaoId', parseInt(value))}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Selecione a central" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {centraisRegulacao.map(central => (
                                                    <SelectItem key={central.id} value={central.id.toString()}>
                                                        {central.nome} ({central.codigo})
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {errors.centralRegulacaoId && (
                                            <p className="text-sm text-red-500 mt-1">{errors.centralRegulacaoId.message}</p>
                                        )}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="telefoneSolicitante">Telefone do Solicitante *</Label>
                                        <div className="flex gap-2">
                                            <Input
                                                {...register('telefoneSolicitante')}
                                                placeholder="(11) 99999-9999"
                                                className="flex-1"
                                            />
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={copiarTelefone}
                                                disabled={!telefoneSolicitante}
                                                title="Copiar telefone"
                                            >
                                                📋
                                            </Button>
                                        </div>
                                        {errors.telefoneSolicitante && (
                                            <p className="text-sm text-red-500 mt-1">{errors.telefoneSolicitante.message}</p>
                                        )}
                                    </div>

                                    <div>
                                        <Label htmlFor="nomeSolicitante">Nome do Solicitante</Label>
                                        <Input
                                            {...register('nomeSolicitante')}
                                            placeholder="Nome da pessoa que está ligando"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <Label htmlFor="prioridade">Prioridade *</Label>
                                    <Select onValueChange={(value) => setValue('prioridade', value as any)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Selecione a prioridade" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {PRIORIDADES.map(prioridade => (
                                                <SelectItem key={prioridade.value} value={prioridade.value}>
                                                    <div className="flex flex-col">
                                                        <div className="flex items-center gap-2">
                                                            <Badge className={`${prioridade.color} ${prioridade.textColor} text-xs`}>
                                                                {prioridade.label}
                                                            </Badge>
                                                        </div>
                                                        <span className="text-xs text-gray-500 mt-1">{prioridade.description}</span>
                                                    </div>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.prioridade && (
                                        <p className="text-sm text-red-500 mt-1">{errors.prioridade.message}</p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* ✅ ABA LOCALIZAÇÃO APRIMORADA */}
                    <TabsContent value="localizacao" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <MapPin className="h-5 w-5" />
                                    Localização da Ocorrência
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <Label htmlFor="enderecoCompleto">Endereço Completo *</Label>
                                    <div className="flex gap-2">
                                        <Textarea
                                            {...register('enderecoCompleto')}
                                            placeholder="Endereço completo com pontos de referência..."
                                            className="flex-1"
                                            rows={3}
                                        />
                                        <div className="flex flex-col gap-2">
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={buscarCoordenadas}
                                                disabled={!enderecoCompleto || buscandoLocalizacao}
                                                title="Buscar no mapa"
                                            >
                                                {buscandoLocalizacao ? '🔄' : '📍'}
                                            </Button>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={obterLocalizacaoAtual}
                                                disabled={buscandoLocalizacao}
                                                title="Usar localização atual"
                                            >
                                                🎯
                                            </Button>
                                        </div>
                                    </div>
                                    {errors.enderecoCompleto && (
                                        <p className="text-sm text-red-500 mt-1">{errors.enderecoCompleto.message}</p>
                                    )}
                                </div>

                                {/* ✅ INDICADOR DE COORDENADAS */}
                                {coordenadas && (
                                    <Alert className="border-green-200 bg-green-50">
                                        <MapPin className="h-4 w-4 text-green-600" />
                                        <AlertDescription className="text-green-800">
                                            <strong>📍 Localização encontrada:</strong><br />
                                            Latitude: {coordenadas.lat.toFixed(6)}<br />
                                            Longitude: {coordenadas.lng.toFixed(6)}
                                        </AlertDescription>
                                    </Alert>
                                )}

                                <div>
                                    <Label htmlFor="descricaoOcorrencia">Descrição da Ocorrência *</Label>
                                    <Textarea
                                        {...register('descricaoOcorrencia')}
                                        placeholder="Descreva detalhadamente a situação..."
                                        rows={4}
                                    />
                                    {errors.descricaoOcorrencia && (
                                        <p className="text-sm text-red-500 mt-1">{errors.descricaoOcorrencia.message}</p>
                                    )}
                                </div>

                                <div>
                                    <Label htmlFor="queixaPrincipal">Queixa Principal</Label>
                                    <Input
                                        {...register('queixaPrincipal')}
                                        placeholder="Ex: Dor no peito, dificuldade respiratória..."
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* ✅ ABA PACIENTES MELHORADA */}
                    <TabsContent value="pacientes" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <User className="h-5 w-5" />
                                    Pacientes Envolvidos ({pacientes.length})
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {pacientes.map((paciente, index) => (
                                    <div key={paciente.id} className="border rounded-lg p-4 space-y-4 bg-gray-50">
                                        <div className="flex justify-between items-center">
                                            <h4 className="font-medium">👤 Paciente {index + 1}</h4>
                                            {pacientes.length > 1 && (
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => removerPaciente(index)}
                                                    className="text-red-600 hover:text-red-800"
                                                >
                                                    ❌ Remover
                                                </Button>
                                            )}
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <div>
                                                <Label>Nome do Paciente *</Label>
                                                <Input
                                                    {...register(`pacientes.${index}.nomeInformado`)}
                                                    placeholder="Nome completo"
                                                />
                                                {errors.pacientes?.[index]?.nomeInformado && (
                                                    <p className="text-sm text-red-500 mt-1">
                                                        {errors.pacientes[index]?.nomeInformado?.message}
                                                    </p>
                                                )}
                                            </div>

                                            <div>
                                                <Label>Idade (Anos)</Label>
                                                <Input
                                                    type="number"
                                                    {...register(`pacientes.${index}.idadeAnos`, { valueAsNumber: true })}
                                                    placeholder="Ex: 45"
                                                    min="0"
                                                    max="120"
                                                />
                                            </div>

                                            <div>
                                                <Label>Sexo</Label>
                                                <Select onValueChange={(value) => setValue(`pacientes.${index}.sexo`, value as any)}>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Selecione" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="M">👨 Masculino</SelectItem>
                                                        <SelectItem value="F">👩 Feminino</SelectItem>
                                                        <SelectItem value="N">❓ Não informado</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>

                                        <div>
                                            <Label>Queixa Específica do Paciente</Label>
                                            <Textarea
                                                {...register(`pacientes.${index}.queixaEspecifica`)}
                                                placeholder="Sintomas específicos deste paciente..."
                                                rows={2}
                                            />
                                        </div>
                                    </div>
                                ))}

                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={adicionarPaciente}
                                    className="w-full"
                                >
                                    ➕ Adicionar Paciente
                                </Button>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* ✅ ABA OBSERVAÇÕES */}
                    <TabsContent value="observacoes" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>📝 Observações Adicionais</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div>
                                    <Label htmlFor="observacoes">Observações</Label>
                                    <Textarea
                                        {...register('observacoes')}
                                        placeholder="Informações adicionais relevantes para o atendimento..."
                                        rows={6}
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>

                {/* ✅ BOTÕES DE AÇÃO APRIMORADOS */}
                <div className="flex justify-between">
                    <Button type="button" variant="outline" disabled={isSubmitting}>
                        <Clock className="h-4 w-4 mr-2" />
                        💾 Salvar Rascunho
                    </Button>

                    <div className="flex gap-2">
                        <Button type="button" variant="outline" disabled={isSubmitting}>
                            ❌ Cancelar
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? '⏳ Registrando...' : '✅ Registrar Ocorrência'}
                        </Button>
                        <Button
                            type="button"
                            variant="default"
                            className="bg-orange-500 hover:bg-orange-600"
                            disabled={isSubmitting}
                            onClick={() => {
                                // Registrar e encaminhar para regulação
                                handleSubmit((data) => {
                                    onSubmit(data).then(() => {
                                        toast.success('🚁 Encaminhando para regulação...');
                                        // Encaminhar para regulação
                                    });
                                })();
                            }}
                        >
                            <AlertTriangle className="h-4 w-4 mr-2" />
                            🚨 Registrar e Encaminhar
                        </Button>
                    </div>
                </div>
            </form>
        </div>
    );
}

export default RegistroOcorrencia;