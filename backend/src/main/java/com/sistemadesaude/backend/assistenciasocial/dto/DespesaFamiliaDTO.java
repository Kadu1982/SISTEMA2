package com.sistemadesaude.backend.assistenciasocial.dto;

import com.sistemadesaude.backend.assistenciasocial.entity.DespesaFamilia;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * DTO para transferência de dados de despesa de família do módulo de Assistência Social.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DespesaFamiliaDTO {

    private Long id;
    private Long familiaId;
    private Long pacienteId;
    private String pacienteNome;
    private Long tipoDespesaId;
    private String tipoDespesaNome;
    private BigDecimal valor;
    private LocalDateTime dataCadastro;
    private LocalDateTime dataAtualizacao;
    private String usuarioCadastro;
    private String usuarioAtualizacao;

    /**
     * Converte uma entidade DespesaFamilia para DTO.
     * @param despesa A entidade a ser convertida.
     * @return O DTO correspondente.
     */
    public static DespesaFamiliaDTO fromEntity(DespesaFamilia despesa) {
        if (despesa == null) {
            return null;
        }
        
        return DespesaFamiliaDTO.builder()
                .id(despesa.getId())
                .familiaId(despesa.getFamilia() != null ? despesa.getFamilia().getId() : null)
                .pacienteId(despesa.getPaciente() != null ? despesa.getPaciente().getId() : null)
                .pacienteNome(despesa.getPaciente() != null ? despesa.getPaciente().getNomeCompleto() : null)
                .tipoDespesaId(despesa.getTipoDespesa() != null ? despesa.getTipoDespesa().getId() : null)
                .tipoDespesaNome(despesa.getTipoDespesa() != null ? despesa.getTipoDespesa().getNome() : null)
                .valor(despesa.getValor())
                .dataCadastro(despesa.getDataCadastro())
                .dataAtualizacao(despesa.getDataAtualizacao())
                .usuarioCadastro(despesa.getUsuarioCadastro())
                .usuarioAtualizacao(despesa.getUsuarioAtualizacao())
                .build();
    }

    /**
     * Converte o DTO para uma entidade DespesaFamilia.
     * Este método não converte os relacionamentos (familia, paciente, tipoDespesa), que devem ser tratados separadamente.
     * @return A entidade correspondente.
     */
    public DespesaFamilia toEntity() {
        DespesaFamilia despesa = new DespesaFamilia();
        despesa.setId(this.id);
        despesa.setValor(this.valor);
        despesa.setDataCadastro(this.dataCadastro);
        despesa.setDataAtualizacao(this.dataAtualizacao);
        despesa.setUsuarioCadastro(this.usuarioCadastro);
        despesa.setUsuarioAtualizacao(this.usuarioAtualizacao);
        return despesa;
    }
}
