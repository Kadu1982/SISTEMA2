package com.sistemadesaude.backend.atendimento.mapper;

import com.sistemadesaude.backend.atendimento.dto.AtendimentoDTO;
import com.sistemadesaude.backend.atendimento.dto.AtendimentoBasicoDTO;
import com.sistemadesaude.backend.atendimento.entity.Atendimento;
import org.mapstruct.*;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 🔄 MAPPER PARA CONVERTER ENTRE ATENDIMENTO E DTOs
 *
 * ✅ ATUALIZADO: Mapeamento de motivo de desfecho e especialidade
 * ✅ CORRIGIDO: Usar DTOs específicos elimina ambiguidade
 * ✅ PERFORMANCE: DTO básico para listagens
 * ✅ FLEXIBILIDADE: DTO completo para detalhes
 */
@Mapper(
        componentModel = "spring",
        nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE,
        imports = {LocalDateTime.class}
)
public interface AtendimentoMapper {

    // ========================================
    // 📤 ENTITY → DTO COMPLETO
    // ========================================

    /**
     * Converte Entity para DTO completo
     */
    @Mapping(target = "dataAtualizacao", source = "dataAtualizacao")
    @Mapping(target = "motivoDesfecho", source = "motivoDesfecho")
    @Mapping(target = "especialidadeEncaminhamento", source = "especialidadeEncaminhamento")
    @Mapping(target = "pacienteId", expression = "java(entity.getPacienteId() != null ? entity.getPacienteId().toString() : null)")
    @Mapping(target = "profissionalId", expression = "java(entity.getProfissionalId() != null ? entity.getProfissionalId().toString() : null)")
    AtendimentoDTO toDTO(Atendimento entity);

    /**
     * Converte lista de Entity para lista de DTO completo
     */
    List<AtendimentoDTO> toDTOList(List<Atendimento> entities);

    // ========================================
    // 📤 ENTITY → DTO BÁSICO (CORRIGIDO)
    // ========================================

    /**
     * Converte Entity para DTO básico (listagens)
     */
    @Mapping(target = "id", expression = "java(entity.getId() != null ? entity.getId().toString() : null)")
    @Mapping(target = "pacienteId", expression = "java(entity.getPacienteId() != null ? entity.getPacienteId().toString() : null)")
    @Mapping(target = "profissionalId", expression = "java(entity.getProfissionalId() != null ? entity.getProfissionalId().toString() : null)")
    @Mapping(target = "motivoDesfecho", source = "motivoDesfecho")
    AtendimentoBasicoDTO toDTOBasico(Atendimento entity);

    /**
     * Lista com dados básicos
     */
    List<AtendimentoBasicoDTO> toDTOBasicoList(List<Atendimento> entities);

    // ========================================
    // 📥 DTO → ENTITY
    // ========================================

    /**
     * Converte DTO para Entity (criação)
     */
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "dataCriacao", expression = "java(LocalDateTime.now())")
    @Mapping(target = "dataAtualizacao", ignore = true)
    @Mapping(target = "ativo", constant = "true")
    @Mapping(target = "pacienteId", expression = "java(converterPacienteId(dto.getPacienteId()))")
    @Mapping(target = "profissionalId", expression = "java(converterProfissionalId(dto.getProfissionalId()))")
    @Mapping(target = "motivoDesfecho", source = "motivoDesfecho")
    @Mapping(target = "especialidadeEncaminhamento", source = "especialidadeEncaminhamento")
    @BeanMapping(builder = @Builder(disableBuilder = true))
    Atendimento toEntity(AtendimentoDTO dto);

    /**
     * Converte lista de DTO para lista de Entity
     */
    List<Atendimento> toEntityList(List<AtendimentoDTO> dtos);

    // ========================================
    // 🔄 UPDATE MAPPING
    // ========================================

    /**
     * Atualiza Entity existente com dados do DTO
     */
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "dataCriacao", ignore = true)
    @Mapping(target = "dataAtualizacao", expression = "java(LocalDateTime.now())")
    @Mapping(target = "pacienteId", expression = "java(converterPacienteId(dto.getPacienteId()))")
    @Mapping(target = "profissionalId", expression = "java(converterProfissionalId(dto.getProfissionalId()))")
    @Mapping(target = "motivoDesfecho", source = "motivoDesfecho")
    @Mapping(target = "especialidadeEncaminhamento", source = "especialidadeEncaminhamento")
    void updateEntityFromDTO(AtendimentoDTO dto, @MappingTarget Atendimento entity);

    // ========================================
    // 🔧 MÉTODOS AUXILIARES
    // ========================================

    /**
     * Converte pacienteId String para Long
     */
    default Long converterPacienteId(String pacienteId) {
        if (pacienteId == null || pacienteId.trim().isEmpty()) {
            return null;
        }
        try {
            return Long.parseLong(pacienteId.trim());
        } catch (NumberFormatException e) {
            throw new IllegalArgumentException("PacienteId deve ser um número válido: " + pacienteId);
        }
    }

    /**
     * Converte profissionalId String para Long
     */
    default Long converterProfissionalId(String profissionalId) {
        if (profissionalId == null || profissionalId.trim().isEmpty()) {
            return null;
        }
        try {
            return Long.parseLong(profissionalId.trim());
        } catch (NumberFormatException e) {
            throw new IllegalArgumentException("ProfissionalId deve ser um número válido: " + profissionalId);
        }
    }
}