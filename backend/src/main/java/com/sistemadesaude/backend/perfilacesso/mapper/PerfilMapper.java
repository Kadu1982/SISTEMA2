package com.sistemadesaude.backend.perfilacesso.mapper;

import com.sistemadesaude.backend.perfilacesso.dto.PerfilDTO;
import com.sistemadesaude.backend.perfilacesso.entity.PerfilEntity;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.Named;

import java.util.List;

/**
 * Mapper para conversão entre PerfilEntity e PerfilDTO
 */
@Mapper(componentModel = "spring")
public interface PerfilMapper {

    /**
     * Converte entidade para DTO
     */
    @Mapping(target = "codigo", source = "tipo.codigo")
    @Mapping(target = "nomeExibicao", expression = "java(entity.getNomeExibicao())")
    @Mapping(target = "nivel", expression = "java(entity.getNivel())")
    @Mapping(target = "isAdmin", expression = "java(entity.isAdmin())")
    @Mapping(target = "isProfissionalSaude", expression = "java(entity.isProfissionalSaude())")
    PerfilDTO toDTO(PerfilEntity entity);

    /**
     * Converte lista de entidades para DTOs
     */
    List<PerfilDTO> toDTOList(List<PerfilEntity> entities);

    /**
     * Converte DTO para entidade
     */
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "dataCriacao", ignore = true)
    @Mapping(target = "dataAtualizacao", ignore = true)
    PerfilEntity toEntity(PerfilDTO dto);

    /**
     * Atualiza entidade existente com dados do DTO
     */
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "tipo", ignore = true) // Não permitir alterar o tipo
    @Mapping(target = "dataCriacao", ignore = true)
    @Mapping(target = "dataAtualizacao", ignore = true)
    @Mapping(target = "criadoPor", ignore = true)
    void updateEntityFromDTO(@MappingTarget PerfilEntity entity, PerfilDTO dto);
}
