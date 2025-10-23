import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/ui/tabs';
import laboratorioService, { ConfiguracaoLaboratorio as ConfigType } from '../../../services/laboratorio/laboratorioService';
import { toast } from 'react-hot-toast';
import { Save } from 'lucide-react';

const ConfiguracaoLaboratorio: React.FC = () => {
  const [config, setConfig] = useState<ConfigType>({
    unidadeId: 1,
    controleTransacao: false,
    leituraCodigoBarras: false,
    usarEstagiosAtendimento: false,
    integracaoConsorcio: false,
    usarBiometria: false,
    gerarCodigoBarrasAutomatico: true,
    validarIdadeExame: true,
    permitirExameDuplicado: false,
    diasValidadeExame: 90,
    digitacaoResultadoPorCampo: true,
    digitacaoResultadoMemorando: false,
    imprimirResultadoAutomatico: false,
    usarInterfaceamento: false,
    verificarDocumentoEntrega: true,
    verificarBiometriaEntrega: false,
    permitirEntregaParcial: true,
    alertarExamePendente: true,
    numeroViasEtiqueta: 1,
    imprimirEtiquetaRecepcao: true,
    imprimirComprovanteRecepcao: true,
    larguraEtiqueta: 40,
    alturaEtiqueta: 25,
    incluirNomePacienteEtiqueta: true,
    incluirDataNascimentoEtiqueta: true,
    corEstagioRecepcao: '#FFFFFF',
    corEstagioColeta: '#FFFF00',
    corEstagioResultado: '#00FF00',
    corEstagioEntrega: '#0000FF',
    periodoAlertaColeta: 30,
    periodoAlertaResultado: 60,
    usarAssinaturaEletronica: false,
    usarCertificadoDigital: false,
    usarPainelEletronico: false,
    tempoAtualizacaoPainel: 30,
    exibirNomeCompletoPainel: false,
    exportarEsus: false,
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    carregarConfiguracao();
  }, []);

  const carregarConfiguracao = async () => {
    try {
      const response = await laboratorioService.buscarConfiguracao(1);
      if (response.data.data) {
        setConfig(response.data.data);
      }
    } catch (error) {
      console.log('Configuração não encontrada, usando padrões');
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      if (config.id) {
        await laboratorioService.atualizarConfiguracao(config.id, config);
      } else {
        await laboratorioService.salvarConfiguracao(config);
      }
      toast.success('Configuração salva com sucesso');
      carregarConfiguracao();
    } catch (error) {
      toast.error('Erro ao salvar configuração');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Configurações do Laboratório</h1>
        <button
          onClick={handleSave}
          disabled={loading}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 disabled:opacity-50"
        >
          <Save size={20} />
          {loading ? 'Salvando...' : 'Salvar'}
        </button>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <Tabs defaultValue="laboratorio" className="w-full">
          <TabsList>
            <TabsTrigger value="laboratorio">Laboratório</TabsTrigger>
            <TabsTrigger value="resultado">Resultado</TabsTrigger>
            <TabsTrigger value="entrega">Entrega</TabsTrigger>
            <TabsTrigger value="impressao">Impressão</TabsTrigger>
            <TabsTrigger value="etiqueta">Etiqueta</TabsTrigger>
            <TabsTrigger value="estagios">Estágios</TabsTrigger>
            <TabsTrigger value="assinatura">Assinatura</TabsTrigger>
            <TabsTrigger value="painel">Painel</TabsTrigger>
          </TabsList>

          <TabsContent value="laboratorio" className="space-y-4 mt-6">
            <h3 className="font-semibold text-lg mb-4">Configurações Gerais</h3>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={config.leituraCodigoBarras}
                onChange={(e) => setConfig({...config, leituraCodigoBarras: e.target.checked})}
                className="rounded"
              />
              <span>Usar Leitura de Código de Barras</span>
            </label>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={config.gerarCodigoBarrasAutomatico}
                onChange={(e) => setConfig({...config, gerarCodigoBarrasAutomatico: e.target.checked})}
                className="rounded"
              />
              <span>Gerar Código de Barras Automaticamente</span>
            </label>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={config.usarBiometria}
                onChange={(e) => setConfig({...config, usarBiometria: e.target.checked})}
                className="rounded"
              />
              <span>Usar Biometria</span>
            </label>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={config.validarIdadeExame}
                onChange={(e) => setConfig({...config, validarIdadeExame: e.target.checked})}
                className="rounded"
              />
              <span>Validar Idade do Paciente para Exames</span>
            </label>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={config.permitirExameDuplicado}
                onChange={(e) => setConfig({...config, permitirExameDuplicado: e.target.checked})}
                className="rounded"
              />
              <span>Permitir Exame Duplicado</span>
            </label>

            <div>
              <label className="block text-sm font-medium mb-2">Dias de Validade do Exame</label>
              <input
                type="number"
                value={config.diasValidadeExame}
                onChange={(e) => setConfig({...config, diasValidadeExame: parseInt(e.target.value)})}
                className="w-32 px-3 py-2 border rounded-lg"
              />
            </div>
          </TabsContent>

          <TabsContent value="resultado" className="space-y-4 mt-6">
            <h3 className="font-semibold text-lg mb-4">Resultado de Exames</h3>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={config.digitacaoResultadoPorCampo}
                onChange={(e) => setConfig({...config, digitacaoResultadoPorCampo: e.target.checked})}
                className="rounded"
              />
              <span>Digitação de Resultado por Campo</span>
            </label>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={config.digitacaoResultadoMemorando}
                onChange={(e) => setConfig({...config, digitacaoResultadoMemorando: e.target.checked})}
                className="rounded"
              />
              <span>Digitação de Resultado em Memorando</span>
            </label>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={config.usarInterfaceamento}
                onChange={(e) => setConfig({...config, usarInterfaceamento: e.target.checked})}
                className="rounded"
              />
              <span>Usar Interfaceamento com Equipamentos</span>
            </label>

            {config.usarInterfaceamento && (
              <div>
                <label className="block text-sm font-medium mb-2">Caminho de Interfaceamento</label>
                <input
                  type="text"
                  value={config.caminhoInterfaceamento || ''}
                  onChange={(e) => setConfig({...config, caminhoInterfaceamento: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="C:\Interface\Lab"
                />
              </div>
            )}
          </TabsContent>

          <TabsContent value="entrega" className="space-y-4 mt-6">
            <h3 className="font-semibold text-lg mb-4">Entrega de Exames</h3>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={config.verificarDocumentoEntrega}
                onChange={(e) => setConfig({...config, verificarDocumentoEntrega: e.target.checked})}
                className="rounded"
              />
              <span>Verificar Documento na Entrega</span>
            </label>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={config.verificarBiometriaEntrega}
                onChange={(e) => setConfig({...config, verificarBiometriaEntrega: e.target.checked})}
                className="rounded"
              />
              <span>Verificar Biometria na Entrega</span>
            </label>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={config.permitirEntregaParcial}
                onChange={(e) => setConfig({...config, permitirEntregaParcial: e.target.checked})}
                className="rounded"
              />
              <span>Permitir Entrega Parcial de Exames</span>
            </label>
          </TabsContent>

          {/* Adicionar outras abas conforme necessário */}
        </Tabs>
      </div>
    </div>
  );
};

export default ConfiguracaoLaboratorio;