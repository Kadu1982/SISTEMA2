import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Clock,
  Users,
  AlertTriangle,
  Phone,
  Calendar,
  ArrowUp,
  ArrowDown,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { baseCadastro, ListaEspera, Paciente } from "@/services/baseCadastro";
import { agendamentoIA } from "@/services/agendamentoIA";

export const ListaEsperaInteligente = () => {
  const { toast } = useToast();
  const [listaEspera, setListaEspera] = useState<ListaEspera[]>([]);
  const [pacientes, setPacientes] = useState<Map<string, Paciente>>(new Map());
  const [especialidadeSelecionada, setEspecialidadeSelecionada] =
    useState<string>("");

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = () => {
    const dados = baseCadastro.buscarDadosCompletos();
    setListaEspera(dados.listaEspera);

    // Criar mapa de pacientes para acesso rápido
    const mapaPacientes = new Map<string, Paciente>();
    dados.pacientes.forEach((p) => {
      if (p.id !== undefined && p.id !== null) {
        mapaPacientes.set(String(p.id), p);
      }
    });
    setPacientes(mapaPacientes);
  };

  const especialidades = Array.from(
    new Set(listaEspera.map((item) => item.especialidade)),
  );

  const listaFiltrada = especialidadeSelecionada
    ? listaEspera.filter(
        (item) => item.especialidade === especialidadeSelecionada,
      )
    : listaEspera;

  const processarListaAutomaticamente = async () => {
    if (!especialidadeSelecionada) {
      toast({
        title: "Selecione uma especialidade",
        description:
          "Escolha uma especialidade para processar a lista de espera",
        variant: "destructive",
      });
      return;
    }

    try {
      agendamentoIA.processarListaEspera(especialidadeSelecionada);

      toast({
        title: "Lista processada com sucesso",
        description:
          "Agendamentos automáticos foram criados conforme disponibilidade",
      });

      carregarDados();
    } catch (error) {
      toast({
        title: "Erro ao processar lista",
        description:
          "Não foi possível processar a lista de espera automaticamente",
        variant: "destructive",
      });
    }
  };

  const alterarPrioridade = (itemId: string, novaPrioridade: number) => {
    // Simular alteração de prioridade
    const item = listaEspera.find((l) => l.id === itemId);
    if (item) {
      item.prioridade = Math.max(1, Math.min(10, novaPrioridade));

      toast({
        title: "Prioridade alterada",
        description: `Nova prioridade: ${item.prioridade}`,
      });

      carregarDados();
    }
  };

  const contatarPaciente = (itemId: string) => {
    const item = listaEspera.find((l) => l.id === itemId);
    if (item) {
      item.tentativasContato++;
      item.ultimoContato = new Date();

      toast({
        title: "Contato registrado",
        description: "Tentativa de contato registrada no sistema",
      });

      carregarDados();
    }
  };

  const marcarComoAgendado = (itemId: string) => {
    const item = listaEspera.find((l) => l.id === itemId);
    if (item) {
      item.statusAtual = "agendado";

      toast({
        title: "Status atualizado",
        description: "Paciente marcado como agendado",
      });

      carregarDados();
    }
  };

  const marcarComoDesistente = (itemId: string) => {
    const item = listaEspera.find((l) => l.id === itemId);
    if (item) {
      item.statusAtual = "desistiu";

      toast({
        title: "Status atualizado",
        description: "Paciente marcado como desistente",
      });

      carregarDados();
    }
  };

  const getPrioridadeBadge = (prioridade: number) => {
    if (prioridade <= 3) {
      return <Badge variant="destructive">Alta</Badge>;
    } else if (prioridade <= 6) {
      return <Badge className="bg-amber-100 text-amber-800">Média</Badge>;
    } else {
      return <Badge variant="secondary">Baixa</Badge>;
    }
  };

  const getStatusBadge = (status: ListaEspera["statusAtual"]) => {
    const variants = {
      aguardando: "bg-blue-100 text-blue-800",
      contatado: "bg-amber-100 text-amber-800",
      agendado: "bg-green-100 text-green-800",
      desistiu: "bg-red-100 text-red-800",
    };

    const labels = {
      aguardando: "Aguardando",
      contatado: "Contatado",
      agendado: "Agendado",
      desistiu: "Desistiu",
    };

    return <Badge className={variants[status]}>{labels[status]}</Badge>;
  };

  const calcularTempoEspera = (dataInclusao: Date) => {
    const agora = new Date();
    const diffTime = Math.abs(agora.getTime() - dataInclusao.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return "1 dia";
    if (diffDays < 30) return `${diffDays} dias`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} meses`;
    return `${Math.floor(diffDays / 365)} anos`;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Lista de Espera Inteligente</h2>
          <p className="text-muted-foreground">
            Gerencie a lista de espera com priorização automática e inteligência
            artificial
          </p>
        </div>
        <Button
          onClick={processarListaAutomaticamente}
          disabled={!especialidadeSelecionada}
        >
          Processar Lista Automaticamente
        </Button>
      </div>

      <Tabs defaultValue="por-especialidade" className="w-full">
        <TabsList className="grid grid-cols-3">
          <TabsTrigger value="por-especialidade">Por Especialidade</TabsTrigger>
          <TabsTrigger value="prioritarios">Prioritários</TabsTrigger>
          <TabsTrigger value="estatisticas">Estatísticas</TabsTrigger>
        </TabsList>

        <TabsContent value="por-especialidade" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Filtrar por Especialidade</CardTitle>
              <CardDescription>
                Selecione uma especialidade para visualizar a lista de espera
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                <Button
                  variant={
                    especialidadeSelecionada === "" ? "default" : "outline"
                  }
                  onClick={() => setEspecialidadeSelecionada("")}
                  className="justify-start"
                >
                  Todas ({listaEspera.length})
                </Button>
                {especialidades.map((esp) => {
                  const count = listaEspera.filter(
                    (item) => item.especialidade === esp,
                  ).length;
                  return (
                    <Button
                      key={esp}
                      variant={
                        especialidadeSelecionada === esp ? "default" : "outline"
                      }
                      onClick={() => setEspecialidadeSelecionada(esp)}
                      className="justify-start"
                    >
                      {esp} ({count})
                    </Button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>
                Lista de Espera -{" "}
                {especialidadeSelecionada || "Todas as Especialidades"}
              </CardTitle>
              <CardDescription>
                {listaFiltrada.length} pacientes na lista • Ordenado por
                prioridade
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {listaFiltrada
                  .sort((a, b) => a.prioridade - b.prioridade)
                  .map((item, index) => {
                    const paciente = pacientes.get(String(item.pacienteId));
                    if (!paciente) return null;

                    return (
                      <Card key={item.id} className="border">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className="flex items-center justify-center w-8 h-8 bg-primary/10 rounded-full">
                                <span className="text-sm font-bold">
                                  #{index + 1}
                                </span>
                              </div>

                              <div>
                                <h3 className="font-medium">{paciente.nome}</h3>
                                <p className="text-sm text-muted-foreground">
                                  SUS: {paciente.cartaoSus} • CPF:{" "}
                                  {paciente.cpf}
                                </p>
                                <div className="flex items-center gap-2 mt-1">
                                  <span className="text-xs">
                                    Especialidade: {item.especialidade}
                                  </span>
                                  {item.unidadePreferida && (
                                    <span className="text-xs">
                                      • Unidade preferida:{" "}
                                      {item.unidadePreferida}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-3">
                              <div className="text-right">
                                <div className="flex items-center gap-2 mb-1">
                                  {getPrioridadeBadge(item.prioridade)}
                                  {getStatusBadge(item.statusAtual)}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                  <Clock className="h-3 w-3 inline mr-1" />
                                  {calcularTempoEspera(item.dataInclusao)} na
                                  lista
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  <Phone className="h-3 w-3 inline mr-1" />
                                  {item.tentativasContato} tentativas de contato
                                </p>
                              </div>

                              <div className="flex flex-col gap-1">
                                <div className="flex gap-1">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() =>
                                      alterarPrioridade(
                                        item.id,
                                        item.prioridade - 1,
                                      )
                                    }
                                    disabled={item.prioridade <= 1}
                                  >
                                    <ArrowUp className="h-3 w-3" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() =>
                                      alterarPrioridade(
                                        item.id,
                                        item.prioridade + 1,
                                      )
                                    }
                                    disabled={item.prioridade >= 10}
                                  >
                                    <ArrowDown className="h-3 w-3" />
                                  </Button>
                                </div>
                                <div className="flex gap-1">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => contatarPaciente(item.id)}
                                  >
                                    <Phone className="h-3 w-3" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => marcarComoAgendado(item.id)}
                                  >
                                    <CheckCircle className="h-3 w-3" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() =>
                                      marcarComoDesistente(item.id)
                                    }
                                  >
                                    <XCircle className="h-3 w-3" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}

                {listaFiltrada.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    Nenhum paciente na lista de espera para os filtros
                    selecionados
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="prioritarios">
          <Card>
            <CardHeader>
              <CardTitle>Pacientes Prioritários</CardTitle>
              <CardDescription>
                Pacientes com prioridade alta que requerem atenção imediata
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {listaEspera
                  .filter(
                    (item) =>
                      item.prioridade <= 3 && item.statusAtual === "aguardando",
                  )
                  .sort((a, b) => a.prioridade - b.prioridade)
                  .map((item) => {
                    const paciente = pacientes.get(String(item.pacienteId));
                    if (!paciente) return null;

                    return (
                      <Card
                        key={item.id}
                        className="border-l-4 border-l-red-500"
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className="font-medium flex items-center gap-2">
                                <AlertTriangle className="h-4 w-4 text-red-500" />
                                {paciente.nome}
                              </h3>
                              <p className="text-sm text-muted-foreground">
                                {item.especialidade} •{" "}
                                {calcularTempoEspera(item.dataInclusao)} na
                                lista
                              </p>
                              <div className="flex items-center gap-2 mt-1">
                                {getPrioridadeBadge(item.prioridade)}
                                <span className="text-xs">
                                  Critérios:{" "}
                                  {item.criteriosPriorizacao.join(", ")}
                                </span>
                              </div>
                            </div>
                            <Button onClick={() => contatarPaciente(item.id)}>
                              Contatar Agora
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="estatisticas">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Tempo Médio de Espera</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">45 dias</div>
                <p className="text-sm text-muted-foreground">
                  Todas as especialidades
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Taxa de Conversão</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">78%</div>
                <p className="text-sm text-muted-foreground">
                  Lista → Agendamento
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Pacientes Críticos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-red-600">
                  {listaEspera.filter((item) => item.prioridade <= 3).length}
                </div>
                <p className="text-sm text-muted-foreground">
                  Requerem atenção imediata
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
