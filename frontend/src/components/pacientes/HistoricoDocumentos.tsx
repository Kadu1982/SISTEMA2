import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Printer, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import apiService from '@/services/apiService';
import { SadtDTO } from '@/types/Sadt';
import { AgendamentoDTO } from '@/types/Agendamento';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface HistoricoDocumentosProps {
    pacienteId: number;
}

interface DocumentoUnificado {
    id: string;
    tipo: 'SADT' | 'Comprovante de Agendamento';
    descricao: string;
    data: Date;
    downloadUrl: string;
}

const abrirPdf = (pdfBytes: ArrayBuffer, nomeArquivo: string) => {
    try {
        const blob = new Blob([pdfBytes], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        const pdfWindow = window.open(url, '_blank');
        if (!pdfWindow) {
            toast.error("Bloqueador de pop-up impediu a visualização do PDF.", {
                description: "Por favor, habilite pop-ups para este site."
            });
        }
    } catch (e) {
        toast.error("Erro ao tentar exibir o PDF.");
        console.error(e);
    }
};

export const HistoricoDocumentos: React.FC<HistoricoDocumentosProps> = ({ pacienteId }) => {
    const [documentos, setDocumentos] = useState<DocumentoUnificado[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchDocumentos = useCallback(async () => {
        if (!pacienteId) return;
        setIsLoading(true);
        try {
            const [sadtsResponse, agendamentosResponse] = await Promise.all([
                apiService.get<SadtDTO[]>(`/sadt/paciente/${pacienteId}`),
                apiService.get<AgendamentoDTO[]>(`/agendamentos/por-paciente/${pacienteId}`)
            ]);

            const sadts = sadtsResponse.data.map((sadt): DocumentoUnificado => ({
                id: sadt.numeroSadt,
                tipo: 'SADT',
                descricao: `SADT Nº ${sadt.numeroSadt} - ${sadt.tipoSadt || 'N/A'}`,
                data: new Date(sadt.dataEmissao),
                downloadUrl: `/sadt/${sadt.numeroSadt}/pdf`,
            }));

            const comprovantes = agendamentosResponse.data
                .filter(ag => ag.comprovantePdfBase64 && ag.comprovantePdfBase64.length > 10)
                .map((ag): DocumentoUnificado => ({
                    id: String(ag.id),
                    tipo: 'Comprovante de Agendamento',
                    descricao: `Agendamento de ${ag.tipo || 'Consulta'} - ID ${ag.id}`,
                    data: new Date(ag.dataHoraFormatada || ag.dataHora),
                    downloadUrl: `/agendamentos/${ag.id}/comprovante-pdf`,
                }));

            const todosDocumentos = [...sadts, ...comprovantes].sort((a, b) => b.data.getTime() - a.data.getTime());
            setDocumentos(todosDocumentos);

        } catch (error) {
            toast.error('Erro ao buscar histórico de documentos do paciente.');
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    }, [pacienteId]);

    useEffect(() => {
        fetchDocumentos();
    }, [fetchDocumentos]);

    const handleVisualizarImprimir = async (doc: DocumentoUnificado) => {
        const toastId = toast.loading(`Preparando documento: ${doc.tipo}...`);
        try {
            const response = await apiService.get(doc.downloadUrl, { responseType: 'arraybuffer' });
            abrirPdf(response.data, `${doc.tipo.replace(/ /g, '_')}_${doc.id}.pdf`);
            toast.success("Documento pronto para visualização/impressão.", { id: toastId });
        } catch (error: any) {
            const errorMessage = error.response?.status === 404
                ? "Documento não encontrado no servidor."
                : "Erro ao obter o documento para impressão.";
            toast.error(errorMessage, { id: toastId });
            console.error(error);
        }
    };

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-blue-600" />
                    Prontuário de Documentos
                </CardTitle>
                <CardDescription>
                    Visualize e imprima SADTs e comprovantes de agendamento gerados para o paciente.
                </CardDescription>
            </CardHeader>
            <CardContent>
                {isLoading ? (
                    <div className="flex justify-center items-center p-6">
                        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                        <span className="ml-2 text-gray-600">Buscando documentos...</span>
                    </div>
                ) : documentos.length === 0 ? (
                    <div className="py-6 text-center text-gray-500">
                        <FileText className="mx-auto h-12 w-12 text-gray-400" />
                        <p className="mt-2 font-medium">Nenhum documento encontrado</p>
                        <p className="text-sm">SADTs e comprovantes aparecerão aqui após serem gerados.</p>
                    </div>
                ) : (
                    <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                        {documentos.map((doc) => (
                            <div key={`${doc.tipo}-${doc.id}`} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50/80 transition-colors">
                                <div className="flex-grow">
                                    <p className={`font-semibold ${doc.tipo === 'SADT' ? 'text-red-600' : 'text-green-700'}`}>{doc.tipo}</p>
                                    <p className="text-sm text-gray-700">{doc.descricao}</p>
                                    <p className="text-xs text-gray-500">
                                        {format(doc.data, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                                    </p>
                                </div>
                                <Button variant="ghost" size="sm" onClick={() => handleVisualizarImprimir(doc)} className="flex items-center gap-2 text-gray-600 hover:text-black">
                                    <Printer className="h-4 w-4" />
                                    Visualizar
                                </Button>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
};