import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ClipboardList, Search, Filter, Download, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AuditEvent {
  id: number;
  evento: string;
  operador: string;
  entidade: string;
  entidadeId: string;
  descricao: string;
  dataEvento: string;
  ip: string;
  userAgent: string;
}

const AuditoriaConfig: React.FC = () => {
  const [eventos, setEventos] = useState<AuditEvent[]>([]);
  const [carregando, setCarregando] = useState(false);
  const [filtros, setFiltros] = useState({
    evento: '',
    operador: '',
    entidade: '',
    dataInicio: '',
    dataFim: ''
  });
  const { toast } = useToast();

  useEffect(() => {
    carregarEventos();
  }, []);

  const carregarEventos = async () => {
    try {
      setCarregando(true);
      // Como o endpoint de auditoria pode não estar implementado ainda,
      // vamos simular alguns dados de exemplo
      const eventosSimulados: AuditEvent[] = [
        {
          id: 1,
          evento: 'LOGIN',
          operador: 'admin.master',
          entidade: 'Operador',
          entidadeId: '5',
          descricao: 'Login realizado com sucesso',
          dataEvento: new Date().toISOString(),
          ip: '192.168.1.100',
          userAgent: 'Mozilla/5.0...'
        },
        {
          id: 2,
          evento: 'CONFIGURACAO_ALTERADA',
          operador: 'admin.master',
          entidade: 'Configuracao',
          entidadeId: 'sistema.nome',
          descricao: 'Configuração do sistema alterada',
          dataEvento: new Date(Date.now() - 3600000).toISOString(),
          ip: '192.168.1.100',
          userAgent: 'Mozilla/5.0...'
        }
      ];

      setEventos(eventosSimulados);

      toast({
        title: 'Eventos carregados',
        description: `${eventosSimulados.length} eventos de auditoria encontrados`,
        variant: 'default'
      });
    } catch (error) {
      console.error('Erro ao carregar eventos:', error);
      toast({
        title: 'Erro',
        description: 'Falha ao carregar eventos de auditoria',
        variant: 'destructive'
      });
    } finally {
      setCarregando(false);
    }
  };

  const filtrarEventos = () => {
    // Implementar filtros quando o backend estiver pronto
    carregarEventos();
  };

  const exportarLogs = () => {
    const csv = eventos.map(evento =>
      `${evento.dataEvento},${evento.evento},${evento.operador},${evento.entidade},${evento.descricao}`
    ).join('\n');

    const blob = new Blob([`Data,Evento,Operador,Entidade,Descrição\n${csv}`], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `auditoria-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);

    toast({
      title: 'Exportação realizada',
      description: 'Logs de auditoria exportados com sucesso',
      variant: 'default'
    });
  };

  const getEventoBadgeVariant = (evento: string) => {
    switch (evento) {
      case 'LOGIN': return 'default';
      case 'LOGOUT': return 'secondary';
      case 'CONFIGURACAO_ALTERADA': return 'destructive';
      case 'INCLUSAO': return 'outline';
      case 'ALTERACAO': return 'secondary';
      case 'EXCLUSAO': return 'destructive';
      default: return 'default';
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl">
            <ClipboardList className="h-5 w-5" /> Auditoria do Sistema
          </CardTitle>
          <CardDescription>
            Visualize e filtre logs de ações realizadas no sistema (login, inclusão, alteração, exclusão, consulta, etc.).
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Filtros */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Filter className="h-4 w-4" />
                Filtros
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                <div className="space-y-2">
                  <Label>Tipo de Evento</Label>
                  <Select value={filtros.evento} onValueChange={(value) => setFiltros(prev => ({ ...prev, evento: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Todos os eventos" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Todos</SelectItem>
                      <SelectItem value="LOGIN">Login</SelectItem>
                      <SelectItem value="LOGOUT">Logout</SelectItem>
                      <SelectItem value="INCLUSAO">Inclusão</SelectItem>
                      <SelectItem value="ALTERACAO">Alteração</SelectItem>
                      <SelectItem value="EXCLUSAO">Exclusão</SelectItem>
                      <SelectItem value="CONSULTA">Consulta</SelectItem>
                      <SelectItem value="CONFIGURACAO_ALTERADA">Configuração</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Operador</Label>
                  <Input
                    value={filtros.operador}
                    onChange={(e) => setFiltros(prev => ({ ...prev, operador: e.target.value }))}
                    placeholder="Login do operador"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Entidade</Label>
                  <Input
                    value={filtros.entidade}
                    onChange={(e) => setFiltros(prev => ({ ...prev, entidade: e.target.value }))}
                    placeholder="Nome da entidade"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Data Início</Label>
                  <Input
                    type="date"
                    value={filtros.dataInicio}
                    onChange={(e) => setFiltros(prev => ({ ...prev, dataInicio: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Data Fim</Label>
                  <Input
                    type="date"
                    value={filtros.dataFim}
                    onChange={(e) => setFiltros(prev => ({ ...prev, dataFim: e.target.value }))}
                  />
                </div>
              </div>

              <div className="flex gap-2 mt-4">
                <Button onClick={filtrarEventos} disabled={carregando} className="flex items-center gap-2">
                  <Search className="h-4 w-4" />
                  Filtrar
                </Button>
                <Button variant="outline" onClick={carregarEventos} disabled={carregando} className="flex items-center gap-2">
                  <RefreshCw className={`h-4 w-4 ${carregando ? 'animate-spin' : ''}`} />
                  Atualizar
                </Button>
                <Button variant="outline" onClick={exportarLogs} disabled={carregando || eventos.length === 0} className="flex items-center gap-2">
                  <Download className="h-4 w-4" />
                  Exportar CSV
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Tabela de Eventos */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                Eventos de Auditoria ({eventos.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {carregando ? (
                <div className="text-center py-8">
                  <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
                  <p>Carregando eventos...</p>
                </div>
              ) : eventos.length === 0 ? (
                <div className="text-center py-8">
                  <ClipboardList className="h-8 w-8 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">Nenhum evento de auditoria encontrado</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Data/Hora</TableHead>
                      <TableHead>Evento</TableHead>
                      <TableHead>Operador</TableHead>
                      <TableHead>Entidade</TableHead>
                      <TableHead>Descrição</TableHead>
                      <TableHead>IP</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {eventos.map((evento) => (
                      <TableRow key={evento.id}>
                        <TableCell className="font-mono text-sm">
                          {new Date(evento.dataEvento).toLocaleString('pt-BR')}
                        </TableCell>
                        <TableCell>
                          <Badge variant={getEventoBadgeVariant(evento.evento)}>
                            {evento.evento}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-medium">
                          {evento.operador}
                        </TableCell>
                        <TableCell>
                          {evento.entidade}
                          {evento.entidadeId && (
                            <span className="text-muted-foreground ml-1">
                              #{evento.entidadeId}
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="max-w-xs truncate">
                          {evento.descricao}
                        </TableCell>
                        <TableCell className="font-mono text-sm">
                          {evento.ip}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
};

export default AuditoriaConfig;
