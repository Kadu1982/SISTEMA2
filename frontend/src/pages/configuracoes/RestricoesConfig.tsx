import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Filter } from 'lucide-react';

const RestricoesConfig: React.FC = () => {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl">
            <Filter className="h-5 w-5" /> Restrições e Acessos
          </CardTitle>
          <CardDescription>
            Defina restrições por programa/unidade/especialidade e libere acessos em lote.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-gray-600">Em breve: manutenção de restrições e operações de liberação em lote.</div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RestricoesConfig;
