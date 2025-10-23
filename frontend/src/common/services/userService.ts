// src/common/services/userService.ts
// Serviço de usuário real via API do backend

import apiService from "@/services/apiService";

export type User = {
  id: string;
  nome: string;
  cpf: string;
  cns: string;
  reg_geral: string;
  nomeMae: string;
};

export async function getUserById(id: string): Promise<User | undefined> {
  try {
    const response = await apiService.get(`/usuarios/${id}`);
    return response.data;
  } catch (error) {
    console.error("Erro ao buscar usuário:", error);
    return undefined;
  }
}
