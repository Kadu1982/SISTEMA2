import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Settings, Users, Shield, Database } from 'lucide-react';
import SystemSettings from '@/pages/configuracoes/SystemSettings';
import OperatorManagement from '@/pages/configuracoes/OperatorManagement';
import RoleManagement from '@/pages/configuracoes/RoleManagement.tsx';
import { useOperador } from '@/contexts/OperadorContext';
import { Navigate } from 'react-router-dom';

const SystemConfig: React.FC = () => {
  const [activeTab, setActiveTab] = useState('settings');
  const { operador } = useOperador();

  // Check if user can access configurations: admin.master, isMaster or ADMINISTRADOR_SISTEMA
  const isConfigAdmin = operador?.login === 'admin.master' || operador?.isMaster || operador?.perfis?.includes('ADMINISTRADOR_SISTEMA');

  // Redirect if not authorized
  if (!isConfigAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-2xl font-bold">Configuração do Sistema</CardTitle>
          <CardDescription>
            Gerencie configurações globais, operadores e permissões do sistema. Esta área é restrita ao administrador master.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList className="grid grid-cols-3 gap-4 w-full md:w-auto">
              <TabsTrigger value="settings" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                <span className="hidden md:inline">Configurações</span>
                <span className="inline md:hidden">Config</span>
              </TabsTrigger>
              <TabsTrigger value="operators" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                <span className="hidden md:inline">Operadores</span>
                <span className="inline md:hidden">Oper</span>
              </TabsTrigger>
              <TabsTrigger value="roles" className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                <span className="hidden md:inline">Perfis e Permissões</span>
                <span className="inline md:hidden">Perfis</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="settings" className="space-y-4">
              <SystemSettings />
            </TabsContent>

            <TabsContent value="operators" className="space-y-4">
              <OperatorManagement />
            </TabsContent>

            <TabsContent value="roles" className="space-y-4">
              <RoleManagement />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default SystemConfig;