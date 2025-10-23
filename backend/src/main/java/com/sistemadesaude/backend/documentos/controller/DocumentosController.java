package com.sistemadesaude.backend.documentos.controller;

import com.sistemadesaude.backend.documentos.dto.AtestadoDTO;
import com.sistemadesaude.backend.documentos.dto.ReceituarioDTO;
import com.sistemadesaude.backend.documentos.service.AtestadoPdfService;
import com.sistemadesaude.backend.documentos.service.ReceituarioPdfService;
import com.sistemadesaude.backend.documentos.service.ComprovantePdfService;
import com.sistemadesaude.backend.documentos.service.DocumentoService;
import com.sistemadesaude.backend.documentos.entity.Documento;
import com.sistemadesaude.backend.documentos.entity.Documento.TipoDocumento;
import com.sistemadesaude.backend.recepcao.dto.AgendamentoDTO;
import com.sistemadesaude.backend.paciente.entity.Paciente;
import com.sistemadesaude.backend.paciente.repository.PacienteRepository;
import com.sistemadesaude.backend.profissional.entity.Profissional;
import com.sistemadesaude.backend.profissional.repository.ProfissionalRepository;
import com.sistemadesaude.backend.unidadesaude.entity.UnidadeSaude;
import com.sistemadesaude.backend.unidadesaude.repository.UnidadeSaudeRepository;
import com.sistemadesaude.backend.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * Controller para geração e reimpressão de documentos PDF.
 * CONFORME ISSUE: Implementa endpoints REST específicos:
 * - POST /api/documentos/atestado
 * - POST /api/documentos/receituario  
 * - POST /api/documentos/comprovante
 * - GET /api/documentos/{id}/download
 * 
 * Com sistema de persistência para reimpressão e logo configurável.
 */
@Slf4j
@RestController
@RequestMapping("/api/documentos")
@RequiredArgsConstructor
public class DocumentosController {

    // Serviços de geração de PDF
    private final AtestadoPdfService atestadoPdfService;
    private final ReceituarioPdfService receituarioPdfService;
    private final ComprovantePdfService comprovantePdfService;
    
    // Serviço de persistência
    private final DocumentoService documentoService;
    
    // Repositories para buscar entidades
    private final PacienteRepository pacienteRepository;
    private final ProfissionalRepository profissionalRepository;
    private final UnidadeSaudeRepository unidadeSaudeRepository;

    // =========================================================================
    // ENDPOINT: POST /api/documentos/atestado
    // CONFORME ISSUE: JSON com dados essenciais; devolve idDocumento e link de download
    // =========================================================================
    
    @PostMapping("/atestado")
    public ResponseEntity<Map<String, Object>> gerarAtestado(@RequestBody AtestadoDTO dto) {
        log.info("📄 Gerando atestado para paciente ID: {}", dto.getPacienteId());
        
        try {
            // 1. Buscar entidades relacionadas
            Paciente paciente = buscarPaciente(dto.getPacienteId());
            Profissional profissional = dto.getProfissionalId() != null 
                ? profissionalRepository.findById(dto.getProfissionalId()).orElse(null) : null;
            UnidadeSaude unidade = dto.getUnidadeId() != null 
                ? unidadeSaudeRepository.findById(dto.getUnidadeId()).orElse(null) : null;

            // 2. Gerar PDF usando o serviço existente
            byte[] pdfBytes = atestadoPdfService.gerarPdf(dto, paciente, profissional, unidade);
            
            // 3. Salvar documento no sistema de arquivos e banco (CONFORME ISSUE)
            Documento documento = documentoService.salvarDocumento(
                TipoDocumento.ATESTADO, 
                paciente, 
                pdfBytes, 
                "Atestado_" + paciente.getId() + ".pdf"
            );

            // 4. Retornar resposta conforme contrato da issue
            String urlDownload = "/api/documentos/" + documento.getId() + "/download";
            
            Map<String, Object> resposta = Map.of(
                "idDocumento", documento.getId(),
                "urlDownload", urlDownload,
                "nomeArquivo", documento.getNomeArquivo(),
                "tamanho", documento.getTamanhoBytes(),
                "tipo", documento.getTipo().name(),
                "createdAt", documento.getCreatedAt()
            );

            log.info("✅ Atestado gerado com sucesso. ID: {}, URL: {}", documento.getId(), urlDownload);
            return ResponseEntity.status(HttpStatus.CREATED).body(resposta);

        } catch (Exception e) {
            log.error("❌ Erro ao gerar atestado: {}", e.getMessage(), e);
            Map<String, Object> erro = Map.of(
                "erro", true,
                "mensagem", "Erro ao gerar atestado: " + e.getMessage(),
                "timestamp", System.currentTimeMillis()
            );
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(erro);
        }
    }

    // =========================================================================
    // ENDPOINT: POST /api/documentos/receituario
    // =========================================================================
    
    @PostMapping("/receituario")
    public ResponseEntity<Map<String, Object>> gerarReceituario(@RequestBody ReceituarioDTO dto) {
        log.info("📄 Gerando receituário para paciente ID: {}", dto.getPacienteId());
        
        try {
            // 1. Buscar entidades relacionadas
            Paciente paciente = buscarPaciente(dto.getPacienteId());
            Profissional profissional = dto.getProfissionalId() != null 
                ? profissionalRepository.findById(dto.getProfissionalId()).orElse(null) : null;
            UnidadeSaude unidade = dto.getUnidadeId() != null 
                ? unidadeSaudeRepository.findById(dto.getUnidadeId()).orElse(null) : null;

            // 2. Gerar PDF usando o serviço existente
            byte[] pdfBytes = receituarioPdfService.gerarPdf(dto, paciente, profissional, unidade);
            
            // 3. Salvar documento no sistema de arquivos e banco
            Documento documento = documentoService.salvarDocumento(
                TipoDocumento.RECEITUARIO, 
                paciente, 
                pdfBytes, 
                "Receituario_" + paciente.getId() + ".pdf"
            );

            // 4. Retornar resposta conforme contrato da issue
            String urlDownload = "/api/documentos/" + documento.getId() + "/download";
            
            Map<String, Object> resposta = Map.of(
                "idDocumento", documento.getId(),
                "urlDownload", urlDownload,
                "nomeArquivo", documento.getNomeArquivo(),
                "tamanho", documento.getTamanhoBytes(),
                "tipo", documento.getTipo().name(),
                "createdAt", documento.getCreatedAt()
            );

            log.info("✅ Receituário gerado com sucesso. ID: {}, URL: {}", documento.getId(), urlDownload);
            return ResponseEntity.status(HttpStatus.CREATED).body(resposta);

        } catch (Exception e) {
            log.error("❌ Erro ao gerar receituário: {}", e.getMessage(), e);
            Map<String, Object> erro = Map.of(
                "erro", true,
                "mensagem", "Erro ao gerar receituário: " + e.getMessage(),
                "timestamp", System.currentTimeMillis()
            );
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(erro);
        }
    }

    // =========================================================================
    // ENDPOINT: POST /api/documentos/comprovante
    // =========================================================================
    
    @PostMapping("/comprovante")
    public ResponseEntity<Map<String, Object>> gerarComprovante(@RequestBody AgendamentoDTO dto) {
        log.info("📄 Gerando comprovante para agendamento/paciente ID: {}", dto.getPacienteId());
        
        try {
            // 1. Buscar paciente
            Paciente paciente = buscarPaciente(dto.getPacienteId());

            // 2. Gerar PDF usando o serviço existente
            byte[] pdfBytes = comprovantePdfService.gerarPdf(dto);
            
            // 3. Salvar documento no sistema de arquivos e banco
            Documento documento = documentoService.salvarDocumento(
                TipoDocumento.COMPROVANTE, 
                paciente, 
                pdfBytes, 
                "Comprovante_" + paciente.getId() + ".pdf"
            );

            // 4. Retornar resposta conforme contrato da issue
            String urlDownload = "/api/documentos/" + documento.getId() + "/download";
            
            Map<String, Object> resposta = Map.of(
                "idDocumento", documento.getId(),
                "urlDownload", urlDownload,
                "nomeArquivo", documento.getNomeArquivo(),
                "tamanho", documento.getTamanhoBytes(),
                "tipo", documento.getTipo().name(),
                "createdAt", documento.getCreatedAt()
            );

            log.info("✅ Comprovante gerado com sucesso. ID: {}, URL: {}", documento.getId(), urlDownload);
            return ResponseEntity.status(HttpStatus.CREATED).body(resposta);

        } catch (Exception e) {
            log.error("❌ Erro ao gerar comprovante: {}", e.getMessage(), e);
            Map<String, Object> erro = Map.of(
                "erro", true,
                "mensagem", "Erro ao gerar comprovante: " + e.getMessage(),
                "timestamp", System.currentTimeMillis()
            );
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(erro);
        }
    }

    // =========================================================================
    // ENDPOINT: GET /api/documentos/{id}/download
    // CONFORME ISSUE: 200 (PDF stream) para reimpressão
    // =========================================================================
    
    @GetMapping("/{id}/download")
    public ResponseEntity<byte[]> downloadDocumento(@PathVariable Long id) {
        log.info("📥 Download solicitado para documento ID: {}", id);
        
        try {
            // 1. Buscar documento
            Documento documento = documentoService.buscarPorId(id)
                .orElseThrow(() -> new ResourceNotFoundException("Documento não encontrado: " + id));

            // 2. Recuperar conteúdo do arquivo (com verificação de integridade)
            byte[] conteudo = documentoService.recuperarConteudoDocumento(id);

            // 3. Preparar cabeçalhos HTTP
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_PDF);
            headers.setContentLength(conteudo.length);
            
            // Nome do arquivo para download
            String filename = documento.getNomeArquivo() != null 
                ? documento.getNomeArquivo() 
                : documento.getTipo().name().toLowerCase() + "_" + id + ".pdf";
            
            headers.setContentDispositionFormData("inline", filename);

            log.info("✅ Download do documento {} concluído. Tamanho: {} bytes", id, conteudo.length);
            return ResponseEntity.ok()
                .headers(headers)
                .body(conteudo);

        } catch (ResourceNotFoundException e) {
            log.warn("❌ Documento não encontrado: {}", e.getMessage());
            return ResponseEntity.notFound().build();
            
        } catch (Exception e) {
            log.error("❌ Erro ao fazer download do documento {}: {}", id, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // ========== MÉTODOS AUXILIARES ==========

    /**
     * Busca paciente por ID com validação
     */
    private Paciente buscarPaciente(Long pacienteId) {
        if (pacienteId == null) {
            throw new IllegalArgumentException("ID do paciente é obrigatório");
        }
        return pacienteRepository.findById(pacienteId)
            .orElseThrow(() -> new ResourceNotFoundException("Paciente não encontrado: " + pacienteId));
    }
}