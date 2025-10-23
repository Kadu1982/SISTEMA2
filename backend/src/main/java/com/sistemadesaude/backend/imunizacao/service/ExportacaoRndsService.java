package com.sistemadesaude.backend.imunizacao.service;

import com.sistemadesaude.backend.imunizacao.entity.AplicacaoVacina;
import com.sistemadesaude.backend.imunizacao.repository.AplicacaoVacinaRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Service para exportação de aplicações de vacina para RNDS
 * Implementa regras conforme PDF SAUDE-89087
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class ExportacaoRndsService {

    private final AplicacaoVacinaRepository aplicacaoVacinaRepository;
    private final AplicacaoVacinaService aplicacaoVacinaService;

    /**
     * Executa exportação automática a cada hora
     * Conforme regra SAUDE-89087: Envio das vacinas de Rotina à RNDS
     */
    @Scheduled(fixedRate = 3600000) // 1 hora = 3600000ms
    @Async
    public void exportarAplicacoesPendentes() {
        log.info("🚀 Iniciando exportação automática para RNDS...");

        try {
            // Buscar aplicações pendentes conforme regras:
            // 1. Unidade NÃO exporta para e-SUS AB
            // 2. Configurada para exportar para RNDS
            // 3. Vacinas do calendário (exceto COVID-19)
            // 4. Checkbox 'Exportar ao SI-PNI' desmarcada
            List<AplicacaoVacina> pendentes = aplicacaoVacinaRepository.findPendentesExportacaoRnds();

            if (pendentes.isEmpty()) {
                log.info("📭 Nenhuma aplicação pendente para exportação RNDS");
                return;
            }

            log.info("📦 Encontradas {} aplicações para exportar para RNDS", pendentes.size());

            int sucessos = 0;
            int falhas = 0;

            for (AplicacaoVacina aplicacao : pendentes) {
                try {
                    // Simular envio para RNDS (aqui implementaria o webservice real)
                    boolean envioSucesso = enviarParaRnds(aplicacao);

                    if (envioSucesso) {
                        aplicacaoVacinaService.marcarComoExportadoRnds(aplicacao.getId());
                        sucessos++;
                        log.debug("✅ Aplicação {} exportada com sucesso para RNDS", aplicacao.getId());
                    } else {
                        falhas++;
                        log.warn("⚠️ Falha ao exportar aplicação {} para RNDS", aplicacao.getId());
                    }

                } catch (Exception e) {
                    falhas++;
                    log.error("❌ Erro ao exportar aplicação {} para RNDS: {}", aplicacao.getId(), e.getMessage());
                }
            }

            log.info("📊 Exportação RNDS concluída - Sucessos: {}, Falhas: {}", sucessos, falhas);

        } catch (Exception e) {
            log.error("💥 Erro geral na exportação RNDS: {}", e.getMessage(), e);
        }
    }

    /**
     * Envia uma aplicação específica para RNDS
     * Implementa as regras de negócio conforme SAUDE-89087
     */
    private boolean enviarParaRnds(AplicacaoVacina aplicacao) {
        try {
            log.debug("📡 Enviando aplicação {} para RNDS...", aplicacao.getId());

            // Validar regras antes do envio
            if (!validarRegrasExportacao(aplicacao)) {
                log.warn("⚠️ Aplicação {} não atende às regras para exportação RNDS", aplicacao.getId());
                return false;
            }

            // Aqui seria implementado o webservice real para RNDS
            // Por enquanto, simular sucesso
            String payload = construirPayloadRnds(aplicacao);
            log.debug("📄 Payload RNDS: {}", payload);

            // Simular delay de rede
            Thread.sleep(100);

            // TODO: Implementar chamada real para RNDS
            // RestTemplate ou WebClient para chamar o webservice
            // Certificado digital, autenticação, etc.

            return true; // Simular sucesso

        } catch (Exception e) {
            log.error("❌ Erro ao enviar para RNDS: {}", e.getMessage());
            return false;
        }
    }

    /**
     * Valida se a aplicação atende às regras para exportação RNDS
     * Conforme PDF SAUDE-89087
     */
    private boolean validarRegrasExportacao(AplicacaoVacina aplicacao) {
        // 1. Vacina deve ser do calendário vacinal
        if (!aplicacao.getVacina().getCalendarioVacinal()) {
            log.debug("❌ Vacina {} não é do calendário vacinal", aplicacao.getVacina().getCodigo());
            return false;
        }

        // 2. Não deve ser COVID-19
        if ("COVID19".equals(aplicacao.getVacina().getTipoVacina().name())) {
            log.debug("❌ Vacina COVID-19 não deve ser exportada para RNDS");
            return false;
        }

        // 3. Checkbox 'Exportar ao SI-PNI' deve estar desmarcada
        if (aplicacao.getVacina().getExportarSipni()) {
            log.debug("❌ Vacina {} configurada para exportar SI-PNI, não exportar para RNDS",
                     aplicacao.getVacina().getCodigo());
            return false;
        }

        return true;
    }

    /**
     * Constrói payload para envio RNDS
     * Conforme especificação da RNDS
     */
    private String construirPayloadRnds(AplicacaoVacina aplicacao) {
        // TODO: Implementar construção do payload real conforme RNDS
        return String.format("""
            {
                "paciente": {
                    "cpf": "%s",
                    "nome": "%s"
                },
                "vacina": {
                    "codigo": "%s",
                    "nome": "%s",
                    "lote": "%s",
                    "dataAplicacao": "%s",
                    "estrategia": "%s"
                },
                "estabelecimento": {
                    "cnes": "%s",
                    "nome": "%s"
                }
            }
            """,
            aplicacao.getPaciente().getCpf(),
            aplicacao.getPaciente().getNomeCompleto(),
            aplicacao.getVacina().getCodigo(),
            aplicacao.getVacina().getNome(),
            aplicacao.getLote(),
            aplicacao.getDataAplicacao(),
            aplicacao.getEstrategiaVacinacao().name(),
            aplicacao.getUnidade().getCodigoCnes(),
            aplicacao.getUnidade().getNome()
        );
    }

    /**
     * Força exportação manual de uma aplicação específica
     */
    @Transactional
    public boolean exportarAplicacaoManual(Long aplicacaoId) {
        log.info("🔧 Exportação manual para RNDS - Aplicação ID: {}", aplicacaoId);

        AplicacaoVacina aplicacao = aplicacaoVacinaRepository.findById(aplicacaoId)
            .orElseThrow(() -> new RuntimeException("Aplicação não encontrada"));

        if (aplicacao.getExportadoRnds()) {
            log.warn("⚠️ Aplicação {} já foi exportada para RNDS", aplicacaoId);
            return false;
        }

        boolean sucesso = enviarParaRnds(aplicacao);
        if (sucesso) {
            aplicacaoVacinaService.marcarComoExportadoRnds(aplicacaoId);
            log.info("✅ Aplicação {} exportada manualmente para RNDS", aplicacaoId);
        }

        return sucesso;
    }
}