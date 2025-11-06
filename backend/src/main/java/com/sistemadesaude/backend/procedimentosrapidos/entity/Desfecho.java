package com.sistemadesaude.backend.procedimentosrapidos.entity;

import com.sistemadesaude.backend.procedimentosrapidos.enums.TipoDesfecho;
import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import lombok.*;

import java.time.LocalDateTime;

/**
 * Classe Embeddable que representa o desfecho de um atendimento de Procedimentos Rápidos
 */
@Embeddable
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Desfecho {

    @Enumerated(EnumType.STRING)
    @Column(name = "desfecho_tipo", length = 50)
    private TipoDesfecho tipo;

    @Column(name = "desfecho_setor_destino", length = 200)
    private String setorDestino;

    @Column(name = "desfecho_especialidade", length = 200)
    private String especialidade;

    @Column(name = "desfecho_procedimento_solicitado", length = 500)
    private String procedimentoSolicitado;

    @Column(name = "desfecho_data_agendada_reavaliacao")
    private LocalDateTime dataAgendadaReavaliacao;

    @Column(name = "desfecho_observacoes", length = 1000)
    private String observacoes;

    @Column(name = "desfecho_data_registro")
    private LocalDateTime dataRegistro;

    @Column(name = "desfecho_profissional_responsavel", length = 200)
    private String profissionalResponsavel;
}
