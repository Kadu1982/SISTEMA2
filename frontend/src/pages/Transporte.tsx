import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Truck } from "lucide-react";

const Transporte = () => {
  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6 flex items-center">
        <Truck className="mr-2 h-6 w-6" />
        Transporte
      </h1>

      <Tabs defaultValue="solicitacoes" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="solicitacoes">Solicitações</TabsTrigger>
          <TabsTrigger value="agendamento">Agendamento</TabsTrigger>
          <TabsTrigger value="veiculos">Veículos</TabsTrigger>
          <TabsTrigger value="relatorios">Relatórios</TabsTrigger>
        </TabsList>

        <TabsContent value="solicitacoes">
          <Card>
            <CardHeader>
              <CardTitle>Solicitações de Transporte</CardTitle>
              <CardDescription>
                Registro de solicitações de transporte sanitário
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Funcionalidade em desenvolvimento...
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="agendamento">
          <Card>
            <CardHeader>
              <CardTitle>Agendamento de Transportes</CardTitle>
              <CardDescription>
                Agendamento e controle de transportes sanitários
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Funcionalidade em desenvolvimento...
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="veiculos">
          <Card>
            <CardHeader>
              <CardTitle>Controle de Veículos</CardTitle>
              <CardDescription>
                Gerenciamento da frota de veículos sanitários
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
              <CardTitle>Relatórios de Transporte</CardTitle>
              <CardDescription>
                Relatórios de produção e controle de transportes
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

export default Transporte;
