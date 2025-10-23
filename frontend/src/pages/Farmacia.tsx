// src/pages/Farmacia.tsx

import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AtendimentoFarmacia } from "@/components/farmacia/AtendimentoFarmacia";
import { EstoqueMedicamentos } from "@/components/farmacia/EstoqueMedicamentos";
import { Pill, AlertTriangle } from "lucide-react";
import { useOperador } from "@/contexts/OperadorContext"; // Importar o hook do operador
import { FarmaciaResumoCards } from "@/components/farmacia/FarmaciaResumoCards";

const Farmacia: React.FC = () => {
  const { operador } = useOperador(); // Obter o operador do contexto

  // Tenta obter o unidadeId do operador. Pode ser string ou undefined.
  const unidadeIdOperador = operador?.unidadeId;

  return (
      <div className="container mx-auto py-6 px-4 md:px-6">
        <div className="mb-6 flex items-center">
          <Pill className="mr-3 h-7 w-7 text-primary" />
          <h1 className="text-2xl font-bold md:text-3xl">
            Módulo de Farmácia
          </h1>
        </div>

        <FarmaciaResumoCards />


        <Tabs defaultValue="atendimento" className="w-full">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3">
            <TabsTrigger value="atendimento">Atendimento</TabsTrigger>
            <TabsTrigger value="dispensacao">Dispensação</TabsTrigger>
            <TabsTrigger value="estoque">Estoque</TabsTrigger>
          </TabsList>

          <TabsContent value="atendimento" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Atendimento e Dispensação</CardTitle>
                <CardDescription>
                  Buscar prescrições de pacientes ou realizar dispensações avulsas.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AtendimentoFarmacia />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="dispensacao" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Dispensação de Medicamentos</CardTitle>
                <CardDescription>
                  Interface para controle de dispensação e entrega de medicamentos.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AtendimentoFarmacia />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="estoque" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Controle de Estoque</CardTitle>
                <CardDescription>
                  Gerenciamento do estoque de medicamentos e insumos.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {unidadeIdOperador ? (
                    <EstoqueMedicamentos unidadeId={String(unidadeIdOperador)} />

                ) : (
                    <div className="flex flex-col items-center justify-center p-8 text-center text-muted-foreground">
                      <AlertTriangle className="h-12 w-12 mb-4 text-yellow-500" />
                      <p className="text-lg font-semibold">ID da Unidade Não Encontrado</p>
                      <p>Não foi possível carregar o estoque pois o ID da unidade do operador não está disponível.</p>
                      <p>Verifique se você está logado e se os dados da sua unidade estão corretos.</p>
                    </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
  );
};

export default Farmacia;