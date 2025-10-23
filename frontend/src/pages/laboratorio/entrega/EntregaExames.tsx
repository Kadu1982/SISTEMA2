import React, { useState, useEffect } from 'react';
import { UserCheck, Search, FileText, Printer, AlertCircle, CheckCircle, Fingerprint } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import laboratorioService, { ResultadoExame } from '@/services/laboratorio/laboratorioService';

const EntregaExames: React.FC = () => {
  const [resultadosProntos, setResultadosProntos] = useState<ResultadoExame[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTermo, setSearchTermo] = useState('');
  const [dialogEntrega, setDialogEntrega] = useState(false);
  const [resultadoSelecionado, setResultadoSelecionado] = useState<ResultadoExame | null>(null);
  const [verificacaoBiometria, setVerificacaoBiometria] = useState(false);
  const [verificacaoDocumento, setVerificacaoDocumento] = useState('');

  useEffect(() => {
    carregarProntos();
  }, []);

  const carregarProntos = async () => {
    setLoading(true);
    try {
      const response = await laboratorioService.listarProntosEntrega();
      console.log('Response completo (entrega):', response);
      console.log('response.data:', response.data);

      // Handle ApiResponse wrapper structure
      let data: any = [];
      if (response.data) {
        if (response.data.data !== undefined) {
          data = response.data.data; // ApiResponse { data: [...] }
        } else {
          data = response.data; // Direct array
        }
      }

      console.log('Data processado (entrega):', data);
      setResultadosProntos(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Erro ao carregar resultados prontos para entrega:', error);
      toast.error('Erro ao carregar resultados prontos para entrega');
      setResultadosProntos([]);
    } finally {
      setLoading(false);
    }
  };

  const buscarPorCodigo = async () => {
    if (!searchTermo.trim()) {
      toast.error('Digite um código de barras ou número de recepção');
      return;
    }

    setLoading(true);
    try {
      const response = await laboratorioService.buscarRecepcaoPorNumero(searchTermo);
      toast.success('Recepção encontrada!');
      // TODO: Buscar resultado específico e adicionar na lista
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Resultado não encontrado');
    } finally {
      setLoading(false);
    }
  };

  const abrirDialogEntrega = (resultado: ResultadoExame) => {
    setResultadoSelecionado(resultado);
    setDialogEntrega(true);
    setVerificacaoBiometria(false);
    setVerificacaoDocumento('');
  };

  const confirmarEntrega = async () => {
    if (!verificacaoDocumento) {
      toast.error('Informe o documento de quem está retirando');
      return;
    }

    if (!resultadoSelecionado) {
      toast.error('Nenhum resultado selecionado');
      return;
    }

    try {
      await laboratorioService.registrarEntrega(resultadoSelecionado.id!, {
        nomeRetirou: 'Paciente', // Em implementação completa, seria um campo do formulário
        documentoRetirou: verificacaoDocumento,
        parentescoRetirou: 'Próprio paciente',
        biometriaValidada: verificacaoBiometria,
        documentoValidado: true,
        examesEntregues: [resultadoSelecionado.exameRecepcaoId],
        observacoes: 'Entrega realizada via sistema'
      });
      toast.success('Entrega registrada com sucesso!');
      setDialogEntrega(false);
      carregarProntos();
    } catch (error) {
      toast.error('Erro ao registrar entrega');
    }
  };

  const imprimirLaudo = async (resultado: ResultadoExame) => {
    try {
      // TODO: Implementar impressão de laudo
      toast.success('Laudo enviado para impressão');
    } catch (error) {
      toast.error('Erro ao imprimir laudo');
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6 flex items-center gap-2">
        <UserCheck />
        Entrega de Resultados
      </h1>

      {/* Busca */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Buscar Resultado</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Digite o código de barras, número de recepção ou CPF do paciente..."
                value={searchTermo}
                onChange={(e) => setSearchTermo(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && buscarPorCodigo()}
                className="pl-10"
              />
            </div>
            <Button onClick={buscarPorCodigo} disabled={loading}>
              Buscar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Prontos para Entrega */}
      <Card>
        <CardHeader>
          <CardTitle>Resultados Prontos para Entrega</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center p-8">
              <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : resultadosProntos.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-gray-500">
              <AlertCircle className="w-16 h-16 mb-4 text-gray-300" />
              <p className="text-lg font-medium">Nenhum resultado pronto para entrega</p>
              <p className="text-sm">Use a busca para localizar um resultado específico</p>
            </div>
          ) : (
            <div className="space-y-4">
              {resultadosProntos.map((resultado) => (
                <Card key={resultado.id} className="border-l-4 border-l-green-500">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold">{resultado.pacienteNome}</h3>
                          <Badge variant="success">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Pronto
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-sm text-gray-600 mb-3">
                          <div>
                            <span className="font-medium">Recepção:</span> {resultado.numeroRecepcao}
                          </div>
                          <div>
                            <span className="font-medium">Exame:</span> {resultado.exameNome}
                          </div>
                          <div>
                            <span className="font-medium">Digitação:</span>{' '}
                            {resultado.dataResultado
                              ? new Date(resultado.dataResultado).toLocaleString('pt-BR')
                              : '-'}
                          </div>
                          <div>
                            <span className="font-medium">Assinatura:</span>{' '}
                            {resultado.profissionalAssinatura || '-'}
                          </div>
                        </div>
                        {resultado.observacoes && (
                          <p className="text-sm text-gray-600">
                            <span className="font-medium">Obs:</span> {resultado.observacoes}
                          </p>
                        )}
                      </div>
                      <div className="ml-4 flex flex-col gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => imprimirLaudo(resultado)}
                        >
                          <Printer className="w-4 h-4 mr-2" />
                          Imprimir
                        </Button>
                        <Button onClick={() => abrirDialogEntrega(resultado)}>
                          <UserCheck className="w-4 h-4 mr-2" />
                          Registrar Entrega
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

      {/* Dialog de Confirmação de Entrega */}
      <Dialog open={dialogEntrega} onOpenChange={setDialogEntrega}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Entrega de Resultado</DialogTitle>
          </DialogHeader>
          {resultadoSelecionado && (
            <div className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="font-medium">{resultadoSelecionado.pacienteNome}</p>
                <p className="text-sm text-gray-600">
                  Recepção: {resultadoSelecionado.numeroRecepcao}
                </p>
                <p className="text-sm text-gray-600">
                  Exame: {resultadoSelecionado.exameNome}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Documento de quem está retirando *
                </label>
                <Input
                  placeholder="CPF ou RG"
                  value={verificacaoDocumento}
                  onChange={(e) => setVerificacaoDocumento(e.target.value)}
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="biometria"
                  checked={verificacaoBiometria}
                  onChange={(e) => setVerificacaoBiometria(e.target.checked)}
                  className="w-4 h-4"
                />
                <label htmlFor="biometria" className="text-sm flex items-center gap-2">
                  <Fingerprint className="w-4 h-4" />
                  Biometria coletada
                </label>
              </div>

              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setDialogEntrega(false)}>
                  Cancelar
                </Button>
                <Button onClick={confirmarEntrega}>
                  Confirmar Entrega
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EntregaExames;