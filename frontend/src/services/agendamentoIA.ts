import {
  Paciente,
  Agendamento,
  ListaEspera,
  Agenda,
  baseCadastro,
} from "./baseCadastro";

export interface PredicaoAgendamento {
  probabilidadeFalta: number;
  prioridadeSugerida: number;
  melhorHorario: string;
  recomendacoes: string[];
}

export interface AnaliseAgendamento {
  ocupacaoMedia: number;
  horariosComMaiorFalta: string[];
  especialidadesComMaiorDemanda: string[];
  sugestoesMelhoria: string[];
}

export class AgendamentoIAService {
  private static instance: AgendamentoIAService;

  public static getInstance(): AgendamentoIAService {
    if (!AgendamentoIAService.instance) {
      AgendamentoIAService.instance = new AgendamentoIAService();
    }
    return AgendamentoIAService.instance;
  }

  // Priorização inteligente baseada em critérios clínicos e sociais
  calcularPrioridade(paciente: Paciente, tipoConsulta: string): number {
    let prioridade = 5;

    const idade = this.calcularIdade(paciente.dataNascimento);
    if (idade >= 65) prioridade += 2;
    if (idade <= 2) prioridade += 3;
    if (idade >= 60) prioridade += 1;

    const condicoesCronicas =
      paciente.dadosClinicos?.condicoesCronicas ?? paciente.condicoesCronicas ?? [];
    if (condicoesCronicas.length) {
      prioridade += condicoesCronicas.length * 0.5;
    }

    const consultasUrgentes = ["cardiologia", "oncologia", "neurologia"];
    if (consultasUrgentes.includes(tipoConsulta.toLowerCase())) {
      prioridade += 2;
    }

    const historico =
      typeof paciente.id === "number"
        ? baseCadastro.buscarAgendamentosPorPaciente(paciente.id)
        : [];
    const faltas = historico.filter((a) => a.status === "faltou").length;
    const total = historico.length;
    if (total > 0) {
      const taxaFalta = faltas / total;
      if (taxaFalta > 0.3) prioridade -= 2;
      if (taxaFalta > 0.5) prioridade -= 3;
    }

    return Math.max(1, Math.min(10, Math.round(prioridade)));
  }

  // Predição de faltas usando padrões históricos
  preverProbabilidadeFalta(
    paciente: Paciente,
    data: Date,
    hora: string,
  ): number {
    const historico =
      typeof paciente.id === "number"
        ? baseCadastro.buscarAgendamentosPorPaciente(paciente.id)
        : [];

    if (historico.length === 0) return 0.15;

    const faltas = historico.filter((a) => a.status === "faltou");
    let probabilidade = faltas.length / historico.length;

    const diaSemana = data.getDay();
    const faltasPorDia = faltas.filter((f) => f.data.getDay() === diaSemana);
    if (faltasPorDia.length > 0) {
      probabilidade += 0.1;
    }

    const horaNum = parseInt(hora.split(":")[0], 10);
    if (horaNum < 8 || horaNum > 16) {
      probabilidade += 0.05;
    }

    const idade = this.calcularIdade(paciente.dataNascimento);
    if (idade < 25) probabilidade += 0.05;
    if (idade > 65) probabilidade -= 0.05;

    return Math.max(0, Math.min(1, probabilidade));
  }

  // Sugerir melhor horário baseado em padrões
  sugerirMelhorHorario(
    paciente: Paciente,
    horariosDisponiveis: string[],
  ): string {
    const historico =
      typeof paciente.id === "number"
        ? baseCadastro.buscarAgendamentosPorPaciente(paciente.id)
        : [];

    if (historico.length === 0) {
      const horariosPreferenciais = ["09:00", "10:00", "14:00", "15:00"];
      for (const horario of horariosPreferenciais) {
        if (horariosDisponiveis.includes(horario)) {
          return horario;
        }
      }
      return horariosDisponiveis[0];
    }

    const horariosRealizados = historico
      .filter((a) => a.status === "realizado")
      .map((a) => a.hora);

    for (const horario of horariosDisponiveis) {
      if (horariosRealizados.includes(horario)) {
        return horario;
      }
    }

    return horariosDisponiveis[0];
  }

  // Reagendamento automático em caso de cancelamento
  async reagendarAutomatico(
    agendamentoCancelado: Agendamento,
  ): Promise<string | null> {
    const paciente = baseCadastro.buscarPaciente(
      agendamentoCancelado.pacienteId,
    );
    if (!paciente) return null;

    const agenda = baseCadastro.buscarAgenda(agendamentoCancelado.agendaId);
    if (!agenda) return null;

    // Buscar próximas agendas disponíveis da mesma especialidade
    const dataInicio = new Date();
    const dataFim = new Date();
    dataFim.setDate(dataFim.getDate() + 30); // Próximos 30 dias

    const agendasDisponiveis = Array.from({ length: 30 }, (_, i) => {
      const data = new Date();
      data.setDate(data.getDate() + i + 1);
      return baseCadastro.buscarAgendasDisponiveis(agenda.especialidade, data);
    }).flat();

    if (agendasDisponiveis.length === 0) return null;

    // Encontrar melhor opção
    const melhorAgenda = agendasDisponiveis[0];
    const horariosDisponiveis = melhorAgenda.horarios
      .filter((h) => h.disponivel)
      .map((h) => h.hora);

    if (horariosDisponiveis.length === 0) return null;

    const melhorHorario = this.sugerirMelhorHorario(
      paciente,
      horariosDisponiveis,
    );

    // Criar novo recepcao
    const novoAgendamento: Agendamento = {
      id: `agend_${Date.now()}`,
      pacienteId: paciente.id,
      agendaId: melhorAgenda.id,
      data: melhorAgenda.data,
      hora: melhorHorario,
      tipo: agendamentoCancelado.tipo,
      status: "agendado",
      prioridade: agendamentoCancelado.prioridade,
      observacoes: `Reagendado automaticamente - cancelamento anterior`,
      codigoConfirmacao: this.gerarCodigoConfirmacao(),
      notificacaoEnviada: false,
      criadoEm: new Date(),
      atualizadoEm: new Date(),
    };

    baseCadastro.adicionarAgendamento(novoAgendamento);
    return novoAgendamento.id;
  }

  // Análise preditiva de demanda
  analisarDemandaEspecialidade(
    especialidade: string,
    dias: number = 30,
  ): AnaliseAgendamento {
    const dataInicio = new Date();
    dataInicio.setDate(dataInicio.getDate() - dias);

    const agendamentos = Array.from(
      baseCadastro.buscarDadosCompletos().agendamentos,
    ).filter((a) => a.criadoEm >= dataInicio);

    const agendas = Array.from(
      baseCadastro.buscarDadosCompletos().agendas,
    ).filter((a) => a.especialidade === especialidade);

    // Calcular ocupação média
    const totalSlots = agendas.reduce((sum, a) => sum + a.cotaTotal, 0);
    const slotsUtilizados = agendas.reduce(
      (sum, a) => sum + a.cotaUtilizada,
      0,
    );
    const ocupacaoMedia = totalSlots > 0 ? slotsUtilizados / totalSlots : 0;

    // Analisar horários com maior falta
    const agendamentosPorHora: {
      [hora: string]: { total: number; faltas: number };
    } = {};

    agendamentos.forEach((a) => {
      if (!agendamentosPorHora[a.hora]) {
        agendamentosPorHora[a.hora] = { total: 0, faltas: 0 };
      }
      agendamentosPorHora[a.hora].total++;
      if (a.status === "faltou") {
        agendamentosPorHora[a.hora].faltas++;
      }
    });

    const horariosComMaiorFalta = Object.entries(agendamentosPorHora)
      .map(([hora, dados]) => ({
        hora,
        taxaFalta: dados.total > 0 ? dados.faltas / dados.total : 0,
      }))
      .filter((h) => h.taxaFalta > 0.2)
      .sort((a, b) => b.taxaFalta - a.taxaFalta)
      .map((h) => h.hora);

    // Gerar sugestões
    const sugestoesMelhoria: string[] = [];

    if (ocupacaoMedia > 0.9) {
      sugestoesMelhoria.push(
        "Considerar aumentar a oferta de horários para esta especialidade",
      );
    }

    if (horariosComMaiorFalta.length > 0) {
      sugestoesMelhoria.push(
        `Implementar lembretes extras para horários ${horariosComMaiorFalta.slice(0, 2).join(", ")}`,
      );
    }

    if (ocupacaoMedia < 0.6) {
      sugestoesMelhoria.push(
        "Avaliar redimensionamento da agenda ou estratégias de divulgação",
      );
    }

    return {
      ocupacaoMedia,
      horariosComMaiorFalta,
      especialidadesComMaiorDemanda: [especialidade], // Simplificado para o exemplo
      sugestoesMelhoria,
    };
  }

  // Gerenciar lista de espera inteligente
  processarListaEspera(especialidade: string): void {
    const listaEspera =
      baseCadastro.buscarListaEsperaPorEspecialidade(especialidade);
    const agendasDisponiveis = baseCadastro.buscarAgendasDisponiveis(
      especialidade,
      new Date(),
    );

    for (const agenda of agendasDisponiveis) {
      const horariosDisponiveis = agenda.horarios.filter((h) => h.disponivel);

      for (const horario of horariosDisponiveis) {
        if (listaEspera.length === 0) break;

        const proximoPaciente = listaEspera.shift();
        if (!proximoPaciente) break;

        // Criar recepcao automático
        const paciente = baseCadastro.buscarPaciente(
          proximoPaciente.pacienteId,
        );
        if (paciente && typeof paciente.id === "number") {
          const novoAgendamento: Agendamento = {
            id: `agend_${Date.now()}`,
            pacienteId: paciente.id,
            agendaId: agenda.id,
            data: agenda.data,
            hora: horario.hora,
            tipo: "consulta",
            status: "agendado",
            prioridade: proximoPaciente.prioridade <= 3 ? "urgente" : "normal",
            observacoes: "Agendado automaticamente da lista de espera",
            codigoConfirmacao: this.gerarCodigoConfirmacao(),
            notificacaoEnviada: false,
            criadoEm: new Date(),
            atualizadoEm: new Date(),
          };

          baseCadastro.adicionarAgendamento(novoAgendamento);

          // Atualizar status na lista de espera
          proximoPaciente.statusAtual = "agendado";
        }
      }
    }
  }

  private calcularIdade(dataNascimento: string | Date | undefined): number {
    if (!dataNascimento) {
      return 0;
    }
    const data = typeof dataNascimento === "string" ? new Date(dataNascimento) : dataNascimento;
    if (Number.isNaN(data.getTime())) {
      return 0;
    }
    const hoje = new Date();
    let idade = hoje.getFullYear() - data.getFullYear();
    const mes = hoje.getMonth() - data.getMonth();

    if (mes < 0 || (mes === 0 && hoje.getDate() < data.getDate())) {
      idade--;
    }

    return idade;
  }

  private gerarCodigoConfirmacao(): string {
    return Math.random().toString(36).substr(2, 8).toUpperCase();
  }
}

export const agendamentoIA = AgendamentoIAService.getInstance();
