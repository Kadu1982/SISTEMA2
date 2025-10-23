package com.sistemadesaude.backend.assistenciasocial.dto;

import com.sistemadesaude.backend.assistenciasocial.entity.MembroFamilia;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * DTO para transferência de dados de membro de família do módulo de Assistência Social.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MembroFamiliaDTO {

    private Long id;
    private Long familiaId;
    private Long pacienteId;
    private String pacienteNome;
    private String parentesco;
    private LocalDateTime dataEntrada;
    private LocalDateTime dataSaida;
    private String motivoSaida;
    private Boolean responsavelFamilia;
    private LocalDateTime dataCadastro;
    private LocalDateTime dataAtualizacao;
    private String usuarioCadastro;
    private String usuarioAtualizacao;

    /**
     * Converte uma entidade MembroFamilia para DTO.
     * @param membro A entidade a ser convertida.
     * @return O DTO correspondente.
     */
    public static MembroFamiliaDTO fromEntity(MembroFamilia membro) {
        if (membro == null) {
            return null;
        }
        
        return MembroFamiliaDTO.builder()
                .id(membro.getId())
                .familiaId(membro.getFamilia() != null ? membro.getFamilia().getId() : null)
                .pacienteId(membro.getPaciente() != null ? membro.getPaciente().getId() : null)
                .pacienteNome(membro.getPaciente() != null ? membro.getPaciente().getNomeCompleto() : null)
                .parentesco(membro.getParentesco())
                .dataEntrada(membro.getDataEntrada())
                .dataSaida(membro.getDataSaida())
                .motivoSaida(membro.getMotivoSaida())
                .responsavelFamilia(membro.getResponsavelFamilia())
                .dataCadastro(membro.getDataCadastro())
                .dataAtualizacao(membro.getDataAtualizacao())
                .usuarioCadastro(membro.getUsuarioCadastro())
                .usuarioAtualizacao(membro.getUsuarioAtualizacao())
                .build();
    }

    /**
     * Converte o DTO para uma entidade MembroFamilia.
     * Este método não converte os relacionamentos (familia, paciente), que devem ser tratados separadamente.
     * @return A entidade correspondente.
     */
    public MembroFamilia toEntity() {
        MembroFamilia membro = new MembroFamilia();
        membro.setId(this.id);
        membro.setParentesco(this.parentesco);
        membro.setDataEntrada(this.dataEntrada);
        membro.setDataSaida(this.dataSaida);
        membro.setMotivoSaida(this.motivoSaida);
        membro.setResponsavelFamilia(this.responsavelFamilia);
        membro.setDataCadastro(this.dataCadastro);
        membro.setDataAtualizacao(this.dataAtualizacao);
        membro.setUsuarioCadastro(this.usuarioCadastro);
        membro.setUsuarioAtualizacao(this.usuarioAtualizacao);
        return membro;
    }
}
