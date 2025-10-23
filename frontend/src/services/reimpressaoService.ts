import {
    DadosReimpressao,
    TipoDocumentoReimpressao,
    ConfiguracaoReimpressao,
    ResultadoReimpressao,
    getNomeDocumento
} from '@/types/Agendamento';

/**
 * Serviço responsável pela geração e impressão de documentos
 * 
 * ⚠️ ATENÇÃO: Este serviço está DEPRECIADO para geração de SADTs!
 * Para SADTs, utilize SEMPRE o SadtService que se comunica com o backend.
 * 
 * Este serviço gera apenas versões HTML locais que NÃO refletem o layout
 * oficial definido no backend (SadtPdfService.java).
 * 
 * Mantido apenas para compatibilidade e como fallback de emergência.
 */
export class ReimpressaoService {

    /**
     * Gera e imprime um documento baseado nos dados fornecidos
     */
    static async gerarEImprimir(
        dados: DadosReimpressao,
        tipo: TipoDocumentoReimpressao,
        configuracao: ConfiguracaoReimpressao = {
            mostrarBannerReimpressao: true,
            incluirDataOriginal: true
        }
    ): Promise<ResultadoReimpressao> {

        try {
            console.log(`🖨️ Iniciando geração de ${getNomeDocumento(tipo)}:`, dados);

            // Validar dados
            const validacao = this.validarDados(dados, tipo);
            if (!validacao.valido) {
                throw new Error(validacao.erro);
            }

            // Gerar HTML do documento
            const htmlContent = tipo === 'sadt'
                ? this.gerarHtmlSadt(dados, configuracao)
                : this.gerarHtmlComprovante(dados, configuracao);

            // Abrir janela de impressão
            await this.imprimirDocumento(htmlContent);

            return {
                sucesso: true,
                mensagem: `${getNomeDocumento(tipo)} enviado para impressão com sucesso`,
                documentoGerado: htmlContent
            };

        } catch (error) {
            console.error('❌ Erro na reimpressão:', error);
            return {
                sucesso: false,
                mensagem: 'Erro ao gerar documento',
                erro: error instanceof Error ? error.message : 'Erro desconhecido'
            };
        }
    }

    /**
     * Valida os dados necessários para geração do documento
     */
    private static validarDados(dados: DadosReimpressao, tipo: TipoDocumentoReimpressao): { valido: boolean; erro?: string } {
        if (!dados.agendamentoId) {
            return { valido: false, erro: 'ID do recepcao é obrigatório' };
        }

        if (!dados.tipo) {
            return { valido: false, erro: 'Tipo de recepcao é obrigatório' };
        }

        if (!dados.dataHora) {
            return { valido: false, erro: 'Data/hora do recepcao é obrigatória' };
        }

        // Validações específicas por tipo de documento
        if (tipo === 'sadt') {
            const tiposValidos = ['exame_laboratorial', 'exame_imagem', 'procedimento'];
            if (!tiposValidos.includes(dados.tipo)) {
                return { valido: false, erro: 'Este tipo de recepcao não gera SADT' };
            }
        }

        if (tipo === 'comprovante') {
            const tiposValidos = ['consulta_medica', 'consulta_enfermagem', 'vacina'];
            if (!tiposValidos.includes(dados.tipo)) {
                return { valido: false, erro: 'Este tipo de recepcao não gera comprovante' };
            }
        }

        return { valido: true };
    }

    /**
     * Gera HTML para SADT
     * 
     * ⚠️ DEPRECIADO: Este método gera apenas uma versão HTML local que NÃO reflete
     * o layout oficial definido no backend (SadtPdfService.java).
     * Use SadtService.gerarSadt() em vez disso.
     */
    private static gerarHtmlSadt(dados: DadosReimpressao, config: ConfiguracaoReimpressao): string {
        console.warn('⚠️ ATENÇÃO: Usando gerarHtmlSadt do ReimpressaoService que está DEPRECIADO!');
        console.warn('⚠️ Este método gera apenas uma versão HTML local que NÃO reflete o layout oficial do backend.');
        console.warn('⚠️ Para SADTs, utilize SadtService.gerarSadt() que se comunica com o backend.');

        const dataAtual = new Date();
        const dataOriginal = new Date(dados.dataHora);
        const numeroSadt = `SADT${dados.agendamentoId.toString().padStart(6, '0')}`;

        const procedimentos = this.obterProcedimentos(dados);
        const valorTotal = procedimentos.reduce((sum, proc) => sum + (proc.valor * proc.quantidade), 0);

        return `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <title>SADT - ${numeroSadt}</title>
                <style>${this.getEstilosSadt()}</style>
            </head>
            <body>
                ${config.mostrarBannerReimpressao ? this.getBannerReimpressao(dataAtual) : ''}

                <div class="header">
                    <div class="logo">🏥 SECRETARIA MUNICIPAL DE SAÚDE</div>
                    <div class="subtitle">CIDADE SAÚDE DIGITAL - Sistema Integrado de Saúde</div>
                    <div class="documento-titulo">📋 SOLICITAÇÃO DE AUTORIZAÇÃO DE DIAGNÓSTICO E TERAPIA (SADT)</div>
                </div>

                ${this.getSecaoIdentificacao(numeroSadt, dataOriginal, dataAtual, dados, config)}
                ${this.getSecaoPaciente(dados)}
                ${this.getTabelaProcedimentos(procedimentos, valorTotal)}
                ${dados.observacoes ? this.getSecaoObservacoes(dados.observacoes) : ''}
                ${this.getSecaoAutorizacao()}
                ${this.getAssinaturas()}
                ${this.getRodapeSadt(dataOriginal, dataAtual)}
            </body>
            </html>
        `;
    }

    /**
     * Gera HTML para Comprovante
     * 
     * Nota: Este método continua válido para comprovantes, pois não há equivalente no backend.
     * Para SADTs, use sempre SadtService.gerarSadt().
     */
    private static gerarHtmlComprovante(dados: DadosReimpressao, config: ConfiguracaoReimpressao): string {
        console.log('ℹ️ Gerando comprovante HTML local para:', dados.pacienteNome);
        const dataAtual = new Date();
        const dataAgendamento = new Date(dados.dataHora);

        return `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <title>Comprovante de Agendamento</title>
                <style>${this.getEstilosComprovante()}</style>
            </head>
            <body>
                ${config.mostrarBannerReimpressao ? this.getBannerReimpressao(dataAtual) : ''}

                <div class="header">
                    <div class="logo">🏥 CIDADE SAÚDE DIGITAL</div>
                    <div class="subtitle">Sistema Integrado de Saúde Municipal</div>
                </div>

                <div class="content">
                    <h2>📅 COMPROVANTE DE AGENDAMENTO</h2>
                    ${this.getDestaqueConsulta(dados)}
                    ${this.getInformacoesAgendamento(dados, dataAgendamento)}
                    ${this.getInstrucoes(dados)}
                </div>

                ${this.getRodapeComprovante(dataAgendamento, dataAtual)}
            </body>
            </html>
        `;
    }

    /**
     * Abre janela de impressão
     */
    private static async imprimirDocumento(htmlContent: string): Promise<void> {
        return new Promise((resolve, reject) => {
            // Tenta abrir em nova janela/aba (pode ser bloqueado por pop-up blocker)
            const printWindow = window.open('', '_blank', 'width=800,height=600');

            if (!printWindow) {
                console.warn('⚠️ Popup bloqueado. Usando fallback com iframe oculto para impressão.');
                try {
                    // Fallback: usar um iframe oculto para imprimir sem abrir popup
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
                        reject(new Error('Não foi possível criar contexto de impressão.'));
                        return;
                    }

                    iframeDoc.open();
                    iframeDoc.write(htmlContent);
                    iframeDoc.close();

                    const doPrint = () => {
                        try {
                            iframe.contentWindow?.focus();
                            iframe.contentWindow?.print();
                            // Remover iframe após pequena pausa
                            setTimeout(() => {
                                document.body.removeChild(iframe);
                                resolve();
                            }, 1000);
                        } catch (e) {
                            document.body.removeChild(iframe);
                            reject(new Error('Erro ao imprimir via iframe.'));
                        }
                    };

                    // Aguardar carregar recursos básicos
                    setTimeout(doPrint, 400);
                } catch (err) {
                    reject(err instanceof Error ? err : new Error('Falha no fallback de impressão'));
                }
                return;
            }

            // Modo com nova janela
            printWindow.document.write(htmlContent);
            printWindow.document.close();

            printWindow.addEventListener('load', () => {
                setTimeout(() => {
                    try {
                        printWindow.focus();
                        printWindow.print();
                        resolve();
                    } catch (e) {
                        console.warn('⚠️ Erro ao imprimir na nova janela, tentando fallback com iframe...', e);
                        // Fallback se a impressão na janela falhar por algum motivo
                        try {
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
                            if (iframeDoc) {
                                iframeDoc.open();
                                iframeDoc.write(htmlContent);
                                iframeDoc.close();
                                setTimeout(() => {
                                    iframe.contentWindow?.focus();
                                    iframe.contentWindow?.print();
                                    setTimeout(() => {
                                        document.body.removeChild(iframe);
                                        resolve();
                                    }, 1000);
                                }, 400);
                            } else {
                                document.body.removeChild(iframe);
                                reject(new Error('Fallback de impressão falhou.'));
                            }
                        } catch (fallbackErr) {
                            reject(fallbackErr instanceof Error ? fallbackErr : new Error('Erro desconhecido no fallback'));
                        }
                    }
                }, 500);
            });

            printWindow.addEventListener('error', () => {
                reject(new Error('Erro ao carregar documento para impressão'));
            });
        });
    }

    // ✅ MÉTODOS AUXILIARES SIMPLIFICADOS

    private static obterProcedimentos(dados: DadosReimpressao) {
        if (dados.examesSelecionados && dados.examesSelecionados.length > 0) {
            return dados.examesSelecionados.map((exame, index) => ({
                codigo: `EXAM_${(index + 1).toString().padStart(3, '0')}`,
                nome: exame,
                quantidade: 1,
                valor: this.obterValorProcedimento(exame)
            }));
        }

        return this.getProcedimentosPadrao(dados.tipo);
    }

    private static obterValorProcedimento(nomeProcedimento: string): number {
        const valores: Record<string, number> = {
            'Hemograma Completo': 25.00,
            'Glicemia de Jejum': 15.00,
            'Colesterol Total': 18.00,
            'Urina Tipo I': 12.00,
            'Raio-X de Tórax': 80.00,
            'Ultrassom Abdominal': 120.00,
            'Pequena Cirurgia': 150.00,
        };

        return valores[nomeProcedimento] || 30.00;
    }

    private static getProcedimentosPadrao(tipo: string) {
        const procedimentos: Record<string, any[]> = {
            'exame_laboratorial': [
                { codigo: 'LAB001', nome: 'Hemograma Completo', quantidade: 1, valor: 25.00 }
            ],
            'exame_imagem': [
                { codigo: 'IMG001', nome: 'Raio-X de Tórax', quantidade: 1, valor: 80.00 }
            ],
            'procedimento': [
                { codigo: 'PROC001', nome: 'Procedimento Médico', quantidade: 1, valor: 50.00 }
            ]
        };

        return procedimentos[tipo] || [
            { codigo: 'GEN001', nome: 'Procedimento Geral', quantidade: 1, valor: 30.00 }
        ];
    }

    // ✅ MÉTODOS DE ESTILO E HTML (simplificados para reduzir tamanho)

    private static getBannerReimpressao(dataAtual: Date): string {
        return `
            <div class="reimpressao-banner">
                🖨️ REIMPRESSÃO DE DOCUMENTO - ${dataAtual.toLocaleDateString('pt-BR')} às ${dataAtual.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
            </div>
        `;
    }

    private static getEstilosSadt(): string {
        return `
            body { font-family: Arial, sans-serif; margin: 20px; line-height: 1.4; color: #333; }
            .reimpressao-banner { background-color: #e0f2fe; border: 2px solid #0284c7; padding: 15px; margin-bottom: 20px; text-align: center; border-radius: 8px; color: #0c4a6e; font-weight: bold; }
            .header { text-align: center; border-bottom: 2px solid #0066cc; margin-bottom: 20px; padding-bottom: 15px; }
            .logo { font-size: 20px; font-weight: bold; color: #0066cc; margin-bottom: 5px; }
            .subtitle { font-size: 14px; color: #666; margin-bottom: 10px; }
            .documento-titulo { font-size: 18px; font-weight: bold; color: #0066cc; margin-top: 10px; }
            .info-section { margin: 20px 0; padding: 15px; background-color: #f8f9fa; border-radius: 8px; border-left: 4px solid #0066cc; }
            .info-section h3 { margin-top: 0; color: #0066cc; font-size: 16px; }
            .info-row { display: flex; justify-content: space-between; margin: 8px 0; padding: 5px 0; }
            .label { font-weight: bold; color: #333; min-width: 150px; }
            .value { color: #555; text-align: right; flex: 1; }
            .procedures-table { width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 14px; }
            .procedures-table th, .procedures-table td { border: 1px solid #ddd; padding: 10px; text-align: left; }
            .procedures-table th { background-color: #0066cc; color: white; font-weight: bold; }
            .footer { margin-top: 40px; text-align: center; font-size: 12px; color: #666; border-top: 2px solid #ddd; padding-top: 15px; }
        `;
    }

    private static getEstilosComprovante(): string {
        return `
            body { font-family: Arial, sans-serif; margin: 20px; line-height: 1.6; }
            .reimpressao-banner { background-color: #dbeafe; border: 2px solid #2563eb; padding: 15px; margin-bottom: 20px; text-align: center; border-radius: 8px; color: #1e40af; font-weight: bold; }
            .header { text-align: center; border-bottom: 2px solid #2563eb; margin-bottom: 20px; padding-bottom: 10px; }
            .logo { color: #2563eb; font-size: 24px; font-weight: bold; margin-bottom: 5px; }
            .subtitle { color: #6b7280; font-size: 14px; }
            .content { margin: 20px 0; }
            .info-row { display: flex; justify-content: space-between; margin: 10px 0; padding: 8px; background-color: #f8fafc; border-radius: 4px; }
            .label { font-weight: bold; color: #374151; }
            .value { color: #6b7280; }
            .destaque { background-color: #dbeafe; border-left: 4px solid #2563eb; padding: 15px; margin: 20px 0; }
            .footer { margin-top: 30px; text-align: center; color: #6b7280; font-size: 12px; border-top: 1px solid #e5e7eb; padding-top: 10px; }
        `;
    }

    // Métodos auxiliares simplificados
    private static getSecaoIdentificacao(numeroSadt: string, dataOriginal: Date, dataAtual: Date, dados: DadosReimpressao, config: ConfiguracaoReimpressao): string {
        return `<div class="info-section"><h3>📄 Identificação do Documento</h3><div class="info-row"><span class="label">Número da SADT:</span><span class="value">${numeroSadt}</span></div></div>`;
    }

    private static getSecaoPaciente(dados: DadosReimpressao): string {
        let html = `<div class="info-section"><h3>👤 Dados do Paciente</h3>`;
        html += `<div class="info-row"><span class="label">Nome:</span><span class="value">${dados.pacienteNome || 'Não informado'}</span></div>`;

        // Adicionar data de nascimento se disponível
        if (dados.pacienteDataNascimento) {
            const dataNascimento = new Date(dados.pacienteDataNascimento).toLocaleDateString('pt-BR');
            html += `<div class="info-row"><span class="label">Data de Nascimento:</span><span class="value">${dataNascimento}</span></div>`;
        }

        html += `</div>`;
        return html;
    }

    private static getTabelaProcedimentos(procedimentos: any[], valorTotal: number): string {
        return `<div class="info-section"><h3>🩺 Procedimentos</h3><table class="procedures-table"><thead><tr><th>Código</th><th>Procedimento</th><th>Valor</th></tr></thead><tbody>${procedimentos.map(p => `<tr><td>${p.codigo}</td><td>${p.nome}</td><td>R$ ${p.valor.toFixed(2)}</td></tr>`).join('')}</tbody></table></div>`;
    }

    private static getSecaoObservacoes(observacoes: string): string { return `<div class="info-section"><h3>📝 Observações</h3><p>${observacoes}</p></div>`; }
    private static getSecaoAutorizacao(): string { return `<div class="info-section"><h3>✅ Autorização</h3><p>Status: AUTORIZADO</p></div>`; }
    private static getAssinaturas(): string { return `<div style="margin-top: 50px;"><div style="display: flex; justify-content: space-between;"><div style="text-align: center; padding: 20px; border-top: 1px solid #333;">Médico Solicitante</div><div style="text-align: center; padding: 20px; border-top: 1px solid #333;">Responsável pela Autorização</div></div></div>`; }
    private static getRodapeSadt(dataOriginal: Date, dataAtual: Date): string { return `<div class="footer"><strong>Sistema Cidade Saúde Digital</strong><br><small>Reimpresso em: ${dataAtual.toLocaleString('pt-BR')}</small></div>`; }
    private static getDestaqueConsulta(dados: DadosReimpressao): string { return `<div class="destaque"><div style="text-align: center; font-size: 18px; font-weight: bold;">${this.formatarTipoConsulta(dados.tipo)}</div></div>`; }
    private static getInformacoesAgendamento(dados: DadosReimpressao, dataAgendamento: Date): string { return `<div class="info-row"><span class="label">📅 Data:</span><span class="value">${dataAgendamento.toLocaleDateString('pt-BR')}</span></div>`; }
    private static getInstrucoes(dados: DadosReimpressao): string { return `<div style="background-color: #fef3c7; padding: 15px; margin: 20px 0;"><strong>📝 INSTRUÇÕES:</strong><br>• Chegue com 15 minutos de antecedência</div>`; }
    private static getRodapeComprovante(dataOriginal: Date, dataAtual: Date): string { return `<div class="footer"><strong>Comprovante Reimpresso</strong><br><small>Reimpresso em: ${dataAtual.toLocaleString('pt-BR')}</small></div>`; }
    private static formatarTipoConsulta(tipo: string): string { const tipos: Record<string, string> = { 'consulta_medica': '🩺 Consulta Médica', 'consulta_enfermagem': '👩‍⚕️ Consulta de Enfermagem', 'vacina': '💉 Vacinação' }; return tipos[tipo] || tipo.toUpperCase(); }
}
