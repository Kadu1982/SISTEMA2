package com.sistemadesaude.backend.samu.websocket;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.util.Map;

/**
 * Service para enviar notificações WebSocket do SAMU
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class SamuWebSocketService {

    private final SimpMessagingTemplate messagingTemplate;

    /**
     * Notifica atualização de status de viatura
     */
    public void notificarAtualizacaoViatura(Long viaturaId, String novoStatus, Map<String, Object> dados) {
        log.info("Enviando notificação WebSocket - Viatura {} - Status: {}", viaturaId, novoStatus);

        Map<String, Object> mensagem = Map.of(
            "tipo", "VIATURA_STATUS_ATUALIZADO",
            "viaturaId", viaturaId,
            "novoStatus", novoStatus,
            "dados", dados,
            "timestamp", System.currentTimeMillis()
        );

        messagingTemplate.convertAndSend("/topic/samu/viaturas", mensagem);
    }

    /**
     * Notifica nova ocorrência
     */
    public void notificarNovaOcorrencia(Long ocorrenciaId, String prioridade, Map<String, Object> dados) {
        log.info("Enviando notificação WebSocket - Nova ocorrência {} - Prioridade: {}", ocorrenciaId, prioridade);

        Map<String, Object> mensagem = Map.of(
            "tipo", "NOVA_OCORRENCIA",
            "ocorrenciaId", ocorrenciaId,
            "prioridade", prioridade,
            "dados", dados,
            "timestamp", System.currentTimeMillis()
        );

        messagingTemplate.convertAndSend("/topic/samu/ocorrencias", mensagem);
    }

    /**
     * Notifica atualização de regulação
     */
    public void notificarAtualizacaoRegulacao(Long ocorrenciaId, String status, Map<String, Object> dados) {
        log.info("Enviando notificação WebSocket - Regulação {} - Status: {}", ocorrenciaId, status);

        Map<String, Object> mensagem = Map.of(
            "tipo", "REGULACAO_ATUALIZADA",
            "ocorrenciaId", ocorrenciaId,
            "status", status,
            "dados", dados,
            "timestamp", System.currentTimeMillis()
        );

        messagingTemplate.convertAndSend("/topic/samu/regulacao", mensagem);
    }

    /**
     * Notifica atualização de localização
     */
    public void notificarAtualizacaoLocalizacao(Long viaturaId, Double latitude, Double longitude) {
        log.debug("Enviando notificação WebSocket - Localização viatura {}", viaturaId);

        Map<String, Object> mensagem = Map.of(
            "tipo", "LOCALIZACAO_ATUALIZADA",
            "viaturaId", viaturaId,
            "latitude", latitude,
            "longitude", longitude,
            "timestamp", System.currentTimeMillis()
        );

        messagingTemplate.convertAndSend("/topic/samu/localizacao", mensagem);
    }

    /**
     * Notifica estatísticas atualizadas
     */
    public void notificarEstatisticasAtualizadas(Map<String, Object> estatisticas) {
        log.debug("Enviando notificação WebSocket - Estatísticas atualizadas");

        Map<String, Object> mensagem = Map.of(
            "tipo", "ESTATISTICAS_ATUALIZADAS",
            "dados", estatisticas,
            "timestamp", System.currentTimeMillis()
        );

        messagingTemplate.convertAndSend("/topic/samu/estatisticas", mensagem);
    }

    /**
     * Notifica alerta urgente
     */
    public void notificarAlertaUrgente(String mensagemAlerta, String nivel, Map<String, Object> dados) {
        log.warn("Enviando notificação WebSocket - Alerta urgente: {}", mensagemAlerta);

        Map<String, Object> mensagem = Map.of(
            "tipo", "ALERTA_URGENTE",
            "mensagem", mensagemAlerta,
            "nivel", nivel,
            "dados", dados,
            "timestamp", System.currentTimeMillis()
        );

        messagingTemplate.convertAndSend("/topic/samu/alertas", mensagem);
    }
}
