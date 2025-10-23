import React, { useState, useEffect } from 'react';
import { Syringe, Plus, Edit, Trash2, Search, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { toast } from 'sonner';
import imunizacaoService, { Vacina } from '@/services/imunizacao/imunizacaoService';

const ListaVacinas: React.FC = () => {
  const [vacinas, setVacinas] = useState<Vacina[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTermo, setSearchTermo] = useState('');
  const [modalAberto, setModalAberto] = useState(false);
  const [vacinaEdicao, setVacinaEdicao] = useState<Vacina | null>(null);

  const [formData, setFormData] = useState<Partial<Vacina>>({
    codigo: '',
    nome: '',
    descricao: '',
    tipoVacina: 'ROTINA',
    ativa: true,
    exportarSipni: false,
    exportarRnds: false,
    calendarioVacinal: true,
  });

  useEffect(() => {
    carregarVacinas();
  }, []);

  const carregarVacinas = async () => {
    setLoading(true);
    try {
      const response = await imunizacaoService.listarVacinas();

      let data: any = [];
      if (response.data) {
        data = response.data.data !== undefined ? response.data.data : response.data;
      }

      setVacinas(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Erro ao carregar vacinas:', error);
      toast.error('Erro ao carregar vacinas');
      setVacinas([]);
    } finally {
      setLoading(false);
    }
  };

  const abrirModal = (vacina?: Vacina) => {
    if (vacina) {
      setVacinaEdicao(vacina);
      setFormData(vacina);
    } else {
      setVacinaEdicao(null);
      setFormData({
        codigo: '',
        nome: '',
        descricao: '',
        tipoVacina: 'ROTINA',
        ativa: true,
        exportarSipni: false,
        exportarRnds: false,
        calendarioVacinal: true,
      });
    }
    setModalAberto(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.nome?.trim() || !formData.codigo?.trim()) {
      toast.error('Nome e código são obrigatórios');
      return;
    }

    try {
      if (vacinaEdicao) {
        await imunizacaoService.atualizarVacina(vacinaEdicao.id!, formData as Vacina);
        toast.success('Vacina atualizada com sucesso!');
      } else {
        await imunizacaoService.criarVacina(formData as Vacina);
        toast.success('Vacina cadastrada com sucesso!');
      }
      setModalAberto(false);
      carregarVacinas();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erro ao salvar vacina');
    }
  };

  const handleDeletar = async (id: number) => {
    if (!confirm('Tem certeza que deseja inativar esta vacina?')) return;

    try {
      await imunizacaoService.deletarVacina(id);
      toast.success('Vacina inativada com sucesso!');
      carregarVacinas();
    } catch (error) {
      toast.error('Erro ao inativar vacina');
    }
  };

  const vacinasFiltradas = Array.isArray(vacinas)
    ? vacinas.filter(
        (vacina) =>
          vacina.nome?.toLowerCase().includes(searchTermo.toLowerCase()) ||
          vacina.codigo?.toLowerCase().includes(searchTermo.toLowerCase())
      )
    : [];

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
          <Syringe />
          Cadastro de Vacinas
        </h1>
        <Button onClick={() => abrirModal()}>
          <Plus className="w-4 h-4 mr-2" />
          Nova Vacina
        </Button>
      </div>

      {/* Busca */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar vacinas por nome ou código..."
              value={searchTermo}
              onChange={(e) => setSearchTermo(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Lista de Vacinas */}
      <Card>
        <CardHeader>
          <CardTitle>Vacinas Cadastradas ({vacinasFiltradas.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center p-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
            </div>
          ) : vacinasFiltradas.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-gray-500">
              <AlertCircle className="w-16 h-16 mb-4 text-gray-300" />
              <p className="text-lg font-medium">Nenhuma vacina encontrada</p>
              <p className="text-sm">Clique em "Nova Vacina" para cadastrar</p>
            </div>
          ) : (
            <div className="space-y-4">
              {vacinasFiltradas.map((vacina) => (
                <Card key={vacina.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-lg font-semibold">{vacina.nome}</h3>
                          {vacina.ativa ? (
                            <Badge variant="default">Ativa</Badge>
                          ) : (
                            <Badge variant="secondary">Inativa</Badge>
                          )}
                          {vacina.calendarioVacinal && (
                            <Badge variant="outline">Calendário Vacinal</Badge>
                          )}
                        </div>

                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-gray-600">
                              <span className="font-medium">Código:</span> {vacina.codigo}
                            </p>
                            <p className="text-gray-600">
                              <span className="font-medium">Tipo:</span> {vacina.tipoVacina}
                            </p>
                          </div>
                          <div>
                            {vacina.codigoLediEsus && (
                              <p className="text-gray-600">
                                <span className="font-medium">Código LEDI e-SUS:</span>{' '}
                                {vacina.codigoLediEsus}
                              </p>
                            )}
                            {vacina.codigoPni && (
                              <p className="text-gray-600">
                                <span className="font-medium">Código PNI:</span> {vacina.codigoPni}
                              </p>
                            )}
                          </div>
                        </div>

                        {vacina.descricao && (
                          <p className="text-sm text-gray-600 mt-2">{vacina.descricao}</p>
                        )}

                        <div className="flex gap-2 mt-3">
                          {vacina.exportarSipni && <Badge>Exporta SI-PNI</Badge>}
                          {vacina.exportarRnds && <Badge>Exporta RNDS</Badge>}
                        </div>
                      </div>

                      <div className="flex gap-2 ml-4">
                        <Button variant="outline" size="sm" onClick={() => abrirModal(vacina)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeletar(vacina.id!)}
                        >
                          <Trash2 className="w-4 h-4" />
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

      {/* Modal de Criar/Editar */}
      <Dialog open={modalAberto} onOpenChange={setModalAberto}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{vacinaEdicao ? 'Editar Vacina' : 'Nova Vacina'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Código <span className="text-red-500">*</span>
                  </label>
                  <Input
                    value={formData.codigo}
                    onChange={(e) => setFormData({ ...formData, codigo: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Tipo</label>
                  <select
                    className="w-full px-3 py-2 border rounded-lg"
                    value={formData.tipoVacina}
                    onChange={(e) =>
                      setFormData({ ...formData, tipoVacina: e.target.value as any })
                    }
                  >
                    <option value="ROTINA">Rotina</option>
                    <option value="CAMPANHA">Campanha</option>
                    <option value="COVID19">COVID-19</option>
                    <option value="ESPECIAL">Especial</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Nome <span className="text-red-500">*</span>
                </label>
                <Input
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
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
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Código LEDI e-SUS</label>
                  <Input
                    value={formData.codigoLediEsus || ''}
                    onChange={(e) => setFormData({ ...formData, codigoLediEsus: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Código PNI</label>
                  <Input
                    value={formData.codigoPni || ''}
                    onChange={(e) => setFormData({ ...formData, codigoPni: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="ativa"
                    checked={formData.ativa}
                    onChange={(e) => setFormData({ ...formData, ativa: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <label htmlFor="ativa" className="text-sm font-medium">
                    Vacina ativa
                  </label>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="calendarioVacinal"
                    checked={formData.calendarioVacinal}
                    onChange={(e) =>
                      setFormData({ ...formData, calendarioVacinal: e.target.checked })
                    }
                    className="w-4 h-4"
                  />
                  <label htmlFor="calendarioVacinal" className="text-sm font-medium">
                    Faz parte do calendário vacinal
                  </label>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="exportarSipni"
                    checked={formData.exportarSipni}
                    onChange={(e) => setFormData({ ...formData, exportarSipni: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <label htmlFor="exportarSipni" className="text-sm font-medium">
                    Exportar para SI-PNI
                  </label>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="exportarRnds"
                    checked={formData.exportarRnds}
                    onChange={(e) => setFormData({ ...formData, exportarRnds: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <label htmlFor="exportarRnds" className="text-sm font-medium">
                    Exportar para RNDS
                  </label>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setModalAberto(false)}>
                Cancelar
              </Button>
              <Button type="submit">{vacinaEdicao ? 'Atualizar' : 'Cadastrar'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ListaVacinas;
