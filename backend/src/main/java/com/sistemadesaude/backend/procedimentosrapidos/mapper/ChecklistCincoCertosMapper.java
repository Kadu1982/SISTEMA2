package com.sistemadesaude.backend.procedimentosrapidos.mapper;

import com.sistemadesaude.backend.procedimentosrapidos.dto.ChecklistCincoCertosDTO;
import com.sistemadesaude.backend.procedimentosrapidos.entity.ChecklistCincoCertos;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

/**
 * Mapper para ChecklistCincoCertos
 */
@Mapper(componentModel = "spring")
public interface ChecklistCincoCertosMapper {

    /**
     * Converte entidade para DTO
     */
    @Mapping(target = "atividadeEnfermagemId", source = "atividadeEnfermagem.id")
    @Mapping(target = "completo", expression = "java(entity.isCompleto())")
    @Mapping(target = "camposNaoValidados", expression = "java(entity.getCamposNaoValidados())")
    ChecklistCincoCertosDTO toDTO(ChecklistCincoCertos entity);

    /**
     * Converte DTO para entidade
     */
    @Mapping(target = "atividadeEnfermagem", ignore = true)
    ChecklistCincoCertos toEntity(ChecklistCincoCertosDTO dto);
}