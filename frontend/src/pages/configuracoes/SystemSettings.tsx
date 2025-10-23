import React from 'react';
import { useOperador } from '@/contexts/OperadorContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

// IMPORTAÇÕES CORRETAS (default) E RELATIVAS AO MESMO DIRETÓRIO
import OperatorManagement from './OperatorManagement';
import RoleManagement from './RoleManagement';
// >>> usamos o componente funcional da aba Unidades (não o placeholder)
import UnidadesConfig from './UnidadesConfig';
import GeralConfig from './GeralConfig';

/* =========================================================
   Abas estáticas (Geral, Restrições, etc.) — mantidas
   apenas como conteúdo informativo.
   ========================================================= */

const GeralTab = () => (
    <Card>
        <CardHeader>
            <CardTitle>Configurações Gerais</CardTitle>
            <CardDescription>Ajustes gerais de funcionamento do sistema.</CardDescription>
        </CardHeader>
        <CardContent>
            <p>Aqui você poderá gerenciar as configurações gerais que se aplicam a todos os módulos.</p>
        </CardContent>
    </Card>
);

const RestricoesTab = () => (
    <Card>
        <CardHeader>
            <CardTitle>Restrições de Acesso</CardTitle>
            <CardDescription>Regras específicas de restrição.</CardDescription>
        </CardHeader>
        <CardContent>
            <p>Aqui você poderá definir restrições de acesso mais granulares.</p>
        </CardContent>
    </Card>
);

const AcessosIpTab = () => (
    <Card>
        <CardHeader>
            <CardTitle>Acessos por IP</CardTitle>
            <CardDescription>Gerenciamento de acessos por endereço IP.</CardDescription>
        </CardHeader>
        <CardContent>
            <p>Aqui você poderá liberar ou bloquear o acesso ao sistema por faixas de IP.</p>
        </CardContent>
    </Card>
);

const AuditoriaTab = () => (
    <Card>
        <CardHeader>
            <CardTitle>Auditoria</CardTitle>
            <CardDescription>Logs de ações importantes realizadas no sistema.</CardDescription>
        </CardHeader>
        <CardContent>
            <p>Aqui você poderá visualizar os logs de auditoria para rastrear atividades.</p>
        </CardContent>
    </Card>
);

const IntegracoesTab = () => (
    <Card>
        <CardHeader>
            <CardTitle>Integrações</CardTitle>
            <CardDescription>Gerenciamento de integrações com sistemas externos.</CardDescription>
        </CardHeader>
        <CardContent>
            <p>Aqui você poderá configurar integrações com outros serviços e sistemas.</p>
        </CardContent>
    </Card>
);

/* =========================================================
   Helpers de normalização: perfis / roles / permissões
   Aceitam tanto string[] quanto {codigo: string}[]
   para evitar erros TS (TS2345) e divergências de shape.
   ========================================================= */

function toCodeArray(input: unknown): string[] {
    if (!input) return [];
    if (Array.isArray(input)) {
        return input
            .map((v) => {
                if (typeof v === 'string') return v;
                if (v && typeof v === 'object' && 'codigo' in (v as any)) {
                    return String((v as any).codigo);
                }
                return undefined;
            })
            .filter((v): v is string => typeof v === 'string');
    }
    return [];
}

function hasCode(arr: string[], code: string): boolean {
    return arr.some((v) => String(v).toUpperCase() === String(code).toUpperCase());
}

/* =========================================================
   Definição das abas com suas regras de visibilidade
   (mantive os mesmos rótulos/ordem).
   ========================================================= */

const settingsTabs: {
    value: string;
    label: string;
    component: React.ReactNode;
    adminOnly?: boolean;
    allowedProfiles?: string[];
}[] = [
    { value: 'geral', label: 'Geral', component: <GeralConfig />, allowedProfiles: ['ADMINISTRADOR_SISTEMA'] },
    // >>> Unidades agora usa o componente funcional
    { value: 'unidades', label: 'Unidades', component: <UnidadesConfig />, allowedProfiles: ['ADMINISTRADOR_SISTEMA'] },
    { value: 'operadores', label: 'Operadores', component: <OperatorManagement />, allowedProfiles: ['ADMINISTRADOR_SISTEMA'] },
    { value: 'perfis', label: 'Perfis e Permissões', component: <RoleManagement />, allowedProfiles: ['ADMINISTRADOR_SISTEMA'] },
    { value: 'restricoes', label: 'Restrições', component: <RestricoesTab />, allowedProfiles: ['ADMINISTRADOR_SISTEMA'] },
    { value: 'acessos-ip', label: 'Acessos IP', component: <AcessosIpTab />, allowedProfiles: ['ADMINISTRADOR_SISTEMA'] },
    { value: 'auditoria', label: 'Auditoria', component: <AuditoriaTab />, allowedProfiles: ['ADMINISTRADOR_SISTEMA'] },
    { value: 'integracoes', label: 'Integrações', component: <IntegracoesTab />, allowedProfiles: ['ADMINISTRADOR_SISTEMA'] },
];

/* =========================================================
   Componente principal
   ========================================================= */

const SystemSettings: React.FC = () => {
    const { operador } = useOperador();

    // master pode vir como isMaster, master ou is_master (garantimos os 3)
    const isMaster =
        Boolean(operador?.isMaster) ||
        Boolean((operador as any)?.master) ||
        Boolean((operador as any)?.is_master) ||
        operador?.login === 'admin.master';

    // normaliza coleções para string[]
    const perfis = toCodeArray((operador as any)?.perfis);
    const roles = toCodeArray((operador as any)?.roles);
    const permissoes = toCodeArray((operador as any)?.permissoes);

    // regra "é admin?" (master OU perfil/role master)
    const isAdmin =
        isMaster ||
        roles.some((r) => String(r).toUpperCase().includes('MASTER')) ||
        perfis.some((p) => String(p).toUpperCase().includes('MASTER'));

    // verificação de permissão por aba (sem mais TS2345)
    const checkPermission = (tab: { adminOnly?: boolean; allowedProfiles?: string[] }): boolean => {
        if (!operador) return false;
        if (tab.adminOnly) return Boolean(isAdmin);
        if (isAdmin) return true;

        if (tab.allowedProfiles && tab.allowedProfiles.length > 0) {
            // permitido se algum dos perfis OU roles OU permissões casar com o código exigido
            return tab.allowedProfiles.some((code) => {
                const matchPerfil = hasCode(perfis, code);
                const matchRole = hasCode(roles, code);
                const matchPerm = hasCode(permissoes, code);
                return matchPerfil || matchRole || matchPerm;
            });
        }
        return false;
    };

    const visibleTabs = settingsTabs.filter(checkPermission);

    if (visibleTabs.length === 0) {
        return (
            <div className="text-center">
                <h2 className="text-xl font-semibold">Acesso Negado</h2>
                <p className="text-muted-foreground">Você não tem permissão para acessar esta área.</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Configurações</h1>
                <p className="text-muted-foreground">Gerencie as configurações gerais e de segurança do sistema.</p>
            </div>

            <Tabs defaultValue={visibleTabs[0].value} className="w-full">
                <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-8">
                    {visibleTabs.map((tab) => (
                        <TabsTrigger key={tab.value} value={tab.value}>
                            {tab.label}
                        </TabsTrigger>
                    ))}
                </TabsList>

                {visibleTabs.map((tab) => (
                    <TabsContent key={tab.value} value={tab.value} className="mt-4">
                        {tab.component}
                    </TabsContent>
                ))}
            </Tabs>
        </div>
    );
};

export default SystemSettings;
