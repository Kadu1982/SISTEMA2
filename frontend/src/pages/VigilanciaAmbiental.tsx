import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Leaf } from "lucide-react";

const VigilanciaAmbiental = () => {
  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6 flex items-center">
        <Leaf className="mr-2 h-6 w-6" />
        Vigilância Ambiental
      </h1>

      <Tabs defaultValue="monitoramento" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="monitoramento">Monitoramento</TabsTrigger>
          <TabsTrigger value="agua">Qualidade da Água</TabsTrigger>
          <TabsTrigger value="ar">Qualidade do Ar</TabsTrigger>
          <TabsTrigger value="relatorios">Relatórios</TabsTrigger>
        </TabsList>

        <TabsContent value="monitoramento">
          <Card>
            <CardHeader>
              <CardTitle>Monitoramento Ambiental</CardTitle>
              <CardDescription>
                Acompanhamento dos indicadores ambientais do município
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Funcionalidade em desenvolvimento...
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="agua">
          <Card>
            <CardHeader>
              <CardTitle>Controle da Qualidade da Água</CardTitle>
              <CardDescription>
                Monitoramento da qualidade da água para consumo humano
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Funcionalidade em desenvolvimento...
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ar">
          <Card>
            <CardHeader>
              <CardTitle>Qualidade do Ar</CardTitle>
              <CardDescription>
                Monitoramento da qualidade do ar e poluição atmosférica
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
              <CardTitle>Relatórios Ambientais</CardTitle>
              <CardDescription>
                Relatórios de monitoramento e controle ambiental
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

export default VigilanciaAmbiental;
