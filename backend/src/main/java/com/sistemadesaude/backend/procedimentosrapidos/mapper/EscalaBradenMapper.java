package com.sistemadesaude.backend.procedimentosrapidos.mapper;

import com.sistemadesaude.backend.procedimentosrapidos.dto.EscalaBradenDTO;
import com.sistemadesaude.backend.procedimentosrapidos.dto.EscalaBradenRequestDTO;
import com.sistemadesaude.backend.procedimentosrapidos.entity.EscalaBraden;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

/**
 * Mapper para conversão entre EscalaBraden e seus DTOs
 */
@Mapper(componentModel = "spring")
public interface EscalaBradenMapper {

    @Mapping(source = "paciente.id", target = "pacienteId")
    @Mapping(source = "paciente.nomeCompleto", target = "nomePaciente")
    @Mapping(source = "avaliador.id", target = "avaliadorId")
    @Mapping(source = "avaliador.nome", target = "nomeAvaliador")
    EscalaBradenDTO toDTO(EscalaBraden entity);

    List<EscalaBradenDTO> toDTOList(List<EscalaBraden> entities);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "paciente", ignore = true)
    @Mapping(target = "avaliador", ignore = true)
    @Mapping(target = "pontuacaoTotal", ignore = true)
    @Mapping(target = "classificacaoRisco", ignore = true)
    @Mapping(target = "dataAvaliacao", expression = "java(java.time.LocalDateTime.now())")
    @Mapping(target = "dataCriacao", ignore = true)
    @Mapping(target = "dataAtualizacao", ignore = true)
    EscalaBraden toEntity(EscalaBradenRequestDTO dto);
}