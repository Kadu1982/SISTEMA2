package com.sistemadesaude.backend.procedimentosrapidos.mapper;

import com.sistemadesaude.backend.procedimentosrapidos.dto.AtividadeEnfermagemDTO;
import com.sistemadesaude.backend.procedimentosrapidos.entity.AtividadeEnfermagem;
import org.mapstruct.AfterMapping;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface AtividadeEnfermagemMapper {

    @Mapping(target = "atrasada", ignore = true)
    @Mapping(target = "proximoHorario", ignore = true)
    AtividadeEnfermagemDTO toDTO(AtividadeEnfermagem atividade);

    @Mapping(target = "procedimentoRapido", ignore = true)
    AtividadeEnfermagem toEntity(AtividadeEnfermagemDTO atividadeDTO);

    /**
     * Popula campos calculados após o mapeamento
     */
    @AfterMapping
    default void populateCamposCalculados(@MappingTarget AtividadeEnfermagemDTO dto, AtividadeEnfermagem entity) {
        if (entity != null) {
            dto.setAtrasada(entity.isAtrasada());
            dto.setProximoHorario(entity.getProximoHorario());
        }
    }
}
