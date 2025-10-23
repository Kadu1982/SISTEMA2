import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Shield } from 'lucide-react';

const AcessosIPConfig: React.FC = () => {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl">
            <Shield className="h-5 w-5" /> Acessos por IP
          </CardTitle>
          <CardDescription>
            Gerencie IPs permitidos ou bloqueados globalmente ou por operador.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-gray-600">Em breve: cadastro de IPs permitidos/negados e associação opcional a operadores.</div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AcessosIPConfig;
