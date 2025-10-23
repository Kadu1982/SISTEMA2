package com.sistemadesaude.backend.farmacia.mapper;

import com.sistemadesaude.backend.farmacia.dto.FarmaciaDTO;
import com.sistemadesaude.backend.farmacia.entity.Farmacia;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

/**
 * Mapper para converter entre Farmacia e FarmaciaDTO.
 */
@Mapper(componentModel = "spring")
public interface FarmaciaMapper {

    /**
     * Converte entidade Farmacia para FarmaciaDTO
     * @param entity Entidade Farmacia
     * @return FarmaciaDTO
     */
    @Mapping(source = "unidadeSaude.id", target = "unidadeSaudeId")
    FarmaciaDTO toDTO(Farmacia entity);

    /**
     * Converte FarmaciaDTO para entidade Farmacia
     * @param dto FarmaciaDTO
     * @return Entidade Farmacia
     */
    @Mapping(target = "unidadeSaude", ignore = true) // Será setado manualmente no service
    @Mapping(target = "criadoEm", ignore = true) // Será setado automaticamente
    @Mapping(target = "atualizadoEm", ignore = true) // Será setado automaticamente
    Farmacia toEntity(FarmaciaDTO dto);
}
