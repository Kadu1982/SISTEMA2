import { useState } from 'react';
import { toast } from 'sonner';
import { gerarSadt } from '@/services/sadtService';

// Interfaces necessárias
export interface GerarSadtRequest {
    agendamento_id: number;
    paciente_id: number;
    procedimentos?: ProcedimentoRequest[];
    observacoes?: string;
    urgente?: boolean;
}

export interface ProcedimentoRequest {
    codigo: string;
    nome: string;
    quantidade: number;
    cid10?: string;
    justificativa?: string;
    preparo?: string;
}

export interface SadtResponse {
    numeroSadt: string;
    pdfBase64: string;
    dataGeracao?: string;
    sucesso?: boolean;
    mensagem?: string;
}

export const useSadt = () => {
    const [loading, setLoading] = useState(false);
    const [sadtGerada, setSadtGerada] = useState<{
        pdfBase64: string;
        numeroSadt: string;
    } | null>(null);
    const [mostrarPreview, setMostrarPreview] = useState(false);

    const gerarSadtPdf = async (request: GerarSadtRequest) => {
        setLoading(true);
        try {
            console.log('📋 Iniciando geração de SADT...', request);

            const resultado = await gerarSadt(request);

            setSadtGerada({
                pdfBase64: resultado.pdfBase64,
                numeroSadt: resultado.numeroSadt
            });

            // ✅ ABRIR AUTOMATICAMENTE PARA IMPRESSÃO
            if (resultado.pdfBase64) {
                imprimirPdf(resultado.pdfBase64);
            }

            toast.success("✅ SADT Gerada com Sucesso!", {
                description: `SADT nº ${resultado.numeroSadt} foi criada e enviada para impressão.`,
            });

            return resultado;
        } catch (error: any) {
            console.error('Erro ao gerar SADT:', error);

            toast.error("❌ Erro ao Gerar SADT", {
                description: error.response?.data?.message || error.message || "Erro interno do servidor"
            });

            throw error;
        } finally {
            setLoading(false);
        }
    };

    const visualizarPdf = () => {
        if (sadtGerada) {
            setMostrarPreview(true);
        }
    };

    const fecharPreview = () => {
        setMostrarPreview(false);
    };

    const downloadPdf = (pdfBase64: string, numeroSadt: string) => {
        try {
            const byteCharacters = atob(pdfBase64);
            const byteNumbers = new Array(byteCharacters.length);
            for (let i = 0; i < byteCharacters.length; i++) {
                byteNumbers[i] = byteCharacters.charCodeAt(i);
            }
            const byteArray = new Uint8Array(byteNumbers);
            const blob = new Blob([byteArray], { type: 'application/pdf' });

            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `SADT_${numeroSadt}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);

            toast.success("📥 Download Concluído", {
                description: `SADT_${numeroSadt}.pdf foi baixado com sucesso.`
            });
        } catch (error) {
            toast.error("❌ Erro no Download", {
                description: "Não foi possível fazer o download do PDF."
            });
        }
    };

    const imprimirPdf = (pdfBase64: string) => {
        try {
            const byteCharacters = atob(pdfBase64);
            const byteNumbers = new Array(byteCharacters.length);
            for (let i = 0; i < byteCharacters.length; i++) {
                byteNumbers[i] = byteCharacters.charCodeAt(i);
            }
            const byteArray = new Uint8Array(byteNumbers);
            const blob = new Blob([byteArray], { type: 'application/pdf' });

            const url = window.URL.createObjectURL(blob);

            // ✅ MÉTODO MELHORADO DE IMPRESSÃO
            const printWindow = window.open('', '_blank', 'width=1024,height=768');

            if (printWindow) {
                const html = `
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <title>SADT - Impressão</title>
                        <style>
                            body { margin: 0; }
                            iframe { width: 100%; height: 100vh; border: none; }
                        </style>
                    </head>
                    <body>
                        <iframe src="data:application/pdf;base64,${pdfBase64}"></iframe>
                        <script>
                            window.addEventListener('load', function() {
                                setTimeout(function() {
                                    window.print();
                                }, 500);
                            });
                        </script>
                    </body>
                    </html>
                `;

                printWindow.document.write(html);
                printWindow.document.close();
            } else {
                // Fallback: iframe oculto se pop-up foi bloqueado
                const iframe = document.createElement('iframe');
                iframe.style.position = 'fixed';
                iframe.style.right = '0';
                iframe.style.bottom = '0';
                iframe.style.width = '0';
                iframe.style.height = '0';
                iframe.style.border = '0';
                iframe.style.visibility = 'hidden';
                iframe.src = url;

                document.body.appendChild(iframe);

                const onLoad = () => {
                    try {
                        iframe.contentWindow?.focus();
                        iframe.contentWindow?.print();
                    } finally {
                        setTimeout(() => {
                            document.body.removeChild(iframe);
                            window.URL.revokeObjectURL(url);
                        }, 1000);
                    }
                };

                iframe.addEventListener('load', onLoad);
                setTimeout(onLoad, 800);
            }

            toast.success("🖨️ SADT enviada para impressão!");

        } catch (error) {
            console.error('Erro ao imprimir PDF:', error);
            toast.error("❌ Erro na Impressão", {
                description: "Não foi possível imprimir o PDF."
            });
        }
    };

    return {
        loading,
        sadtGerada,
        mostrarPreview,
        gerarSadtPdf,
        visualizarPdf,
        fecharPreview,
        downloadPdf,
        imprimirPdf,
        setSadtGerada
    };
};