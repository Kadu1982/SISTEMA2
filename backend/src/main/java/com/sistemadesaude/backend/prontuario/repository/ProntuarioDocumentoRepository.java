package com.sistemadesaude.backend.prontuario.repository;

import com.sistemadesaude.backend.prontuario.entity.ProntuarioDocumento;
import com.sistemadesaude.backend.prontuario.enums.TipoDocumento;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

/**
 * Repositório de documentos do prontuário.
 * Mantém os métodos já usados no projeto e adiciona a busca por agendamentoId+tipo.
 */
public interface ProntuarioDocumentoRepository extends JpaRepository<ProntuarioDocumento, Long> {

    // Lista todos os documentos de um paciente (mais recentes primeiro)
    List<ProntuarioDocumento> findByPacienteIdOrderByCriadoEmDesc(String pacienteId);

    // Lista por paciente e tipo
    List<ProntuarioDocumento> findByPacienteIdAndTipoOrderByCriadoEmDesc(String pacienteId, TipoDocumento tipo);

    // ► NOVO: pega o último documento gerado para um agendamento específico e tipo específico
    Optional<ProntuarioDocumento> findFirstByAgendamentoIdAndTipoOrderByCriadoEmDesc(Long agendamentoId, TipoDocumento tipo);
}
