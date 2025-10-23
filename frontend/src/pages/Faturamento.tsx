
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProducaoMensal } from "@/components/faturamento/ProducaoMensal";
import { EnvioSISUS } from "@/components/faturamento/EnvioSISUS";
import { RelatoriosFaturamento } from "@/components/faturamento/RelatoriosFaturamento";
import { ValidacaoAutomatica } from "@/components/faturamento/ValidacaoAutomatica";
import { ArquivosMagneticos } from "@/components/faturamento/ArquivosMagneticos";
import { IntegracoesSUS } from "@/components/faturamento/IntegracoesSUS";
import { AnalisesPreditivas } from "@/components/faturamento/AnalisesPreditivas";
import { ControleContratos } from "@/components/faturamento/ControleContratos";

const Faturamento = () => {
  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">Faturamento SUS Automatizado</h1>

      <Card>
        <CardHeader>
          <CardTitle>Sistema Integrado de Faturamento SUS</CardTitle>
          <CardDescription>
            Módulo automatizado com validações, integrações e IA conforme normas
            do Ministério da Saúde
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="producao" className="w-full">
            <TabsList className="grid grid-cols-4 mb-4">
              <TabsTrigger value="producao">Produção</TabsTrigger>
              <TabsTrigger value="validacao">Validação</TabsTrigger>
              <TabsTrigger value="arquivos">Arquivos</TabsTrigger>
              <TabsTrigger value="integracoes">Integrações</TabsTrigger>
            </TabsList>
            <TabsList className="grid grid-cols-4 mb-4">
              <TabsTrigger value="contratos">Contratos</TabsTrigger>
              <TabsTrigger value="preditivas">IA Preditiva</TabsTrigger>
              <TabsTrigger value="envio">Envio SUS</TabsTrigger>
              <TabsTrigger value="relatorios">Relatórios</TabsTrigger>
            </TabsList>

            <TabsContent value="producao">
              <ProducaoMensal />
            </TabsContent>
            <TabsContent value="validacao">
              <ValidacaoAutomatica />
            </TabsContent>
            <TabsContent value="arquivos">
              <ArquivosMagneticos />
            </TabsContent>
            <TabsContent value="integracoes">
              <IntegracoesSUS />
            </TabsContent>
            <TabsContent value="contratos">
              <ControleContratos />
            </TabsContent>
            <TabsContent value="preditivas">
              <AnalisesPreditivas />
            </TabsContent>
            <TabsContent value="envio">
              <EnvioSISUS />
            </TabsContent>
            <TabsContent value="relatorios">
              <RelatoriosFaturamento />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default Faturamento;
