package com.sistemadesaude.backend.procedimentosrapidos.mapper;

import com.sistemadesaude.backend.procedimentosrapidos.dto.ProcedimentoRapidoDTO;
import com.sistemadesaude.backend.procedimentosrapidos.dto.ProcedimentoRapidoListDTO;
import com.sistemadesaude.backend.procedimentosrapidos.entity.AtividadeEnfermagem;
import com.sistemadesaude.backend.procedimentosrapidos.entity.ProcedimentoRapido;
import com.sistemadesaude.backend.procedimentosrapidos.enums.SituacaoAtividade;
import org.mapstruct.AfterMapping;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring", uses = {AtividadeEnfermagemMapper.class, DesfechoMapper.class})
public interface ProcedimentoRapidoMapper {

    @Mapping(source = "paciente.id", target = "pacienteId")
    @Mapping(source = "paciente.nomeCompleto", target = "pacienteNome")
    @Mapping(source = "paciente.cpf", target = "pacienteCpf")
    @Mapping(source = "operadorResponsavel.id", target = "operadorResponsavelId")
    @Mapping(source = "operadorResponsavel.nome", target = "operadorResponsavelNome")
    @Mapping(target = "pacienteIdade", ignore = true)
    @Mapping(target = "bloqueadoPorOperadorNome", ignore = true)
    @Mapping(target = "bloqueado", ignore = true)
    @Mapping(target = "temAtividadesPendentes", ignore = true)
    @Mapping(target = "quantidadeAtividadesPendentes", ignore = true)
    ProcedimentoRapidoDTO toDTO(ProcedimentoRapido procedimento);

    @Mapping(source = "paciente.nomeCompleto", target = "pacienteNome")
    @Mapping(source = "operadorResponsavel.nome", target = "operadorResponsavelNome")
    @Mapping(target = "pacienteIdade", ignore = true)
    @Mapping(target = "quantidadeAtividadesPendentes", ignore = true)
    @Mapping(target = "quantidadeAtividadesTotal", ignore = true)
    @Mapping(target = "temAtividadesUrgentes", ignore = true)
    @Mapping(target = "temAtividadesAtrasadas", ignore = true)
    @Mapping(target = "bloqueado", ignore = true)
    ProcedimentoRapidoListDTO toListDTO(ProcedimentoRapido procedimento);

    @Mapping(target = "paciente", ignore = true)
    @Mapping(target = "operadorResponsavel", ignore = true)
    @Mapping(target = "atividades", ignore = true)
    @Mapping(target = "dataCriacao", ignore = true)
    @Mapping(target = "dataAtualizacao", ignore = true)
    ProcedimentoRapido toEntity(ProcedimentoRapidoDTO procedimentoDTO);

    /**
     * Popula campos calculados no DTO completo
     */
    @AfterMapping
    default void populateCamposCalculadosDTO(@MappingTarget ProcedimentoRapidoDTO dto, ProcedimentoRapido entity) {
        if (entity != null) {
            // Idade do paciente
            if (entity.getPaciente() != null) {
                dto.setPacienteIdade(entity.getPaciente().getIdade());
            }

            // Bloqueio
            dto.setBloqueado(entity.isBloqueado());

            // Atividades pendentes
            dto.setTemAtividadesPendentes(entity.temAtividadesPendentes());
            dto.setQuantidadeAtividadesPendentes(entity.contarAtividadesPendentes());
        }
    }

    /**
     * Popula campos calculados no DTO de listagem
     * SIMPLIFICADO: Define valores padrão seguros
     */
    @AfterMapping
    default void populateCamposCalculadosListDTO(@MappingTarget ProcedimentoRapidoListDTO dto, ProcedimentoRapido entity) {
        if (entity == null) return;

        // Valores padrão seguros
        dto.setBloqueado(false);
        dto.setQuantidadeAtividadesTotal(0L);
        dto.setQuantidadeAtividadesPendentes(0L);
        dto.setTemAtividadesUrgentes(false);
        dto.setTemAtividadesAtrasadas(false);
        dto.setPacienteIdade(null);
    }
}
