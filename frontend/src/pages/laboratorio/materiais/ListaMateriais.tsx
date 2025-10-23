import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2 } from 'lucide-react';
import laboratorioService, { MaterialExame } from '../../../services/laboratorio/laboratorioService';
import { toast } from 'react-hot-toast';

const ListaMateriais: React.FC = () => {
  const [materiais, setMateriais] = useState<MaterialExame[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editando, setEditando] = useState<MaterialExame | null>(null);

  const [form, setForm] = useState<MaterialExame>({
    sigla: '',
    descricao: '',
    ativo: true,
  });

  useEffect(() => {
    carregarMateriais();
  }, []);

  const carregarMateriais = async () => {
    try {
      const response = await laboratorioService.listarMateriais();
      setMateriais(response.data.data);
    } catch (error) {
      toast.error('Erro ao carregar materiais');
    }
  };

  const handleSave = async () => {
    try {
      if (editando?.id) {
        await laboratorioService.atualizarMaterial(editando.id, form);
        toast.success('Material atualizado');
      } else {
        await laboratorioService.criarMaterial(form);
        toast.success('Material criado');
      }
      setShowModal(false);
      carregarMateriais();
    } catch (error) {
      toast.error('Erro ao salvar material');
    }
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Materiais de Exame</h1>
        <button
          onClick={() => {
            setForm({ sigla: '', descricao: '', ativo: true });
            setEditando(null);
            setShowModal(true);
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <Plus size={20} />
          Novo Material
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Código</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sigla</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Descrição</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {materiais.map((material) => (
              <tr key={material.id}>
                <td className="px-6 py-4">{material.codigo}</td>
                <td className="px-6 py-4">{material.sigla}</td>
                <td className="px-6 py-4">{material.descricao}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 text-xs rounded-full ${material.ativo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {material.ativo ? 'Ativo' : 'Inativo'}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <button className="text-blue-600 hover:text-blue-900 mr-3">
                    <Edit size={18} />
                  </button>
                  <button className="text-red-600 hover:text-red-900">
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">{editando ? 'Editar' : 'Novo'} Material</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Sigla</label>
                <input
                  type="text"
                  value={form.sigla}
                  onChange={(e) => setForm({...form, sigla: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Descrição</label>
                <input
                  type="text"
                  value={form.descricao}
                  onChange={(e) => setForm({...form, descricao: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={form.ativo}
                  onChange={(e) => setForm({...form, ativo: e.target.checked})}
                  className="rounded"
                />
                <span>Ativo</span>
              </label>
            </div>
            <div className="flex gap-4 mt-6">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                Salvar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ListaMateriais;