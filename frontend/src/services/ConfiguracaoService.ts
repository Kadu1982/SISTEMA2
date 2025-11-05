import apiService from './apiService';
import { AxiosResponse } from 'axios';

// Interfaces para os tipos de dados
export interface Configuracao {
    chave: string;
    valor: string;
    descricao?: string;
    grupo?: string;
    tipo?: string;
    editavel?: boolean;
    valoresPossiveis?: string;
    dataCriacao?: string;
    dataAtualizacao?: string;
    criadoPor?: string;
    atualizadoPor?: string;
}

export interface Operador {
    id?: number;
    nome: string;
    login: string;
    cpf?: string;
    cns?: string;
    email?: string;
    senha?: string;
    ativo?: boolean;
    isMaster?: boolean;
    perfis: string[];
    unidadeSaude?: number;
    dataCriacao?: string;
    dataAtualizacao?: string;
    ultimoLogin?: string;
}

export interface Perfil {
    id?: number;
    nome: string;
    descricao?: string;
    permissoes: string[];
    sistemaPerfil?: boolean;
    ativo?: boolean;
    tipo?: string | null;
    dataCriacao?: string;
    dataAtualizacao?: string;
    criadoPor?: string;
    atualizadoPor?: string;
}

// Interface para respostas da API
export interface ApiResponse<T> {
    success: boolean;
    message: string;
    data: T;
}

/**
 * Serviço para gerenciamento de configurações do sistema
 */
class ConfiguracaoService {
    // ✅ Endpoints base
    private readonly configuracaoUrl = '/configuracoes';
    private readonly operadorUrl = '/operadores';
    private readonly perfilUrl = '/perfis';

    // ===== Helpers internos =====

    /**
     * Tenta inferir o tipo (enum Perfil do backend) a partir do nome digitado.
     * Caso não consiga mapear, retorna null para forçar validação do backend.
     */
    private inferirTipoPorNome(nome?: string | null): string | null {
        if (!nome) return null;
        const n = nome.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase();

        if (/\bADMIN\b|\bADMINISTRADOR/.test(n)) return 'ADMINISTRADOR_DO_SISTEMA';
        if (/\bGESTOR\b/.test(n)) return 'GESTOR';
        if (/\bMEDIC/.test(n)) return 'MEDICO';
        if (/\bENFERMEIR/.test(n)) return 'ENFERMEIRO';
        if (/\bDENTIST/.test(n)) return 'DENTISTA';
        if (/\bFARMAC/.test(n)) return 'FARMACEUTICO';
        if (/\bTEC\b.*ENFERM/.test(n) || /\bTECNICO\b.*ENFERM/.test(n)) return 'TEC_ENF';
        if (/\bTEC\b.*DENTAL/.test(n) || /\bTECNICO\b.*DENTAL/.test(n)) return 'TEC_DENTAL';
        if (/\bTRIAG/.test(n)) return 'TRIAGEM';
        if (/\bRECEP/.test(n)) return 'RECEPCIONISTA';
        if (/\bUSUARIO\b|\bUSUAR/.test(n)) return 'USUARIO_SISTEMA';

        return null;
    }

    // ===== Métodos para Configurações =====

    async listarConfiguracoes(): Promise<Configuracao[]> {
        try {
            console.log('🔍 ConfiguracaoService: Buscando todas as configurações...');
            const response = await apiService.get<ApiResponse<Configuracao[]>>(this.configuracaoUrl);

            if (!response.data.success) {
                console.warn('⚠️ API retornou sucesso=false:', response.data.message);
                return [];
            }

            console.log('✅ Configurações carregadas:', response.data.data?.length || 0);
            return response.data.data || [];
        } catch (error: any) {
            console.error('❌ Erro ao listar configurações:', error);

            if (error.response?.status === 400) {
                console.error('🗄️ Provável problema: Tabela "configuracoes" não existe no banco PostgreSQL');
                console.error('💡 Solução: Execute os scripts de migração do banco de dados');
            }

            return [];
        }
    }

    async listarConfiguracoesPorGrupo(grupo: string): Promise<Configuracao[]> {
        try {
            console.log(`🔍 ConfiguracaoService: Buscando configurações do grupo "${grupo}"...`);
            const response = await apiService.get<ApiResponse<Configuracao[]>>(`${this.configuracaoUrl}/grupo/${grupo}`);

            if (!response.data.success) {
                console.warn('⚠️ API retornou sucesso=false:', response.data.message);
                return [];
            }

            console.log(`✅ Configurações do grupo "${grupo}" carregadas:`, response.data.data?.length || 0);
            return response.data.data || [];
        } catch (error: any) {
            console.error(`❌ Erro ao listar configurações do grupo ${grupo}:`, error);

            if (error.response?.status === 400) {
                console.error('🗄️ Provável problema: Tabela "configuracoes" não existe no banco PostgreSQL');
                console.error('💡 Solução: Execute os scripts de migração do banco de dados');
            }

            return [];
        }
    }

    async buscarConfiguracao(chave: string): Promise<Configuracao | null> {
        try {
            console.log(`🔍 ConfiguracaoService: Buscando configuração "${chave}"...`);
            const response = await apiService.get<ApiResponse<Configuracao>>(`${this.configuracaoUrl}/${chave}`);

            if (!response.data.success) {
                console.warn('⚠️ API retornou sucesso=false:', response.data.message);
                return null;
            }

            console.log(`✅ Configuração "${chave}" encontrada`);
            return response.data.data;
        } catch (error: any) {
            console.error(`❌ Erro ao buscar configuração ${chave}:`, error);

            if (error.response?.status === 400) {
                console.error('🗄️ Provável problema: Tabela "configuracoes" não existe no banco PostgreSQL');
                console.error('💡 Solução: Execute os scripts de migração do banco de dados');
            }

            return null;
        }
    }

    async salvarConfiguracao(configuracao: Configuracao): Promise<Configuracao | null> {
        try {
            console.log('💾 ConfiguracaoService: Salvando configuração:', configuracao.chave);
            const response = await apiService.post<ApiResponse<Configuracao>>(
                this.configuracaoUrl,
                configuracao
            );

            if (!response.data.success) {
                console.warn('⚠️ Falha ao salvar configuração:', response.data.message);
                return null;
            }

            console.log('✅ Configuração salva com sucesso');
            return response.data.data;
        } catch (error: any) {
            console.error('❌ Erro ao salvar configuração:', error);

            if (error.response?.status === 400) {
                console.error('🗄️ Provável problema: Tabela "configuracoes" não existe no banco PostgreSQL');
                console.error('💡 Solução: Execute os scripts de migração do banco de dados');
            }

            return null;
        }
    }

    async atualizarConfiguracao(chave: string, configuracao: Configuracao): Promise<Configuracao | null> {
        try {
            console.log(`🔄 ConfiguracaoService: Atualizando configuração "${chave}"...`);
            const response = await apiService.put<ApiResponse<Configuracao>>(
                `${this.configuracaoUrl}/${chave}`,
                configuracao
            );

            if (!response.data.success) {
                console.warn('⚠️ Falha ao atualizar configuração:', response.data.message);
                return null;
            }

            console.log('✅ Configuração atualizada com sucesso');
            return response.data.data;
        } catch (error: any) {
            console.error(`❌ Erro ao atualizar configuração ${chave}:`, error);

            if (error.response?.status === 400) {
                console.error('🗄️ Provável problema: Tabela "configuracoes" não existe no banco PostgreSQL');
                console.error('💡 Solução: Execute os scripts de migração do banco de dados');
            }

            return null;
        }
    }

    async excluirConfiguracao(chave: string): Promise<boolean> {
        try {
            console.log(`🗑️ ConfiguracaoService: Excluindo configuração "${chave}"...`);
            await apiService.delete(`${this.configuracaoUrl}/${chave}`);
            console.log('✅ Configuração excluída com sucesso');
            return true;
        } catch (error: any) {
            console.error(`❌ Erro ao excluir configuração ${chave}:`, error);

            if (error.response?.status === 400) {
                console.error('🗄️ Provável problema: Tabela "configuracoes" não existe no banco PostgreSQL');
                console.error('💡 Solução: Execute os scripts de migração do banco de dados');
            }

            return false;
        }
    }

    // ===== Novos métodos para funcionalidades avançadas =====

    async listarGrupos(): Promise<string[]> {
        try {
            console.log('🔍 ConfiguracaoService: Buscando grupos de configurações...');
            const response = await apiService.get<ApiResponse<string[]>>(`${this.configuracaoUrl}/grupos`);

            if (!response.data.success) {
                console.warn('⚠️ API retornou sucesso=false:', response.data.message);
                return [];
            }

            console.log('✅ Grupos carregados:', response.data.data?.length || 0);
            return response.data.data || [];
        } catch (error: any) {
            console.error('❌ Erro ao listar grupos:', error);
            return [];
        }
    }

    async listarEditaveis(): Promise<Configuracao[]> {
        try {
            console.log('🔍 ConfiguracaoService: Buscando configurações editáveis...');
            const response = await apiService.get<ApiResponse<Configuracao[]>>(`${this.configuracaoUrl}/editaveis`);

            if (!response.data.success) {
                console.warn('⚠️ API retornou sucesso=false:', response.data.message);
                return [];
            }

            console.log('✅ Configurações editáveis carregadas:', response.data.data?.length || 0);
            return response.data.data || [];
        } catch (error: any) {
            console.error('❌ Erro ao listar configurações editáveis:', error);
            return [];
        }
    }

    async filtrarConfiguracoes(filtros: {
        grupo?: string;
        editavel?: boolean;
    }): Promise<Configuracao[]> {
        try {
            const params = new URLSearchParams();
            if (filtros.grupo) params.append('grupo', filtros.grupo);
            if (filtros.editavel !== undefined) params.append('editavel', filtros.editavel.toString());

            console.log('🔍 ConfiguracaoService: Filtrando configurações...', filtros);
            const response = await apiService.get<ApiResponse<Configuracao[]>>(`${this.configuracaoUrl}/filtrar?${params}`);

            if (!response.data.success) {
                console.warn('⚠️ API retornou sucesso=false:', response.data.message);
                return [];
            }

            console.log('✅ Configurações filtradas:', response.data.data?.length || 0);
            return response.data.data || [];
        } catch (error: any) {
            console.error('❌ Erro ao filtrar configurações:', error);
            return [];
        }
    }

    async buscarPorTexto(texto: string): Promise<Configuracao[]> {
        try {
            console.log(`🔍 ConfiguracaoService: Buscando por texto "${texto}"...`);
            const response = await apiService.get<ApiResponse<Configuracao[]>>(`${this.configuracaoUrl}/buscar?texto=${encodeURIComponent(texto)}`);

            if (!response.data.success) {
                console.warn('⚠️ API retornou sucesso=false:', response.data.message);
                return [];
            }

            console.log('✅ Configurações encontradas:', response.data.data?.length || 0);
            return response.data.data || [];
        } catch (error: any) {
            console.error('❌ Erro ao buscar por texto:', error);
            return [];
        }
    }

    async fazerBackup(): Promise<Configuracao[]> {
        try {
            console.log('💾 ConfiguracaoService: Fazendo backup das configurações...');
            const response = await apiService.get<ApiResponse<Configuracao[]>>(`${this.configuracaoUrl}/backup`);

            if (!response.data.success) {
                console.warn('⚠️ API retornou sucesso=false:', response.data.message);
                return [];
            }

            console.log('✅ Backup realizado:', response.data.data?.length || 0, 'configurações');
            return response.data.data || [];
        } catch (error: any) {
            console.error('❌ Erro ao fazer backup:', error);
            return [];
        }
    }

    async restaurarBackup(configuracoes: Configuracao[]): Promise<Configuracao[]> {
        try {
            console.log('🔄 ConfiguracaoService: Restaurando backup de', configuracoes.length, 'configurações...');
            const response = await apiService.post<ApiResponse<Configuracao[]>>(`${this.configuracaoUrl}/restore`, configuracoes);

            if (!response.data.success) {
                console.warn('⚠️ API retornou sucesso=false:', response.data.message);
                return [];
            }

            console.log('✅ Backup restaurado com sucesso');
            return response.data.data || [];
        } catch (error: any) {
            console.error('❌ Erro ao restaurar backup:', error);
            return [];
        }
    }

    // ===== Métodos para Operadores =====

    async listarOperadores(): Promise<Operador[]> {
        try {
            console.log('🔍 ConfiguracaoService: Buscando operadores...');
            const response = await apiService.get<ApiResponse<Operador[]>>(this.operadorUrl);

            if (!response.data.success) {
                console.warn('⚠️ API retornou sucesso=false:', response.data.message);
                return [];
            }

            console.log('✅ Operadores carregados:', response.data.data?.length || 0);
            return response.data.data || [];
        } catch (error: any) {
            console.error('❌ Erro ao listar operadores:', error);
            return [];
        }
    }

    /**
     * Busca operadores por termo com paginação (nome/login).
     */
    async buscarOperadores(termo: string, page = 0, size = 20): Promise<Operador[]> {
        try {
            const q = encodeURIComponent(termo ?? '');
            console.log(`🔍 ConfiguracaoService: Buscando operadores por termo="${termo}", page=${page}, size=${size}`);
            const response = await apiService.get<ApiResponse<Operador[]>>(
                `${this.operadorUrl}/busca?termo=${q}&page=${page}&size=${size}`
            );
            if (!response.data.success) {
                console.warn('⚠️ API retornou sucesso=false:', response.data.message);
                return [];
            }
            return response.data.data || [];
        } catch (error: any) {
            console.error('❌ Erro ao buscar operadores por termo:', error);
            return [];
        }
    }

    async buscarOperador(id: number): Promise<Operador | null> {
        try {
            console.log(`🔍 ConfiguracaoService: Buscando operador ID ${id}...`);
            const response = await apiService.get<ApiResponse<Operador>>(`${this.operadorUrl}/${id}`);

            if (!response.data.success) {
                console.warn('⚠️ API retornou sucesso=false:', response.data.message);
                return null;
            }

            console.log(`✅ Operador ID ${id} encontrado`);
            return response.data.data;
        } catch (error: any) {
            console.error(`❌ Erro ao buscar operador ${id}:`, error);
            return null;
        }
    }

    async criarOperador(operador: Operador): Promise<Operador | null> {
        try {
            console.log('👤 ConfiguracaoService: Criando operador:', operador.nome);
            const response = await apiService.post<ApiResponse<Operador>>(
                this.operadorUrl,
                operador
            );

            if (!response.data.success) {
                console.warn('⚠️ Falha ao criar operador:', response.data.message);
                return null;
            }

            const criado = response.data.data;

            // 🔗 Encadeia vínculo de perfis selecionados na modal
            try {
                if (criado?.id && Array.isArray(operador.perfis) && operador.perfis.length > 0) {
                    console.log(`🔗 Vinculando ${operador.perfis.length} perfil(is) ao operador ${criado.id}...`);
                    await apiService.put(`${this.operadorUrl}/${criado.id}/perfis`, { perfis: operador.perfis });
                    // Reflete em memória para a UI
                    criado.perfis = [...operador.perfis];
                }
            } catch (err) {
                console.warn('⚠️ Operador criado, mas falha ao vincular perfis:', err);
            }

            console.log('✅ Operador criado com sucesso');
            return criado;
        } catch (error: any) {
            console.error('❌ Erro ao criar operador:', error);
            return null;
        }
    }

    async atualizarOperador(id: number, operador: Operador): Promise<Operador | null> {
        try {
            console.log(`🔄 ConfiguracaoService: Atualizando operador ID ${id}...`);
            const response = await apiService.put<ApiResponse<Operador>>(
                `${this.operadorUrl}/${id}`,
                operador
            );

            if (!response.data.success) {
                console.warn('⚠️ Falha ao atualizar operador:', response.data.message);
                return null;
            }

            console.log('✅ Operador atualizado com sucesso');
            return response.data.data;
        } catch (error: any) {
            console.error(`❌ Erro ao atualizar operador ${id}:`, error);
            return null;
        }
    }

    async excluirOperador(id: number): Promise<boolean> {
        try {
            console.log(`🗑️ ConfiguracaoService: Excluindo operador ID ${id}...`);
            await apiService.delete(`${this.operadorUrl}/${id}`);
            console.log('✅ Operador excluído com sucesso');
            return true;
        } catch (error: any) {
            console.error(`❌ Erro ao excluir operador ${id}:`, error);
            return false;
        }
    }

    async alterarSenhaOperador(id: number, novaSenha: string): Promise<boolean> {
        try {
            console.log(`🔐 ConfiguracaoService: Alterando senha do operador ID ${id}...`);
            await apiService.patch(`${this.operadorUrl}/${id}/senha`, { novaSenha });
            console.log('✅ Senha alterada com sucesso');
            return true;
        } catch (error: any) {
            console.error(`❌ Erro ao alterar senha do operador ${id}:`, error);
            return false;
        }
    }

    async alterarStatusOperador(id: number, ativo: boolean): Promise<Operador | null> {
        try {
            console.log(`🔄 ConfiguracaoService: ${ativo ? 'Ativando' : 'Desativando'} operador ID ${id}...`);
            const response = await apiService.patch<ApiResponse<Operador>>(
                `${this.operadorUrl}/${id}/status?ativo=${ativo}`,
                {}
            );

            if (!response.data.success) {
                console.warn('⚠️ Falha ao alterar status do operador:', response.data.message);
                return null;
            }

            console.log('✅ Status do operador alterado com sucesso');
            return response.data.data;
        } catch (error: any) {
            console.error(`❌ Erro ao alterar status do operador ${id}:`, error);
            return null;
        }
    }

    // ===== Métodos para Perfis =====

    /**
     * Busca perfis por termo no backend (nome/descrição/tipo).
     */
    async buscarPerfisPorTermo(termo: string): Promise<Perfil[]> {
        try {
            const q = encodeURIComponent(termo ?? '');
            console.log(`🔍 ConfiguracaoService: Buscando perfis por termo "${termo}"...`);
            const response = await apiService.get<ApiResponse<Perfil[]>>(`${this.perfilUrl}/busca?termo=${q}`);

            if (!response.data.success) {
                console.warn('⚠️ API retornou sucesso=false:', response.data.message);
                return [];
            }

            console.log('✅ Perfis encontrados:', response.data.data?.length || 0);
            return response.data.data || [];
        } catch (error: any) {
            console.error('❌ Erro ao buscar perfis por termo:', error);
            return [];
        }
    }

    /**
     * Lista todos os perfis
     * ✅ CORRIGIDO: Tratamento silencioso de erros de permissão
     */
    async listarPerfis(): Promise<Perfil[]> {
        try {
            console.log('🔍 ConfiguracaoService: Buscando perfis...');
            const response = await apiService.get<ApiResponse<Perfil[]>>(this.perfilUrl);

            if (!response.data.success) {
                console.warn('⚠️ API retornou sucesso=false:', response.data.message);
                return [];
            }

            console.log('✅ Perfis carregados:', response.data.data?.length || 0);
            return response.data.data || [];
        } catch (error: any) {
            // ✅ Silencia erros 400/403 (permissão) - retorna array vazio
            const status = error?.response?.status;
            if (status === 400 || status === 403) {
                console.warn('⚠️ Sem permissão para listar perfis - usando lista vazia');
                return [];
            }
            console.error('❌ Erro ao listar perfis:', error);
            return [];
        }
    }

    /**
     * Busca um perfil pelo ID
     * @param id ID do perfil
     */
    async buscarPerfil(id: number): Promise<Perfil | null> {
        try {
            console.log(`🔍 ConfiguracaoService: Buscando perfil ID ${id}...`);
            const response = await apiService.get<ApiResponse<Perfil>>(`${this.perfilUrl}/${id}`);

            if (!response.data.success) {
                console.warn('⚠️ API retornou sucesso=false:', response.data.message);
                return null;
            }

            console.log(`✅ Perfil ID ${id} encontrado`);
            return response.data.data;
        } catch (error: any) {
            console.error(`❌ Erro ao buscar perfil ${id}:`, error);
            return null;
        }
    }

    /**
     * Cria um novo perfil
     * @param perfil Dados do perfil
     */
    async criarPerfil(perfil: Perfil): Promise<Perfil | null> {
        try {
            console.log('🛡️ ConfiguracaoService: Criando perfil:', perfil.nome);
            const payload = {
                nome: perfil.nome?.trim(),
                descricao: perfil.descricao?.trim() || null,
                ativo: perfil.ativo ?? true,
                sistemaPerfil: perfil.sistemaPerfil ?? false,
                permissoes: Array.isArray(perfil.permissoes) ? perfil.permissoes : [],
                tipo: (perfil.tipo && perfil.tipo.trim()) || this.inferirTipoPorNome(perfil.nome),
            };

            if (!payload.tipo) {
                console.warn('⚠️ Tipo não informado e não foi possível inferir a partir do nome. O backend exigirá um tipo válido.');
            }

            const response = await apiService.post<ApiResponse<Perfil>>(
                this.perfilUrl,
                payload
            );

            if (!response.data.success) {
                console.warn('⚠️ Falha ao criar perfil:', response.data.message);
                return null;
            }

            console.log('✅ Perfil criado com sucesso');
            return response.data.data;
        } catch (error: any) {
            console.error('❌ Erro ao criar perfil:', error);
            return null;
        }
    }

    /**
     * Atualiza um perfil existente
     * @param id ID do perfil
     * @param perfil Novos dados do perfil
     */
    async atualizarPerfil(id: number, perfil: Perfil): Promise<Perfil | null> {
        try {
            console.log(`🔄 ConfiguracaoService: Atualizando perfil ID ${id}...`);
            const payload = {
                nome: perfil.nome?.trim(),
                descricao: perfil.descricao?.trim() || null,
                ativo: perfil.ativo ?? true,
                sistemaPerfil: perfil.sistemaPerfil ?? false,
                permissoes: Array.isArray(perfil.permissoes) ? perfil.permissoes : [],
                tipo: (perfil.tipo && perfil.tipo.trim()) || this.inferirTipoPorNome(perfil.nome),
            };

            const response = await apiService.put<ApiResponse<Perfil>>(
                `${this.perfilUrl}/${id}`,
                payload
            );

            if (!response.data.success) {
                console.warn('⚠️ Falha ao atualizar perfil:', response.data.message);
                return null;
            }

            console.log('✅ Perfil atualizado com sucesso');
            return response.data.data;
        } catch (error: any) {
            console.error(`❌ Erro ao atualizar perfil ${id}:`, error);
            return null;
        }
    }

    /**
     * Exclui um perfil
     * @param id ID do perfil
     */
    async excluirPerfil(id: number): Promise<boolean> {
        try {
            console.log(`🗑️ ConfiguracaoService: Excluindo perfil ID ${id}...`);
            await apiService.delete(`${this.perfilUrl}/${id}`);
            console.log('✅ Perfil excluído com sucesso');
            return true;
        } catch (error: any) {
            console.error(`❌ Erro ao excluir perfil ${id}:`, error);
            return false;
        }
    }

    /**
     * Lista permissões disponíveis no sistema
     */
    async listarPermissoes(): Promise<string[]> {
        try {
            console.log('🔍 ConfiguracaoService: Buscando permissões disponíveis...');
            const response = await apiService.get<ApiResponse<string[]>>(`${this.perfilUrl}/permissoes`);

            if (!response.data.success) {
                console.warn('⚠️ API retornou sucesso=false:', response.data.message);
                return [];
            }

            console.log('✅ Permissões carregadas:', response.data.data?.length || 0);
            return response.data.data || [];
        } catch (error: any) {
            console.error('❌ Erro ao listar permissões:', error);
            return [];
        }
    }

    /**
     * Atribui permissões a um perfil (PATCH /api/perfis/{id}/permissoes)
     */
    async atribuirPermissoes(perfilId: number, permissoes: string[]): Promise<Perfil | null> {
        try {
            console.log(`🛡️ ConfiguracaoService: Atribuindo ${permissoes?.length ?? 0} permissões ao perfil ${perfilId}...`);
            const response = await apiService.patch<ApiResponse<Perfil>>(
                `${this.perfilUrl}/${perfilId}/permissoes`,
                Array.isArray(permissoes) ? permissoes : []
            );

            if (!response.data.success) {
                console.warn('⚠️ Falha ao atribuir permissões:', response.data.message);
                return null;
            }

            console.log('✅ Permissões atribuídas com sucesso');
            return response.data.data ?? null;
        } catch (error: any) {
            console.error('❌ Erro ao atribuir permissões ao perfil:', error);
            return null;
        }
    }
}

// Exporta uma instância única do serviço
export default new ConfiguracaoService();