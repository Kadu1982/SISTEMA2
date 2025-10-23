import axios from 'axios';

const API_URL = 'http://localhost:8080/api/samu/dashboard';

export interface EstatisticasViaturas {
  total: number;
  ativas: number;
  inativas: number;
  disponiveis: number;
  emOperacao: number;
  percentualDisponibilidade: number;
  porStatus: Record<string, number>;
}

export interface EstatisticasOcorrencias {
  hoje: number;
  mes: number;
  abertas: number;
  porPrioridade: Record<string, number>;
  porStatus: Record<string, number>;
}

export interface EstatisticasRegulacao {
  aguardandoRegulacao: number;
  emRegulacao: number;
  reguladasHoje: number;
  tempoMedioRegulacao: number;
}

export interface EstatisticasGerais {
  viaturas: EstatisticasViaturas;
  ocorrencias: EstatisticasOcorrencias;
  regulacao: EstatisticasRegulacao;
  timestamp: string;
  atualizadoEm: number;
}

export interface OcorrenciaCritica {
  id: number;
  numero: string;
  prioridade: string;
  prioridadeDescricao: string;
  status: string;
  endereco: string;
  queixa: string;
  dataAbertura: string;
  tempoDecorrido: number;
}

export interface DadosGrafico {
  hora: number;
  quantidade: number;
  timestamp: string;
}

export interface GraficoOcorrencias {
  dados: DadosGrafico[];
  periodo: string;
}

export interface Alerta {
  tipo: string;
  nivel: string;
  mensagem: string;
  [key: string]: any;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

class SamuDashboardService {
  /**
   * Obtém estatísticas gerais
   */
  async obterEstatisticasGerais(): Promise<EstatisticasGerais> {
    const response = await axios.get<ApiResponse<EstatisticasGerais>>(`${API_URL}/estatisticas`);
    return response.data.data;
  }

  /**
   * Obtém estatísticas de viaturas
   */
  async obterEstatisticasViaturas(): Promise<EstatisticasViaturas> {
    const response = await axios.get<ApiResponse<EstatisticasViaturas>>(`${API_URL}/estatisticas/viaturas`);
    return response.data.data;
  }

  /**
   * Obtém estatísticas de ocorrências
   */
  async obterEstatisticasOcorrencias(): Promise<EstatisticasOcorrencias> {
    const response = await axios.get<ApiResponse<EstatisticasOcorrencias>>(`${API_URL}/estatisticas/ocorrencias`);
    return response.data.data;
  }

  /**
   * Obtém ocorrências críticas
   */
  async obterOcorrenciasCriticas(): Promise<OcorrenciaCritica[]> {
    const response = await axios.get<ApiResponse<OcorrenciaCritica[]>>(`${API_URL}/ocorrencias-criticas`);
    return response.data.data;
  }

  /**
   * Obtém dados para gráfico por hora
   */
  async obterGraficoPorHora(): Promise<GraficoOcorrencias> {
    const response = await axios.get<ApiResponse<GraficoOcorrencias>>(`${API_URL}/grafico-por-hora`);
    return response.data.data;
  }

  /**
   * Obtém alertas ativos
   */
  async obterAlertasAtivos(): Promise<Alerta[]> {
    const response = await axios.get<ApiResponse<Alerta[]>>(`${API_URL}/alertas`);
    return response.data.data;
  }
}

export default new SamuDashboardService();
