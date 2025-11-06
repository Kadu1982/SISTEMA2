package com.sistemadesaude.backend.procedimentosrapidos.mapper;

import com.sistemadesaude.backend.procedimentosrapidos.dto.DesfechoDTO;
import com.sistemadesaude.backend.procedimentosrapidos.entity.Desfecho;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface DesfechoMapper {

    DesfechoDTO toDTO(Desfecho desfecho);

    Desfecho toEntity(DesfechoDTO desfechoDTO);
}
