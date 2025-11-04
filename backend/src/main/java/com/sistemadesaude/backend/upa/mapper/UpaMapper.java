package com.sistemadesaude.backend.upa.mapper;

import com.sistemadesaude.backend.paciente.entity.Paciente;
import com.sistemadesaude.backend.unidadesaude.entity.UnidadeSaude;
import com.sistemadesaude.backend.upa.dto.UpaDTO;
import com.sistemadesaude.backend.upa.entity.Upa;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Mapper de UPA <-> UpaDTO
 *
 * NOTA IMPORTANTE SOBRE TIPOS:
 * - No seu DTO, dataEntrada e horaEntrada são Strings.
 * - Na entidade, dataEntrada = LocalDate e horaEntrada = LocalTime.
 * Portanto:
 *   - Entity -> DTO: formatamos LocalDate/LocalTime para String (ISO).
 *   - DTO -> Entity: parseamos String para LocalDate/LocalTime.
 *
 * Isso evita alterar o frontend/contratos JSON.
 */
@Component
public class UpaMapper {

    /* ========================= Formatadores ========================== */

    private static final DateTimeFormatter DATE_ISO = DateTimeFormatter.ISO_LOCAL_DATE;    // yyyy-MM-dd
    private static final DateTimeFormatter TIME_ISO = DateTimeFormatter.ISO_LOCAL_TIME;    // HH:mm[:ss[.SSS]]

    // Suporte extra (opcional) para dd/MM/yyyy vindo da UI
    private static final DateTimeFormatter DATE_BR = DateTimeFormatter.ofPattern("dd/MM/yyyy");
    // Suporte para horas sem segundos (ex.: "14:30")
    private static final DateTimeFormatter TIME_HM = DateTimeFormatter.ofPattern("H:mm");

    /* ======================== ENTITY -> DTO ========================== */

    public UpaDTO toDTO(Upa entity) {
        if (entity == null) return null;

        UpaDTO dto = new UpaDTO();
        dto.setId(entity.getId());

        // Relacionamentos viram apenas IDs no DTO
        dto.setPacienteId(entity.getPaciente() != null ? entity.getPaciente().getId() : null);
        dto.setUnidadeId(entity.getUnidade() != null ? entity.getUnidade().getId() : null);

        // Nome do paciente para exibição
        if (entity.getPaciente() != null) {
            dto.setPacienteNome(entity.getPaciente().getNomeCompleto());
        }

        // Tipos fortes (enum/datas/boolean)
        dto.setAtivo(entity.isAtivo());
        dto.setStatus(entity.getStatus());         // UpaStatus no DTO
        dto.setPrioridade(entity.getPrioridade()); // UpaPrioridade no DTO

        dto.setMotivo(entity.getMotivo());
        dto.setObservacoes(entity.getObservacoes());

        dto.setDataHoraRegistro(entity.getDataHoraRegistro()); // LocalDateTime -> permanece LocalDateTime no DTO

        // >>> Conversões: Entity (LocalDate/LocalTime) -> DTO (String)
        dto.setDataEntrada(formatDate(entity.getDataEntrada()));
        dto.setHoraEntrada(formatTime(entity.getHoraEntrada()));

        dto.setAtualizadoEm(entity.getAtualizadoEm());

        return dto;
    }

    public List<UpaDTO> toDTO(List<Upa> entities) {
        if (entities == null) return List.of();
        return entities.stream().map(this::toDTO).collect(Collectors.toList());
    }

    /* ======================== DTO -> ENTITY ========================== */

    public Upa toEntity(UpaDTO dto) {
        if (dto == null) return null;

        Upa entity = new Upa();
        entity.setId(dto.getId());                                // se null, JPA gera
        entity.setAtivo(dto.getAtivo() != null ? dto.getAtivo() : true);

        // enums / textos
        if (dto.getStatus() != null)     entity.setStatus(dto.getStatus());
        if (dto.getPrioridade() != null) entity.setPrioridade(dto.getPrioridade());
        entity.setMotivo(dto.getMotivo());
        entity.setObservacoes(dto.getObservacoes());

        // datas/horas (tipos fortes na entidade)
        entity.setDataHoraRegistro(dto.getDataHoraRegistro() != null ? dto.getDataHoraRegistro() : LocalDateTime.now());

        // >>> Conversões: DTO (String) -> Entity (LocalDate/LocalTime)
        entity.setDataEntrada(parseDate(dto.getDataEntrada()));
        entity.setHoraEntrada(parseTime(dto.getHoraEntrada()));

        // relacionamentos via IDs (proxy leve; o JPA só vai carregar se acessar)
        if (dto.getPacienteId() != null) {
            Paciente p = new Paciente();
            p.setId(dto.getPacienteId());
            entity.setPaciente(p);
        }
        if (dto.getUnidadeId() != null) {
            UnidadeSaude u = new UnidadeSaude();
            u.setId(dto.getUnidadeId());
            entity.setUnidade(u);
        }

        return entity;
    }

    /**
     * Atualiza parcialmente (PATCH) uma entidade existente com valores do DTO.
     */
    public void updateEntityFromDTO(UpaDTO dto, Upa entity) {
        if (dto == null || entity == null) return;

        if (dto.getAtivo() != null)       entity.setAtivo(dto.getAtivo());
        if (dto.getStatus() != null)      entity.setStatus(dto.getStatus());
        if (dto.getPrioridade() != null)  entity.setPrioridade(dto.getPrioridade());
        if (dto.getMotivo() != null)      entity.setMotivo(dto.getMotivo());
        if (dto.getObservacoes() != null) entity.setObservacoes(dto.getObservacoes());

        if (dto.getDataHoraRegistro() != null) entity.setDataHoraRegistro(dto.getDataHoraRegistro());

        if (dto.getDataEntrada() != null)      entity.setDataEntrada(parseDate(dto.getDataEntrada()));
        if (dto.getHoraEntrada() != null)      entity.setHoraEntrada(parseTime(dto.getHoraEntrada()));

        if (dto.getPacienteId() != null) {
            if (entity.getPaciente() == null || !dto.getPacienteId().equals(entity.getPaciente().getId())) {
                Paciente p = new Paciente();
                p.setId(dto.getPacienteId());
                entity.setPaciente(p);
            }
        }
        if (dto.getUnidadeId() != null) {
            if (entity.getUnidade() == null || !dto.getUnidadeId().equals(entity.getUnidade().getId())) {
                UnidadeSaude u = new UnidadeSaude();
                u.setId(dto.getUnidadeId());
                entity.setUnidade(u);
            }
        }
    }

    /* =========================== Helpers ============================= */

    private String formatDate(LocalDate date) {
        return date == null ? null : DATE_ISO.format(date); // "yyyy-MM-dd"
    }

    private String formatTime(LocalTime time) {
        return time == null ? null : TIME_ISO.format(time); // "HH:mm:ss" (ou com frações se houver)
    }

    private LocalDate parseDate(String value) {
        if (value == null || value.isBlank()) return null;
        String v = value.trim();
        // Tenta ISO primeiro
        try { return LocalDate.parse(v, DATE_ISO); } catch (DateTimeParseException ignore) {}
        // Tenta formato BR (dd/MM/yyyy)
        try { return LocalDate.parse(v, DATE_BR); } catch (DateTimeParseException ignore) {}
        // Última tentativa: LocalDate.parse sem formatter (deixa o parse padrão tentar)
        return LocalDate.parse(v);
    }

    private LocalTime parseTime(String value) {
        if (value == null || value.isBlank()) return null;
        String v = value.trim();
        // Tenta ISO (aceita HH:mm, HH:mm:ss, HH:mm:ss.SSS)
        try { return LocalTime.parse(v, TIME_ISO); } catch (DateTimeParseException ignore) {}
        // Tenta HH:mm (sem segundos)
        try { return LocalTime.parse(v, TIME_HM); } catch (DateTimeParseException ignore) {}
        // Última tentativa: parser padrão
        return LocalTime.parse(v);
    }
}
