import React from "react";
import { useAtendimentos } from "@/hooks/useAtendimentos";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    Calendar, FileText, Download, Stethoscope,
    AlertCircle, CheckCircle, Loader2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import atendimentoService from "@/services/AtendimentoService";

/** Tipagem leve do item de histórico (evita any implícito) */
type AtendimentoHistorico = {
    id?: number | string;
    dataHora?: string;
    cid10?: string;
    diagnostico?: string;
    prescricao?: string;
    observacoes?: string;
};

type Props = { pacienteId: string };

export const HistoricoAtendimentos: React.FC<Props> = ({ pacienteId }) => {
    const { toast } = useToast();
    const {
        data: atendimentosRaw,
        isLoading,
        isError,
        error,
    } = useAtendimentos(pacienteId);

    /** Normaliza o retorno do hook para um array tipado */
    const atendimentos: AtendimentoHistorico[] = Array.isArray(atendimentosRaw)
        ? (atendimentosRaw as AtendimentoHistorico[])
        : [];

    const formatarDataHora = (iso?: string): string => {
        if (!iso) return "Data não informada";
        try {
            const d = new Date(iso);
            if (isNaN(d.getTime())) return "Data inválida";
            return d.toLocaleString("pt-BR", {
                day: "2-digit", month: "2-digit", year: "numeric",
                hour: "2-digit", minute: "2-digit",
            });
        } catch {
            return "Data inválida";
        }
    };

    const downloadPdf = async (id?: string | number) => {
        if (!id) return;
        try {
            if (atendimentoService && typeof (atendimentoService as any).baixarPdf === "function") {
                const file = await (atendimentoService as any).baixarPdf(id);
                if (file?.blob) {
                    const url = URL.createObjectURL(file.blob);
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = file.filename || `atendimento-${id}.pdf`;
                    document.body.appendChild(a);
                    a.click();
                    a.remove();
                    URL.revokeObjectURL(url);
                    toast({ title: "Download iniciado", description: "PDF sendo baixado." });
                    return;
                }
                if (file?.base64) {
                    const link = document.createElement("a");
                    link.href = `data:application/pdf;base64,${file.base64}`;
                    link.download = file.filename || `atendimento-${id}.pdf`;
                    document.body.appendChild(link);
                    link.click();
                    link.remove();
                    toast({ title: "Download iniciado", description: "PDF sendo baixado." });
                    return;
                }
                throw new Error("Resposta inesperada do serviço de PDF.");
            }
            toast({
                title: "Função indisponível",
                description: "Configure AtendimentoService.baixarPdf() para habilitar o download.",
            });
        } catch (e: any) {
            console.error("Erro ao baixar PDF:", e);
            toast({ title: "Erro no download", description: String(e?.message || e), variant: "destructive" });
        }
    };

    if (isLoading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <FileText className="w-5 h-5 text-blue-600" />
                        Histórico de Atendimentos
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-center py-8 text-gray-600">
                        <Loader2 className="w-5 h-5 animate-spin mr-2" />
                        Carregando histórico...
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (isError) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <AlertCircle className="w-5 h-5 text-red-600" />
                        Erro ao Carregar Histórico
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center gap-2 text-red-600 bg-red-50 p-4 rounded-lg">
                        <AlertCircle className="w-5 h-5" />
                        <span>{(error as any)?.message || "Erro ao carregar atendimentos. Tente novamente."}</span>
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (!atendimentos || atendimentos.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <FileText className="w-5 h-5 text-blue-600" />
                        Histórico de Atendimentos
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-8 text-gray-500">
                        <div className="flex flex-col items-center gap-3">
                            <Stethoscope className="w-12 h-12" />
                            <p className="text-lg font-medium">Nenhum atendimento encontrado</p>
                            <p className="text-sm">Este paciente ainda não possui histórico.</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <FileText className="w-5 h-5 text-blue-600" />
                        Histórico de Atendimentos
                    </div>
                    <Badge variant="secondary">
                        {atendimentos.length} atendimento{atendimentos.length !== 1 ? "s" : ""}
                    </Badge>
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {atendimentos.map((a: AtendimentoHistorico) => (
                        <Card key={a.id} className="border-l-4 border-l-blue-500 shadow-sm">
                            <CardContent className="p-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    <div className="flex items-center gap-2">
                                        <Calendar className="w-4 h-4 text-gray-500" />
                                        <div>
                                            <p className="text-sm text-gray-600">Data/Hora</p>
                                            <p className="font-medium">{formatarDataHora(a.dataHora)}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <FileText className="w-4 h-4 text-gray-500" />
                                        <div>
                                            <p className="text-sm text-gray-600">CID-10</p>
                                            <p className="font-medium">{a.cid10 || "Não informado"}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <CheckCircle className="w-4 h-4 text-green-500" />
                                        <div>
                                            <p className="text-sm text-gray-600">Status</p>
                                            <Badge variant="outline" className="text-green-700 border-green-300">Realizado</Badge>
                                        </div>
                                    </div>
                                </div>

                                {a.diagnostico && (
                                    <div className="mt-4">
                                        <p className="text-sm text-gray-600 mb-1">Diagnóstico</p>
                                        <p className="text-sm bg-gray-50 p-3 rounded-lg border">{a.diagnostico}</p>
                                    </div>
                                )}

                                {a.prescricao && (
                                    <div className="mt-4">
                                        <p className="text-sm text-gray-600 mb-1">Prescrição</p>
                                        <p className="text-sm bg-blue-50 p-3 rounded-lg border border-blue-200">{a.prescricao}</p>
                                    </div>
                                )}

                                {a.observacoes && (
                                    <div className="mt-4">
                                        <p className="text-sm text-gray-600 mb-1">Observações</p>
                                        <p className="text-sm bg-yellow-50 p-3 rounded-lg border border-yellow-200">{a.observacoes}</p>
                                    </div>
                                )}

                                <div className="mt-4 pt-4 border-t flex justify-end">
                                    <Button onClick={() => downloadPdf(a.id!)} variant="outline" size="sm" className="flex items-center gap-2">
                                        <Download className="w-4 h-4" />
                                        Baixar PDF
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
};

export default HistoricoAtendimentos;
