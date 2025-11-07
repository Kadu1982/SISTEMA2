import apiService from "@/services/apiService";

export interface TipoPerfil {
  codigo: string;
  descricao: string;
  nivel: string;
  nome: string;
}

export interface PerfilResponse {
  success: boolean;
  message: string;
  data: TipoPerfil[];
}

/**
 * Serviço para gerenciar perfis de operadores
 */
export const perfilService = {
  /**
   * Lista os tipos de perfis disponíveis no sistema
   * Usado para popular select/checkboxes na UI
   */
  async listarTiposDisponiveis(): Promise<TipoPerfil[]> {
    try {
      const { data } = await apiService.get<PerfilResponse>(
        "/perfis/tipos-disponiveis",
        {
          headers: {
            "X-Skip-Auth": "true", // Permite acesso sem token
          },
        }
      );

      if (data.success && data.data) {
        return data.data;
      }
      throw new Error(data.message || "Erro ao listar perfis");
    } catch (error: any) {
      console.error("❌ Erro ao listar tipos de perfis:", error);
      throw error;
    }
  },

  /**
   * Formata um perfil para exibição
   */
  formatarPerfil(perfil: TipoPerfil): string {
    return `${perfil.descricao} (${perfil.codigo})`;
  },

  /**
   * Mapeia código para nome completo
   */
  mapearCodigo(codigo: string, perfis: TipoPerfil[]): TipoPerfil | undefined {
    return perfis.find((p) => p.codigo === codigo || p.nome === codigo);
  },

  /**
   * Valida se um perfil é válido
   */
  validarPerfil(codigo: string, perfilesDisponiveis: TipoPerfil[]): boolean {
    return perfilesDisponiveis.some(
      (p) => p.codigo === codigo || p.nome === codigo
    );
  },
};

