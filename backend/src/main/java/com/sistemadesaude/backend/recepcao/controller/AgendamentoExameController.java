package com.sistemadesaude.backend.recepcao.controller;

import com.sistemadesaude.backend.recepcao.dto.AgendamentoExameDTO;
import com.sistemadesaude.backend.recepcao.dto.NovoAgendamentoExameRequest;
import com.sistemadesaude.backend.recepcao.entity.AgendamentoExame.StatusAgendamentoExame;
import com.sistemadesaude.backend.recepcao.service.AgendamentoExameService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

/**
 * Controller REST para gerenciamento de agendamentos de exames
 * Baseado no Manual de Agendamento de Exames v5.17.13
 */
@Slf4j
@RestController
@RequestMapping("/api/agendamentos-exames")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AgendamentoExameController {

    private final AgendamentoExameService agendamentoExameService;

    /**
     * Cria novo agendamento de exame
     */
    @PostMapping
    public ResponseEntity<AgendamentoExameDTO> criarAgendamento(@RequestBody NovoAgendamentoExameRequest request) {
        log.info("📅 REST: Criando novo agendamento de exame");
        var agendamento = agendamentoExameService.criarAgendamento(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(agendamento);
    }

    /**
     * Busca agendamento por ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<AgendamentoExameDTO> buscarPorId(@PathVariable Long id) {
        log.info("🔍 REST: Buscando agendamento ID: {}", id);
        var agendamento = agendamentoExameService.buscarPorId(id);
        return ResponseEntity.ok(agendamento);
    }

    /**
     * Busca agendamento por protocolo
     */
    @GetMapping("/protocolo/{protocolo}")
    public ResponseEntity<AgendamentoExameDTO> buscarPorProtocolo(@PathVariable String protocolo) {
        log.info("🔍 REST: Buscando agendamento por protocolo: {}", protocolo);
        var agendamento = agendamentoExameService.buscarPorProtocolo(protocolo);
        return ResponseEntity.ok(agendamento);
    }

    /**
     * Lista agendamentos por paciente
     */
    @GetMapping("/paciente/{pacienteId}")
    public ResponseEntity<List<AgendamentoExameDTO>> listarPorPaciente(@PathVariable Long pacienteId) {
        log.info("📋 REST: Listando agendamentos do paciente ID: {}", pacienteId);
        var agendamentos = agendamentoExameService.listarPorPaciente(pacienteId);
        return ResponseEntity.ok(agendamentos);
    }

    /**
     * Lista agendamentos por data
     */
    @GetMapping("/data/{data}")
    public ResponseEntity<List<AgendamentoExameDTO>> listarPorData(
            @PathVariable @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate data) {
        log.info("📅 REST: Listando agendamentos da data: {}", data);
        var agendamentos = agendamentoExameService.listarPorData(data);
        return ResponseEntity.ok(agendamentos);
    }

    /**
     * Lista agendamentos por período
     */
    @GetMapping("/periodo")
    public ResponseEntity<List<AgendamentoExameDTO>> listarPorPeriodo(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime dataInicio,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime dataFim) {
        log.info("📅 REST: Listando agendamentos do período: {} a {}", dataInicio, dataFim);
        var agendamentos = agendamentoExameService.listarPorPeriodo(dataInicio, dataFim);
        return ResponseEntity.ok(agendamentos);
    }

    /**
     * Lista agendamentos por status
     */
    @GetMapping("/status/{status}")
    public ResponseEntity<List<AgendamentoExameDTO>> listarPorStatus(@PathVariable StatusAgendamentoExame status) {
        log.info("📊 REST: Listando agendamentos com status: {}", status);
        var agendamentos = agendamentoExameService.listarPorStatus(status);
        return ResponseEntity.ok(agendamentos);
    }

    /**
     * Lista agendamentos por unidade
     */
    @GetMapping("/unidade/{unidadeId}")
    public ResponseEntity<List<AgendamentoExameDTO>> listarPorUnidade(@PathVariable Long unidadeId) {
        log.info("🏥 REST: Listando agendamentos da unidade ID: {}", unidadeId);
        var agendamentos = agendamentoExameService.listarPorUnidade(unidadeId);
        return ResponseEntity.ok(agendamentos);
    }

    /**
     * Confirma agendamento
     */
    @PutMapping("/{id}/confirmar")
    public ResponseEntity<AgendamentoExameDTO> confirmarAgendamento(
            @PathVariable Long id,
            @RequestParam String usuario) {
        log.info("✅ REST: Confirmando agendamento ID: {}", id);
        var agendamento = agendamentoExameService.confirmarAgendamento(id, usuario);
        return ResponseEntity.ok(agendamento);
    }

    /**
     * Cancela agendamento
     */
    @PutMapping("/{id}/cancelar")
    public ResponseEntity<AgendamentoExameDTO> cancelarAgendamento(
            @PathVariable Long id,
            @RequestParam String motivo,
            @RequestParam String usuario) {
        log.info("❌ REST: Cancelando agendamento ID: {}", id);
        var agendamento = agendamentoExameService.cancelarAgendamento(id, motivo, usuario);
        return ResponseEntity.ok(agendamento);
    }

    /**
     * Marca agendamento como realizado
     */
    @PutMapping("/{id}/realizar")
    public ResponseEntity<AgendamentoExameDTO> marcarRealizado(
            @PathVariable Long id,
            @RequestParam String usuario) {
        log.info("✅ REST: Marcando agendamento como realizado ID: {}", id);
        var agendamento = agendamentoExameService.marcarRealizado(id, usuario);
        return ResponseEntity.ok(agendamento);
    }

    /**
     * Marca como não compareceu
     */
    @PutMapping("/{id}/nao-compareceu")
    public ResponseEntity<AgendamentoExameDTO> marcarNaoCompareceu(
            @PathVariable Long id,
            @RequestParam String usuario) {
        log.info("⚠️ REST: Marcando agendamento como não compareceu ID: {}", id);
        var agendamento = agendamentoExameService.marcarNaoCompareceu(id, usuario);
        return ResponseEntity.ok(agendamento);
    }

    /**
     * Reagenda agendamento
     */
    @PutMapping("/{id}/reagendar")
    public ResponseEntity<AgendamentoExameDTO> reagendar(
            @PathVariable Long id,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime novaDataHora,
            @RequestParam String motivo,
            @RequestParam String usuario) {
        log.info("🔄 REST: Reagendando agendamento ID: {} para {}", id, novaDataHora);
        var agendamento = agendamentoExameService.reagendar(id, novaDataHora, motivo, usuario);
        return ResponseEntity.ok(agendamento);
    }

    /**
     * Atualiza status do agendamento
     */
    @PutMapping("/{id}/status")
    public ResponseEntity<AgendamentoExameDTO> atualizarStatus(
            @PathVariable Long id,
            @RequestParam StatusAgendamentoExame novoStatus,
            @RequestParam String usuario) {
        log.info("🔄 REST: Atualizando status do agendamento ID: {} para {}", id, novoStatus);
        var agendamento = agendamentoExameService.atualizarStatus(id, novoStatus, usuario);
        return ResponseEntity.ok(agendamento);
    }

    /**
     * Lista agendamentos pendentes de confirmação
     */
    @GetMapping("/pendentes-confirmacao")
    public ResponseEntity<List<AgendamentoExameDTO>> listarPendentesConfirmacao() {
        log.info("📋 REST: Listando agendamentos pendentes de confirmação");
        var agendamentos = agendamentoExameService.listarPendentesConfirmacao();
        return ResponseEntity.ok(agendamentos);
    }

    /**
     * Lista agendamentos atrasados
     */
    @GetMapping("/atrasados")
    public ResponseEntity<List<AgendamentoExameDTO>> listarAtrasados() {
        log.info("⏰ REST: Listando agendamentos atrasados");
        var agendamentos = agendamentoExameService.listarAtrasados();
        return ResponseEntity.ok(agendamentos);
    }

    /**
     * Verifica disponibilidade de horário
     */
    @GetMapping("/verificar-disponibilidade")
    public ResponseEntity<Map<String, Boolean>> verificarDisponibilidade(
            @RequestParam Long horarioExameId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime dataHora) {
        log.info("🔍 REST: Verificando disponibilidade para horário ID: {} em {}", horarioExameId, dataHora);
        boolean disponivel = agendamentoExameService.verificarDisponibilidade(horarioExameId, dataHora);
        return ResponseEntity.ok(Map.of("disponivel", disponivel));
    }

    /**
     * Gera e faz download do comprovante em PDF
     */
    @GetMapping("/{id}/comprovante")
    @ResponseBody
    public ResponseEntity<byte[]> gerarComprovantePdf(@PathVariable Long id) {
        log.info("📄 REST: Gerando comprovante PDF para agendamento ID: {}", id);
        byte[] pdf = agendamentoExameService.gerarComprovantePdf(id);
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_PDF)
                .header("Content-Disposition", "attachment; filename=comprovante-agendamento-" + id + ".pdf")
                .body(pdf);
    }

    /**
     * Busca agenda do dia para profissional
     */
    @GetMapping("/agenda-profissional/{profissionalId}")
    public ResponseEntity<List<AgendamentoExameDTO>> buscarAgendaDiaProfissional(
            @PathVariable Long profissionalId,
            @RequestParam @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate data) {
        log.info("📅 REST: Buscando agenda do dia {} para profissional ID: {}", data, profissionalId);
        var agendamentos = agendamentoExameService.buscarAgendaDiaProfissional(profissionalId, data);
        return ResponseEntity.ok(agendamentos);
    }

    /**
     * Health check do endpoint
     */
    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> health() {
        return ResponseEntity.ok(Map.of(
                "status", "UP",
                "service", "AgendamentoExameController",
                "timestamp", LocalDateTime.now().toString()
        ));
    }
}