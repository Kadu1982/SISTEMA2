import React, { useState, useEffect } from 'react';
import { Search, Save, FileText } from 'lucide-react';
import laboratorioService, { RecepcaoExame } from '../../../services/laboratorio/laboratorioService';
import { toast } from 'react-hot-toast';

const DigitacaoResultados: React.FC = () => {
  const [examesPendentes, setExamesPendentes] = useState<RecepcaoExame[]>([]);
  const [recepcaoSelecionada, setRecepcaoSelecionada] = useState<any>(null);
  const [exameAtual, setExameAtual] = useState<any>(null);
  const [valoresCampos, setValoresCampos] = useState<Record<number, string>>({});
  const [resultadoTexto, setResultadoTexto] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    carregarExamesPendentes();
  }, []);

  const carregarExamesPendentes = async () => {
    setLoading(true);
    try {
      const response = await laboratorioService.listarPendentesDigitacao();
      console.log('Response completo (resultados):', response);
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

      console.log('Data processado (resultados):', data);
      setExamesPendentes(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Erro ao carregar exames pendentes:', error);
      toast.error('Erro ao carregar exames pendentes');
      setExamesPendentes([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSalvarResultado = async () => {
    try {
      await laboratorioService.salvarResultado({
        exameRecepcaoId: exameAtual.id,
        resultadoTexto,
        valoresCampos,
        liberarLaudo: false,
      });
      toast.success('Resultado salvo com sucesso!');
    } catch (error) {
      toast.error('Erro ao salvar resultado');
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Digitação de Resultados</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lista de Exames Pendentes */}
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="font-semibold mb-4">Exames Pendentes</h3>

          <div className="mb-4">
            <input
              type="text"
              placeholder="Buscar por nome ou número..."
              className="w-full px-3 py-2 border rounded-lg text-sm"
            />
          </div>

          <div className="space-y-2 max-h-96 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center p-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              </div>
            ) : examesPendentes.length === 0 ? (
              <div className="text-center p-4 text-gray-500">
                <p>Nenhum exame pendente de resultado</p>
              </div>
            ) : (
              examesPendentes.map((recepcao) => (
                <div
                  key={recepcao.id}
                  onClick={() => {
                    setRecepcaoSelecionada(recepcao);
                    setExameAtual({ 
                      id: recepcao.exames[0]?.id || 1, 
                      nome: recepcao.exames[0]?.exameNome || 'Exame sem nome' 
                    });
                  }}
                  className="p-3 border rounded hover:bg-blue-50 cursor-pointer"
                >
                  <p className="font-medium text-sm">{recepcao.pacienteNome}</p>
                  <p className="text-xs text-gray-600">
                    {recepcao.numeroRecepcao} - {recepcao.exames[0]?.exameNome || 'Exame'}
                  </p>
                  <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded mt-1 inline-block">
                    Pendente
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Formulário de Digitação */}
        <div className="lg:col-span-2 space-y-6">
          {exameAtual ? (
            <>
              {/* Header */}
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-bold">{exameAtual.nome}</h3>
                    <p className="text-sm text-gray-600">
                      Paciente: {recepcaoSelecionada?.pacienteNome}
                    </p>
                    <p className="text-sm text-gray-600">
                      Recepção: {recepcaoSelecionada?.numeroRecepcao}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700">
                      <FileText size={18} />
                      Textos Prontos
                    </button>
                  </div>
                </div>
              </div>

              {/* Campos do Exame */}
              <div className="bg-white rounded-lg shadow p-6">
                <h4 className="font-semibold mb-4">Campos do Exame</h4>

                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Hemácias</label>
                      <input
                        type="number"
                        step="0.01"
                        className="w-full px-3 py-2 border rounded-lg"
                        placeholder="4.5 - 6.0"
                      />
                      <p className="text-xs text-gray-500 mt-1">VR: 4.5 - 6.0 milhões/mm³</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">Hemoglobina</label>
                      <input
                        type="number"
                        step="0.1"
                        className="w-full px-3 py-2 border rounded-lg"
                        placeholder="12.0 - 16.0"
                      />
                      <p className="text-xs text-gray-500 mt-1">VR: 12.0 - 16.0 g/dL</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">Hematócrito</label>
                      <input
                        type="number"
                        step="0.1"
                        className="w-full px-3 py-2 border rounded-lg"
                        placeholder="36.0 - 48.0"
                      />
                      <p className="text-xs text-gray-500 mt-1">VR: 36.0 - 48.0 %</p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Observações</label>
                    <textarea
                      value={resultadoTexto}
                      onChange={(e) => setResultadoTexto(e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg"
                      rows={4}
                      placeholder="Digite observações sobre o resultado..."
                    />
                  </div>
                </div>
              </div>

              {/* Ações */}
              <div className="flex gap-4 justify-end">
                <button className="px-6 py-2 border rounded-lg hover:bg-gray-50">
                  Cancelar
                </button>
                <button className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700">
                  Salvar Rascunho
                </button>
                <button
                  onClick={handleSalvarResultado}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700"
                >
                  <Save size={20} />
                  Salvar e Liberar
                </button>
              </div>
            </>
          ) : (
            <div className="bg-white rounded-lg shadow p-12 text-center">
              <FileText size={64} className="mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500">Selecione um exame para começar a digitação</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DigitacaoResultados;