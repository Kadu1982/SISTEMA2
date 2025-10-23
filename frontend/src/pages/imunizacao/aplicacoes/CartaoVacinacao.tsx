import React, { useState, useEffect } from 'react';
import { FileText, Search, Printer, Calendar, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import imunizacaoService, { AplicacaoVacina } from '@/services/imunizacao/imunizacaoService';
import PacienteBusca from '@/components/agendamento/PacienteBusca';
import { Paciente } from '@/types/paciente/Paciente';

const CartaoVacinacao: React.FC = () => {
  const [aplicacoes, setAplicacoes] = useState<AplicacaoVacina[]>([]);
  const [loading, setLoading] = useState(false);
  const [pacienteSelecionado, setPacienteSelecionado] = useState<Paciente | null>(null);

  const buscarHistorico = async () => {
    if (!pacienteSelecionado) {
      toast.error('Selecione um paciente primeiro');
      return;
    }

    setLoading(true);
    try {
      const response = await imunizacaoService.buscarAplicacoesPorPaciente(pacienteSelecionado.id);

      let data: any = [];
      if (response.data) {
        data = response.data.data !== undefined ? response.data.data : response.data;
      }

      setAplicacoes(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Erro ao carregar histórico:', error);
      toast.error('Erro ao carregar histórico de vacinação');
      setAplicacoes([]);
    } finally {
      setLoading(false);
    }
  };

  const imprimirCartao = () => {
    window.print();
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
          <FileText />
          Cartão de Vacinação
        </h1>
        {pacienteSelecionado && (
          <Button onClick={imprimirCartao}>
            <Printer className="w-4 h-4 mr-2" />
            Imprimir Cartão
          </Button>
        )}
      </div>

      {/* Busca de Paciente */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Buscar Paciente</CardTitle>
        </CardHeader>
        <CardContent>
          <PacienteBusca
            onPacienteSelecionado={(paciente) => {
              setPacienteSelecionado(paciente);
              if (paciente) {
                // Automatically search for patient's vaccination history
                setTimeout(() => buscarHistorico(), 100);
              }
            }}
            placeholder="Digite o nome ou CPF do paciente..."
            pacienteSelecionado={pacienteSelecionado}
          />
        </CardContent>
      </Card>

      {/* Histórico de Vacinação */}
      {pacienteSelecionado && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield />
              Histórico de Vacinação ({aplicacoes.length} doses)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center p-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
              </div>
            ) : aplicacoes.length === 0 ? (
              <div className="text-center p-12 text-gray-500">
                <Shield className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p className="text-lg font-medium">Nenhuma vacina registrada</p>
                <p className="text-sm">Este paciente ainda não possui histórico de vacinação</p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Tabela de Vacinas */}
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-semibold">Data</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold">Vacina</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold">Dose</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold">Lote</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold">Fabricante</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold">Estratégia</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold">Unidade</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {aplicacoes.map((aplicacao) => (
                        <tr key={aplicacao.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm">
                            {new Date(aplicacao.dataAplicacao).toLocaleDateString('pt-BR')}
                          </td>
                          <td className="px-4 py-3 text-sm font-medium">
                            {aplicacao.vacinaNome}
                          </td>
                          <td className="px-4 py-3 text-sm">{aplicacao.dose || '-'}</td>
                          <td className="px-4 py-3 text-sm">{aplicacao.lote || '-'}</td>
                          <td className="px-4 py-3 text-sm">{aplicacao.fabricante || '-'}</td>
                          <td className="px-4 py-3 text-sm">
                            <Badge variant="outline">{aplicacao.estrategiaVacinacao}</Badge>
                          </td>
                          <td className="px-4 py-3 text-sm">{aplicacao.unidadeNome}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Estatísticas */}
                <div className="grid grid-cols-3 gap-4 mt-6">
                  <Card>
                    <CardContent className="p-4 text-center">
                      <p className="text-3xl font-bold text-blue-600">{aplicacoes.length}</p>
                      <p className="text-sm text-gray-600">Total de Doses</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <p className="text-3xl font-bold text-green-600">
                        {new Set(aplicacoes.map((a) => a.vacinaId)).size}
                      </p>
                      <p className="text-sm text-gray-600">Vacinas Diferentes</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <p className="text-3xl font-bold text-purple-600">
                        {aplicacoes.filter((a) => a.estrategiaVacinacao === 'ROTINA').length}
                      </p>
                      <p className="text-sm text-gray-600">Doses de Rotina</p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CartaoVacinacao;
