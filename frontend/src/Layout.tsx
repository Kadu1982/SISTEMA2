import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useOperador } from '@/contexts/OperadorContext';
import { Button } from '@/components/ui/button';
import {
    ChevronRight, Menu, X,
    LogOut, LayoutDashboard, Users, Stethoscope, Smile, Boxes,
    ClipboardCheck, Pill, DollarSign, MessageSquare, Truck, Syringe,
    Leaf, ShieldCheck, Biohazard, Filter, Settings, Ambulance, Building2, Microscope,
    Hospital, Bed, AlertTriangle, Monitor, UserCheck, Calendar, BedDouble
} from 'lucide-react';

// =====================================================
// 🔧 INTERFACE DO ITEM DE MENU
// =====================================================
// Define a estrutura dos itens de menu com suporte a sub-itens hierárquicos
interface MenuItem {
    path?: string;              // Caminho da rota (opcional para menus com sub-itens)
    label: string;              // Texto exibido no menu
    icon: React.ElementType;    // Ícone do Lucide React
    adminOnly?: boolean;        // Se true, só admins podem ver
    allowedProfiles?: string[]; // Lista de perfis permitidos (códigos)
    subItems?: MenuItem[];      // Sub-itens do menu (para menus hierárquicos)
    basePath?: string;         // Caminho base para destacar menu pai ativo
}

const Layout: React.FC = () => {
    const { operador, logout } = useOperador();
    const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({ ESF: true });
    const [sidebarOpen, setSidebarOpen] = useState<boolean>(true);
    const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);
    const { pathname } = useLocation();

    // =====================================================
    // 🔄 TOGGLE DE MENU (EXPANDIR/RECOLHER SUB-ITENS)
    // =====================================================
    const toggleMenu = (label: string) => {
        setOpenMenus(prev => ({ ...prev, [label]: !prev[label] }));
    };

    // =====================================================
    // 📋 CONFIGURAÇÃO DOS ITENS DE MENU
    // =====================================================
    const menuItems: MenuItem[] = [
        { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { path: '/recepcao', label: 'Recepção', icon: Users },
        { path: '/triagem', label: 'Acolhimento Ambulatorial', icon: Filter },
        { path: '/atendimento-medico', label: 'Atendimento Ambulatorial', icon: Stethoscope },
        { path: '/atendimento-odontologico', label: 'Odontologia', icon: Smile },
        { path: '/laboratorio', label: 'Laboratório', icon: Microscope },
        { path: '/imunizacao', label: 'Imunização', icon: Syringe },
        { path: '/farmacia', label: 'Farmácia', icon: Pill },
        { path: '/estoque', label: 'Estoque', icon: Boxes },
        { path: '/transporte', label: 'Transporte', icon: Truck },
        { path: '/faturamento', label: 'Faturamento', icon: DollarSign },
        { path: '/epidemiologia', label: 'Epidemiologia', icon: Biohazard },
        { path: '/vigilancia-sanitaria', label: 'Vig. Sanitária', icon: ShieldCheck },
        { path: '/vigilancia-ambiental', label: 'Vig. Ambiental', icon: Leaf },
        { path: '/ouvidoria', label: 'Ouvidoria', icon: MessageSquare },
        { path: '/assistencia-social', label: 'Assistência Social', icon: ShieldCheck },
        {
            path: '/configuracoes',
            label: 'Configurações',
            icon: Settings,
            adminOnly: true // ⚠️ Somente administradores
        },
        { path: '/samu', label: 'SAMU', icon: Ambulance },
        { path: '/upa', label: 'UPA', icon: Building2 },
        {
            // 🏥 MENU HOSPITALAR (com sub-itens)
            label: 'Hospitalar',
            icon: Hospital,
            basePath: '/hospitalar',
            subItems: [
                { path: '/hospitalar/ambulatorio', label: 'Ambulatório', icon: Stethoscope, allowedProfiles: ['ADMINISTRADOR_SISTEMA'] },
                { path: '/hospitalar/internacoes', label: 'Internações', icon: BedDouble, allowedProfiles: ['ADMINISTRADOR_SISTEMA'] },
                { path: '/hospitalar/pre-internacoes', label: 'Pré-Internações', icon: Calendar, allowedProfiles: ['ADMINISTRADOR_SISTEMA'] },
                { path: '/hospitalar/filas', label: 'Gestão de Filas', icon: Users, allowedProfiles: ['ADMINISTRADOR_SISTEMA'] },
                { path: '/hospitalar/painel', label: 'Painel de Chamadas', icon: Monitor, allowedProfiles: ['ADMINISTRADOR_SISTEMA'] },
                { path: '/hospitalar/triagem', label: 'Classificação de Risco', icon: AlertTriangle, allowedProfiles: ['ADMINISTRADOR_SISTEMA'] },
                { path: '/hospitalar/leitos', label: 'Gestão de Leitos', icon: Bed, allowedProfiles: ['ADMINISTRADOR_SISTEMA'] },
                { path: '/hospitalar/central-leitos', label: 'Central de Leitos', icon: Hospital, allowedProfiles: ['ADMINISTRADOR_SISTEMA'] },
                { path: '/hospitalar/acesso', label: 'Controle de Acesso', icon: UserCheck, allowedProfiles: ['ADMINISTRADOR_SISTEMA'] },
                { path: '/hospitalar/configuracoes', label: 'Configurações', icon: Settings, allowedProfiles: ['ADMINISTRADOR_SISTEMA'] }
            ]
        },
        {
            // 👨‍⚕️ MENU ESF (Estratégia Saúde da Família)
            label: 'ESF',
            icon: Users,
            basePath: '/saude-familia',
            subItems: [
                { path: '/saude-familia/painel', label: 'Painel ACS', icon: LayoutDashboard, allowedProfiles: ['GESTOR_AB', 'ACS', 'ADMINISTRADOR_SISTEMA'] },
                { path: '/saude-familia/areas', label: 'Áreas ACS', icon: Building2, allowedProfiles: ['ADMINISTRADOR_SISTEMA', 'GESTOR_AB'] },
                { path: '/saude-familia/metas', label: 'Metas ACS', icon: ClipboardCheck, allowedProfiles: ['ADMINISTRADOR_SISTEMA', 'GESTOR_AB'] }
            ]
        }
    ];

    // =====================================================
    // 🔐 VERIFICAÇÃO DE PERMISSÕES (CORRIGIDA)
    // =====================================================
    const checkPermission = (item: MenuItem): boolean => {
        // Se não há operador logado, nega acesso
        if (!operador) return false;

        // ✅ CORREÇÃO: Verifica se é admin
        // O campo 'perfis' é um array de strings
        const isAdmin = operador.login === 'admin.master' ||
            operador.isMaster ||
            operador.perfis?.some(perfil => perfil === 'ADMINISTRADOR_SISTEMA' || perfil === 'ADMIN');

        // Se o item é somente para admin, retorna se é admin
        if (item.adminOnly) return Boolean(isAdmin);

        // Se é admin, tem acesso a tudo
        if (isAdmin) return true;

        // ✅ CORREÇÃO: Verifica perfis específicos permitidos
        if (item.allowedProfiles && item.allowedProfiles.length > 0) {
            return item.allowedProfiles.some((profileCode) =>
                operador.perfis?.includes(profileCode)
            );
        }

        // Para itens sem sub-itens e sem perfis específicos
        // Gera o código do perfil baseado no label (ex: "UPA" -> "UPA", "Dashboard" -> "DASHBOARD")
        if (!item.subItems) {
            const perfilNecessario = item.label.toUpperCase().replace(/ /g, '_');
            // ✅ CORREÇÃO: perfis é array de strings, usa includes()
            return operador.perfis?.includes(perfilNecessario) ?? false;
        }

        return false;
    };

    return (
        <div className="flex h-screen bg-gray-100">
            {/* =====================================================
                📱 BOTÃO TOGGLE (quando menu mobile fechado)
                ===================================================== */}
            {!sidebarOpen && (
                <button
                    onClick={() => setSidebarOpen(true)}
                    className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-gradient-to-br from-gray-800 to-gray-900 text-white rounded-xl shadow-lg hover:shadow-xl transition-all"
                    aria-label="Abrir Menu"
                >
                    <Menu className="w-6 h-6" />
                </button>
            )}

            {/* =====================================================
                🎨 SIDEBAR DE NAVEGAÇÃO COM ESTILO MODERNO
                ===================================================== */}
            <aside className={`
                ${sidebarCollapsed ? 'w-24' : 'w-64'}
                flex-shrink-0 bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 p-4 text-white flex flex-col overflow-y-auto
                fixed lg:relative inset-y-0 left-0 z-40
                transform transition-all duration-300 ease-in-out
                shadow-2xl
                ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            `}>
                {/* Header com Logo e Controles */}
                <div className="relative mb-8 pb-4 border-b border-gray-700">
                    {/* Botões de controle no topo direito */}
                    <div className="absolute top-0 right-0 flex gap-1 z-10">
                        <button
                            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                            className="p-1.5 hover:bg-gray-700/50 rounded-lg transition-all hover:scale-110"
                            aria-label={sidebarCollapsed ? "Expandir Menu" : "Recolher Menu"}
                        >
                            <ChevronRight className={`w-5 h-5 transition-transform duration-300 ${sidebarCollapsed ? 'rotate-0' : 'rotate-180'}`} />
                        </button>
                        <button
                            onClick={() => setSidebarOpen(false)}
                            className="lg:hidden p-1.5 hover:bg-gray-700/50 rounded-lg transition-all hover:scale-110"
                            aria-label="Fechar Menu"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Logo centralizado */}
                    {!sidebarCollapsed && (
                        <div className="flex flex-col items-center justify-center py-2 pr-10">
                            {/* Logo Tipográfico Artístico */}
                            <div className="relative">
                                <h1 className="text-3xl font-black tracking-tight leading-none">
                                    <span className="block bg-gradient-to-r from-cyan-400 via-blue-400 to-cyan-500 bg-clip-text text-transparent drop-shadow-[0_0_15px_rgba(34,211,238,0.5)]">
                                        VITALIZA
                                    </span>
                                    <span className="block text-center bg-gradient-to-r from-blue-400 via-cyan-300 to-blue-500 bg-clip-text text-transparent text-lg font-bold tracking-[0.3em] mt-0.5">
                                        SAÚDE
                                    </span>
                                </h1>
                                {/* Detalhe decorativo */}
                                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-16 h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent rounded-full"></div>
                            </div>
                        </div>
                    )}
                    {sidebarCollapsed && (
                        <div className="flex items-center justify-center py-2">
                            {/* Versão compacta - apenas iniciais */}
                            <div className="relative w-14 h-14 flex items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/30">
                                <span className="text-4xl font-black bg-gradient-to-br from-cyan-400 to-blue-500 bg-clip-text text-transparent leading-none">
                                    VS
                                </span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Título Módulos */}
                {!sidebarCollapsed && (
                    <div className="text-center mb-4">
                        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Módulos</h3>
                    </div>
                )}

                <nav className="flex-grow">
                    <ul>
                        {menuItems.map((item) => {
                            // Verifica se tem sub-itens (menu hierárquico)
                            const isParent = !!item.subItems?.length;

                            // Determina visibilidade baseada em permissões
                            const isVisible = isParent
                                ? item.subItems!.some(checkPermission) // Para menus pai: mostra se pelo menos um sub-item é visível
                                : checkPermission(item);              // Para itens simples: verifica permissão direta

                            // Se não tem permissão, não renderiza o item
                            if (!isVisible) {
                                return null;
                            }

                            const Icon = item.icon;

                            // =====================================================
                            // 📂 RENDERIZAÇÃO DE MENU HIERÁRQUICO (COM SUB-ITENS)
                            // =====================================================
                            if (isParent) {
                                // Verifica se alguma rota filha está ativa
                                const isParentActive = item.basePath && pathname.startsWith(item.basePath);

                                return (
                                    <li key={item.label} className="mb-2">
                                        {/* Botão do menu pai (expansível) */}
                                        <button
                                            onClick={() => toggleMenu(item.label)}
                                            className={`group relative w-full flex items-center justify-between p-3 rounded-xl text-left transition-all duration-200 ${
                                                isParentActive
                                                    ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-white shadow-lg shadow-cyan-500/20'
                                                    : 'text-gray-300 hover:bg-gray-700/50 hover:text-white'
                                            }`}
                                        >
                                            {/* Indicador visual de menu ativo */}
                                            {isParentActive && (
                                                <span className="absolute left-0 top-2 bottom-2 w-1 bg-gradient-to-b from-cyan-400 to-blue-500 rounded-r-full shadow-[0_0_10px] shadow-cyan-400/50"></span>
                                            )}

                                            {/* Ícone e texto do menu pai */}
                                            <div className={`flex items-center ${sidebarCollapsed ? 'justify-center w-full' : 'gap-3 pl-2'}`}>
                                                <Icon className={`flex-shrink-0 ${isParentActive ? 'text-cyan-400' : 'text-gray-400 group-hover:text-cyan-400'} transition-colors ${sidebarCollapsed ? 'w-7 h-7' : 'w-6 h-6'}`} />
                                                {!sidebarCollapsed && <span className="font-medium">{item.label}</span>}
                                            </div>

                                            {/* Seta de expansão (rotaciona quando aberto) */}
                                            {!sidebarCollapsed && (
                                                <ChevronRight className={`w-4 h-4 transition-transform duration-200 ${openMenus[item.label] ? 'rotate-90' : ''}`} />
                                            )}
                                        </button>

                                        {/* Lista de sub-itens (renderizada condicionalmente) */}
                                        {!sidebarCollapsed && openMenus[item.label] && (
                                            <ul className="pl-6 mt-2 space-y-1">
                                                {item.subItems!.map(subItem => {
                                                    // Verifica permissão para cada sub-item
                                                    if (!checkPermission(subItem)) return null;

                                                    const SubIcon = subItem.icon;
                                                    const isSubItemActive = subItem.path === pathname;

                                                    return (
                                                        <li key={subItem.path}>
                                                            <Link
                                                                to={subItem.path!}
                                                                className={`group relative flex items-center gap-3 p-2.5 pl-4 rounded-lg text-sm transition-all duration-200 ${
                                                                    isSubItemActive
                                                                        ? 'bg-gradient-to-r from-cyan-500/10 to-blue-500/10 text-white'
                                                                        : 'text-gray-400 hover:bg-gray-700/30 hover:text-white'
                                                                }`}
                                                            >
                                                                {/* Indicador visual de sub-item ativo */}
                                                                {isSubItemActive && (
                                                                    <span className="absolute left-0 top-1.5 bottom-1.5 w-0.5 bg-cyan-400 rounded-r-full"></span>
                                                                )}
                                                                <SubIcon className={`w-5 h-5 flex-shrink-0 ${isSubItemActive ? 'text-cyan-400' : 'text-gray-500 group-hover:text-cyan-400'} transition-colors`} />
                                                                <span className="font-normal">{subItem.label}</span>
                                                            </Link>
                                                        </li>
                                                    );
                                                })}
                                            </ul>
                                        )}
                                    </li>
                                );
                            }

                            // =====================================================
                            // 🔗 RENDERIZAÇÃO DE ITEM SIMPLES (SEM SUB-ITENS)
                            // =====================================================
                            const isActive = item.path === pathname;
                            return (
                                <li key={item.path} className="mb-2" title={sidebarCollapsed ? item.label : ''}>
                                    <Link
                                        to={item.path!}
                                        className={`group relative flex items-center p-3 rounded-xl transition-all duration-200 ${
                                            isActive
                                                ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-white shadow-lg shadow-cyan-500/20'
                                                : 'text-gray-300 hover:bg-gray-700/50 hover:text-white'
                                        } ${item.adminOnly ? 'border border-yellow-500/30' : ''} ${sidebarCollapsed ? 'justify-center' : 'gap-3 pl-2'}`}
                                    >
                                        {/* Indicador visual de item ativo */}
                                        {isActive && (
                                            <span className="absolute left-0 top-2 bottom-2 w-1 bg-gradient-to-b from-cyan-400 to-blue-500 rounded-r-full shadow-[0_0_10px] shadow-cyan-400/50"></span>
                                        )}
                                        <Icon className={`flex-shrink-0 ${isActive ? 'text-cyan-400' : 'text-gray-400 group-hover:text-cyan-400'} transition-colors ${sidebarCollapsed ? 'w-7 h-7' : 'w-6 h-6'}`} />
                                        {!sidebarCollapsed && <span className="font-medium">{item.label}</span>}
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>
                </nav>

                {/* =====================================================
                    🚪 BOTÃO DE LOGOUT (FIXO, 10% ACIMA DO RODAPÉ)
                    ===================================================== */}
                <div className="mt-auto pb-[10%] pt-4 border-t border-gray-700">
                    <button
                        onClick={logout}
                        className={`group w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-200 bg-gradient-to-r from-red-600/80 to-red-700/80 hover:from-red-600 hover:to-red-700 text-white shadow-lg hover:shadow-xl hover:scale-105 ${sidebarCollapsed ? 'justify-center' : 'pl-2'}`}
                        title={sidebarCollapsed ? 'Sair' : ''}
                    >
                        <LogOut className={`flex-shrink-0 ${sidebarCollapsed ? 'w-6 h-6' : 'w-5 h-5'}`} />
                        {!sidebarCollapsed && <span className="font-medium">Sair</span>}
                    </button>
                </div>
            </aside>

            {/* =====================================================
                🌫️ OVERLAY (backdrop escuro quando menu aberto em mobile)
                ===================================================== */}
            {sidebarOpen && (
                <div
                    className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-30"
                    onClick={() => setSidebarOpen(false)}
                    aria-hidden="true"
                />
            )}

            {/* =====================================================
                📄 ÁREA DE CONTEÚDO PRINCIPAL
                ===================================================== */}
            <main className="flex-1 p-6 overflow-y-auto transition-all duration-300">
                <Outlet />
            </main>
        </div>
    );
};

export default Layout;