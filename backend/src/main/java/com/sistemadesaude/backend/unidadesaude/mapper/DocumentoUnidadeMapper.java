package com.sistemadesaude.backend.unidadesaude.mapper;

import com.sistemadesaude.backend.unidadesaude.dto.DocumentoUnidadeDTO;
import com.sistemadesaude.backend.unidadesaude.entity.DocumentoUnidade;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

import java.util.List;

@Mapper(componentModel = "spring")
public interface DocumentoUnidadeMapper {

    DocumentoUnidadeDTO toDTO(DocumentoUnidade entity);

    List<DocumentoUnidadeDTO> toDTOList(List<DocumentoUnidade> entities);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "unidade", ignore = true)
    DocumentoUnidade toEntity(DocumentoUnidadeDTO dto);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "unidade", ignore = true)
    void updateEntityFromDTO(@MappingTarget DocumentoUnidade entity, DocumentoUnidadeDTO dto);
}
