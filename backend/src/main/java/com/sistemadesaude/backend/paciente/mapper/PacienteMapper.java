package com.sistemadesaude.backend.paciente.mapper;

import com.sistemadesaude.backend.paciente.dto.PacienteDTO;
import com.sistemadesaude.backend.paciente.dto.PacienteListDTO;
import com.sistemadesaude.backend.paciente.entity.Paciente;
import org.mapstruct.BeanMapping;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;
import org.mapstruct.ReportingPolicy;

/**
 * Mapper para conversão entre Paciente (entidade) e DTOs.
 * Configurado para ignorar propriedades não mapeadas (evita erros de compilação).
 */
@Mapper(
    componentModel = "spring",
    unmappedTargetPolicy = ReportingPolicy.IGNORE,
    unmappedSourcePolicy = ReportingPolicy.IGNORE
)
public interface PacienteMapper {

    /**
     * Converte entidade para DTO completo
     * MapStruct ignora automaticamente campos que não existem no DTO
     */
    PacienteDTO toDTO(Paciente paciente);

    /**
     * Converte DTO para entidade (usado apenas para criação)
     * Ignora campos de auditoria que são gerenciados automaticamente
     */
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "dataAtualizacao", ignore = true)
    @Mapping(target = "dataUltimaMenstruacao", ignore = true)
    Paciente toEntity(PacienteDTO pacienteDTO);

    /**
     * Atualiza entidade existente com dados do DTO
     * Preserva ID e campos de auditoria
     */
    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "dataAtualizacao", ignore = true)
    void updateEntityFromDTO(PacienteDTO dto, @MappingTarget Paciente entity);

    /**
     * Converte entidade para DTO de listagem
     * MapStruct ignora automaticamente campos que não existem no DTO
     */
    PacienteListDTO toListDTO(Paciente paciente);
}
