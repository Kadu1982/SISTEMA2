package com.sistemadesaude.backend.hospitalar.mapper;

import com.sistemadesaude.backend.hospitalar.dto.LeitoDTO;
import com.sistemadesaude.backend.hospitalar.entity.Leito;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;

@Component
public class LeitoMapper {

    public LeitoDTO toDTO(Leito leito) {
        if (leito == null) {
            return null;
        }

        LeitoDTO dto = new LeitoDTO();

        // Dados básicos
        dto.setId(leito.getId());
        dto.setNumero(leito.getNumero());
        dto.setAndar(leito.getAndar());
        dto.setAla(leito.getAla());
        dto.setEnfermaria(leito.getEnfermaria());

        // Unidade
        if (leito.getUnidade() != null) {
            dto.setUnidadeId(leito.getUnidade().getId());
            dto.setNomeUnidade(leito.getUnidade().getNome());
        }

        // Setor
        dto.setSetorId(leito.getSetorId());

        // Tipo e status
        dto.setTipoAcomodacao(leito.getTipoAcomodacao());
        dto.setStatus(leito.getStatus());

        // Paciente
        if (leito.getPaciente() != null) {
            dto.setPacienteId(leito.getPaciente().getId());
            dto.setNomePaciente(leito.getPaciente().getNomeCompleto());
        }

        // Atendimento
        dto.setAtendimentoId(leito.getAtendimentoId());

        // Datas
        dto.setDataOcupacao(leito.getDataOcupacao());
        dto.setDataLiberacao(leito.getDataLiberacao());
        dto.setDataLimpeza(leito.getDataLimpeza());

        // Limpeza
        dto.setTipoLimpezaNecessaria(leito.getTipoLimpezaNecessaria());
        dto.setStatusLimpeza(leito.getStatusLimpeza());

        // Interdição
        dto.setMotivoInterdicao(leito.getMotivoInterdicao());
        dto.setDataInterdicao(leito.getDataInterdicao());
        if (leito.getResponsavelInterdicao() != null) {
            dto.setResponsavelInterdicaoId(leito.getResponsavelInterdicao().getId());
            dto.setNomeResponsavelInterdicao(leito.getResponsavelInterdicao().getNome());
        }

        // Outros
        dto.setObservacoes(leito.getObservacoes());
        dto.setAtivo(leito.getAtivo());

        // Calcular dias de ocupação se estiver ocupado
        if (leito.getDataOcupacao() != null && leito.isOcupado()) {
            long dias = ChronoUnit.DAYS.between(leito.getDataOcupacao().toLocalDate(), LocalDateTime.now().toLocalDate());
            dto.setDiasOcupacao((int) dias);
        }

        return dto;
    }

    public Leito toEntity(LeitoDTO dto) {
        if (dto == null) {
            return null;
        }

        Leito leito = new Leito();

        // Dados básicos
        leito.setId(dto.getId());
        leito.setNumero(dto.getNumero());
        leito.setAndar(dto.getAndar());
        leito.setAla(dto.getAla());
        leito.setEnfermaria(dto.getEnfermaria());

        // Os relacionamentos (unidade, paciente, responsável) serão definidos no service
        leito.setSetorId(dto.getSetorId());
        leito.setTipoAcomodacao(dto.getTipoAcomodacao());
        leito.setStatus(dto.getStatus());
        leito.setAtendimentoId(dto.getAtendimentoId());

        // Datas
        leito.setDataOcupacao(dto.getDataOcupacao());
        leito.setDataLiberacao(dto.getDataLiberacao());
        leito.setDataLimpeza(dto.getDataLimpeza());

        // Limpeza
        leito.setTipoLimpezaNecessaria(dto.getTipoLimpezaNecessaria());
        leito.setStatusLimpeza(dto.getStatusLimpeza());

        // Interdição
        leito.setMotivoInterdicao(dto.getMotivoInterdicao());
        leito.setDataInterdicao(dto.getDataInterdicao());

        // Outros
        leito.setObservacoes(dto.getObservacoes());
        leito.setAtivo(dto.getAtivo());

        return leito;
    }
}