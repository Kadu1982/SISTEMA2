import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ExamesLaboratoriais } from "@/components/exames/ExamesLaboratoriais";
import { ExamesImagem } from "@/components/exames/ExamesImagem";

const Exames = () => {
  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">Gestão de Exames</h1>

      <Card>
        <CardHeader>
          <CardTitle>Agendamento de Exames</CardTitle>
          <CardDescription>
            Agende exames laboratoriais e de imagem para os munícipes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="laboratoriais" className="w-full">
            <TabsList className="grid grid-cols-2 mb-4">
              <TabsTrigger value="laboratoriais">
                Exames Laboratoriais
              </TabsTrigger>
              <TabsTrigger value="imagem">Exames de Imagem</TabsTrigger>
            </TabsList>
            <TabsContent value="laboratoriais">
              <ExamesLaboratoriais />
            </TabsContent>
            <TabsContent value="imagem">
              <ExamesImagem />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default Exames;
