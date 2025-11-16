package com.sistemadesaude.backend.operador.mapper;

import com.sistemadesaude.backend.operador.dto.OperadorDTO;
import com.sistemadesaude.backend.operador.dto.OperadorListDTO;
import com.sistemadesaude.backend.operador.entity.Operador;
import com.sistemadesaude.backend.perfilacesso.entity.PerfilEntity;
import org.mapstruct.BeanMapping;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.Named;
import org.mapstruct.NullValuePropertyMappingStrategy;

import java.util.Collections;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * Mapper para conversão entre a entidade Operador e seus DTOs.
 * Converte entre Set<PerfilEntity> (entidade) e List<String> (DTO).
 */
@Mapper(componentModel = "spring")
public interface OperadorMapper {

    // --- ENTIDADE -> DTO ---

    @Mapping(target = "senha", ignore = true)
    @Mapping(source = "unidadeSaudeId", target = "unidadeId")
    @Mapping(source = "unidadeAtualId", target = "unidadeAtualId")
    @Mapping(target = "nomeUnidade", constant = "")
    @Mapping(target = "nomeUnidadeAtual", constant = "")
    @Mapping(source = "perfis", target = "perfis", qualifiedByName = "perfisEntityToString")
    @Mapping(target = "modulos", ignore = true) // Será preenchido manualmente no service
    OperadorDTO toDTO(Operador operador);

    @Mapping(source = "unidadeSaudeId", target = "unidadeId")
    @Mapping(source = "unidadeAtualId", target = "unidadeAtualId")
    @Mapping(target = "nomeUnidade", constant = "")
    @Mapping(target = "nomeUnidadeAtual", constant = "")
    @Mapping(target = "statusAcesso", expression = "java(operador.getStatusAcesso())")
    @Mapping(source = "perfis", target = "perfis", qualifiedByName = "perfisEntityToString")
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
    @Mapping(target = "perfis", ignore = true) // Perfis são gerenciados via service
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

    // --- MÉTODOS DE CONVERSÃO ---

    /**
     * Converte Set<PerfilEntity> para List<String>
     * Retorna os nomes dos perfis (do enum Perfil)
     */
    @Named("perfisEntityToString")
    default List<String> perfisEntityToString(Set<PerfilEntity> perfis) {
        if (perfis == null || perfis.isEmpty()) {
            return Collections.emptyList();
        }
        return perfis.stream()
                .filter(p -> p != null && p.getTipo() != null)
                .map(p -> p.getTipo().name())
                .collect(Collectors.toList());
    }
}
