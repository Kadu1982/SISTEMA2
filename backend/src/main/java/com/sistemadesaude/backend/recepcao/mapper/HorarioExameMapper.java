package com.sistemadesaude.backend.recepcao.mapper;

import com.sistemadesaude.backend.recepcao.dto.HorarioExameDTO;
import com.sistemadesaude.backend.recepcao.entity.HorarioExame;
import org.springframework.stereotype.Component;

import java.time.DayOfWeek;
import java.util.HashMap;
import java.util.Map;

@Component
public class HorarioExameMapper {

    private static final Map<DayOfWeek, String> DIAS_SEMANA_PT = new HashMap<>();

    static {
        DIAS_SEMANA_PT.put(DayOfWeek.MONDAY, "Segunda-feira");
        DIAS_SEMANA_PT.put(DayOfWeek.TUESDAY, "Terça-feira");
        DIAS_SEMANA_PT.put(DayOfWeek.WEDNESDAY, "Quarta-feira");
        DIAS_SEMANA_PT.put(DayOfWeek.THURSDAY, "Quinta-feira");
        DIAS_SEMANA_PT.put(DayOfWeek.FRIDAY, "Sexta-feira");
        DIAS_SEMANA_PT.put(DayOfWeek.SATURDAY, "Sábado");
        DIAS_SEMANA_PT.put(DayOfWeek.SUNDAY, "Domingo");
    }

    public HorarioExameDTO toDTO(HorarioExame entity) {
        if (entity == null) return null;

        return HorarioExameDTO.builder()
                .id(entity.getId())
                .profissionalId(entity.getProfissionalId())
                .salaId(entity.getSalaId())
                .unidadeId(entity.getUnidadeId())
                .exameCodigo(entity.getExameCodigo())
                .tipoAgendamento(entity.getTipoAgendamento())
                .diaSemana(entity.getDiaSemana())
                .diaSemanaTexto(DIAS_SEMANA_PT.get(entity.getDiaSemana()))
                .horaInicio(entity.getHoraInicio())
                .horaFim(entity.getHoraFim())
                .intervaloMinutos(entity.getIntervaloMinutos())
                .vagasPorHorario(entity.getVagasPorHorario())
                .permiteEncaixe(entity.getPermiteEncaixe())
                .ativo(entity.getAtivo())
                .observacoes(entity.getObservacoes())
                .quantidadeSlots(entity.calcularQuantidadeSlots())
                .vagasTotais(entity.calcularVagasTotais())
                .build();
    }

    public HorarioExame toEntity(HorarioExameDTO dto) {
        if (dto == null) return null;

        return HorarioExame.builder()
                .id(dto.getId())
                .profissionalId(dto.getProfissionalId())
                .salaId(dto.getSalaId())
                .unidadeId(dto.getUnidadeId())
                .exameCodigo(dto.getExameCodigo())
                .tipoAgendamento(dto.getTipoAgendamento())
                .diaSemana(dto.getDiaSemana())
                .horaInicio(dto.getHoraInicio())
                .horaFim(dto.getHoraFim())
                .intervaloMinutos(dto.getIntervaloMinutos())
                .vagasPorHorario(dto.getVagasPorHorario())
                .permiteEncaixe(dto.getPermiteEncaixe())
                .ativo(dto.getAtivo())
                .observacoes(dto.getObservacoes())
                .build();
    }

    public void updateEntityFromDTO(HorarioExameDTO dto, HorarioExame entity) {
        if (dto == null || entity == null) return;

        if (dto.getProfissionalId() != null) entity.setProfissionalId(dto.getProfissionalId());
        if (dto.getSalaId() != null) entity.setSalaId(dto.getSalaId());
        if (dto.getUnidadeId() != null) entity.setUnidadeId(dto.getUnidadeId());
        if (dto.getExameCodigo() != null) entity.setExameCodigo(dto.getExameCodigo());
        if (dto.getTipoAgendamento() != null) entity.setTipoAgendamento(dto.getTipoAgendamento());
        if (dto.getDiaSemana() != null) entity.setDiaSemana(dto.getDiaSemana());
        if (dto.getHoraInicio() != null) entity.setHoraInicio(dto.getHoraInicio());
        if (dto.getHoraFim() != null) entity.setHoraFim(dto.getHoraFim());
        if (dto.getIntervaloMinutos() != null) entity.setIntervaloMinutos(dto.getIntervaloMinutos());
        if (dto.getVagasPorHorario() != null) entity.setVagasPorHorario(dto.getVagasPorHorario());
        if (dto.getPermiteEncaixe() != null) entity.setPermiteEncaixe(dto.getPermiteEncaixe());
        if (dto.getAtivo() != null) entity.setAtivo(dto.getAtivo());
        if (dto.getObservacoes() != null) entity.setObservacoes(dto.getObservacoes());
    }
}