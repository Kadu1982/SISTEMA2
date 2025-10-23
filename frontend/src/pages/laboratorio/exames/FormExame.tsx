import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Save, ArrowLeft } from 'lucide-react';
import laboratorioService, { Exame } from '../../../services/laboratorio/laboratorioService';
import { toast } from 'react-hot-toast';

const FormExame: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [exame, setExame] = useState<Exame>({
    codigo: '',
    nome: '',
    ativo: true,
    permiteAgendamento: true,
    exameUrgencia: false,
    tipoDigitacao: 'POR_CAMPO',
    usarAssinaturaEletronica: false,
    usaInterfaceamento: false,
  });

  const handleSave = async () => {
    try {
      if (id) {
        await laboratorioService.atualizarExame(Number(id), exame);
        toast.success('Exame atualizado');
      } else {
        await laboratorioService.criarExame(exame);
        toast.success('Exame criado');
      }
      navigate('/laboratorio/exames');
    } catch (error) {
      toast.error('Erro ao salvar exame');
    }
  };

  return (
    <div className="p-8">
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate('/laboratorio/exames')}
          className="p-2 hover:bg-gray-100 rounded"
        >
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-3xl font-bold">{id ? 'Editar' : 'Novo'} Exame</h1>
      </div>

      <div className="bg-white rounded-lg shadow p-6 space-y-6">
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium mb-1">Código *</label>
            <input
              type="text"
              value={exame.codigo}
              onChange={(e) => setExame({...exame, codigo: e.target.value})}
              className="w-full px-3 py-2 border rounded-lg"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Nome *</label>
            <input
              type="text"
              value={exame.nome}
              onChange={(e) => setExame({...exame, nome: e.target.value})}
              className="w-full px-3 py-2 border rounded-lg"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Código SIGTAP</label>
            <input
              type="text"
              value={exame.codigoSigtap || ''}
              onChange={(e) => setExame({...exame, codigoSigtap: e.target.value})}
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Código TUSS</label>
            <input
              type="text"
              value={exame.codigoTuss || ''}
              onChange={(e) => setExame({...exame, codigoTuss: e.target.value})}
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Tipo de Digitação</label>
          <select
            value={exame.tipoDigitacao}
            onChange={(e) => setExame({...exame, tipoDigitacao: e.target.value as any})}
            className="w-full px-3 py-2 border rounded-lg"
          >
            <option value="POR_CAMPO">Por Campo</option>
            <option value="MEMORANDO">Memorando</option>
            <option value="MISTO">Misto</option>
          </select>
        </div>

        <div className="space-y-2">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={exame.ativo}
              onChange={(e) => setExame({...exame, ativo: e.target.checked})}
              className="rounded"
            />
            <span>Ativo</span>
          </label>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={exame.permiteAgendamento}
              onChange={(e) => setExame({...exame, permiteAgendamento: e.target.checked})}
              className="rounded"
            />
            <span>Permite Agendamento</span>
          </label>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={exame.exameUrgencia}
              onChange={(e) => setExame({...exame, exameUrgencia: e.target.checked})}
              className="rounded"
            />
            <span>Exame de Urgência</span>
          </label>
        </div>

        <div className="flex gap-4 justify-end pt-6 border-t">
          <button
            onClick={() => navigate('/laboratorio/exames')}
            className="px-6 py-2 border rounded-lg hover:bg-gray-50"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700"
          >
            <Save size={20} />
            Salvar
          </button>
        </div>
      </div>
    </div>
  );
};

export default FormExame;