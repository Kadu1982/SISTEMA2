package com.sistemadesaude.backend.exames.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ExameDTO {
    private Long id;
    private String codigo;
    private String nome;
    private String nomeResumido;
    private Long grupoId;
    private String grupoNome;
    private String sinonimo;
    private String codigoSigtap;
    private String codigoTuss;
    private Boolean ativo;

    // Validações
    private Integer idadeMinima;
    private Integer idadeMaxima;
    private String sexoPermitido;  // "MASCULINO", "FEMININO", "AMBOS"
    private Integer diasValidade;

    // Agendamento/Atendimento
    private Boolean permiteAgendamento;
    private Boolean exameUrgencia;
    private Integer tempoRealizacaoMinutos;
    private Integer quantidadeSessoes;
    private String orientacoesPaciente;
    private String preparo;

    // Mapa
    private Long mapaId;
    private String mapaDescricao;
    private Integer ordemMapa;

    // Digitação
    private String tipoDigitacao;  // "POR_CAMPO", "MEMORANDO", "MISTO"
    private String modeloLaudo;
    private Boolean usarAssinaturaEletronica;

    // Faturamento
    private BigDecimal valorParticular;
    private BigDecimal valorSus;
    private String tipoFaturamento;  // "BPA", "APAC", "PRESTADOR", "NAO_FATURA"

    // Interfaceamento
    private String codigoEquipamento;
    private Boolean usaInterfaceamento;

    // Relacionamentos
    private List<MaterialExameDTO> materiais;
    private List<CampoExameDTO> campos;
    private List<Long> examesComplementaresIds;

    // Auditoria
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}