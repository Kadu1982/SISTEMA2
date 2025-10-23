import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Boxes } from 'lucide-react';

const IntegracoesConfig: React.FC = () => {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl">
            <Boxes className="h-5 w-5" /> Integrações
          </CardTitle>
          <CardDescription>
            Configure integrações do sistema (mensageria, painéis, webservices) via chaves/valores.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-gray-600">Em breve: cadastro e edição de configurações de serviços e mensageria.</div>
        </CardContent>
      </Card>
    </div>
  );
};

export default IntegracoesConfig;
