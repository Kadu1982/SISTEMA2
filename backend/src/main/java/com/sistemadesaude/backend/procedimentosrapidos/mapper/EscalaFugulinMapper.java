package com.sistemadesaude.backend.procedimentosrapidos.mapper;

import com.sistemadesaude.backend.procedimentosrapidos.dto.EscalaFugulinDTO;
import com.sistemadesaude.backend.procedimentosrapidos.dto.EscalaFugulinRequestDTO;
import com.sistemadesaude.backend.procedimentosrapidos.entity.EscalaFugulin;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

/**
 * Mapper para conversão entre EscalaFugulin e seus DTOs
 */
@Mapper(componentModel = "spring")
public interface EscalaFugulinMapper {

    @Mapping(source = "paciente.id", target = "pacienteId")
    @Mapping(source = "paciente.nomeCompleto", target = "nomePaciente")
    @Mapping(source = "avaliador.id", target = "avaliadorId")
    @Mapping(source = "avaliador.nome", target = "nomeAvaliador")
    EscalaFugulinDTO toDTO(EscalaFugulin entity);

    List<EscalaFugulinDTO> toDTOList(List<EscalaFugulin> entities);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "paciente", ignore = true)
    @Mapping(target = "avaliador", ignore = true)
    @Mapping(target = "pontuacaoTotal", ignore = true)
    @Mapping(target = "classificacaoCuidado", ignore = true)
    @Mapping(target = "dataAvaliacao", expression = "java(java.time.LocalDateTime.now())")
    @Mapping(target = "dataCriacao", ignore = true)
    @Mapping(target = "dataAtualizacao", ignore = true)
    EscalaFugulin toEntity(EscalaFugulinRequestDTO dto);
}