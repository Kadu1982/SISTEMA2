package com.sistemadesaude.backend.samu.service;

import com.sistemadesaude.backend.samu.entity.Ocorrencia;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Slf4j
@Service
public class NotificacaoService {

    public void notificarRegulacoesUrgentes(Ocorrencia ocorrencia) {
        log.info("🚨 Notificando regulação urgente para ocorrência: {}", ocorrencia.getNumeroOcorrencia());
        // Implementar notificação
    }

    public void notificarNovaOcorrenciaRegulacao(Ocorrencia ocorrencia) {
        log.info("📢 Notificando nova ocorrência para regulação: {}", ocorrencia.getNumeroOcorrencia());
        // Implementar notificação
    }
}
