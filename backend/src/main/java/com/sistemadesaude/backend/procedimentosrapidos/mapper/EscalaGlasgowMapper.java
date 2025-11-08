package com.sistemadesaude.backend.procedimentosrapidos.mapper;

import com.sistemadesaude.backend.procedimentosrapidos.dto.EscalaGlasgowDTO;
import com.sistemadesaude.backend.procedimentosrapidos.dto.EscalaGlasgowRequestDTO;
import com.sistemadesaude.backend.procedimentosrapidos.entity.EscalaGlasgow;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

/**
 * Mapper para conversão entre EscalaGlasgow e seus DTOs
 */
@Mapper(componentModel = "spring")
public interface EscalaGlasgowMapper {

    @Mapping(source = "paciente.id", target = "pacienteId")
    @Mapping(source = "paciente.nomeCompleto", target = "nomePaciente")
    @Mapping(source = "avaliador.id", target = "avaliadorId")
    @Mapping(source = "avaliador.nome", target = "nomeAvaliador")
    EscalaGlasgowDTO toDTO(EscalaGlasgow entity);

    List<EscalaGlasgowDTO> toDTOList(List<EscalaGlasgow> entities);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "paciente", ignore = true)
    @Mapping(target = "avaliador", ignore = true)
    @Mapping(target = "pontuacaoTotal", ignore = true)
    @Mapping(target = "classificacaoNivelConsciencia", ignore = true)
    @Mapping(target = "dataAvaliacao", expression = "java(java.time.LocalDateTime.now())")
    @Mapping(target = "dataCriacao", ignore = true)
    @Mapping(target = "dataAtualizacao", ignore = true)
    EscalaGlasgow toEntity(EscalaGlasgowRequestDTO dto);
}