package com.sistemadesaude.backend.exames.entity;

import com.sistemadesaude.backend.unidadesaude.entity.UnidadeSaude;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "lab_configuracao")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ConfiguracaoLaboratorio {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "unidade_id", nullable = false, unique = true)
    private UnidadeSaude unidade;

    // Aba Laboratório
    @Column(name = "controle_transacao")
    @Builder.Default
    private Boolean controleTransacao = false;

    @Column(name = "leitura_codigo_barras")
    @Builder.Default
    private Boolean leituraCodigoBarras = false;

    @Column(name = "usar_estagios_atendimento")
    @Builder.Default
    private Boolean usarEstagiosAtendimento = false;

    @Column(name = "integracao_consorcio")
    @Builder.Default
    private Boolean integracaoConsorcio = false;

    @Column(name = "usar_biometria")
    @Builder.Default
    private Boolean usarBiometria = false;

    @Column(name = "gerar_codigo_barras_automatico")
    @Builder.Default
    private Boolean gerarCodigoBarrasAutomatico = true;

    @Column(name = "validar_idade_exame")
    @Builder.Default
    private Boolean validarIdadeExame = true;

    @Column(name = "permitir_exame_duplicado")
    @Builder.Default
    private Boolean permitirExameDuplicado = false;

    @Column(name = "dias_validade_exame")
    @Builder.Default
    private Integer diasValidadeExame = 90;

    // Aba Resultado de Exames
    @Column(name = "digitacao_resultado_por_campo")
    @Builder.Default
    private Boolean digitacaoResultadoPorCampo = true;

    @Column(name = "digitacao_resultado_memorando")
    @Builder.Default
    private Boolean digitacaoResultadoMemorando = false;

    @Column(name = "imprimir_resultado_automatico")
    @Builder.Default
    private Boolean imprimirResultadoAutomatico = false;

    @Column(name = "usar_interfaceamento")
    @Builder.Default
    private Boolean usarInterfaceamento = false;

    @Column(name = "caminho_interfaceamento", length = 500)
    private String caminhoInterfaceamento;

    // Aba Entrega Exames
    @Column(name = "verificar_documento_entrega")
    @Builder.Default
    private Boolean verificarDocumentoEntrega = true;

    @Column(name = "verificar_biometria_entrega")
    @Builder.Default
    private Boolean verificarBiometriaEntrega = false;

    @Column(name = "permitir_entrega_parcial")
    @Builder.Default
    private Boolean permitirEntregaParcial = true;

    @Column(name = "alertar_exame_pendente")
    @Builder.Default
    private Boolean alertarExamePendente = true;

    // Aba Impressão
    @Column(name = "impressora_etiqueta", length = 200)
    private String impressoraEtiqueta;

    @Column(name = "impressora_comprovante", length = 200)
    private String impressoraComprovante;

    @Column(name = "impressora_mapa", length = 200)
    private String impressoraMapa;

    @Column(name = "impressora_laudo", length = 200)
    private String impressoraLaudo;

    @Column(name = "numero_vias_etiqueta")
    @Builder.Default
    private Integer numeroViasEtiqueta = 1;

    @Column(name = "imprimir_etiqueta_recepcao")
    @Builder.Default
    private Boolean imprimirEtiquetaRecepcao = true;

    @Column(name = "imprimir_comprovante_recepcao")
    @Builder.Default
    private Boolean imprimirComprovanteRecepcao = true;

    // Aba Etiqueta
    @Lob
    @Column(name = "configuracao_ppla")
    private String configuracaoPpla;

    @Column(name = "largura_etiqueta")
    @Builder.Default
    private Integer larguraEtiqueta = 40;

    @Column(name = "altura_etiqueta")
    @Builder.Default
    private Integer alturaEtiqueta = 25;

    @Column(name = "incluir_nome_paciente_etiqueta")
    @Builder.Default
    private Boolean incluirNomePacienteEtiqueta = true;

    @Column(name = "incluir_data_nascimento_etiqueta")
    @Builder.Default
    private Boolean incluirDataNascimentoEtiqueta = true;

    // Aba Estágios de Atendimento
    @Column(name = "cor_estagio_recepcao", length = 7)
    @Builder.Default
    private String corEstagioRecepcao = "#FFFFFF";

    @Column(name = "cor_estagio_coleta", length = 7)
    @Builder.Default
    private String corEstagioColeta = "#FFFF00";

    @Column(name = "cor_estagio_resultado", length = 7)
    @Builder.Default
    private String corEstagioResultado = "#00FF00";

    @Column(name = "cor_estagio_entrega", length = 7)
    @Builder.Default
    private String corEstagioEntrega = "#0000FF";

    @Column(name = "periodo_alerta_coleta")
    @Builder.Default
    private Integer periodoAlertaColeta = 30;

    @Column(name = "periodo_alerta_resultado")
    @Builder.Default
    private Integer periodoAlertaResultado = 60;

    // Aba Assinatura Eletrônica
    @Column(name = "usar_assinatura_eletronica")
    @Builder.Default
    private Boolean usarAssinaturaEletronica = false;

    @Column(name = "usar_certificado_digital")
    @Builder.Default
    private Boolean usarCertificadoDigital = false;

    @Column(name = "caminho_imagem_assinatura", length = 500)
    private String caminhoImagemAssinatura;

    // Aba Painel Eletrônico
    @Column(name = "usar_painel_eletronico")
    @Builder.Default
    private Boolean usarPainelEletronico = false;

    @Column(name = "tempo_atualizacao_painel")
    @Builder.Default
    private Integer tempoAtualizacaoPainel = 30;

    @Column(name = "exibir_nome_completo_painel")
    @Builder.Default
    private Boolean exibirNomeCompletoPainel = false;

    // Exportação e-SUS
    @Column(name = "exportar_esus")
    @Builder.Default
    private Boolean exportarEsus = false;

    @Column(name = "caminho_exportacao_esus", length = 500)
    private String caminhoExportacaoEsus;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}