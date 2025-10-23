import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
// ✅ CORRIGIDO: O ícone 'Shield' foi removido, pois não estava sendo utilizado.
import { Building2, Package } from "lucide-react";
import { useOperador } from "@/contexts/OperadorContext";
import { EstoqueMedicamentos } from "../farmacia/EstoqueMedicamentos";
import { EstoqueInsumos } from "./EstoqueInsumos";
import { EstoqueMunicipio } from "./EstoqueMunicipio";

interface EstoqueUnidadeViewProps {
  unidadeId: string;
}

// Componente para visualizar o estoque da unidade
const EstoqueUnidadeView: React.FC<EstoqueUnidadeViewProps> = ({ unidadeId }) => {
  const [activeSubTab, setActiveSubTab] = useState("medicamentos");

  return (
      <Card className="mt-4">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Package className="mr-2" />
            Itens na sua Unidade
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeSubTab} onValueChange={setActiveSubTab} className="w-full">
            <TabsList>
              <TabsTrigger value="medicamentos">Medicamentos</TabsTrigger>
              <TabsTrigger value="insumos">Insumos</TabsTrigger>
            </TabsList>
            <TabsContent value="medicamentos">
              <EstoqueMedicamentos unidadeId={unidadeId} />
            </TabsContent>
            <TabsContent value="insumos">
              <EstoqueInsumos unidadeId={unidadeId} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
  );
};

export const EstoqueController: React.FC = () => {
  const { operador } = useOperador();
  const [activeTab, setActiveTab] = useState("unidade");

  if (!operador) {
    return (
        <div className="container mx-auto p-4">
          <Alert variant="destructive">
            <AlertDescription>
              Carregando informações do operador. Se essa mensagem persistir, faça o login novamente.
            </AlertDescription>
          </Alert>
        </div>
    );
  }

  const isGestorMunicipal = operador.perfil === "GESTOR_MUNICIPAL";

  return (
      <div className="container mx-auto p-4">
        <Card>
          <CardHeader>
            <CardTitle>Controle de Estoque</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList>
                <TabsTrigger value="unidade">
                  <Package className="mr-2 h-4 w-4" />
                  Minha Unidade
                </TabsTrigger>
                {isGestorMunicipal && (
                    <TabsTrigger value="municipio">
                      <Building2 className="mr-2 h-4 w-4" />
                      Todo o Município
                    </TabsTrigger>
                )}
              </TabsList>
              <TabsContent value="unidade">
                <EstoqueUnidadeView unidadeId={operador.unidadeId} />
              </TabsContent>
              {isGestorMunicipal && (
                  <TabsContent value="municipio">
                    <EstoqueMunicipio />
                  </TabsContent>
              )}
            </Tabs>
          </CardContent>
        </Card>
      </div>
  );
};