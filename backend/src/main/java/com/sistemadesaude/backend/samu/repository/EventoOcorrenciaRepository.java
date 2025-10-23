package com.sistemadesaude.backend.samu.repository;

import com.sistemadesaude.backend.samu.entity.EventoOcorrencia;
import com.sistemadesaude.backend.samu.enums.TipoEvento;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface EventoOcorrenciaRepository extends JpaRepository<EventoOcorrencia, Long> {

    List<EventoOcorrencia> findByOcorrenciaIdOrderByDataHoraDesc(Long ocorrenciaId);

    List<EventoOcorrencia> findByTipoEventoAndDataHoraBetweenOrderByDataHoraDesc(
            TipoEvento tipoEvento, LocalDateTime inicio, LocalDateTime fim);
}
