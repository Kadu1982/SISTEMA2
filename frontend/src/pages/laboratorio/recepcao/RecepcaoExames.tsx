import React, { useState, useEffect } from 'react';
import { Plus, User, TestTube } from 'lucide-react';
import laboratorioService, { CriarRecepcaoRequest, Exame } from '../../../services/laboratorio/laboratorioService';
import { toast } from 'react-hot-toast';
import PacienteBusca from '@/components/agendamento/PacienteBusca';
import { Paciente } from '@/types/paciente/Paciente';

const RecepcaoExames: React.FC = () => {
  const [step, setStep] = useState<'buscar' | 'form'>('buscar');
  const [pacienteSelecionado, setPacienteSelecionado] = useState<Paciente | null>(null);
  const [examesSelecionados, setExamesSelecionados] = useState<any[]>([]);
  const [examesDisponiveis, setExamesDisponiveis] = useState<Exame[]>([]);
  const [buscaExame, setBuscaExame] = useState('');

  useEffect(() => {
    carregarExamesDisponiveis();
  }, []);

  const carregarExamesDisponiveis = async () => {
    try {
      const response = await laboratorioService.listarExamesAtivos();

      // Handle ApiResponse wrapper structure
      let data: any = [];
      if (response.data) {
        if (response.data.data !== undefined) {
          data = response.data.data;
        } else {
          data = response.data;
        }
      }

      setExamesDisponiveis(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Erro ao carregar exames disponíveis:', error);
      toast.error('Erro ao carregar exames disponíveis');
      setExamesDisponiveis([]);
    }
  };

  // Handle patient selection from unified search component
  const handlePacienteSelecionado = (paciente: Paciente | null) => {
    if (paciente) {
      setPacienteSelecionado(paciente);
      setStep('form');
    } else {
      setPacienteSelecionado(null);
      setStep('buscar');
    }
  };

  const [formData, setFormData] = useState<CriarRecepcaoRequest>({
    pacienteId: 0,
    unidadeId: 1,
    urgente: false,
    tipoAtendimento: 'SUS',
    exames: [],
  });

  const handleSubmit = async () => {
    if (!pacienteSelecionado?.id) {
      toast.error('Selecione um paciente');
      return;
    }

    try {
      formData.pacienteId = pacienteSelecionado.id;
      formData.exames = examesSelecionados.map(e => ({
        exameId: e.id,
        quantidade: 1,
        autorizado: true,
      }));

      await laboratorioService.criarRecepcao(formData);
      toast.success('Recepção realizada com sucesso!');

      // Reset
      setStep('buscar');
      setPacienteSelecionado(null);
      setExamesSelecionados([]);
    } catch (error) {
      toast.error('Erro ao criar recepção');
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Recepção de Exames</h1>

      {step === 'buscar' ? (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <User size={24} />
            Buscar Paciente
          </h2>

          <div className="mb-6">
            <PacienteBusca
              onPacienteSelecionado={handlePacienteSelecionado}
              placeholder="Digite o nome ou CPF do paciente..."
            />
          </div>

          <div className="text-center p-4 text-gray-500">
            <p>Digite o nome ou CPF do paciente para iniciar a busca</p>
            <p className="text-sm mt-2">A busca é dinâmica e começa com apenas 1 caractere</p>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Dados do Paciente */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="font-semibold mb-4">Dados do Paciente</h3>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Nome:</span>
                <p className="font-medium">{pacienteSelecionado?.nomeCompleto}</p>
              </div>
              <div>
                <span className="text-gray-600">CPF:</span>
                <p className="font-medium">{pacienteSelecionado?.cpf || 'Não informado'}</p>
              </div>
              <div>
                <span className="text-gray-600">Data Nascimento:</span>
                <p className="font-medium">
                  {pacienteSelecionado?.dataNascimento
                    ? new Date(pacienteSelecionado.dataNascimento).toLocaleDateString('pt-BR')
                    : 'Não informado'}
                </p>
              </div>
            </div>
          </div>

          {/* Seleção de Exames */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <TestTube size={20} />
              Selecionar Exames
            </h3>

            <div className="mb-4">
              <input
                type="text"
                placeholder="Buscar exame..."
                value={buscaExame}
                onChange={(e) => setBuscaExame(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg"
              />
            </div>

            {/* Lista de exames disponíveis */}
            <div className="space-y-2 mb-6">
              {examesDisponiveis
                .filter(exame => 
                  !buscaExame || 
                  exame.nome.toLowerCase().includes(buscaExame.toLowerCase()) ||
                  exame.codigo.toLowerCase().includes(buscaExame.toLowerCase())
                )
                .slice(0, 5) // Limitar a 5 resultados para não sobrecarregar a UI
                .map(exame => (
                  <button
                    key={exame.id}
                    onClick={() => {
                      if (!examesSelecionados.find(e => e.id === exame.id)) {
                        setExamesSelecionados([...examesSelecionados, exame]);
                      }
                    }}
                    className="w-full text-left p-3 border rounded hover:bg-gray-50"
                  >
                    <div>
                      <p className="font-medium">{exame.nome}</p>
                      <p className="text-xs text-gray-500">Código: {exame.codigo}</p>
                    </div>
                  </button>
                ))
              }
              {examesDisponiveis.length === 0 && (
                <div className="text-center p-4 text-gray-500">
                  <p>Carregando exames disponíveis...</p>
                </div>
              )}
            </div>

            {/* Exames selecionados */}
            {examesSelecionados.length > 0 && (
              <div>
                <h4 className="font-medium mb-2">Exames Selecionados:</h4>
                <div className="space-y-2">
                  {examesSelecionados.map((exame, idx) => (
                    <div key={idx} className="flex justify-between items-center p-2 bg-blue-50 rounded">
                      <span>{exame.nome}</span>
                      <button
                        onClick={() => setExamesSelecionados(examesSelecionados.filter((_, i) => i !== idx))}
                        className="text-red-600 hover:text-red-800"
                      >
                        Remover
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Tipo de Atendimento */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="font-semibold mb-4">Tipo de Atendimento</h3>
            <div className="flex gap-4">
              {['SUS', 'PARTICULAR', 'CONVENIO', 'GRATUITO'].map(tipo => (
                <label key={tipo} className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="tipoAtendimento"
                    value={tipo}
                    checked={formData.tipoAtendimento === tipo}
                    onChange={(e) => setFormData({...formData, tipoAtendimento: e.target.value as any})}
                    className="rounded-full"
                  />
                  <span>{tipo}</span>
                </label>
              ))}
            </div>

            <label className="flex items-center gap-2 mt-4">
              <input
                type="checkbox"
                checked={formData.urgente}
                onChange={(e) => setFormData({...formData, urgente: e.target.checked})}
                className="rounded"
              />
              <span className="text-red-600 font-medium">Exame Urgente</span>
            </label>
          </div>

          {/* Ações */}
          <div className="flex gap-4 justify-end">
            <button
              onClick={() => setStep('buscar')}
              className="px-6 py-2 border rounded-lg hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              onClick={handleSubmit}
              disabled={examesSelecionados.length === 0}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              Finalizar Recepção
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecepcaoExames;