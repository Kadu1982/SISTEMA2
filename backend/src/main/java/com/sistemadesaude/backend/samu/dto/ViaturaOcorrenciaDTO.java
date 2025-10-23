package com.sistemadesaude.backend.samu.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ViaturaOcorrenciaDTO {

    private Long id;
    private String codigo;
    private String placa;
    private String tipoViatura; // USA, USB, UTI_MOVEL, HELICOPTERO, MOTOLANCIA
    private String modelo;
    private Integer ano;

    // Status operacional
    private String statusViatura; // DISPONIVEL, A_CAMINHO, NO_LOCAL, TRANSPORTANDO, INDISPONIVEL
    private Boolean ativa;
    private LocalDateTime horaAcionamento;
    private LocalDateTime horaSaida;
    private LocalDateTime horaChegadaLocal;
    private LocalDateTime horaSaidaLocal;
    private LocalDateTime horaChegadaHospital;
    private LocalDateTime horaLiberacao;

    // Localização atual
    private Double latitudeAtual;
    private Double longitudeAtual;
    private String enderecoAtual;
    private Double velocidadeAtual;
    private String direcao;

    // Equipamentos e recursos
    private List<String> equipamentosDisponiveis;
    private String nivelAtendimento; // BASICO, AVANCADO, UTI
    private Integer capacidadePacientes;
    private Boolean temMedico;
    private Boolean temEnfermeiro;

    // Equipe a bordo
    private List<OperadorResumoDTO> equipe;
    private String condutor;
    private String medicoResponsavel;
    private String enfermeiroResponsavel;

    // Informações técnicas
    private Double quilometragemSaida;
    private Double quilometragemChegada;
    private Double combustivelInicial;
    private Double combustivelFinal;
    private String observacoesTecnicas;

    // Base de origem e destino
    private String baseOrigem;
    private String hospitalDestino;
    private Double distanciaPercorrida;
    private String tempoResposta;
    private String tempoTransporte;

    // Custos estimados
    private Double custoOperacional;
    private Double custoCombustivel;
    private String observacoesCusto;
}
