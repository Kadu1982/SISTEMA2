package com.sistemadesaude.backend.recepcao.controller;

import com.sistemadesaude.backend.prontuario.entity.ProntuarioDocumento;
import com.sistemadesaude.backend.prontuario.enums.TipoDocumento;
import com.sistemadesaude.backend.prontuario.repository.ProntuarioDocumentoRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

/**
 * Endpoints INTELIGENTES para visualizar/baixar documentos de agendamento.
 * REGRA DE NEGÓCIO:
 *  - Se houver SADT → retorna SADT
 *  - Senão → retorna Comprovante
 *
 * Isso permite que o frontend sempre use /comprovante e receba o documento correto automaticamente.
 */
@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/agendamentos")
public class AgendamentoComprovanteController {

    private final ProntuarioDocumentoRepository documentoRepository;

    /**
     * Exibe o documento correto em tela (SADT se houver, senão Comprovante).
     * GET /api/agendamentos/{agendamentoId}/comprovante
     */
    @GetMapping("/{agendamentoId}/comprovante")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<byte[]> exibirDocumento(@PathVariable Long agendamentoId) {
        log.info("📄 Buscando documento para agendamento {}", agendamentoId);

        // 1) Tenta buscar SADT primeiro (prioridade para exames)
        ProntuarioDocumento sadt = documentoRepository
                .findFirstByAgendamentoIdAndTipoOrderByCriadoEmDesc(agendamentoId, TipoDocumento.SADT)
                .orElse(null);

        if (sadt != null && sadt.getArquivoPdf() != null && sadt.getArquivoPdf().length > 0) {
            log.info("✅ SADT encontrada para agendamento {}: {} bytes", agendamentoId, sadt.getArquivoPdf().length);
            String nome = (sadt.getArquivoNome() != null && !sadt.getArquivoNome().isBlank())
                    ? sadt.getArquivoNome()
                    : ("SADT-" + agendamentoId + ".pdf");

            return ResponseEntity.ok()
                    .contentType(MediaType.APPLICATION_PDF)
                    .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + nome + "\"")
                    .body(sadt.getArquivoPdf());
        }

        log.info("⚠️ SADT não encontrada para agendamento {}. Buscando Comprovante...", agendamentoId);

        // 2) Se não houver SADT, busca Comprovante
        ProntuarioDocumento comprovante = documentoRepository
                .findFirstByAgendamentoIdAndTipoOrderByCriadoEmDesc(agendamentoId, TipoDocumento.COMPROVANTE_AGENDAMENTO)
                .orElse(null);

        if (comprovante == null || comprovante.getArquivoPdf() == null || comprovante.getArquivoPdf().length == 0) {
            log.warn("❌ Nenhum documento encontrado para agendamento {}. Retornando 404.", agendamentoId);
            return ResponseEntity.notFound().build();
        }

        log.info("✅ Comprovante encontrado para agendamento {}: {} bytes", agendamentoId, comprovante.getArquivoPdf().length);
        String nome = (comprovante.getArquivoNome() != null && !comprovante.getArquivoNome().isBlank())
                ? comprovante.getArquivoNome()
                : ("Comprovante-Agendamento-" + agendamentoId + ".pdf");

        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_PDF)
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + nome + "\"")
                .body(comprovante.getArquivoPdf());
    }

    /**
     * Força download do documento correto (SADT se houver, senão Comprovante).
     * GET /api/agendamentos/{agendamentoId}/comprovante/download
     */
    @GetMapping("/{agendamentoId}/comprovante/download")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<byte[]> baixarDocumento(@PathVariable Long agendamentoId) {
        // 1) Tenta buscar SADT primeiro (prioridade para exames)
        ProntuarioDocumento sadt = documentoRepository
                .findFirstByAgendamentoIdAndTipoOrderByCriadoEmDesc(agendamentoId, TipoDocumento.SADT)
                .orElse(null);

        if (sadt != null && sadt.getArquivoPdf() != null && sadt.getArquivoPdf().length > 0) {
            String nome = (sadt.getArquivoNome() != null && !sadt.getArquivoNome().isBlank())
                    ? sadt.getArquivoNome()
                    : ("SADT-" + agendamentoId + ".pdf");

            return ResponseEntity.ok()
                    .contentType(MediaType.APPLICATION_PDF)
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + nome + "\"")
                    .body(sadt.getArquivoPdf());
        }

        // 2) Se não houver SADT, busca Comprovante
        ProntuarioDocumento comprovante = documentoRepository
                .findFirstByAgendamentoIdAndTipoOrderByCriadoEmDesc(agendamentoId, TipoDocumento.COMPROVANTE_AGENDAMENTO)
                .orElse(null);

        if (comprovante == null || comprovante.getArquivoPdf() == null || comprovante.getArquivoPdf().length == 0) {
            return ResponseEntity.notFound().build();
        }

        String nome = (comprovante.getArquivoNome() != null && !comprovante.getArquivoNome().isBlank())
                ? comprovante.getArquivoNome()
                : ("Comprovante-Agendamento-" + agendamentoId + ".pdf");

        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_PDF)
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + nome + "\"")
                .body(comprovante.getArquivoPdf());
    }
}
