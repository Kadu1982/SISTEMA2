package com.sistemadesaude.backend.exames.controller;

import com.sistemadesaude.backend.exames.dto.GerarSadtRequest;
import com.sistemadesaude.backend.exames.dto.SadtResponseDTO;
import com.sistemadesaude.backend.exames.repository.SadtRepository;
import com.sistemadesaude.backend.exames.service.SadtService;
import com.sistemadesaude.backend.prontuario.entity.ProntuarioDocumento;
import com.sistemadesaude.backend.prontuario.enums.TipoDocumento;
import com.sistemadesaude.backend.prontuario.repository.ProntuarioDocumentoRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.lang.reflect.Method;
import java.nio.charset.StandardCharsets;
import java.util.Base64;

/**
 * Controlador de SADT
 * - POST /api/sadt/gerar                 → retorna SadtResponseDTO (pdfBase64)
 * - GET  /api/sadt/{numero}/pdf         → abre PDF (cache/regeneração)
 * - GET  /api/sadt/agendamentos/{id}/pdf           → abre PDF persistido no prontuário (fallback no cache)
 * - GET  /api/sadt/agendamentos/{id}/pdf/download  → força download do persistido (fallback no cache)
 */
@Slf4j
@RestController
@RequestMapping("/api/sadt")
@RequiredArgsConstructor
public class SadtController {

    private final SadtService sadtService;

    // ➕ para fallback (se ainda não houver no prontuário)
    private final SadtRepository sadtRepository;

    // ➕ leitura do PDF PERSISTIDO no prontuário
    private final ProntuarioDocumentoRepository documentoRepository;

    // 1) Geração (mantido)
    @PostMapping("/gerar")
    public ResponseEntity<SadtResponseDTO> gerar(
            @Valid @RequestBody GerarSadtRequest request,
            Authentication authentication
    ) {
        final String usuario = authentication != null ? authentication.getName() : null;
        SadtResponseDTO resp = sadtService.gerarSadt(request, usuario);
        return ResponseEntity.ok(resp);
    }

    // 2) Download por número (mantido)
    @GetMapping(value = "/{numeroSadt}/pdf", produces = MediaType.APPLICATION_PDF_VALUE)
    public ResponseEntity<byte[]> download(@PathVariable String numeroSadt) {
        byte[] pdf = sadtService.downloadSadtPdf(numeroSadt);
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_PDF)
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"SADT_" + numeroSadt + ".pdf\"")
                .body(pdf);
    }

    // 3) NOVO: Exibir/Imprimir PDF persistido no prontuário por agendamento
    @GetMapping(value = "/agendamentos/{agendamentoId}/pdf", produces = MediaType.APPLICATION_PDF_VALUE)
    public ResponseEntity<byte[]> exibirPorAgendamento(@PathVariable Long agendamentoId) {
        byte[] pdf = buscarPdfPersistidoOuFallback(agendamentoId);
        if (pdf == null || pdf.length == 0) return ResponseEntity.notFound().build();

        String nome = "SADT-AG_" + agendamentoId + ".pdf";
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_PDF)
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + nome + "\"")
                .body(pdf);
    }

    // 4) NOVO: Download do PDF persistido no prontuário por agendamento
    @GetMapping(value = "/agendamentos/{agendamentoId}/pdf/download", produces = MediaType.APPLICATION_PDF_VALUE)
    public ResponseEntity<byte[]> downloadPorAgendamento(@PathVariable Long agendamentoId) {
        byte[] pdf = buscarPdfPersistidoOuFallback(agendamentoId);
        if (pdf == null || pdf.length == 0) return ResponseEntity.notFound().build();

        String nome = "SADT-AG_" + agendamentoId + ".pdf";
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_PDF)
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + nome + "\"")
                .body(pdf);
    }

    // ----------------- helpers -----------------

    /**
     * 1ª tentativa: abre do prontuário (persistido).
     * Fallback: pega a SADT mais recente desse agendamento e usa o cache base64.
     */
    private byte[] buscarPdfPersistidoOuFallback(Long agendamentoId) {
        // tentar no prontuário
        ProntuarioDocumento doc = documentoRepository
                .findFirstByAgendamentoIdAndTipoOrderByCriadoEmDesc(agendamentoId, TipoDocumento.SADT)
                .orElse(null);

        if (doc != null && doc.getArquivoPdf() != null && doc.getArquivoPdf().length > 0) {
            return doc.getArquivoPdf();
        }

        // fallback: última SADT desse agendamento (cache em Sadt)
        return sadtRepository.findByAgendamentoIdOrderByDataEmissaoDesc(agendamentoId)
                .stream()
                .findFirst()
                .map(s -> {
                    if (s.getPdfBase64() == null || s.getPdfBase64().isBlank()) return null;
                    return Base64.getDecoder().decode(s.getPdfBase64());
                })
                .orElse(null);
    }

    // Mantive os helpers de reflexão se você quiser continuar usando por número:
    // (note que hoje o service já tem download direto por número)
    private static byte[] coerceToPdfBytes(Object out) {
        if (out == null) return null;
        if (out instanceof byte[]) return (byte[]) out;
        if (out instanceof String) {
            try { return Base64.getDecoder().decode((String) out); } catch (Exception ignored) {}
        }
        try {
            Method m = out.getClass().getMethod("getPdfBase64");
            Object base64 = m.invoke(out);
            if (base64 instanceof String && !((String) base64).isBlank()) {
                return Base64.getDecoder().decode((String) base64);
            }
        } catch (Exception ignored) {}
        return null;
    }
}
