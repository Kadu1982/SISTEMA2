import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ShieldCheck } from 'lucide-react';

const PerfisConfig: React.FC = () => {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl">
            <ShieldCheck className="h-5 w-5" /> Perfis e Permissões
          </CardTitle>
          <CardDescription>
            CRUD de perfis e configuração de privilégios de acesso por módulo/operação.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-gray-600">Em breve: listagem de perfis, edição de permissões e associação com operadores.</div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PerfisConfig;
