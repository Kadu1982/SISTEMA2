import React, { useEffect, useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import assistenciaSocialService, { Encaminhamento } from '@/services/assistenciaSocialService';
import { Loader2, Plus, Pencil, Search, Eye, ArrowRight, CornerDownRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const EncaminhamentosTab: React.FC = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [encaminhamentos, setEncaminhamentos] = useState<Encaminhamento[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [openContraReferenciaDialog, setOpenContraReferenciaDialog] = useState(false);
  const [viewMode, setViewMode] = useState(false);
  const [editingEncaminhamento, setEditingEncaminhamento] = useState<Encaminhamento | null>(null);
  const [contraReferenciaEncaminhamento, setContraReferenciaEncaminhamento] = useState<Encaminhamento | null>(null);
  const [formData, setFormData] = useState<Encaminhamento>({
    data: format(new Date(), 'yyyy-MM-dd'),
    tipo: '',
    origem: {
      id: 0,
      nome: '',
      tipo: ''
    },
    destino: {
      id: 0,
      nome: '',
      tipo: ''
    },
    pessoa: {
      id: 0,
      nome: ''
    },
    profissional: {
      id: 0,
      nome: '',
      especialidade: ''
    },
    observacoes: '',
    situacao: 'PENDENTE'
  });
  const [contraReferenciaData, setContraReferenciaData] = useState({
    data: format(new Date(), 'yyyy-MM-dd'),
    profissional: '',
    telefone: '',
    anotacoes: ''
  });

  // Mock data for dropdowns
  const unidades = [
    { id: 1, nome: 'CRAS Centro', tipo: 'UNIDADE_ASSISTENCIAL' },
    { id: 2, nome: 'CRAS Norte', tipo: 'UNIDADE_ASSISTENCIAL' },
    { id: 3, nome: 'CREAS Municipal', tipo: 'UNIDADE_ASSISTENCIAL' },
    { id: 4, nome: 'UBS Central', tipo: 'UNIDADE_SAUDE' },
    { id: 5, nome: 'UBS Norte', tipo: 'UNIDADE_SAUDE' }
  ];

  const orgaosRede = [
    { id: 1, nome: 'Conselho Tutelar', tipo: 'ORGAO_REDE' },
    { id: 2, nome: 'Defensoria Pública', tipo: 'ORGAO_REDE' },
    { id: 3, nome: 'Ministério Público', tipo: 'ORGAO_REDE' },
    { id: 4, nome: 'Secretaria de Educação', tipo: 'ORGAO_REDE' },
    { id: 5, nome: 'INSS', tipo: 'ORGAO_REDE' }
  ];

  const profissionais = [
    { id: 1, nome: 'Maria Silva', especialidade: 'Assistente Social' },
    { id: 2, nome: 'João Santos', especialidade: 'Psicólogo' },
    { id: 3, nome: 'Ana Oliveira', especialidade: 'Assistente Social' }
  ];

  const pessoas = [
    { id: 1, nome: 'José Pereira' },
    { id: 2, nome: 'Maria Souza' },
    { id: 3, nome: 'Carlos Santos' },
    { id: 4, nome: 'Ana Oliveira' }
  ];

  const tiposEncaminhamento = [
    'Acompanhamento',
    'Atendimento Psicossocial',
    'Benefício Eventual',
    'Cadastro Único',
    'Documentação Civil',
    'Habitação',
    'Saúde',
    'Educação',
    'Trabalho e Renda',
    'Previdência Social',
    'Assistência Jurídica'
  ];

  useEffect(() => {
    loadEncaminhamentos();
  }, []);

  const loadEncaminhamentos = async () => {
    try {
      setLoading(true);
      // In a real implementation, this would fetch data from the API
      // const data = await assistenciaSocialService.getEncaminhamentos();
      
      // Using mock data for now
      const mockData: Encaminhamento[] = [
        {
          id: 1,
          data: '2023-06-15',
          tipo: 'Saúde',
          origem: {
            id: 1,
            nome: 'CRAS Centro',
            tipo: 'UNIDADE_ASSISTENCIAL'
          },
          destino: {
            id: 4,
            nome: 'UBS Central',
            tipo: 'UNIDADE_SAUDE'
          },
          pessoa: {
            id: 1,
            nome: 'José Pereira'
          },
          profissional: {
            id: 1,
            nome: 'Maria Silva',
            especialidade: 'Assistente Social'
          },
          observacoes: 'Encaminhamento para consulta médica devido a problemas de saúde.',
          situacao: 'CONCLUIDO',
          contraReferencia: {
            data: '2023-06-20',
            profissional: 'Dr. Carlos Mendes',
            telefone: '(11) 98765-4321',
            anotacoes: 'Paciente atendido. Foram solicitados exames complementares.'
          }
        },
        {
          id: 2,
          data: '2023-06-16',
          tipo: 'Assistência Jurídica',
          origem: {
            id: 3,
            nome: 'CREAS Municipal',
            tipo: 'UNIDADE_ASSISTENCIAL'
          },
          destino: {
            id: 2,
            nome: 'Defensoria Pública',
            tipo: 'ORGAO_REDE'
          },
          pessoa: {
            id: 2,
            nome: 'Maria Souza'
          },
          profissional: {
            id: 2,
            nome: 'João Santos',
            especialidade: 'Psicólogo'
          },
          observacoes: 'Encaminhamento para orientação jurídica sobre pensão alimentícia.',
          situacao: 'PENDENTE'
        },
        {
          id: 3,
          data: '2023-06-17',
          tipo: 'Cadastro Único',
          origem: {
            id: 2,
            nome: 'CRAS Norte',
            tipo: 'UNIDADE_ASSISTENCIAL'
          },
          destino: {
            id: 1,
            nome: 'CRAS Centro',
            tipo: 'UNIDADE_ASSISTENCIAL'
          },
          pessoa: {
            id: 3,
            nome: 'Carlos Santos'
          },
          profissional: {
            id: 3,
            nome: 'Ana Oliveira',
            especialidade: 'Assistente Social'
          },
          observacoes: 'Encaminhamento para atualização do Cadastro Único.',
          situacao: 'PENDENTE'
        }
      ];
      
      setEncaminhamentos(mockData);
    } catch (error) {
      console.error('Erro ao carregar encaminhamentos:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os encaminhamentos. Tente novamente mais tarde.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (encaminhamento?: Encaminhamento, view: boolean = false) => {
    if (encaminhamento) {
      setEditingEncaminhamento(encaminhamento);
      setFormData(encaminhamento);
      setViewMode(view);
    } else {
      setEditingEncaminhamento(null);
      setFormData({
        data: format(new Date(), 'yyyy-MM-dd'),
        tipo: '',
        origem: {
          id: 0,
          nome: '',
          tipo: ''
        },
        destino: {
          id: 0,
          nome: '',
          tipo: ''
        },
        pessoa: {
          id: 0,
          nome: ''
        },
        profissional: {
          id: 0,
          nome: '',
          especialidade: ''
        },
        observacoes: '',
        situacao: 'PENDENTE'
      });
      setViewMode(false);
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingEncaminhamento(null);
    setViewMode(false);
  };

  const handleOpenContraReferenciaDialog = (encaminhamento: Encaminhamento) => {
    setContraReferenciaEncaminhamento(encaminhamento);
    setContraReferenciaData({
      data: format(new Date(), 'yyyy-MM-dd'),
      profissional: '',
      telefone: '',
      anotacoes: ''
    });
    setOpenContraReferenciaDialog(true);
  };

  const handleCloseContraReferenciaDialog = () => {
    setOpenContraReferenciaDialog(false);
    setContraReferenciaEncaminhamento(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleContraReferenciaInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setContraReferenciaData({
      ...contraReferenciaData,
      [name]: value
    });
  };

  const handleSelectChange = (name: string, value: string | number) => {
    if (name === 'origem') {
      const origem = [...unidades, ...orgaosRede].find(o => o.id === Number(value));
      if (origem) {
        setFormData({
          ...formData,
          origem: {
            id: origem.id,
            nome: origem.nome,
            tipo: origem.tipo
          }
        });
      }
    } else if (name === 'destino') {
      const destino = [...unidades, ...orgaosRede].find(d => d.id === Number(value));
      if (destino) {
        setFormData({
          ...formData,
          destino: {
            id: destino.id,
            nome: destino.nome,
            tipo: destino.tipo
          }
        });
      }
    } else if (name === 'pessoa') {
      const pessoa = pessoas.find(p => p.id === Number(value));
      if (pessoa) {
        setFormData({
          ...formData,
          pessoa: {
            id: pessoa.id,
            nome: pessoa.nome
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
    } else if (name === 'tipo') {
      setFormData({
        ...formData,
        tipo: value as string
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setSaving(true);
      
      if (editingEncaminhamento?.id) {
        // In a real implementation, this would update the encaminhamento in the API
        // await assistenciaSocialService.atualizarEncaminhamento(editingEncaminhamento.id, formData);
        
        // For now, just update the local state
        setEncaminhamentos(encaminhamentos.map(e => 
          e.id === editingEncaminhamento.id ? { ...formData, id: editingEncaminhamento.id } : e
        ));
        
        toast({
          title: 'Sucesso',
          description: 'Encaminhamento atualizado com sucesso!',
        });
      } else {
        // In a real implementation, this would create a new encaminhamento in the API
        // const newEncaminhamento = await assistenciaSocialService.criarEncaminhamento(formData);
        
        // For now, just update the local state with a mock ID
        const newEncaminhamento = {
          ...formData,
          id: Math.max(0, ...encaminhamentos.map(e => e.id || 0)) + 1
        };
        setEncaminhamentos([...encaminhamentos, newEncaminhamento]);
        
        toast({
          title: 'Sucesso',
          description: 'Encaminhamento registrado com sucesso!',
        });
      }
      
      handleCloseDialog();
    } catch (error) {
      console.error('Erro ao salvar encaminhamento:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível salvar o encaminhamento. Tente novamente mais tarde.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleSubmitContraReferencia = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!contraReferenciaEncaminhamento?.id) return;
    
    try {
      setSaving(true);
      
      // In a real implementation, this would call the API
      // await assistenciaSocialService.registrarContraReferencia(contraReferenciaEncaminhamento.id, contraReferenciaData);
      
      // For now, just update the local state
      setEncaminhamentos(encaminhamentos.map(e => 
        e.id === contraReferenciaEncaminhamento.id ? { 
          ...e, 
          situacao: 'CONCLUIDO',
          contraReferencia: contraReferenciaData
        } : e
      ));
      
      toast({
        title: 'Sucesso',
        description: 'Contrarreferência registrada com sucesso!',
      });
      
      handleCloseContraReferenciaDialog();
    } catch (error) {
      console.error('Erro ao registrar contrarreferência:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível registrar a contrarreferência. Tente novamente mais tarde.',
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

  const filteredEncaminhamentos = encaminhamentos.filter(encaminhamento => {
    const searchLower = searchTerm.toLowerCase();
    return (
      encaminhamento.pessoa.nome.toLowerCase().includes(searchLower) ||
      encaminhamento.profissional.nome.toLowerCase().includes(searchLower) ||
      encaminhamento.origem.nome.toLowerCase().includes(searchLower) ||
      encaminhamento.destino.nome.toLowerCase().includes(searchLower) ||
      encaminhamento.tipo.toLowerCase().includes(searchLower) ||
      formatDate(encaminhamento.data).includes(searchLower)
    );
  });

  const getSituacaoBadge = (situacao: string) => {
    switch (situacao) {
      case 'PENDENTE':
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800">Pendente</Badge>;
      case 'CONCLUIDO':
        return <Badge variant="outline" className="bg-green-100 text-green-800">Concluído</Badge>;
      default:
        return <Badge variant="outline">{situacao}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Carregando encaminhamentos...</span>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Encaminhamentos</CardTitle>
            <CardDescription>
              Gestão de encaminhamentos para a rede assistencial.
            </CardDescription>
          </div>
          <Button onClick={() => handleOpenDialog()}>
            <Plus className="mr-2 h-4 w-4" />
            Novo Encaminhamento
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar encaminhamentos..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {filteredEncaminhamentos.length === 0 ? (
          <div className="text-center p-4">
            <p>Nenhum encaminhamento encontrado.</p>
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Pessoa</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Origem</TableHead>
                  <TableHead>Destino</TableHead>
                  <TableHead>Profissional</TableHead>
                  <TableHead>Situação</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEncaminhamentos.map((encaminhamento) => (
                  <TableRow key={encaminhamento.id}>
                    <TableCell>{formatDate(encaminhamento.data)}</TableCell>
                    <TableCell>{encaminhamento.pessoa.nome}</TableCell>
                    <TableCell>{encaminhamento.tipo}</TableCell>
                    <TableCell>{encaminhamento.origem.nome}</TableCell>
                    <TableCell>{encaminhamento.destino.nome}</TableCell>
                    <TableCell>{encaminhamento.profissional.nome}</TableCell>
                    <TableCell>{getSituacaoBadge(encaminhamento.situacao)}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button variant="ghost" size="sm" onClick={() => handleOpenDialog(encaminhamento, true)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        {encaminhamento.situacao === 'PENDENTE' && (
                          <>
                            <Button variant="ghost" size="sm" onClick={() => handleOpenDialog(encaminhamento)}>
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => handleOpenContraReferenciaDialog(encaminhamento)}
                            >
                              <CornerDownRight className="h-4 w-4" />
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

        <Dialog open={openDialog} onOpenChange={setOpenDialog}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>
                {viewMode 
                  ? 'Visualizar Encaminhamento' 
                  : editingEncaminhamento 
                    ? 'Editar Encaminhamento' 
                    : 'Novo Encaminhamento'}
              </DialogTitle>
              <DialogDescription>
                {viewMode 
                  ? 'Detalhes do encaminhamento selecionado.' 
                  : editingEncaminhamento 
                    ? 'Edite as informações do encaminhamento selecionado.' 
                    : 'Preencha as informações para registrar um novo encaminhamento.'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="data">Data</Label>
                    <Input
                      id="data"
                      name="data"
                      type="date"
                      value={formData.data}
                      onChange={handleInputChange}
                      disabled={viewMode}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tipo">Tipo de Encaminhamento</Label>
                    <Select
                      value={formData.tipo}
                      onValueChange={(value) => handleSelectChange('tipo', value)}
                      disabled={viewMode}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione..." />
                      </SelectTrigger>
                      <SelectContent>
                        {tiposEncaminhamento.map(tipo => (
                          <SelectItem key={tipo} value={tipo}>
                            {tipo}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="pessoa">Pessoa</Label>
                    <Select
                      value={formData.pessoa?.id?.toString() || ''}
                      onValueChange={(value) => handleSelectChange('pessoa', Number(value))}
                      disabled={viewMode}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione..." />
                      </SelectTrigger>
                      <SelectContent>
                        {pessoas.map(pessoa => (
                          <SelectItem key={pessoa.id} value={pessoa.id.toString()}>
                            {pessoa.nome}
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

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="origem">Origem</Label>
                    <Select
                      value={formData.origem?.id?.toString() || ''}
                      onValueChange={(value) => handleSelectChange('origem', Number(value))}
                      disabled={viewMode}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="" disabled>Unidades Assistenciais</SelectItem>
                        {unidades.filter(u => u.tipo === 'UNIDADE_ASSISTENCIAL').map(unidade => (
                          <SelectItem key={unidade.id} value={unidade.id.toString()}>
                            {unidade.nome}
                          </SelectItem>
                        ))}
                        <SelectItem value="" disabled>Unidades de Saúde</SelectItem>
                        {unidades.filter(u => u.tipo === 'UNIDADE_SAUDE').map(unidade => (
                          <SelectItem key={unidade.id} value={unidade.id.toString()}>
                            {unidade.nome}
                          </SelectItem>
                        ))}
                        <SelectItem value="" disabled>Órgãos da Rede</SelectItem>
                        {orgaosRede.map(orgao => (
                          <SelectItem key={orgao.id} value={orgao.id.toString()}>
                            {orgao.nome}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="destino">Destino</Label>
                    <Select
                      value={formData.destino?.id?.toString() || ''}
                      onValueChange={(value) => handleSelectChange('destino', Number(value))}
                      disabled={viewMode}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="" disabled>Unidades Assistenciais</SelectItem>
                        {unidades.filter(u => u.tipo === 'UNIDADE_ASSISTENCIAL').map(unidade => (
                          <SelectItem key={unidade.id} value={unidade.id.toString()}>
                            {unidade.nome}
                          </SelectItem>
                        ))}
                        <SelectItem value="" disabled>Unidades de Saúde</SelectItem>
                        {unidades.filter(u => u.tipo === 'UNIDADE_SAUDE').map(unidade => (
                          <SelectItem key={unidade.id} value={unidade.id.toString()}>
                            {unidade.nome}
                          </SelectItem>
                        ))}
                        <SelectItem value="" disabled>Órgãos da Rede</SelectItem>
                        {orgaosRede.map(orgao => (
                          <SelectItem key={orgao.id} value={orgao.id.toString()}>
                            {orgao.nome}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="observacoes">Observações</Label>
                  <Textarea
                    id="observacoes"
                    name="observacoes"
                    value={formData.observacoes || ''}
                    onChange={handleInputChange}
                    disabled={viewMode}
                    rows={3}
                  />
                </div>

                {viewMode && formData.contraReferencia && (
                  <div className="space-y-2 border p-4 rounded-md bg-gray-50">
                    <h3 className="font-medium text-lg">Contrarreferência</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Data</Label>
                        <p>{formatDate(formData.contraReferencia.data)}</p>
                      </div>
                      <div>
                        <Label>Profissional</Label>
                        <p>{formData.contraReferencia.profissional}</p>
                      </div>
                    </div>
                    {formData.contraReferencia.telefone && (
                      <div>
                        <Label>Telefone</Label>
                        <p>{formData.contraReferencia.telefone}</p>
                      </div>
                    )}
                    <div>
                      <Label>Anotações</Label>
                      <p>{formData.contraReferencia.anotacoes}</p>
                    </div>
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={handleCloseDialog}>
                  {viewMode ? 'Fechar' : 'Cancelar'}
                </Button>
                {!viewMode && (
                  <Button type="submit" disabled={saving}>
                    {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {editingEncaminhamento ? 'Atualizar' : 'Registrar'}
                  </Button>
                )}
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        <Dialog open={openContraReferenciaDialog} onOpenChange={setOpenContraReferenciaDialog}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Registrar Contrarreferência</DialogTitle>
              <DialogDescription>
                Registre as informações de retorno do encaminhamento.
              </DialogDescription>
            </DialogHeader>
            {contraReferenciaEncaminhamento && (
              <form onSubmit={handleSubmitContraReferencia}>
                <div className="grid gap-4 py-4">
                  <div className="space-y-2 border p-3 rounded-md bg-gray-50">
                    <h3 className="font-medium">Informações do Encaminhamento</h3>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="font-medium">Data:</span> {formatDate(contraReferenciaEncaminhamento.data)}
                      </div>
                      <div>
                        <span className="font-medium">Pessoa:</span> {contraReferenciaEncaminhamento.pessoa.nome}
                      </div>
                      <div>
                        <span className="font-medium">Tipo:</span> {contraReferenciaEncaminhamento.tipo}
                      </div>
                      <div>
                        <span className="font-medium">Destino:</span> {contraReferenciaEncaminhamento.destino.nome}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="data">Data da Contrarreferência</Label>
                      <Input
                        id="data"
                        name="data"
                        type="date"
                        value={contraReferenciaData.data}
                        onChange={handleContraReferenciaInputChange}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="profissional">Profissional que Atendeu</Label>
                      <Input
                        id="profissional"
                        name="profissional"
                        value={contraReferenciaData.profissional}
                        onChange={handleContraReferenciaInputChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="telefone">Telefone de Contato</Label>
                    <Input
                      id="telefone"
                      name="telefone"
                      value={contraReferenciaData.telefone}
                      onChange={handleContraReferenciaInputChange}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="anotacoes">Anotações da Contrarreferência</Label>
                    <Textarea
                      id="anotacoes"
                      name="anotacoes"
                      value={contraReferenciaData.anotacoes}
                      onChange={handleContraReferenciaInputChange}
                      rows={3}
                      required
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={handleCloseContraReferenciaDialog}>
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={saving}>
                    {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Registrar
                  </Button>
                </DialogFooter>
              </form>
            )}
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default EncaminhamentosTab;