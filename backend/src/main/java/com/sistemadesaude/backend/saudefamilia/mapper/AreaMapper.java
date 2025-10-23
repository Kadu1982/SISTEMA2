package com.sistemadesaude.backend.saudefamilia.mapper;

import com.sistemadesaude.backend.saudefamilia.dto.AreaCreateUpdateDTO;
import com.sistemadesaude.backend.saudefamilia.dto.AreaDTO;
import com.sistemadesaude.backend.saudefamilia.entity.Area;
import org.mapstruct.*;

@Mapper(componentModel = "spring")
public interface AreaMapper {
    AreaDTO toDto(Area entity);
    Area toEntity(AreaCreateUpdateDTO dto);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    void updateEntityFromDto(AreaCreateUpdateDTO dto, @MappingTarget Area entity);
}
