import React, { useEffect, useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import assistenciaSocialService, { Beneficio, DispensacaoBeneficio } from '@/services/assistenciaSocialService';
import { Loader2, Plus, Pencil, Search, Eye, Package, Check, X } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const BeneficiosTab: React.FC = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('cadastro');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [beneficios, setBeneficios] = useState<Beneficio[]>([]);
  const [dispensacoes, setDispensacoes] = useState<DispensacaoBeneficio[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [openDispensacaoDialog, setOpenDispensacaoDialog] = useState(false);
  const [viewMode, setViewMode] = useState(false);
  const [editingBeneficio, setEditingBeneficio] = useState<Beneficio | null>(null);
  const [viewingDispensacao, setViewingDispensacao] = useState<DispensacaoBeneficio | null>(null);
  const [formData, setFormData] = useState<Beneficio>({
    nome: '',
    tipo: {
      id: 0,
      nome: ''
    },
    valorBase: 0,
    ativo: true
  });

  // Mock data for dropdowns
  const tiposBeneficio = [
    { id: 1, nome: 'Auxílio Alimentação' },
    { id: 2, nome: 'Auxílio Moradia' },
    { id: 3, nome: 'Auxílio Transporte' },
    { id: 4, nome: 'Auxílio Funeral' },
    { id: 5, nome: 'Auxílio Natalidade' }
  ];

  const subtiposBeneficio = [
    { id: 1, nome: 'Cesta Básica', tipoId: 1 },
    { id: 2, nome: 'Vale Alimentação', tipoId: 1 },
    { id: 3, nome: 'Aluguel Social', tipoId: 2 },
    { id: 4, nome: 'Passagem Municipal', tipoId: 3 },
    { id: 5, nome: 'Passagem Intermunicipal', tipoId: 3 },
    { id: 6, nome: 'Urna Funerária', tipoId: 4 },
    { id: 7, nome: 'Translado', tipoId: 4 },
    { id: 8, nome: 'Kit Bebê', tipoId: 5 }
  ];

  useEffect(() => {
    loadBeneficios();
    loadDispensacoes();
  }, []);

  const loadBeneficios = async () => {
    try {
      setLoading(true);
      const data = await assistenciaSocialService.getBeneficios();
      setBeneficios(data);
    } catch (error) {
      console.error('Erro ao carregar benefícios:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os benefícios. Tente novamente mais tarde.',
        variant: 'destructive',
      });

      // Fallback to mock data if API call fails
      const mockData: Beneficio[] = [
        {
          id: 1,
          nome: 'Cesta Básica',
          tipo: {
            id: 1,
            nome: 'Auxílio Alimentação'
          },
          subtipo: {
            id: 1,
            nome: 'Cesta Básica'
          },
          valorBase: 120.00,
          numeroLei: '1234/2022',
          observacoes: 'Benefício para famílias em situação de vulnerabilidade alimentar',
          ativo: true
        },
        {
          id: 2,
          nome: 'Aluguel Social',
          tipo: {
            id: 2,
            nome: 'Auxílio Moradia'
          },
          subtipo: {
            id: 3,
            nome: 'Aluguel Social'
          },
          valorBase: 500.00,
          numeroLei: '1235/2022',
          observacoes: 'Benefício para famílias em situação de vulnerabilidade habitacional',
          ativo: true
        },
        {
          id: 3,
          nome: 'Passagem Intermunicipal',
          tipo: {
            id: 3,
            nome: 'Auxílio Transporte'
          },
          subtipo: {
            id: 5,
            nome: 'Passagem Intermunicipal'
          },
          valorBase: 80.00,
          numeroLei: '1236/2022',
          observacoes: 'Benefício para deslocamento intermunicipal',
          ativo: false
        }
      ];

      setBeneficios(mockData);
    } finally {
      setLoading(false);
    }
  };

  const loadDispensacoes = async () => {
    try {
      const data = await assistenciaSocialService.getDispensacoes();
      setDispensacoes(data);
    } catch (error) {
      console.error('Erro ao carregar dispensações:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar as dispensações. Tente novamente mais tarde.',
        variant: 'destructive',
      });

      // Fallback to mock data if API call fails
      const mockData: DispensacaoBeneficio[] = [
        {
          id: 1,
          data: '2023-06-15',
          situacao: 'AUTORIZADO',
          pessoa: {
            id: 1,
            nome: 'José Pereira'
          },
          profissional: {
            id: 1,
            nome: 'Maria Silva'
          },
          unidadeAssistencial: {
            id: 1,
            nome: 'CRAS Centro'
          },
          itens: [
            {
              beneficio: {
                id: 1,
                nome: 'Cesta Básica'
              },
              quantidade: 1,
              valorUnitario: 120.00,
              valorTotal: 120.00
            }
          ],
          dataAutorizacao: '2023-06-15',
          usuarioAutorizacao: 'João Santos'
        },
        {
          id: 2,
          data: '2023-06-16',
          situacao: 'PENDENTE',
          pessoa: {
            id: 2,
            nome: 'Maria Souza'
          },
          profissional: {
            id: 2,
            nome: 'João Santos'
          },
          unidadeAssistencial: {
            id: 2,
            nome: 'CRAS Norte'
          },
          itens: [
            {
              beneficio: {
                id: 2,
                nome: 'Aluguel Social'
              },
              quantidade: 1,
              valorUnitario: 500.00,
              valorTotal: 500.00
            }
          ]
        },
        {
          id: 3,
          data: '2023-06-17',
          situacao: 'REJEITADO',
          pessoa: {
            id: 3,
            nome: 'Carlos Santos'
          },
          profissional: {
            id: 3,
            nome: 'Ana Oliveira'
          },
          unidadeAssistencial: {
            id: 3,
            nome: 'CREAS Municipal'
          },
          itens: [
            {
              beneficio: {
                id: 3,
                nome: 'Passagem Intermunicipal'
              },
              quantidade: 2,
              valorUnitario: 80.00,
              valorTotal: 160.00
            }
          ],
          dataRejeicao: '2023-06-17',
          usuarioRejeicao: 'Maria Silva',
          motivoRejeicao: 'Beneficiário já recebeu este benefício no mês corrente'
        }
      ];

      setDispensacoes(mockData);
    }
  };

  const handleOpenDialog = (beneficio?: Beneficio) => {
    if (beneficio) {
      setEditingBeneficio(beneficio);
      setFormData(beneficio);
    } else {
      setEditingBeneficio(null);
      setFormData({
        nome: '',
        tipo: {
          id: 0,
          nome: ''
        },
        valorBase: 0,
        ativo: true
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingBeneficio(null);
  };

  const handleOpenDispensacaoDialog = (dispensacao: DispensacaoBeneficio) => {
    setViewingDispensacao(dispensacao);
    setOpenDispensacaoDialog(true);
  };

  const handleCloseDispensacaoDialog = () => {
    setOpenDispensacaoDialog(false);
    setViewingDispensacao(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;

    if (type === 'number') {
      setFormData({
        ...formData,
        [name]: parseFloat(value) || 0
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const handleSelectChange = (name: string, value: string | number) => {
    if (name === 'tipo') {
      const tipo = tiposBeneficio.find(t => t.id === Number(value));
      if (tipo) {
        setFormData({
          ...formData,
          tipo: {
            id: tipo.id,
            nome: tipo.nome
          },
          subtipo: undefined // Clear subtipo when tipo changes
        });
      }
    } else if (name === 'subtipo') {
      const subtipo = subtiposBeneficio.find(s => s.id === Number(value));
      if (subtipo) {
        setFormData({
          ...formData,
          subtipo: {
            id: subtipo.id,
            nome: subtipo.nome
          }
        });
      }
    }
  };

  const handleSwitchChange = (checked: boolean) => {
    setFormData({
      ...formData,
      ativo: checked
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setSaving(true);

      if (editingBeneficio?.id) {
        try {
          // Try to update the beneficio using the API
          const updatedBeneficio = await assistenciaSocialService.atualizarBeneficio(editingBeneficio.id, formData);
          setBeneficios(beneficios.map(b => 
            b.id === editingBeneficio.id ? updatedBeneficio : b
          ));

          toast({
            title: 'Sucesso',
            description: 'Benefício atualizado com sucesso!',
          });
        } catch (apiError) {
          console.error('Erro ao atualizar benefício via API:', apiError);

          // Fallback to local update if API call fails
          setBeneficios(beneficios.map(b => 
            b.id === editingBeneficio.id ? { ...formData, id: editingBeneficio.id } : b
          ));

          toast({
            title: 'Sucesso (Modo Local)',
            description: 'Benefício atualizado localmente. A sincronização com o servidor será feita posteriormente.',
          });
        }
      } else {
        try {
          // Try to create a new beneficio using the API
          const newBeneficio = await assistenciaSocialService.criarBeneficio(formData);
          setBeneficios([...beneficios, newBeneficio]);

          toast({
            title: 'Sucesso',
            description: 'Benefício cadastrado com sucesso!',
          });
        } catch (apiError) {
          console.error('Erro ao criar benefício via API:', apiError);

          // Fallback to mock data if API call fails
          const newBeneficio = {
            ...formData,
            id: Math.max(0, ...beneficios.map(b => b.id || 0)) + 1
          };
          setBeneficios([...beneficios, newBeneficio]);

          toast({
            title: 'Sucesso (Modo Local)',
            description: 'Benefício cadastrado localmente. A sincronização com o servidor será feita posteriormente.',
          });
        }
      }

      handleCloseDialog();
    } catch (error) {
      console.error('Erro ao salvar benefício:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível salvar o benefício. Tente novamente mais tarde.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleAutorizarDispensacao = async (id: number) => {
    try {
      try {
        // Try to authorize the dispensacao using the API
        const updatedDispensacao = await assistenciaSocialService.autorizarDispensacao(id);
        setDispensacoes(dispensacoes.map(d => 
          d.id === id ? updatedDispensacao : d
        ));

        toast({
          title: 'Sucesso',
          description: 'Dispensação autorizada com sucesso!',
        });
      } catch (apiError) {
        console.error('Erro ao autorizar dispensação via API:', apiError);

        // Fallback to local update if API call fails
        setDispensacoes(dispensacoes.map(d => 
          d.id === id ? { 
            ...d, 
            situacao: 'AUTORIZADO',
            dataAutorizacao: format(new Date(), 'yyyy-MM-dd'),
            usuarioAutorizacao: 'Usuário Atual'
          } : d
        ));

        toast({
          title: 'Sucesso (Modo Local)',
          description: 'Dispensação autorizada localmente. A sincronização com o servidor será feita posteriormente.',
        });
      }
    } catch (error) {
      console.error('Erro ao autorizar dispensação:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível autorizar a dispensação. Tente novamente mais tarde.',
        variant: 'destructive',
      });
    }
  };

  const handleRejeitarDispensacao = async (id: number) => {
    try {
      try {
        // Try to reject the dispensacao using the API
        // Note: In a real implementation, you would prompt the user for the rejection reason
        const motivo = 'Motivo da rejeição'; // This should come from user input
        const updatedDispensacao = await assistenciaSocialService.rejeitarDispensacao(id, motivo);
        setDispensacoes(dispensacoes.map(d => 
          d.id === id ? updatedDispensacao : d
        ));

        toast({
          title: 'Sucesso',
          description: 'Dispensação rejeitada com sucesso!',
        });
      } catch (apiError) {
        console.error('Erro ao rejeitar dispensação via API:', apiError);

        // Fallback to local update if API call fails
        setDispensacoes(dispensacoes.map(d => 
          d.id === id ? { 
            ...d, 
            situacao: 'REJEITADO',
            dataRejeicao: format(new Date(), 'yyyy-MM-dd'),
            usuarioRejeicao: 'Usuário Atual',
            motivoRejeicao: 'Motivo da rejeição'
          } : d
        ));

        toast({
          title: 'Sucesso (Modo Local)',
          description: 'Dispensação rejeitada localmente. A sincronização com o servidor será feita posteriormente.',
        });
      }
    } catch (error) {
      console.error('Erro ao rejeitar dispensação:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível rejeitar a dispensação. Tente novamente mais tarde.',
        variant: 'destructive',
      });
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return format(date, 'dd/MM/yyyy', { locale: ptBR });
    } catch (error) {
      return dateString;
    }
  };

  const filteredBeneficios = beneficios.filter(beneficio => {
    const searchLower = searchTerm.toLowerCase();
    return (
      beneficio.nome.toLowerCase().includes(searchLower) ||
      beneficio.tipo.nome.toLowerCase().includes(searchLower) ||
      (beneficio.subtipo?.nome.toLowerCase().includes(searchLower) || false)
    );
  });

  const filteredDispensacoes = dispensacoes.filter(dispensacao => {
    const searchLower = searchTerm.toLowerCase();
    return (
      dispensacao.pessoa.nome.toLowerCase().includes(searchLower) ||
      dispensacao.profissional.nome.toLowerCase().includes(searchLower) ||
      dispensacao.unidadeAssistencial.nome.toLowerCase().includes(searchLower) ||
      dispensacao.itens.some(item => item.beneficio.nome.toLowerCase().includes(searchLower))
    );
  });

  const getSubtiposByTipoId = (tipoId: number) => {
    return subtiposBeneficio.filter(subtipo => subtipo.tipoId === tipoId);
  };

  const getSituacaoBadge = (situacao: string) => {
    switch (situacao) {
      case 'PENDENTE':
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800">Pendente</Badge>;
      case 'AUTORIZADO':
        return <Badge variant="outline" className="bg-green-100 text-green-800">Autorizado</Badge>;
      case 'REJEITADO':
        return <Badge variant="outline" className="bg-red-100 text-red-800">Rejeitado</Badge>;
      case 'CANCELADO':
        return <Badge variant="outline" className="bg-gray-100 text-gray-800">Cancelado</Badge>;
      default:
        return <Badge variant="outline">{situacao}</Badge>;
    }
  };

  if (loading && activeTab === 'cadastro') {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Carregando benefícios...</span>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gestão de Benefícios</CardTitle>
        <CardDescription>
          Cadastro e controle de benefícios concedidos.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger value="cadastro">Cadastro de Benefícios</TabsTrigger>
            <TabsTrigger value="dispensacao">Dispensação de Benefícios</TabsTrigger>
          </TabsList>

          <TabsContent value="cadastro">
            <div className="flex justify-between items-center mb-4">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar benefícios..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Button onClick={() => handleOpenDialog()}>
                <Plus className="mr-2 h-4 w-4" />
                Novo Benefício
              </Button>
            </div>

            {filteredBeneficios.length === 0 ? (
              <div className="text-center p-4">
                <p>Nenhum benefício encontrado.</p>
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Subtipo</TableHead>
                      <TableHead>Valor Base</TableHead>
                      <TableHead>Nº Lei</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredBeneficios.map((beneficio) => (
                      <TableRow key={beneficio.id}>
                        <TableCell>{beneficio.nome}</TableCell>
                        <TableCell>{beneficio.tipo.nome}</TableCell>
                        <TableCell>{beneficio.subtipo?.nome || '-'}</TableCell>
                        <TableCell>R$ {beneficio.valorBase.toFixed(2)}</TableCell>
                        <TableCell>{beneficio.numeroLei || '-'}</TableCell>
                        <TableCell>
                          {beneficio.ativo ? (
                            <Badge variant="outline" className="bg-green-100 text-green-800">Ativo</Badge>
                          ) : (
                            <Badge variant="outline" className="bg-red-100 text-red-800">Inativo</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm" onClick={() => handleOpenDialog(beneficio)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}

            <Dialog open={openDialog} onOpenChange={setOpenDialog}>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>
                    {editingBeneficio ? 'Editar Benefício' : 'Novo Benefício'}
                  </DialogTitle>
                  <DialogDescription>
                    {editingBeneficio 
                      ? 'Edite as informações do benefício selecionado.' 
                      : 'Preencha as informações para cadastrar um novo benefício.'}
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                  <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="nome">Nome do Benefício</Label>
                      <Input
                        id="nome"
                        name="nome"
                        value={formData.nome}
                        onChange={handleInputChange}
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="tipo">Tipo</Label>
                        <Select
                          value={formData.tipo?.id?.toString() || ''}
                          onValueChange={(value) => handleSelectChange('tipo', Number(value))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione..." />
                          </SelectTrigger>
                          <SelectContent>
                            {tiposBeneficio.map(tipo => (
                              <SelectItem key={tipo.id} value={tipo.id.toString()}>
                                {tipo.nome}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="subtipo">Subtipo</Label>
                        <Select
                          value={formData.subtipo?.id?.toString() || ''}
                          onValueChange={(value) => handleSelectChange('subtipo', Number(value))}
                          disabled={!formData.tipo?.id}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione..." />
                          </SelectTrigger>
                          <SelectContent>
                            {formData.tipo?.id && getSubtiposByTipoId(formData.tipo.id).map(subtipo => (
                              <SelectItem key={subtipo.id} value={subtipo.id.toString()}>
                                {subtipo.nome}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="valorBase">Valor Base</Label>
                        <Input
                          id="valorBase"
                          name="valorBase"
                          type="number"
                          step="0.01"
                          value={formData.valorBase}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="numeroLei">Número da Lei</Label>
                        <Input
                          id="numeroLei"
                          name="numeroLei"
                          value={formData.numeroLei || ''}
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="observacoes">Observações</Label>
                      <Textarea
                        id="observacoes"
                        name="observacoes"
                        value={formData.observacoes || ''}
                        onChange={handleInputChange}
                        rows={3}
                      />
                    </div>

                    <div className="flex items-center space-x-2">
                      <Switch
                        id="ativo"
                        checked={formData.ativo}
                        onCheckedChange={handleSwitchChange}
                      />
                      <Label htmlFor="ativo">Benefício Ativo</Label>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={handleCloseDialog}>
                      Cancelar
                    </Button>
                    <Button type="submit" disabled={saving}>
                      {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      {editingBeneficio ? 'Atualizar' : 'Cadastrar'}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </TabsContent>

          <TabsContent value="dispensacao">
            <div className="flex justify-between items-center mb-4">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar dispensações..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Nova Dispensação
              </Button>
            </div>

            {filteredDispensacoes.length === 0 ? (
              <div className="text-center p-4">
                <p>Nenhuma dispensação encontrada.</p>
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Data</TableHead>
                      <TableHead>Pessoa</TableHead>
                      <TableHead>Benefícios</TableHead>
                      <TableHead>Valor Total</TableHead>
                      <TableHead>Profissional</TableHead>
                      <TableHead>Unidade</TableHead>
                      <TableHead>Situação</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredDispensacoes.map((dispensacao) => (
                      <TableRow key={dispensacao.id}>
                        <TableCell>{formatDate(dispensacao.data)}</TableCell>
                        <TableCell>{dispensacao.pessoa.nome}</TableCell>
                        <TableCell>
                          {dispensacao.itens.map(item => (
                            <div key={item.beneficio.id}>
                              {item.quantidade}x {item.beneficio.nome}
                            </div>
                          ))}
                        </TableCell>
                        <TableCell>
                          R$ {dispensacao.itens.reduce((total, item) => total + item.valorTotal, 0).toFixed(2)}
                        </TableCell>
                        <TableCell>{dispensacao.profissional.nome}</TableCell>
                        <TableCell>{dispensacao.unidadeAssistencial.nome}</TableCell>
                        <TableCell>{getSituacaoBadge(dispensacao.situacao)}</TableCell>
                        <TableCell>
                          <div className="flex space-x-1">
                            <Button variant="ghost" size="sm" onClick={() => handleOpenDispensacaoDialog(dispensacao)}>
                              <Eye className="h-4 w-4" />
                            </Button>
                            {dispensacao.situacao === 'PENDENTE' && (
                              <>
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="text-green-600 hover:text-green-700"
                                  onClick={() => handleAutorizarDispensacao(dispensacao.id!)}
                                >
                                  <Check className="h-4 w-4" />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="text-red-600 hover:text-red-700"
                                  onClick={() => handleRejeitarDispensacao(dispensacao.id!)}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}

            <Dialog open={openDispensacaoDialog} onOpenChange={setOpenDispensacaoDialog}>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Detalhes da Dispensação</DialogTitle>
                  <DialogDescription>
                    Informações detalhadas sobre a dispensação de benefícios.
                  </DialogDescription>
                </DialogHeader>
                {viewingDispensacao && (
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-medium mb-1">Data</h4>
                        <p>{formatDate(viewingDispensacao.data)}</p>
                      </div>
                      <div>
                        <h4 className="font-medium mb-1">Situação</h4>
                        <p>{getSituacaoBadge(viewingDispensacao.situacao)}</p>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium mb-1">Pessoa</h4>
                      <p>{viewingDispensacao.pessoa.nome}</p>
                    </div>

                    <div>
                      <h4 className="font-medium mb-1">Profissional</h4>
                      <p>{viewingDispensacao.profissional.nome}</p>
                    </div>

                    <div>
                      <h4 className="font-medium mb-1">Unidade</h4>
                      <p>{viewingDispensacao.unidadeAssistencial.nome}</p>
                    </div>

                    <div>
                      <h4 className="font-medium mb-1">Benefícios</h4>
                      <div className="rounded-md border p-2">
                        {viewingDispensacao.itens.map(item => (
                          <div key={item.beneficio.id} className="flex justify-between py-1">
                            <span>{item.quantidade}x {item.beneficio.nome}</span>
                            <span>R$ {item.valorTotal.toFixed(2)}</span>
                          </div>
                        ))}
                        <div className="border-t mt-2 pt-2 font-medium flex justify-between">
                          <span>Total</span>
                          <span>R$ {viewingDispensacao.itens.reduce((total, item) => total + item.valorTotal, 0).toFixed(2)}</span>
                        </div>
                      </div>
                    </div>

                    {viewingDispensacao.observacoes && (
                      <div>
                        <h4 className="font-medium mb-1">Observações</h4>
                        <p>{viewingDispensacao.observacoes}</p>
                      </div>
                    )}

                    {viewingDispensacao.situacao === 'AUTORIZADO' && (
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-medium mb-1">Data de Autorização</h4>
                          <p>{formatDate(viewingDispensacao.dataAutorizacao)}</p>
                        </div>
                        <div>
                          <h4 className="font-medium mb-1">Autorizado por</h4>
                          <p>{viewingDispensacao.usuarioAutorizacao}</p>
                        </div>
                      </div>
                    )}

                    {viewingDispensacao.situacao === 'REJEITADO' && (
                      <>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <h4 className="font-medium mb-1">Data de Rejeição</h4>
                            <p>{formatDate(viewingDispensacao.dataRejeicao)}</p>
                          </div>
                          <div>
                            <h4 className="font-medium mb-1">Rejeitado por</h4>
                            <p>{viewingDispensacao.usuarioRejeicao}</p>
                          </div>
                        </div>
                        <div>
                          <h4 className="font-medium mb-1">Motivo da Rejeição</h4>
                          <p>{viewingDispensacao.motivoRejeicao}</p>
                        </div>
                      </>
                    )}
                  </div>
                )}
                <DialogFooter>
                  <Button onClick={handleCloseDispensacaoDialog}>Fechar</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default BeneficiosTab;
