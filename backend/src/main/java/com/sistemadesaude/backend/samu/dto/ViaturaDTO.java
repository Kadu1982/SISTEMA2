package com.sistemadesaude.backend.samu.dto;

import com.sistemadesaude.backend.samu.enums.StatusViatura;
import com.sistemadesaude.backend.samu.enums.TipoViatura;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * DTO para Viatura
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ViaturaDTO {

    private Long id;
    private String identificacao;
    private String placa;
    private TipoViatura tipo;
    private String tipoDescricao;
    private StatusViatura status;
    private String statusDescricao;
    private Long baseId;
    private String baseNome;
    private Integer kmAtual;
    private Double combustivelAtual;
    private String observacoes;
    private Boolean ativa;

    // Dados calculados
    private Long quantidadeEquipe;
    private Long quantidadeEquipamentos;
    private Double nivelProntidao;
    private String prioridadeManutencao;
    private String resumoStatus;
    private String proximaAcaoRecomendada;

    private LocalDateTime dataCriacao;
    private LocalDateTime dataAtualizacao;
}
