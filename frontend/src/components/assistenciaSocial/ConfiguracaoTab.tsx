import React, { useEffect, useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import assistenciaSocialService, { ConfiguracaoAssistenciaSocial } from '@/services/assistenciaSocialService';
import { Loader2 } from 'lucide-react';
import VinculosUnidadeVulnerabilidadeTab from './VinculosUnidadeVulnerabilidadeTab';

const ConfiguracaoTab: React.FC = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [configuracao, setConfiguracao] = useState<ConfiguracaoAssistenciaSocial | null>(null);
  const [activeTab, setActiveTab] = useState('valores');

  useEffect(() => {
    loadConfiguracao();
  }, []);

  const loadConfiguracao = async () => {
    try {
      setLoading(true);
      const data = await assistenciaSocialService.getConfiguracao();
      setConfiguracao(data);
    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar as configurações. Tente novamente mais tarde.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!configuracao) return;

    try {
      setSaving(true);
      await assistenciaSocialService.salvarConfiguracao(configuracao);
      toast({
        title: 'Sucesso',
        description: 'Configurações salvas com sucesso!',
      });
    } catch (error) {
      console.error('Erro ao salvar configurações:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível salvar as configurações. Tente novamente mais tarde.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!configuracao) return;

    const { name, value, type } = e.target;

    if (type === 'number') {
      setConfiguracao({
        ...configuracao,
        [name]: parseFloat(value) || 0,
      });
    } else {
      setConfiguracao({
        ...configuracao,
        [name]: value,
      });
    }
  };

  const handleSwitchChange = (name: string, checked: boolean) => {
    if (!configuracao) return;

    setConfiguracao({
      ...configuracao,
      [name]: checked,
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Carregando configurações...</span>
      </div>
    );
  }

  if (!configuracao) {
    return (
      <div className="text-center p-4">
        <p>Não foi possível carregar as configurações. Tente novamente mais tarde.</p>
        <Button onClick={loadConfiguracao} className="mt-2">Tentar novamente</Button>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Configurações do Módulo de Assistência Social</CardTitle>
        <CardDescription>
          Gerencie as configurações do módulo de Assistência Social.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-4 mb-4">
            <TabsTrigger value="valores">Valores</TabsTrigger>
            <TabsTrigger value="tempos">Tempos</TabsTrigger>
            <TabsTrigger value="parametros">Parâmetros</TabsTrigger>
            <TabsTrigger value="vinculos">Vínculos</TabsTrigger>
          </TabsList>

          <TabsContent value="valores">
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="valorSalarioMinimo">Valor do Salário Mínimo</Label>
                  <Input
                    id="valorSalarioMinimo"
                    name="valorSalarioMinimo"
                    type="number"
                    step="0.01"
                    value={configuracao.valorSalarioMinimo}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="valorLinhaPobreza">Valor da Linha de Pobreza</Label>
                  <Input
                    id="valorLinhaPobreza"
                    name="valorLinhaPobreza"
                    type="number"
                    step="0.01"
                    value={configuracao.valorLinhaPobreza}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="valorLinhaExtremaPobreza">Valor da Linha de Extrema Pobreza</Label>
                  <Input
                    id="valorLinhaExtremaPobreza"
                    name="valorLinhaExtremaPobreza"
                    type="number"
                    step="0.01"
                    value={configuracao.valorLinhaExtremaPobreza}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="valorBeneficioFamiliaAcolhedora">Valor do Benefício para Família Acolhedora</Label>
                  <Input
                    id="valorBeneficioFamiliaAcolhedora"
                    name="valorBeneficioFamiliaAcolhedora"
                    type="number"
                    step="0.01"
                    value={configuracao.valorBeneficioFamiliaAcolhedora}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="valorBeneficioFamiliaAcolhedoraEspecial">Valor do Benefício para Família Acolhedora (Necessidades Especiais)</Label>
                  <Input
                    id="valorBeneficioFamiliaAcolhedoraEspecial"
                    name="valorBeneficioFamiliaAcolhedoraEspecial"
                    type="number"
                    step="0.01"
                    value={configuracao.valorBeneficioFamiliaAcolhedoraEspecial}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="tempos">
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="tempoAtualizacaoTelas">Tempo de Atualização das Telas (minutos)</Label>
                  <Input
                    id="tempoAtualizacaoTelas"
                    name="tempoAtualizacaoTelas"
                    type="number"
                    value={configuracao.tempoAtualizacaoTelas}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tempoAtendimentoProfissionais">Tempo de Atendimento dos Profissionais (minutos)</Label>
                  <Input
                    id="tempoAtendimentoProfissionais"
                    name="tempoAtendimentoProfissionais"
                    type="number"
                    value={configuracao.tempoAtendimentoProfissionais}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tempoAlteracaoAtendimentoIndividual">Tempo de Alteração do Atendimento Individual (horas)</Label>
                  <Input
                    id="tempoAlteracaoAtendimentoIndividual"
                    name="tempoAlteracaoAtendimentoIndividual"
                    type="number"
                    value={configuracao.tempoAlteracaoAtendimentoIndividual}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tempoAlteracaoContrareferencia">Tempo de Alteração da Contrarreferência (horas)</Label>
                  <Input
                    id="tempoAlteracaoContrareferencia"
                    name="tempoAlteracaoContrareferencia"
                    type="number"
                    value={configuracao.tempoAlteracaoContrareferencia}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tempoAlteracaoDispensacaoBeneficios">Tempo de Alteração da Dispensação de Benefícios (horas)</Label>
                  <Input
                    id="tempoAlteracaoDispensacaoBeneficios"
                    name="tempoAlteracaoDispensacaoBeneficios"
                    type="number"
                    value={configuracao.tempoAlteracaoDispensacaoBeneficios}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="parametros">
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="desligarIntegranteGrupoServico">Desligar integrante do grupo ao desligar do serviço</Label>
                  <Switch
                    id="desligarIntegranteGrupoServico"
                    checked={configuracao.desligarIntegranteGrupoServico}
                    onCheckedChange={(checked) => handleSwitchChange('desligarIntegranteGrupoServico', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="alertarDispensacaoBeneficioDuplicado">Alertar sobre dispensação de benefício duplicado</Label>
                  <Switch
                    id="alertarDispensacaoBeneficioDuplicado"
                    checked={configuracao.alertarDispensacaoBeneficioDuplicado}
                    onCheckedChange={(checked) => handleSwitchChange('alertarDispensacaoBeneficioDuplicado', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="permitirTransferenciaIntegrantes">Permitir transferência de integrantes entre unidades</Label>
                  <Switch
                    id="permitirTransferenciaIntegrantes"
                    checked={configuracao.permitirTransferenciaIntegrantes}
                    onCheckedChange={(checked) => handleSwitchChange('permitirTransferenciaIntegrantes', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="campoValorBaseObrigatorio">Campo Valor Base obrigatório no cadastro de benefícios</Label>
                  <Switch
                    id="campoValorBaseObrigatorio"
                    checked={configuracao.campoValorBaseObrigatorio}
                    onCheckedChange={(checked) => handleSwitchChange('campoValorBaseObrigatorio', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="somenteIntegrantesFamiliaAtendimentoColetivo">Somente integrantes da família no atendimento coletivo</Label>
                  <Switch
                    id="somenteIntegrantesFamiliaAtendimentoColetivo"
                    checked={configuracao.somenteIntegrantesFamiliaAtendimentoColetivo}
                    onCheckedChange={(checked) => handleSwitchChange('somenteIntegrantesFamiliaAtendimentoColetivo', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="controleAutomaticoPobreza">Controle automático de pobreza por renda per capita</Label>
                  <Switch
                    id="controleAutomaticoPobreza"
                    checked={configuracao.controleAutomaticoPobreza}
                    onCheckedChange={(checked) => handleSwitchChange('controleAutomaticoPobreza', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="profissionaisIndicadoresRma">Profissionais para indicadores RMA</Label>
                  <Switch
                    id="profissionaisIndicadoresRma"
                    checked={configuracao.profissionaisIndicadoresRma}
                    onCheckedChange={(checked) => handleSwitchChange('profissionaisIndicadoresRma', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="controleSeparadoFamiliaAcolhedora">Controle separado de família acolhedora</Label>
                  <Switch
                    id="controleSeparadoFamiliaAcolhedora"
                    checked={configuracao.controleSeparadoFamiliaAcolhedora}
                    onCheckedChange={(checked) => handleSwitchChange('controleSeparadoFamiliaAcolhedora', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="evitarUnificacaoExclusaoFamiliasAcolhedoras">Evitar unificação/exclusão de famílias acolhedoras</Label>
                  <Switch
                    id="evitarUnificacaoExclusaoFamiliasAcolhedoras"
                    checked={configuracao.evitarUnificacaoExclusaoFamiliasAcolhedoras}
                    onCheckedChange={(checked) => handleSwitchChange('evitarUnificacaoExclusaoFamiliasAcolhedoras', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="portalSolicitacaoAcesso">Portal de solicitação de acesso</Label>
                  <Switch
                    id="portalSolicitacaoAcesso"
                    checked={configuracao.portalSolicitacaoAcesso}
                    onCheckedChange={(checked) => handleSwitchChange('portalSolicitacaoAcesso', checked)}
                  />
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="vinculos">
            <VinculosUnidadeVulnerabilidadeTab />
          </TabsContent>
        </Tabs>

        <div className="mt-6 flex justify-end">
          <Button onClick={handleSave} disabled={saving}>
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Salvar Configurações
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ConfiguracaoTab;
