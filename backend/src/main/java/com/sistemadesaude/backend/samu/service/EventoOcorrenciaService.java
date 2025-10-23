package com.sistemadesaude.backend.samu.service;

import com.sistemadesaude.backend.operador.repository.OperadorRepository;
import com.sistemadesaude.backend.samu.entity.EventoOcorrencia;
import com.sistemadesaude.backend.samu.entity.Ocorrencia;
import com.sistemadesaude.backend.samu.enums.TipoEvento;
import com.sistemadesaude.backend.samu.repository.EventoOcorrenciaRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class EventoOcorrenciaService {

    private final EventoOcorrenciaRepository eventoRepository;
    private final OperadorRepository operadorRepository;

    @Transactional
    public void registrarEvento(Ocorrencia ocorrencia, TipoEvento tipoEvento, String descricao, Long operadorId) {
        try {
            var operador = operadorRepository.findById(operadorId)
                    .orElse(null);

            var evento = EventoOcorrencia.builder()
                    .ocorrencia(ocorrencia)
                    .tipoEvento(tipoEvento)
                    .descricao(descricao)
                    .operador(operador)
                    .dataHora(LocalDateTime.now())
                    .build();

            eventoRepository.save(evento);

            log.info("Evento registrado: {} para ocorrência: {}", tipoEvento.getDescricao(), ocorrencia.getId());

        } catch (Exception e) {
            log.error("Erro ao registrar evento: {} para ocorrência: {}", tipoEvento, ocorrencia.getId(), e);
        }
    }

    @Transactional(readOnly = true)
    public List<EventoOcorrencia> buscarEventosPorOcorrencia(Long ocorrenciaId) {
        return eventoRepository.findByOcorrenciaIdOrderByDataHoraDesc(ocorrenciaId);
    }

    @Transactional(readOnly = true)
    public List<EventoOcorrencia> buscarEventosPorTipo(TipoEvento tipoEvento, LocalDateTime inicio, LocalDateTime fim) {
        return eventoRepository.findByTipoEventoAndDataHoraBetweenOrderByDataHoraDesc(tipoEvento, inicio, fim);
    }
}
