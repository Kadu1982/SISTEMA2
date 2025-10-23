package com.sistemadesaude.backend.hospitalar.dto;

import com.sistemadesaude.backend.hospitalar.entity.Leito;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class LeitoDTO {

    private Long id;
    private String numero;
    private String andar;
    private String ala;
    private String enfermaria;
    private Long unidadeId;
    private String nomeUnidade;
    private Long setorId;
    private String nomeSetor;
    private Leito.TipoAcomodacao tipoAcomodacao;
    private Leito.StatusLeito status;
    private Long pacienteId;
    private String nomePaciente;
    private Long atendimentoId;
    private LocalDateTime dataOcupacao;
    private LocalDateTime dataLiberacao;
    private LocalDateTime dataLimpeza;
    private Leito.TipoLimpeza tipoLimpezaNecessaria;
    private Leito.StatusLimpeza statusLimpeza;
    private String motivoInterdicao;
    private LocalDateTime dataInterdicao;
    private Long responsavelInterdicaoId;
    private String nomeResponsavelInterdicao;
    private String observacoes;
    private Integer diasOcupacao;
    private Boolean ativo;
}