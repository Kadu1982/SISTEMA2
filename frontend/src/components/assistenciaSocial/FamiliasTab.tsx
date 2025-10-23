import React, { useEffect, useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import assistenciaSocialService, { Familia } from '@/services/assistenciaSocialService';
import { Loader2, Plus, Pencil, Search } from 'lucide-react';

// Helper functions to convert between backend enum and display format for tipoFamilia
const formatTipoFamiliaForDisplay = (tipoFamilia: string): string => {
  if (!tipoFamilia) return '';

  // Convert from backend enum format (e.g., "CONTEMPORANEA") to display format (e.g., "Contemporânea")
  const mapping: Record<string, string> = {
    'CONTEMPORANEA': 'Contemporânea',
    'HOMOAFETIVA': 'Homoafetiva',
    'MONOPARENTAL': 'Monoparental',
    'QUILOMBOLA': 'Quilombola',
    'INDIGENA': 'Indígena',
    'RIBEIRINHA': 'Ribeirinha',
    'CIGANA': 'Cigana'
  };

  return mapping[tipoFamilia] || tipoFamilia;
};

const formatTipoFamiliaForBackend = (tipoFamilia: string): string => {
  if (!tipoFamilia) return '';

  // Convert from display format (e.g., "Contemporânea") to backend enum format (e.g., "CONTEMPORANEA")
  const mapping: Record<string, string> = {
    'Contemporânea': 'CONTEMPORANEA',
    'Homoafetiva': 'HOMOAFETIVA',
    'Monoparental': 'MONOPARENTAL',
    'Quilombola': 'QUILOMBOLA',
    'Indígena': 'INDIGENA',
    'Ribeirinha': 'RIBEIRINHA',
    'Cigana': 'CIGANA'
  };

  return mapping[tipoFamilia] || tipoFamilia.toUpperCase().replace(/\s/g, '_');
};

const FamiliasTab: React.FC = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [familias, setFamilias] = useState<Familia[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [editingFamilia, setEditingFamilia] = useState<Familia | null>(null);
  const [formData, setFormData] = useState<Familia>({
    responsavel: {
      id: 1, // Default to admin user ID
      nome: ''
    },
    codigoFamiliar: '',
    classeSocial: '',
    tipoFamilia: '',
    // Address fields required by backend
    municipio: '',
    cep: '',
    logradouro: '',
    numero: '',
    bairro: '',
    complemento: '',
    // For frontend use
    quantidadeDependentes: 0,
    endereco: {
      logradouro: '',
      numero: '',
      bairro: '',
      cidade: '',
      uf: '',
      cep: '',
      complemento: ''
    }
  });

  useEffect(() => {
    loadFamilias();
  }, []);

  const loadFamilias = async () => {
    try {
      setLoading(true);
      const data = await assistenciaSocialService.getFamilias();
      setFamilias(data);
    } catch (error) {
      console.error('Erro ao carregar famílias:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar as famílias. Tente novamente mais tarde.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (familia?: Familia) => {
    if (familia) {
      setEditingFamilia(familia);
      // Convert tipoFamilia from backend enum format to display format
      const formattedFamilia = {
        ...familia,
        tipoFamilia: formatTipoFamiliaForDisplay(familia.tipoFamilia),
        // Garantir que endereco existe com valores padrão
        endereco: familia.endereco || {
          logradouro: '',
          numero: '',
          bairro: '',
          cidade: '',
          uf: '',
          cep: '',
          complemento: ''
        }
      };
      setFormData(formattedFamilia);
    } else {
      setEditingFamilia(null);
      setFormData({
        responsavel: {
          id: 1, // Default to admin user ID
          nome: ''
        },
        codigoFamiliar: '',
        classeSocial: '',
        tipoFamilia: '',
        // Address fields required by backend
        municipio: '',
        cep: '',
        logradouro: '',
        numero: '',
        bairro: '',
        complemento: '',
        // For frontend use
        quantidadeDependentes: 0,
        endereco: {
          logradouro: '',
          numero: '',
          bairro: '',
          cidade: '',
          uf: '',
          cep: '',
          complemento: ''
        }
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingFamilia(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;

    if (name.includes('.')) {
      const [parent, child] = name.split('.');

      // Update the nested object
      const updatedFormData = {
        ...formData,
        [parent]: {
          ...formData[parent as keyof Familia] as Record<string, any>,
          [child]: type === 'number' ? parseFloat(value) || 0 : value
        }
      };

      // If this is an address field, also update the flat structure
      if (parent === 'endereco') {
        // Map endereco fields to the flat structure
        if (child === 'logradouro') updatedFormData.logradouro = value;
        if (child === 'numero') updatedFormData.numero = value;
        if (child === 'bairro') updatedFormData.bairro = value;
        if (child === 'cidade') updatedFormData.municipio = value;
        if (child === 'cep') updatedFormData.cep = value;
        if (child === 'complemento') updatedFormData.complemento = value;
      }

      setFormData(updatedFormData);
    } else {
      setFormData({
        ...formData,
        [name]: type === 'number' ? parseFloat(value) || 0 : value
      });
    }
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setSaving(true);

      // Convert tipoFamilia from display format to backend enum format
      const dataToSubmit = {
        ...formData,
        tipoFamilia: formatTipoFamiliaForBackend(formData.tipoFamilia)
      };

      if (editingFamilia?.id) {
        await assistenciaSocialService.atualizarFamilia(editingFamilia.id, dataToSubmit);
        toast({
          title: 'Sucesso',
          description: 'Família atualizada com sucesso!',
        });
      } else {
        await assistenciaSocialService.criarFamilia(dataToSubmit);
        toast({
          title: 'Sucesso',
          description: 'Família cadastrada com sucesso!',
        });
      }

      handleCloseDialog();
      loadFamilias();
    } catch (error) {
      console.error('Erro ao salvar família:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível salvar a família. Tente novamente mais tarde.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const filteredFamilias = familias.filter(familia =>
      (familia.responsavel.nome && familia.responsavel.nome.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (familia.codigoFamiliar && familia.codigoFamiliar.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading) {
    return (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">Carregando famílias...</span>
        </div>
    );
  }

  return (
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Gestão de Famílias</CardTitle>
              <CardDescription>
                Cadastro e acompanhamento de famílias assistidas.
              </CardDescription>
            </div>
            <Button onClick={() => handleOpenDialog()}>
              <Plus className="mr-2 h-4 w-4" />
              Nova Família
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                  placeholder="Buscar por responsável ou código familiar..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {filteredFamilias.length === 0 ? (
              <div className="text-center p-4">
                <p>Nenhuma família encontrada.</p>
              </div>
          ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Responsável</TableHead>
                      <TableHead>Código Familiar</TableHead>
                      <TableHead>Tipo de Família</TableHead>
                      <TableHead>Nº Dependentes</TableHead>
                      <TableHead>Classe Social</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredFamilias.map((familia) => (
                        <TableRow key={familia.id}>
                          <TableCell>{familia.responsavel?.nome || 'Não informado'}</TableCell>
                          <TableCell>{familia.codigoFamiliar}</TableCell>
                          <TableCell>{formatTipoFamiliaForDisplay(familia.tipoFamilia)}</TableCell>
                          <TableCell>{familia.quantidadeDependentes || 0}</TableCell>
                          <TableCell>{familia.classeSocial}</TableCell>
                          <TableCell>
                            <Button variant="ghost" size="sm" onClick={() => handleOpenDialog(familia)}>
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
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>{editingFamilia ? 'Editar Família' : 'Nova Família'}</DialogTitle>
                <DialogDescription>
                  {editingFamilia
                      ? 'Edite as informações da família selecionada.'
                      : 'Preencha as informações para cadastrar uma nova família.'}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit}>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="responsavel.nome">Nome do Responsável</Label>
                      <Input
                          id="responsavel.nome"
                          name="responsavel.nome"
                          value={formData.responsavel?.nome || ''}
                          onChange={handleInputChange}
                          required
                      />
                      <input
                          type="hidden"
                          id="responsavel.id"
                          name="responsavel.id"
                          value={formData.responsavel?.id || 1}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="codigoFamiliar">Código Familiar</Label>
                      <Input
                          id="codigoFamiliar"
                          name="codigoFamiliar"
                          value={formData.codigoFamiliar}
                          onChange={handleInputChange}
                          required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="tipoFamilia">Tipo de Família</Label>
                      <Select
                          value={formData.tipoFamilia}
                          onValueChange={(value) => handleSelectChange('tipoFamilia', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Contemporânea">Contemporânea</SelectItem>
                          <SelectItem value="Homoafetiva">Homoafetiva</SelectItem>
                          <SelectItem value="Monoparental">Monoparental</SelectItem>
                          <SelectItem value="Quilombola">Quilombola</SelectItem>
                          <SelectItem value="Indígena">Indígena</SelectItem>
                          <SelectItem value="Ribeirinha">Ribeirinha</SelectItem>
                          <SelectItem value="Cigana">Cigana</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="quantidadeDependentes">Nº Dependentes</Label>
                      <Input
                          id="quantidadeDependentes"
                          name="quantidadeDependentes"
                          type="number"
                          min="0"
                          value={formData.quantidadeDependentes || 0}
                          onChange={handleInputChange}
                          required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="classeSocial">Classe Social</Label>
                      <Select
                          value={formData.classeSocial}
                          onValueChange={(value) => handleSelectChange('classeSocial', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="A">A</SelectItem>
                          <SelectItem value="B">B</SelectItem>
                          <SelectItem value="C">C</SelectItem>
                          <SelectItem value="D">D</SelectItem>
                          <SelectItem value="E">E</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Endereço</Label>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="endereco.logradouro">Logradouro</Label>
                        <Input
                            id="endereco.logradouro"
                            name="endereco.logradouro"
                            value={formData.endereco?.logradouro || ''}
                            onChange={handleInputChange}
                            required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="endereco.numero">Número</Label>
                        <Input
                            id="endereco.numero"
                            name="endereco.numero"
                            value={formData.endereco?.numero || ''}
                            onChange={handleInputChange}
                            required
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="endereco.bairro">Bairro</Label>
                        <Input
                            id="endereco.bairro"
                            name="endereco.bairro"
                            value={formData.endereco?.bairro || ''}
                            onChange={handleInputChange}
                            required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="endereco.cep">CEP</Label>
                        <Input
                            id="endereco.cep"
                            name="endereco.cep"
                            value={formData.endereco?.cep || ''}
                            onChange={handleInputChange}
                            required
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-2 col-span-2">
                        <Label htmlFor="endereco.cidade">Cidade</Label>
                        <Input
                            id="endereco.cidade"
                            name="endereco.cidade"
                            value={formData.endereco?.cidade || ''}
                            onChange={handleInputChange}
                            required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="endereco.uf">UF</Label>
                        <Input
                            id="endereco.uf"
                            name="endereco.uf"
                            value={formData.endereco?.uf || ''}
                            onChange={handleInputChange}
                            required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="endereco.complemento">Complemento</Label>
                      <Input
                          id="endereco.complemento"
                          name="endereco.complemento"
                          value={formData.endereco?.complemento || ''}
                          onChange={handleInputChange}
                      />
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={handleCloseDialog}>
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={saving}>
                    {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {editingFamilia ? 'Atualizar' : 'Cadastrar'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
  );
};

export default FamiliasTab;