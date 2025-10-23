import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Search, FolderOpen, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import laboratorioService, { GrupoExame } from '@/services/laboratorio/laboratorioService';

const ListaGrupos: React.FC = () => {
  const [grupos, setGrupos] = useState<GrupoExame[]>([]);
  const [loading, setLoading] = useState(true); // Iniciar como true
  const [searchTermo, setSearchTermo] = useState('');
  const [modalAberto, setModalAberto] = useState(false);
  const [grupoEdicao, setGrupoEdicao] = useState<GrupoExame | null>(null);
  const [formData, setFormData] = useState<Partial<GrupoExame>>({
    codigo: '',
    nome: '',
    descricao: '',
    ordem: 0,
    ativo: true,
  });

  useEffect(() => {
    carregarGrupos();
  }, []);

  const carregarGrupos = async () => {
    setLoading(true);
    try {
      const response = await laboratorioService.listarGrupos();
      console.log('Response completo:', response);
      console.log('response.data:', response.data);

      // A resposta do backend vem como ApiResponse<List<GrupoExameDTO>>
      // que tem a estrutura: { success: true, data: [...], message: null }
      let data = [];

      if (response.data) {
        // Se response.data tem a propriedade 'data', é um ApiResponse
        if (response.data.data !== undefined) {
          data = response.data.data;
        } else {
          // Caso contrário, response.data já é o array
          data = response.data;
        }
      }

      console.log('Data processado:', data);
      setGrupos(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Erro ao carregar grupos:', error);
      toast.error('Erro ao carregar grupos');
      setGrupos([]);
    } finally {
      setLoading(false);
    }
  };

  const abrirModal = (grupo?: GrupoExame) => {
    if (grupo) {
      setGrupoEdicao(grupo);
      setFormData(grupo);
    } else {
      setGrupoEdicao(null);
      setFormData({
        codigo: '',
        nome: '',
        descricao: '',
        ordem: 0,
        ativo: true,
      });
    }
    setModalAberto(true);
  };

  const fecharModal = () => {
    setModalAberto(false);
    setGrupoEdicao(null);
    setFormData({
      codigo: '',
      nome: '',
      descricao: '',
      ordem: 0,
      ativo: true,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.nome?.trim()) {
      toast.error('Nome do grupo é obrigatório');
      return;
    }

    try {
      if (grupoEdicao) {
        await laboratorioService.atualizarGrupo(grupoEdicao.id!, formData as GrupoExame);
        toast.success('Grupo atualizado com sucesso!');
      } else {
        await laboratorioService.criarGrupo(formData as GrupoExame);
        toast.success('Grupo criado com sucesso!');
      }
      fecharModal();
      carregarGrupos();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erro ao salvar grupo');
    }
  };

  const handleDeletar = async (id: number) => {
    if (!confirm('Tem certeza que deseja inativar este grupo?')) return;

    try {
      await laboratorioService.deletarGrupo(id);
      toast.success('Grupo inativado com sucesso!');
      carregarGrupos();
    } catch (error) {
      toast.error('Erro ao inativar grupo');
    }
  };

  const gruposFiltrados = Array.isArray(grupos)
    ? grupos.filter((grupo) =>
        grupo.nome?.toLowerCase().includes(searchTermo.toLowerCase()) ||
        grupo.codigo?.toLowerCase().includes(searchTermo.toLowerCase())
      )
    : [];

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
          <FolderOpen />
          Grupos de Exames
        </h1>
        <Button onClick={() => abrirModal()}>
          <Plus className="w-4 h-4 mr-2" />
          Novo Grupo
        </Button>
      </div>

      {/* Busca */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar grupos por nome ou código..."
              value={searchTermo}
              onChange={(e) => setSearchTermo(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Lista de Grupos */}
      <Card>
        <CardHeader>
          <CardTitle>Grupos Cadastrados ({gruposFiltrados.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center p-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
            </div>
          ) : gruposFiltrados.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-gray-500">
              <AlertCircle className="w-16 h-16 mb-4 text-gray-300" />
              <p className="text-lg font-medium">Nenhum grupo encontrado</p>
              <p className="text-sm">Clique em "Novo Grupo" para criar o primeiro</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {gruposFiltrados.map((grupo) => (
                <Card key={grupo.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-lg font-semibold">{grupo.nome}</h3>
                          {grupo.ativo ? (
                            <Badge variant="default">Ativo</Badge>
                          ) : (
                            <Badge variant="secondary">Inativo</Badge>
                          )}
                        </div>
                        {grupo.codigo && (
                          <p className="text-sm text-gray-600 mb-2">
                            <span className="font-medium">Código:</span> {grupo.codigo}
                          </p>
                        )}
                        {grupo.descricao && (
                          <p className="text-sm text-gray-600 mb-2">{grupo.descricao}</p>
                        )}
                        {grupo.ordem !== undefined && (
                          <p className="text-sm text-gray-500">
                            <span className="font-medium">Ordem:</span> {grupo.ordem}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => abrirModal(grupo)}
                        className="flex-1"
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        Editar
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeletar(grupo.id!)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal de Criar/Editar */}
      <Dialog open={modalAberto} onOpenChange={fecharModal}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              {grupoEdicao ? 'Editar Grupo' : 'Novo Grupo'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Código</label>
                  <Input
                    value={formData.codigo || ''}
                    onChange={(e) => setFormData({ ...formData, codigo: e.target.value })}
                    placeholder="Ex: GRP001"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Ordem</label>
                  <Input
                    type="number"
                    value={formData.ordem || 0}
                    onChange={(e) =>
                      setFormData({ ...formData, ordem: parseInt(e.target.value) || 0 })
                    }
                    placeholder="0"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Nome <span className="text-red-500">*</span>
                </label>
                <Input
                  value={formData.nome || ''}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  placeholder="Ex: Hematologia"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Descrição</label>
                <textarea
                  className="w-full px-3 py-2 border rounded-lg"
                  rows={3}
                  value={formData.descricao || ''}
                  onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                  placeholder="Descreva o grupo de exames..."
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="ativo"
                  checked={formData.ativo || false}
                  onChange={(e) => setFormData({ ...formData, ativo: e.target.checked })}
                  className="w-4 h-4"
                />
                <label htmlFor="ativo" className="text-sm font-medium">
                  Grupo ativo
                </label>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={fecharModal}>
                Cancelar
              </Button>
              <Button type="submit">
                {grupoEdicao ? 'Atualizar' : 'Criar'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ListaGrupos;
