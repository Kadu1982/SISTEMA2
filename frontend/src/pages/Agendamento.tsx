// src/pages/Agendamento.tsx

// ANOTAÇÃO: Importa os componentes de abas da nossa UI.
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// ANOTAÇÃO: Importa os componentes específicos para recepcao de consulta e exame.
import { AgendarConsulta } from "@/components/agendamento/AgendarConsulta";
import { AgendarExame } from "@/components/agendamento/AgendarExame";
// ANOTAÇÃO: Importa os ícones.
import { Stethoscope, FlaskConical } from "lucide-react";

// ANOTAÇÃO: Define o componente principal da página de Agendamento.
const Agendamento = () => {
  return (
      // ANOTAÇÃO: O componente 'Tabs' gerencia o estado da aba ativa, começando com 'consulta'.
      <Tabs defaultValue="consulta" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="consulta" className="flex items-center gap-2">
            <Stethoscope className="h-4 w-4" />
            Agendar Consulta
          </TabsTrigger>
          <TabsTrigger value="exame" className="flex items-center gap-2">
            <FlaskConical className="h-4 w-4" />
            Agendar Exame
          </TabsTrigger>
        </TabsList>

        {/* ANOTAÇÃO: Conteúdo da aba de consultas. */}
        <TabsContent value="consulta">
          {/*
          ANOTAÇÃO: CORREÇÃO APLICADA.
          O componente 'AgendarConsulta' agora é renderizado sem props desnecessárias.
          Toda a lógica de formulário será gerenciada internamente por ele, corrigindo erros de contrato.
        */}
          <AgendarConsulta />
        </TabsContent>

        {/* ANOTAÇÃO: Conteúdo da aba de exames. */}
        <TabsContent value="exame">
          {/*
          ANOTAÇÃO: CORREÇÃO APLICADA.
          O componente 'AgendarExame' também é renderizado sem props,
          encapsulando sua própria lógica e resolvendo os erros de tipo.
        */}
          <AgendarExame />
        </TabsContent>
      </Tabs>
  );
};

export default Agendamento;