import api from "@/services/apiService";

// ============================================================================
// TIPOS E INTERFACES
// ============================================================================

export interface AssinaturaDigitalDTO {
  id?: number;
  operadorId: number;
  dataHoraAssinatura?: string;
  ipAddress?: string;
  atividadeEnfermagemId?: number;
  corenOperador?: string;
  dataCriacao?: string;
}

export interface CriarSenhaAssinaturaRequest {
  operadorId: number;
  senhaAssinatura: string;
  coren: string;
}

export interface AssinaturaDigitalRequest {
  operadorId: number;
  senhaLogin: string;
  senhaAssinatura: string;
  ipAddress: string;
  coren: string;
}

export interface AssinaturaDigitalResponse {
  sucesso: boolean;
  mensagem: string;
  assinatura?: AssinaturaDigitalDTO;
}

// ============================================================================
// SERVIÇO DE API
// ============================================================================

export const assinaturaDigitalService = {
  /**
   * Cria ou atualiza senha de assinatura de um operador
   */
  async criarSenhaAssinatura(
    request: CriarSenhaAssinaturaRequest
  ): Promise<AssinaturaDigitalDTO> {
    const { data } = await api.post("/assinaturas-digitais/senha-assinatura", request);
    return data?.data || data;
  },

  /**
   * Assina digitalmente uma atividade de enfermagem
   */
  async assinarAtividade(
    atividadeId: number,
    request: AssinaturaDigitalRequest
  ): Promise<AssinaturaDigitalResponse> {
    const { data } = await api.post(
      `/assinaturas-digitais/atividades/${atividadeId}/assinar`,
      request
    );
    return data?.data || data;
  },

  /**
   * Lista assinaturas de uma atividade
   */
  async listarAssinaturasPorAtividade(
    atividadeId: number
  ): Promise<AssinaturaDigitalDTO[]> {
    const { data } = await api.get(`/assinaturas-digitais/atividades/${atividadeId}`);
    return data?.data || data || [];
  },

  /**
   * Busca senha de assinatura de um operador
   */
  async buscarSenhaAssinaturaPorOperador(
    operadorId: number
  ): Promise<AssinaturaDigitalDTO | null> {
    try {
      const { data } = await api.get(`/assinaturas-digitais/operadores/${operadorId}`);
      return data?.data || data;
    } catch (error: any) {
      if (error?.response?.status === 404) {
        return null;
      }
      throw error;
    }
  },

  /**
   * Verifica se operador tem senha de assinatura cadastrada
   */
  async verificarSenhaAssinatura(operadorId: number): Promise<boolean> {
    const { data } = await api.get(
      `/assinaturas-digitais/operadores/${operadorId}/tem-senha`
    );
    return data?.data ?? data ?? false;
  },
};

export default assinaturaDigitalService;

