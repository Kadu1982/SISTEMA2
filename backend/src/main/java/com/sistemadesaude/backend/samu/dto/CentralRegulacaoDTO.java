package com.sistemadesaude.backend.samu.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CentralRegulacaoDTO {

    private Long id;
    private String nome;
    private String codigo;
    private String telefone;
    private String endereco;
    private String cidade;
    private String estado;
    private String cep;

    // Informações operacionais
    private Boolean ativa;
    private String horarioFuncionamento;
    private Integer capacidadeMaxima;
    private Integer ocupacaoAtual;

    // Coordenadas para localização
    private Double latitude;
    private Double longitude;

    // Informações de contato
    private String emailContato;
    private String responsavel;

    // Estatísticas básicas
    private Long totalOcorrenciasHoje;
    private Long totalOcorrenciasMes;
    private String statusOperacional;
}
