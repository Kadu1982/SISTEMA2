// Serviço de API para cadastro de Profissionais.
// ✅ Ajuste principal desta versão: usar import default do apiService,
//   resolvendo o erro TS2614 (não há named export 'apiService').

import apiService from '@/services/apiService';
import type { ProfissionalDTO } from '@/types/Profissional';

// Base dos endpoints do backend (ProfissionalController):
const BASE = '/profissionais';

// Lista profissionais com filtro opcional (?q=)
// - Backend busca por nome/CPF/CNS quando 'q' é informado.
export async function listarProfissionais(q?: string): Promise<ProfissionalDTO[]> {
    const params = q ? { q } : undefined;
    const { data } = await apiService.get<ProfissionalDTO[]>(BASE, { params });
    return data;
}

// Busca um profissional por ID
export async function buscarProfissional(id: number): Promise<ProfissionalDTO> {
    const { data } = await apiService.get<ProfissionalDTO>(`${BASE}/${id}`);
    return data;
}

// Cria um novo profissional
export async function salvarProfissional(payload: ProfissionalDTO): Promise<ProfissionalDTO> {
    const { data } = await apiService.post<ProfissionalDTO>(BASE, payload);
    return data;
}

// Atualiza um profissional existente
export async function atualizarProfissional(id: number, payload: ProfissionalDTO): Promise<ProfissionalDTO> {
    const { data } = await apiService.put<ProfissionalDTO>(`${BASE}/${id}`, payload);
    return data;
}

// Remove um profissional
export async function deletarProfissional(id: number): Promise<void> {
    await apiService.delete(`${BASE}/${id}`);
}
