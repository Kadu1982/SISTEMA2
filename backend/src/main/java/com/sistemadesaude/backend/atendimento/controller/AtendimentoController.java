package com.sistemadesaude.backend.atendimento.controller;

import com.sistemadesaude.backend.atendimento.dto.AtendimentoDTO;
import com.sistemadesaude.backend.atendimento.entity.Atendimento;
import com.sistemadesaude.backend.atendimento.service.AtendimentoService;
import com.sistemadesaude.backend.atendimento.service.AtendimentoPdfService;
import com.sistemadesaude.backend.logs.model.LogSistema;
import com.sistemadesaude.backend.logs.repository.LogSistemaRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Map;

/**
 * 🏥 CONTROLLER REST PARA OPERAÇÕES DE ATENDIMENTO
 *
 * ✅ CORRIGIDO: Compatibilidade com Long IDs
 * ✅ CORRIGIDO: Conversões String ↔ Long nos endpoints
 * ✅ ATUALIZADO: Endpoints completos
 * ✅ CORREÇÃO: Tratamento de erros robusto
 */
@Slf4j
@RestController
@RequestMapping("/api/atendimentos")
@RequiredArgsConstructor
public class AtendimentoController {

    private final AtendimentoService atendimentoService;
    private final AtendimentoPdfService pdfService;
    private final LogSistemaRepository logRepository;

    // ========================================
    // 💾 OPERAÇÕES BÁSICAS CRUD
    // ========================================

    /**
     * 💾 Cria um novo atendimento
     */
    @PostMapping
    public Map<String, Object> criarAtendimento(@RequestBody AtendimentoDTO atendimentoDTO) {
        try {
            log.info("💾 Criando atendimento para paciente: {}", atendimentoDTO.getPacienteId());

            // Validações básicas
            if (atendimentoDTO.getPacienteId() == null || atendimentoDTO.getPacienteId().trim().isEmpty()) {
                return Map.of(
                        "success", false,
                        "message", "ID do paciente é obrigatório",
                        "data", null
                );
            }

            if (atendimentoDTO.getCid10() == null || atendimentoDTO.getCid10().trim().isEmpty()) {
                return Map.of(
                        "success", false,
                        "message", "CID10 é obrigatório",
                        "data", null
                );
            }

            AtendimentoDTO salvo = atendimentoService.criarAtendimento(atendimentoDTO);

            // Log da operação (converte Long para String)
            registrarLog("CRIAR_ATENDIMENTO", String.valueOf(salvo.getId()));

            log.info("✅ Atendimento criado com sucesso, ID: {}", salvo.getId());

            return Map.of(
                    "success", true,
                    "message", "Atendimento criado com sucesso",
                    "data", salvo
            );

        } catch (Exception e) {
            log.error("❌ Erro ao criar atendimento: {}", e.getMessage(), e);

            return Map.of(
                    "success", false,
                    "message", "Erro interno do servidor: " + e.getMessage(),
                    "data", null
            );
        }
    }

    /**
     * 🔍 Busca atendimento por ID
     * ✅ CORRIGIDO: Converte String para Long
     */
    @GetMapping("/{id}")
    public Map<String, Object> buscarPorId(@PathVariable String id) {
        try {
            log.info("🔍 Buscando atendimento ID: {}", id);

            // Converter String para Long
            Long idLong = converterStringParaLong(id);
            AtendimentoDTO atendimento = atendimentoService.buscarPorId(idLong);

            return Map.of(
                    "success", true,
                    "message", "Atendimento encontrado",
                    "data", atendimento
            );

        } catch (NumberFormatException e) {
            log.error("❌ ID inválido: {}", id);
            return Map.of(
                    "success", false,
                    "message", "ID do atendimento deve ser um número válido",
                    "data", null
            );
        } catch (Exception e) {
            log.error("❌ Erro ao buscar atendimento {}: {}", id, e.getMessage());

            return Map.of(
                    "success", false,
                    "message", "Atendimento não encontrado",
                    "data", null
            );
        }
    }

    /**
     * 📋 Lista todos os atendimentos ou filtra por paciente
     * ✅ CORRIGIDO: Converte pacienteId String para Long
     */
    @GetMapping
    public Map<String, Object> listarAtendimentos(@RequestParam(required = false) String pacienteId) {
        try {
            List<AtendimentoDTO> lista;
            String mensagem;

            if (pacienteId == null || pacienteId.trim().isEmpty()) {
                log.info("📋 Listando todos os atendimentos");
                lista = atendimentoService.listarTodos();
                mensagem = "Todos os atendimentos recuperados";
            } else {
                log.info("👤 Buscando atendimentos do paciente: {}", pacienteId);

                try {
                    // Converter String para Long
                    Long pacienteIdLong = converterStringParaLong(pacienteId.trim());
                    lista = atendimentoService.buscarPorPaciente(pacienteIdLong);
                    mensagem = "Atendimentos do paciente recuperados";
                } catch (NumberFormatException e) {
                    return Map.of(
                            "success", false,
                            "message", "ID do paciente deve ser um número válido: " + pacienteId,
                            "data", Collections.emptyList()
                    );
                }
            }

            log.info("📊 {} atendimento(s) encontrado(s)", lista.size());

            return Map.of(
                    "success", true,
                    "message", mensagem,
                    "data", lista
            );

        } catch (Exception e) {
            log.error("❌ Erro ao listar atendimentos: {}", e.getMessage(), e);

            return Map.of(
                    "success", false,
                    "message", "Erro ao recuperar atendimentos: " + e.getMessage(),
                    "data", Collections.emptyList()
            );
        }
    }

    /**
     * 🔄 Atualiza um atendimento
     * ✅ CORRIGIDO: Converte id String para Long
     */
    @PutMapping("/{id}")
    public Map<String, Object> atualizarAtendimento(@PathVariable String id, @Valid @RequestBody AtendimentoDTO atendimentoDTO) {
        try {
            log.info("🔄 Atualizando atendimento ID: {}", id);

            // Converter String para Long
            Long idLong = converterStringParaLong(id);
            AtendimentoDTO atualizado = atendimentoService.atualizarAtendimento(idLong, atendimentoDTO);

            // Log da operação
            registrarLog("ATUALIZAR_ATENDIMENTO", id);

            return Map.of(
                    "success", true,
                    "message", "Atendimento atualizado com sucesso",
                    "data", atualizado
            );

        } catch (NumberFormatException e) {
            log.error("❌ ID inválido: {}", id);
            return Map.of(
                    "success", false,
                    "message", "ID do atendimento deve ser um número válido",
                    "data", null
            );
        } catch (Exception e) {
            log.error("❌ Erro ao atualizar atendimento {}: {}", id, e.getMessage());

            return Map.of(
                    "success", false,
                    "message", "Erro ao atualizar atendimento: " + e.getMessage(),
                    "data", null
            );
        }
    }

    /**
     * 🗑️ Exclui um atendimento (soft delete)
     * ✅ CORRIGIDO: Converte id String para Long
     */
    @DeleteMapping("/{id}")
    public Map<String, Object> excluirAtendimento(@PathVariable String id) {
        try {
            log.info("🗑️ Excluindo atendimento ID: {}", id);

            // Converter String para Long
            Long idLong = converterStringParaLong(id);
            atendimentoService.excluirAtendimento(idLong);

            // Log da operação
            registrarLog("EXCLUIR_ATENDIMENTO", id);

            return Map.of(
                    "success", true,
                    "message", "Atendimento excluído com sucesso",
                    "data", null
            );

        } catch (NumberFormatException e) {
            log.error("❌ ID inválido: {}", id);
            return Map.of(
                    "success", false,
                    "message", "ID do atendimento deve ser um número válido",
                    "data", null
            );
        } catch (Exception e) {
            log.error("❌ Erro ao excluir atendimento {}: {}", id, e.getMessage());

            return Map.of(
                    "success", false,
                    "message", "Erro ao excluir atendimento: " + e.getMessage(),
                    "data", null
            );
        }
    }

    // ========================================
    // 👤 ENDPOINTS ESPECÍFICOS POR PACIENTE
    // ========================================

    /**
     * 👤 Busca atendimentos de um paciente específico
     * ✅ CORRIGIDO: Converte pacienteId String para Long
     */
    @GetMapping("/paciente/{pacienteId}")
    public Map<String, Object> buscarPorPaciente(@PathVariable String pacienteId) {
        try {
            if (pacienteId == null || pacienteId.trim().isEmpty()) {
                return Map.of(
                        "success", false,
                        "message", "ID do paciente é obrigatório",
                        "data", Collections.emptyList()
                );
            }

            log.info("👤 Buscando atendimentos do paciente: {}", pacienteId);

            // Converter String para Long
            Long pacienteIdLong = converterStringParaLong(pacienteId.trim());
            List<AtendimentoDTO> lista = atendimentoService.buscarPorPaciente(pacienteIdLong);

            return Map.of(
                    "success", true,
                    "message", "Atendimentos do paciente recuperados",
                    "data", lista
            );

        } catch (NumberFormatException e) {
            log.error("❌ ID do paciente inválido: {}", pacienteId);
            return Map.of(
                    "success", false,
                    "message", "ID do paciente deve ser um número válido: " + pacienteId,
                    "data", Collections.emptyList()
            );
        } catch (Exception e) {
            log.error("❌ Erro ao buscar atendimentos do paciente {}: {}", pacienteId, e.getMessage());

            return Map.of(
                    "success", false,
                    "message", "Erro ao buscar atendimentos: " + e.getMessage(),
                    "data", Collections.emptyList()
            );
        }
    }

    /**
     * 🏥 Busca último atendimento do paciente
     * ✅ CORRIGIDO: Converte pacienteId String para Long
     */
    @GetMapping("/paciente/{pacienteId}/ultimo")
    public Map<String, Object> buscarUltimoAtendimento(@PathVariable String pacienteId) {
        try {
            log.info("🏥 Buscando último atendimento do paciente: {}", pacienteId);

            // Converter String para Long
            Long pacienteIdLong = converterStringParaLong(pacienteId);
            AtendimentoDTO ultimo = atendimentoService.buscarUltimoAtendimentoPaciente(pacienteIdLong);

            if (ultimo == null) {
                return Map.of(
                        "success", true,
                        "message", "Nenhum atendimento encontrado para este paciente",
                        "data", null
                );
            }

            return Map.of(
                    "success", true,
                    "message", "Último atendimento encontrado",
                    "data", ultimo
            );

        } catch (NumberFormatException e) {
            log.error("❌ ID do paciente inválido: {}", pacienteId);
            return Map.of(
                    "success", false,
                    "message", "ID do paciente deve ser um número válido: " + pacienteId,
                    "data", null
            );
        } catch (Exception e) {
            log.error("❌ Erro ao buscar último atendimento do paciente {}: {}", pacienteId, e.getMessage());

            return Map.of(
                    "success", false,
                    "message", "Erro ao buscar último atendimento: " + e.getMessage(),
                    "data", null
            );
        }
    }

    // ========================================
    // 🔍 ENDPOINTS DE BUSCA ESPECIALIZADA
    // ========================================

    /**
     * 🏥 Busca atendimentos por CID10
     */
    @GetMapping("/cid10/{cid10}")
    public Map<String, Object> buscarPorCid10(@PathVariable String cid10) {
        try {
            log.info("🏥 Buscando atendimentos por CID10: {}", cid10);

            List<AtendimentoDTO> lista = atendimentoService.buscarPorCid10(cid10);

            return Map.of(
                    "success", true,
                    "message", "Atendimentos por CID10 recuperados",
                    "data", lista
            );

        } catch (Exception e) {
            log.error("❌ Erro ao buscar por CID10 {}: {}", cid10, e.getMessage());

            return Map.of(
                    "success", false,
                    "message", "Erro ao buscar por CID10: " + e.getMessage(),
                    "data", Collections.emptyList()
            );
        }
    }

    /**
     * 🔍 Busca atendimentos por diagnóstico
     */
    @GetMapping("/diagnostico")
    public Map<String, Object> buscarPorDiagnostico(@RequestParam String diagnostico) {
        try {
            log.info("🔍 Buscando atendimentos por diagnóstico: {}", diagnostico);

            List<AtendimentoDTO> lista = atendimentoService.buscarPorDiagnostico(diagnostico);

            return Map.of(
                    "success", true,
                    "message", "Atendimentos por diagnóstico recuperados",
                    "data", lista
            );

        } catch (Exception e) {
            log.error("❌ Erro ao buscar por diagnóstico: {}", e.getMessage());

            return Map.of(
                    "success", false,
                    "message", "Erro ao buscar por diagnóstico: " + e.getMessage(),
                    "data", Collections.emptyList()
            );
        }
    }

    /**
     * 🔍 Busca por texto livre
     */
    @GetMapping("/buscar")
    public Map<String, Object> buscarPorTexto(@RequestParam String texto) {
        try {
            log.info("🔍 Buscando atendimentos por texto: {}", texto);

            List<AtendimentoDTO> lista = atendimentoService.buscarPorTexto(texto);

            return Map.of(
                    "success", true,
                    "message", "Busca por texto realizada",
                    "data", lista
            );

        } catch (Exception e) {
            log.error("❌ Erro na busca por texto: {}", e.getMessage());

            return Map.of(
                    "success", false,
                    "message", "Erro na busca: " + e.getMessage(),
                    "data", Collections.emptyList()
            );
        }
    }

    // ========================================
    // 📅 ENDPOINTS POR PERÍODO
    // ========================================

    /**
     * 📅 Busca atendimentos por período
     */
    @GetMapping("/periodo")
    public Map<String, Object> listarPorPeriodo(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime inicio,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime fim) {
        try {
            log.info("📅 Buscando atendimentos por período: {} a {}", inicio, fim);

            List<AtendimentoDTO> lista = atendimentoService.buscarPorPeriodo(inicio, fim);

            return Map.of(
                    "success", true,
                    "message", "Atendimentos por período recuperados",
                    "data", lista
            );

        } catch (Exception e) {
            log.error("❌ Erro ao buscar por período: {}", e.getMessage());

            return Map.of(
                    "success", false,
                    "message", "Erro ao buscar por período: " + e.getMessage(),
                    "data", Collections.emptyList()
            );
        }
    }

    /**
     * 📅 Busca atendimentos de hoje
     */
    @GetMapping("/hoje")
    public Map<String, Object> buscarAtendimentosHoje() {
        try {
            log.info("📅 Buscando atendimentos de hoje");

            List<AtendimentoDTO> lista = atendimentoService.buscarAtendimentosHoje();

            return Map.of(
                    "success", true,
                    "message", "Atendimentos de hoje recuperados",
                    "data", lista
            );

        } catch (Exception e) {
            log.error("❌ Erro ao buscar atendimentos de hoje: {}", e.getMessage());

            return Map.of(
                    "success", false,
                    "message", "Erro ao buscar atendimentos de hoje: " + e.getMessage(),
                    "data", Collections.emptyList()
            );
        }
    }

    // ========================================
    // 📄 GERAÇÃO DE PDF
    // ========================================

    /**
     * 📄 Gera PDF de um atendimento específico
     * ✅ CORRIGIDO: Converte id String para Long
     */
    @GetMapping("/{id}/pdf")
    public ResponseEntity<byte[]> gerarPdf(@PathVariable String id) {
        try {
            log.info("📄 Gerando PDF para atendimento: {}", id);

            // Converter String para Long
            Long idLong = converterStringParaLong(id);
            AtendimentoDTO atendimentoDTO = atendimentoService.buscarPorId(idLong);

            // Converter DTO para Entity para o serviço PDF
            Atendimento atendimento = Atendimento.builder()
                    .id(atendimentoDTO.getId())
                    .pacienteId(atendimentoDTO.getPacienteId() != null ? Long.valueOf(atendimentoDTO.getPacienteId()) : null)
                    .profissionalId(atendimentoDTO.getProfissionalId() != null ? Long.valueOf(atendimentoDTO.getProfissionalId()) : null)
                    .cid10(atendimentoDTO.getCid10())
                    .diagnostico(atendimentoDTO.getDiagnostico())
                    .sintomas(atendimentoDTO.getSintomas())
                    .examesFisicos(atendimentoDTO.getExamesFisicos())
                    .prescricao(atendimentoDTO.getPrescricao())
                    .medicamentosPrescritos(atendimentoDTO.getMedicamentosPrescritos())
                    .orientacoes(atendimentoDTO.getOrientacoes())
                    //.retorno(atendimentoDTO.getRetorno())
                    .observacoes(atendimentoDTO.getObservacoes())
                    .observacoesInternas(atendimentoDTO.getObservacoesInternas())
                    .statusAtendimento(atendimentoDTO.getStatusAtendimento())
                    .dataHora(atendimentoDTO.getDataHora())
                    .dataAtualizacao(atendimentoDTO.getDataAtualizacao())
                    .ativo(atendimentoDTO.getAtivo())
                    .build();

            byte[] pdf = pdfService.gerarPdf(atendimento);

            // Log da operação
            registrarLog("GERAR_PDF_ATENDIMENTO", id);

            log.info("✅ PDF gerado com sucesso para atendimento: {}", id);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_PDF);
            headers.setContentDispositionFormData("attachment", "atendimento_" + id + ".pdf");

            return ResponseEntity.ok()
                    .headers(headers)
                    .body(pdf);

        } catch (NumberFormatException e) {
            log.error("❌ ID inválido para geração de PDF: {}", id);
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            log.error("❌ Erro ao gerar PDF do atendimento {}: {}", id, e.getMessage(), e);
            return ResponseEntity.internalServerError().build();
        }
    }

    // ========================================
    // 📊 ENDPOINTS ESTATÍSTICOS
    // ========================================

    /**
     * 📊 Obtém estatísticas básicas
     */
    @GetMapping("/estatisticas")
    public Map<String, Object> obterEstatisticas() {
        try {
            log.info("📊 Obtendo estatísticas básicas de atendimentos");

            Map<String, Object> stats = atendimentoService.obterEstatisticasBasicas();

            return Map.of(
                    "success", true,
                    "message", "Estatísticas recuperadas",
                    "data", stats
            );

        } catch (Exception e) {
            log.error("❌ Erro ao obter estatísticas: {}", e.getMessage());

            return Map.of(
                    "success", false,
                    "message", "Erro ao obter estatísticas: " + e.getMessage(),
                    "data", null
            );
        }
    }

    // ========================================
    // 🛠️ MÉTODOS AUXILIARES
    // ========================================

    /**
     * Converte String para Long com tratamento de erro
     */
    private Long converterStringParaLong(String valor) {
        if (valor == null || valor.trim().isEmpty()) {
            throw new IllegalArgumentException("Valor não pode ser nulo ou vazio");
        }

        try {
            return Long.parseLong(valor.trim());
        } catch (NumberFormatException e) {
            throw new NumberFormatException("Valor deve ser um número válido: " + valor);
        }
    }

    /**
     * Registra log da operação
     */
    private void registrarLog(String acao, String registroId) {
        try {
            LogSistema log = new LogSistema();
            log.setUsuarioId("sistema"); // TODO: Implementar usuário logado
            log.setAcao(acao);
            log.setTabela("atendimentos");
            log.setRegistroId(registroId);
            logRepository.save(log);
        } catch (Exception e) {
            log.error("❌ Erro ao registrar log: {}", e.getMessage());
            // Não propagar erro do log
        }
    }
}