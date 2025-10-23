import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Phone, MapPin, User, Clock, AlertCircle, Users, Search } from 'lucide-react';
import { toast } from 'sonner';
import samuService, { SolicitacaoSAMU } from '@/services/samu/samuService';

// Schema de validação baseado no manual
const solicitacaoSchema = z.object({
  telefone: z.string().min(10, 'Telefone deve ter pelo menos 10 dígitos'),
  motivoQueixa: z.string().optional(),
  tipoOcorrenciaId: z.number().optional(),
  tipoSolicitanteId: z.number().optional(),
  tipoLigacaoId: z.number().optional(),
  origemSolicitacaoId: z.number().optional(),
  estadoEmocional: z.enum(['NORMAL', 'ALTERADO']).optional(),
  solicitante: z.string().optional(),

  // Usuário (opcional)
  usuarioId: z.number().optional(),

  // Ocorrência
  municipio: z.string().min(3, 'Município é obrigatório'),
  logradouro: z.string().min(5, 'Logradouro é obrigatório'),
  numero: z.string().optional(),
  complemento: z.string().optional(),
  bairro: z.string().min(3, 'Bairro ou Distrito é obrigatório'),
  pontoReferencia: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),

  // Encaminhamento
  tipoEncaminhamentoId: z.number().min(1, 'Tipo de encaminhamento é obrigatório'),
  profissionalEncaminhamentoId: z.number().optional(),
  detalhamento: z.string().optional(),
});

type SolicitacaoFormData = z.infer<typeof solicitacaoSchema>;

interface ConfiguracaoSAMU {
  informarTipoOcorrencia: 'NAO' | 'OBRIGATORIO' | 'NAO_OBRIGATORIO';
  informarTipoSolicitante: 'NAO' | 'OBRIGATORIO' | 'NAO_OBRIGATORIO';
  informarTipoLigacao: 'NAO' | 'OBRIGATORIO' | 'NAO_OBRIGATORIO';
  tipoLigacaoPadrao?: number;
  informarOrigemSolicitacao: 'NAO' | 'OBRIGATORIO' | 'NAO_OBRIGATORIO';
  informarUsuarioSolicitacao: boolean;
}

export function SolicitacoesTARM() {
  const [solicitacoes, setSolicitacoes] = useState<SolicitacaoSAMU[]>([]);
  const [modalAberto, setModalAberto] = useState(false);
  const [configuracao, setConfiguracao] = useState<ConfiguracaoSAMU | null>(null);
  const [loading, setLoading] = useState(false);

  // Listas para dropdowns
  const [tiposOcorrencia, setTiposOcorrencia] = useState<any[]>([]);
  const [tiposSolicitante, setTiposSolicitante] = useState<any[]>([]);
  const [tiposLigacao, setTiposLigacao] = useState<any[]>([]);
  const [origensSolicitacao, setOrigensSolicitacao] = useState<any[]>([]);
  const [tiposEncaminhamento, setTiposEncaminhamento] = useState<any[]>([]);
  const [profissionais, setProfissionais] = useState<any[]>([]);
  const [pacienteSelecionado, setPacienteSelecionado] = useState<any>(null);
  const [buscaPaciente, setBuscaPaciente] = useState('');

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting }
  } = useForm<SolicitacaoFormData>({
    resolver: zodResolver(solicitacaoSchema),
  });

  const tipoLigacaoSelecionado = watch('tipoLigacaoId');
  const tipoEncaminhamentoSelecionado = watch('tipoEncaminhamentoId');

  useEffect(() => {
    carregarDados();
    carregarConfiguracao();
  }, []);

  const carregarDados = async () => {
    setLoading(true);
    try {
      // Carregar solicitações do dia
      const hoje = new Date().toISOString().split('T')[0];
      const responseSolicitacoes = await samuService.listarSolicitacoes({
        dataInicio: hoje,
        dataFim: hoje
      });

      let dataSolicitacoes: any = [];
      if (responseSolicitacoes.data) {
        dataSolicitacoes = responseSolicitacoes.data.data?.content || responseSolicitacoes.data.content || responseSolicitacoes.data.data || responseSolicitacoes.data;
      }
      setSolicitacoes(Array.isArray(dataSolicitacoes) ? dataSolicitacoes : []);

      // Carregar cadastros
      const [tiposOcor, tiposSolic, tiposLig, origSolic, tiposEnc] = await Promise.all([
        samuService.listarTiposOcorrencia(),
        samuService.listarTiposSolicitante(),
        samuService.listarTiposLigacao(),
        samuService.listarOrigensSolicitacao(),
        samuService.listarTiposEncaminhamento(),
      ]);

      setTiposOcorrencia(tiposOcor.data?.data || tiposOcor.data || []);
      setTiposSolicitante(tiposSolic.data?.data || tiposSolic.data || []);
      setTiposLigacao(tiposLig.data?.data || tiposLig.data || []);
      setOrigensSolicitacao(origSolic.data?.data || origSolic.data || []);
      setTiposEncaminhamento(tiposEnc.data?.data || tiposEnc.data || []);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast.error('Erro ao carregar dados do SAMU');
    } finally {
      setLoading(false);
    }
  };

  const carregarConfiguracao = async () => {
    try {
      // Pegar unidade do contexto do usuário
      const unidadeId = 1; // TODO: pegar do contexto
      const response = await samuService.buscarConfiguracao(unidadeId);
      const config = response.data?.data || response.data;
      setConfiguracao(config);

      // Aplicar tipo de ligação padrão se configurado
      if (config?.tipoLigacaoPadrao) {
        setValue('tipoLigacaoId', config.tipoLigacaoPadrao);
      }
    } catch (error) {
      console.error('Erro ao carregar configuração:', error);
    }
  };

  const buscarPaciente = async () => {
    if (!buscaPaciente.trim()) {
      toast.warning('Digite CPF ou nome do paciente');
      return;
    }

    try {
      // TODO: Implementar busca de paciente
      toast.info('Busca de paciente em desenvolvimento');
    } catch (error) {
      toast.error('Erro ao buscar paciente');
    }
  };

  const carregarEnderecoPaciente = () => {
    if (!pacienteSelecionado) {
      toast.warning('Selecione um paciente primeiro');
      return;
    }

    // Preencher endereço do paciente
    setValue('municipio', pacienteSelecionado.endereco?.municipio || '');
    setValue('logradouro', pacienteSelecionado.endereco?.logradouro || '');
    setValue('numero', pacienteSelecionado.endereco?.numero || '');
    setValue('bairro', pacienteSelecionado.endereco?.bairro || '');
    setValue('complemento', pacienteSelecionado.endereco?.complemento || '');

    toast.success('Endereço carregado do cadastro do paciente');
  };

  const abrirModal = (solicitacao?: SolicitacaoSAMU) => {
    if (solicitacao) {
      reset(solicitacao as any);
    } else {
      reset({
        estadoEmocional: 'NORMAL',
        tipoLigacaoId: configuracao?.tipoLigacaoPadrao,
      } as any);
    }
    setModalAberto(true);
  };

  const onSubmit = async (data: SolicitacaoFormData) => {
    try {
      const payload: SolicitacaoSAMU = {
        ...data,
        dataHora: new Date().toISOString().split('T')[0],
        horario: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        codigo: 0, // Será gerado pelo backend
        municipio: data.municipio,
        usuarioId: pacienteSelecionado?.id,
        usuarioNome: pacienteSelecionado?.nomeCompleto,
      };

      await samuService.criarSolicitacao(payload);
      toast.success('✅ Solicitação registrada com sucesso!');
      setModalAberto(false);
      reset();
      setPacienteSelecionado(null);
      setBuscaPaciente('');
      carregarDados();
    } catch (error: any) {
      console.error('Erro ao criar solicitação:', error);
      toast.error(error.response?.data?.message || 'Erro ao registrar solicitação');
    }
  };

  const deveMostrarCampo = (campo: string, config: ConfiguracaoSAMU | null): boolean => {
    if (!config) return true;
    const valor = config[campo as keyof ConfiguracaoSAMU];
    return valor !== 'NAO';
  };

  const campoObrigatorio = (campo: string, config: ConfiguracaoSAMU | null): boolean => {
    if (!config) return false;
    const valor = config[campo as keyof ConfiguracaoSAMU];
    return valor === 'OBRIGATORIO';
  };

  // Filtrar tipos de encaminhamento baseado no tipo de ligação
  const tiposEncaminhamentoFiltrados = React.useMemo(() => {
    const tipoLigacao = tiposLigacao.find(t => t.id === tipoLigacaoSelecionado);

    if (tipoLigacao?.encerramento) {
      // Se tipo de ligação é de encerramento, mostrar só encaminhamentos de encerramento
      return tiposEncaminhamento.filter(t => t.encerramento);
    }

    return tiposEncaminhamento;
  }, [tipoLigacaoSelecionado, tiposLigacao, tiposEncaminhamento]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDENTE': return 'bg-yellow-100 text-yellow-800';
      case 'EM_ATENDIMENTO': return 'bg-blue-100 text-blue-800';
      case 'ENCERRADA': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header com estatísticas */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Phone className="w-6 h-6 text-red-600" />
            Solicitações do SAMU - TARM
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Telefonista de Atendimento e Regulação Médica (192)
          </p>
        </div>
        <Button onClick={() => abrirModal()} size="lg">
          <Phone className="w-4 h-4 mr-2" />
          Nova Solicitação
        </Button>
      </div>

      {/* Estatísticas do dia */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Solicitações Hoje</p>
                <p className="text-2xl font-bold text-blue-600">{solicitacoes.length}</p>
              </div>
              <Phone className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pendentes Regulação</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {solicitacoes.filter(s => s.status === 'PENDENTE').length}
                </p>
              </div>
              <Clock className="w-8 h-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Em Atendimento</p>
                <p className="text-2xl font-bold text-green-600">
                  {solicitacoes.filter(s => s.status === 'EM_ATENDIMENTO').length}
                </p>
              </div>
              <Users className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Encerradas</p>
                <p className="text-2xl font-bold text-gray-600">
                  {solicitacoes.filter(s => s.status === 'ENCERRADA').length}
                </p>
              </div>
              <AlertCircle className="w-8 h-8 text-gray-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Solicitações */}
      <Card>
        <CardHeader>
          <CardTitle>Solicitações do Dia ({solicitacoes.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center p-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
            </div>
          ) : solicitacoes.length === 0 ? (
            <div className="text-center p-12 text-gray-500">
              <Phone className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium">Nenhuma solicitação registrada hoje</p>
              <p className="text-sm">Clique em "Nova Solicitação" para registrar uma chamada</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Código</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Horário</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Telefone</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Endereço</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Usuário</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Status</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {solicitacoes.map((solicitacao) => (
                    <tr key={solicitacao.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-mono">{solicitacao.codigo}</td>
                      <td className="px-4 py-3 text-sm">{solicitacao.horario}</td>
                      <td className="px-4 py-3 text-sm">{solicitacao.telefone}</td>
                      <td className="px-4 py-3 text-sm">
                        {solicitacao.logradouro}, {solicitacao.bairro}
                      </td>
                      <td className="px-4 py-3 text-sm">{solicitacao.usuarioNome || '-'}</td>
                      <td className="px-4 py-3 text-sm">
                        <Badge className={getStatusColor(solicitacao.status || 'PENDENTE')}>
                          {solicitacao.status || 'PENDENTE'}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => abrirModal(solicitacao)}
                        >
                          Ver
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal de Solicitação */}
      <Dialog open={modalAberto} onOpenChange={setModalAberto}>
        <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>📞 Nova Solicitação SAMU</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)}>
            <Tabs defaultValue="solicitacao" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="solicitacao">Solicitação</TabsTrigger>
                <TabsTrigger value="usuario">Usuário</TabsTrigger>
                <TabsTrigger value="ocorrencia">Ocorrência</TabsTrigger>
                <TabsTrigger value="encaminhamento">Encaminhamento</TabsTrigger>
              </TabsList>

              {/* ABA SOLICITAÇÃO */}
              <TabsContent value="solicitacao" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="telefone">Telefone *</Label>
                    <Input
                      {...register('telefone')}
                      placeholder="(11) 99999-9999"
                    />
                    {errors.telefone && (
                      <p className="text-sm text-red-500 mt-1">{errors.telefone.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="motivoQueixa">Motivo da Queixa</Label>
                    <Input {...register('motivoQueixa')} />
                  </div>
                </div>

                {deveMostrarCampo('informarTipoOcorrencia', configuracao) && (
                  <div>
                    <Label htmlFor="tipoOcorrenciaId">
                      Tipo de Ocorrência {campoObrigatorio('informarTipoOcorrencia', configuracao) && '*'}
                    </Label>
                    <Select onValueChange={(value) => setValue('tipoOcorrenciaId', parseInt(value))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione..." />
                      </SelectTrigger>
                      <SelectContent>
                        {tiposOcorrencia.map(tipo => (
                          <SelectItem key={tipo.id} value={tipo.id.toString()}>
                            {tipo.descricao}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  {deveMostrarCampo('informarTipoSolicitante', configuracao) && (
                    <div>
                      <Label htmlFor="tipoSolicitanteId">
                        Tipo de Solicitante {campoObrigatorio('informarTipoSolicitante', configuracao) && '*'}
                      </Label>
                      <Select onValueChange={(value) => setValue('tipoSolicitanteId', parseInt(value))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione..." />
                        </SelectTrigger>
                        <SelectContent>
                          {tiposSolicitante.map(tipo => (
                            <SelectItem key={tipo.id} value={tipo.id.toString()}>
                              {tipo.descricao}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {deveMostrarCampo('informarTipoLigacao', configuracao) && (
                    <div>
                      <Label htmlFor="tipoLigacaoId">
                        Tipo de Ligação {campoObrigatorio('informarTipoLigacao', configuracao) && '*'}
                      </Label>
                      <Select onValueChange={(value) => setValue('tipoLigacaoId', parseInt(value))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione..." />
                        </SelectTrigger>
                        <SelectContent>
                          {tiposLigacao.map(tipo => (
                            <SelectItem key={tipo.id} value={tipo.id.toString()}>
                              {tipo.descricao}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {deveMostrarCampo('informarOrigemSolicitacao', configuracao) && (
                    <div>
                      <Label htmlFor="origemSolicitacaoId">
                        Origem da Solicitação {campoObrigatorio('informarOrigemSolicitacao', configuracao) && '*'}
                      </Label>
                      <Select onValueChange={(value) => setValue('origemSolicitacaoId', parseInt(value))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione..." />
                        </SelectTrigger>
                        <SelectContent>
                          {origensSolicitacao.map(origem => (
                            <SelectItem key={origem.id} value={origem.id.toString()}>
                              {origem.descricao}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  <div>
                    <Label htmlFor="estadoEmocional">Estado Emocional</Label>
                    <Select onValueChange={(value) => setValue('estadoEmocional', value as any)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="NORMAL">Normal</SelectItem>
                        <SelectItem value="ALTERADO">Alterado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="solicitante">Nome do Solicitante</Label>
                  <Input {...register('solicitante')} />
                </div>
              </TabsContent>

              {/* ABA USUÁRIO */}
              <TabsContent value="usuario" className="space-y-4">
                {configuracao?.informarUsuarioSolicitacao ? (
                  <>
                    <div>
                      <Label>Buscar Paciente</Label>
                      <div className="flex gap-2">
                        <Input
                          value={buscaPaciente}
                          onChange={(e) => setBuscaPaciente(e.target.value)}
                          placeholder="Digite CPF ou nome do paciente..."
                          className="flex-1"
                        />
                        <Button type="button" variant="outline" onClick={buscarPaciente}>
                          <Search className="w-4 h-4 mr-2" />
                          Buscar
                        </Button>
                      </div>
                    </div>

                    {pacienteSelecionado && (
                      <Card className="bg-blue-50">
                        <CardContent className="p-4">
                          <div className="flex items-center gap-3">
                            <User className="w-8 h-8 text-blue-600" />
                            <div>
                              <p className="font-semibold">{pacienteSelecionado.nomeCompleto}</p>
                              <p className="text-sm text-gray-600">
                                CPF: {pacienteSelecionado.cpf} |
                                Data Nasc: {pacienteSelecionado.dataNascimento}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </>
                ) : (
                  <div className="text-center p-8 text-gray-500">
                    <p>Campo de usuário desabilitado nas configurações do módulo</p>
                  </div>
                )}
              </TabsContent>

              {/* ABA OCORRÊNCIA */}
              <TabsContent value="ocorrencia" className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="col-span-2">
                    <Label htmlFor="municipio">Município *</Label>
                    <Input {...register('municipio')} />
                    {errors.municipio && (
                      <p className="text-sm text-red-500 mt-1">{errors.municipio.message}</p>
                    )}
                  </div>

                  {pacienteSelecionado && (
                    <div className="flex items-end">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={carregarEnderecoPaciente}
                        className="w-full"
                      >
                        Carregar Endereço
                      </Button>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-4 gap-4">
                  <div className="col-span-2">
                    <Label htmlFor="logradouro">Logradouro *</Label>
                    <Input {...register('logradouro')} />
                    {errors.logradouro && (
                      <p className="text-sm text-red-500 mt-1">{errors.logradouro.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="numero">Número</Label>
                    <Input {...register('numero')} />
                  </div>

                  <div>
                    <Label htmlFor="complemento">Complemento</Label>
                    <Input {...register('complemento')} />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="bairro">Bairro ou Distrito *</Label>
                    <Input {...register('bairro')} />
                    {errors.bairro && (
                      <p className="text-sm text-red-500 mt-1">{errors.bairro.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="pontoReferencia">Ponto de Referência</Label>
                    <Input {...register('pontoReferencia')} />
                  </div>
                </div>
              </TabsContent>

              {/* ABA ENCAMINHAMENTO */}
              <TabsContent value="encaminhamento" className="space-y-4">
                <div>
                  <Label htmlFor="tipoEncaminhamentoId">Tipo de Encaminhamento *</Label>
                  <Select onValueChange={(value) => setValue('tipoEncaminhamentoId', parseInt(value))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                    <SelectContent>
                      {tiposEncaminhamentoFiltrados.map(tipo => (
                        <SelectItem key={tipo.id} value={tipo.id.toString()}>
                          {tipo.descricao}
                          {tipo.encerramento && (
                            <Badge variant="outline" className="ml-2">Encerramento</Badge>
                          )}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.tipoEncaminhamentoId && (
                    <p className="text-sm text-red-500 mt-1">{errors.tipoEncaminhamentoId.message}</p>
                  )}
                </div>

                {tipoEncaminhamentoSelecionado && !tiposEncaminhamento.find(t => t.id === tipoEncaminhamentoSelecionado)?.encerramento && (
                  <div>
                    <Label htmlFor="profissionalEncaminhamentoId">Profissional de Encaminhamento</Label>
                    <Select onValueChange={(value) => setValue('profissionalEncaminhamentoId', parseInt(value))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o profissional..." />
                      </SelectTrigger>
                      <SelectContent>
                        {profissionais.map(prof => (
                          <SelectItem key={prof.id} value={prof.id.toString()}>
                            {prof.nome}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div>
                  <Label htmlFor="detalhamento">Detalhes do Encaminhamento</Label>
                  <Textarea
                    {...register('detalhamento')}
                    rows={4}
                    placeholder="Informações adicionais sobre o encaminhamento..."
                  />
                </div>
              </TabsContent>
            </Tabs>

            <DialogFooter className="mt-6">
              <Button type="button" variant="outline" onClick={() => setModalAberto(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Salvando...' : 'Gravar Solicitação'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default SolicitacoesTARM;
