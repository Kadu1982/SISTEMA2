/**
 * SadtService - Serviço para integração com a API de SADT do backend
 *
 * Este serviço substitui a geração local de SADTs no frontend, permitindo
 * que o layout e a lógica de geração sejam controlados pelo backend.
 *
 * Benefícios:
 * - Layout padronizado e consistente com as regras do sistema
 * - Centralização da lógica de geração no backend
 * - Possibilidade de atualizações no layout sem modificar o frontend
 * - Melhor integração com sistemas externos
 *
 * Em caso de falha na comunicação com o backend, o sistema pode usar
 * o modo de fallback local implementado no hook useReimpressao.
 */
import { DadosReimpressao } from '@/types/Agendamento';
import { GerarSadtRequest, SadtResponse } from '@/hooks/useSadt';
import apiService from './apiService';
import axios from 'axios'; // Ainda precisamos do axios para isAxiosError

// ✅ FUNÇÃO PRINCIPAL PARA GERAR SADT VIA API /sadt/gerar
export const gerarSadt = async (request: GerarSadtRequest): Promise<SadtResponse> => {
    try {
        console.log('📋 Enviando requisição para gerar SADT:', request);

        const response = await apiService.post('/sadt/gerar', {
            agendamento_id: request.agendamento_id,
            paciente_id: request.paciente_id,
            procedimentos: request.procedimentos || [],
            observacoes: request.observacoes || '',
            urgente: request.urgente || false
        });

        if (response.data && response.data.pdfBase64) {
            console.log('✅ SADT gerada com sucesso');

            return {
                numeroSadt: response.data.numeroSadt,
                pdfBase64: response.data.pdfBase64,
                dataGeracao: response.data.dataGeracao,
                sucesso: true,
                mensagem: 'SADT gerada com sucesso'
            };
        } else {
            throw new Error('Resposta inválida do servidor');
        }

    } catch (error: any) {
        console.error('❌ Erro ao gerar SADT:', error);

        let mensagemErro = 'Erro ao gerar SADT';

        if (error.response?.status === 401) {
            mensagemErro = 'Não autorizado - faça login novamente';
        } else if (error.response?.status === 403) {
            mensagemErro = 'Sem permissão para gerar SADT';
        } else if (error.response?.status === 404) {
            mensagemErro = 'Endpoint não encontrado';
        } else if (error.response?.status >= 500) {
            mensagemErro = 'Erro interno do servidor';
        } else if (error.response?.data?.message) {
            mensagemErro = error.response.data.message;
        }

        throw new Error(mensagemErro);
    }
};

/**
 * ✅ NOVO: Gerar SADT via agendamento
 */
export const gerarSadtPorAgendamento = async (agendamentoId: number, operador?: string): Promise<SadtResponse> => {
    try {
        console.log('📋 Gerando SADT para agendamento:', agendamentoId);

        const params = operador ? `?operador=${encodeURIComponent(operador)}` : '';
        const response = await apiService.post(`/agendamentos/${agendamentoId}/gerar-sadt${params}`);

        if (response.data && response.data.pdfBase64) {
            return {
                numeroSadt: response.data.numeroSadt,
                pdfBase64: response.data.pdfBase64,
                dataGeracao: response.data.dataGeracao,
                sucesso: true,
                mensagem: 'SADT gerada com sucesso via agendamento'
            };
        } else {
            throw new Error('Resposta inválida do servidor');
        }

    } catch (error: any) {
        console.error('❌ Erro ao gerar SADT via agendamento:', error);
        throw new Error(error.response?.data?.mensagem || 'Erro ao gerar SADT via agendamento');
    }
};

/**
 * ✅ NOVO: Download direto do PDF
 */
export const downloadSadtPdf = async (agendamentoId: number): Promise<Blob> => {
    try {
        const response = await apiService.get(`/agendamentos/${agendamentoId}/sadt-pdf`, {
            responseType: 'blob'
        });

        return new Blob([response.data], { type: 'application/pdf' });

    } catch (error: any) {
        console.error('❌ Erro ao baixar PDF da SADT:', error);
        throw new Error('Erro ao baixar PDF da SADT');
    }
};

/**
 * Serviço para interação com a API de SADT (compatibilidade com reimpressão)
 */
export class SadtService {
    /**
     * Gera uma SADT no backend e retorna o PDF em base64
     */
    static async gerarSadt(dados: DadosReimpressao): Promise<{ sucesso: boolean; pdfBase64?: string; mensagem: string; erro?: string }> {
        try {
            console.log('📋 Solicitando geração de SADT ao backend para:', dados.pacienteNome);
            console.log('🔄 Dados enviados para o backend:', JSON.stringify({
                agendamentoId: dados.agendamentoId,
                pacienteId: dados.pacienteId,
                pacienteNome: dados.pacienteNome,
                tipo: dados.tipo,
                examesSelecionados: dados.examesSelecionados
            }, null, 2));

            // Mapear os exames selecionados para o formato esperado pelo backend
            const procedimentos = dados.examesSelecionados?.map(exame => ({
                codigo: this.obterCodigoExame(exame),
                nome: exame,
                quantidade: 1,
                // Campos opcionais
                cid10: '',
                justificativa: '',
                preparo: ''
            })) || [];

            // Se não houver exames selecionados, usar um procedimento padrão
            if (procedimentos.length === 0) {
                procedimentos.push({
                    codigo: 'PROC001',
                    nome: 'Procedimento Padrão',
                    quantidade: 1,
                    cid10: '',
                    justificativa: '',
                    preparo: ''
                });
            }

            // Preparar o payload para a API
            const payload = {
                agendamento_id: dados.agendamentoId,
                paciente_id: dados.pacienteId,
                procedimentos: procedimentos,
                observacoes: dados.observacoes || '',
                urgente: dados.prioridade === 'urgente'
            };

            // Chamar a API do backend usando apiService centralizado
            const response = await apiService.post('/sadt/gerar', payload);

            if (response.data && (response.data.pdf_base64 || response.data.pdfBase64)) {
                console.log('✅ SADT gerada com sucesso pelo backend');

                // Usar o campo correto dependendo do formato da resposta
                const pdfBase64 = response.data.pdf_base64 || response.data.pdfBase64;

                // Abrir o PDF em uma nova janela
                this.abrirPdfEmNovaJanela(pdfBase64);

                return {
                    sucesso: true,
                    pdfBase64: pdfBase64,
                    mensagem: `SADT gerada com sucesso para ${dados.pacienteNome}`
                };
            } else {
                throw new Error('Resposta da API não contém o PDF');
            }
        } catch (error) {
            console.error('❌ Erro ao gerar SADT via backend:', error);

            // Tratamento específico para diferentes tipos de erro
            let mensagemErro = 'Erro ao gerar SADT';
            let detalhesErro = '';

            if (axios.isAxiosError(error)) {
                if (error.response) {
                    // Erro de resposta do servidor (4xx, 5xx)
                    const status = error.response.status;
                    if (status === 401 || status === 403) {
                        mensagemErro = 'Erro de autenticação ao acessar o servidor';
                        detalhesErro = 'Verifique se você está logado e tem permissão para esta operação';
                    } else if (status === 404) {
                        mensagemErro = 'API de SADT não encontrada no servidor';
                        detalhesErro = 'Verifique se o backend está configurado corretamente';
                    } else if (status >= 500) {
                        mensagemErro = 'Erro interno no servidor ao gerar SADT';
                        detalhesErro = `Código de erro: ${status}`;
                    } else {
                        mensagemErro = `Erro na requisição: ${status}`;
                        detalhesErro = error.response.data?.message || error.message;
                    }
                } else if (error.request) {
                    // Erro de rede (sem resposta do servidor)
                    mensagemErro = 'Erro de conexão com o servidor';
                    detalhesErro = 'Verifique sua conexão de rede ou se o servidor está online';
                } else {
                    // Erro na configuração da requisição
                    mensagemErro = 'Erro ao configurar requisição para o servidor';
                    detalhesErro = error.message;
                }
            } else if (error instanceof Error) {
                detalhesErro = error.message;
            }

            console.warn(`⚠️ Detalhes do erro: ${mensagemErro} - ${detalhesErro}`);

            return {
                sucesso: false,
                mensagem: mensagemErro,
                erro: detalhesErro || 'Erro desconhecido'
            };
        }
    }

    /**
     * Abre o PDF em uma nova janela do navegador
     */
    private static abrirPdfEmNovaJanela(base64: string): void {
        // Tentar abrir em nova janela e acionar impressão automaticamente
        const pdfWindow = window.open('', '_blank', 'width=1024,height=768');
        const pdfDataUrl = `data:application/pdf;base64,${base64}`;

        if (pdfWindow) {
            // Constrói uma página que carrega o PDF em um iframe e chama print quando possível
            const html = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8" />
            <title>SADT - Visualização</title>
            <style>
              html, body { height: 100%; margin: 0; }
              #pdfFrame { width: 100%; height: 100%; border: 0; }
            </style>
          </head>
          <body>
            <iframe id="pdfFrame" src="${pdfDataUrl}"></iframe>
            <script>
              (function(){
                function tryPrint(){
                  try {
                    window.focus();
                    // Chamar print da janela; alguns navegadores acionam o print do PDF embutido
                    window.print();
                  } catch(e) {
                    // Silenciar e tentar novamente em breve
                  }
                }
                // Tenta após o carregamento do iframe e também com pequeno atraso
                const frame = document.getElementById('pdfFrame');
                if (frame) {
                  frame.addEventListener('load', function(){ setTimeout(tryPrint, 400); });
                }
                setTimeout(tryPrint, 800);
              })();
            </script>
          </body>
        </html>`;

            pdfWindow.document.open();
            pdfWindow.document.write(html);
            pdfWindow.document.close();
            return;
        }

        // Fallback: pop-up bloqueado -> usar um iframe oculto e imprimir
        try {
            const iframe = document.createElement('iframe');
            iframe.style.position = 'fixed';
            iframe.style.right = '0';
            iframe.style.bottom = '0';
            iframe.style.width = '0';
            iframe.style.height = '0';
            iframe.style.border = '0';
            iframe.style.visibility = 'hidden';
            iframe.src = pdfDataUrl;
            document.body.appendChild(iframe);

            const onLoad = () => {
                try {
                    iframe.contentWindow?.focus();
                    iframe.contentWindow?.print();
                } finally {
                    setTimeout(() => {
                        document.body.removeChild(iframe);
                    }, 1200);
                }
            };

            // Alguns navegadores disparam onload corretamente para data URLs
            iframe.addEventListener('load', onLoad);
            // E como segurança, tentar imprimir após pequeno atraso
            setTimeout(onLoad, 1000);
        } catch (e) {
            console.error('Erro ao tentar imprimir PDF via fallback:', e);
            alert('Não foi possível abrir/imprimir o PDF. Verifique o bloqueador de pop-ups.');
        }
    }

    /**
     * Obtém o código do exame com base no nome
     */
    private static obterCodigoExame(nomeExame: string): string {
        // Mapeamento de nomes para códigos SIGTAP (simplificado)
        const codigosExames: Record<string, string> = {
            'Hemograma Completo': '0202020380',
            'Glicemia de Jejum': '0202010473',
            'Colesterol Total': '0202010295',
            'Urina Tipo I': '0202050017',
            'Raio-X de Tórax': '0204030153',
            'Ultrassom Abdominal': '0205020046'
        };

        return codigosExames[nomeExame] || `EXAM${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;
    }
}