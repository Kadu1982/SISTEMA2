import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// ✅ CORRIGIDO: Define a interface para as props do componente
interface EstoqueMedicamentosProps {
  unidadeId: string | number;
}

// ✅ CORRIGIDO: Usa a interface de props para tipar o componente
export const EstoqueMedicamentos: React.FC<EstoqueMedicamentosProps> = ({ unidadeId }) => {
  // Aqui você pode adicionar a lógica para buscar e exibir os medicamentos
  // com base no unidadeId recebido.
  return (
      <Card className="mt-2">
        <CardHeader>
          <CardTitle>Controle de Medicamentos</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Exibindo estoque de medicamentos para a unidade: {unidadeId}</p>
          {/* Futuramente, aqui entrará a lista de medicamentos */}
        </CardContent>
      </Card>
  );
};