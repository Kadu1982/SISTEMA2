package com.sistemadesaude.backend.assistenciasocial.dto;

import com.sistemadesaude.backend.assistenciasocial.entity.ProgramaTransferenciaRendaFamilia;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * DTO para transferência de dados de programa de transferência de renda de família do módulo de Assistência Social.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProgramaTransferenciaRendaFamiliaDTO {

    private Long id;
    private Long familiaId;
    private Long pacienteId;
    private String pacienteNome;
    private Long programaId;
    private String programaNome;
    private BigDecimal valor;
    private LocalDate dataEntrada;
    private LocalDate dataDesligamento;
    private String motivoDesligamento;
    private LocalDateTime dataCadastro;
    private LocalDateTime dataAtualizacao;
    private String usuarioCadastro;
    private String usuarioAtualizacao;

    /**
     * Converte uma entidade ProgramaTransferenciaRendaFamilia para DTO.
     * @param programa A entidade a ser convertida.
     * @return O DTO correspondente.
     */
    public static ProgramaTransferenciaRendaFamiliaDTO fromEntity(ProgramaTransferenciaRendaFamilia programa) {
        if (programa == null) {
            return null;
        }
        
        return ProgramaTransferenciaRendaFamiliaDTO.builder()
                .id(programa.getId())
                .familiaId(programa.getFamilia() != null ? programa.getFamilia().getId() : null)
                .pacienteId(programa.getPaciente() != null ? programa.getPaciente().getId() : null)
                .pacienteNome(programa.getPaciente() != null ? programa.getPaciente().getNomeCompleto() : null)
                .programaId(programa.getPrograma() != null ? programa.getPrograma().getId() : null)
                .programaNome(programa.getPrograma() != null ? programa.getPrograma().getNome() : null)
                .valor(programa.getValor())
                .dataEntrada(programa.getDataEntrada())
                .dataDesligamento(programa.getDataDesligamento())
                .motivoDesligamento(programa.getMotivoDesligamento())
                .dataCadastro(programa.getDataCadastro())
                .dataAtualizacao(programa.getDataAtualizacao())
                .usuarioCadastro(programa.getUsuarioCadastro())
                .usuarioAtualizacao(programa.getUsuarioAtualizacao())
                .build();
    }

    /**
     * Converte o DTO para uma entidade ProgramaTransferenciaRendaFamilia.
     * Este método não converte os relacionamentos (familia, paciente, programa), que devem ser tratados separadamente.
     * @return A entidade correspondente.
     */
    public ProgramaTransferenciaRendaFamilia toEntity() {
        ProgramaTransferenciaRendaFamilia programa = new ProgramaTransferenciaRendaFamilia();
        programa.setId(this.id);
        programa.setValor(this.valor);
        programa.setDataEntrada(this.dataEntrada);
        programa.setDataDesligamento(this.dataDesligamento);
        programa.setMotivoDesligamento(this.motivoDesligamento);
        programa.setDataCadastro(this.dataCadastro);
        programa.setDataAtualizacao(this.dataAtualizacao);
        programa.setUsuarioCadastro(this.usuarioCadastro);
        programa.setUsuarioAtualizacao(this.usuarioAtualizacao);
        return programa;
    }
}
