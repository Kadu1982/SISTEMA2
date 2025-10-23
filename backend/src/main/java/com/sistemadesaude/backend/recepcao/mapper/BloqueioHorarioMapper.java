package com.sistemadesaude.backend.recepcao.mapper;

import com.sistemadesaude.backend.recepcao.dto.BloqueioHorarioDTO;
import com.sistemadesaude.backend.recepcao.entity.BloqueioHorario;
import org.springframework.stereotype.Component;

@Component
public class BloqueioHorarioMapper {

    public BloqueioHorarioDTO toDTO(BloqueioHorario entity) {
        if (entity == null) return null;

        return BloqueioHorarioDTO.builder()
                .id(entity.getId())
                .profissionalId(entity.getProfissionalId())
                .salaId(entity.getSalaId())
                .unidadeId(entity.getUnidadeId())
                .tipoBloqueio(entity.getTipoBloqueio())
                .tipoBloqueioTexto(entity.getTipoBloqueio() != null ? entity.getTipoBloqueio().getDescricao() : null)
                .dataInicio(entity.getDataInicio())
                .dataFim(entity.getDataFim())
                .horaInicio(entity.getHoraInicio())
                .horaFim(entity.getHoraFim())
                .diaInteiro(entity.getDiaInteiro())
                .motivo(entity.getMotivo())
                .ativo(entity.getAtivo())
                .operadorBloqueioId(entity.getOperadorBloqueioId())
                .build();
    }

    public BloqueioHorario toEntity(BloqueioHorarioDTO dto) {
        if (dto == null) return null;

        return BloqueioHorario.builder()
                .id(dto.getId())
                .profissionalId(dto.getProfissionalId())
                .salaId(dto.getSalaId())
                .unidadeId(dto.getUnidadeId())
                .tipoBloqueio(dto.getTipoBloqueio())
                .dataInicio(dto.getDataInicio())
                .dataFim(dto.getDataFim())
                .horaInicio(dto.getHoraInicio())
                .horaFim(dto.getHoraFim())
                .diaInteiro(dto.getDiaInteiro())
                .motivo(dto.getMotivo())
                .ativo(dto.getAtivo())
                .operadorBloqueioId(dto.getOperadorBloqueioId())
                .build();
    }

    public void updateEntityFromDTO(BloqueioHorarioDTO dto, BloqueioHorario entity) {
        if (dto == null || entity == null) return;

        if (dto.getProfissionalId() != null) entity.setProfissionalId(dto.getProfissionalId());
        if (dto.getSalaId() != null) entity.setSalaId(dto.getSalaId());
        if (dto.getUnidadeId() != null) entity.setUnidadeId(dto.getUnidadeId());
        if (dto.getTipoBloqueio() != null) entity.setTipoBloqueio(dto.getTipoBloqueio());
        if (dto.getDataInicio() != null) entity.setDataInicio(dto.getDataInicio());
        if (dto.getDataFim() != null) entity.setDataFim(dto.getDataFim());
        if (dto.getHoraInicio() != null) entity.setHoraInicio(dto.getHoraInicio());
        if (dto.getHoraFim() != null) entity.setHoraFim(dto.getHoraFim());
        if (dto.getDiaInteiro() != null) entity.setDiaInteiro(dto.getDiaInteiro());
        if (dto.getMotivo() != null) entity.setMotivo(dto.getMotivo());
        if (dto.getAtivo() != null) entity.setAtivo(dto.getAtivo());
        if (dto.getOperadorBloqueioId() != null) entity.setOperadorBloqueioId(dto.getOperadorBloqueioId());
    }
}