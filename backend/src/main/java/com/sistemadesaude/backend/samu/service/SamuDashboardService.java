package com.sistemadesaude.backend.samu.service;

import com.sistemadesaude.backend.samu.enums.PrioridadeOcorrencia;
import com.sistemadesaude.backend.samu.enums.StatusOcorrencia;
import com.sistemadesaude.backend.samu.enums.StatusViatura;
import com.sistemadesaude.backend.samu.repository.OcorrenciaRepository;
import com.sistemadesaude.backend.samu.repository.ViaturaRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;

/**
 * Service para Dashboard do SAMU
 * Fornece estatísticas e métricas em tempo real
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class SamuDashboardService {

    private final ViaturaRepository viaturaRepository;
    private final OcorrenciaRepository ocorrenciaRepository;

    /**
     * Obtém estatísticas gerais do SAMU
     */
    @Transactional(readOnly = true)
    public Map<String, Object> obterEstatisticasGerais() {
        log.info("Obtendo estatísticas gerais do SAMU");

        Map<String, Object> stats = new HashMap<>();

        // Estatísticas de viaturas
        stats.put("viaturas", obterEstatisticasViaturas());

        // Estatísticas de ocorrências
        stats.put("ocorrencias", obterEstatisticasOcorrencias());

        // Estatísticas de regulação
        stats.put("regulacao", obterEstatisticasRegulacao());

        // Timestamp
        stats.put("timestamp", LocalDateTime.now());
        stats.put("atualizadoEm", System.currentTimeMillis());

        return stats;
    }

    /**
     * Estatísticas de viaturas
     */
    @Transactional(readOnly = true)
    public Map<String, Object> obterEstatisticasViaturas() {
        Map<String, Object> stats = new HashMap<>();

        long total = viaturaRepository.count();
        long ativas = viaturaRepository.findByAtivaTrue().size();
        long disponiveis = viaturaRepository.countDisponivels();
        long emOperacao = viaturaRepository.countEmOperacao();

        stats.put("total", total);
        stats.put("ativas", ativas);
        stats.put("inativas", total - ativas);
        stats.put("disponiveis", disponiveis);
        stats.put("emOperacao", emOperacao);
        stats.put("percentualDisponibilidade", ativas > 0 ? (disponiveis * 100.0 / ativas) : 0);

        // Por status
        Map<String, Long> porStatus = new HashMap<>();
        for (StatusViatura status : StatusViatura.values()) {
            long count = viaturaRepository.findByStatusAndAtivaTrue(status).size();
            if (count > 0) {
                porStatus.put(status.name(), count);
            }
        }
        stats.put("porStatus", porStatus);

        return stats;
    }

    /**
     * Estatísticas de ocorrências
     */
    @Transactional(readOnly = true)
    public Map<String, Object> obterEstatisticasOcorrencias() {
        Map<String, Object> stats = new HashMap<>();

        LocalDateTime hoje = LocalDateTime.now().withHour(0).withMinute(0).withSecond(0);
        LocalDateTime inicioMes = hoje.withDayOfMonth(1);

        // Ocorrências hoje
        long hoje_total = ocorrenciaRepository.countByDataAberturaBetween(hoje, LocalDateTime.now());
        stats.put("hoje", hoje_total);

        // Ocorrências no mês
        long mes_total = ocorrenciaRepository.countByDataAberturaBetween(inicioMes, LocalDateTime.now());
        stats.put("mes", mes_total);

        // Ocorrências abertas
        List<StatusOcorrencia> statusAbertos = Arrays.asList(
            StatusOcorrencia.ABERTA,
            StatusOcorrencia.AGUARDANDO_REGULACAO,
            StatusOcorrencia.EM_REGULACAO
        );
        long abertas = ocorrenciaRepository.findByStatusInOrderByPrioridadeAscDataAberturaAsc(statusAbertos, null)
                .getTotalElements();
        stats.put("abertas", abertas);

        // Por prioridade (hoje)
        Map<String, Long> porPrioridade = new HashMap<>();
        for (PrioridadeOcorrencia prioridade : PrioridadeOcorrencia.values()) {
            long count = ocorrenciaRepository.countByPrioridadeAndDataAberturaBetween(
                prioridade, hoje, LocalDateTime.now()
            );
            porPrioridade.put(prioridade.name(), count);
        }
        stats.put("porPrioridade", porPrioridade);

        // Por status
        Map<String, Long> porStatus = new HashMap<>();
        for (StatusOcorrencia status : StatusOcorrencia.values()) {
            long count = ocorrenciaRepository.countByStatusAndDataAberturaBetween(
                status, hoje, LocalDateTime.now()
            );
            if (count > 0) {
                porStatus.put(status.name(), count);
            }
        }
        stats.put("porStatus", porStatus);

        return stats;
    }

    /**
     * Estatísticas de regulação
     */
    @Transactional(readOnly = true)
    public Map<String, Object> obterEstatisticasRegulacao() {
        Map<String, Object> stats = new HashMap<>();

        LocalDateTime hoje = LocalDateTime.now().withHour(0).withMinute(0).withSecond(0);

        // Aguardando regulação
        long aguardando = ocorrenciaRepository.countByStatusAndDataAberturaBetween(
            StatusOcorrencia.AGUARDANDO_REGULACAO, hoje, LocalDateTime.now()
        );
        stats.put("aguardandoRegulacao", aguardando);

        // Em regulação
        long emRegulacao = ocorrenciaRepository.countByStatusAndDataAberturaBetween(
            StatusOcorrencia.EM_REGULACAO, hoje, LocalDateTime.now()
        );
        stats.put("emRegulacao", emRegulacao);

        // Reguladas hoje
        long reguladasHoje = ocorrenciaRepository.countByStatusAndDataAberturaBetween(
            StatusOcorrencia.REGULADA, hoje, LocalDateTime.now()
        );
        stats.put("reguladasHoje", reguladasHoje);

        // Tempo médio de regulação (placeholder - implementar cálculo real)
        stats.put("tempoMedioRegulacao", 0.0);

        return stats;
    }

    /**
     * Obtém mapa de viaturas com localização
     */
    @Transactional(readOnly = true)
    public List<Map<String, Object>> obterMapaViaturas() {
        log.info("Obtendo mapa de viaturas");

        List<Map<String, Object>> viaturas = new ArrayList<>();

        viaturaRepository.findByAtivaTrue().forEach(viatura -> {
            Map<String, Object> v = new HashMap<>();
            v.put("id", viatura.getId());
            v.put("identificacao", viatura.getIdentificacao());
            v.put("tipo", viatura.getTipo().name());
            v.put("tipoDescricao", viatura.getTipo().getDescricao());
            v.put("status", viatura.getStatus().name());
            v.put("statusDescricao", viatura.getStatus().getDescricao());
            v.put("cor", viatura.getStatus().getCorHex());
            v.put("nivelProntidao", viatura.calcularNivelProntidao());

            // TODO: Adicionar latitude/longitude quando disponível
            v.put("latitude", null);
            v.put("longitude", null);

            viaturas.add(v);
        });

        return viaturas;
    }

    /**
     * Obtém lista de ocorrências críticas
     */
    @Transactional(readOnly = true)
    public List<Map<String, Object>> obterOcorrenciasCriticas() {
        log.info("Obtendo ocorrências críticas");

        List<Map<String, Object>> ocorrencias = new ArrayList<>();

        List<StatusOcorrencia> statusAtivos = Arrays.asList(
            StatusOcorrencia.ABERTA,
            StatusOcorrencia.AGUARDANDO_REGULACAO,
            StatusOcorrencia.EM_REGULACAO
        );

        ocorrenciaRepository.findByStatusInOrderByPrioridadeAscDataAberturaAsc(statusAtivos, null)
                .getContent()
                .stream()
                .filter(o -> o.getPrioridade().getNivel() <= 2) // Emergência ou Urgência
                .limit(10)
                .forEach(ocorrencia -> {
                    Map<String, Object> o = new HashMap<>();
                    o.put("id", ocorrencia.getId());
                    o.put("numero", ocorrencia.getNumeroOcorrencia());
                    o.put("prioridade", ocorrencia.getPrioridade().name());
                    o.put("prioridadeDescricao", ocorrencia.getPrioridade().getDescricao());
                    o.put("status", ocorrencia.getStatus().name());
                    o.put("endereco", ocorrencia.getEnderecoCompleto());
                    o.put("queixa", ocorrencia.getQueixaPrincipal());
                    o.put("dataAbertura", ocorrencia.getDataAbertura());
                    o.put("tempoDecorrido", calcularTempoDecorrido(ocorrencia.getDataAbertura()));

                    ocorrencias.add(o);
                });

        return ocorrencias;
    }

    /**
     * Obtém gráfico de ocorrências por hora (últimas 24h)
     */
    @Transactional(readOnly = true)
    public Map<String, Object> obterGraficoOcorrenciasPorHora() {
        log.info("Obtendo gráfico de ocorrências por hora");

        Map<String, Object> grafico = new HashMap<>();
        List<Map<String, Object>> dados = new ArrayList<>();

        LocalDateTime agora = LocalDateTime.now();

        for (int i = 23; i >= 0; i--) {
            LocalDateTime inicio = agora.minusHours(i + 1);
            LocalDateTime fim = agora.minusHours(i);

            long count = ocorrenciaRepository.countByDataAberturaBetween(inicio, fim);

            Map<String, Object> ponto = new HashMap<>();
            ponto.put("hora", fim.getHour());
            ponto.put("quantidade", count);
            ponto.put("timestamp", fim);

            dados.add(ponto);
        }

        grafico.put("dados", dados);
        grafico.put("periodo", "Últimas 24 horas");

        return grafico;
    }

    /**
     * Obtém alertas ativos
     */
    @Transactional(readOnly = true)
    public List<Map<String, Object>> obterAlertasAtivos() {
        log.info("Obtendo alertas ativos");

        List<Map<String, Object>> alertas = new ArrayList<>();

        // Alerta: Ocorrências aguardando regulação há muito tempo
        long aguardandoMuitoTempo = ocorrenciaRepository.countByStatusAndDataAberturaBetween(
            StatusOcorrencia.AGUARDANDO_REGULACAO,
            LocalDateTime.now().minusHours(2),
            LocalDateTime.now().minusMinutes(30)
        );

        if (aguardandoMuitoTempo > 0) {
            alertas.add(Map.of(
                "tipo", "REGULACAO_PENDENTE",
                "nivel", "WARNING",
                "mensagem", aguardandoMuitoTempo + " ocorrência(s) aguardando regulação há mais de 30 minutos",
                "quantidade", aguardandoMuitoTempo
            ));
        }

        // Alerta: Poucas viaturas disponíveis
        long disponiveis = viaturaRepository.countDisponivels();
        long total = viaturaRepository.findByAtivaTrue().size();

        if (total > 0 && (disponiveis * 100.0 / total) < 30) {
            alertas.add(Map.of(
                "tipo", "BAIXA_DISPONIBILIDADE_VIATURAS",
                "nivel", "ERROR",
                "mensagem", "Apenas " + disponiveis + " de " + total + " viaturas disponíveis (" +
                           String.format("%.0f%%", disponiveis * 100.0 / total) + ")",
                "disponiveis", disponiveis,
                "total", total
            ));
        }

        return alertas;
    }

    /**
     * Calcula tempo decorrido em minutos
     */
    private long calcularTempoDecorrido(LocalDateTime dataAbertura) {
        return java.time.Duration.between(dataAbertura, LocalDateTime.now()).toMinutes();
    }
}
