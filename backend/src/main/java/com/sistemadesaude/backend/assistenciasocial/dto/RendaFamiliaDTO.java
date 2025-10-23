package com.sistemadesaude.backend.assistenciasocial.dto;

import com.sistemadesaude.backend.assistenciasocial.entity.RendaFamilia;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * DTO para transferência de dados de renda de família do módulo de Assistência Social.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RendaFamiliaDTO {

    private Long id;
    private Long familiaId;
    private Long pacienteId;
    private String pacienteNome;
    private Long tipoRendaId;
    private String tipoRendaNome;
    private BigDecimal valor;
    private LocalDateTime dataCadastro;
    private LocalDateTime dataAtualizacao;
    private String usuarioCadastro;
    private String usuarioAtualizacao;

    /**
     * Converte uma entidade RendaFamilia para DTO.
     * @param renda A entidade a ser convertida.
     * @return O DTO correspondente.
     */
    public static RendaFamiliaDTO fromEntity(RendaFamilia renda) {
        if (renda == null) {
            return null;
        }
        
        return RendaFamiliaDTO.builder()
                .id(renda.getId())
                .familiaId(renda.getFamilia() != null ? renda.getFamilia().getId() : null)
                .pacienteId(renda.getPaciente() != null ? renda.getPaciente().getId() : null)
                .pacienteNome(renda.getPaciente() != null ? renda.getPaciente().getNomeCompleto() : null)
                .tipoRendaId(renda.getTipoRenda() != null ? renda.getTipoRenda().getId() : null)
                .tipoRendaNome(renda.getTipoRenda() != null ? renda.getTipoRenda().getNome() : null)
                .valor(renda.getValor())
                .dataCadastro(renda.getDataCadastro())
                .dataAtualizacao(renda.getDataAtualizacao())
                .usuarioCadastro(renda.getUsuarioCadastro())
                .usuarioAtualizacao(renda.getUsuarioAtualizacao())
                .build();
    }

    /**
     * Converte o DTO para uma entidade RendaFamilia.
     * Este método não converte os relacionamentos (familia, paciente, tipoRenda), que devem ser tratados separadamente.
     * @return A entidade correspondente.
     */
    public RendaFamilia toEntity() {
        RendaFamilia renda = new RendaFamilia();
        renda.setId(this.id);
        renda.setValor(this.valor);
        renda.setDataCadastro(this.dataCadastro);
        renda.setDataAtualizacao(this.dataAtualizacao);
        renda.setUsuarioCadastro(this.usuarioCadastro);
        renda.setUsuarioAtualizacao(this.usuarioAtualizacao);
        return renda;
    }
}
