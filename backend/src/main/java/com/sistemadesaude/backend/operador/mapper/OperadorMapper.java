package com.sistemadesaude.backend.operador.mapper;

import com.sistemadesaude.backend.operador.dto.OperadorDTO;
import com.sistemadesaude.backend.operador.dto.OperadorListDTO;
import com.sistemadesaude.backend.operador.entity.Operador;
import org.mapstruct.BeanMapping;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;

import java.util.List;

/**
 * Mapper para conversão entre a entidade Operador e seus DTOs.
 * Alinhado com a entidade Operador que utiliza List<String> para o campo 'perfis'.
 */
@Mapper(componentModel = "spring")
public interface OperadorMapper {

    // --- ENTIDADE -> DTO ---

    @Mapping(target = "senha", ignore = true)
    @Mapping(source = "unidadeSaudeId", target = "unidadeId")
    @Mapping(source = "unidadeAtualId", target = "unidadeAtualId")
    @Mapping(target = "nomeUnidade", constant = "")
    @Mapping(target = "nomeUnidadeAtual", constant = "")
    @Mapping(source = "perfis", target = "perfis")
    @Mapping(target = "modulos", ignore = true) // Será preenchido manualmente no service
    OperadorDTO toDTO(Operador operador);

    @Mapping(source = "unidadeSaudeId", target = "unidadeId")
    @Mapping(source = "unidadeAtualId", target = "unidadeAtualId")
    @Mapping(target = "nomeUnidade", constant = "")
    @Mapping(target = "nomeUnidadeAtual", constant = "")
    @Mapping(target = "statusAcesso", expression = "java(operador.getStatusAcesso())")
    @Mapping(source = "perfis", target = "perfis")
    OperadorListDTO toListDTO(Operador operador);

    // --- DTO -> ENTIDADE ---

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "senha", ignore = true)
    @Mapping(source = "unidadeId", target = "unidadeSaudeId")
    @Mapping(source = "unidadeAtualId", target = "unidadeAtualId")
    @Mapping(target = "dataCriacao", ignore = true)
    @Mapping(target = "dataAtualizacao", ignore = true)
    @Mapping(target = "ultimoLogin", ignore = true)
    @Mapping(target = "criadoPor", ignore = true)
    @Mapping(target = "atualizadoPor", ignore = true)
    @Mapping(source = "perfis", target = "perfis")
    Operador toEntity(OperadorDTO operadorDTO);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "login", ignore = true)
    @Mapping(target = "senha", ignore = true)
    @Mapping(target = "perfis", ignore = true) // atualização de perfis é feita via service (atribuirPerfis)
    @Mapping(source = "unidadeId", target = "unidadeSaudeId")
    @Mapping(source = "unidadeAtualId", target = "unidadeAtualId")
    @Mapping(target = "dataCriacao", ignore = true)
    @Mapping(target = "dataAtualizacao", ignore = true)
    @Mapping(target = "criadoPor", ignore = true)
    @Mapping(target = "ultimoLogin", ignore = true)
    void updateEntityFromDTO(@MappingTarget Operador operador, OperadorDTO operadorDTO);

    List<OperadorDTO> toDTOList(List<Operador> operadores);

    List<OperadorListDTO> toListDTOList(List<Operador> operadores);
}
