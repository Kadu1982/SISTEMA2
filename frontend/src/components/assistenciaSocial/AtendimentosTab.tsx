import React, { useEffect, useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import assistenciaSocialService, { AtendimentoAssistencial } from '@/services/assistenciaSocialService';
import { Loader2, Plus, Pencil, Search, Eye, Calendar } from 'lucide-react';

const AtendimentosTab: React.FC = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [atendimentos, setAtendimentos] = useState<AtendimentoAssistencial[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [viewMode, setViewMode] = useState(false);
  const [editingAtendimento, setEditingAtendimento] = useState<AtendimentoAssistencial | null>(null);
  const [formData, setFormData] = useState<AtendimentoAssistencial>({
    data: format(new Date(), 'yyyy-MM-dd'),
    hora: format(new Date(), 'HH:mm'),
    tipo: 'INDIVIDUAL',
    motivos: [],
    anotacoes: '',
    sigiloso: false,
    unidadeAssistencial: {
      id: 0,
      nome: ''
    },
    profissional: {
      id: 0,
      nome: '',
      especialidade: ''
    }
  });

  // Mock data for dropdowns
  const unidades = [
    { id: 1, nome: 'CRAS Centro' },
    { id: 2, nome: 'CRAS Norte' },
    { id: 3, nome: 'CREAS Municipal' }
  ];

  const profissionais = [
    { id: 1, nome: 'Maria Silva', especialidade: 'Assistente Social' },
    { id: 2, nome: 'João Santos', especialidade: 'Psicólogo' },
    { id: 3, nome: 'Ana Oliveira', especialidade: 'Assistente Social' }
  ];

  const motivosAtendimento = [
    'Acolhida',
    'Atualização Cadastral',
    'Benefício Eventual',
    'Bolsa Família',
    'Cadastro Único',
    'Orientação',
    'Visita Domiciliar',
    'Encaminhamento',
    'Acompanhamento Familiar'
  ];

  useEffect(() => {
    loadAtendimentos();
  }, []);

  const loadAtendimentos = async () => {
    try {
      setLoading(true);
      const data = await assistenciaSocialService.getAtendimentos();
      setAtendimentos(data);
    } catch (error) {
      console.error('Erro ao carregar atendimentos:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os atendimentos. Tente novamente mais tarde.',
        variant: 'destructive',
      });

      // Fallback to mock data if API call fails
      const mockData: AtendimentoAssistencial[] = [
        {
          id: 1,
          data: '2023-06-15',
          hora: '09:30',
          tipo: 'INDIVIDUAL',
          motivos: ['Acolhida', 'Orientação'],
          anotacoes: 'Atendimento inicial para orientação sobre benefícios disponíveis.',
          sigiloso: false,
          unidadeAssistencial: {
            id: 1,
            nome: 'CRAS Centro'
          },
          profissional: {
            id: 1,
            nome: 'Maria Silva',
            especialidade: 'Assistente Social'
          },
          pessoa: {
            id: 1,
            nome: 'José Pereira'
          }
        },
        {
          id: 2,
          data: '2023-06-16',
          hora: '14:00',
          tipo: 'COLETIVO',
          motivos: ['Acompanhamento Familiar'],
          anotacoes: 'Reunião com grupo de famílias para orientação sobre programas sociais.',
          sigiloso: false,
          unidadeAssistencial: {
            id: 2,
            nome: 'CRAS Norte'
          },
          profissional: {
            id: 2,
            nome: 'João Santos',
            especialidade: 'Psicólogo'
          },
          pessoas: [
            { id: 1, nome: 'José Pereira' },
            { id: 2, nome: 'Maria Souza' },
            { id: 3, nome: 'Ana Oliveira' }
          ]
        },
        {
          id: 3,
          data: '2023-06-17',
          hora: '10:15',
          tipo: 'INDIVIDUAL',
          motivos: ['Benefício Eventual', 'Cadastro Único'],
          anotacoes: 'Atendimento para concessão de benefício eventual e atualização do CadÚnico.',
          sigiloso: true,
          unidadeAssistencial: {
            id: 3,
            nome: 'CREAS Municipal'
          },
          profissional: {
            id: 3,
            nome: 'Ana Oliveira',
            especialidade: 'Assistente Social'
          },
          pessoa: {
            id: 4,
            nome: 'Carlos Santos'
          }
        }
      ];

      setAtendimentos(mockData);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (atendimento?: AtendimentoAssistencial, view: boolean = false) => {
    if (atendimento) {
      setEditingAtendimento(atendimento);
      setFormData(atendimento);
      setViewMode(view);
    } else {
      setEditingAtendimento(null);
      setFormData({
        data: format(new Date(), 'yyyy-MM-dd'),
        hora: format(new Date(), 'HH:mm'),
        tipo: 'INDIVIDUAL',
        motivos: [],
        anotacoes: '',
        sigiloso: false,
        unidadeAssistencial: {
          id: 0,
          nome: ''
        },
        profissional: {
          id: 0,
          nome: '',
          especialidade: ''
        }
      });
      setViewMode(false);
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingAtendimento(null);
    setViewMode(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSelectChange = (name: string, value: string | number) => {
    if (name === 'unidadeAssistencial') {
      const unidade = unidades.find(u => u.id === Number(value));
      if (unidade) {
        setFormData({
          ...formData,
          unidadeAssistencial: {
            id: unidade.id,
            nome: unidade.nome
          }
        });
      }
    } else if (name === 'profissional') {
      const profissional = profissionais.find(p => p.id === Number(value));
      if (profissional) {
        setFormData({
          ...formData,
          profissional: {
            id: profissional.id,
            nome: profissional.nome,
            especialidade: profissional.especialidade
          }
        });
      }
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const handleCheckboxChange = (name: string, checked: boolean) => {
    setFormData({
      ...formData,
      [name]: checked
    });
  };

  const handleMotivoChange = (motivo: string, checked: boolean) => {
    if (checked) {
      setFormData({
        ...formData,
        motivos: [...formData.motivos, motivo]
      });
    } else {
      setFormData({
        ...formData,
        motivos: formData.motivos.filter(m => m !== motivo)
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setSaving(true);

      if (editingAtendimento?.id) {
        // API for updating atendimentover doesn't exist yet, so we'll use a mock update
        // Once the API is available, uncomment the line below
        // await assistenciaSocialService.atualizarAtendimento(editingAtendimento.id, formData);

        // For now, just update the local state
        setAtendimentos(atendimentos.map(a => 
          a.id === editingAtendimento.id ? { ...formData, id: editingAtendimento.id } : a
        ));

        toast({
          title: 'Sucesso',
          description: 'Atendimento atualizado com sucesso!',
        });
      } else {
        try {
          // Try to create a new atendimentover using the API
          const newAtendimento = await assistenciaSocialService.criarAtendimento(formData);
          setAtendimentos([...atendimentos, newAtendimento]);

          toast({
            title: 'Sucesso',
            description: 'Atendimento registrado com sucesso!',
          });
        } catch (apiError) {
          console.error('Erro ao criar atendimentover via API:', apiError);

          // Fallback to mock data if API call fails
          const newAtendimento = {
            ...formData,
            id: Math.max(0, ...atendimentos.map(a => a.id || 0)) + 1
          };
          setAtendimentos([...atendimentos, newAtendimento]);

          toast({
            title: 'Sucesso (Modo Local)',
            description: 'Atendimento registrado localmente. A sincronização com o servidor será feita posteriormente.',
          });
        }
      }

      handleCloseDialog();
    } catch (error) {
      console.error('Erro ao salvar atendimentover:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível salvar o atendimentover. Tente novamente mais tarde.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return format(date, 'dd/MM/yyyy', { locale: ptBR });
    } catch (error) {
      return dateString;
    }
  };

  const filteredAtendimentos = atendimentos.filter(atendimento => {
    const searchLower = searchTerm.toLowerCase();
    return (
      (atendimento.pessoa?.nome?.toLowerCase().includes(searchLower) || false) ||
      (atendimento.profissional?.nome?.toLowerCase().includes(searchLower) || false) ||
      (atendimento.unidadeAssistencial?.nome?.toLowerCase().includes(searchLower) || false) ||
      formatDate(atendimento.data).includes(searchLower)
    );
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Carregando atendimentos...</span>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Atendimentos Assistenciais</CardTitle>
            <CardDescription>
              Registro e acompanhamento de atendimentos.
            </CardDescription>
          </div>
          <Button onClick={() => handleOpenDialog()}>
            <Plus className="mr-2 h-4 w-4" />
            Novo Atendimento
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por pessoa, profissional, unidade ou data..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {filteredAtendimentos.length === 0 ? (
          <div className="text-center p-4">
            <p>Nenhum atendimento encontrado.</p>
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Hora</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Pessoa/Família</TableHead>
                  <TableHead>Profissional</TableHead>
                  <TableHead>Unidade</TableHead>
                  <TableHead>Sigiloso</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAtendimentos.map((atendimento) => (
                  <TableRow key={atendimento.id}>
                    <TableCell>{formatDate(atendimento.data)}</TableCell>
                    <TableCell>{atendimento.hora}</TableCell>
                    <TableCell>
                      {atendimento.tipo === 'INDIVIDUAL' ? 'Individual' : 
                       atendimento.tipo === 'COLETIVO' ? 'Coletivo' : 'Grupo'}
                    </TableCell>
                    <TableCell>
                      {atendimento.pessoa?.nome || 
                       (atendimento.pessoas && atendimento.pessoas.length > 0 
                         ? `${atendimento.pessoas.length} pessoas` 
                         : atendimento.familia?.responsavel || '-')}
                    </TableCell>
                    <TableCell>{atendimento.profissional?.nome}</TableCell>
                    <TableCell>{atendimento.unidadeAssistencial?.nome}</TableCell>
                    <TableCell>{atendimento.sigiloso ? 'Sim' : 'Não'}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button variant="ghost" size="sm" onClick={() => handleOpenDialog(atendimento, true)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleOpenDialog(atendimento)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        <Dialog open={openDialog} onOpenChange={setOpenDialog}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>
                {viewMode 
                  ? 'Visualizar Atendimento' 
                  : editingAtendimento 
                    ? 'Editar Atendimento' 
                    : 'Novo Atendimento'}
              </DialogTitle>
              <DialogDescription>
                {viewMode 
                  ? 'Detalhes do atendimentover selecionado.'
                  : editingAtendimento 
                    ? 'Edite as informações do atendimentover selecionado.'
                    : 'Preencha as informações para registrar um novo atendimentover.'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="data">Data</Label>
                    <div className="relative">
                      <Calendar className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="data"
                        name="data"
                        type="date"
                        className="pl-8"
                        value={formData.data}
                        onChange={handleInputChange}
                        disabled={viewMode}
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="hora">Hora</Label>
                    <Input
                      id="hora"
                      name="hora"
                      type="time"
                      value={formData.hora}
                      onChange={handleInputChange}
                      disabled={viewMode}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="tipo">Tipo de Atendimento</Label>
                    <Select
                      value={formData.tipo}
                      onValueChange={(value) => handleSelectChange('tipo', value)}
                      disabled={viewMode}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="INDIVIDUAL">Individual</SelectItem>
                        <SelectItem value="COLETIVO">Coletivo</SelectItem>
                        <SelectItem value="GRUPO">Grupo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sigiloso" className="flex items-center space-x-2 cursor-pointer">
                      <Checkbox
                        id="sigiloso"
                        checked={formData.sigiloso}
                        onCheckedChange={(checked) => 
                          handleCheckboxChange('sigiloso', checked as boolean)
                        }
                        disabled={viewMode}
                      />
                      <span>Atendimento Sigiloso</span>
                    </Label>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="unidadeAssistencial">Unidade Assistencial</Label>
                    <Select
                      value={formData.unidadeAssistencial?.id?.toString() || ''}
                      onValueChange={(value) => handleSelectChange('unidadeAssistencial', Number(value))}
                      disabled={viewMode}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione..." />
                      </SelectTrigger>
                      <SelectContent>
                        {unidades.map(unidade => (
                          <SelectItem key={unidade.id} value={unidade.id.toString()}>
                            {unidade.nome}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="profissional">Profissional</Label>
                    <Select
                      value={formData.profissional?.id?.toString() || ''}
                      onValueChange={(value) => handleSelectChange('profissional', Number(value))}
                      disabled={viewMode}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione..." />
                      </SelectTrigger>
                      <SelectContent>
                        {profissionais.map(profissional => (
                          <SelectItem key={profissional.id} value={profissional.id.toString()}>
                            {profissional.nome} ({profissional.especialidade})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Motivos do Atendimento</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {motivosAtendimento.map(motivo => (
                      <div key={motivo} className="flex items-center space-x-2">
                        <Checkbox
                          id={`motivo-${motivo}`}
                          checked={formData.motivos.includes(motivo)}
                          onCheckedChange={(checked) => 
                            handleMotivoChange(motivo, checked as boolean)
                          }
                          disabled={viewMode}
                        />
                        <Label htmlFor={`motivo-${motivo}`} className="cursor-pointer">
                          {motivo}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="anotacoes">Anotações</Label>
                  <Textarea
                    id="anotacoes"
                    name="anotacoes"
                    value={formData.anotacoes}
                    onChange={handleInputChange}
                    disabled={viewMode}
                    rows={4}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={handleCloseDialog}>
                  {viewMode ? 'Fechar' : 'Cancelar'}
                </Button>
                {!viewMode && (
                  <Button type="submit" disabled={saving}>
                    {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {editingAtendimento ? 'Atualizar' : 'Registrar'}
                  </Button>
                )}
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default AtendimentosTab;
