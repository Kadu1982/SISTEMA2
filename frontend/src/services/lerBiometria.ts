import apiService from "./apiService"; // ✅ CORRIGIDO

export interface Usuario {
  id: number;
  usunome: string;
  usucpf: string;
  usucns: string;
  usutelcel: string;
  usutelcon: string;
  usuendereco?: string;
  // adicione mais campos conforme backend
}

export async function lerBiometriaPorTemplate(
    templateId: string,
): Promise<Usuario | null> {
  try {
    const response = await apiService.get<{
      sucesso: boolean;
      usuario: Usuario;
    }>(`/biometria/ler/${templateId}`);

    // ✅ CORRIGIDO - acessar response.data corretamente
    return response.data.sucesso ? response.data.usuario : null;
  } catch {
    return null;
  }
}
