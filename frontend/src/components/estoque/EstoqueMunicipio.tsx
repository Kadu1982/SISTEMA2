
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Package, AlertTriangle, TrendingUp, Building2 } from "lucide-react";

const dadosConsolidados = {
  totalUnidades: 45,
  estoqueTotal: 1250000,
  itensEmFalta: 23,
  alertaVencimento: 12,
};

const EstoqueMunicipio = () => {
  return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-3xl font-bold">Estoque Municipal</h2>
          <Button>
            <Building2 className="mr-2 h-4 w-4" />
            Nova Unidade
          </Button>
        </div>

        {/* Cards de Resumo */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total de Unidades
              </CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dadosConsolidados.totalUnidades}</div>
              <p className="text-xs text-muted-foreground">
                Unidades ativas no município
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Valor Total em Estoque
              </CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                R$ {dadosConsolidados.estoqueTotal.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                Valor total consolidado
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Itens em Falta
              </CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-500">
                {dadosConsolidados.itensEmFalta}
              </div>
              <p className="text-xs text-muted-foreground">
                Itens com estoque zerado
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Alertas de Vencimento
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-500">
                {dadosConsolidados.alertaVencimento}
              </div>
              <p className="text-xs text-muted-foreground">
                Itens próximos ao vencimento
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Lista de Unidades */}
        <Card>
          <CardHeader>
            <CardTitle>Unidades de Saúde</CardTitle>
            <CardDescription>
              Status do estoque por unidade de saúde
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { nome: "UBS Centro", estoque: 85, status: "ok" },
                { nome: "UBS Norte", estoque: 45, status: "baixo" },
                { nome: "UBS Sul", estoque: 92, status: "ok" },
                { nome: "UBS Leste", estoque: 15, status: "critico" },
              ].map((unidade, index) => (
                  <div key={index} className="flex items-center space-x-4">
                    <div className="flex-1">
                      <h4 className="font-medium">{unidade.nome}</h4>
                      <Progress value={unidade.estoque} className="mt-2" />
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {unidade.estoque}%
                    </div>
                    <div className={`px-2 py-1 rounded text-xs ${
                        unidade.status === "ok" ? "bg-green-100 text-green-800" :
                            unidade.status === "baixo" ? "bg-yellow-100 text-yellow-800" :
                                "bg-red-100 text-red-800"
                    }`}>
                      {unidade.status === "ok" ? "Normal" :
                          unidade.status === "baixo" ? "Baixo" : "Crítico"}
                    </div>
                  </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
  );
};

// ✅ EXPORT CORRETO - TANTO DEFAULT QUANTO NAMED
export default EstoqueMunicipio;
export { EstoqueMunicipio };