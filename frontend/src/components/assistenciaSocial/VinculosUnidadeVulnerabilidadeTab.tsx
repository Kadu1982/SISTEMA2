import React, { useEffect, useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2, Plus, Trash2 } from 'lucide-react';
import assistenciaSocialService, { VinculoUnidadeVulnerabilidade } from '@/services/assistenciaSocialService';

interface UnidadeAssistencial {
  id: number;
  nome: string;
  tipoUnidade: string;
}

interface TipoVulnerabilidade {
  id: number;
  nome: string;
  descricao?: string;
}

const VinculosUnidadeVulnerabilidadeTab: React.FC = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [vinculos, setVinculos] = useState<VinculoUnidadeVulnerabilidade[]>([]);
  const [unidades, setUnidades] = useState<UnidadeAssistencial[]>([]);
  const [vulnerabilidades, setVulnerabilidades] = useState<TipoVulnerabilidade[]>([]);
  const [selectedUnidade, setSelectedUnidade] = useState<string>('');
  const [selectedVulnerabilidade, setSelectedVulnerabilidade] = useState<string>('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      // Carregar unidades assistenciais
      const unidadesData = await fetch('/assistencia-social/unidades').then(res => res.json());
      setUnidades(unidadesData);

      // Carregar tipos de vulnerabilidades
      const vulnerabilidadesData = await fetch('/assistencia-social/tipos-vulnerabilidade').then(res => res.json());
      setVulnerabilidades(vulnerabilidadesData);

      // Carregar vínculos existentes
      const vinculosData = await assistenciaSocialService.getVinculos();
      setVinculos(vinculosData);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os dados. Tente novamente mais tarde.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddVinculo = async () => {
    if (!selectedUnidade || !selectedVulnerabilidade) {
      toast({
        title: 'Atenção',
        description: 'Selecione uma unidade assistencial e um tipo de vulnerabilidade.',
        variant: 'destructive',
      });
      return;
    }

    try {
      setSaving(true);
      const unidadeId = parseInt(selectedUnidade);
      const vulnerabilidadeId = parseInt(selectedVulnerabilidade);

      // Verificar se o vínculo já existe
      const vinculoExistente = vinculos.find(
        v => v.unidade.id === unidadeId && v.tipoVulnerabilidade.id === vulnerabilidadeId
      );

      if (vinculoExistente) {
        toast({
          title: 'Atenção',
          description: 'Este vínculo já existe.',
          variant: 'destructive',
        });
        return;
      }

      // Criar novo vínculo
      const novoVinculo = await assistenciaSocialService.criarVinculo(unidadeId, vulnerabilidadeId);

      // Atualizar a lista de vínculos
      setVinculos([...vinculos, novoVinculo]);

      // Limpar seleções
      setSelectedUnidade('');
      setSelectedVulnerabilidade('');

      toast({
        title: 'Sucesso',
        description: 'Vínculo criado com sucesso!',
      });
    } catch (error) {
      console.error('Erro ao criar vínculo:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível criar o vínculo. Tente novamente mais tarde.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveVinculo = async (id: number) => {
    try {
      setSaving(true);
      await assistenciaSocialService.removerVinculo(id);

      // Atualizar a lista de vínculos
      setVinculos(vinculos.filter(v => v.id !== id));

      toast({
        title: 'Sucesso',
        description: 'Vínculo removido com sucesso!',
      });
    } catch (error) {
      console.error('Erro ao remover vínculo:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível remover o vínculo. Tente novamente mais tarde.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Carregando dados...</span>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Vínculos de Unidades Assistenciais com Vulnerabilidades</CardTitle>
        <CardDescription>
          Gerencie quais tipos de vulnerabilidades são atendidas por cada unidade assistencial.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Formulário para adicionar novo vínculo */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div className="space-y-2">
              <Label htmlFor="unidade">Unidade Assistencial</Label>
              <Select
                value={selectedUnidade}
                onValueChange={setSelectedUnidade}
              >
                <SelectTrigger id="unidade">
                  <SelectValue placeholder="Selecione uma unidade" />
                </SelectTrigger>
                <SelectContent>
                  {unidades.map((unidade) => (
                    <SelectItem key={unidade.id} value={unidade.id.toString()}>
                      {unidade.nome} ({unidade.tipoUnidade})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="vulnerabilidade">Tipo de Vulnerabilidade</Label>
              <Select
                value={selectedVulnerabilidade}
                onValueChange={setSelectedVulnerabilidade}
              >
                <SelectTrigger id="vulnerabilidade">
                  <SelectValue placeholder="Selecione uma vulnerabilidade" />
                </SelectTrigger>
                <SelectContent>
                  {vulnerabilidades.map((vulnerabilidade) => (
                    <SelectItem key={vulnerabilidade.id} value={vulnerabilidade.id.toString()}>
                      {vulnerabilidade.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button onClick={handleAddVinculo} disabled={saving} className="flex items-center">
              {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
              Adicionar Vínculo
            </Button>
          </div>

          {/* Tabela de vínculos existentes */}
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Unidade Assistencial</TableHead>
                  <TableHead>Tipo de Unidade</TableHead>
                  <TableHead>Vulnerabilidade</TableHead>
                  <TableHead className="w-[100px]">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {vinculos.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-4">
                      Nenhum vínculo cadastrado.
                    </TableCell>
                  </TableRow>
                ) : (
                  vinculos.map((vinculo) => (
                    <TableRow key={vinculo.id}>
                      <TableCell>{vinculo.unidade.nome}</TableCell>
                      <TableCell>
                        {unidades.find(u => u.id === vinculo.unidade.id)?.tipoUnidade || '-'}
                      </TableCell>
                      <TableCell>{vinculo.tipoVulnerabilidade.nome}</TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveVinculo(vinculo.id!)}
                          disabled={saving}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default VinculosUnidadeVulnerabilidadeTab;
