// services/perfisService.ts
import apiService, { ApiResponse } from './apiService';

export interface PerfilDTO {
    id?: number;
    tipo: string;
    nome?: string;
    nomeExibicao?: string;
    nomeCustomizado?: string;
    ativo?: boolean;
    sistemaPerfil?: boolean;
    modulos?: string[];
    permissoes?: string[];
    codigo?: string;
    descricao?: string;
    nivel?: number;
    isAdmin?: boolean;
    isProfissionalSaude?: boolean;
}

const BASE_URL = '/api/perfis';

/**
 * Lista todos os perfis disponíveis
 */
export async function listarPerfis(): Promise<PerfilDTO[]> {
    try {
        console.log('🔍 Buscando perfis em:', BASE_URL);
        const response = await apiService.get<ApiResponse<PerfilDTO[]>>(BASE_URL);
        console.log('✅ Resposta da API:', response.data);
        
        if (!response.data.success) {
            console.warn('⚠️ API retornou success=false:', response.data.message);
            throw new Error(response.data.message || 'Erro ao listar perfis');
        }
        
        const perfis = response.data.data || [];
        console.log(`✅ ${perfis.length} perfis carregados:`, perfis);
        return perfis;
    } catch (error: any) {
        console.error('❌ Erro ao listar perfis:', error);
        
        // Log detalhado do erro
        if (error?.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', error.response.data);
            console.error('Headers:', error.response.headers);
        }
        
        // Re-throw para que o componente possa tratar o erro
        throw error;
    }
}

/**
 * Busca um perfil específico por ID
 */
export async function buscarPerfil(id: number): Promise<PerfilDTO | null> {
    try {
        const response = await apiService.get<ApiResponse<PerfilDTO>>(`${BASE_URL}/${id}`);
        return response.data.data || null;
    } catch (error) {
        console.error('❌ Erro ao buscar perfil:', error);
        return null;
    }
}

/**
 * Cria um novo perfil
 */
export async function criarPerfil(perfil: Omit<PerfilDTO, 'id'>): Promise<PerfilDTO> {
    const response = await apiService.post<ApiResponse<PerfilDTO>>(BASE_URL, perfil);
    if (!response.data.success || !response.data.data) {
        throw new Error(response.data.message || 'Erro ao criar perfil');
    }
    return response.data.data;
}

/**
 * Atualiza um perfil existente
 */
export async function atualizarPerfil(id: number, perfil: Partial<PerfilDTO>): Promise<PerfilDTO> {
    const response = await apiService.put<ApiResponse<PerfilDTO>>(`${BASE_URL}/${id}`, perfil);
    if (!response.data.success || !response.data.data) {
        throw new Error(response.data.message || 'Erro ao atualizar perfil');
    }
    return response.data.data;
}

/**
 * Remove um perfil
 */
export async function removerPerfil(id: number): Promise<void> {
    await apiService.delete(`${BASE_URL}/${id}`);
}

/**
 * Adiciona um módulo ao perfil
 */
export async function adicionarModulo(perfilId: number, modulo: string): Promise<void> {
    await apiService.post(`${BASE_URL}/${perfilId}/modulos`, { modulo });
}

/**
 * Remove um módulo do perfil
 */
export async function removerModulo(perfilId: number, modulo: string): Promise<void> {
    await apiService.delete(`${BASE_URL}/${perfilId}/modulos/${modulo}`);
}

/**
 * Adiciona uma permissão ao perfil
 */
export async function adicionarPermissao(perfilId: number, permissao: string): Promise<void> {
    await apiService.post(`${BASE_URL}/${perfilId}/permissoes`, { permissao });
}

/**
 * Remove uma permissão do perfil
 */
export async function removerPermissao(perfilId: number, permissao: string): Promise<void> {
    await apiService.delete(`${BASE_URL}/${perfilId}/permissoes/${permissao}`);
}

/**
 * Cria um perfil completo com módulos e permissões
 * Função helper para simplificar a criação
 */
export async function criarPerfilCompleto(
    tipo: string,
    nome: string,
    modulos: string[] = [],
    permissoes: string[] = []
): Promise<PerfilDTO> {
    // 1. Criar o perfil
    const perfil = await criarPerfil({
        tipo,
        nome,
        ativo: true,
        sistemaPerfil: false,
        nomeCustomizado: nome,
    });

    // 2. Adicionar módulos
    for (const modulo of modulos) {
        try {
            await adicionarModulo(perfil.id!, modulo);
        } catch (error) {
            console.warn(`⚠️ Erro ao adicionar módulo ${modulo}:`, error);
        }
    }

    // 3. Adicionar permissões
    for (const permissao of permissoes) {
        try {
            await adicionarPermissao(perfil.id!, permissao);
        } catch (error) {
            console.warn(`⚠️ Erro ao adicionar permissão ${permissao}:`, error);
        }
    }

    return perfil;
}

/**
 * Verifica se um perfil com determinado tipo já existe
 */
export async function perfilExiste(tipo: string): Promise<boolean> {
    const perfis = await listarPerfis();
    return perfis.some(p => p.tipo === tipo);
}

/**
 * Busca perfil por tipo
 */
export async function buscarPerfilPorTipo(tipo: string): Promise<PerfilDTO | null> {
    const perfis = await listarPerfis();
    return perfis.find(p => p.tipo === tipo) || null;
}

/**
 * Templates de perfis pré-configurados
 */
export const PERFIS_TEMPLATES = {
    UPA: {
        tipo: 'UPA',
        nome: 'UPA',
        modulos: ['UPA'],
        permissoes: [
            'UPA_ACESSAR',
            'UPA_ATENDER',
            'UPA_VISUALIZAR',
            'TRIAGEM_REALIZAR',
            'CLASSIFICACAO_RISCO',
            'GERENCIAR_PACIENTES',
            'GERENCIAR_ATENDIMENTOS',
            'VISUALIZAR_RELATORIOS',
            'ENFERMAGEM_ATENDER',
            'MEDICO_ATENDER'
        ]
    },
    ENFERMEIRO_UPA: {
        tipo: 'Enfermeiro UPA',
        nome: 'Enfermeiro UPA',
        modulos: ['UPA'],
        permissoes: [
            'ENFERMAGEM_ATENDER',
            'UPA_ATENDER',
            'UPA_VISUALIZAR',
            'TRIAGEM_REALIZAR',
            'CLASSIFICACAO_RISCO',
            'GERENCIAR_PACIENTES',
            'GERENCIAR_ATENDIMENTOS',
            'VISUALIZAR_RELATORIOS'
        ]
    },
    MEDICO_UPA: {
        tipo: 'Médico UPA',
        nome: 'Médico UPA',
        modulos: ['UPA'],
        permissoes: [
            'MEDICO_ATENDER',
            'UPA_ATENDER',
            'UPA_VISUALIZAR',
            'GERENCIAR_PACIENTES',
            'VISUALIZAR_RELATORIOS'
        ]
    },
    RECEPCIONISTA_UPA: {
        tipo: 'Recepcionista UPA',
        nome: 'Recepcionista UPA',
        modulos: ['UPA', 'RECEPCAO'],
        permissoes: [
            'UPA_VISUALIZAR',
            'GERENCIAR_PACIENTES',
            'RECEPCAO_ATENDER'
        ]
    }
};

/**
 * Cria um perfil a partir de um template
 */
export async function criarPerfilDoTemplate(templateKey: keyof typeof PERFIS_TEMPLATES): Promise<PerfilDTO> {
    const template = PERFIS_TEMPLATES[templateKey];
    return await criarPerfilCompleto(
        template.tipo,
        template.nome,
        template.modulos,
        template.permissoes
    );
}
