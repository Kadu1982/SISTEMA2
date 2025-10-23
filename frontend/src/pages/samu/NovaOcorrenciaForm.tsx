import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Phone, MapPin, User, AlertTriangle, Clock, Save, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

interface FormData {
    // Dados da Chamada
    telefone: string;
    endereco: string;
    bairro: string;
    pontoReferencia: string;

    // Dados do Paciente
    nomeInformado: string;
    idadeAnos: number | '';
    idadeMeses: number | '';
    sexo: string;

    // Queixa e Situação
    queixaPrincipal: string;
    queixaEspecifica: string;
    situacaoEncontrada: string;

    // Avaliação Inicial
    consciente: string;
    respirando: string;
    temPulso: string;

    // Sinais Vitais (se informados)
    pressaoArterial: string;
    frequenciaCardiaca: number | '';
    temperatura: number | '';
}

const NovaOcorrenciaForm: React.FC = () => {
    const [formData, setFormData] = useState<FormData>({
        telefone: '',
        endereco: '',
        bairro: '',
        pontoReferencia: '',
        nomeInformado: '',
        idadeAnos: '',
        idadeMeses: '',
        sexo: '',
        queixaPrincipal: '',
        queixaEspecifica: '',
        situacaoEncontrada: '',
        consciente: '',
        respirando: '',
        temPulso: '',
        pressaoArterial: '',
        frequenciaCardiaca: '',
        temperatura: ''
    });

    const [riscoPresumido, setRiscoPresumido] = useState<string>('');
    const [salvando, setSalvando] = useState(false);

    // Calcular risco presumido baseado nas respostas
    React.useEffect(() => {
        let risco = 'INDETERMINADO';

        if (formData.consciente === 'NAO' || formData.respirando === 'NAO' || formData.temPulso === 'NAO') {
            risco = 'CRITICO';
        } else if (
            formData.queixaEspecifica.toLowerCase().includes('dor no peito') ||
            formData.queixaEspecifica.toLowerCase().includes('falta de ar') ||
            formData.queixaEspecifica.toLowerCase().includes('convulsão')
        ) {
            risco = 'ALTO';
        } else if (
            formData.queixaEspecifica.toLowerCase().includes('febre') ||
            formData.queixaEspecifica.toLowerCase().includes('vômito') ||
            (typeof formData.idadeAnos === 'number' && formData.idadeAnos > 65)
        ) {
            risco = 'MODERADO';
        } else if (formData.queixaEspecifica) {
            risco = 'BAIXO';
        }

        setRiscoPresumido(risco);
    }, [formData.consciente, formData.respirando, formData.temPulso, formData.queixaEspecifica, formData.idadeAnos]);

    const handleInputChange = (field: keyof FormData, value: string | number) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSalvando(true);

        try {
            // Validações básicas
            if (!formData.telefone || !formData.endereco || !formData.queixaPrincipal) {
                toast.error('Telefone, endereço e queixa principal são obrigatórios');
                return;
            }

            // Simular salvamento (substituir por API real)
            await new Promise(resolve => setTimeout(resolve, 1500));

            const numeroOcorrencia = `SAM${new Date().getFullYear()}${String(Math.floor(Math.random() * 9999)).padStart(4, '0')}`;

            toast.success(`Ocorrência ${numeroOcorrencia} criada com sucesso!`);

            // Reset form
            setFormData({
                telefone: '',
                endereco: '',
                bairro: '',
                pontoReferencia: '',
                nomeInformado: '',
                idadeAnos: '',
                idadeMeses: '',
                sexo: '',
                queixaPrincipal: '',
                queixaEspecifica: '',
                situacaoEncontrada: '',
                consciente: '',
                respirando: '',
                temPulso: '',
                pressaoArterial: '',
                frequenciaCardiaca: '',
                temperatura: ''
            });

        } catch (error) {
            toast.error('Erro ao criar ocorrência. Tente novamente.');
        } finally {
            setSalvando(false);
        }
    };

    const getRiscoColor = (risco: string) => {
        switch (risco) {
            case 'CRITICO': return 'bg-red-600 text-white';
            case 'ALTO': return 'bg-red-500 text-white';
            case 'MODERADO': return 'bg-yellow-500 text-white';
            case 'BAIXO': return 'bg-green-500 text-white';
            default: return 'bg-gray-500 text-white';
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Avaliação de Risco */}
            {riscoPresumido && (
                <Alert className={`border-2 ${riscoPresumido === 'CRITICO' ? 'border-red-500 bg-red-50' :
                    riscoPresumido === 'ALTO' ? 'border-red-400 bg-red-50' :
                        riscoPresumido === 'MODERADO' ? 'border-yellow-400 bg-yellow-50' : 'border-green-400 bg-green-50'}`}>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription className="flex items-center justify-between">
                        <span>Risco Presumido Automaticamente Calculado:</span>
                        <Badge className={getRiscoColor(riscoPresumido)}>
                            {riscoPresumido}
                        </Badge>
                    </AlertDescription>
                </Alert>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Dados da Chamada */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Phone className="w-5 h-5" />
                            Dados da Chamada
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <Label htmlFor="telefone">Telefone do Solicitante *</Label>
                            <Input
                                id="telefone"
                                type="tel"
                                placeholder="(11) 99999-9999"
                                value={formData.telefone}
                                onChange={(e) => handleInputChange('telefone', e.target.value)}
                                required
                            />
                        </div>

                        <div>
                            <Label htmlFor="endereco">Endereço da Ocorrência *</Label>
                            <Input
                                id="endereco"
                                placeholder="Rua, número"
                                value={formData.endereco}
                                onChange={(e) => handleInputChange('endereco', e.target.value)}
                                required
                            />
                        </div>

                        <div>
                            <Label htmlFor="bairro">Bairro</Label>
                            <Input
                                id="bairro"
                                value={formData.bairro}
                                onChange={(e) => handleInputChange('bairro', e.target.value)}
                            />
                        </div>

                        <div>
                            <Label htmlFor="pontoReferencia">Ponto de Referência</Label>
                            <Input
                                id="pontoReferencia"
                                placeholder="Próximo ao..."
                                value={formData.pontoReferencia}
                                onChange={(e) => handleInputChange('pontoReferencia', e.target.value)}
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Dados do Paciente */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <User className="w-5 h-5" />
                            Dados do Paciente
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <Label htmlFor="nomeInformado">Nome Informado</Label>
                            <Input
                                id="nomeInformado"
                                value={formData.nomeInformado}
                                onChange={(e) => handleInputChange('nomeInformado', e.target.value)}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <Label htmlFor="idadeAnos">Idade (Anos)</Label>
                                <Input
                                    id="idadeAnos"
                                    type="number"
                                    min="0"
                                    max="120"
                                    value={formData.idadeAnos}
                                    onChange={(e) => handleInputChange('idadeAnos', parseInt(e.target.value) || '')}
                                />
                            </div>
                            <div>
                                <Label htmlFor="idadeMeses">Meses (se bebê)</Label>
                                <Input
                                    id="idadeMeses"
                                    type="number"
                                    min="0"
                                    max="11"
                                    value={formData.idadeMeses}
                                    onChange={(e) => handleInputChange('idadeMeses', parseInt(e.target.value) || '')}
                                />
                            </div>
                        </div>

                        <div>
                            <Label htmlFor="sexo">Sexo</Label>
                            <Select onValueChange={(value) => handleInputChange('sexo', value)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecione" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="M">Masculino</SelectItem>
                                    <SelectItem value="F">Feminino</SelectItem>
                                    <SelectItem value="I">Não Informado</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Queixa e Situação */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5" />
                        Queixa e Situação Clínica
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <Label htmlFor="queixaPrincipal">Queixa Principal *</Label>
                        <Select onValueChange={(value) => handleInputChange('queixaPrincipal', value)} required>
                            <SelectTrigger>
                                <SelectValue placeholder="Selecione a queixa principal" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="dor_peito">Dor no Peito</SelectItem>
                                <SelectItem value="falta_ar">Falta de Ar</SelectItem>
                                <SelectItem value="convulsao">Convulsão</SelectItem>
                                <SelectItem value="acidente">Acidente</SelectItem>
                                <SelectItem value="queda">Queda</SelectItem>
                                <SelectItem value="febre">Febre</SelectItem>
                                <SelectItem value="vomito">Vômito</SelectItem>
                                <SelectItem value="dor_abdominal">Dor Abdominal</SelectItem>
                                <SelectItem value="cefaleia">Dor de Cabeça</SelectItem>
                                <SelectItem value="outros">Outros</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div>
                        <Label htmlFor="queixaEspecifica">Descrição Específica da Queixa</Label>
                        <Textarea
                            id="queixaEspecifica"
                            placeholder="Descreva detalhadamente o que está acontecendo..."
                            value={formData.queixaEspecifica}
                            onChange={(e) => handleInputChange('queixaEspecifica', e.target.value)}
                            rows={3}
                        />
                    </div>

                    <div>
                        <Label htmlFor="situacaoEncontrada">Situação Encontrada no Local</Label>
                        <Textarea
                            id="situacaoEncontrada"
                            placeholder="O que foi observado/relatado sobre a situação..."
                            value={formData.situacaoEncontrada}
                            onChange={(e) => handleInputChange('situacaoEncontrada', e.target.value)}
                            rows={2}
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Avaliação Primária */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Clock className="w-5 h-5" />
                        Avaliação Primária (ABCDE)
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <Label>O paciente está consciente?</Label>
                            <Select onValueChange={(value) => handleInputChange('consciente', value)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecione" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="SIM">Sim</SelectItem>
                                    <SelectItem value="NAO">Não</SelectItem>
                                    <SelectItem value="PARCIAL">Parcialmente</SelectItem>
                                    <SelectItem value="NAO_INFORMADO">Não Informado</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <Label>O paciente está respirando?</Label>
                            <Select onValueChange={(value) => handleInputChange('respirando', value)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecione" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="SIM">Sim</SelectItem>
                                    <SelectItem value="NAO">Não</SelectItem>
                                    <SelectItem value="DIFICULDADE">Com Dificuldade</SelectItem>
                                    <SelectItem value="NAO_INFORMADO">Não Informado</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <Label>O paciente tem pulso?</Label>
                            <Select onValueChange={(value) => handleInputChange('temPulso', value)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecione" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="SIM">Sim</SelectItem>
                                    <SelectItem value="NAO">Não</SelectItem>
                                    <SelectItem value="FRACO">Fraco</SelectItem>
                                    <SelectItem value="NAO_INFORMADO">Não Informado</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Sinais Vitais (Opcionais) */}
            <Card>
                <CardHeader>
                    <CardTitle>Sinais Vitais (se disponíveis)</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <Label htmlFor="pressaoArterial">Pressão Arterial</Label>
                            <Input
                                id="pressaoArterial"
                                placeholder="ex: 120x80"
                                value={formData.pressaoArterial}
                                onChange={(e) => handleInputChange('pressaoArterial', e.target.value)}
                            />
                        </div>

                        <div>
                            <Label htmlFor="frequenciaCardiaca">Frequência Cardíaca (bpm)</Label>
                            <Input
                                id="frequenciaCardiaca"
                                type="number"
                                min="0"
                                max="300"
                                value={formData.frequenciaCardiaca}
                                onChange={(e) => handleInputChange('frequenciaCardiaca', parseInt(e.target.value) || '')}
                            />
                        </div>

                        <div>
                            <Label htmlFor="temperatura">Temperatura (°C)</Label>
                            <Input
                                id="temperatura"
                                type="number"
                                step="0.1"
                                min="30"
                                max="45"
                                value={formData.temperatura}
                                onChange={(e) => handleInputChange('temperatura', parseFloat(e.target.value) || '')}
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Botões de Ação */}
            <div className="flex justify-end gap-3">
                <Button
                    type="button"
                    variant="outline"
                    onClick={() => window.location.reload()}
                >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Limpar
                </Button>

                <Button
                    type="submit"
                    disabled={salvando}
                    className="bg-red-600 hover:bg-red-700"
                >
                    {salvando ? (
                        <>
                            <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                            Salvando...
                        </>
                    ) : (
                        <>
                            <Save className="w-4 h-4 mr-2" />
                            Criar Ocorrência
                        </>
                    )}
                </Button>
            </div>
        </form>
    );
};

export default NovaOcorrenciaForm;