import apiService from '@/services/apiService';
import { Paciente, PacienteList } from '../../types/paciente/Paciente';

const API_URL = '/pacientes';

/**
 * Serviço para operações relacionadas a pacientes.
 * Organizado de acordo com o domínio de Paciente no backend.
 */
export const PacienteService = {
  /**
   * Busca todos os pacientes.
   * @returns Lista de pacientes
   */
  listarTodos: async (): Promise<PacienteList[]> => {
    const response = await apiService.get<PacienteList[]>(API_URL);
    return response.data;
  },

  /**
   * Busca pacientes pelo nome.
   * @param nome Nome ou parte do nome
   * @returns Lista de pacientes
   */
  buscarPorNome: async (nome: string): Promise<PacienteList[]> => {
    const response = await apiService.get<PacienteList[]>(`${API_URL}/buscar?nome=${encodeURIComponent(nome)}`);
    return response.data;
  },

  /**
   * Busca um paciente pelo ID.
   * @param id ID do paciente
   * @returns Dados do paciente
   */
  buscarPorId: async (id: number): Promise<Paciente> => {
    const response = await apiService.get<Paciente>(`${API_URL}/${id}`);
    return response.data;
  },

  /**
   * Cria um novo paciente.
   * @param paciente Dados do paciente
   * @returns Paciente criado
   */
  criar: async (paciente: Paciente): Promise<Paciente> => {
    const response = await apiService.post<Paciente>(API_URL, paciente);
    return response.data;
  },

  /**
   * Atualiza os dados de um paciente.
   * @param id ID do paciente
   * @param paciente Novos dados do paciente
   * @returns Paciente atualizado
   */
  atualizar: async (id: number, paciente: Paciente): Promise<Paciente> => {
    const response = await apiService.put<Paciente>(`${API_URL}/${id}`, paciente);
    return response.data;
  },

  /**
   * Exclui um paciente.
   * @param id ID do paciente
   */
  excluir: async (id: number): Promise<void> => {
    await apiService.delete(`${API_URL}/${id}`);
  },

  /**
   * Verifica se o paciente está em situação de vulnerabilidade.
   * @param id ID do paciente
   * @returns true se o paciente estiver em situação de vulnerabilidade, false caso contrário
   */
  verificarVulnerabilidade: async (id: number): Promise<boolean> => {
    const response = await apiService.get<boolean>(`${API_URL}/${id}/vulnerabilidade`);
    return response.data;
  }
};

export default PacienteService;
