import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import apiService from '@/services/apiService';
import { SadtResponseDTO } from '@/types/Sadt';
import { useToast } from '@/components/ui/use-toast';

interface VerificarSadtResponse {
    precisaSadt: boolean;
    temSadt: boolean;
    podeGerar: boolean;
}

export const useAgendamentoSadt = (agendamentoId: number | null) => {
    const { toast } = useToast();
    const [mostrarPreview, setMostrarPreview] = useState(false);
    const [sadtGerada, setSadtGerada] = useState<SadtResponseDTO | null>(null);

    // ✅ Query para verificar status da SADT
    const {
        data: statusSadt,
        isLoading: loadingStatus,
        refetch: refetchStatus
    } = useQuery<VerificarSadtResponse>({
        queryKey: ['recepcao-sadt-status', agendamentoId],
        queryFn: async () => {
            if (!agendamentoId) throw new Error('ID do recepcao é obrigatório');

            const { data } = await apiService.get(`/agendamentos/${agendamentoId}/precisa-sadt`);
            return data;
        },
        enabled: !!agendamentoId,
        staleTime: 5 * 60 * 1000, // 5 minutos
    });

    // ✅ Mutation para gerar SADT
    const gerarSadtMutation = useMutation({
        mutationFn: async (operador?: string) => {
            if (!agendamentoId) throw new Error('ID do recepcao é obrigatório');

            const params = operador ? `?operador=${encodeURIComponent(operador)}` : '';
            const { data } = await apiService.post(`/agendamentos/${agendamentoId}/gerar-sadt${params}`);
            return data as SadtResponseDTO;
        },
        onSuccess: (data) => {
            setSadtGerada(data);
            refetchStatus(); // Atualiza o status

            toast({
                title: "✅ SADT Gerada com Sucesso!",
                description: `SADT nº ${data.numeroSadt} foi criada e está disponível para impressão.`,
                className: "bg-green-100 text-green-800",
            });
        },
        onError: (error: any) => {
            console.error('Erro ao gerar SADT:', error);

            toast({
                title: "❌ Erro ao Gerar SADT",
                description: error.response?.data?.message || "Erro interno do servidor",
                variant: "destructive",
            });
        }
    });

    // ✅ Função para download do PDF
    const downloadSadtPdf = async () => {
        if (!agendamentoId) {
            toast({
                title: "❌ Erro",
                description: "ID do recepcao não encontrado",
                variant: "destructive",
            });
            return;
        }

        try {
            const response = await apiService.get(`/agendamentos/${agendamentoId}/sadt-pdf`, {
                responseType: 'blob'
            });

            // Criar blob e download
            const blob = new Blob([response.data], { type: 'application/pdf' });
            const url = window.URL.createObjectURL(blob);

            const link = document.createElement('a');
            link.href = url;
            link.download = `SADT_agendamento_${agendamentoId}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);

            toast({
                title: "📥 Download Concluído",
                description: `PDF da SADT foi baixado com sucesso.`,
                className: "bg-blue-100 text-blue-800",
            });
        } catch (error: any) {
            console.error('Erro ao baixar PDF da SADT:', error);

            toast({
                title: "❌ Erro no Download",
                description: error.response?.data?.message || "Não foi possível baixar o PDF",
                variant: "destructive",
            });
        }
    };

    // ✅ Função para imprimir PDF
    const imprimirSadtPdf = async () => {
        if (!agendamentoId) {
            toast({
                title: "❌ Erro",
                description: "ID do recepcao não encontrado",
                variant: "destructive",
            });
            return;
        }

        try {
            const response = await apiService.get(`/agendamentos/${agendamentoId}/sadt-pdf`, {
                responseType: 'blob'
            });

            const blob = new Blob([response.data], { type: 'application/pdf' });
            const url = window.URL.createObjectURL(blob);

            const printWindow = window.open(url);
            if (printWindow) {
                printWindow.addEventListener('load', () => {
                    printWindow.print();
                });
            }
        } catch (error: any) {
            console.error('Erro ao imprimir PDF da SADT:', error);

            toast({
                title: "❌ Erro na Impressão",
                description: error.response?.data?.message || "Não foi possível imprimir o PDF",
                variant: "destructive",
            });
        }
    };

    // ✅ Função para visualizar PDF
    const visualizarSadtPdf = async () => {
        if (!agendamentoId) return;

        try {
            const response = await apiService.get(`/agendamentos/${agendamentoId}/sadt-pdf`, {
                responseType: 'blob'
            });

            const blob = new Blob([response.data], { type: 'application/pdf' });
            const url = window.URL.createObjectURL(blob);

            window.open(url, '_blank');
        } catch (error: any) {
            console.error('Erro ao visualizar PDF da SADT:', error);

            toast({
                title: "❌ Erro na Visualização",
                description: "Não foi possível visualizar o PDF",
                variant: "destructive",
            });
        }
    };

    return {
        // ✅ Estados
        statusSadt,
        loadingStatus,
        sadtGerada,
        mostrarPreview,

        // ✅ Ações de geração
        gerarSadt: gerarSadtMutation.mutate,
        loadingGeracao: gerarSadtMutation.isPending,

        // ✅ Ações com PDF
        downloadSadtPdf,
        imprimirSadtPdf,
        visualizarSadtPdf,

        // ✅ Controles de UI
        setMostrarPreview,
        setSadtGerada,
        refetchStatus,

        // ✅ Computed properties
        precisaSadt: statusSadt?.precisaSadt || false,
        temSadt: statusSadt?.temSadt || false,
        podeGerar: statusSadt?.podeGerar || false,
    };
};

export default useAgendamentoSadt;