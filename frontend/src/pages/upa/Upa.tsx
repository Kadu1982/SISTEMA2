
import React, { useEffect, useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Building2, FileText, Stethoscope, UserCheck } from 'lucide-react';
import { useOperador } from '@/contexts/OperadorContext';

// Componentes das diferentes abas
import NovaOcorrenciaUPA from '@/components/upa/NovaOcorrenciaUPA';
import TriagemUPA from '@/components/upa/TriagemUPA';
import AtendimentoUPA from '@/components/upa/AtendimentoUPA';

const Upa: React.FC = () => {
    const { operador } = useOperador();
    const [abaAtiva, setAbaAtiva] = useState<string>('');

    // ✅ FUNÇÃO PARA VERIFICAR SE É OPERADOR MASTER
    const isMasterUser = (): boolean => {
        if (!operador) return false;

        // Verifica se é master via campo isMaster (operador admin.master)
        if (operador.isMaster === true) return true;

        // Verifica se tem perfil de administrador do sistema
        if (operador.perfis?.some(perfil =>
            perfil.toLowerCase().includes('administrador') ||
            perfil.toLowerCase().includes('admin')
        )) return true;

        // Fallback: verifica pelo perfil principal
        const perfilPrincipal = operador.perfil?.toLowerCase() || '';
        return perfilPrincipal.includes('administrador do sistema') ||
            perfilPrincipal.includes('administrador');
    };

    // Determinar qual aba mostrar baseado no perfil do operador
    useEffect(() => {
        if (!operador) return;

        // ✅ OPERADOR MASTER - Aba padrão: Nova Ocorrência
        if (isMasterUser()) {
            setAbaAtiva('nova-ocorrencia');
            return;
        }

        // Verificar pelos perfis (array) primeiro
        if (operador.perfis?.length > 0) {
            const perfisLower = operador.perfis.map(p => p.toLowerCase());

            if (perfisLower.some(p => p.includes('recepcionista') || p.includes('recepcao'))) {
                setAbaAtiva('nova-ocorrencia');
            } else if (perfisLower.some(p => p.includes('enfermeiro'))) {
                setAbaAtiva('triagem');
            } else if (perfisLower.some(p => p.includes('medico') || p.includes('médico'))) {
                setAbaAtiva('atendimento');
            } else {
                setAbaAtiva('nova-ocorrencia');
            }
            return;
        }

        // Fallback: usar perfil principal
        const perfil = operador.perfil?.toLowerCase() || '';
        if (perfil.includes('recepcionista') || perfil.includes('recepcao')) {
            setAbaAtiva('nova-ocorrencia');
        } else if (perfil.includes('enfermeiro')) {
            setAbaAtiva('triagem');
        } else if (perfil.includes('medico') || perfil.includes('médico')) {
            setAbaAtiva('atendimento');
        } else {
            setAbaAtiva('nova-ocorrencia');
        }
    }, [operador]);

    // ✅ VERIFICAR PERMISSÕES COM SUPORTE A MASTER
    const podeAcessarNovaOcorrencia = () => {
        if (!operador) return false;

        // ✅ MASTER TEM ACESSO IRRESTRITO
        if (isMasterUser()) return true;

        // Verificar pelos perfis (array)
        if (operador.perfis?.length > 0) {
            return operador.perfis.some(perfil => {
                const p = perfil.toLowerCase();
                return p.includes('recepcionista') ||
                    p.includes('recepcao') ||
                    p.includes('gestor') ||
                    p.includes('administrativo');
            });
        }

        // Fallback: perfil principal
        const perfil = operador.perfil?.toLowerCase() || '';
        return perfil.includes('recepcionista') ||
            perfil.includes('recepcao') ||
            perfil.includes('gestor');
    };

    const podeAcessarTriagem = () => {
        if (!operador) return false;

        // ✅ MASTER TEM ACESSO IRRESTRITO
        if (isMasterUser()) return true;

        // Verificar pelos perfis (array)
        if (operador.perfis?.length > 0) {
            return operador.perfis.some(perfil => {
                const p = perfil.toLowerCase();
                return p.includes('enfermeiro') ||
                    p.includes('triagem') ||
                    p.includes('técnico em enfermagem') ||
                    p.includes('tecnico');
            });
        }

        // Fallback: perfil principal
        const perfil = operador.perfil?.toLowerCase() || '';
        return perfil.includes('enfermeiro') ||
            perfil.includes('triagem');
    };

    const podeAcessarAtendimento = () => {
        if (!operador) return false;

        // ✅ MASTER TEM ACESSO IRRESTRITO
        if (isMasterUser()) return true;

        // Verificar pelos perfis (array)
        if (operador.perfis?.length > 0) {
            return operador.perfis.some(perfil => {
                const p = perfil.toLowerCase();
                return p.includes('medico') ||
                    p.includes('médico') ||
                    p.includes('dentista');
            });
        }

        // Fallback: perfil principal
        const perfil = operador.perfil?.toLowerCase() || '';
        return perfil.includes('medico') ||
            perfil.includes('médico') ||
            perfil.includes('dentista');
    };

    // Contar quantas abas o usuário tem acesso
    const totalAbas = [
        podeAcessarNovaOcorrencia(),
        podeAcessarTriagem(),
        podeAcessarAtendimento()
    ].filter(Boolean).length;

    // Se não tem acesso a nenhuma aba
    if (totalAbas === 0) {
        return (
            <div className="p-4">
                <div className="text-center py-12 bg-white rounded-lg shadow-sm">
                    <Building2 size={48} className="mx-auto text-gray-400 mb-4" />
                    <h2 className="text-xl font-semibold text-gray-700 mb-2">Acesso Negado</h2>
                    <p className="text-gray-500">
                        Você não possui permissão para acessar o módulo UPA.
                    </p>
                    <p className="text-xs text-gray-400 mt-2">
                        Login: {operador?.login} | isMaster: {operador?.isMaster ? 'Sim' : 'Não'}
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-4">
            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
                <Building2 size={32} className="text-blue-600" />
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">
                        Unidade de Pronto Atendimento (UPA)
                    </h1>
                    <p className="text-sm text-gray-600">
                        Perfil: {operador?.perfil || operador?.perfis?.[0] || 'N/A'} | Operador: {operador?.nome}
                        {/* ✅ INDICADOR VISUAL PARA MASTER */}
                        {isMasterUser() && (
                            <span className="ml-2 px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full font-semibold">
                                🔑 MASTER
                            </span>
                        )}
                        {/* ✅ INDICADOR DE MÚLTIPLAS ABAS */}
                        {totalAbas > 1 && (
                            <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full font-semibold">
                                {totalAbas} módulos disponíveis
                            </span>
                        )}
                    </p>
                    {/* ✅ DEBUG INFO - Pode remover em produção */}
                    {process.env.NODE_ENV === 'development' && (
                        <p className="text-xs text-gray-400">
                            Login: {operador?.login} | isMaster: {operador?.isMaster ? 'Sim' : 'Não'} |
                            Perfis: [{operador?.perfis?.join(', ') || 'Nenhum'}]
                        </p>
                    )}
                </div>
            </div>

            {/* ✅ SISTEMA DE ABAS HORIZONTAIS */}
            <Tabs value={abaAtiva} onValueChange={setAbaAtiva} className="w-full">
                {/* ✅ LISTA DE ABAS - LAYOUT HORIZONTAL OTIMIZADO */}
                <TabsList className={`
                    inline-flex h-12 items-center justify-start rounded-lg bg-gray-100 p-1 text-gray-500 
                    ${totalAbas === 1 ? 'w-auto' : 'w-full max-w-4xl'} 
                    gap-1 mb-6
                `}>
                    {/* Aba Nova Ocorrência */}
                    {podeAcessarNovaOcorrencia() && (
                        <TabsTrigger
                            value="nova-ocorrencia"
                            className="
                                inline-flex items-center justify-center whitespace-nowrap rounded-md px-4 py-2 text-sm font-medium
                                ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2
                                focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none
                                disabled:opacity-50 data-[state=active]:bg-blue-600 data-[state=active]:text-white
                                data-[state=active]:shadow-sm hover:bg-blue-50 hover:text-blue-700
                                min-w-[140px] gap-2
                            "
                        >
                            <FileText size={18} />
                            <span>Nova Ocorrência</span>
                        </TabsTrigger>
                    )}

                    {/* Aba Triagem */}
                    {podeAcessarTriagem() && (
                        <TabsTrigger
                            value="triagem"
                            className="
                                inline-flex items-center justify-center whitespace-nowrap rounded-md px-4 py-2 text-sm font-medium
                                ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2
                                focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none
                                disabled:opacity-50 data-[state=active]:bg-green-600 data-[state=active]:text-white
                                data-[state=active]:shadow-sm hover:bg-green-50 hover:text-green-700
                                min-w-[120px] gap-2
                            "
                        >
                            <Stethoscope size={18} />
                            <span>Triagem</span>
                        </TabsTrigger>
                    )}

                    {/* Aba Atendimento */}
                    {podeAcessarAtendimento() && (
                        <TabsTrigger
                            value="atendimento"
                            className="
                                inline-flex items-center justify-center whitespace-nowrap rounded-md px-4 py-2 text-sm font-medium
                                ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2
                                focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none
                                disabled:opacity-50 data-[state=active]:bg-purple-600 data-[state=active]:text-white
                                data-[state=active]:shadow-sm hover:bg-purple-50 hover:text-purple-700
                                min-w-[130px] gap-2
                            "
                        >
                            <UserCheck size={18} />
                            <span>Atendimento</span>
                        </TabsTrigger>
                    )}
                </TabsList>

                {/* ✅ CONTEÚDO DAS ABAS */}

                {/* Aba Nova Ocorrência */}
                {podeAcessarNovaOcorrencia() && (
                    <TabsContent value="nova-ocorrencia" className="mt-0">
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <div className="flex items-center gap-2 mb-4">
                                <FileText className="h-5 w-5 text-blue-600" />
                                <h2 className="text-xl font-semibold text-gray-800">Registrar Nova Ocorrência</h2>
                                {isMasterUser() && (
                                    <span className="text-xs bg-red-50 text-red-600 px-2 py-1 rounded-full">
                                        Acesso Master
                                    </span>
                                )}
                            </div>
                            <NovaOcorrenciaUPA />
                        </div>
                    </TabsContent>
                )}

                {/* Aba Triagem */}
                {podeAcessarTriagem() && (
                    <TabsContent value="triagem" className="mt-0">
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <div className="flex items-center gap-2 mb-4">
                                <Stethoscope className="h-5 w-5 text-green-600" />
                                <h2 className="text-xl font-semibold text-gray-800">Triagem de Pacientes</h2>
                                {isMasterUser() && (
                                    <span className="text-xs bg-red-50 text-red-600 px-2 py-1 rounded-full">
                                        Acesso Master
                                    </span>
                                )}
                            </div>
                            <TriagemUPA />
                        </div>
                    </TabsContent>
                )}

                {/* Aba Atendimento */}
                {podeAcessarAtendimento() && (
                    <TabsContent value="atendimento" className="mt-0">
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <div className="flex items-center gap-2 mb-4">
                                <UserCheck className="h-5 w-5 text-purple-600" />
                                <h2 className="text-xl font-semibold text-gray-800">Atendimento Médico</h2>
                                {isMasterUser() && (
                                    <span className="text-xs bg-red-50 text-red-600 px-2 py-1 rounded-full">
                                        Acesso Master
                                    </span>
                                )}
                            </div>
                            <AtendimentoUPA />
                        </div>
                    </TabsContent>
                )}
            </Tabs>
        </div>
    );
};

export default Upa;