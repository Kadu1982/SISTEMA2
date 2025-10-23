import {React} from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shield } from "lucide-react";

const VigilanciaSanitaria = () => {
  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6 flex items-center">
        <Shield className="mr-2 h-6 w-6" />
        Vigilância Sanitária
      </h1>

      <Tabs defaultValue="inspecoes" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="inspecoes">Inspeções</TabsTrigger>
          <TabsTrigger value="licencas">Licenças</TabsTrigger>
          <TabsTrigger value="fiscalizacao">Fiscalização</TabsTrigger>
          <TabsTrigger value="relatorios">Relatórios</TabsTrigger>
        </TabsList>

        <TabsContent value="inspecoes">
          <Card>
            <CardHeader>
              <CardTitle>Inspeções Sanitárias</CardTitle>
              <CardDescription>
                Registro e acompanhamento de inspeções sanitárias
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Funcionalidade em desenvolvimento...
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="licencas">
          <Card>
            <CardHeader>
              <CardTitle>Licenças Sanitárias</CardTitle>
              <CardDescription>
                Controle de licenças e alvarás sanitários
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Funcionalidade em desenvolvimento...
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="fiscalizacao">
          <Card>
            <CardHeader>
              <CardTitle>Fiscalização</CardTitle>
              <CardDescription>
                Ações de fiscalização e controle sanitário
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
              <CardTitle>Relatórios Sanitários</CardTitle>
              <CardDescription>
                Relatórios de vigilância e controle sanitário
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

export default VigilanciaSanitaria;
