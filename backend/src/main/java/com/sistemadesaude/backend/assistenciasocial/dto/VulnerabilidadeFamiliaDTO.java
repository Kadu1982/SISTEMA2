package com.sistemadesaude.backend.assistenciasocial.dto;

import com.sistemadesaude.backend.assistenciasocial.entity.VulnerabilidadeFamilia;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * DTO para transferência de dados de vulnerabilidade de família do módulo de Assistência Social.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VulnerabilidadeFamiliaDTO {

    private Long id;
    private Long familiaId;
    private Long tipoVulnerabilidadeId;
    private String tipoVulnerabilidadeNome;
    private LocalDate dataIdentificacao;
    private LocalDate dataSuperacao;
    private Long profissionalId;
    private String profissionalNome;
    private String observacoes;
    private LocalDateTime dataCadastro;
    private LocalDateTime dataAtualizacao;
    private String usuarioCadastro;
    private String usuarioAtualizacao;

    /**
     * Converte uma entidade VulnerabilidadeFamilia para DTO.
     * @param vulnerabilidade A entidade a ser convertida.
     * @return O DTO correspondente.
     */
    public static VulnerabilidadeFamiliaDTO fromEntity(VulnerabilidadeFamilia vulnerabilidade) {
        if (vulnerabilidade == null) {
            return null;
        }
        
        return VulnerabilidadeFamiliaDTO.builder()
                .id(vulnerabilidade.getId())
                .familiaId(vulnerabilidade.getFamilia() != null ? vulnerabilidade.getFamilia().getId() : null)
                .tipoVulnerabilidadeId(vulnerabilidade.getTipoVulnerabilidade() != null ? vulnerabilidade.getTipoVulnerabilidade().getId() : null)
                .tipoVulnerabilidadeNome(vulnerabilidade.getTipoVulnerabilidade() != null ? vulnerabilidade.getTipoVulnerabilidade().getNome() : null)
                .dataIdentificacao(vulnerabilidade.getDataIdentificacao())
                .dataSuperacao(vulnerabilidade.getDataSuperacao())
                .profissionalId(vulnerabilidade.getProfissional() != null ? vulnerabilidade.getProfissional().getId() : null)
                .profissionalNome(vulnerabilidade.getProfissional() != null ? vulnerabilidade.getProfissional().getNome() : null)
                .observacoes(vulnerabilidade.getObservacoes())
                .dataCadastro(vulnerabilidade.getDataCadastro())
                .dataAtualizacao(vulnerabilidade.getDataAtualizacao())
                .usuarioCadastro(vulnerabilidade.getUsuarioCadastro())
                .usuarioAtualizacao(vulnerabilidade.getUsuarioAtualizacao())
                .build();
    }

    /**
     * Converte o DTO para uma entidade VulnerabilidadeFamilia.
     * Este método não converte os relacionamentos (familia, tipoVulnerabilidade, profissional), que devem ser tratados separadamente.
     * @return A entidade correspondente.
     */
    public VulnerabilidadeFamilia toEntity() {
        VulnerabilidadeFamilia vulnerabilidade = new VulnerabilidadeFamilia();
        vulnerabilidade.setId(this.id);
        vulnerabilidade.setDataIdentificacao(this.dataIdentificacao);
        vulnerabilidade.setDataSuperacao(this.dataSuperacao);
        vulnerabilidade.setObservacoes(this.observacoes);
        vulnerabilidade.setDataCadastro(this.dataCadastro);
        vulnerabilidade.setDataAtualizacao(this.dataAtualizacao);
        vulnerabilidade.setUsuarioCadastro(this.usuarioCadastro);
        vulnerabilidade.setUsuarioAtualizacao(this.usuarioAtualizacao);
        return vulnerabilidade;
    }
}
