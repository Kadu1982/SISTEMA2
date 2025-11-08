package com.sistemadesaude.backend.procedimentosrapidos.controller;

import com.sistemadesaude.backend.exception.BusinessException;
import com.sistemadesaude.backend.exception.ResourceNotFoundException;
import com.sistemadesaude.backend.procedimentosrapidos.dto.*;
import com.sistemadesaude.backend.procedimentosrapidos.enums.StatusProcedimento;
import com.sistemadesaude.backend.procedimentosrapidos.service.ProcedimentoRapidoService;
import com.sistemadesaude.backend.exception.ApiErrorResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/procedimentos-rapidos")
@RequiredArgsConstructor
public class ProcedimentoRapidoController {

    private final ProcedimentoRapidoService procedimentoService;

    /**
     * Obtém o login do usuário logado
     */
    private String getOperadorLogado() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return auth != null ? auth.getName() : "SISTEMA";
    }

    /**
     * POST /api/procedimentos-rapidos
     * Cria um novo procedimento rápido
     */
    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiErrorResponse<ProcedimentoRapidoDTO>> criar(
            @Valid @RequestBody CriarProcedimentoRapidoRequest request
    ) {
        log.info("Requisição para criar procedimento rápido para paciente ID: {}", request.getPacienteId());
        try {
            ProcedimentoRapidoDTO resultado = procedimentoService.criar(request, getOperadorLogado());
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(new ApiErrorResponse<>(true, "Procedimento rápido criado com sucesso", resultado));
        } catch (ResourceNotFoundException e) {
            log.error("Erro ao criar procedimento: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ApiErrorResponse<>(false, e.getMessage(), null));
        } catch (BusinessException e) {
            log.error("Erro de negócio ao criar procedimento: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ApiErrorResponse<>(false, e.getMessage(), null));
        }
    }

    /**
     * GET /api/procedimentos-rapidos
     * Lista procedimentos com filtros opcionais
     */
    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiErrorResponse<List<ProcedimentoRapidoListDTO>>> listar(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime dataInicio,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime dataFim,
            @RequestParam(required = false) StatusProcedimento status,
            @RequestParam(required = false) List<StatusProcedimento> statuses,
            @RequestParam(required = false) String especialidade,
            @RequestParam(required = false) String termo
    ) {
        log.info("Listando procedimentos - Filtros: dataInicio={}, dataFim={}, status={}, statuses={}, especialidade={}, termo={}", 
                dataInicio, dataFim, status, statuses, especialidade, termo);
        try {
            List<ProcedimentoRapidoListDTO> procedimentos;

            // Se houver filtros avançados, usa método avançado
            if (statuses != null && !statuses.isEmpty() || especialidade != null || termo != null) {
                procedimentos = procedimentoService.listarComFiltrosAvancados(
                        dataInicio, dataFim, statuses, especialidade, termo);
            } else if (dataInicio != null || dataFim != null || status != null) {
                procedimentos = procedimentoService.listarComFiltros(dataInicio, dataFim, status);
            } else {
                procedimentos = procedimentoService.listarTodos();
            }

            return ResponseEntity.ok(
                    new ApiErrorResponse<>(true, "Procedimentos listados com sucesso", procedimentos)
            );
        } catch (Exception e) {
            log.error("Erro ao listar procedimentos: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiErrorResponse<>(false, "Erro ao listar procedimentos", null));
        }
    }

    /**
     * GET /api/procedimentos-rapidos/aguardando
     * Lista procedimentos aguardando atendimento
     */
    @GetMapping("/aguardando")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiErrorResponse<List<ProcedimentoRapidoListDTO>>> listarAguardando() {
        log.info("Listando procedimentos aguardando atendimento");
        try {
            List<ProcedimentoRapidoListDTO> procedimentos = procedimentoService.listarAguardando();
            return ResponseEntity.ok(
                    new ApiErrorResponse<>(true, "Procedimentos aguardando listados com sucesso", procedimentos)
            );
        } catch (Exception e) {
            log.error("Erro ao listar procedimentos aguardando: {}", e.getMessage(), e);
            return ResponseEntity.ok(new ApiErrorResponse<>(true, "Procedimentos listados", List.of()));
        }
    }

    /**
     * GET /api/procedimentos-rapidos/urgentes
     * Lista procedimentos com atividades urgentes
     */
    @GetMapping("/urgentes")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiErrorResponse<List<ProcedimentoRapidoListDTO>>> listarUrgentes() {
        log.info("Listando procedimentos com atividades urgentes");
        try {
            List<ProcedimentoRapidoListDTO> procedimentos = procedimentoService.listarComAtividadesUrgentes();
            return ResponseEntity.ok(
                    new ApiErrorResponse<>(true, "Procedimentos urgentes listados com sucesso", procedimentos)
            );
        } catch (Exception e) {
            log.error("Erro ao listar procedimentos urgentes: {}", e.getMessage(), e);
            return ResponseEntity.ok(new ApiErrorResponse<>(true, "Procedimentos listados", List.of()));
        }
    }

    /**
     * GET /api/procedimentos-rapidos/:id
     * Obtém detalhes de um procedimento
     */
    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiErrorResponse<ProcedimentoRapidoDTO>> buscarPorId(@PathVariable Long id) {
        log.info("Buscando procedimento ID: {}", id);
        try {
            ProcedimentoRapidoDTO procedimento = procedimentoService.buscarPorId(id);
            return ResponseEntity.ok(
                    new ApiErrorResponse<>(true, "Procedimento encontrado com sucesso", procedimento)
            );
        } catch (ResourceNotFoundException e) {
            log.error("Procedimento não encontrado: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ApiErrorResponse<>(false, e.getMessage(), null));
        }
    }

    /**
     * PUT /api/procedimentos-rapidos/:id/status
     * Atualiza o status do procedimento
     */
    @PutMapping("/{id}/status")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiErrorResponse<ProcedimentoRapidoDTO>> atualizarStatus(
            @PathVariable Long id,
            @RequestParam StatusProcedimento status
    ) {
        log.info("Atualizando status do procedimento ID: {} para {}", id, status);
        try {
            ProcedimentoRapidoDTO procedimento = procedimentoService.atualizarStatus(id, status, getOperadorLogado());
            return ResponseEntity.ok(
                    new ApiErrorResponse<>(true, "Status atualizado com sucesso", procedimento)
            );
        } catch (ResourceNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ApiErrorResponse<>(false, e.getMessage(), null));
        } catch (BusinessException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ApiErrorResponse<>(false, e.getMessage(), null));
        }
    }

    /**
     * POST /api/procedimentos-rapidos/:id/iniciar
     * Inicia atendimento do procedimento
     */
    @PostMapping("/{id}/iniciar")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiErrorResponse<ProcedimentoRapidoDTO>> iniciarAtendimento(
            @PathVariable Long id,
            @RequestParam Long operadorId
    ) {
        log.info("Iniciando atendimento do procedimento ID: {} pelo operador ID: {}", id, operadorId);
        try {
            ProcedimentoRapidoDTO procedimento = procedimentoService.iniciarAtendimento(id, operadorId, getOperadorLogado());
            return ResponseEntity.ok(
                    new ApiErrorResponse<>(true, "Atendimento iniciado com sucesso", procedimento)
            );
        } catch (ResourceNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ApiErrorResponse<>(false, e.getMessage(), null));
        } catch (BusinessException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ApiErrorResponse<>(false, e.getMessage(), null));
        }
    }

    /**
     * POST /api/procedimentos-rapidos/:id/atividades
     * Adiciona uma nova atividade ao procedimento
     */
    @PostMapping("/{id}/atividades")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiErrorResponse<ProcedimentoRapidoDTO>> adicionarAtividade(
            @PathVariable Long id,
            @Valid @RequestBody AtividadeEnfermagemDTO atividadeDTO
    ) {
        log.info("Adicionando atividade ao procedimento ID: {}", id);
        try {
            ProcedimentoRapidoDTO procedimento = procedimentoService.adicionarAtividade(id, atividadeDTO, getOperadorLogado());
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(new ApiErrorResponse<>(true, "Atividade adicionada com sucesso", procedimento));
        } catch (ResourceNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ApiErrorResponse<>(false, e.getMessage(), null));
        } catch (BusinessException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ApiErrorResponse<>(false, e.getMessage(), null));
        }
    }

    /**
     * PUT /api/procedimentos-rapidos/:id/atividades/:atividadeId
     * Executa/atualiza uma atividade
     */
    @PutMapping("/{id}/atividades/{atividadeId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiErrorResponse<ProcedimentoRapidoDTO>> executarAtividade(
            @PathVariable Long id,
            @PathVariable Long atividadeId,
            @Valid @RequestBody ExecutarAtividadeRequest request
    ) {
        log.info("Executando atividade ID: {} do procedimento ID: {}", atividadeId, id);
        try {
            ProcedimentoRapidoDTO procedimento = procedimentoService.executarAtividade(id, atividadeId, request, getOperadorLogado());
            return ResponseEntity.ok(
                    new ApiErrorResponse<>(true, "Atividade executada com sucesso", procedimento)
            );
        } catch (ResourceNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ApiErrorResponse<>(false, e.getMessage(), null));
        } catch (BusinessException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ApiErrorResponse<>(false, e.getMessage(), null));
        }
    }

    /**
     * PUT /api/procedimentos-rapidos/:id/atividades/:atividadeId/aprazamento
     * Realiza aprazamento de horários de uma atividade
     */
    @PutMapping("/{id}/atividades/{atividadeId}/aprazamento")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiErrorResponse<ProcedimentoRapidoDTO>> aprazarAtividade(
            @PathVariable Long id,
            @PathVariable Long atividadeId,
            @Valid @RequestBody AprazarAtividadeRequest request
    ) {
        log.info("Aprazando atividade ID: {} do procedimento ID: {}", atividadeId, id);
        try {
            ProcedimentoRapidoDTO procedimento = procedimentoService.aprazarAtividade(id, atividadeId, request, getOperadorLogado());
            return ResponseEntity.ok(
                    new ApiErrorResponse<>(true, "Atividade aprazada com sucesso", procedimento)
            );
        } catch (ResourceNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ApiErrorResponse<>(false, e.getMessage(), null));
        } catch (BusinessException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ApiErrorResponse<>(false, e.getMessage(), null));
        }
    }

    /**
     * POST /api/procedimentos-rapidos/:id/desfecho
     * Registra o desfecho e finaliza o procedimento
     */
    @PostMapping("/{id}/desfecho")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiErrorResponse<ProcedimentoRapidoDTO>> registrarDesfecho(
            @PathVariable Long id,
            @Valid @RequestBody RegistrarDesfechoRequest request
    ) {
        log.info("Registrando desfecho para procedimento ID: {}", id);
        try {
            ProcedimentoRapidoDTO procedimento = procedimentoService.registrarDesfecho(id, request, getOperadorLogado());
            return ResponseEntity.ok(
                    new ApiErrorResponse<>(true, "Desfecho registrado e procedimento finalizado com sucesso", procedimento)
            );
        } catch (ResourceNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ApiErrorResponse<>(false, e.getMessage(), null));
        } catch (BusinessException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ApiErrorResponse<>(false, e.getMessage(), null));
        }
    }

    /**
     * POST /api/procedimentos-rapidos/:id/cancelar
     * Cancela o procedimento
     */
    @PostMapping("/{id}/cancelar")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiErrorResponse<ProcedimentoRapidoDTO>> cancelar(
            @PathVariable Long id,
            @Valid @RequestBody CancelarProcedimentoRequest request
    ) {
        log.info("Cancelando procedimento ID: {}", id);
        try {
            ProcedimentoRapidoDTO procedimento = procedimentoService.cancelar(id, request, getOperadorLogado());
            return ResponseEntity.ok(
                    new ApiErrorResponse<>(true, "Procedimento cancelado com sucesso", procedimento)
            );
        } catch (ResourceNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ApiErrorResponse<>(false, e.getMessage(), null));
        } catch (BusinessException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ApiErrorResponse<>(false, e.getMessage(), null));
        }
    }

    /**
     * POST /api/procedimentos-rapidos/:id/desbloquear
     * Desbloqueia o procedimento para outro operador
     */
    @PostMapping("/{id}/desbloquear")
    @PreAuthorize("hasRole('ADMIN') or hasRole('ENFERMAGEM_SUPERVISOR')")
    public ResponseEntity<ApiErrorResponse<ProcedimentoRapidoDTO>> desbloquear(
            @PathVariable Long id,
            @RequestParam Long operadorId
    ) {
        log.info("Desbloqueando procedimento ID: {} pelo operador ID: {}", id, operadorId);
        try {
            ProcedimentoRapidoDTO procedimento = procedimentoService.desbloquear(id, operadorId);
            return ResponseEntity.ok(
                    new ApiErrorResponse<>(true, "Procedimento desbloqueado com sucesso", procedimento)
            );
        } catch (ResourceNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ApiErrorResponse<>(false, e.getMessage(), null));
        } catch (BusinessException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ApiErrorResponse<>(false, e.getMessage(), null));
        }
    }

    /**
     * GET /api/procedimentos-rapidos/:id/historico
     * Obtém histórico completo do procedimento
     */
    @GetMapping("/{id}/historico")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiErrorResponse<ProcedimentoRapidoDTO>> obterHistorico(@PathVariable Long id) {
        log.info("Obtendo histórico do procedimento ID: {}", id);
        try {
            ProcedimentoRapidoDTO procedimento = procedimentoService.obterHistorico(id);
            return ResponseEntity.ok(
                    new ApiErrorResponse<>(true, "Histórico obtido com sucesso", procedimento)
            );
        } catch (ResourceNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ApiErrorResponse<>(false, e.getMessage(), null));
        }
    }

    /**
     * POST /api/procedimentos-rapidos/encaminhar-atendimento
     * Encaminha paciente do Atendimento Ambulatorial para Procedimentos Rápidos
     */
    @PostMapping("/encaminhar-atendimento")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiErrorResponse<ProcedimentoRapidoDTO>> encaminharDeAtendimento(
            @Valid @RequestBody EncaminharParaProcedimentoRequest request
    ) {
        log.info("Encaminhando do atendimento ID: {} para Procedimentos Rápidos", request.getAtendimentoId());
        try {
            ProcedimentoRapidoDTO procedimento = procedimentoService.encaminharDeAtendimento(request, getOperadorLogado());
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(new ApiErrorResponse<>(true, "Paciente encaminhado para Cuidados de Enfermagem com sucesso", procedimento));
        } catch (ResourceNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ApiErrorResponse<>(false, e.getMessage(), null));
        } catch (BusinessException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ApiErrorResponse<>(false, e.getMessage(), null));
        }
    }

    /**
     * GET /api/procedimentos-rapidos/motivos-cancelamento
     * Lista motivos de cancelamento disponíveis
     */
    @GetMapping("/motivos-cancelamento")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiErrorResponse<List<String>>> listarMotivosCancelamento() {
        log.info("Listando motivos de cancelamento disponíveis");
        try {
            // Motivos padrão para cancelamento de procedimentos rápidos
            List<String> motivos = List.of(
                "Paciente não compareceu",
                "Paciente desistiu do atendimento",
                "Erro no encaminhamento",
                "Atendimento duplicado",
                "Paciente transferido",
                "Procedimento não necessário",
                "Outro motivo"
            );
            return ResponseEntity.ok(
                    new ApiErrorResponse<>(true, "Motivos de cancelamento listados com sucesso", motivos)
            );
        } catch (Exception e) {
            log.error("Erro ao listar motivos de cancelamento: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiErrorResponse<>(false, "Erro ao listar motivos de cancelamento", null));
        }
    }

    /**
     * PUT /api/procedimentos-rapidos/:id/vincular-paciente
     * Vincula um paciente cadastrado a um procedimento criado para usuário não identificado
     */
    @PutMapping("/{id}/vincular-paciente")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiErrorResponse<ProcedimentoRapidoDTO>> vincularPaciente(
            @PathVariable Long id,
            @RequestBody Map<String, Long> request
    ) {
        log.info("Vinculando paciente ID: {} ao procedimento ID: {}", request.get("pacienteId"), id);
        try {
            Long pacienteId = request.get("pacienteId");
            if (pacienteId == null) {
                return ResponseEntity.badRequest()
                        .body(new ApiErrorResponse<>(false, "ID do paciente é obrigatório", null));
            }

            ProcedimentoRapidoDTO procedimento = procedimentoService.vincularPaciente(id, pacienteId, getOperadorLogado());
            return ResponseEntity.ok(
                    new ApiErrorResponse<>(true, "Paciente vinculado com sucesso", procedimento)
            );
        } catch (ResourceNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ApiErrorResponse<>(false, e.getMessage(), null));
        } catch (BusinessException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ApiErrorResponse<>(false, e.getMessage(), null));
        }
    }

    /**
     * GET /api/procedimentos-rapidos/paciente/:pacienteId/tem-ativo
     * Verifica se paciente tem procedimento ativo
     */
    @GetMapping("/paciente/{pacienteId}/tem-ativo")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiErrorResponse<Boolean>> temProcedimentoAtivo(@PathVariable Long pacienteId) {
        log.info("Verificando se paciente ID: {} tem procedimento ativo", pacienteId);
        try {
            boolean temAtivo = procedimentoService.temProcedimentoAtivo(pacienteId);
            return ResponseEntity.ok(
                    new ApiErrorResponse<>(true, "Verificação realizada com sucesso", temAtivo)
            );
        } catch (Exception e) {
            log.error("Erro ao verificar procedimento ativo: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiErrorResponse<>(false, "Erro ao verificar procedimento ativo", null));
        }
    }

    /**
     * GET /api/procedimentos-rapidos/paciente/:pacienteId/ativo
     * Busca procedimento ativo de um paciente
     */
    @GetMapping("/paciente/{pacienteId}/ativo")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiErrorResponse<ProcedimentoRapidoDTO>> buscarProcedimentoAtivo(
            @PathVariable Long pacienteId
    ) {
        log.info("Buscando procedimento ativo para paciente ID: {}", pacienteId);
        try {
            ProcedimentoRapidoDTO procedimento = procedimentoService.buscarProcedimentoAtivoPorPaciente(pacienteId);
            return ResponseEntity.ok(
                    new ApiErrorResponse<>(true, "Procedimento ativo encontrado", procedimento)
            );
        } catch (ResourceNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ApiErrorResponse<>(false, e.getMessage(), null));
        } catch (Exception e) {
            log.error("Erro ao buscar procedimento ativo: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiErrorResponse<>(false, "Erro ao buscar procedimento ativo", null));
        }
    }
}
