import React, { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Users, Settings, Plus, Filter, Lock, Unlock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { BaseCadastroService, Agenda, Profissional, UnidadeSaude, ConfiguracoesAgenda } from "@/services/baseCadastro";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

// Instancia o serviço fora do componente para garantir que seja um singleton
const baseCadastro = BaseCadastroService.getInstance();

export const GestaoAgendas = () => {
  const { toast } = useToast();
  const [agendas, setAgendas] = useState<Agenda[]>([]);
  const [profissionais, setProfissionais] = useState<Profissional[]>([]);
  const [unidades, setUnidades] = useState<UnidadeSaude[]>([]);
  const [filtroEspecialidade, setFiltroEspecialidade] = useState("");
  const [filtroUnidade, setFiltroUnidade] = useState("");
  const [isNovaAgendaDialogOpen, setIsNovaAgendaDialogOpen] = useState(false);
  const [config, setConfig] = useState<Partial<ConfiguracoesAgenda>>({});

  // Carrega todos os dados iniciais do serviço mockado
  const carregarDados = () => {
    const todasAgendas = baseCadastro.buscarTodasAgendas();
    // Ordena as agendas pela data de criação, da mais recente para a mais antiga
    setAgendas([...todasAgendas].sort((a, b) => new Date(b.criadaEm).getTime() - new Date(a.criadaEm).getTime()));
    setProfissionais(baseCadastro.buscarTodosProfissionais());
    setUnidades(baseCadastro.buscarTodasUnidades());
    setConfig(baseCadastro.buscarConfiguracoes());
  };

  useEffect(() => {
    carregarDados();
  }, []);

  const agendasFiltradas = useMemo(() => agendas.filter((agenda) => {
    const especialidadeMatch = !filtroEspecialidade || agenda.especialidade === filtroEspecialidade;
    const unidadeMatch = !filtroUnidade || agenda.unidadeId === filtroUnidade;
    return especialidadeMatch && unidadeMatch;
  }), [agendas, filtroEspecialidade, filtroUnidade]);

  const especialidadesUnicas = useMemo(() => Array.from(new Set(profissionais.flatMap(p => p.especialidades))), [profissionais]);

  const handleCriarNovaAgenda = (event: React.FormEvent) => {
    event.preventDefault();
    const formData = new FormData(event.target as HTMLFormElement);
    const dataString = formData.get("data") as string;

    // Adiciona T12:00:00Z para evitar problemas de fuso horário ao criar a data
    const data = new Date(dataString + "T12:00:00Z");

    // Validação para não criar agendas no passado
    if (data < new Date()) {
      toast({ title: "Data Inválida", description: "Não é possível criar agendas para datas passadas.", variant: "destructive" });
      return;
    }

    const novaAgenda = {
      profissionalId: formData.get("profissional") as string,
      unidadeId: formData.get("unidade") as string,
      especialidade: formData.get("especialidade") as string,
      data,
      cotaTotal: Number(formData.get("cotaTotal")),
    };

    if (!novaAgenda.profissionalId || !novaAgenda.unidadeId || !novaAgenda.especialidade || !dataString || isNaN(novaAgenda.cotaTotal) || novaAgenda.cotaTotal <= 0) {
      toast({ title: "Erro de Validação", description: "Todos os campos são obrigatórios e a cota deve ser maior que zero.", variant: "destructive" });
      return;
    }

    baseCadastro.criarAgenda(novaAgenda);
    toast({ title: "Agenda criada com sucesso!", description: "A nova agenda já está disponível no sistema." });
    setIsNovaAgendaDialogOpen(false);
    carregarDados(); // Recarrega os dados para exibir a nova agenda
  };

  const handleBloquearAgenda = (agendaId: string) => {
    const agenda = baseCadastro.buscarAgenda(agendaId);
    if (agenda) {
      baseCadastro.bloquearAgenda(agendaId, !agenda.bloqueada, !agenda.bloqueada ? "Bloqueio manual" : undefined);
      toast({ title: !agenda.bloqueada ? "Agenda bloqueada" : "Agenda desbloqueada", description: `A agenda foi ${!agenda.bloqueada ? "bloqueada" : "liberada"} com sucesso.` });
      carregarDados(); // Recarrega os dados para refletir a mudança
    }
  };

  const handleSalvarConfiguracoes = () => {
    // Validação básica dos campos de configuração
    if (
        config.antecedenciaMinimaDias === undefined || config.antecedenciaMinimaDias < 0 ||
        config.antecedenciaMaximaDias === undefined || config.antecedenciaMaximaDias <= config.antecedenciaMinimaDias ||
        config.cancelamentoMinimoHoras === undefined || config.cancelamentoMinimoHoras < 0 ||
        config.maximoFaltas === undefined || config.maximoFaltas < 0
    ) {
      toast({ title: "Configurações Inválidas", description: "Verifique os valores. A antecedência máxima deve ser maior que a mínima e os números não podem ser negativos.", variant: "destructive" });
      return;
    }

    baseCadastro.salvarConfiguracoes(config as ConfiguracoesAgenda);
    toast({ title: "Configurações salvas!", description: "Os parâmetros globais do sistema foram atualizados." });
  };

  const handleConfigChange = (field: keyof ConfiguracoesAgenda, value: string | number | boolean) => {
    setConfig(prev => ({ ...prev, [field]: value }));
  };

  const getStatusBadge = (agenda: Agenda) => {
    if (agenda.bloqueada) return <Badge variant="destructive">Bloqueada</Badge>;
    if (new Date(agenda.data) < new Date()) return <Badge variant="secondary">Encerrada</Badge>;
    return <Badge variant="default" className="bg-green-600">Ativa</Badge>;
  };

  const calcularOcupacao = (agenda: Agenda) => {
    if (agenda.cotaTotal === 0) return 0;
    const ocupacao = (agenda.cotaUtilizada / agenda.cotaTotal) * 100;
    return Math.round(ocupacao);
  };

  const getNome = (id: string, lista: (Profissional | UnidadeSaude)[]) => lista.find(item => item.id === id)?.nome || "Não encontrado";

  return (
      <div className="space-y-6">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Gestão de Agendas</h1>
            <p className="text-muted-foreground">Crie, visualize e gerencie as agendas dos profissionais.</p>
          </div>
          <Dialog open={isNovaAgendaDialogOpen} onOpenChange={setIsNovaAgendaDialogOpen}>
            <DialogTrigger asChild>
              <Button><Plus className="mr-2 h-4 w-4" /> Nova Agenda</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[525px]">
              <DialogHeader>
                <DialogTitle>Criar Nova Agenda</DialogTitle>
                <DialogDescription>Preencha os detalhes para criar uma nova grade de horários.</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCriarNovaAgenda} className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="unidade">Unidade de Saúde</Label>
                  <Select name="unidade" required>{/* ... (conteúdo do select) ... */}</Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="profissional">Profissional</Label>
                  <Select name="profissional" required>{/* ... (conteúdo do select) ... */}</Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="especialidade">Especialidade</Label>
                  <Select name="especialidade" required>{/* ... (conteúdo do select) ... */}</Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="data">Data</Label>
                    <Input id="data" name="data" type="date" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cotaTotal">Cota Total</Label>
                    <Input id="cotaTotal" name="cotaTotal" type="number" placeholder="Ex: 20" required min="1" />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit" className="w-full">Criar Agenda</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </header>

        <Tabs defaultValue="visao-geral" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="visao-geral"><Calendar className="mr-2 h-4 w-4" /> Visão Geral</TabsTrigger>
            <TabsTrigger value="configuracoes"><Settings className="mr-2 h-4 w-4" /> Configurações</TabsTrigger>
          </TabsList>

          <TabsContent value="visao-geral" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Agendas Criadas</CardTitle>
                <CardDescription>Filtre e gerencie as agendas existentes.</CardDescription>
                <div className="flex items-center space-x-4 pt-4">
                  <Filter className="h-5 w-5 text-muted-foreground" />
                  <Select value={filtroUnidade} onValueChange={setFiltroUnidade}>
                    <SelectTrigger className="w-[240px]"><SelectValue placeholder="Filtrar por Unidade" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Todas as Unidades</SelectItem>
                      {unidades.map(u => <SelectItem key={u.id} value={u.id}>{u.nome}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <Select value={filtroEspecialidade} onValueChange={setFiltroEspecialidade}>
                    <SelectTrigger className="w-[240px]"><SelectValue placeholder="Filtrar por Especialidade" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Todas as Especialidades</SelectItem>
                      {especialidadesUnicas.map(e => <SelectItem key={e} value={e}>{e}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {agendasFiltradas.length > 0 ? agendasFiltradas.map(agenda => (
                    <Card key={agenda.id} className="flex flex-col md:flex-row items-start md:items-center justify-between p-4 gap-4">
                      <div className="flex-1 space-y-1">
                        <p className="font-semibold">{getNome(agenda.profissionalId, profissionais)} - {agenda.especialidade}</p>
                        <p className="text-sm text-muted-foreground">{getNome(agenda.unidadeId, unidades)}</p>
                        <p className="text-sm text-muted-foreground">
                          <Calendar className="inline-block mr-1 h-4 w-4" />
                          {new Date(agenda.data).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}
                        </p>
                      </div>
                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex flex-col items-center">
                          <Users className="h-5 w-5" />
                          <span className="font-bold">{agenda.cotaUtilizada} / {agenda.cotaTotal}</span>
                          <span className="text-xs text-muted-foreground">Ocupação</span>
                        </div>
                        <div className="w-24">
                          <div className="relative h-2 bg-gray-200 rounded-full">
                            <div className="absolute h-2 bg-blue-500 rounded-full" style={{ width: `${calcularOcupacao(agenda)}%` }}></div>
                          </div>
                          <p className="text-center text-xs mt-1">{calcularOcupacao(agenda)}%</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(agenda)}
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="ghost" size="icon" onClick={() => handleBloquearAgenda(agenda.id)} disabled={new Date(agenda.data) < new Date()}>
                                {agenda.bloqueada ? <Unlock className="h-4 w-4" /> : <Lock className="h-4 w-4 text-red-500" />}
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>{agenda.bloqueada ? "Desbloquear Agenda" : "Bloquear Agenda"}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </Card>
                )) : (
                    <div className="text-center py-10">
                      <p className="text-muted-foreground">Nenhuma agenda encontrada com os filtros selecionados.</p>
                    </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="configuracoes" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Parâmetros Gerais</CardTitle>
                <CardDescription>Defina as regras de agendamento e notificação para todo o sistema.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="antecedenciaMinima">Antecedência Mínima (dias)</Label>
                    <Input id="antecedenciaMinima" type="number" value={config.antecedenciaMinimaDias ?? ''} onChange={e => handleConfigChange('antecedenciaMinimaDias', parseInt(e.target.value))} />
                    <p className="text-xs text-muted-foreground">O quão perto da data atual um agendamento pode ser feito.</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="antecedenciaMaxima">Antecedência Máxima (dias)</Label>
                    <Input id="antecedenciaMaxima" type="number" value={config.antecedenciaMaximaDias ?? ''} onChange={e => handleConfigChange('antecedenciaMaximaDias', parseInt(e.target.value))} />
                    <p className="text-xs text-muted-foreground">O quão no futuro um agendamento pode ser marcado.</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cancelamentoMinimo">Cancelamento Mínimo (horas)</Label>
                    <Input id="cancelamentoMinimo" type="number" value={config.cancelamentoMinimoHoras ?? ''} onChange={e => handleConfigChange('cancelamentoMinimoHoras', parseInt(e.target.value))} />
                    <p className="text-xs text-muted-foreground">Prazo mínimo antes do horário para o paciente poder cancelar.</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="maximoFaltas">Máximo de Faltas (bloqueio)</Label>
                    <Input id="maximoFaltas" type="number" value={config.maximoFaltas ?? ''} onChange={e => handleConfigChange('maximoFaltas', parseInt(e.target.value))} />
                    <p className="text-xs text-muted-foreground">Número de faltas que bloqueia o paciente de agendar online.</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <h3 className="font-semibold">Notificações</h3>
                  <div className="flex items-center justify-between rounded-lg border p-3">
                    <Label htmlFor="lembrete24h">Enviar lembrete 24h antes</Label>
                    <Switch id="lembrete24h" checked={config.enviarLembrete24h} onCheckedChange={(checked: boolean) => handleConfigChange('enviarLembrete24h', checked)} />
                  </div>
                  <div className="flex items-center justify-between rounded-lg border p-3">
                    <Label htmlFor="lembrete2h">Enviar lembrete 2h antes</Label>
                    <Switch id="lembrete2h" checked={config.enviarLembrete2h} onCheckedChange={(checked: boolean) => handleConfigChange('enviarLembrete2h', checked)} />
                  </div>
                  <div className="flex items-center justify-between rounded-lg border p-3">
                    <Label htmlFor="notificarWhatsApp">Notificar por WhatsApp</Label>
                    <Switch id="notificarWhatsApp" checked={config.notificarPorWhatsApp} onCheckedChange={(checked: boolean) => handleConfigChange('notificarPorWhatsApp', checked)} />
                  </div>
                </div>
              </CardContent>
              <div className="p-6 pt-0">
                <Button onClick={handleSalvarConfiguracoes}>Salvar Configurações</Button>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
  );
};