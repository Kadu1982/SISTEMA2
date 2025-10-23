import React, { useState, useEffect } from 'react';
import { Clock, Plus, Edit, Trash2, CheckCircle, XCircle, Search } from 'lucide-react';
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
import horarioExameService, { HorarioExameDTO } from '@/services/agendamento/horarioExameService';

const DIAS_SEMANA = [
  { value: 'MONDAY', label: 'Segunda-feira' },
  { value: 'TUESDAY', label: 'Terça-feira' },
  { value: 'WEDNESDAY', label: 'Quarta-feira' },
  { value: 'THURSDAY', label: 'Quinta-feira' },
  { value: 'FRIDAY', label: 'Sexta-feira' },
  { value: 'SATURDAY', label: 'Sábado' },
  { value: 'SUNDAY', label: 'Domingo' }
];

const TIPOS_AGENDAMENTO = [
  { value: 'INTERNO', label: 'Interno' },
  { value: 'EXTERNO', label: 'Externo' },
  { value: 'AMBOS', label: 'Ambos' }
];

const GerenciarHorarios: React.FC = () => {
  const [horarios, setHorarios] = useState<HorarioExameDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [dialogAberto, setDialogAberto] = useState(false);
  const [horarioEditando, setHorarioEditando] = useState<HorarioExameDTO | null>(null);
  const [filtro, setFiltro] = useState('');

  // Form state
  const [formData, setFormData] = useState<Partial<HorarioExameDTO>>({
    unidadeId: 1, // TODO: pegar da unidade atual
    tipoAgendamento: 'AMBOS',
    diaSemana: 'MONDAY',
    horaInicio: '08:00',
    horaFim: '18:00',
    intervaloMinutos: 30,
    vagasPorHorario: 1,
    permiteEncaixe: false,
    ativo: true
  });

  useEffect(() => {
    carregarHorarios();
  }, []);

  const carregarHorarios = async () => {
    setLoading(true);
    try {
      const response = await horarioExameService.listarPorUnidade(1); // TODO: unidade atual
      setHorarios(response.data);
    } catch (error) {
      toast.error('Erro ao carregar horários');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const abrirDialog = (horario?: HorarioExameDTO) => {
    if (horario) {
      setHorarioEditando(horario);
      setFormData(horario);
    } else {
      setHorarioEditando(null);
      setFormData({
        unidadeId: 1,
        tipoAgendamento: 'AMBOS',
        diaSemana: 'MONDAY',
        horaInicio: '08:00',
        horaFim: '18:00',
        intervaloMinutos: 30,
        vagasPorHorario: 1,
        permiteEncaixe: false,
        ativo: true
      });
    }
    setDialogAberto(true);
  };

  const fecharDialog = () => {
    setDialogAberto(false);
    setHorarioEditando(null);
  };

  const handleSalvar = async () => {
    try {
      if (!formData.diaSemana || !formData.horaInicio || !formData.horaFim) {
        toast.error('Preencha todos os campos obrigatórios');
        return;
      }

      if (horarioEditando?.id) {
        await horarioExameService.atualizar(horarioEditando.id, formData as HorarioExameDTO);
        toast.success('Horário atualizado com sucesso!');
      } else {
        await horarioExameService.criar(formData as HorarioExameDTO);
        toast.success('Horário criado com sucesso!');
      }

      fecharDialog();
      carregarHorarios();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erro ao salvar horário');
      console.error(error);
    }
  };

  const handleDeletar = async (id: number) => {
    if (!confirm('Deseja realmente excluir este horário?')) return;

    try {
      await horarioExameService.deletar(id);
      toast.success('Horário excluído com sucesso!');
      carregarHorarios();
    } catch (error) {
      toast.error('Erro ao excluir horário');
      console.error(error);
    }
  };

  const handleAtivar = async (id: number) => {
    try {
      await horarioExameService.ativar(id);
      toast.success('Horário ativado com sucesso!');
      carregarHorarios();
    } catch (error) {
      toast.error('Erro ao ativar horário');
      console.error(error);
    }
  };

  const horariosFiltrados = horarios.filter(h =>
    h.diaSemanaTexto?.toLowerCase().includes(filtro.toLowerCase()) ||
    h.profissionalNome?.toLowerCase().includes(filtro.toLowerCase()) ||
    h.exameNome?.toLowerCase().includes(filtro.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Gerenciar Horários de Exames
              </CardTitle>
              <CardDescription>
                Configure os horários disponíveis para agendamento de exames
              </CardDescription>
            </div>
            <Button onClick={() => abrirDialog()}>
              <Plus className="w-4 h-4 mr-2" />
              Novo Horário
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Busca */}
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar por dia, profissional ou exame..."
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
                    <TableHead>Dia da Semana</TableHead>
                    <TableHead>Horário</TableHead>
                    <TableHead>Intervalo</TableHead>
                    <TableHead>Vagas</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {horariosFiltrados.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center p-8 text-gray-500">
                        Nenhum horário cadastrado
                      </TableCell>
                    </TableRow>
                  ) : (
                    horariosFiltrados.map((horario) => (
                      <TableRow key={horario.id}>
                        <TableCell className="font-medium">
                          {horario.diaSemanaTexto}
                        </TableCell>
                        <TableCell>
                          {horario.horaInicio} - {horario.horaFim}
                        </TableCell>
                        <TableCell>{horario.intervaloMinutos} min</TableCell>
                        <TableCell>
                          {horario.vagasPorHorario} vaga{horario.vagasPorHorario !== 1 ? 's' : ''}
                          {horario.permiteEncaixe && (
                            <Badge variant="outline" className="ml-2">+ Encaixe</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">{horario.tipoAgendamento}</Badge>
                        </TableCell>
                        <TableCell>
                          {horario.ativo ? (
                            <Badge variant="default" className="bg-green-500">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Ativo
                            </Badge>
                          ) : (
                            <Badge variant="destructive">
                              <XCircle className="w-3 h-3 mr-1" />
                              Inativo
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => abrirDialog(horario)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            {!horario.ativo && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => horario.id && handleAtivar(horario.id)}
                              >
                                <CheckCircle className="w-4 h-4" />
                              </Button>
                            )}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => horario.id && handleDeletar(horario.id)}
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
              {horarioEditando ? 'Editar Horário' : 'Novo Horário'}
            </DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="diaSemana">Dia da Semana *</Label>
                <Select
                  value={formData.diaSemana}
                  onValueChange={(value: any) => setFormData({ ...formData, diaSemana: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DIAS_SEMANA.map(dia => (
                      <SelectItem key={dia.value} value={dia.value}>
                        {dia.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="tipoAgendamento">Tipo de Agendamento</Label>
                <Select
                  value={formData.tipoAgendamento}
                  onValueChange={(value: any) => setFormData({ ...formData, tipoAgendamento: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TIPOS_AGENDAMENTO.map(tipo => (
                      <SelectItem key={tipo.value} value={tipo.value}>
                        {tipo.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="horaInicio">Hora Início *</Label>
                <Input
                  id="horaInicio"
                  type="time"
                  value={formData.horaInicio}
                  onChange={(e) => setFormData({ ...formData, horaInicio: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="horaFim">Hora Fim *</Label>
                <Input
                  id="horaFim"
                  type="time"
                  value={formData.horaFim}
                  onChange={(e) => setFormData({ ...formData, horaFim: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="intervaloMinutos">Intervalo (minutos) *</Label>
                <Input
                  id="intervaloMinutos"
                  type="number"
                  min="5"
                  step="5"
                  value={formData.intervaloMinutos}
                  onChange={(e) => setFormData({ ...formData, intervaloMinutos: parseInt(e.target.value) })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="vagasPorHorario">Vagas por Horário *</Label>
                <Input
                  id="vagasPorHorario"
                  type="number"
                  min="1"
                  value={formData.vagasPorHorario}
                  onChange={(e) => setFormData({ ...formData, vagasPorHorario: parseInt(e.target.value) })}
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="permiteEncaixe"
                checked={formData.permiteEncaixe}
                onCheckedChange={(checked) => setFormData({ ...formData, permiteEncaixe: checked })}
              />
              <Label htmlFor="permiteEncaixe">Permite Encaixe (agendamentos extras)</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="ativo"
                checked={formData.ativo}
                onCheckedChange={(checked) => setFormData({ ...formData, ativo: checked })}
              />
              <Label htmlFor="ativo">Ativo</Label>
            </div>

            <div className="space-y-2">
              <Label htmlFor="observacoes">Observações</Label>
              <Textarea
                id="observacoes"
                placeholder="Observações sobre este horário..."
                value={formData.observacoes || ''}
                onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
              />
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

export default GerenciarHorarios;
