import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessageSquare } from "lucide-react";

const Ouvidoria = () => {
  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6 flex items-center">
        <MessageSquare className="mr-2 h-6 w-6" />
        Ouvidoria
      </h1>

      <Tabs defaultValue="manifestacoes" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="manifestacoes">Manifestações</TabsTrigger>
          <TabsTrigger value="atendimento">Atendimento</TabsTrigger>
          <TabsTrigger value="relatorios">Relatórios</TabsTrigger>
        </TabsList>

        <TabsContent value="manifestacoes">
          <Card>
            <CardHeader>
              <CardTitle>Registrar Manifestação</CardTitle>
              <CardDescription>
                Registre reclamações, sugestões, elogios e denúncias
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Funcionalidade em desenvolvimento...
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="atendimento">
          <Card>
            <CardHeader>
              <CardTitle>Atendimento às Manifestações</CardTitle>
              <CardDescription>
                Acompanhe e responda às manifestações recebidas
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
              <CardTitle>Relatórios da Ouvidoria</CardTitle>
              <CardDescription>
                Relatórios estatísticos das manifestações
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

export default Ouvidoria;
