package com.sistemadesaude.backend.samu.mapper;

import com.sistemadesaude.backend.samu.dto.ViaturaDTO;
import com.sistemadesaude.backend.samu.dto.ViaturaRequestDTO;
import com.sistemadesaude.backend.samu.entity.BaseOperacional;
import com.sistemadesaude.backend.samu.entity.Viatura;
import com.sistemadesaude.backend.samu.enums.StatusViatura;
import org.springframework.stereotype.Component;

/**
 * Mapper para Viatura
 */
@Component
public class ViaturaMapper {

    public ViaturaDTO toDTO(Viatura entity) {
        if (entity == null) {
            return null;
        }

        return ViaturaDTO.builder()
                .id(entity.getId())
                .identificacao(entity.getIdentificacao())
                .placa(entity.getPlaca())
                .tipo(entity.getTipo())
                .tipoDescricao(entity.getTipo() != null ? entity.getTipo().getDescricao() : null)
                .status(entity.getStatus())
                .statusDescricao(entity.getStatus() != null ? entity.getStatus().getDescricao() : null)
                .baseId(entity.getBase() != null ? entity.getBase().getId() : null)
                .baseNome(entity.getBase() != null ? entity.getBase().getNome() : null)
                .kmAtual(entity.getKmAtual())
                .combustivelAtual(entity.getCombustivelAtual())
                .observacoes(entity.getObservacoes())
                .ativa(entity.getAtiva())
                .quantidadeEquipe(entity.getQuantidadeEquipeAtiva())
                .quantidadeEquipamentos(entity.getQuantidadeEquipamentosOperacionais())
                .nivelProntidao(entity.calcularNivelProntidao())
                .prioridadeManutencao(entity.getPrioridadeManutencao())
                .resumoStatus(entity.getResumoStatus())
                .proximaAcaoRecomendada(entity.getProximaAcaoRecomendada())
                .dataCriacao(entity.getDataCriacao())
                .dataAtualizacao(entity.getDataAtualizacao())
                .build();
    }

    public Viatura toEntity(ViaturaRequestDTO dto, BaseOperacional base) {
        if (dto == null) {
            return null;
        }

        return Viatura.builder()
                .identificacao(dto.getIdentificacao())
                .placa(dto.getPlaca())
                .tipo(dto.getTipo())
                .status(dto.getStatus() != null ? dto.getStatus() : StatusViatura.DISPONIVEL)
                .base(base)
                .kmAtual(dto.getKmAtual())
                .combustivelAtual(dto.getCombustivelAtual())
                .observacoes(dto.getObservacoes())
                .ativa(dto.getAtiva() != null ? dto.getAtiva() : true)
                .build();
    }

    public void updateEntity(ViaturaRequestDTO dto, Viatura entity, BaseOperacional base) {
        if (dto == null || entity == null) {
            return;
        }

        if (dto.getIdentificacao() != null) {
            entity.setIdentificacao(dto.getIdentificacao());
        }
        if (dto.getPlaca() != null) {
            entity.setPlaca(dto.getPlaca());
        }
        if (dto.getTipo() != null) {
            entity.setTipo(dto.getTipo());
        }
        if (dto.getStatus() != null) {
            entity.setStatus(dto.getStatus());
        }
        if (base != null) {
            entity.setBase(base);
        }
        if (dto.getKmAtual() != null) {
            entity.setKmAtual(dto.getKmAtual());
        }
        if (dto.getCombustivelAtual() != null) {
            entity.setCombustivelAtual(dto.getCombustivelAtual());
        }
        if (dto.getObservacoes() != null) {
            entity.setObservacoes(dto.getObservacoes());
        }
        if (dto.getAtiva() != null) {
            entity.setAtiva(dto.getAtiva());
        }
    }
}
