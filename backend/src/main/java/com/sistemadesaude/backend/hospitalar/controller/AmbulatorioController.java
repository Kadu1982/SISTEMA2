package com.sistemadesaude.backend.hospitalar.controller;

import com.sistemadesaude.backend.hospitalar.dto.*;
import com.sistemadesaude.backend.hospitalar.service.AgendamentoAmbulatorioService;
import com.sistemadesaude.backend.hospitalar.service.EscalaMedicaService;
import com.sistemadesaude.backend.response.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

/**
 * Controller para o Ambulatório Hospitalar
 * Gerencia agendamentos, escalas médicas e controle de presença
 */
@RestController
@RequestMapping("/api/hospitalar/ambulatorio")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Ambulatório Hospitalar", description = "API do Ambulatório Hospitalar - Agendamentos, escalas e controle de presença")
public class AmbulatorioController {

    private final AgendamentoAmbulatorioService agendamentoService;
    private final EscalaMedicaService escalaMedicaService;

    // ============== ENDPOINTS DE AGENDAMENTOS ==============

    @PostMapping("/agendamentos")
    @Operation(summary = "Criar novo agendamento",
               description = "Cria um novo agendamento ambulatorial para um paciente")
    public ResponseEntity<ApiResponse<AgendamentoAmbulatorioDTO>> criarAgendamento(
            @Valid @RequestBody CriarAgendamentoAmbulatorioRequest request) {
        log.info("Criando agendamento ambulatorial para paciente: {}", request.getPacienteId());
        ApiResponse<AgendamentoAmbulatorioDTO> response = agendamentoService.criarAgendamento(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/agendamentos/{id}/confirmar-presenca")
    @Operation(summary = "Confirmar presença do paciente",
               description = "Marca o paciente como presente para o agendamento")
    public ResponseEntity<ApiResponse<AgendamentoAmbulatorioDTO>> confirmarPresenca(
            @PathVariable Long id,
            @Parameter(description = "ID do operador responsável")
            @RequestParam Long operadorId) {
        log.info("Confirmando presença para agendamento: {}", id);
        ApiResponse<AgendamentoAmbulatorioDTO> response = agendamentoService.confirmarPresenca(id, operadorId);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/agendamentos/{id}/chamar")
    @Operation(summary = "Chamar paciente para atendimento",
               description = "Chama o paciente presente para iniciar o atendimento")
    public ResponseEntity<ApiResponse<AgendamentoAmbulatorioDTO>> chamarPaciente(
            @PathVariable Long id,
            @Parameter(description = "ID do operador responsável")
            @RequestParam Long operadorId) {
        log.info("Chamando paciente para agendamento: {}", id);
        ApiResponse<AgendamentoAmbulatorioDTO> response = agendamentoService.chamarPaciente(id, operadorId);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/agendamentos/{id}/iniciar-atendimento")
    @Operation(summary = "Iniciar atendimento",
               description = "Inicia o atendimento de um paciente chamado")
    public ResponseEntity<ApiResponse<AgendamentoAmbulatorioDTO>> iniciarAtendimento(
            @PathVariable Long id,
            @Parameter(description = "ID do operador responsável")
            @RequestParam Long operadorId) {
        log.info("Iniciando atendimento para agendamento: {}", id);
        ApiResponse<AgendamentoAmbulatorioDTO> response = agendamentoService.iniciarAtendimento(id, operadorId);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/agendamentos/{id}/finalizar-atendimento")
    @Operation(summary = "Finalizar atendimento",
               description = "Finaliza o atendimento de um paciente em atendimento")
    public ResponseEntity<ApiResponse<AgendamentoAmbulatorioDTO>> finalizarAtendimento(
            @PathVariable Long id,
            @Parameter(description = "ID do operador responsável")
            @RequestParam Long operadorId,
            @Parameter(description = "Observações do atendimento (opcional)")
            @RequestParam(required = false) String observacoes) {
        log.info("Finalizando atendimento para agendamento: {}", id);
        ApiResponse<AgendamentoAmbulatorioDTO> response = agendamentoService.finalizarAtendimento(id, operadorId, observacoes);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/agendamentos")
    @Operation(summary = "Listar agendamentos por data",
               description = "Lista agendamentos filtrados por data e opcionalmente por unidade")
    public ResponseEntity<ApiResponse<List<AgendamentoAmbulatorioDTO>>> listarAgendamentos(
            @Parameter(description = "Data dos agendamentos")
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate data,
            @Parameter(description = "ID da unidade (opcional)")
            @RequestParam(required = false) Long unidadeId) {
        log.info("Listando agendamentos para data: {} - unidade: {}", data, unidadeId);
        ApiResponse<List<AgendamentoAmbulatorioDTO>> response = agendamentoService.listarAgendamentosPorData(data, unidadeId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/agendamentos/aguardando")
    @Operation(summary = "Listar pacientes aguardando",
               description = "Lista pacientes presentes aguardando chamada para atendimento")
    public ResponseEntity<ApiResponse<List<AgendamentoAmbulatorioDTO>>> listarPacientesAguardando(
            @Parameter(description = "Data dos agendamentos")
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate data) {
        log.info("Listando pacientes aguardando para data: {}", data);
        ApiResponse<List<AgendamentoAmbulatorioDTO>> response = agendamentoService.listarPacientesAguardando(data);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/agendamentos/estatisticas")
    @Operation(summary = "Estatísticas de agendamentos",
               description = "Obtém estatísticas de agendamentos por período")
    public ResponseEntity<ApiResponse<Map<String, Object>>> obterEstatisticasAgendamentos(
            @Parameter(description = "Data de início do período")
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dataInicio,
            @Parameter(description = "Data de fim do período")
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dataFim) {
        log.info("Obtendo estatísticas de agendamentos - {} a {}", dataInicio, dataFim);
        ApiResponse<Map<String, Object>> response = agendamentoService.obterEstatisticasAgendamentos(dataInicio, dataFim);
        return ResponseEntity.ok(response);
    }

    // ============== ENDPOINTS DE ESCALAS MÉDICAS ==============

    @PostMapping("/escalas")
    @Operation(summary = "Criar escala médica",
               description = "Cria uma nova escala médica para um profissional")
    public ResponseEntity<ApiResponse<EscalaMedicaDTO>> criarEscala(
            @Valid @RequestBody CriarEscalaMedicaRequest request) {
        log.info("Criando escala médica para profissional: {}", request.getProfissionalId());
        ApiResponse<EscalaMedicaDTO> response = escalaMedicaService.criarEscala(request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/escalas")
    @Operation(summary = "Listar escalas por data",
               description = "Lista escalas médicas filtradas por data e opcionalmente por unidade")
    public ResponseEntity<ApiResponse<List<EscalaMedicaDTO>>> listarEscalas(
            @Parameter(description = "Data das escalas")
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate data,
            @Parameter(description = "ID da unidade (opcional)")
            @RequestParam(required = false) Long unidadeId) {
        log.info("Listando escalas para data: {} - unidade: {}", data, unidadeId);
        ApiResponse<List<EscalaMedicaDTO>> response = escalaMedicaService.listarEscalasPorData(data, unidadeId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/escalas/com-vagas")
    @Operation(summary = "Listar escalas com vagas disponíveis",
               description = "Lista escalas médicas que possuem vagas disponíveis para agendamento")
    public ResponseEntity<ApiResponse<List<EscalaMedicaDTO>>> listarEscalasComVagas(
            @Parameter(description = "Data das escalas")
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate data) {
        log.info("Listando escalas com vagas para data: {}", data);
        ApiResponse<List<EscalaMedicaDTO>> response = escalaMedicaService.listarEscalasComVagas(data);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/escalas/{id}/inativar")
    @Operation(summary = "Inativar escala médica",
               description = "Inativa uma escala médica por motivo específico")
    public ResponseEntity<ApiResponse<EscalaMedicaDTO>> inativarEscala(
            @PathVariable Long id,
            @Parameter(description = "ID do operador responsável")
            @RequestParam Long operadorId,
            @Parameter(description = "Motivo da inativação")
            @RequestParam String motivo) {
        log.info("Inativando escala: {} - motivo: {}", id, motivo);
        ApiResponse<EscalaMedicaDTO> response = escalaMedicaService.inativarEscala(id, operadorId, motivo);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/escalas/{id}/bloquear-vagas")
    @Operation(summary = "Bloquear vagas da escala",
               description = "Bloqueia uma quantidade específica de vagas de uma escala médica")
    public ResponseEntity<ApiResponse<EscalaMedicaDTO>> bloquearVagas(
            @PathVariable Long id,
            @Parameter(description = "Quantidade de vagas a bloquear")
            @RequestParam Integer quantidadeVagas,
            @Parameter(description = "ID do operador responsável")
            @RequestParam Long operadorId,
            @Parameter(description = "Motivo do bloqueio")
            @RequestParam String motivo) {
        log.info("Bloqueando {} vagas na escala: {} - motivo: {}", quantidadeVagas, id, motivo);
        ApiResponse<EscalaMedicaDTO> response = escalaMedicaService.bloquearVagas(id, quantidadeVagas, operadorId, motivo);
        return ResponseEntity.ok(response);
    }

    // ============== ENDPOINTS DASHBOARD AMBULATÓRIO ==============

    @GetMapping("/dashboard")
    @Operation(summary = "Dashboard do ambulatório",
               description = "Obtém dados resumidos para dashboard do ambulatório")
    public ResponseEntity<ApiResponse<Map<String, Object>>> obterDashboard(
            @Parameter(description = "Data para o dashboard")
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate data,
            @Parameter(description = "ID da unidade (opcional)")
            @RequestParam(required = false) Long unidadeId) {
        log.info("Obtendo dados do dashboard para data: {} - unidade: {}", data, unidadeId);

        try {
            // Buscar dados necessários para o dashboard
            ApiResponse<List<AgendamentoAmbulatorioDTO>> agendamentos = agendamentoService.listarAgendamentosPorData(data, unidadeId);
            ApiResponse<List<AgendamentoAmbulatorioDTO>> aguardando = agendamentoService.listarPacientesAguardando(data);
            ApiResponse<List<EscalaMedicaDTO>> escalas = escalaMedicaService.listarEscalasPorData(data, unidadeId);

            // Montar dados do dashboard
            Map<String, Object> dashboard = Map.of(
                "data", data,
                "totalAgendamentos", agendamentos.getData() != null ? agendamentos.getData().size() : 0,
                "pacientesAguardando", aguardando.getData() != null ? aguardando.getData().size() : 0,
                "escalasAtivas", escalas.getData() != null ? escalas.getData().size() : 0,
                "agendamentos", agendamentos.getData(),
                "aguardando", aguardando.getData(),
                "escalas", escalas.getData()
            );

            return ResponseEntity.ok(ApiResponse.success(dashboard, "Dashboard obtido com sucesso"));

        } catch (Exception e) {
            log.error("Erro ao obter dashboard: {}", e.getMessage(), e);
            return ResponseEntity.ok(ApiResponse.error("Erro ao obter dados do dashboard"));
        }
    }

    // ============== ENDPOINTS DE UTILITÁRIOS ==============

    @GetMapping("/status")
    @Operation(summary = "Status do Ambulatório",
               description = "Retorna o status atual do módulo Ambulatório Hospitalar")
    public ResponseEntity<ApiResponse<Map<String, Object>>> obterStatus() {
        Map<String, Object> status = Map.of(
            "modulo", "Ambulatório Hospitalar",
            "versao", "1.0.0",
            "status", "ATIVO",
            "funcionalidades", List.of(
                "Agendamentos Ambulatoriais",
                "Escalas Médicas",
                "Controle de Presença",
                "Gestão de Filas",
                "Encaminhamentos Internos",
                "Estatísticas e Relatórios"
            ),
            "endpoints", Map.of(
                "agendamentos", List.of("criar", "confirmar-presenca", "chamar", "iniciar-atendimento", "finalizar-atendimento"),
                "escalas", List.of("criar", "listar", "inativar", "bloquear-vagas"),
                "dashboard", List.of("dashboard", "estatisticas")
            )
        );

        return ResponseEntity.ok(ApiResponse.success(status, "Status obtido com sucesso"));
    }
}