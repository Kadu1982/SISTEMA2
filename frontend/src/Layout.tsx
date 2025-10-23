import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useOperador } from '@/contexts/OperadorContext';
import { Button } from '@/components/ui/button';
import {
    ChevronRight,
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

        // ✅ CORREÇÃO: Verifica se é admin usando a estrutura correta de perfis
        // O campo 'perfis' é um array de objetos { codigo: string, nome?: string }
        const isAdmin = operador.login === 'admin.master' ||
            operador.isMaster ||
            operador.perfis?.some(perfil => perfil.codigo === 'ADMINISTRADOR_SISTEMA');

        // Se o item é somente para admin, retorna se é admin
        if (item.adminOnly) return Boolean(isAdmin);

        // Se é admin, tem acesso a tudo
        if (isAdmin) return true;

        // ✅ CORREÇÃO: Verifica perfis específicos permitidos
        if (item.allowedProfiles && item.allowedProfiles.length > 0) {
            return item.allowedProfiles.some((profileCode) =>
                operador.perfis?.some(perfil => perfil.codigo === profileCode)
            );
        }

        // Para itens sem sub-itens e sem perfis específicos
        // Gera o código do perfil baseado no label (ex: "Dashboard" -> "DASHBOARD")
        if (!item.subItems) {
            const perfilNecessario = item.label.toUpperCase().replace(/ /g, '_');
            // ✅ CORREÇÃO: Usa some() para verificar o código do perfil
            return operador.perfis?.some(perfil => perfil.codigo === perfilNecessario) ?? false;
        }

        return false;
    };

    return (
        <div className="flex h-screen bg-gray-100">
            {/* =====================================================
                🎨 SIDEBAR DE NAVEGAÇÃO
                ===================================================== */}
            <aside className="w-64 flex-shrink-0 bg-gray-800 p-4 text-white flex flex-col overflow-y-auto">
                {/* Logo/Título do Sistema */}
                <h2 className="mb-6 text-2xl font-semibold">VITALIZA SAUDE</h2>


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
                                            className={`relative w-full flex items-center justify-between p-2 rounded-md text-left transition-colors duration-200 ${
                                                isParentActive ? 'bg-gray-700 text-white' : 'text-gray-400 hover:bg-gray-700 hover:text-white'
                                            }`}
                                        >
                                            {/* Indicador visual de menu ativo */}
                                            {isParentActive && (
                                                <span className="absolute left-0 top-0 h-full w-1 bg-cyan-400 rounded-r-full shadow-[0_0_10px] shadow-cyan-400/50"></span>
                                            )}

                                            {/* Ícone e texto do menu pai */}
                                            <div className="flex items-center gap-2 pl-2">
                                                <Icon className="w-4 h-4" />
                                                <span>{item.label}</span>
                                            </div>

                                            {/* Seta de expansão (rotaciona quando aberto) */}
                                            <ChevronRight className={`w-4 h-4 transition-transform ${openMenus[item.label] ? 'rotate-90' : ''}`} />
                                        </button>

                                        {/* Lista de sub-itens (renderizada condicionalmente) */}
                                        {openMenus[item.label] && (
                                            <ul className="pl-4 mt-2 space-y-1">
                                                {item.subItems!.map(subItem => {
                                                    // Verifica permissão para cada sub-item
                                                    if (!checkPermission(subItem)) return null;

                                                    const SubIcon = subItem.icon;
                                                    const isSubItemActive = subItem.path === pathname;

                                                    return (
                                                        <li key={subItem.path}>
                                                            <Link
                                                                to={subItem.path!}
                                                                className={`relative flex items-center gap-2 p-2 rounded-md text-sm transition-colors duration-200 ${
                                                                    isSubItemActive ? 'bg-gray-600 text-white' : 'text-gray-400 hover:bg-gray-600 hover:text-white'
                                                                }`}
                                                            >
                                                                {/* Indicador visual de sub-item ativo */}
                                                                {isSubItemActive && (
                                                                    <span className="absolute left-0 top-0 h-full w-1 bg-cyan-400 rounded-r-full"></span>
                                                                )}
                                                                <SubIcon className="w-4 h-4 ml-2" />
                                                                {subItem.label}
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
                                <li key={item.path} className="mb-2">
                                    <Link
                                        to={item.path!}
                                        className={`relative flex items-center gap-2 p-2 rounded-md transition-colors duration-200 ${
                                            isActive ? 'bg-gray-700 text-white' : 'text-gray-400 hover:bg-gray-700 hover:text-white'
                                        } ${item.adminOnly ? 'text-yellow-300' : ''}`} // ✨ Destaque visual para itens admin
                                    >
                                        {/* Indicador visual de item ativo */}
                                        {isActive && (
                                            <span className="absolute left-0 top-0 h-full w-1 bg-cyan-400 rounded-r-full shadow-[0_0_10px] shadow-cyan-400/50"></span>
                                        )}
                                        <Icon className="w-4 h-4 ml-2" />
                                        {item.label}
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>
                </nav>

                {/* =====================================================
                    🚪 BOTÃO DE LOGOUT (FIXO NO RODAPÉ)
                    ===================================================== */}
                <Button
                    onClick={logout}
                    variant="ghost"
                    className="mt-auto w-full flex justify-start gap-2 pt-4 hover:bg-gray-700"
                >
                    <LogOut className="w-4 h-4" /> Sair
                </Button>
            </aside>

            {/* =====================================================
                📄 ÁREA DE CONTEÚDO PRINCIPAL
                ===================================================== */}
            <main className="flex-1 p-6 overflow-y-auto">
                <Outlet />
            </main>
        </div>
    );
};

export default Layout;