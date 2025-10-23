
import { useState } from 'react';
import { toast } from '@/hooks/use-toast';
import {
    DadosReimpressao,
    TipoDocumentoReimpressao,
    ConfiguracaoReimpressao,
    podeGerarSadt,
    podeGerarComprovante,
    getNomeDocumento
} from '@/types/Agendamento';
import { SadtService } from '@/services/sadtService';

/**
 * ✅ SERVIÇO DE REIMPRESSÃO INTEGRADO NO HOOK
 */
const ReimpressaoService = {
    async gerarEImprimir(
        dados: DadosReimpressao,
        tipo: TipoDocumentoReimpressao,
        config?: ConfiguracaoReimpressao
    ) {
        console.log(`🖨️ Gerando ${tipo}:`, dados);

        if (tipo === 'sadt') {
            return await this.gerarSadt(dados, config);
        } else {
            return await this.gerarComprovante(dados, config);
        }
    },

    async gerarSadt(dados: DadosReimpressao, config?: ConfiguracaoReimpressao) {
        try {
            console.log('📋 Gerando SADT para:', dados.pacienteNome);

            // Gerar HTML da SADT
            const htmlSadt = this.gerarHtmlSadt(dados);

            // Imprimir
            this.imprimirHtml(htmlSadt);

            return {
                sucesso: true,
                mensagem: `SADT gerada e enviada para impressão para ${dados.pacienteNome}`,
                documentoGerado: `SADT_${dados.agendamentoId}_${Date.now()}`
            };
        } catch (error) {
            console.error('❌ Erro ao gerar SADT:', error);
            return {
                sucesso: false,
                erro: 'Erro ao gerar SADT'
            };
        }
    },

    async gerarComprovante(dados: DadosReimpressao, config?: ConfiguracaoReimpressao) {
        try {
            console.log('🎫 Gerando comprovante para:', dados.pacienteNome);

            // Gerar HTML do comprovante
            const htmlComprovante = this.gerarHtmlComprovante(dados);

            // Imprimir
            this.imprimirHtml(htmlComprovante);

            return {
                sucesso: true,
                mensagem: `Comprovante gerado e enviado para impressão para ${dados.pacienteNome}`,
                documentoGerado: `COMP_${dados.agendamentoId}_${Date.now()}`
            };
        } catch (error) {
            console.error('❌ Erro ao gerar comprovante:', error);
            return {
                sucesso: false,
                erro: 'Erro ao gerar comprovante'
            };
        }
    },

    gerarHtmlSadt(dados: DadosReimpressao): string {
        const dataFormatada = new Date(dados.dataHora).toLocaleString('pt-BR');
        const exames = dados.examesSelecionados?.join(', ') || 'Exames não especificados';

        return `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <title>SADT - ${dados.pacienteNome}</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 20px; }
                    .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 10px; }
                    .section { margin: 15px 0; }
                    .label { font-weight: bold; }
                    .patient-info { background: #f5f5f5; padding: 10px; border-radius: 5px; }
                    .procedures { border: 1px solid #ddd; padding: 10px; margin: 10px 0; }
                    @media print { body { margin: 0; } }
                </style>
            </head>
            <body>
                <div class="header">
                    <h1>📋 SOLICITAÇÃO DE AUXÍLIO DIAGNÓSTICO E TERAPÊUTICO (SADT)</h1>
                    <p><strong>Sistema Municipal de Saúde</strong></p>
                    <p>Data de Emissão: ${dataFormatada}</p>
                </div>

                <div class="patient-info">
                    <h2>👤 Dados do Paciente</h2>
                    <p><span class="label">Nome:</span> ${dados.pacienteNome}</p>
                    <p><span class="label">ID:</span> ${dados.pacienteId}</p>
                    <p><span class="label">Data/Hora:</span> ${dataFormatada}</p>
                </div>

                <div class="section">
                    <h2>🏥 Dados do Atendimento</h2>
                    <p><span class="label">Tipo:</span> ${dados.tipo}</p>
                    <p><span class="label">Especialidade:</span> ${dados.especialidade || 'Não especificada'}</p>
                    <p><span class="label">Unidade:</span> ${dados.unidade || 'Unidade Principal'}</p>
                    <p><span class="label">Prioridade:</span> ${dados.prioridade || 'Normal'}</p>
                </div>

                <div class="procedures">
                    <h2>🔬 Procedimentos Solicitados</h2>
                    <p>${exames}</p>
                    ${dados.observacoes ? `<p><span class="label">Observações:</span> ${dados.observacoes}</p>` : ''}
                </div>

                <div class="section" style="margin-top: 30px;">
                    <p><strong>SADT Nº:</strong> SADT${dados.agendamentoId}${Date.now().toString().slice(-4)}</p>
                    <p><strong>Reimpressa em:</strong> ${new Date().toLocaleString('pt-BR')}</p>
                </div>

                <div style="margin-top: 50px; text-align: center; font-size: 12px; color: #666;">
                    <p>Este documento foi gerado automaticamente pelo Sistema Municipal de Saúde</p>
                </div>
            </body>
            </html>
        `;
    },

    gerarHtmlComprovante(dados: DadosReimpressao): string {
        const dataFormatada = new Date(dados.dataHora).toLocaleString('pt-BR');

        return `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <title>Comprovante - ${dados.pacienteNome}</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 20px; }
                    .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 10px; }
                    .info-box { background: #f0f8ff; padding: 15px; border-radius: 8px; margin: 10px 0; }
                    .label { font-weight: bold; color: #333; }
                    @media print { body { margin: 0; } }
                </style>
            </head>
            <body>
                <div class="header">
                    <h1>🎫 COMPROVANTE DE AGENDAMENTO</h1>
                    <p><strong>Sistema Municipal de Saúde</strong></p>
                </div>

                <div class="info-box">
                    <h2>👤 Dados do Paciente</h2>
                    <p><span class="label">Nome:</span> ${dados.pacienteNome}</p>
                    ${dados.pacienteDataNascimento ? `<p><span class="label">Data de Nascimento:</span> ${new Date(dados.pacienteDataNascimento).toLocaleDateString('pt-BR')}</p>` : ''}
                    <p><span class="label">Data/Hora:</span> ${dataFormatada}</p>
                </div>

                <div class="info-box">
                    <h2>📅 Detalhes do Agendamento</h2>
                    <p><span class="label">Tipo:</span> ${dados.tipo}</p>
                    <p><span class="label">Especialidade:</span> ${dados.especialidade || 'Não especificada'}</p>
                    <p><span class="label">Unidade:</span> ${dados.unidade || 'Unidade Principal'}</p>
                    ${dados.observacoes ? `<p><span class="label">Observações:</span> ${dados.observacoes}</p>` : ''}
                </div>

                <div style="margin-top: 30px; text-align: center;">
                    <p><strong>Comprovante Nº:</strong> COMP${dados.agendamentoId}${Date.now().toString().slice(-4)}</p>
                    <p><strong>Reimpressa em:</strong> ${new Date().toLocaleString('pt-BR')}</p>
                </div>
            </body>
            </html>
        `;
    },

    imprimirHtml(html: string) {
        // Tenta abrir uma nova janela/aba para impressão
        const printWindow = window.open('', '_blank');
        if (printWindow) {
            printWindow.document.write(html);
            printWindow.document.close();

            printWindow.onload = () => {
                try {
                    printWindow.focus();
                    printWindow.print();
                    setTimeout(() => printWindow.close(), 1000);
                } catch (e) {
                    console.warn('⚠️ Erro ao imprimir na nova janela, tentando fallback via iframe...', e);
                    ReimpressaoService.imprimirViaIframe(html);
                }
            };
            return;
        }

        // Fallback quando pop-up é bloqueado
        console.warn('⚠️ Popup bloqueado. Usando fallback com iframe oculto para impressão.');
        ReimpressaoService.imprimirViaIframe(html);
    },

    imprimirViaIframe(html: string) {
        const iframe = document.createElement('iframe');
        iframe.style.position = 'fixed';
        iframe.style.right = '0';
        iframe.style.bottom = '0';
        iframe.style.width = '0';
        iframe.style.height = '0';
        iframe.style.border = '0';
        iframe.style.visibility = 'hidden';
        document.body.appendChild(iframe);

        const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
        if (!iframeDoc) {
            document.body.removeChild(iframe);
            throw new Error('Não foi possível criar contexto de impressão');
        }

        iframeDoc.open();
        iframeDoc.write(html);
        iframeDoc.close();

        setTimeout(() => {
            try {
                iframe.contentWindow?.focus();
                iframe.contentWindow?.print();
            } finally {
                setTimeout(() => {
                    document.body.removeChild(iframe);
                }, 1000);
            }
        }, 400);
    }
};

/**
 * Hook personalizado para gerenciar reimpressões de documentos
 */
export const useReimpressao = () => {
    const [isReimprimindo, setIsReimprimindo] = useState(false);
    const [documentoAtual, setDocumentoAtual] = useState<string | null>(null);

    /**
     * Função principal para reimprimir documentos
     */
    const reimprimir = async (
        dadosAgendamento: DadosReimpressao,
        tipoDocumento: TipoDocumentoReimpressao,
        configuracao?: ConfiguracaoReimpressao
    ) => {
        if (isReimprimindo) {
            console.warn('⚠️ Reimpressão já em andamento');
            return;
        }

        setIsReimprimindo(true);
        setDocumentoAtual(null);

        try {
            console.log(`🖨️ Iniciando reimpressão de ${getNomeDocumento(tipoDocumento)}:`, dadosAgendamento);

            // ✅ VALIDAÇÃO CORRETA
            if (!podeReimprimirDocumento(dadosAgendamento, tipoDocumento)) {
                throw new Error(`Este agendamento não pode gerar ${getNomeDocumento(tipoDocumento)}`);
            }

            let resultado;

            // ✅ USAR BACKEND PARA SADT E LOCAL PARA COMPROVANTE
            if (tipoDocumento === 'sadt') {
                // Usar o serviço de backend para SADT
                resultado = await SadtService.gerarSadt(dadosAgendamento);

                if (resultado.sucesso) {
                    setDocumentoAtual(`SADT_${dadosAgendamento.agendamentoId}_${Date.now()}`);

                    toast({
                        title: `🖨️ SADT Gerada pelo Servidor!`,
                        description: `${resultado.mensagem} (Não está mais em MODO LOCAL)`,
                        className: "bg-green-100 text-green-800",
                    });
                } else {
                    console.warn('⚠️ Falha ao gerar SADT no servidor, tentando modo local como fallback');

                    // Mostrar erro detalhado e não usar fallback local
                    // Isso forçará o uso do backend para garantir que as alterações de layout sejam aplicadas
                    toast({
                        title: `❌ Erro ao Gerar SADT no Servidor`,
                        description: `${resultado.erro || 'Erro desconhecido'} - Por favor, tente novamente ou contate o suporte.`,
                        variant: "destructive",
                    });

                    throw new Error(resultado.erro || 'Erro ao gerar SADT no servidor');
                }
            } else {
                // Usar o serviço local para comprovante
                resultado = await ReimpressaoService.gerarEImprimir(
                    dadosAgendamento,
                    tipoDocumento,
                    configuracao
                );

                if (resultado.sucesso) {
                    setDocumentoAtual(resultado.documentoGerado || null);

                    toast({
                        title: `🖨️ ${getNomeDocumento(tipoDocumento)} Reimpresso!`,
                        description: resultado.mensagem,
                        className: "bg-green-100 text-green-800",
                    });
                } else {
                    throw new Error(resultado.erro || 'Erro desconhecido na reimpressão');
                }
            }

        } catch (error) {
            console.error('❌ Erro na reimpressão:', error);

            const mensagemErro = error instanceof Error
                ? error.message
                : 'Erro inesperado ao reimprimir documento';

            toast({
                title: "❌ Erro na Reimpressão",
                description: mensagemErro,
                variant: "destructive",
            });

            throw error;

        } finally {
            setIsReimprimindo(false);
        }
    };

    /**
     * ✅ FUNÇÃO DE VALIDAÇÃO IMPLEMENTADA
     */
    const podeReimprimirDocumento = (
        agendamento: DadosReimpressao,
        tipoDocumento: TipoDocumentoReimpressao
    ): boolean => {
        if (tipoDocumento === 'sadt') {
            return podeGerarSadt(agendamento.tipo);
        }

        if (tipoDocumento === 'comprovante') {
            return podeGerarComprovante(agendamento.tipo);
        }

        return false;
    };

    /**
     * Função específica para reimprimir SADT
     */
    const reimprimirSadt = async (dadosAgendamento: DadosReimpressao) => {
        return reimprimir(dadosAgendamento, 'sadt');
    };

    /**
     * Função específica para reimprimir comprovante
     */
    const reimprimirComprovante = async (dadosAgendamento: DadosReimpressao) => {
        return reimprimir(dadosAgendamento, 'comprovante');
    };

    /**
     * Obtém os tipos de documento disponíveis para um recepcao
     */
    const getDocumentosDisponiveis = (agendamento: DadosReimpressao): TipoDocumentoReimpressao[] => {
        const documentos: TipoDocumentoReimpressao[] = [];

        if (podeGerarSadt(agendamento.tipo)) {
            documentos.push('sadt');
        }

        if (podeGerarComprovante(agendamento.tipo)) {
            documentos.push('comprovante');
        }

        return documentos;
    };

    /**
     * Limpa o documento atual do estado
     */
    const limparDocumentoAtual = () => {
        setDocumentoAtual(null);
    };

    return {
        // Estados
        isReimprimindo,
        documentoAtual,

        // Funções principais
        reimprimir,
        reimprimirSadt,
        reimprimirComprovante,

        // Funções de verificação
        podeReimprimirDocumento,
        getDocumentosDisponiveis,

        // Utilitários
        limparDocumentoAtual
    };
};
