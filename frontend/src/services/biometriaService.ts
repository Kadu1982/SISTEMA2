import apiService from "@/services/apiService";

export type BiometriaTipoApi = "DEDO" | "FACE" | "IRIS";
export type BiometriaTipoEntrada = BiometriaTipoApi | "digital";

export interface BiometriaTemplate {
  id: string;
  usuarioId: number;
  templateId: string;
  tipo: BiometriaTipoApi;
  qualidade: number;
  ativo: boolean;
  criadoEm: string;
  dataCaptura?: string;
  dispositivoId?: string;
}

export interface BiometriaResponse {
  sucesso: boolean;
  dados?: unknown;
  erro?: string;
  templateId?: string;
  usuario?: unknown;
}

export interface NovaBiometria {
  usuarioId: number;
  templateId: string;
  tipo: BiometriaTipoEntrada;
  dispositivoId: string;
  qualidade?: number;
}

export class BiometriaService {
  static logAcesso(acao: string, detalhes: unknown) {
    console.log(`[Log Biometria] ${acao}`, detalhes);
  }

  private static normalizarTipo(tipo: BiometriaTipoEntrada): BiometriaTipoApi {
    if (tipo === "digital") {
      return "DEDO";
    }
    return tipo;
  }

  async verificar(templateId: string): Promise<unknown> {
    try {
      const response = await apiService.post("/biometria/verificar", { templateId });
      BiometriaService.logAcesso("VERIFICACAO", { templateId, timestamp: new Date().toISOString() });
      return response.data?.data ?? response.data;
    } catch (error) {
      console.error("Erro ao verificar biometria:", error);
      throw new Error("Falha na verificacao biometrica");
    }
  }

  async listarPorUsuario(usuarioId: number): Promise<BiometriaTemplate[]> {
    return BiometriaService.listarBiometriasUsuario(usuarioId);
  }

  async criar(dados: NovaBiometria): Promise<BiometriaResponse> {
    return BiometriaService.registrarBiometria(dados);
  }

  static async lerBiometriaPorTemplate(templateId: string): Promise<BiometriaResponse> {
    try {
      const { data } = await apiService.get(`/biometria/ler/${templateId}`);
      BiometriaService.logAcesso("LEITURA_TEMPLATE", { templateId, timestamp: new Date().toISOString() });
      if (data && typeof data === "object") {
        return { sucesso: true, ...data } as BiometriaResponse;
      }
      return { sucesso: true, dados: data };
    } catch (error) {
      console.error("Erro ao ler biometria:", error);
      return { sucesso: false, erro: "Falha na leitura biometrica" };
    }
  }

  static async registrarBiometria(dados: NovaBiometria): Promise<BiometriaResponse> {
    const payload = {
      ...dados,
      tipo: BiometriaService.normalizarTipo(dados.tipo),
    };

    try {
      const { data } = await apiService.post<BiometriaResponse>("/biometria/registrar", payload);
      BiometriaService.logAcesso("REGISTRO", {
        usuarioId: dados.usuarioId,
        tipo: payload.tipo,
        timestamp: new Date().toISOString(),
      });
      return data;
    } catch (error) {
      console.error("Erro ao registrar biometria:", error);
      return { sucesso: false, erro: "Falha no registro biometrico" };
    }
  }

  static async listarBiometriasUsuario(usuarioId: number): Promise<BiometriaTemplate[]> {
    try {
      const { data } = await apiService.get(`/biometria/usuario/${usuarioId}`);
      if (Array.isArray(data)) {
        return data as BiometriaTemplate[];
      }
      if (data && Array.isArray((data as any).data)) {
        return (data as any).data as BiometriaTemplate[];
      }
      return [];
    } catch (error) {
      console.error("Erro ao listar biometrias:", error);
      return [];
    }
  }

  static async removerBiometria(biometriaId: string, motivo?: string): Promise<boolean> {
    try {
      await apiService.delete(`/biometria/${biometriaId}`, {
        data: {
          motivo: motivo ?? "Remocao manual",
          timestamp: new Date().toISOString(),
        },
      });
      BiometriaService.logAcesso("REMOCAO", { biometriaId, motivo });
      return true;
    } catch (error) {
      console.error("Erro ao remover biometria:", error);
      return false;
    }
  }
}

export const biometriaService = new BiometriaService();
export default biometriaService;
