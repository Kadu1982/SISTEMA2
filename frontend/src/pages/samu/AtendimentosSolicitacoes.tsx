import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Stethoscope, Phone, MapPin, User, Clock, AlertTriangle, Activity } from 'lucide-react';
import { toast } from 'sonner';
import samuService, { SolicitacaoSAMU, AtendimentoSolicitacao } from '@/services/samu/samuService';

export function AtendimentosSolicitacoes() {
  const [solicitacoesPendentes, setSolicitacoesPendentes] = useState<SolicitacaoSAMU[]>([]);
  const [solicitacaoSelecionada, setSolicitacaoSelecionada] = useState<SolicitacaoSAMU | null>(null);
  const [modalAberto, setModalAberto] = useState(false);
  const [loading, setLoading] = useState(false);

  const [tiposEncaminhamento, setTiposEncaminhamento] = useState<any[]>([]);
  const [profissionais, setProfissionais] = useState<any[]>([]);

  const [formData, setFormData] = useState<Partial<AtendimentoSolicitacao>>({
    detalhamento: '',
    classificacaoRisco: 'NAO_INFORMADO',
    avaliacaoDor: 0,
  });

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    setLoading(true);
    try {
      // Carregar solicitações pendentes para o médico regulador
      // TODO: Pegar profissionalId do contexto do usuário logado
      const profissionalId = 1;

      const response = await samuService.listarSolicitacoesPendentesRegulacao(profissionalId);

      let data: any = [];
      if (response.data) {
        data = response.data.data || response.data;
      }

      setSolicitacoesPendentes(Array.isArray(data) ? data : []);

      // Carregar listas auxiliares
      const [tiposEnc, profs] = await Promise.all([
        samuService.listarTiposEncaminhamento(),
        // TODO: Implementar endpoint para buscar profissionais
        Promise.resolve({ data: [] }),
      ]);

      setTiposEncaminhamento(tiposEnc.data?.data || tiposEnc.data || []);
      setProfissionais(profs.data?.data || profs.data || []);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast.error('Erro ao carregar solicitações pendentes');
      setSolicitacoesPendentes([]);
    } finally {
      setLoading(false);
    }
  };

  const abrirAtendimento = (solicitacao: SolicitacaoSAMU) => {
    setSolicitacaoSelecionada(solicitacao);
    setFormData({
      solicitacaoId: solicitacao.id!,
      profissionalId: 1, // TODO: Pegar do contexto
      detalhamento: '',
      classificacaoRisco: 'NAO_INFORMADO',
      avaliacaoDor: 0,
      dataHoraInicio: new Date().toISOString(),
    });
    setModalAberto(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.tipoEncaminhamentoId) {
      toast.error('Selecione o tipo de encaminhamento');
      return;
    }

    if (!formData.detalhamento?.trim()) {
      toast.error('Informe o detalhamento do atendimento');
      return;
    }

    try {
      const payload: AtendimentoSolicitacao = {
        ...formData,
        dataHoraEncerramento: new Date().toISOString(),
      } as AtendimentoSolicitacao;

      await samuService.criarAtendimentoSolicitacao(payload);

      toast.success('✅ Atendimento registrado com sucesso!');
      setModalAberto(false);
      setSolicitacaoSelecionada(null);
      setFormData({
        detalhamento: '',
        classificacaoRisco: 'NAO_INFORMADO',
        avaliacaoDor: 0,
      });
      carregarDados();
    } catch (error: any) {
      console.error('Erro ao registrar atendimento:', error);
      toast.error(error.response?.data?.message || 'Erro ao registrar atendimento');
    }
  };

  const getClassificacaoRiscoColor = (classificacao: string) => {
    switch (classificacao) {
      case 'MUITO_RISCO': return 'bg-red-100 text-red-800';
      case 'MEDIO_RISCO': return 'bg-yellow-100 text-yellow-800';
      case 'NAO_INFORMADO': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPrioridadeColor = (tempo: string) => {
    // Lógica para determinar prioridade baseada no tempo de espera
    const minutos = calcularMinutosEspera(tempo);
    if (minutos > 30) return 'text-red-600';
    if (minutos > 15) return 'text-yellow-600';
    return 'text-green-600';
  };

  const calcularMinutosEspera = (dataHora: string): number => {
    const agora = new Date();
    const chamada = new Date(dataHora);
    const diff = agora.getTime() - chamada.getTime();
    return Math.floor(diff / 1000 / 60);
  };

  const formatarTempoEspera = (dataHora: string): string => {
    const minutos = calcularMinutosEspera(dataHora);
    if (minutos < 60) return `${minutos} min`;
    const horas = Math.floor(minutos / 60);
    const minutosRestantes = minutos % 60;
    return `${horas}h ${minutosRestantes}min`;
  };

  // Filtrar tipos de encaminhamento
  const tiposEncaminhamentoAtendimento = tiposEncaminhamento.filter(t => !t.encerramento);
  const tiposEncaminhamentoEncerramento = tiposEncaminhamento.filter(t => t.encerramento);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Stethoscope className="w-6 h-6 text-blue-600" />
            Atendimentos de Solicitações - Regulação Médica
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Avaliação e encaminhamento de solicitações do SAMU
          </p>
        </div>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pendentes Regulação</p>
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
                <p className="text-sm text-gray-600">Tempo Médio Espera</p>
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

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Alta Prioridade</p>
                <p className="text-2xl font-bold text-red-600">
                  {solicitacoesPendentes.filter(s => calcularMinutosEspera(s.dataHora) > 30).length}
                </p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alerta para solicitações urgentes */}
      {solicitacoesPendentes.some(s => calcularMinutosEspera(s.dataHora) > 30) && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            <strong>Atenção!</strong> Existem solicitações aguardando há mais de 30 minutos.
          </AlertDescription>
        </Alert>
      )}

      {/* Lista de Solicitações Pendentes */}
      <Card>
        <CardHeader>
          <CardTitle>Solicitações Aguardando Regulação ({solicitacoesPendentes.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center p-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
            </div>
          ) : solicitacoesPendentes.length === 0 ? (
            <div className="text-center p-12 text-gray-500">
              <Stethoscope className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium">Nenhuma solicitação pendente</p>
              <p className="text-sm">Todas as solicitações foram atendidas</p>
            </div>
          ) : (
            <div className="space-y-4">
              {solicitacoesPendentes.map((solicitacao) => (
                <Card key={solicitacao.id} className="hover:shadow-md transition-shadow border-l-4 border-l-yellow-500">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1 space-y-3">
                        {/* Header */}
                        <div className="flex items-center gap-3">
                          <Badge className="bg-blue-600 text-white font-mono">
                            #{solicitacao.codigo}
                          </Badge>
                          <Badge className={getPrioridadeColor(solicitacao.dataHora)}>
                            <Clock className="w-3 h-3 mr-1" />
                            {formatarTempoEspera(solicitacao.dataHora)} de espera
                          </Badge>
                          <span className="text-sm text-gray-600">
                            {new Date(solicitacao.dataHora).toLocaleString('pt-BR')}
                          </span>
                        </div>

                        {/* Informações da Chamada */}
                        <div className="grid grid-cols-2 gap-4">
                          <div className="flex items-center gap-2 text-sm">
                            <Phone className="w-4 h-4 text-gray-500" />
                            <span>{solicitacao.telefone}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <User className="w-4 h-4 text-gray-500" />
                            <span>{solicitacao.usuarioNome || 'Não identificado'}</span>
                          </div>
                        </div>

                        {/* Endereço */}
                        <div className="flex items-center gap-2 text-sm">
                          <MapPin className="w-4 h-4 text-gray-500" />
                          <span>
                            {solicitacao.logradouro}, {solicitacao.numero || 'S/N'} - {solicitacao.bairro}, {solicitacao.municipio}
                          </span>
                        </div>

                        {/* Motivo da Queixa */}
                        {solicitacao.motivoQueixa && (
                          <div className="bg-gray-50 p-3 rounded-lg">
                            <p className="text-sm font-medium text-gray-700">Motivo da Queixa:</p>
                            <p className="text-sm text-gray-900 mt-1">{solicitacao.motivoQueixa}</p>
                          </div>
                        )}

                        {/* Ponto de Referência */}
                        {solicitacao.pontoReferencia && (
                          <div className="text-sm text-gray-600">
                            <strong>Ponto de Referência:</strong> {solicitacao.pontoReferencia}
                          </div>
                        )}
                      </div>

                      {/* Botão de Atender */}
                      <div className="ml-4">
                        <Button
                          onClick={() => abrirAtendimento(solicitacao)}
                          size="lg"
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          <Stethoscope className="w-4 h-4 mr-2" />
                          Atender
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

      {/* Modal de Atendimento */}
      <Dialog open={modalAberto} onOpenChange={setModalAberto}>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              🩺 Atendimento de Regulação Médica - #{solicitacaoSelecionada?.codigo}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit}>
            <Tabs defaultValue="atendimento" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="solicitacao">Dados da Solicitação</TabsTrigger>
                <TabsTrigger value="atendimento">Atendimento</TabsTrigger>
                <TabsTrigger value="encaminhamento">Encaminhamento</TabsTrigger>
              </TabsList>

              {/* ABA DADOS DA SOLICITAÇÃO */}
              <TabsContent value="solicitacao" className="space-y-4">
                {solicitacaoSelecionada && (
                  <>
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Informações da Chamada</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <strong>Telefone:</strong> {solicitacaoSelecionada.telefone}
                          </div>
                          <div>
                            <strong>Horário:</strong> {new Date(solicitacaoSelecionada.dataHora).toLocaleString('pt-BR')}
                          </div>
                          <div>
                            <strong>Solicitante:</strong> {solicitacaoSelecionada.solicitante || '-'}
                          </div>
                          <div>
                            <strong>Usuário:</strong> {solicitacaoSelecionada.usuarioNome || '-'}
                          </div>
                        </div>

                        {solicitacaoSelecionada.motivoQueixa && (
                          <div className="bg-gray-50 p-3 rounded-lg">
                            <strong className="text-sm">Motivo da Queixa:</strong>
                            <p className="text-sm mt-1">{solicitacaoSelecionada.motivoQueixa}</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Local da Ocorrência</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2 text-sm">
                        <p>
                          <strong>Endereço:</strong> {solicitacaoSelecionada.logradouro}, {solicitacaoSelecionada.numero || 'S/N'}
                        </p>
                        <p>
                          <strong>Bairro:</strong> {solicitacaoSelecionada.bairro} - {solicitacaoSelecionada.municipio}
                        </p>
                        {solicitacaoSelecionada.pontoReferencia && (
                          <p>
                            <strong>Ponto de Referência:</strong> {solicitacaoSelecionada.pontoReferencia}
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  </>
                )}
              </TabsContent>

              {/* ABA ATENDIMENTO */}
              <TabsContent value="atendimento" className="space-y-4">
                <div>
                  <Label htmlFor="detalhamento">Detalhamento do Atendimento *</Label>
                  <Textarea
                    value={formData.detalhamento}
                    onChange={(e) => setFormData({ ...formData, detalhamento: e.target.value })}
                    rows={4}
                    placeholder="Descreva a avaliação médica, sintomas identificados, conduta..."
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="classificacaoRisco">Classificação de Risco *</Label>
                    <Select
                      value={formData.classificacaoRisco}
                      onValueChange={(value) => setFormData({ ...formData, classificacaoRisco: value as any })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="MUITO_RISCO">
                          <Badge className="bg-red-100 text-red-800">Muito Risco</Badge>
                        </SelectItem>
                        <SelectItem value="MEDIO_RISCO">
                          <Badge className="bg-yellow-100 text-yellow-800">Médio Risco</Badge>
                        </SelectItem>
                        <SelectItem value="NAO_INFORMADO">
                          <Badge className="bg-gray-100 text-gray-800">Não Informado</Badge>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="avaliacaoDor">Avaliação de Dor (0-10)</Label>
                    <Input
                      type="number"
                      min="0"
                      max="10"
                      value={formData.avaliacaoDor}
                      onChange={(e) => setFormData({ ...formData, avaliacaoDor: parseInt(e.target.value) || 0 })}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      0 = Sem dor | 10 = Dor máxima
                    </p>
                  </div>
                </div>

                {/* Indicador Visual da Dor */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm font-medium">Escala de Dor:</span>
                    <Badge className={
                      (formData.avaliacaoDor || 0) >= 8 ? 'bg-red-500' :
                      (formData.avaliacaoDor || 0) >= 5 ? 'bg-yellow-500' :
                      'bg-green-500'
                    }>
                      {formData.avaliacaoDor || 0}/10
                    </Badge>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className={`h-3 rounded-full transition-all ${
                        (formData.avaliacaoDor || 0) >= 8 ? 'bg-red-500' :
                        (formData.avaliacaoDor || 0) >= 5 ? 'bg-yellow-500' :
                        'bg-green-500'
                      }`}
                      style={{ width: `${(formData.avaliacaoDor || 0) * 10}%` }}
                    />
                  </div>
                </div>
              </TabsContent>

              {/* ABA ENCAMINHAMENTO */}
              <TabsContent value="encaminhamento" className="space-y-4">
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Escolha o tipo de encaminhamento adequado para a situação avaliada
                  </AlertDescription>
                </Alert>

                <div>
                  <Label htmlFor="tipoEncaminhamentoId">Tipo de Encaminhamento *</Label>
                  <Select
                    value={formData.tipoEncaminhamentoId?.toString()}
                    onValueChange={(value) => setFormData({ ...formData, tipoEncaminhamentoId: parseInt(value) })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o encaminhamento..." />
                    </SelectTrigger>
                    <SelectContent>
                      <div className="px-2 py-1 text-xs font-semibold text-gray-500">
                        Encaminhamentos para Ambulância
                      </div>
                      {tiposEncaminhamentoAtendimento.map(tipo => (
                        <SelectItem key={tipo.id} value={tipo.id.toString()}>
                          {tipo.descricao}
                        </SelectItem>
                      ))}

                      <div className="px-2 py-1 text-xs font-semibold text-gray-500 mt-2">
                        Encerramentos (sem ambulância)
                      </div>
                      {tiposEncaminhamentoEncerramento.map(tipo => (
                        <SelectItem key={tipo.id} value={tipo.id.toString()}>
                          {tipo.descricao}
                          <Badge variant="outline" className="ml-2">Encerra</Badge>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {formData.tipoEncaminhamentoId &&
                 !tiposEncaminhamento.find(t => t.id === formData.tipoEncaminhamentoId)?.encerramento && (
                  <div>
                    <Label htmlFor="profissionalEncaminhamentoId">Profissional de Encaminhamento</Label>
                    <Select
                      value={formData.profissionalEncaminhamentoId?.toString()}
                      onValueChange={(value) => setFormData({ ...formData, profissionalEncaminhamentoId: parseInt(value) })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o profissional (opcional)..." />
                      </SelectTrigger>
                      <SelectContent>
                        {profissionais.map(prof => (
                          <SelectItem key={prof.id} value={prof.id.toString()}>
                            {prof.nome}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-gray-500 mt-1">
                      Profissional que receberá a solicitação de ambulância
                    </p>
                  </div>
                )}
              </TabsContent>
            </Tabs>

            <DialogFooter className="mt-6">
              <Button type="button" variant="outline" onClick={() => setModalAberto(false)}>
                Cancelar
              </Button>
              <Button type="submit">
                Concluir Atendimento
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default AtendimentosSolicitacoes;
