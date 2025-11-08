package com.sistemadesaude.backend.procedimentosrapidos.mapper;

import com.sistemadesaude.backend.procedimentosrapidos.dto.EscalaMorseDTO;
import com.sistemadesaude.backend.procedimentosrapidos.dto.EscalaMorseRequestDTO;
import com.sistemadesaude.backend.procedimentosrapidos.entity.EscalaMorse;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

/**
 * Mapper para conversão entre EscalaMorse e seus DTOs
 */
@Mapper(componentModel = "spring")
public interface EscalaMorseMapper {

    @Mapping(source = "paciente.id", target = "pacienteId")
    @Mapping(source = "paciente.nomeCompleto", target = "nomePaciente")
    @Mapping(source = "avaliador.id", target = "avaliadorId")
    @Mapping(source = "avaliador.nome", target = "nomeAvaliador")
    EscalaMorseDTO toDTO(EscalaMorse entity);

    List<EscalaMorseDTO> toDTOList(List<EscalaMorse> entities);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "paciente", ignore = true)
    @Mapping(target = "avaliador", ignore = true)
    @Mapping(target = "pontuacaoTotal", ignore = true)
    @Mapping(target = "classificacaoRisco", ignore = true)
    @Mapping(target = "dataAvaliacao", expression = "java(java.time.LocalDateTime.now())")
    @Mapping(target = "dataCriacao", ignore = true)
    @Mapping(target = "dataAtualizacao", ignore = true)
    EscalaMorse toEntity(EscalaMorseRequestDTO dto);
}