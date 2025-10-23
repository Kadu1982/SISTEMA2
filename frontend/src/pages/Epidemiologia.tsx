import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrendingUp } from "lucide-react";

const Epidemiologia = () => {
  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6 flex items-center">
        <TrendingUp className="mr-2 h-6 w-6" />
        Epidemiologia
      </h1>

      <Tabs defaultValue="notificacoes" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="notificacoes">Notificações</TabsTrigger>
          <TabsTrigger value="investigacao">Investigação</TabsTrigger>
          <TabsTrigger value="surtos">Surtos</TabsTrigger>
          <TabsTrigger value="relatorios">Relatórios</TabsTrigger>
        </TabsList>

        <TabsContent value="notificacoes">
          <Card>
            <CardHeader>
              <CardTitle>Notificações Compulsórias</CardTitle>
              <CardDescription>
                Registro de doenças e agravos de notificação compulsória
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Funcionalidade em desenvolvimento...
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="investigacao">
          <Card>
            <CardHeader>
              <CardTitle>Investigação Epidemiológica</CardTitle>
              <CardDescription>
                Investigação de casos e contatos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Funcionalidade em desenvolvimento...
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="surtos">
          <Card>
            <CardHeader>
              <CardTitle>Controle de Surtos</CardTitle>
              <CardDescription>
                Monitoramento e controle de surtos epidemiológicos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Funcionalidade em desenvolvimento...
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="relatorios">
          <Card>
            <CardHeader>
              <CardTitle>Relatórios Epidemiológicos</CardTitle>
              <CardDescription>
                Relatórios e boletins epidemiológicos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Funcionalidade em desenvolvimento...
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Epidemiologia;
