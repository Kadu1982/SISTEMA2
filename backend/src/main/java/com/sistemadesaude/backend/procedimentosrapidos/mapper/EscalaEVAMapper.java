package com.sistemadesaude.backend.procedimentosrapidos.mapper;

import com.sistemadesaude.backend.procedimentosrapidos.dto.EscalaEVADTO;
import com.sistemadesaude.backend.procedimentosrapidos.dto.EscalaEVARequestDTO;
import com.sistemadesaude.backend.procedimentosrapidos.entity.EscalaEVA;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

/**
 * Mapper para conversão entre EscalaEVA e seus DTOs
 */
@Mapper(componentModel = "spring")
public interface EscalaEVAMapper {

    @Mapping(source = "paciente.id", target = "pacienteId")
    @Mapping(source = "paciente.nomeCompleto", target = "nomePaciente")
    @Mapping(source = "avaliador.id", target = "avaliadorId")
    @Mapping(source = "avaliador.nome", target = "nomeAvaliador")
    EscalaEVADTO toDTO(EscalaEVA entity);

    List<EscalaEVADTO> toDTOList(List<EscalaEVA> entities);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "paciente", ignore = true)
    @Mapping(target = "avaliador", ignore = true)
    @Mapping(target = "classificacaoDor", ignore = true)
    @Mapping(target = "dataAvaliacao", expression = "java(java.time.LocalDateTime.now())")
    @Mapping(target = "dataCriacao", ignore = true)
    @Mapping(target = "dataAtualizacao", ignore = true)
    EscalaEVA toEntity(EscalaEVARequestDTO dto);
}