package com.sistemadesaude.backend.exames.mapper;

import com.sistemadesaude.backend.exames.dto.ExameDTO;
import com.sistemadesaude.backend.exames.entity.Exame;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
public class ExameMapper {

    public ExameDTO toDTO(Exame exame) {
        if (exame == null) {
            return null;
        }

        ExameDTO dto = new ExameDTO();
        dto.setId(exame.getId());
        dto.setCodigo(exame.getCodigo());
        dto.setNome(exame.getNome());
        dto.setNomeResumido(exame.getNomeResumido());
        dto.setSinonimo(exame.getSinonimo());
        dto.setCodigoSigtap(exame.getCodigoSigtap());
        dto.setCodigoTuss(exame.getCodigoTuss());
        dto.setAtivo(exame.getAtivo());

        // Grupo
        if (exame.getGrupo() != null) {
            dto.setGrupoId(exame.getGrupo().getId());
            dto.setGrupoNome(exame.getGrupo().getNome());
        }

        // Validações
        dto.setIdadeMinima(exame.getIdadeMinima());
        dto.setIdadeMaxima(exame.getIdadeMaxima());
        dto.setSexoPermitido(exame.getSexoPermitido() != null ? exame.getSexoPermitido().name() : null);
        dto.setDiasValidade(exame.getDiasValidade());

        // Agendamento
        dto.setPermiteAgendamento(exame.getPermiteAgendamento());
        dto.setExameUrgencia(exame.getExameUrgencia());
        dto.setTempoRealizacaoMinutos(exame.getTempoRealizacaoMinutos());
        dto.setQuantidadeSessoes(exame.getQuantidadeSessoes());
        dto.setOrientacoesPaciente(exame.getOrientacoesPaciente());
        dto.setPreparo(exame.getPreparo());

        // Digitação
        dto.setTipoDigitacao(exame.getTipoDigitacao() != null ? exame.getTipoDigitacao().name() : null);
        dto.setModeloLaudo(exame.getModeloLaudo());
        dto.setUsarAssinaturaEletronica(exame.getUsarAssinaturaEletronica());

        // Faturamento
        dto.setValorParticular(exame.getValorParticular());
        dto.setValorSus(exame.getValorSus());
        dto.setTipoFaturamento(exame.getTipoFaturamento() != null ? exame.getTipoFaturamento().name() : null);

        // Interfaceamento
        dto.setCodigoEquipamento(exame.getCodigoEquipamento());
        dto.setUsaInterfaceamento(exame.getUsaInterfaceamento());

        dto.setCreatedAt(exame.getCreatedAt());
        dto.setUpdatedAt(exame.getUpdatedAt());

        return dto;
    }

    public Exame toEntity(ExameDTO dto) {
        if (dto == null) {
            return null;
        }

        Exame exame = new Exame();
        exame.setId(dto.getId());
        exame.setCodigo(dto.getCodigo());
        exame.setNome(dto.getNome());
        exame.setNomeResumido(dto.getNomeResumido());
        exame.setSinonimo(dto.getSinonimo());
        exame.setCodigoSigtap(dto.getCodigoSigtap());
        exame.setCodigoTuss(dto.getCodigoTuss());
        exame.setAtivo(dto.getAtivo());

        // Validações
        exame.setIdadeMinima(dto.getIdadeMinima());
        exame.setIdadeMaxima(dto.getIdadeMaxima());
        if (dto.getSexoPermitido() != null) {
            exame.setSexoPermitido(Exame.SexoPermitido.valueOf(dto.getSexoPermitido()));
        }
        exame.setDiasValidade(dto.getDiasValidade());

        // Agendamento
        exame.setPermiteAgendamento(dto.getPermiteAgendamento());
        exame.setExameUrgencia(dto.getExameUrgencia());
        exame.setTempoRealizacaoMinutos(dto.getTempoRealizacaoMinutos());
        exame.setQuantidadeSessoes(dto.getQuantidadeSessoes());
        exame.setOrientacoesPaciente(dto.getOrientacoesPaciente());
        exame.setPreparo(dto.getPreparo());

        // Digitação
        if (dto.getTipoDigitacao() != null) {
            exame.setTipoDigitacao(Exame.TipoDigitacao.valueOf(dto.getTipoDigitacao()));
        }
        exame.setModeloLaudo(dto.getModeloLaudo());
        exame.setUsarAssinaturaEletronica(dto.getUsarAssinaturaEletronica());

        // Faturamento
        exame.setValorParticular(dto.getValorParticular());
        exame.setValorSus(dto.getValorSus());
        if (dto.getTipoFaturamento() != null) {
            exame.setTipoFaturamento(Exame.TipoFaturamento.valueOf(dto.getTipoFaturamento()));
        }

        // Interfaceamento
        exame.setCodigoEquipamento(dto.getCodigoEquipamento());
        exame.setUsaInterfaceamento(dto.getUsaInterfaceamento());

        return exame;
    }

    public List<ExameDTO> toDTOList(List<Exame> exames) {
        if (exames == null) {
            return null;
        }
        return exames.stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public List<Exame> toEntityList(List<ExameDTO> dtos) {
        if (dtos == null) {
            return null;
        }
        return dtos.stream()
                .map(this::toEntity)
                .collect(Collectors.toList());
    }
}