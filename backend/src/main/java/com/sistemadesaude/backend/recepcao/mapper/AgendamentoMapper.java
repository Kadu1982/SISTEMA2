package com.sistemadesaude.backend.recepcao.mapper;

import com.sistemadesaude.backend.recepcao.dto.AgendamentoDTO;
import com.sistemadesaude.backend.recepcao.entity.Agendamento;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;

/**
 * Mapper para converter entre Agendamento e AgendamentoDTO.
 * ✅ CORREÇÃO: Tratamento seguro de campos LOB para evitar "Unable to access lob stream"
 */
@Mapper(componentModel = "spring")
public interface AgendamentoMapper {

    // ✅ LOGGER ESTÁTICO PARA INTERFACE
    Logger log = LoggerFactory.getLogger(AgendamentoMapper.class);

    // ✅ MAPEAMENTO PADRÃO SEM CAMPOS LOB PROBLEMÁTICOS
    @Mapping(source = "paciente.id", target = "pacienteId")
    @Mapping(source = "paciente", target = "pacienteNome", qualifiedByName = "mapPacienteNome")
    @Mapping(source = "paciente.dataNascimento", target = "pacienteDataNascimento", qualifiedByName = "mapDataNascimento")
    @Mapping(source = "observacoes", target = "examesSelecionados", qualifiedByName = "stringToList")
    @Mapping(source = "dataAgendamento", target = "dataAgendamento")
    @Mapping(target = "comprovantePdfBase64", ignore = true) // ✅ IGNORAR CAMPO LOB NO MAPEAMENTO PADRÃO
    AgendamentoDTO toDTO(Agendamento entity);

    // ✅ MAPEAMENTO COMPLETO COM PDF (Para uso específico quando necessário)
    @Mapping(source = "paciente.id", target = "pacienteId")
    @Mapping(source = "paciente", target = "pacienteNome", qualifiedByName = "mapPacienteNome")
    @Mapping(source = "paciente.dataNascimento", target = "pacienteDataNascimento", qualifiedByName = "mapDataNascimento")
    @Mapping(source = "observacoes", target = "examesSelecionados", qualifiedByName = "stringToList")
    @Mapping(source = "dataAgendamento", target = "dataAgendamento")
    @Mapping(source = "comprovantePdfBase64", target = "comprovantePdfBase64", qualifiedByName = "mapPdfSeguro")
    AgendamentoDTO toDTOComPdf(Agendamento entity);

    @Mapping(source = "examesSelecionados", target = "observacoes", qualifiedByName = "listToString")
    @Mapping(target = "paciente", ignore = true)
    @Mapping(target = "comprovantePdfBase64", ignore = true) // Não mapear PDF na conversão reversa
    @Mapping(target = "dataAgendamento", ignore = true) // Não mapear na conversão reversa
    Agendamento toEntity(AgendamentoDTO dto);

    @Named("mapPacienteNome")
    default String mapPacienteNome(com.sistemadesaude.backend.paciente.entity.Paciente paciente) {
        if (paciente == null) {
            return "Paciente não informado";
        }
        return paciente.getNomeExibicao();
    }

    @Named("mapDataNascimento")
    default LocalDateTime mapDataNascimento(java.time.LocalDate dataNascimento) {
        if (dataNascimento == null) {
            return null;
        }
        return dataNascimento.atStartOfDay();
    }

    @Named("stringToList")
    default List<String> stringToList(String observacoes) {
        if (observacoes == null || observacoes.trim().isEmpty()) {
            return Collections.emptyList();
        }
        return Arrays.asList(observacoes.split(","));
    }

    @Named("listToString")
    default String listToString(List<String> examesSelecionados) {
        if (examesSelecionados == null || examesSelecionados.isEmpty()) {
            return null;
        }
        return String.join(",", examesSelecionados);
    }

    // ✅ MAPEAMENTO SEGURO DE PDF COM TRATAMENTO DE ERRO
    @Named("mapPdfSeguro")
    default String mapPdfSeguro(String comprovantePdfBase64) {
        try {
            // Tentar acessar o campo LOB de forma segura
            if (comprovantePdfBase64 != null && !comprovantePdfBase64.isEmpty()) {
                return comprovantePdfBase64;
            }
            return null;
        } catch (Exception e) {
            // ✅ USAR LOGGER ESTÁTICO EM VEZ DE @Slf4j
            log.warn("⚠️ Erro ao acessar PDF durante mapeamento: {}", e.getMessage());
            return null;
        }
    }
}
