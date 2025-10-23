import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Syringe } from "lucide-react";

const Vacinas = () => {
  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6 flex items-center">
        <Syringe className="mr-2 h-6 w-6" />
        Vacinas
      </h1>

      <Tabs defaultValue="aplicacao" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="aplicacao">Aplicação</TabsTrigger>
          <TabsTrigger value="estoque">Estoque</TabsTrigger>
          <TabsTrigger value="campanha">Campanhas</TabsTrigger>
          <TabsTrigger value="relatorios">Relatórios</TabsTrigger>
        </TabsList>

        <TabsContent value="aplicacao">
          <Card>
            <CardHeader>
              <CardTitle>Aplicação de Vacinas</CardTitle>
              <CardDescription>
                Registro de aplicação de vacinas e imunobiológicos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Funcionalidade em desenvolvimento...
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="estoque">
          <Card>
            <CardHeader>
              <CardTitle>Controle de Estoque</CardTitle>
              <CardDescription>
                Gerenciamento do estoque de vacinas e imunobiológicos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Funcionalidade em desenvolvimento...
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="campanha">
          <Card>
            <CardHeader>
              <CardTitle>Campanhas de Vacinação</CardTitle>
              <CardDescription>
                Planejamento e execução de campanhas de vacinação
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
              <CardTitle>Relatórios de Vacinação</CardTitle>
              <CardDescription>
                Relatórios de cobertura vacinal e produção
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

export default Vacinas;
