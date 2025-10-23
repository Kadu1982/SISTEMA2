/**
 * Página principal de Estoque — corrige imports quebrados
 * (ConsultaSaldos importava de 'ConsultaSaldos', agora de 'ConsultaSaldo')
 */
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs.tsx';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.tsx';
import { EntradaForm } from '@/components/estoque/EntradaForm.tsx';
import { SaidaForm } from '@/components/estoque/SaidaForm.tsx';
import { ConsultaSaldos } from '@/components/estoque/ConsultaSaldo.tsx';
import { VencimentosReport } from '@/components/estoque/VencimentosReport.tsx';
import { Package, PackagePlus, PackageMinus, AlertTriangle } from 'lucide-react';

export default function Estoque() {
    return (
        <div className="container mx-auto py-6">
            <div className="flex items-center gap-2 mb-6">
                <Package className="h-8 w-8" />
                <h1 className="text-3xl font-bold">Gestão de Estoque</h1>
            </div>

            <Tabs defaultValue="consulta">
                <TabsList className="grid grid-cols-4 w-full">
                    <TabsTrigger value="consulta" className="flex items-center gap-2"><Package className="h-4 w-4" />Consulta</TabsTrigger>
                    <TabsTrigger value="entrada"  className="flex items-center gap-2"><PackagePlus className="h-4 w-4" />Entrada</TabsTrigger>
                    <TabsTrigger value="saida"    className="flex items-center gap-2"><PackageMinus className="h-4 w-4" />Saída</TabsTrigger>
                    <TabsTrigger value="vencimentos" className="flex items-center gap-2"><AlertTriangle className="h-4 w-4" />Vencimentos</TabsTrigger>
                </TabsList>

                <TabsContent value="consulta">
                    <Card>
                        <CardHeader>
                            <CardTitle>Consulta de Saldos</CardTitle>
                            <CardDescription>Veja saldos por lote, com vencimento e código de barras.</CardDescription>
                        </CardHeader>
                        <CardContent><ConsultaSaldos /></CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="entrada">
                    <Card>
                        <CardHeader><CardTitle>Entrada de Insumos</CardTitle><CardDescription>Registrar recebimentos/ajustes/transferências recebidas.</CardDescription></CardHeader>
                        <CardContent><EntradaForm /></CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="saida">
                    <Card>
                        <CardHeader><CardTitle>Saída de Insumos</CardTitle><CardDescription>Dispensação/consumo próprio/ajuste/transferências.</CardDescription></CardHeader>
                        <CardContent><SaidaForm /></CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="vencimentos">
                    <Card>
                        <CardHeader><CardTitle>Verificação de Vencimentos</CardTitle><CardDescription>Monitore insumos próximos do vencimento ou já vencidos.</CardDescription></CardHeader>
                        <CardContent><VencimentosReport /></CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
