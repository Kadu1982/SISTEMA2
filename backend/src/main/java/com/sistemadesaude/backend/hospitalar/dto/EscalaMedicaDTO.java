package com.sistemadesaude.backend.hospitalar.dto;

import com.sistemadesaude.backend.hospitalar.entity.EscalaMedica;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class EscalaMedicaDTO {

    private Long id;
    private Long profissionalId;
    private String nomeProfissional;
    private String crmProfissional;
    private Long unidadeId;
    private String nomeUnidade;
    private Long especialidadeId;
    private String nomeEspecialidade;
    private LocalDate dataEscala;
    private LocalTime horaInicio;
    private LocalTime horaFim;
    private Integer intervaloConsultaMinutos;
    private Integer vagasDisponiveis;
    private Integer vagasOcupadas;
    private Integer vagasBloqueadas;
    private Integer vagasLivres;
    private EscalaMedica.StatusEscala statusEscala;
    private EscalaMedica.TipoEscala tipoEscala;
    private Boolean permiteEncaixe;
    private Integer vagasEncaixe;
    private String numeroSala;
    private String observacoes;
    private LocalDateTime dataCriacao;
    private Long operadorCriacaoId;
    private String nomeOperadorCriacao;
    private LocalDateTime dataUltimaAlteracao;

    // Campos calculados
    private Boolean hasVagasDisponiveis;
    private Integer totalHorasEscala;
    private Integer totalConsultasPossivel;
}