import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Ambulance, Phone, MapPin, User, Clock, AlertTriangle, Car, Activity } from 'lucide-react';
import { toast } from 'sonner';
import samuService, { SolicitacaoSAMU, SolicitacaoAmbulancia, Ambulancia, TipoAmbulancia } from '@/services/samu/samuService';

export function SolicitacoesAmbulancia() {
  const [solicitacoesPendentes, setSolicitacoesPendentes] = useState<any[]>([]);
  const [solicitacaoSelecionada, setSolicitacaoSelecionada] = useState<any | null>(null);
  const [modalAberto, setModalAberto] = useState(false);
  const [loading, setLoading] = useState(false);

  const [tiposAmbulancia, setTiposAmbulancia] = useState<TipoAmbulancia[]>([]);
  const [ambulancias, setAmbulanciasList] = useState<Ambulancia[]>([]);
  const [ambulanciasDisponiveis, setAmbulanciasDisponiveis] = useState<Ambulancia[]>([]);

  const [formData, setFormData] = useState<Partial<SolicitacaoAmbulancia>>({
    tipoAmbulanciaId: 0,
    ambulanciaId: 0,
  });

  useEffect(() => {
    carregarDados();
  }, []);

  useEffect(() => {
    if (formData.tipoAmbulanciaId) {
      filtrarAmbulanciasDisponiveis(formData.tipoAmbulanciaId);
    }
  }, [formData.tipoAmbulanciaId]);

  const carregarDados = async () => {
    setLoading(true);
    try {
      // Carregar solicitações pendentes de ambulância
      const response = await samuService.listarSolicitacoesAmbulancia({ status: 'PENDENTE' });

      let data: any = [];
      if (response.data) {
        data = response.data.data || response.data;
      }

      setSolicitacoesPendentes(Array.isArray(data) ? data : []);

      // Carregar tipos de ambulância e ambulâncias
      const [tiposAmb, ambulanciasResp] = await Promise.all([
        samuService.listarTiposAmbulancia(),
        samuService.listarAmbulanciasTodas(),
      ]);

      const tiposData = tiposAmb.data?.data || tiposAmb.data || [];
      const ambulData = ambulanciasResp.data?.data || ambulanciasResp.data || [];

      setTiposAmbulancia(Array.isArray(tiposData) ? tiposData : []);
      setAmbulanciasList(Array.isArray(ambulData) ? ambulData : []);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast.error('Erro ao carregar solicitações de ambulância');
      setSolicitacoesPendentes([]);
    } finally {
      setLoading(false);
    }
  };

  const filtrarAmbulanciasDisponiveis = (tipoId: number) => {
    // Filtrar ambulâncias do tipo selecionado e que estejam disponíveis
    const disponiveis = ambulancias.filter(
      (amb) => amb.tipoAmbulanciaId === tipoId && amb.situacaoAtualId === 1 // TODO: ID situação "Disponível"
    );
    setAmbulanciasDisponiveis(disponiveis);
  };

  const abrirSolicitacao = (solicitacao: any) => {
    setSolicitacaoSelecionada(solicitacao);
    setFormData({
      solicitacaoId: solicitacao.solicitacaoSAMUId,
      tipoAmbulanciaId: 0,
      ambulanciaId: 0,
      situacaoAmbulanciaId: 2, // TODO: ID situação "Em espera" conforme configuração
      dataHoraInicio: new Date().toISOString(),
    });
    setModalAberto(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.tipoAmbulanciaId) {
      toast.error('Selecione o tipo de ambulância');
      return;
    }

    if (!formData.ambulanciaId) {
      toast.error('Selecione uma ambulância');
      return;
    }

    try {
      const payload: SolicitacaoAmbulancia = {
        ...formData,
        profissionalId: 1, // TODO: Pegar do contexto
      } as SolicitacaoAmbulancia;

      await samuService.criarSolicitacaoAmbulancia(payload);

      toast.success('✅ Ambulância solicitada com sucesso!');
      setModalAberto(false);
      setSolicitacaoSelecionada(null);
      setFormData({
        tipoAmbulanciaId: 0,
        ambulanciaId: 0,
      });
      carregarDados();
    } catch (error: any) {
      console.error('Erro ao solicitar ambulância:', error);
      toast.error(error.response?.data?.message || 'Erro ao solicitar ambulância');
    }
  };

  const getTipoAmbulanciaInfo = (sigla: string) => {
    const tipos: any = {
      USA: {
        nome: 'Unidade de Suporte Avançado',
        descricao: 'UTI móvel para casos graves',
        cor: 'bg-red-500',
        icone: '🚑'
      },
      USB: {
        nome: 'Unidade de Suporte Básico',
        descricao: 'Atendimento básico',
        cor: 'bg-blue-500',
        icone: '🚐'
      },
      VT: {
        nome: 'Veículo de Transporte',
        descricao: 'Casos simples',
        cor: 'bg-green-500',
        icone: '🚗'
      },
      VIR: {
        nome: 'Veículo de Intervenção Rápida',
        descricao: 'Resgate rápido',
        cor: 'bg-orange-500',
        icone: '🏍️'
      },
      MOTOLANCIA: {
        nome: 'Motolância',
        descricao: 'Pré-atendimento',
        cor: 'bg-yellow-500',
        icone: '🏍️'
      },
      AMBULANCHA: {
        nome: 'Ambulancha',
        descricao: 'Socorro aquático',
        cor: 'bg-cyan-500',
        icone: '⛵'
      },
      HELICOPTERO: {
        nome: 'Helicóptero',
        descricao: 'Socorro aéreo',
        cor: 'bg-purple-500',
        icone: '🚁'
      }
    };

    return tipos[sigla] || { nome: sigla, descricao: '', cor: 'bg-gray-500', icone: '🚑' };
  };

  const getTempoEsperaColor = (minutos: number) => {
    if (minutos > 15) return 'text-red-600';
    if (minutos > 10) return 'text-yellow-600';
    return 'text-green-600';
  };

  const calcularMinutosEspera = (dataHora: string): number => {
    const agora = new Date();
    const solicitacao = new Date(dataHora);
    const diff = agora.getTime() - solicitacao.getTime();
    return Math.floor(diff / 1000 / 60);
  };

  const formatarTempoEspera = (dataHora: string): string => {
    const minutos = calcularMinutosEspera(dataHora);
    if (minutos < 60) return `${minutos} min`;
    const horas = Math.floor(minutos / 60);
    const minutosRestantes = minutos % 60;
    return `${horas}h ${minutosRestantes}min`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Ambulance className="w-6 h-6 text-red-600" />
            Solicitações de Ambulâncias do SAMU
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Vincular ambulância às ocorrências reguladas
          </p>
        </div>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Aguardando Ambulância</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {solicitacoesPendentes.length}
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
                <p className="text-sm text-gray-600">USA Disponíveis</p>
                <p className="text-2xl font-bold text-red-600">
                  {ambulancias.filter(a => a.tipoAmbulanciaId === 1 && a.situacaoAtualId === 1).length}
                </p>
              </div>
              <Ambulance className="w-8 h-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">USB Disponíveis</p>
                <p className="text-2xl font-bold text-blue-600">
                  {ambulancias.filter(a => a.tipoAmbulanciaId === 2 && a.situacaoAtualId === 1).length}
                </p>
              </div>
              <Car className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Tempo Médio</p>
                <p className="text-2xl font-bold text-orange-600">
                  {solicitacoesPendentes.length > 0
                    ? Math.floor(
                        solicitacoesPendentes.reduce((acc, s) => acc + calcularMinutosEspera(s.dataHora), 0) /
                          solicitacoesPendentes.length
                      )
                    : 0}{' '}
                  min
                </p>
              </div>
              <Activity className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alerta */}
      {solicitacoesPendentes.some(s => calcularMinutosEspera(s.dataHora) > 15) && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            <strong>Atenção!</strong> Existem solicitações aguardando ambulância há mais de 15 minutos.
          </AlertDescription>
        </Alert>
      )}

      {/* Lista de Solicitações Aguardando Ambulância */}
      <Card>
        <CardHeader>
          <CardTitle>Solicitações Aguardando Ambulância ({solicitacoesPendentes.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center p-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
            </div>
          ) : solicitacoesPendentes.length === 0 ? (
            <div className="text-center p-12 text-gray-500">
              <Ambulance className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium">Nenhuma solicitação aguardando ambulância</p>
              <p className="text-sm">Todas as ocorrências reguladas já possuem ambulância</p>
            </div>
          ) : (
            <div className="space-y-4">
              {solicitacoesPendentes.map((solicitacao) => (
                <Card key={solicitacao.id} className="hover:shadow-md transition-shadow border-l-4 border-l-orange-500">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1 space-y-3">
                        {/* Header */}
                        <div className="flex items-center gap-3">
                          <Badge className="bg-blue-600 text-white font-mono">
                            #{solicitacao.codigo}
                          </Badge>
                          <Badge className={getTempoEsperaColor(calcularMinutosEspera(solicitacao.dataHora))}>
                            <Clock className="w-3 h-3 mr-1" />
                            {formatarTempoEspera(solicitacao.dataHora)} aguardando
                          </Badge>
                          {solicitacao.classificacaoRisco && (
                            <Badge className={
                              solicitacao.classificacaoRisco === 'MUITO_RISCO' ? 'bg-red-500' :
                              solicitacao.classificacaoRisco === 'MEDIO_RISCO' ? 'bg-yellow-500' :
                              'bg-gray-500'
                            }>
                              {solicitacao.classificacaoRisco === 'MUITO_RISCO' ? 'Alto Risco' :
                               solicitacao.classificacaoRisco === 'MEDIO_RISCO' ? 'Médio Risco' :
                               'Não Informado'}
                            </Badge>
                          )}
                        </div>

                        {/* Informações do Paciente */}
                        <div className="grid grid-cols-2 gap-4">
                          <div className="flex items-center gap-2 text-sm">
                            <User className="w-4 h-4 text-gray-500" />
                            <span>{solicitacao.usuarioNome || 'Não identificado'}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Phone className="w-4 h-4 text-gray-500" />
                            <span>{solicitacao.telefone}</span>
                          </div>
                        </div>

                        {/* Endereço */}
                        <div className="flex items-center gap-2 text-sm">
                          <MapPin className="w-4 h-4 text-gray-500" />
                          <span>
                            {solicitacao.logradouro}, {solicitacao.numero || 'S/N'} - {solicitacao.bairro}, {solicitacao.municipio}
                          </span>
                        </div>

                        {/* Detalhamento da Regulação */}
                        {solicitacao.detalhamento && (
                          <div className="bg-blue-50 p-3 rounded-lg">
                            <p className="text-sm font-medium text-blue-700">Avaliação do Regulador:</p>
                            <p className="text-sm text-gray-900 mt-1">{solicitacao.detalhamento}</p>
                          </div>
                        )}
                      </div>

                      {/* Botão de Solicitar Ambulância */}
                      <div className="ml-4">
                        <Button
                          onClick={() => abrirSolicitacao(solicitacao)}
                          size="lg"
                          className="bg-red-600 hover:bg-red-700"
                        >
                          <Ambulance className="w-4 h-4 mr-2" />
                          Solicitar Ambulância
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal de Solicitação de Ambulância */}
      <Dialog open={modalAberto} onOpenChange={setModalAberto}>
        <DialogContent className="sm:max-w-[800px]">
          <DialogHeader>
            <DialogTitle>
              🚑 Solicitar Ambulância - #{solicitacaoSelecionada?.codigo}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit}>
            <Tabs defaultValue="solicitacao" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="solicitacao">Dados da Solicitação</TabsTrigger>
                <TabsTrigger value="ambulancia">Ambulância</TabsTrigger>
                <TabsTrigger value="resumo">Resumo</TabsTrigger>
              </TabsList>

              {/* ABA DADOS DA SOLICITAÇÃO */}
              <TabsContent value="solicitacao" className="space-y-4">
                {solicitacaoSelecionada && (
                  <>
                    <Card>
                      <CardContent className="p-4 space-y-3">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <strong>Paciente:</strong> {solicitacaoSelecionada.usuarioNome || 'Não identificado'}
                          </div>
                          <div>
                            <strong>Telefone:</strong> {solicitacaoSelecionada.telefone}
                          </div>
                          <div className="col-span-2">
                            <strong>Endereço:</strong> {solicitacaoSelecionada.logradouro}, {solicitacaoSelecionada.numero || 'S/N'} - {solicitacaoSelecionada.bairro}
                          </div>
                        </div>

                        {solicitacaoSelecionada.classificacaoRisco && (
                          <div className="flex items-center gap-2">
                            <strong className="text-sm">Classificação de Risco:</strong>
                            <Badge className={
                              solicitacaoSelecionada.classificacaoRisco === 'MUITO_RISCO' ? 'bg-red-500' :
                              solicitacaoSelecionada.classificacaoRisco === 'MEDIO_RISCO' ? 'bg-yellow-500' :
                              'bg-gray-500'
                            }>
                              {solicitacaoSelecionada.classificacaoRisco === 'MUITO_RISCO' ? 'Alto Risco' :
                               solicitacaoSelecionada.classificacaoRisco === 'MEDIO_RISCO' ? 'Médio Risco' :
                               'Não Informado'}
                            </Badge>
                          </div>
                        )}

                        {solicitacaoSelecionada.detalhamento && (
                          <div className="bg-gray-50 p-3 rounded-lg">
                            <strong className="text-sm">Detalhamento:</strong>
                            <p className="text-sm mt-1">{solicitacaoSelecionada.detalhamento}</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </>
                )}
              </TabsContent>

              {/* ABA AMBULÂNCIA */}
              <TabsContent value="ambulancia" className="space-y-4">
                <div>
                  <Label htmlFor="tipoAmbulanciaId">Tipo de Ambulância *</Label>
                  <Select
                    value={formData.tipoAmbulanciaId?.toString()}
                    onValueChange={(value) => setFormData({ ...formData, tipoAmbulanciaId: parseInt(value), ambulanciaId: 0 })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo..." />
                    </SelectTrigger>
                    <SelectContent>
                      {tiposAmbulancia.map(tipo => {
                        const info = getTipoAmbulanciaInfo(tipo.sigla);
                        return (
                          <SelectItem key={tipo.id} value={tipo.id!.toString()}>
                            <div className="flex items-center gap-2">
                              <span>{info.icone}</span>
                              <div>
                                <div className="font-medium">{tipo.sigla} - {tipo.descricao}</div>
                                <div className="text-xs text-gray-500">{info.descricao}</div>
                              </div>
                            </div>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>

                {formData.tipoAmbulanciaId > 0 && (
                  <>
                    <Alert>
                      <Car className="h-4 w-4" />
                      <AlertDescription>
                        {ambulanciasDisponiveis.length > 0
                          ? `${ambulanciasDisponiveis.length} ambulância(s) disponível(is) deste tipo`
                          : 'Nenhuma ambulância disponível deste tipo no momento'}
                      </AlertDescription>
                    </Alert>

                    {ambulanciasDisponiveis.length > 0 && (
                      <div>
                        <Label htmlFor="ambulanciaId">Ambulância *</Label>
                        <Select
                          value={formData.ambulanciaId?.toString()}
                          onValueChange={(value) => setFormData({ ...formData, ambulanciaId: parseInt(value) })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione a ambulância..." />
                          </SelectTrigger>
                          <SelectContent>
                            {ambulanciasDisponiveis.map(amb => (
                              <SelectItem key={amb.id} value={amb.id!.toString()}>
                                {amb.descricao} - {amb.placa}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </>
                )}
              </TabsContent>

              {/* ABA RESUMO */}
              <TabsContent value="resumo" className="space-y-4">
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Revise as informações antes de confirmar a solicitação
                  </AlertDescription>
                </Alert>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Resumo da Solicitação</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {formData.tipoAmbulanciaId && formData.ambulanciaId ? (
                      <>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <strong>Tipo de Ambulância:</strong>
                            <p>{tiposAmbulancia.find(t => t.id === formData.tipoAmbulanciaId)?.sigla}</p>
                          </div>
                          <div>
                            <strong>Ambulância:</strong>
                            <p>{ambulancias.find(a => a.id === formData.ambulanciaId)?.descricao}</p>
                          </div>
                          <div>
                            <strong>Placa:</strong>
                            <p>{ambulancias.find(a => a.id === formData.ambulanciaId)?.placa}</p>
                          </div>
                          <div>
                            <strong>Situação após envio:</strong>
                            <p>Em espera</p>
                          </div>
                        </div>

                        <div className="bg-green-50 p-3 rounded-lg">
                          <p className="text-sm text-green-800">
                            ✅ A ambulância será automaticamente marcada como "Em espera" e aparecerá no controle de ambulâncias
                          </p>
                        </div>
                      </>
                    ) : (
                      <p className="text-center text-gray-500 py-8">
                        Selecione o tipo de ambulância e a ambulância na aba anterior
                      </p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            <DialogFooter className="mt-6">
              <Button type="button" variant="outline" onClick={() => setModalAberto(false)}>
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={!formData.tipoAmbulanciaId || !formData.ambulanciaId}
              >
                Confirmar Solicitação
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default SolicitacoesAmbulancia;
