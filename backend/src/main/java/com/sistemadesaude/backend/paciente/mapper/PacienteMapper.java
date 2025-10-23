package com.sistemadesaude.backend.paciente.mapper;

import com.sistemadesaude.backend.paciente.dto.PacienteDTO;
import com.sistemadesaude.backend.paciente.dto.PacienteListDTO;
import com.sistemadesaude.backend.paciente.entity.Paciente;
import org.mapstruct.Mapper;

/**
 * Mapper para conversão entre Paciente (entidade) e DTOs.
 */
@Mapper(componentModel = "spring")
public interface PacienteMapper {

    /**
     * Converte entidade para DTO completo
     */
    PacienteDTO toDTO(Paciente paciente);

    /**
     * Converte DTO para entidade
     */
    Paciente toEntity(PacienteDTO pacienteDTO);

    /**
     * Converte entidade para DTO de listagem
     */
    PacienteListDTO toListDTO(Paciente paciente);
}
