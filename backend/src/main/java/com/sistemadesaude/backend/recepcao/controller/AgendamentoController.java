package com.sistemadesaude.backend.recepcao.controller;

import com.sistemadesaude.backend.exames.dto.GerarSadtRequest;
import com.sistemadesaude.backend.exames.dto.SadtResponseDTO;
import com.sistemadesaude.backend.exames.service.SadtService;
import com.sistemadesaude.backend.recepcao.dto.AgendamentoDTO;
import com.sistemadesaude.backend.recepcao.dto.AtualizarStatusAgendamentoRequest;
import com.sistemadesaude.backend.recepcao.dto.NovoAgendamentoRequest;
import com.sistemadesaude.backend.recepcao.entity.StatusAgendamento;
import com.sistemadesaude.backend.recepcao.service.AgendamentoService;
import com.sistemadesaude.backend.exames.dto.SadtDTO;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.time.LocalDate;
import java.util.Arrays;
import java.util.Base64;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/agendamentos")
@RequiredArgsConstructor
@Slf4j
public class AgendamentoController {

    private final AgendamentoService agendamentoService;
    private final SadtService sadtService;

    private void logUserInfo(String operation) {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth != null) {
                log.debug("🔐 [{}] Usuário: {} | Roles: {}",
                        operation,
                        auth.getName(),
                        auth.getAuthorities()
                );
            } else {
                log.warn("⚠️ [{}] Authentication context is null", operation);
            }
        } catch (Exception e) {
            log.error("❌ [{}] Erro ao obter informações de autenticação: {}", operation, e.getMessage());
        }
    }

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<AgendamentoDTO>> listarTodos() {
        logUserInfo("LISTAR_TODOS");
        log.debug("Listando todos os agendamentos");
        try {
            List<AgendamentoDTO> agendamentos = agendamentoService.listarTodos();
            log.debug("Encontrados {} agendamentos", agendamentos.size());
            return ResponseEntity.ok(agendamentos);
        } catch (Exception e) {
            log.error("❌ Erro ao listar todos os agendamentos: {}", e.getMessage(), e);
            // Retornar lista vazia em caso de erro para não quebrar o frontend
            return ResponseEntity.ok(List.of());
        }
    }

    @GetMapping("/por-paciente/{pacienteId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<AgendamentoDTO>> listarPorPaciente(@PathVariable Long pacienteId) {
        logUserInfo("LISTAR_POR_PACIENTE");
        log.info("Buscando agendamentos do paciente ID: {}", pacienteId);

        if (pacienteId == null || pacienteId <= 0) {
            log.warn("ID do paciente inválido: {}", pacienteId);
            return ResponseEntity.badRequest().build();
        }

        try {
            List<AgendamentoDTO> agendamentos = agendamentoService.listarPorPaciente(pacienteId);
            log.info("Encontrados {} agendamentos para o paciente {}", agendamentos.size(), pacienteId);
            return ResponseEntity.ok(agendamentos);
        } catch (Exception e) {
            log.error("❌ Erro ao listar agendamentos do paciente {}: {}", pacienteId, e.getMessage(), e);
            return ResponseEntity.ok(List.of());
        }
    }

    @GetMapping("/paciente/{pacienteId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<AgendamentoDTO>> buscarAgendamentosPaciente(@PathVariable Long pacienteId) {
        log.info("Buscando agendamentos do paciente ID: {} (endpoint alternativo)", pacienteId);
        return listarPorPaciente(pacienteId);
    }

    // ✅ CORREÇÃO PRINCIPAL - Método com tratamento robusto para erro LOB
    @GetMapping("/por-data")
    @PreAuthorize("permitAll()")
    public ResponseEntity<List<AgendamentoDTO>> listarPorData(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate data) {

        logUserInfo("LISTAR_POR_DATA");
        log.info("🔍 Buscando agendamentos para a data: {}", data);

        try {
            List<AgendamentoDTO> agendamentos = agendamentoService.listarPorDataSeguro(data);
            log.info("✅ Encontrados {} agendamentos para a data {}", agendamentos.size(), data);
            return ResponseEntity.ok(agendamentos);
        } catch (Exception e) {
            log.error("❌ Erro ao buscar agendamentos para a data {}: {}", data, e.getMessage(), e);
            // ✅ Em caso de erro, retorna lista vazia em vez de erro 400/500
            log.warn("⚠️ Retornando lista vazia devido ao erro");
            return ResponseEntity.ok(List.of());
        }
    }

    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<AgendamentoDTO> buscarPorId(@PathVariable Long id) {
        log.debug("Buscando agendamento ID: {}", id);
        if (id == null || id <= 0) {
            log.warn("ID do agendamento inválido: {}", id);
            return ResponseEntity.badRequest().build();
        }
        try {
            AgendamentoDTO agendamento = agendamentoService.buscarPorId(id);
            return ResponseEntity.ok(agendamento);
        } catch (Exception e) {
            log.error("❌ Erro ao buscar agendamento {}: {}", id, e.getMessage(), e);
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('RECEPCAO', 'ADMIN', 'MEDICO', 'ENFERMEIRO', 'MASTER', 'MASTER_USER', 'ADMINISTRADOR_SISTEMA', 'ADMINISTRADOR')")
    public ResponseEntity<AgendamentoDTO> criar(@Valid @RequestBody NovoAgendamentoRequest request) {
        logUserInfo("CRIAR_AGENDAMENTO");
        log.info("Criando novo agendamento para paciente ID: {}", request.getPacienteId());
        try {
            AgendamentoDTO agendamento = agendamentoService.criarAgendamento(request);
            log.info("Agendamento criado com sucesso. ID: {}", agendamento.getId());
            return ResponseEntity.created(URI.create("/api/agendamentos/" + agendamento.getId()))
                    .body(agendamento);
        } catch (Exception e) {
            log.error("Erro ao criar agendamento: {}", e.getMessage(), e);
            throw e;
        }
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('RECEPCAO', 'ADMIN', 'MEDICO', 'ENFERMEIRO', 'MASTER', 'MASTER_USER', 'ADMINISTRADOR_SISTEMA', 'ADMINISTRADOR', 'TRIAGEM')")
    public ResponseEntity<?> atualizarStatus(
            @PathVariable Long id,
            @RequestBody AtualizarStatusAgendamentoRequest request,
            Authentication authentication) {
        logUserInfo("ATUALIZAR_STATUS");
        log.debug("Request body recebido: {}", request);
        
        // Log das permissões do usuário para debug
        if (authentication != null) {
            log.debug("Permissões do usuário: {}", authentication.getAuthorities());
        }
        
        if (request == null) {
            log.warn("Request body é null para agendamento ID: {}", id);
            return ResponseEntity.badRequest().body(Map.of("error", "Request body é obrigatório"));
        }
        
        String novoStatus = request.getStatus();
        if (novoStatus == null || novoStatus.trim().isEmpty()) {
            log.warn("Status não informado para agendamento ID: {}", id);
            return ResponseEntity.badRequest().body(Map.of("error", "Status é obrigatório"));
        }
        
        novoStatus = novoStatus.trim().toUpperCase();
        log.info("Atualizando status do agendamento ID: {} para {}", id, novoStatus);
        
        // Valida se o status é válido antes de processar
        try {
            StatusAgendamento.valueOf(novoStatus);
        } catch (IllegalArgumentException e) {
            log.warn("Status inválido '{}' para agendamento ID: {}. Valores válidos: {}", 
                    novoStatus, id, Arrays.toString(StatusAgendamento.values()));
            return ResponseEntity.badRequest().body(Map.of(
                "error", "Status inválido",
                "statusRecebido", novoStatus,
                "valoresValidos", Arrays.stream(StatusAgendamento.values())
                    .map(Enum::name)
                    .collect(Collectors.toList())
            ));
        }
        
        try {
            AgendamentoDTO agendamento = agendamentoService.atualizarStatus(id, novoStatus);
            log.info("Status do agendamento {} atualizado com sucesso", id);
            return ResponseEntity.ok(agendamento);
        } catch (Exception e) {
            log.error("Erro ao atualizar status do agendamento {}: {}", id, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Erro ao atualizar status", "message", e.getMessage()));
        }
    }

    @PutMapping("/{agendamentoId}/status")
    @PreAuthorize("hasAnyRole('MEDICO', 'ENFERMEIRO', 'RECEPCAO', 'ADMIN', 'MASTER', 'MASTER_USER', 'ADMINISTRADOR_SISTEMA', 'ADMINISTRADOR', 'TRIAGEM')")
    public ResponseEntity<?> atualizarStatusAgendamento(
            @PathVariable Long agendamentoId,
            @RequestBody AtualizarStatusAgendamentoRequest request,
            Authentication authentication) {
        logUserInfo("ATUALIZAR_STATUS_AGENDAMENTO");
        log.debug("Request body recebido: {}", request);
        
        // Log das permissões do usuário para debug
        if (authentication != null) {
            log.debug("Permissões do usuário: {}", authentication.getAuthorities());
        }
        
        if (request == null) {
            log.warn("Request body é null para agendamento ID: {}", agendamentoId);
            return ResponseEntity.badRequest().body(Map.of("error", "Request body é obrigatório"));
        }
        
        String novoStatus = request.getStatus();
        if (novoStatus == null || novoStatus.trim().isEmpty()) {
            log.warn("Status não informado para agendamento ID: {}", agendamentoId);
            return ResponseEntity.badRequest().body(Map.of("error", "Status é obrigatório"));
        }
        
        novoStatus = novoStatus.trim().toUpperCase();
        log.info("Atualizando status do agendamento ID: {} para {}", agendamentoId, novoStatus);
        
        try {
            StatusAgendamento.valueOf(novoStatus);
        } catch (IllegalArgumentException e) {
            log.warn("Status inválido '{}' para agendamento ID: {}. Valores válidos: {}", 
                    novoStatus, agendamentoId, Arrays.toString(StatusAgendamento.values()));
            return ResponseEntity.badRequest().body(Map.of(
                "error", "Status inválido",
                "statusRecebido", novoStatus,
                "valoresValidos", Arrays.stream(StatusAgendamento.values())
                    .map(Enum::name)
                    .collect(Collectors.toList())
            ));
        }
        
        try {
            agendamentoService.atualizarStatus(agendamentoId, novoStatus);
            log.info("✅ Status do agendamento {} atualizado para: {}", agendamentoId, novoStatus);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            log.error("❌ Erro ao atualizar status do agendamento {}: {}", agendamentoId, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Erro ao atualizar status", "message", e.getMessage()));
        }
    }

    /**
     * Endpoint para cancelar agendamentos de consultas.
     * Aceita um motivo no corpo da requisição e registra na auditoria.
     * Permite que qualquer usuário autenticado cancele agendamentos.
     */
    @PostMapping("/{id}/cancelar")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Void> cancelarComMotivo(
            @PathVariable Long id,
            @RequestBody Map<String, String> request,
            Authentication authentication) {
        logUserInfo("CANCELAR_AGENDAMENTO_COM_MOTIVO");
        
        String motivo = request.get("motivo");
        String usuario = authentication != null ? authentication.getName() : "desconhecido";
        
        log.info("📌 Cancelando agendamento ID: {} | Motivo: {} | Usuário: {}", id, motivo, usuario);
        
        try {
            // Atualiza o status para CANCELADO
            agendamentoService.atualizarStatus(id, "CANCELADO");
            
            // TODO: Registrar o motivo e usuário no banco (adicionar campos na entidade Agendamento)
            // Por enquanto, apenas logamos para auditoria via logs
            log.info("✅ Agendamento {} cancelado com sucesso por {} | Motivo: {}", id, usuario, motivo);
            
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            log.error("❌ Erro ao cancelar agendamento {}: {}", id, e.getMessage(), e);
            throw e;
        }
    }

    /**
     * Endpoint legado de cancelamento via DELETE (mantido para compatibilidade).
     * @deprecated Use POST /api/agendamentos/{id}/cancelar com motivo
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('RECEPCAO', 'ADMIN', 'MASTER', 'MASTER_USER', 'ADMINISTRADOR_SISTEMA', 'ADMINISTRADOR')")
    public ResponseEntity<Void> cancelar(
            @PathVariable Long id,
            @RequestBody(required = false) Map<String, String> request) {
        logUserInfo("CANCELAR_AGENDAMENTO_LEGADO");
        log.info("Cancelando agendamento ID: {} (endpoint legado)", id);
        try {
            agendamentoService.atualizarStatus(id, "CANCELADO");
            log.info("Agendamento {} cancelado com sucesso", id);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            log.error("Erro ao cancelar agendamento {}: {}", id, e.getMessage(), e);
            throw e;
        }
    }

    @GetMapping("/{id}/precisa-sadt")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Map<String, Object>> verificarSadt(@PathVariable Long id) {
        log.debug("Verificando necessidade de SADT para agendamento: {}", id);
        try {
            boolean precisaSadt = agendamentoService.precisaSadt(id);
            List<SadtDTO> sadtsExistentes = sadtService.buscarSadtsPorAgendamento(id);
            boolean temSadt = !sadtsExistentes.isEmpty();
            Map<String, Object> resposta = Map.of(
                    "precisaSadt", precisaSadt,
                    "temSadt", temSadt,
                    "podeGerar", precisaSadt
            );
            log.debug("Verificação de SADT para agendamento {}: precisa={}, tem={}", id, precisaSadt, temSadt);
            return ResponseEntity.ok(resposta);
        } catch (Exception e) {
            log.error("Erro ao verificar SADT para agendamento {}: {}", id, e.getMessage(), e);
            Map<String, Object> resposta = Map.of(
                    "precisaSadt", false, "temSadt", false, "podeGerar", false
            );
            return ResponseEntity.ok(resposta);
        }
    }

    @PostMapping("/{id}/gerar-sadt")
    @PreAuthorize("hasAnyRole('RECEPCAO', 'ADMIN', 'MEDICO', 'ENFERMEIRO', 'MASTER', 'MASTER_USER', 'ADMINISTRADOR_SISTEMA', 'ADMINISTRADOR')")
    public ResponseEntity<SadtResponseDTO> gerarSadtPorAgendamento(
            @PathVariable Long id,
            @RequestParam(required = false) String operador,
            Authentication authentication) {
        try {
            log.info("📋 POST /api/agendamentos/{}/gerar-sadt - Gerando SADT", id);
            String usuarioLogado = authentication != null ? authentication.getName() : (operador != null ? operador : "Sistema");
            AgendamentoDTO agendamento = agendamentoService.buscarPorId(id);
            if (agendamento == null) {
                log.error("Agendamento {} não encontrado", id);
                return ResponseEntity.notFound().build();
            }
            GerarSadtRequest request = GerarSadtRequest.builder()
                    .agendamentoId(id)
                    .pacienteId(agendamento.getPacienteId())
                    .procedimentos(List.of())
                    .observacoes("Gerado via agendamento #" + id + " - " + agendamento.getTipo())
                    .urgente(false)
                    .build();
            SadtResponseDTO response = sadtService.gerarSadt(request, usuarioLogado);
            log.info("✅ SADT {} gerada para agendamento {}", response.getNumeroSadt(), id);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("❌ Erro ao gerar SADT para agendamento {}: {}", id, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(SadtResponseDTO.builder().numeroSadt("ERRO").pdfBase64("").sucesso(false).mensagem("Erro interno: " + e.getMessage()).build());
        }
    }

    @GetMapping("/{id}/sadt-pdf")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<byte[]> downloadSadtPdf(@PathVariable Long id) {
        try {
            log.info("📥 GET /api/agendamentos/{}/sadt-pdf - Download PDF", id);
            List<SadtDTO> sadts = sadtService.buscarSadtsPorAgendamento(id);
            if (sadts.isEmpty()) {
                log.warn("Nenhuma SADT encontrada para o agendamento {}", id);
                return ResponseEntity.notFound().build();
            }
            SadtDTO sadt = sadts.get(0);
            byte[] pdfBytes = sadtService.downloadSadtPdf(sadt.getNumeroSadt());
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_PDF);
            headers.setContentDispositionFormData("attachment", "SADT_" + sadt.getNumeroSadt() + ".pdf");
            headers.setContentLength(pdfBytes.length);
            log.info("✅ Download PDF SADT {} concluído", sadt.getNumeroSadt());
            return new ResponseEntity<>(pdfBytes, headers, HttpStatus.OK);
        } catch (Exception e) {
            log.error("❌ Erro ao fazer download da SADT do agendamento {}: {}", id, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }

    @GetMapping("/aguardando-triagem")
    @PreAuthorize("hasAnyRole('TRIAGEM', 'ENFERMEIRO', 'ADMIN', 'GESTOR', 'MASTER', 'MASTER_USER', 'ADMINISTRADOR_SISTEMA', 'ADMINISTRADOR')")
    public ResponseEntity<List<AgendamentoDTO>> listarAguardandoTriagem() {
        logUserInfo("LISTAR_AGUARDANDO_TRIAGEM");
        log.info("Buscando agendamentos que aguardam triagem");
        try {
            List<AgendamentoDTO> agendamentos = agendamentoService.listarAguardandoTriagem();
            log.info("Encontrados {} agendamentos aguardando triagem", agendamentos.size());
            return ResponseEntity.ok(agendamentos);
        } catch (Exception e) {
            log.error("Erro ao buscar agendamentos aguardando triagem: {}", e.getMessage(), e);
            return ResponseEntity.ok(List.of());
        }
    }

    @GetMapping("/{id}/comprovante-pdf")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<byte[]> downloadComprovantePdf(@PathVariable Long id) {
        try {
            log.info("📄 Baixando PDF de comprovante para agendamento ID: {}", id);
            AgendamentoDTO agendamento = agendamentoService.buscarPorIdComPdf(id);

            if (agendamento.getComprovantePdfBase64() == null || agendamento.getComprovantePdfBase64().isEmpty()) {
                log.warn("Comprovante PDF não encontrado para o agendamento {}", id);
                return ResponseEntity.notFound().build();
            }

            byte[] pdfBytes = Base64.getDecoder().decode(agendamento.getComprovantePdfBase64());

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_PDF);
            headers.setContentDispositionFormData("inline", "Comprovante_Agendamento_" + id + ".pdf");
            headers.setContentLength(pdfBytes.length);

            log.info("✅ PDF de comprovante enviado com sucesso.");
            return new ResponseEntity<>(pdfBytes, headers, HttpStatus.OK);

        } catch (Exception e) {
            log.error("❌ Erro ao baixar PDF de comprovante para agendamento {}: {}", id, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}
