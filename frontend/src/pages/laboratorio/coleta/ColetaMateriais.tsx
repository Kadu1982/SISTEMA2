import React, { useState, useEffect } from 'react';
import { TestTube, Search, Check, AlertCircle, Clock, Barcode } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import laboratorioService, { RecepcaoExame } from '@/services/laboratorio/laboratorioService';

const ColetaMateriais: React.FC = () => {
  const [aguardandoColeta, setAguardandoColeta] = useState<RecepcaoExame[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTermo, setSearchTermo] = useState('');

  useEffect(() => {
    carregarAguardandoColeta();
  }, []);

  const carregarAguardandoColeta = async () => {
    setLoading(true);
    try {
      const response = await laboratorioService.listarAguardandoColeta();
      console.log('Response completo (coleta):', response);
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

      console.log('Data processado (coleta):', data);
      setAguardandoColeta(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Erro ao carregar lista de aguardando coleta:', error);
      toast.error('Erro ao carregar lista de aguardando coleta');
      setAguardandoColeta([]);
    } finally {
      setLoading(false);
    }
  };

  const registrarColeta = async (recepcaoId: number) => {
    try {
      // Para simplicidade, registrar coleta com materiais padrão
      // Em uma implementação completa, seria necessário selecionar os materiais específicos
      await laboratorioService.registrarColeta(recepcaoId, []);
      toast.success('Coleta registrada com sucesso!');
      carregarAguardandoColeta();
    } catch (error) {
      toast.error('Erro ao registrar coleta');
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
      if (response.data.status === 'AGUARDANDO_COLETA') {
        toast.success('Recepção encontrada!');
        // Adicionar na lista temporariamente
        setAguardandoColeta([response.data]);
      } else {
        toast.warning(`Recepção encontrada, mas status atual: ${response.data.status}`);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Recepção não encontrada');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { variant: any; label: string }> = {
      AGUARDANDO_COLETA: { variant: 'default', label: 'Aguardando' },
      EM_COLETA: { variant: 'warning', label: 'Em Coleta' },
      COLETADO: { variant: 'success', label: 'Coletado' },
    };
    const config = statusMap[status] || { variant: 'secondary', label: status };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6 flex items-center gap-2">
        <TestTube />
        Coleta de Materiais
      </h1>

      {/* Busca por Código de Barras */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Barcode size={20} />
            Buscar por Código
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Digite o código de barras ou número da recepção..."
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

      {/* Lista de Aguardando Coleta */}
      <Card>
        <CardHeader>
          <CardTitle>Pacientes Aguardando Coleta</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center p-8">
              <Clock className="w-8 h-8 animate-spin text-blue-500" />
            </div>
          ) : aguardandoColeta.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-gray-500">
              <AlertCircle className="w-16 h-16 mb-4 text-gray-300" />
              <p className="text-lg font-medium">Nenhum paciente aguardando coleta</p>
              <p className="text-sm">Use o leitor de código de barras para localizar uma recepção</p>
            </div>
          ) : (
            <div className="space-y-4">
              {aguardandoColeta.map((recepcao) => (
                <Card key={recepcao.id} className="border-l-4 border-l-blue-500">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold">{recepcao.pacienteNome}</h3>
                          {recepcao.urgente && (
                            <Badge variant="destructive">URGENTE</Badge>
                          )}
                          {getStatusBadge(recepcao.status)}
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-sm text-gray-600 mb-3">
                          <div>
                            <span className="font-medium">Recepção:</span> {recepcao.numeroRecepcao}
                          </div>
                          <div>
                            <span className="font-medium">CPF:</span> {recepcao.pacienteCpf}
                          </div>
                          <div>
                            <span className="font-medium">Data:</span>{' '}
                            {recepcao.dataRecepcao
                              ? new Date(recepcao.dataRecepcao).toLocaleString('pt-BR')
                              : '-'}
                          </div>
                          <div>
                            <span className="font-medium">Tipo:</span> {recepcao.tipoAtendimento}
                          </div>
                        </div>
                        <div>
                          <p className="font-medium text-sm mb-1">Exames:</p>
                          <div className="flex flex-wrap gap-2">
                            {recepcao.exames.map((exame, idx) => (
                              <Badge key={idx} variant="outline">
                                {exame.exameNome || exame.exameCodigo}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        {recepcao.observacoes && (
                          <p className="mt-2 text-sm text-gray-600">
                            <span className="font-medium">Obs:</span> {recepcao.observacoes}
                          </p>
                        )}
                      </div>
                      <div className="ml-4 flex flex-col gap-2">
                        <Button
                          onClick={() => registrarColeta(recepcao.id!)}
                          className="whitespace-nowrap"
                        >
                          <Check className="w-4 h-4 mr-2" />
                          Registrar Coleta
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
    </div>
  );
};

export default ColetaMateriais;