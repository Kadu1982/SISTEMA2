package com.sistemadesaude.backend.samu.controller;

import com.sistemadesaude.backend.response.ApiResponse;
import com.sistemadesaude.backend.samu.service.SamuDashboardService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

/**
 * Controller REST para Dashboard do SAMU
 * Expõe estatísticas e métricas em tempo real para o frontend
 */
@Slf4j
@RestController
@RequestMapping("/api/samu/dashboard")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('SAMU_OPERADOR', 'SAMU_REGULADOR', 'ADMIN', 'ADMINISTRADOR_DO_SISTEMA')")
public class SamuDashboardController {

    private final SamuDashboardService dashboardService;

    /**
     * Obtém estatísticas gerais do SAMU
     *
     * @return Estatísticas de viaturas, ocorrências e regulação
     */
    @GetMapping("/estatisticas")
    public ResponseEntity<ApiResponse<Map<String, Object>>> obterEstatisticasGerais() {
        log.info("GET /api/samu/dashboard/estatisticas - Obtendo estatísticas gerais");

        Map<String, Object> estatisticas = dashboardService.obterEstatisticasGerais();

        return ResponseEntity.ok(ApiResponse.success(
            estatisticas,
            "Estatísticas obtidas com sucesso"
        ));
    }

    /**
     * Obtém estatísticas de viaturas
     *
     * @return Estatísticas detalhadas das viaturas (total, ativas, disponíveis, por status)
     */
    @GetMapping("/estatisticas/viaturas")
    public ResponseEntity<ApiResponse<Map<String, Object>>> obterEstatisticasViaturas() {
        log.info("GET /api/samu/dashboard/estatisticas/viaturas - Obtendo estatísticas de viaturas");

        Map<String, Object> estatisticas = dashboardService.obterEstatisticasViaturas();

        return ResponseEntity.ok(ApiResponse.success(
            estatisticas,
            "Estatísticas de viaturas obtidas com sucesso"
        ));
    }

    /**
     * Obtém estatísticas de ocorrências
     *
     * @return Estatísticas de ocorrências (hoje, mês, por prioridade, por status)
     */
    @GetMapping("/estatisticas/ocorrencias")
    public ResponseEntity<ApiResponse<Map<String, Object>>> obterEstatisticasOcorrencias() {
        log.info("GET /api/samu/dashboard/estatisticas/ocorrencias - Obtendo estatísticas de ocorrências");

        Map<String, Object> estatisticas = dashboardService.obterEstatisticasOcorrencias();

        return ResponseEntity.ok(ApiResponse.success(
            estatisticas,
            "Estatísticas de ocorrências obtidas com sucesso"
        ));
    }

    /**
     * Obtém estatísticas de regulação
     *
     * @return Estatísticas de regulação médica (aguardando, em andamento, tempo médio)
     */
    @GetMapping("/estatisticas/regulacao")
    public ResponseEntity<ApiResponse<Map<String, Object>>> obterEstatisticasRegulacao() {
        log.info("GET /api/samu/dashboard/estatisticas/regulacao - Obtendo estatísticas de regulação");

        Map<String, Object> estatisticas = dashboardService.obterEstatisticasRegulacao();

        return ResponseEntity.ok(ApiResponse.success(
            estatisticas,
            "Estatísticas de regulação obtidas com sucesso"
        ));
    }

    /**
     * Obtém mapa de viaturas com localização
     *
     * @return Lista de viaturas com status, tipo, nível de prontidão e coordenadas
     */
    @GetMapping("/mapa-viaturas")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> obterMapaViaturas() {
        log.info("GET /api/samu/dashboard/mapa-viaturas - Obtendo mapa de viaturas");

        List<Map<String, Object>> viaturas = dashboardService.obterMapaViaturas();

        return ResponseEntity.ok(ApiResponse.success(
            viaturas,
            "Mapa de viaturas obtido com sucesso"
        ));
    }

    /**
     * Obtém lista de ocorrências críticas
     *
     * @return Top 10 ocorrências críticas (emergência/urgência) ordenadas por prioridade
     */
    @GetMapping("/ocorrencias-criticas")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> obterOcorrenciasCriticas() {
        log.info("GET /api/samu/dashboard/ocorrencias-criticas - Obtendo ocorrências críticas");

        List<Map<String, Object>> ocorrencias = dashboardService.obterOcorrenciasCriticas();

        return ResponseEntity.ok(ApiResponse.success(
            ocorrencias,
            "Ocorrências críticas obtidas com sucesso"
        ));
    }

    /**
     * Obtém gráfico de ocorrências por hora (últimas 24h)
     *
     * @return Dados para gráfico de linha com quantidade de ocorrências por hora
     */
    @GetMapping("/grafico-por-hora")
    public ResponseEntity<ApiResponse<Map<String, Object>>> obterGraficoOcorrenciasPorHora() {
        log.info("GET /api/samu/dashboard/grafico-por-hora - Obtendo gráfico de ocorrências");

        Map<String, Object> grafico = dashboardService.obterGraficoOcorrenciasPorHora();

        return ResponseEntity.ok(ApiResponse.success(
            grafico,
            "Gráfico obtido com sucesso"
        ));
    }

    /**
     * Obtém alertas ativos do sistema
     *
     * @return Lista de alertas (ocorrências pendentes, baixa disponibilidade, etc.)
     */
    @GetMapping("/alertas")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> obterAlertasAtivos() {
        log.info("GET /api/samu/dashboard/alertas - Obtendo alertas ativos");

        List<Map<String, Object>> alertas = dashboardService.obterAlertasAtivos();

        return ResponseEntity.ok(ApiResponse.success(
            alertas,
            alertas.isEmpty() ? "Nenhum alerta ativo" : alertas.size() + " alerta(s) ativo(s)"
        ));
    }
}
