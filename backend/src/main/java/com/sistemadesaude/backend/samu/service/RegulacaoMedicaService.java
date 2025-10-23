package com.sistemadesaude.backend.samu.service;

import com.sistemadesaude.backend.samu.entity.Ocorrencia;
import com.sistemadesaude.backend.samu.entity.PacienteOcorrencia;
import com.sistemadesaude.backend.samu.dto.OcorrenciaRegulacaoDTO;
import com.sistemadesaude.backend.samu.dto.RegularPacienteDTO;
import com.sistemadesaude.backend.samu.dto.SinaisVitaisDTO;
import com.sistemadesaude.backend.samu.enums.StatusOcorrencia;
import com.sistemadesaude.backend.samu.enums.TipoEvento;
import com.sistemadesaude.backend.samu.enums.RiscoPresumido;
import com.sistemadesaude.backend.samu.enums.PrioridadeOcorrencia;
import com.sistemadesaude.backend.samu.repository.OcorrenciaRepository;
import com.sistemadesaude.backend.samu.repository.PacienteOcorrenciaRepository;
import com.sistemadesaude.backend.operador.repository.OperadorRepository;
import com.sistemadesaude.backend.unidadesaude.repository.UnidadeSaudeRepository;
import com.sistemadesaude.backend.samu.mapper.OcorrenciaMapper;
import com.sistemadesaude.backend.samu.websocket.SamuWebSocketService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.HashMap;

@Slf4j
@Service
@RequiredArgsConstructor
public class RegulacaoMedicaService {

    private final OcorrenciaRepository ocorrenciaRepository;
    private final PacienteOcorrenciaRepository pacienteOcorrenciaRepository;
    private final OperadorRepository operadorRepository;
    private final UnidadeSaudeRepository unidadeSaudeRepository;
    private final OcorrenciaMapper ocorrenciaMapper;
    private final NotificacaoService notificacaoService;
    private final EventoOcorrenciaService eventoService;
    private final SamuWebSocketService webSocketService;

    @Transactional(readOnly = true)
    public Page<OcorrenciaRegulacaoDTO> buscarOcorrenciasAguardandoRegulacao(
            Pageable pageable, Map<String, Object> filtros) {

        log.info("Buscando ocorrências aguardando regulação");

        var status = List.of(StatusOcorrencia.AGUARDANDO_REGULACAO, StatusOcorrencia.EM_REGULACAO);

        Page<Ocorrencia> ocorrencias;

        if (filtros.containsKey("centralId")) {
            ocorrencias = ocorrenciaRepository.findByStatusInAndCentralRegulacaoIdOrderByPrioridadeAscDataAberturaAsc(
                    status, (Long) filtros.get("centralId"), pageable);
        } else {
            ocorrencias = ocorrenciaRepository.findByStatusInOrderByPrioridadeAscDataAberturaAsc(
                    status, pageable);
        }

        return ocorrencias.map(ocorrenciaMapper::toRegulacaoDTO);
    }

    @Transactional
    public void iniciarRegulacao(Long ocorrenciaId, Long medicoReguladorId) {
        log.info("Iniciando regulação da ocorrência: {} pelo médico: {}", ocorrenciaId, medicoReguladorId);

        var ocorrencia = buscarOcorrenciaPorId(ocorrenciaId);
        var medicoRegulador = operadorRepository.findById(medicoReguladorId)
                .orElseThrow(() -> new IllegalArgumentException("Médico regulador não encontrado"));

        if (ocorrencia.getStatus() != StatusOcorrencia.AGUARDANDO_REGULACAO) {
            throw new IllegalStateException("Ocorrência não está aguardando regulação");
        }

        ocorrencia.setStatus(StatusOcorrencia.EM_REGULACAO);
        ocorrencia.setMedicoRegulador(medicoRegulador);
        ocorrenciaRepository.save(ocorrencia);

        // ✅ CORRIGIDO: usando TipoEvento.INICIO_REGULACAO
        eventoService.registrarEvento(ocorrencia, TipoEvento.INICIO_REGULACAO,
                "Regulação iniciada pelo médico " + medicoRegulador.getNome(), medicoReguladorId);

        // Notifica via WebSocket
        Map<String, Object> dados = new HashMap<>();
        dados.put("ocorrenciaId", ocorrenciaId);
        dados.put("numeroOcorrencia", ocorrencia.getNumeroOcorrencia());
        dados.put("medico", medicoRegulador.getNome());
        dados.put("status", StatusOcorrencia.EM_REGULACAO.name());

        webSocketService.notificarAtualizacaoRegulacao(
            ocorrenciaId,
            StatusOcorrencia.EM_REGULACAO.name(),
            dados
        );
    }

    @Transactional
    public void regularPaciente(Long pacienteOcorrenciaId, RegularPacienteDTO dto, Long medicoReguladorId) {
        log.info("Regulando paciente: {} pelo médico: {}", pacienteOcorrenciaId, medicoReguladorId);

        var pacienteOcorrencia = pacienteOcorrenciaRepository.findById(pacienteOcorrenciaId)
                .orElseThrow(() -> new IllegalArgumentException("Paciente da ocorrência não encontrado"));

        var unidadeDestino = dto.getUnidadeDestinoId() != null ?
                unidadeSaudeRepository.findById(dto.getUnidadeDestinoId())
                        .orElseThrow(() -> new IllegalArgumentException("Unidade de destino não encontrada"))
                : null;

        // Atualizar dados da regulação
        pacienteOcorrencia.setHipoteseDiagnostica(dto.getHipoteseDiagnostica());
        pacienteOcorrencia.setRiscoPresumido(dto.getRiscoPresumido());
        pacienteOcorrencia.setUnidadeDestino(unidadeDestino);
        pacienteOcorrencia.setQuadroClinico(dto.getQuadroClinico());
        pacienteOcorrencia.setAntecedentes(dto.getAntecedentes());

        // Atualizar sinais vitais se informados
        if (dto.getSinaisVitais() != null) {
            atualizarSinaisVitais(pacienteOcorrencia, dto.getSinaisVitais());
        }

        pacienteOcorrenciaRepository.save(pacienteOcorrencia);

        // ✅ CORRIGIDO: usando TipoEvento.REGULACAO_PACIENTE
        eventoService.registrarEvento(pacienteOcorrencia.getOcorrencia(), TipoEvento.REGULACAO_PACIENTE,
                "Paciente regulado: " + pacienteOcorrencia.getNomeInformado(), medicoReguladorId);

        // Verificar se todos os pacientes foram regulados
        verificarRegulacaoCompleta(pacienteOcorrencia.getOcorrencia());
    }

    @Transactional
    public void finalizarRegulacao(Long ocorrenciaId, String recursoApoioExterno, Long medicoReguladorId) {
        log.info("Finalizando regulação da ocorrência: {}", ocorrenciaId);

        var ocorrencia = buscarOcorrenciaPorId(ocorrenciaId);

        if (ocorrencia.getStatus() != StatusOcorrencia.EM_REGULACAO) {
            throw new IllegalStateException("Ocorrência não está em regulação");
        }

        ocorrencia.setStatus(StatusOcorrencia.REGULADA);
        if (recursoApoioExterno != null && !recursoApoioExterno.trim().isEmpty()) {
            String obsAtuais = ocorrencia.getObservacoes() != null ? ocorrencia.getObservacoes() : "";
            ocorrencia.setObservacoes(obsAtuais + "\n[RECURSO APOIO] " + recursoApoioExterno);
        }
        ocorrenciaRepository.save(ocorrencia);

        // ✅ CORRIGIDO: usando TipoEvento.FINALIZACAO_REGULACAO
        eventoService.registrarEvento(ocorrencia, TipoEvento.FINALIZACAO_REGULACAO,
                "Regulação finalizada", medicoReguladorId);

        // ✅ CORRIGIDO: método existe no NotificacaoService
        try {
            notificacaoService.notificarNovaOcorrenciaRegulacao(ocorrencia);
        } catch (Exception e) {
            log.warn("Erro ao enviar notificação: {}", e.getMessage());
        }
    }

    @Transactional(readOnly = true)
    public List<OcorrenciaRegulacaoDTO> buscarOcorrenciasEmergencia() {
        var ocorrencias = ocorrenciaRepository.findByPrioridade(PrioridadeOcorrencia.EMERGENCIA);

        return ocorrencias.stream()
                .map(ocorrenciaMapper::toRegulacaoDTO)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<OcorrenciaRegulacaoDTO> buscarOcorrenciasCriticas() {
        List<RiscoPresumido> riscosAltos = List.of(RiscoPresumido.CRITICO, RiscoPresumido.ALTO);

        var pacientes = pacienteOcorrenciaRepository.findByRiscoPresumidoInOrderByDataAbertura(riscosAltos);

        return pacientes.stream()
                .map(p -> p.getOcorrencia())
                .distinct()
                .map(ocorrenciaMapper::toRegulacaoDTO)
                .toList();
    }

    @Transactional(readOnly = true)
    public Map<String, Object> obterEstatisticasRegulacao(LocalDateTime dataInicio, LocalDateTime dataFim) {
        Map<String, Object> estatisticas = new HashMap<>();

        try {
            estatisticas.put("totalOcorrenciasReguladas",
                    ocorrenciaRepository.countByStatusAndDataAberturaBetween(
                            StatusOcorrencia.REGULADA, dataInicio, dataFim));

            estatisticas.put("tempoMedioRegulacao", calcularTempoMedioRegulacao(dataInicio, dataFim));
            estatisticas.put("ocorrenciasPorPrioridade", contarOcorrenciasPorPrioridade(dataInicio, dataFim));
            estatisticas.put("ocorrenciasPorRisco", contarOcorrenciasPorRisco(dataInicio, dataFim));
        } catch (Exception e) {
            log.error("Erro ao obter estatísticas", e);
            estatisticas.put("erro", e.getMessage());
        }

        return estatisticas;
    }

    // Métodos auxiliares privados
    private Ocorrencia buscarOcorrenciaPorId(Long id) {
        return ocorrenciaRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Ocorrência não encontrada"));
    }

    private void atualizarSinaisVitais(PacienteOcorrencia paciente, SinaisVitaisDTO sinaisVitais) {
        paciente.setPressaoArterial(sinaisVitais.getPressaoArterial());
        paciente.setFrequenciaCardiaca(sinaisVitais.getFrequenciaCardiaca());
        paciente.setFrequenciaRespiratoria(sinaisVitais.getFrequenciaRespiratoria());
        paciente.setSaturacaoOxigenio(sinaisVitais.getSaturacaoOxigenio());
        paciente.setTemperatura(sinaisVitais.getTemperatura());
        paciente.setEscalaGlasgow(sinaisVitais.getEscalaGlasgow());
    }

    private void verificarRegulacaoCompleta(Ocorrencia ocorrencia) {
        List<PacienteOcorrencia> pacientesNaoRegulados =
                pacienteOcorrenciaRepository.findPacientesNaoReguladosByOcorrencia(ocorrencia.getId());

        if (pacientesNaoRegulados.isEmpty() && ocorrencia.getStatus() == StatusOcorrencia.EM_REGULACAO) {
            log.info("Todos os pacientes da ocorrência {} foram regulados", ocorrencia.getId());
        }
    }

    private Double calcularTempoMedioRegulacao(LocalDateTime inicio, LocalDateTime fim) {
        // Implementar cálculo real baseado nos eventos
        return 0.0; // Placeholder
    }

    private Map<String, Long> contarOcorrenciasPorPrioridade(LocalDateTime inicio, LocalDateTime fim) {
        Map<String, Long> contadores = new HashMap<>();
        for (PrioridadeOcorrencia prioridade : PrioridadeOcorrencia.values()) {
            Long count = ocorrenciaRepository.countByPrioridadeAndDataAberturaBetween(prioridade, inicio, fim);
            contadores.put(prioridade.name(), count);
        }
        return contadores;
    }

    private Map<String, Long> contarOcorrenciasPorRisco(LocalDateTime inicio, LocalDateTime fim) {
        Map<String, Long> contadores = new HashMap<>();
        for (RiscoPresumido risco : RiscoPresumido.values()) {
            Long count = pacienteOcorrenciaRepository.countByRiscoPresumidoAndPeriodo(risco, inicio, fim);
            contadores.put(risco.name(), count);
        }
        return contadores;
    }
}
