package com.sistemadesaude.backend.documentos.controller;

import com.sistemadesaude.backend.documentos.dto.AtestadoDTO;
import com.sistemadesaude.backend.documentos.dto.ReceituarioDTO;
import com.sistemadesaude.backend.documentos.service.AtestadoPdfService;
import com.sistemadesaude.backend.documentos.service.ReceituarioPdfService;
import com.sistemadesaude.backend.paciente.entity.Paciente;
import com.sistemadesaude.backend.paciente.repository.PacienteRepository;
import com.sistemadesaude.backend.profissional.entity.Profissional;
import com.sistemadesaude.backend.profissional.repository.ProfissionalRepository;
import com.sistemadesaude.backend.unidadesaude.entity.UnidadeSaude;
import com.sistemadesaude.backend.unidadesaude.repository.UnidadeSaudeRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.Base64;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/documentos")
// ✅ habilita 5011/5173/3000 e expõe Content-Disposition para o navegador
@CrossOrigin(
        origins = {"http://localhost:5011", "http://localhost:5173", "http://localhost:3000"},
        allowCredentials = "true",
        allowedHeaders = "*",
        exposedHeaders = {"Content-Disposition"}
)
@RequiredArgsConstructor
public class DocumentosControllerLegacy {

    private final AtestadoPdfService atestadoPdfService;
    private final ReceituarioPdfService receituarioPdfService;
    private final PacienteRepository pacienteRepository;
    private final ProfissionalRepository profissionalRepository;
    private final UnidadeSaudeRepository unidadeSaudeRepository;

    // =========================================================================
    // AT E S T A D O
    // =========================================================================

    /** Gera ATTESTADO em PDF e devolve base64 para preview no frontend. */
    @PostMapping("/atestado/gerar")
    public Map<String, Object> gerarAtestado(@RequestBody AtestadoDTO dto) {
        try {
            Paciente p = dto.getPacienteId() != null
                    ? pacienteRepository.findById(dto.getPacienteId()).orElse(null) : null;
            Profissional prof = dto.getProfissionalId() != null
                    ? profissionalRepository.findById(dto.getProfissionalId()).orElse(null) : null;
            UnidadeSaude un = dto.getUnidadeId() != null
                    ? unidadeSaudeRepository.findById(dto.getUnidadeId()).orElse(null) : null;

            byte[] pdf = atestadoPdfService.gerarPdf(dto, p, prof, un);
            String b64 = Base64.getEncoder().encodeToString(pdf);
            String nome = "Atestado_" + LocalDate.now() + ".pdf";

            return Map.of("success", true, "fileName", nome, "pdfBase64", b64);
        } catch (Exception e) {
            log.error("Erro ao gerar atestado: {}", e.getMessage(), e);
            return Map.of("success", false, "message", "Erro ao gerar atestado: " + e.getMessage());
        }
    }

    /** Baixa ATTESTADO como bytes (útil para abrir direto em iframe). */
    @PostMapping(value = "/atestado/baixar", produces = MediaType.APPLICATION_PDF_VALUE)
    public ResponseEntity<byte[]> baixarAtestado(@RequestBody AtestadoDTO dto) {
        byte[] pdf = atestadoPdfService.gerarPdf(
                dto,
                dto.getPacienteId() != null ? pacienteRepository.findById(dto.getPacienteId()).orElse(null) : null,
                dto.getProfissionalId() != null ? profissionalRepository.findById(dto.getProfissionalId()).orElse(null) : null,
                dto.getUnidadeId() != null ? unidadeSaudeRepository.findById(dto.getUnidadeId()).orElse(null) : null
        );
        HttpHeaders h = new HttpHeaders();
        h.setContentType(MediaType.APPLICATION_PDF);
        h.setContentDispositionFormData("inline", "Atestado.pdf"); // inline para embed
        h.setContentLength(pdf.length); // ✅ ajuda o browser
        return ResponseEntity.ok().headers(h).body(pdf);
    }

    // =========================================================================
    // R E C E I T U Á R I O
    // =========================================================================

    /** Gera RECEITUÁRIO em PDF e devolve base64 para preview no frontend. */
    @PostMapping("/receituario/gerar")
    public Map<String, Object> gerarReceituario(@RequestBody ReceituarioDTO dto) {
        try {
            Paciente p = dto.getPacienteId() != null
                    ? pacienteRepository.findById(dto.getPacienteId()).orElse(null) : null;
            Profissional prof = dto.getProfissionalId() != null
                    ? profissionalRepository.findById(dto.getProfissionalId()).orElse(null) : null;
            UnidadeSaude un = dto.getUnidadeId() != null
                    ? unidadeSaudeRepository.findById(dto.getUnidadeId()).orElse(null) : null;

            byte[] pdf = receituarioPdfService.gerarPdf(dto, p, prof, un);
            String b64 = Base64.getEncoder().encodeToString(pdf);
            String nome = "Receituario_" + LocalDate.now() + ".pdf";

            return Map.of("success", true, "fileName", nome, "pdfBase64", b64);
        } catch (Exception e) {
            log.error("Erro ao gerar receituário: {}", e.getMessage(), e);
            return Map.of("success", false, "message", "Erro ao gerar receituário: " + e.getMessage());
        }
    }

    /** Baixa RECEITUÁRIO como bytes (útil para abrir direto em iframe). */
    @PostMapping(value = "/receituario/baixar", produces = MediaType.APPLICATION_PDF_VALUE)
    public ResponseEntity<byte[]> baixarReceituario(@RequestBody ReceituarioDTO dto) {
        byte[] pdf = receituarioPdfService.gerarPdf(
                dto,
                dto.getPacienteId() != null ? pacienteRepository.findById(dto.getPacienteId()).orElse(null) : null,
                dto.getProfissionalId() != null ? profissionalRepository.findById(dto.getProfissionalId()).orElse(null) : null,
                dto.getUnidadeId() != null ? unidadeSaudeRepository.findById(dto.getUnidadeId()).orElse(null) : null
        );
        HttpHeaders h = new HttpHeaders();
        h.setContentType(MediaType.APPLICATION_PDF);
        h.setContentDispositionFormData("inline", "Receituario.pdf"); // inline para embed
        h.setContentLength(pdf.length); // ✅
        return ResponseEntity.ok().headers(h).body(pdf);
    }
}
