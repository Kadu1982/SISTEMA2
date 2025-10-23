import { pacientes as pacientesMock } from "@/data/mockData";
import type { Paciente } from "@/types/paciente/Paciente";

export type ListaEsperaStatus = "aguardando" | "contatado" | "agendado" | "desistiu";
export type SlotHorarioTipo = "normal" | "preferencial" | "extra";
export type StatusAgendamento = "agendado" | "confirmado" | "realizado" | "cancelado" | "faltou";
export type PrioridadeAgendamento = "normal" | "urgente" | "retorno" | "preferencial";

export interface ConfiguracoesAgenda {
  antecedenciaMinimaDias: number;
  antecedenciaMaximaDias: number;
  enviarLembrete24h: boolean;
  enviarLembrete2h: boolean;
  notificarPorWhatsApp: boolean;
  cancelamentoMinimoHoras: number;
  maximoFaltas: number;
}

export interface UnidadeSaude {
  id: string;
  nome: string;
  endereco: string;
  telefone?: string;
  cidade?: string;
  estado?: string;
  descricao?: string;
  ativo: boolean;
}

export interface Profissional {
  id: string;
  nome: string;
  especialidades: string[];
  unidadeId: string;
  documentoConselho?: string;
  ativo: boolean;
}

export interface SlotHorario {
  hora: string; // formato HH:mm
  disponivel: boolean;
  tipo: SlotHorarioTipo;
  pacienteId?: string;
  observacao?: string;
}

export interface Agenda {
  id: string;
  profissionalId: string;
  unidadeId: string;
  especialidade: string;
  data: Date;
  horarios: SlotHorario[];
  cotaTotal: number;
  cotaUtilizada: number;
  cotaReservada: number;
  bloqueada: boolean;
  motivoBloqueio?: string;
  criadaEm: Date;
  atualizadaEm: Date;
}

export interface Agendamento {
  id: string;
  pacienteId: string;
  agendaId: string;
  data: Date;
  hora: string;
  tipo: string;
  status: StatusAgendamento;
  prioridade: PrioridadeAgendamento;
  observacoes?: string;
  codigoConfirmacao?: string;
  notificacaoEnviada: boolean;
  criadoEm: Date;
  atualizadoEm: Date;
}

export interface ListaEspera {
  id: string;
  pacienteId: string;
  especialidade: string;
  prioridade: number; // 1 (mais urgente) a 10
  statusAtual: ListaEsperaStatus;
  dataInclusao: Date;
  criteriosPriorizacao: string[];
  unidadePreferida?: string;
  tentativasContato: number;
  ultimoContato?: Date;
  observacoes?: string;
}

export interface DadosCompletos {
  pacientes: Paciente[];
  agendas: Agenda[];
  agendamentos: Agendamento[];
  listaEspera: ListaEspera[];
  profissionais: Profissional[];
  unidades: UnidadeSaude[];
  configuracoes: ConfiguracoesAgenda;
}

export interface CriarAgendaRequest {
  profissionalId: string;
  unidadeId: string;
  especialidade: string;
  data: Date;
  cotaTotal: number;
}

const MINUTOS_INTERVALO_PADRAO = 30;

function cloneDate(value: Date): Date {
  return new Date(value.getTime());
}

export class BaseCadastroService {
  private static instance: BaseCadastroService | undefined;

  private pacientes: Map<string, Paciente> = new Map();
  private profissionais: Map<string, Profissional> = new Map();
  private unidades: Map<string, UnidadeSaude> = new Map();
  private agendas: Map<string, Agenda> = new Map();
  private agendamentos: Map<string, Agendamento> = new Map();
  private listaEspera: Map<string, ListaEspera> = new Map();

  private configuracoes: ConfiguracoesAgenda = {
    antecedenciaMinimaDias: 1,
    antecedenciaMaximaDias: 60,
    enviarLembrete24h: true,
    enviarLembrete2h: true,
    notificarPorWhatsApp: false,
    cancelamentoMinimoHoras: 2,
    maximoFaltas: 3,
  };

  private constructor() {
    this.popularDadosIniciais();
  }

  public static getInstance(): BaseCadastroService {
    if (!BaseCadastroService.instance) {
      BaseCadastroService.instance = new BaseCadastroService();
    }
    return BaseCadastroService.instance;
  }

  public buscarDadosCompletos(): DadosCompletos {
    return {
      pacientes: Array.from(this.pacientes.values()).map((p) => ({ ...p })),
      agendas: Array.from(this.agendas.values()).map((agenda) => ({
        ...agenda,
        data: cloneDate(agenda.data),
        horarios: agenda.horarios.map((h) => ({ ...h })),
        criadaEm: cloneDate(agenda.criadaEm),
        atualizadaEm: cloneDate(agenda.atualizadaEm),
      })),
      agendamentos: Array.from(this.agendamentos.values()).map((ag) => ({
        ...ag,
        data: cloneDate(ag.data),
        criadoEm: cloneDate(ag.criadoEm),
        atualizadoEm: cloneDate(ag.atualizadoEm),
      })),
      listaEspera: Array.from(this.listaEspera.values()).map((item) => ({
        ...item,
        dataInclusao: cloneDate(item.dataInclusao),
        ultimoContato: item.ultimoContato ? cloneDate(item.ultimoContato) : undefined,
      })),
      profissionais: Array.from(this.profissionais.values()).map((prof) => ({ ...prof })),
      unidades: Array.from(this.unidades.values()).map((unidade) => ({ ...unidade })),
      configuracoes: { ...this.configuracoes },
    };
  }

  public buscarTodosPacientes(): Paciente[] {
    return Array.from(this.pacientes.values()).map((p) => ({ ...p }));
  }

  public buscarPaciente(id: string | number | undefined): Paciente | undefined {
    if (id === undefined || id === null) {
      return undefined;
    }
    return this.pacientes.get(String(id));
  }

  public adicionarPaciente(paciente: Paciente): Paciente {
    const id = paciente.id ?? this.gerarId("paciente");
    const normalizado: Paciente = {
      ...paciente,
      id,
      nomeCompleto: paciente.nomeCompleto || paciente.nome || "Paciente",
    };
    this.pacientes.set(String(id), normalizado);
    return normalizado;
  }

  public buscarTodosProfissionais(): Profissional[] {
    return Array.from(this.profissionais.values()).map((p) => ({ ...p }));
  }

  public buscarProfissional(id: string): Profissional | undefined {
    return this.profissionais.get(id);
  }

  public adicionarProfissional(profissional: Profissional): void {
    this.profissionais.set(profissional.id, profissional);
  }

  public buscarTodasUnidades(): UnidadeSaude[] {
    return Array.from(this.unidades.values()).map((u) => ({ ...u }));
  }

  public buscarUnidade(id: string): UnidadeSaude | undefined {
    return this.unidades.get(id);
  }

  public adicionarUnidade(unidade: UnidadeSaude): void {
    this.unidades.set(unidade.id, unidade);
  }

  public buscarTodasAgendas(): Agenda[] {
    return Array.from(this.agendas.values()).map((agenda) => ({
      ...agenda,
      data: cloneDate(agenda.data),
      horarios: agenda.horarios.map((h) => ({ ...h })),
      criadaEm: cloneDate(agenda.criadaEm),
      atualizadaEm: cloneDate(agenda.atualizadaEm),
    }));
  }

  public buscarAgenda(id: string): Agenda | undefined {
    return this.agendas.get(id);
  }

  public buscarAgendasDisponiveis(especialidade: string, dataReferencia: Date): Agenda[] {
    const slug = especialidade.trim().toLowerCase();
    const inicio = new Date(dataReferencia);
    inicio.setHours(0, 0, 0, 0);

    return Array.from(this.agendas.values()).filter((agenda) => {
      const mesmaEspecialidade = agenda.especialidade.trim().toLowerCase() === slug;
      const dataValida = agenda.data >= inicio;
      const possuiSlots = agenda.horarios.some((slot) => slot.disponivel);
      return mesmaEspecialidade && dataValida && possuiSlots && !agenda.bloqueada;
    }).map((agenda) => ({
      ...agenda,
      data: cloneDate(agenda.data),
      horarios: agenda.horarios.map((h) => ({ ...h })),
      criadaEm: cloneDate(agenda.criadaEm),
      atualizadaEm: cloneDate(agenda.atualizadaEm),
    }));
  }

  public criarAgenda(dados: CriarAgendaRequest): Agenda {
    const id = this.gerarId("agenda");
    const agora = new Date();
    const horarios = this.gerarHorariosPadrao(dados.cotaTotal);

    const agenda: Agenda = {
      id,
      profissionalId: dados.profissionalId,
      unidadeId: dados.unidadeId,
      especialidade: dados.especialidade,
      data: new Date(dados.data),
      horarios,
      cotaTotal: dados.cotaTotal,
      cotaUtilizada: 0,
      cotaReservada: 0,
      bloqueada: false,
      criadaEm: agora,
      atualizadaEm: agora,
    };

    this.agendas.set(agenda.id, agenda);
    return agenda;
  }

  public bloquearAgenda(agendaId: string, bloquear: boolean, motivo?: string): Agenda | undefined {
    const agenda = this.agendas.get(agendaId);
    if (!agenda) {
      return undefined;
    }
    agenda.bloqueada = bloquear;
    agenda.motivoBloqueio = bloquear ? motivo : undefined;
    agenda.atualizadaEm = new Date();
    return agenda;
  }

  public adicionarAgendamento(agendamento: Omit<Agendamento, "id" | "criadoEm" | "atualizadoEm"> & { id?: string }): Agendamento {
    const agora = new Date();
    const id = agendamento.id ?? this.gerarId("agendamento");

    const registro: Agendamento = {
      ...agendamento,
      id,
      data: new Date(agendamento.data),
      criadoEm: agora,
      atualizadoEm: agora,
      pacienteId: String(agendamento.pacienteId),
    };

    this.agendamentos.set(registro.id, registro);

    const agenda = this.agendas.get(registro.agendaId);
    if (agenda) {
      const slot = agenda.horarios.find((h) => h.hora === registro.hora);
      if (slot) {
        slot.disponivel = false;
        slot.pacienteId = registro.pacienteId;
      }
      agenda.cotaUtilizada = Math.min(agenda.cotaTotal, agenda.cotaUtilizada + 1);
      agenda.atualizadaEm = agora;
    }

    for (const item of this.listaEspera.values()) {
      if (String(item.pacienteId) === registro.pacienteId && item.statusAtual === "aguardando") {
        item.statusAtual = "agendado";
        item.ultimoContato = agora;
      }
    }

    return registro;
  }

  public buscarAgendamentos(): Agendamento[] {
    return Array.from(this.agendamentos.values()).map((ag) => ({
      ...ag,
      data: cloneDate(ag.data),
      criadoEm: cloneDate(ag.criadoEm),
      atualizadoEm: cloneDate(ag.atualizadoEm),
    }));
  }

  public buscarAgendamentosPorPaciente(pacienteId: string | number | undefined): Agendamento[] {
    if (pacienteId === undefined || pacienteId === null) {
      return [];
    }
    const chave = String(pacienteId);
    return Array.from(this.agendamentos.values()).filter((ag) => ag.pacienteId === chave).map((ag) => ({
      ...ag,
      data: cloneDate(ag.data),
      criadoEm: cloneDate(ag.criadoEm),
      atualizadoEm: cloneDate(ag.atualizadoEm),
    }));
  }

  public adicionarListaEspera(item: ListaEspera): void {
    this.listaEspera.set(item.id, item);
  }

  public buscarListaEsperaPorEspecialidade(especialidade: string): ListaEspera[] {
    const slug = especialidade.trim().toLowerCase();
    return Array.from(this.listaEspera.values())
      .filter((item) => item.especialidade.trim().toLowerCase() === slug)
      .sort((a, b) => a.prioridade - b.prioridade || a.dataInclusao.getTime() - b.dataInclusao.getTime())
      .map((item) => ({
        ...item,
        dataInclusao: cloneDate(item.dataInclusao),
        ultimoContato: item.ultimoContato ? cloneDate(item.ultimoContato) : undefined,
      }));
  }

  public buscarConfiguracoes(): ConfiguracoesAgenda {
    return { ...this.configuracoes };
  }

  public salvarConfiguracoes(novas: ConfiguracoesAgenda): void {
    this.configuracoes = { ...novas };
  }

  private gerarHorariosPadrao(totalSlots: number): SlotHorario[] {
    const slots: SlotHorario[] = [];
    const inicio = new Date();
    inicio.setHours(8, 0, 0, 0);

    for (let i = 0; i < totalSlots; i++) {
      const horario = new Date(inicio.getTime() + i * MINUTOS_INTERVALO_PADRAO * 60 * 1000);
      const hora = horario.toISOString().substring(11, 16);
      slots.push({ hora, disponivel: true, tipo: "normal" });
    }

    return slots;
  }

  private gerarId(prefixo: string): string {
    return `${prefixo}-${Math.random().toString(36).slice(2, 8)}-${Date.now().toString(36)}`;
  }

  private popularDadosIniciais(): void {
    pacientesMock.forEach((pacienteMock) => {
      this.adicionarPaciente({ ...pacienteMock });
    });

    const unidadesSeed: UnidadeSaude[] = [
      {
        id: "unidade-central",
        nome: "UBS Central",
        endereco: "Rua das Flores, 100",
        telefone: "(11) 4000-1000",
        cidade: "São Paulo",
        estado: "SP",
        descricao: "Unidade de referência para atendimentos gerais",
        ativo: true,
      },
      {
        id: "unidade-sul",
        nome: "Clínica Sul",
        endereco: "Avenida Brasil, 250",
        telefone: "(11) 4000-2000",
        cidade: "São Paulo",
        estado: "SP",
        descricao: "Especializada em atendimento cardiológico",
        ativo: true,
      },
    ];

    unidadesSeed.forEach((unidade) => this.adicionarUnidade(unidade));

    const profissionaisSeed: Profissional[] = [
      {
        id: "prof-ana",
        nome: "Dra. Ana Cardoso",
        especialidades: ["cardiologia"],
        unidadeId: "unidade-central",
        documentoConselho: "CRM 12345",
        ativo: true,
      },
      {
        id: "prof-carlos",
        nome: "Dr. Carlos Mendes",
        especialidades: ["dermatologia"],
        unidadeId: "unidade-sul",
        documentoConselho: "CRM 67890",
        ativo: true,
      },
    ];

    profissionaisSeed.forEach((profissional) => this.adicionarProfissional(profissional));

    const agora = new Date();
    const amanha = new Date(agora.getTime() + 24 * 60 * 60 * 1000);
    const daquiTresDias = new Date(agora.getTime() + 3 * 24 * 60 * 60 * 1000);

    const agendaCardio = this.criarAgenda({
      profissionalId: "prof-ana",
      unidadeId: "unidade-central",
      especialidade: "cardiologia",
      data: amanha,
      cotaTotal: 16,
    });

    const agendaDermato = this.criarAgenda({
      profissionalId: "prof-carlos",
      unidadeId: "unidade-sul",
      especialidade: "dermatologia",
      data: daquiTresDias,
      cotaTotal: 12,
    });

    const agendamentosSeed: Array<Omit<Agendamento, "id" | "criadoEm" | "atualizadoEm"> & { id?: string }> = [
      {
        id: this.gerarId("agendamento"),
        pacienteId: "1",
        agendaId: agendaCardio.id,
        data: agendaCardio.data,
        hora: "09:00",
        tipo: "consulta",
        status: "confirmado",
        prioridade: "normal",
        observacoes: "Paciente com hipertensão",
        codigoConfirmacao: "CONF123",
        notificacaoEnviada: true,
      },
      {
        id: this.gerarId("agendamento"),
        pacienteId: "2",
        agendaId: agendaDermato.id,
        data: agendaDermato.data,
        hora: "10:30",
        tipo: "consulta",
        status: "agendado",
        prioridade: "preferencial",
        observacoes: "Lesão de pele",
        codigoConfirmacao: "CONF456",
        notificacaoEnviada: false,
      },
    ];

    agendamentosSeed.forEach((agendamento) => this.adicionarAgendamento(agendamento));

    const listaEsperaSeed: ListaEspera[] = [
      {
        id: this.gerarId("lista"),
        pacienteId: "3",
        especialidade: "cardiologia",
        prioridade: 2,
        statusAtual: "aguardando",
        dataInclusao: new Date(agora.getTime() - 2 * 24 * 60 * 60 * 1000),
        criteriosPriorizacao: ["idoso", "doença crônica"],
        unidadePreferida: "unidade-central",
        tentativasContato: 1,
        observacoes: "Paciente relatou dor no peito",
      },
      {
        id: this.gerarId("lista"),
        pacienteId: "2",
        especialidade: "dermatologia",
        prioridade: 4,
        statusAtual: "aguardando",
        dataInclusao: new Date(agora.getTime() - 5 * 24 * 60 * 60 * 1000),
        criteriosPriorizacao: ["paciente reincidente"],
        unidadePreferida: "unidade-sul",
        tentativasContato: 0,
      },
    ];

    listaEsperaSeed.forEach((item) => this.listaEspera.set(item.id, item));
  }
}

export const baseCadastro = BaseCadastroService.getInstance();
export default BaseCadastroService;
