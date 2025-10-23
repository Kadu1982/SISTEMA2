package com.sistemadesaude.backend.exames.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ConfiguracaoLaboratorioDTO {
    private Long id;
    private Long unidadeId;

    // Aba Laboratório
    private Boolean controleTransacao;
    private Boolean leituraCodigoBarras;
    private Boolean usarEstagiosAtendimento;
    private Boolean integracaoConsorcio;
    private Boolean usarBiometria;
    private Boolean gerarCodigoBarrasAutomatico;
    private Boolean validarIdadeExame;
    private Boolean permitirExameDuplicado;
    private Integer diasValidadeExame;

    // Aba Resultado de Exames
    private Boolean digitacaoResultadoPorCampo;
    private Boolean digitacaoResultadoMemorando;
    private Boolean imprimirResultadoAutomatico;
    private Boolean usarInterfaceamento;
    private String caminhoInterfaceamento;

    // Aba Entrega Exames
    private Boolean verificarDocumentoEntrega;
    private Boolean verificarBiometriaEntrega;
    private Boolean permitirEntregaParcial;
    private Boolean alertarExamePendente;

    // Aba Impressão
    private String impressoraEtiqueta;
    private String impressoraComprovante;
    private String impressoraMapa;
    private String impressoraLaudo;
    private Integer numeroViasEtiqueta;
    private Boolean imprimirEtiquetaRecepcao;
    private Boolean imprimirComprovanteRecepcao;

    // Aba Etiqueta
    private String configuracaoPpla;
    private Integer larguraEtiqueta;
    private Integer alturaEtiqueta;
    private Boolean incluirNomePacienteEtiqueta;
    private Boolean incluirDataNascimentoEtiqueta;

    // Aba Estágios de Atendimento
    private String corEstagioRecepcao;
    private String corEstagioColeta;
    private String corEstagioResultado;
    private String corEstagioEntrega;
    private Integer periodoAlertaColeta;
    private Integer periodoAlertaResultado;

    // Aba Assinatura Eletrônica
    private Boolean usarAssinaturaEletronica;
    private Boolean usarCertificadoDigital;
    private String caminhoImagemAssinatura;

    // Aba Painel Eletrônico
    private Boolean usarPainelEletronico;
    private Integer tempoAtualizacaoPainel;
    private Boolean exibirNomeCompletoPainel;

    // Exportação e-SUS
    private Boolean exportarEsus;
    private String caminhoExportacaoEsus;
}