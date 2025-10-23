import React from 'react';
import { useOperador } from '@/contexts/OperadorContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// 1. Importando todos os componentes das abas, incluindo o novo
import FamiliasTab from '@/components/assistenciaSocial/FamiliasTab';
import AtendimentosTab from '@/components/assistenciaSocial/AtendimentosTab';
import BeneficiosTab from '@/components/assistenciaSocial/BeneficiosTab';
import ConfiguracaoTab from '@/components/assistenciaSocial/ConfiguracaoTab';
import EncaminhamentosTab from '@/components/assistenciaSocial/EncaminhamentosTab';

// 2. Centralizando a configuração das abas em um array para fácil manutenção
const TABS_CONFIG = [
  { value: 'familias', label: 'Famílias', Component: FamiliasTab },
  { value: 'atendimentos', label: 'Atendimentos', Component: AtendimentosTab },
  { value: 'beneficios', label: 'Benefícios', Component: BeneficiosTab },
  { value: 'encaminhamentos', label: 'Encaminhamentos', Component: EncaminhamentosTab },
  { value: 'configuracoes', label: 'Configurações', Component: ConfiguracaoTab },
];

const AssistenciaSocial = () => {
  const { operador } = useOperador();

  // A verificação do operador é uma ótima prática para proteger a rota
  if (!operador) {
    // Retorna nulo ou um componente de carregamento/acesso negado
    return null;
  }

  return (
      // Usando 'space-y-6' para um espaçamento vertical consistente
      <div className="container mx-auto p-4 lg:p-6 space-y-6">
        <h1 className="text-3xl font-bold tracking-tight">Módulo de Assistência Social</h1>

        {/* 3. O estado da aba agora é gerenciado internamente pelo componente Tabs, simplificando o código */}
        <Tabs defaultValue={TABS_CONFIG[0].value} className="w-full">
          {/* 4. A lista de abas agora é gerada dinamicamente a partir do array de configuração */}
          <TabsList className="w-full h-auto flex-wrap justify-start">
            {TABS_CONFIG.map((tab) => (
                <TabsTrigger key={tab.value} value={tab.value}>
                  {tab.label}
                </TabsTrigger>
            ))}
          </TabsList>

          {/* O conteúdo de cada aba também é gerado dinamicamente */}
          {TABS_CONFIG.map((tab) => (
              <TabsContent key={tab.value} value={tab.value} className="mt-4">
                <tab.Component />
              </TabsContent>
          ))}
        </Tabs>
      </div>
  );
};

export default AssistenciaSocial;