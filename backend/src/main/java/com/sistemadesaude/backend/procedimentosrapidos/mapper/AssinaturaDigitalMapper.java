package com.sistemadesaude.backend.procedimentosrapidos.mapper;

import com.sistemadesaude.backend.procedimentosrapidos.dto.AssinaturaDigitalDTO;
import com.sistemadesaude.backend.procedimentosrapidos.dto.AssinaturaDigitalResponseDTO;
import com.sistemadesaude.backend.procedimentosrapidos.entity.AssinaturaDigital;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

/**
 * Mapper para AssinaturaDigital
 */
@Mapper(componentModel = "spring")
public interface AssinaturaDigitalMapper {

    /**
     * Converte entidade para DTO
     */
    AssinaturaDigitalDTO toDTO(AssinaturaDigital entity);

    /**
     * Converte DTO para entidade
     */
    AssinaturaDigital toEntity(AssinaturaDigitalDTO dto);

    /**
     * Converte lista de entidades para lista de DTOs
     */
    List<AssinaturaDigitalDTO> toDTOList(List<AssinaturaDigital> entities);

    /**
     * Converte entidade para response DTO
     */
    @Mapping(target = "timestamp", source = "dataHoraAssinatura")
    @Mapping(target = "coren", source = "corenOperador")
    @Mapping(target = "nomeOperador", ignore = true)
    @Mapping(target = "sucesso", ignore = true)
    @Mapping(target = "mensagem", ignore = true)
    AssinaturaDigitalResponseDTO toResponseDTO(AssinaturaDigital entity);
}