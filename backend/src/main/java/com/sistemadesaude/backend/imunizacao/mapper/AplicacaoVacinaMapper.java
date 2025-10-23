package com.sistemadesaude.backend.imunizacao.mapper;

import com.sistemadesaude.backend.imunizacao.dto.AplicacaoVacinaDTO;
import com.sistemadesaude.backend.imunizacao.entity.AplicacaoVacina;
import org.springframework.stereotype.Component;

@Component
public class AplicacaoVacinaMapper {

    public AplicacaoVacinaDTO toDTO(AplicacaoVacina entity) {
        if (entity == null) {
            return null;
        }

        return AplicacaoVacinaDTO.builder()
            .id(entity.getId())
            .pacienteId(entity.getPaciente().getId())
            .vacinaId(entity.getVacina().getId())
            .unidadeId(entity.getUnidade().getId())
            .profissionalId(entity.getProfissional() != null ? entity.getProfissional().getId() : null)
            .dataAplicacao(entity.getDataAplicacao())
            .horaAplicacao(entity.getHoraAplicacao())
            .estrategiaVacinacao(entity.getEstrategiaVacinacao())
            .localAtendimento(entity.getLocalAtendimento())
            .dose(entity.getDose())
            .lote(entity.getLote())
            .fabricante(entity.getFabricante())
            .dataValidade(entity.getDataValidade())
            .viaAdministracao(entity.getViaAdministracao())
            .localAplicacao(entity.getLocalAplicacao())
            .observacoes(entity.getObservacoes())
            .exportadoEsus(entity.getExportadoEsus())
            .exportadoSipni(entity.getExportadoSipni())
            .exportadoRnds(entity.getExportadoRnds())
            .dataExportacaoEsus(entity.getDataExportacaoEsus())
            .dataExportacaoSipni(entity.getDataExportacaoSipni())
            .dataExportacaoRnds(entity.getDataExportacaoRnds())
            // Campos auxiliares
            .nomePaciente(entity.getPaciente().getNomeCompleto())
            .nomeVacina(entity.getVacina().getNome())
            .nomeUnidade(entity.getUnidade().getNome())
            .nomeProfissional(entity.getProfissional() != null ? entity.getProfissional().getNomeCompleto() : null)
            .operadorRegistro(entity.getOperador().getNome())
            .build();
    }
}