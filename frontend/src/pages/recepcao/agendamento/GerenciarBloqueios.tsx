import React, { useState, useEffect } from 'react';
import { Ban, Plus, Edit, Trash2, Calendar, Search } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import bloqueioHorarioService, { BloqueioHorarioDTO, TIPOS_BLOQUEIO } from '@/services/agendamento/bloqueioHorarioService';

const GerenciarBloqueios: React.FC = () => {
  const [bloqueios, setBloqueios] = useState<BloqueioHorarioDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [dialogAberto, setDialogAberto] = useState(false);
  const [bloqueioEditando, setBloqueioEditando] = useState<BloqueioHorarioDTO | null>(null);
  const [filtro, setFiltro] = useState('');

  // Form state
  const [formData, setFormData] = useState<Partial<BloqueioHorarioDTO>>({
    unidadeId: 1, // TODO: pegar da unidade atual
    tipoBloqueio: 'FERIADO',
    dataInicio: format(new Date(), 'yyyy-MM-dd'),
    diaInteiro: true,
    ativo: true,
    motivo: ''
  });

  useEffect(() => {
    carregarBloqueios();
  }, []);

  const carregarBloqueios = async () => {
    setLoading(true);
    try {
      const response = await bloqueioHorarioService.listarPorUnidade(1); // TODO: unidade atual
      setBloqueios(response.data);
    } catch (error) {
      toast.error('Erro ao carregar bloqueios');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const abrirDialog = (bloqueio?: BloqueioHorarioDTO) => {
    if (bloqueio) {
      setBloqueioEditando(bloqueio);
      setFormData(bloqueio);
    } else {
      setBloqueioEditando(null);
      setFormData({
        unidadeId: 1,
        tipoBloqueio: 'FERIADO',
        dataInicio: format(new Date(), 'yyyy-MM-dd'),
        diaInteiro: true,
        ativo: true,
        motivo: ''
      });
    }
    setDialogAberto(true);
  };

  const fecharDialog = () => {
    setDialogAberto(false);
    setBloqueioEditando(null);
  };

  const handleSalvar = async () => {
    try {
      if (!formData.dataInicio || !formData.motivo) {
        toast.error('Preencha todos os campos obrigatórios');
        return;
      }

      if (bloqueioEditando?.id) {
        await bloqueioHorarioService.atualizar(bloqueioEditando.id, formData as BloqueioHorarioDTO);
        toast.success('Bloqueio atualizado com sucesso!');
      } else {
        await bloqueioHorarioService.criar(formData as BloqueioHorarioDTO);
        toast.success('Bloqueio criado com sucesso!');
      }

      fecharDialog();
      carregarBloqueios();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erro ao salvar bloqueio');
      console.error(error);
    }
  };

  const handleDeletar = async (id: number) => {
    if (!confirm('Deseja realmente excluir este bloqueio?')) return;

    try {
      await bloqueioHorarioService.deletar(id);
      toast.success('Bloqueio excluído com sucesso!');
      carregarBloqueios();
    } catch (error) {
      toast.error('Erro ao excluir bloqueio');
      console.error(error);
    }
  };

  const bloqueiosFiltrados = bloqueios.filter(b =>
    b.tipoBloqueioTexto?.toLowerCase().includes(filtro.toLowerCase()) ||
    b.motivo?.toLowerCase().includes(filtro.toLowerCase()) ||
    b.profissionalNome?.toLowerCase().includes(filtro.toLowerCase())
  );

  const getCorTipo = (tipo: BloqueioHorarioDTO['tipoBloqueio']) => {
    switch (tipo) {
      case 'FERIAS': return 'bg-blue-500';
      case 'FERIADO': return 'bg-purple-500';
      case 'MANUTENCAO': return 'bg-orange-500';
      case 'EVENTO': return 'bg-green-500';
      case 'LICENCA': return 'bg-yellow-500';
      case 'AUSENCIA': return 'bg-gray-500';
      default: return 'bg-gray-400';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Ban className="w-5 h-5" />
                Gerenciar Bloqueios de Horários
              </CardTitle>
              <CardDescription>
                Configure bloqueios de horários para férias, feriados e eventos
              </CardDescription>
            </div>
            <Button onClick={() => abrirDialog()}>
              <Plus className="w-4 h-4 mr-2" />
              Novo Bloqueio
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Busca */}
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar por tipo, motivo ou profissional..."
              value={filtro}
              onChange={(e) => setFiltro(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Tabela */}
          {loading ? (
            <div className="flex items-center justify-center p-8">
              <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Período</TableHead>
                    <TableHead>Horário</TableHead>
                    <TableHead>Motivo</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bloqueiosFiltrados.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center p-8 text-gray-500">
                        Nenhum bloqueio cadastrado
                      </TableCell>
                    </TableRow>
                  ) : (
                    bloqueiosFiltrados.map((bloqueio) => (
                      <TableRow key={bloqueio.id}>
                        <TableCell>
                          <Badge className={getCorTipo(bloqueio.tipoBloqueio)}>
                            {bloqueio.tipoBloqueioTexto}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-gray-500" />
                            <span>
                              {format(new Date(bloqueio.dataInicio), 'dd/MM/yyyy', { locale: ptBR })}
                              {bloqueio.dataFim && (
                                <> até {format(new Date(bloqueio.dataFim), 'dd/MM/yyyy', { locale: ptBR })}</>
                              )}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {bloqueio.diaInteiro ? (
                            <Badge variant="outline">Dia Inteiro</Badge>
                          ) : bloqueio.horaInicio && bloqueio.horaFim ? (
                            <span>{bloqueio.horaInicio} - {bloqueio.horaFim}</span>
                          ) : (
                            '-'
                          )}
                        </TableCell>
                        <TableCell className="max-w-xs truncate">
                          {bloqueio.motivo}
                        </TableCell>
                        <TableCell>
                          {bloqueio.ativo ? (
                            <Badge variant="default" className="bg-green-500">Ativo</Badge>
                          ) : (
                            <Badge variant="destructive">Inativo</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => abrirDialog(bloqueio)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => bloqueio.id && handleDeletar(bloqueio.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog de Criar/Editar */}
      <Dialog open={dialogAberto} onOpenChange={setDialogAberto}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {bloqueioEditando ? 'Editar Bloqueio' : 'Novo Bloqueio'}
            </DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="tipoBloqueio">Tipo de Bloqueio *</Label>
              <Select
                value={formData.tipoBloqueio}
                onValueChange={(value: any) => setFormData({ ...formData, tipoBloqueio: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TIPOS_BLOQUEIO.map(tipo => (
                    <SelectItem key={tipo.value} value={tipo.value}>
                      {tipo.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="dataInicio">Data Início *</Label>
                <Input
                  id="dataInicio"
                  type="date"
                  value={formData.dataInicio}
                  onChange={(e) => setFormData({ ...formData, dataInicio: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="dataFim">Data Fim</Label>
                <Input
                  id="dataFim"
                  type="date"
                  value={formData.dataFim || ''}
                  onChange={(e) => setFormData({ ...formData, dataFim: e.target.value || undefined })}
                />
                <p className="text-xs text-gray-500">Deixe vazio para bloqueio de um dia</p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="diaInteiro"
                checked={formData.diaInteiro}
                onCheckedChange={(checked) => setFormData({ ...formData, diaInteiro: checked })}
              />
              <Label htmlFor="diaInteiro">Bloquear dia inteiro</Label>
            </div>

            {!formData.diaInteiro && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="horaInicio">Hora Início</Label>
                  <Input
                    id="horaInicio"
                    type="time"
                    value={formData.horaInicio || ''}
                    onChange={(e) => setFormData({ ...formData, horaInicio: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="horaFim">Hora Fim</Label>
                  <Input
                    id="horaFim"
                    type="time"
                    value={formData.horaFim || ''}
                    onChange={(e) => setFormData({ ...formData, horaFim: e.target.value })}
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="motivo">Motivo *</Label>
              <Textarea
                id="motivo"
                placeholder="Descreva o motivo do bloqueio..."
                value={formData.motivo || ''}
                onChange={(e) => setFormData({ ...formData, motivo: e.target.value })}
                required
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="ativo"
                checked={formData.ativo}
                onCheckedChange={(checked) => setFormData({ ...formData, ativo: checked })}
              />
              <Label htmlFor="ativo">Ativo</Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={fecharDialog}>
              Cancelar
            </Button>
            <Button onClick={handleSalvar}>
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default GerenciarBloqueios;
