package com.sistemadesaude.backend.controller;

import com.sistemadesaude.backend.exames.entity.RecepcaoExame;
import com.sistemadesaude.backend.exames.entity.Sadt;
import com.sistemadesaude.backend.exames.repository.RecepcaoExameRepository;
import com.sistemadesaude.backend.exames.repository.SadtRepository;
import com.sistemadesaude.backend.recepcao.entity.Agendamento;
import com.sistemadesaude.backend.recepcao.repository.AgendamentoRepository;
import com.sistemadesaude.backend.response.ApiResponse;
import com.sistemadesaude.backend.service.BarcodeService;
import lombok.*;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

/**
 * Controller para operações com código de barras
 * Permite buscar e recepcionar pacientes através de códigos de barras
 */
@Slf4j
@RestController
@RequestMapping("/api/barcode")
@RequiredArgsConstructor
public class BarcodeController {

    private final BarcodeService barcodeService;
    private final RecepcaoExameRepository recepcaoExameRepository;
    private final AgendamentoRepository agendamentoRepository;
    private final SadtRepository sadtRepository;

    /**
     * Busca informações de um código de barras
     * Identifica automaticamente o tipo de documento e retorna os dados relevantes
     */
    @GetMapping("/lookup/{codigo}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<BarcodeLookupResponse>> lookup(@PathVariable String codigo) {
        log.info("🔍 Buscando código de barras: {}", codigo);

        BarcodeService.TipoDocumentoCodigo tipo = barcodeService.identificarTipoDocumento(codigo);

        BarcodeLookupResponse response = new BarcodeLookupResponse();
        response.setCodigoBarras(codigo);
        response.setTipoDocumento(tipo.name());

        switch (tipo) {
            case RECEPCAO_LABORATORIO -> {
                RecepcaoExame recepcao = recepcaoExameRepository.findByCodigoBarras(codigo)
                        .orElse(null);
                if (recepcao != null) {
                    response.setEncontrado(true);
                    response.setRecepcaoLaboratorio(mapRecepcaoExame(recepcao));
                } else {
                    response.setEncontrado(false);
                    response.setMensagem("Recepção de laboratório não encontrada");
                }
            }
            case AGENDAMENTO -> {
                Agendamento agendamento = agendamentoRepository.findByCodigoBarras(codigo)
                        .orElse(null);
                if (agendamento != null) {
                    response.setEncontrado(true);
                    response.setAgendamento(mapAgendamento(agendamento));
                } else {
                    response.setEncontrado(false);
                    response.setMensagem("Agendamento não encontrado");
                }
            }
            case SADT -> {
                Sadt sadt = sadtRepository.findByCodigoBarras(codigo)
                        .orElse(null);
                if (sadt != null) {
                    response.setEncontrado(true);
                    response.setSadt(mapSadt(sadt));
                } else {
                    response.setEncontrado(false);
                    response.setMensagem("SADT não encontrada");
                }
            }
            default -> {
                response.setEncontrado(false);
                response.setMensagem("Tipo de código de barras desconhecido");
            }
        }

        return ResponseEntity.ok(ApiResponse.success(response));
    }

    /**
     * Busca por número (número de recepção, número SADT, etc)
     * Busca em todas as tabelas possíveis
     */
    @GetMapping("/buscar-numero/{numero}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<BarcodeLookupResponse>> buscarPorNumero(@PathVariable String numero) {
        log.info("🔍 Buscando por número: {}", numero);

        BarcodeLookupResponse response = new BarcodeLookupResponse();
        response.setCodigoBarras(numero);

        // Tentar buscar como recepção de laboratório
        RecepcaoExame recepcao = recepcaoExameRepository.findByNumeroRecepcao(numero).orElse(null);
        if (recepcao != null) {
            response.setEncontrado(true);
            response.setTipoDocumento("RECEPCAO_LABORATORIO");
            response.setRecepcaoLaboratorio(mapRecepcaoExame(recepcao));
            return ResponseEntity.ok(ApiResponse.success(response));
        }

        // Tentar buscar como SADT
        Sadt sadt = sadtRepository.findByNumeroSadt(numero).orElse(null);
        if (sadt != null) {
            response.setEncontrado(true);
            response.setTipoDocumento("SADT");
            response.setSadt(mapSadt(sadt));
            return ResponseEntity.ok(ApiResponse.success(response));
        }

        // Tentar buscar agendamento por ID
        try {
            Long id = Long.parseLong(numero);
            Agendamento agendamento = agendamentoRepository.findById(id).orElse(null);
            if (agendamento != null) {
                response.setEncontrado(true);
                response.setTipoDocumento("AGENDAMENTO");
                response.setAgendamento(mapAgendamento(agendamento));
                return ResponseEntity.ok(ApiResponse.success(response));
            }
        } catch (NumberFormatException ignored) {
        }

        response.setEncontrado(false);
        response.setMensagem("Nenhum documento encontrado com este número");
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    /**
     * Endpoint para recepção rápida via código de barras
     * Confirma presença do paciente baseado no código lido
     */
    @PostMapping("/recepcionar")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<String>> recepcionar(@RequestBody RecepcaoBarCodeRequest request) {
        log.info("✅ Recepcionando código de barras: {}", request.getCodigoBarras());

        BarcodeService.TipoDocumentoCodigo tipo = barcodeService.identificarTipoDocumento(request.getCodigoBarras());

        switch (tipo) {
            case AGENDAMENTO -> {
                Agendamento agendamento = agendamentoRepository.findByCodigoBarras(request.getCodigoBarras())
                        .orElseThrow(() -> new RuntimeException("Agendamento não encontrado"));

                // Atualizar status do agendamento para CONFIRMADO
                if (agendamento.getStatus() == com.sistemadesaude.backend.recepcao.entity.StatusAgendamento.AGENDADO) {
                    agendamento.setStatus(com.sistemadesaude.backend.recepcao.entity.StatusAgendamento.CONFIRMADO);
                    agendamentoRepository.save(agendamento);
                    return ResponseEntity.ok(ApiResponse.success(
                            "Paciente recepcionado com sucesso para " +
                                    (agendamento.getTipoConsulta() != null ? agendamento.getTipoConsulta().name() : "consulta"),
                            "Agendamento confirmado"
                    ));
                } else {
                    return ResponseEntity.ok(ApiResponse.success(
                            "Paciente já recepcionado anteriormente. Status: " + agendamento.getStatus(),
                            "Status atual"
                    ));
                }
            }
            case SADT -> {
                Sadt sadt = sadtRepository.findByCodigoBarras(request.getCodigoBarras())
                        .orElseThrow(() -> new RuntimeException("SADT não encontrada"));

                // Buscar agendamento relacionado
                if (sadt.getAgendamentoId() != null) {
                    Agendamento agendamento = agendamentoRepository.findById(sadt.getAgendamentoId())
                            .orElse(null);
                    if (agendamento != null && agendamento.getStatus() == com.sistemadesaude.backend.recepcao.entity.StatusAgendamento.AGENDADO) {
                        agendamento.setStatus(com.sistemadesaude.backend.recepcao.entity.StatusAgendamento.CONFIRMADO);
                        agendamentoRepository.save(agendamento);
                    }
                }

                return ResponseEntity.ok(ApiResponse.success(
                        "Paciente recepcionado para exames. SADT: " + sadt.getNumeroSadt(),
                        "SADT identificada"
                ));
            }
            case RECEPCAO_LABORATORIO -> {
                RecepcaoExame recepcao = recepcaoExameRepository.findByCodigoBarras(request.getCodigoBarras())
                        .orElseThrow(() -> new RuntimeException("Recepção de laboratório não encontrada"));

                return ResponseEntity.ok(ApiResponse.success(
                        "Recepção de laboratório identificada. Número: " + recepcao.getNumeroRecepcao(),
                        "Recepção encontrada"
                ));
            }
            default -> {
                return ResponseEntity.badRequest().body(ApiResponse.error("Tipo de código de barras desconhecido"));
            }
        }
    }

    // ========== DTOs ==========

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class BarcodeLookupResponse {
        private String codigoBarras;
        private String tipoDocumento;
        private boolean encontrado;
        private String mensagem;
        private AgendamentoInfo agendamento;
        private RecepcaoLaboratorioInfo recepcaoLaboratorio;
        private SadtInfo sadt;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AgendamentoInfo {
        private Long id;
        private String pacienteNome;
        private String pacienteDocumento;
        private String dataHora;
        private String especialidade;
        private String tipoConsulta;
        private String status;
        private String observacoes;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RecepcaoLaboratorioInfo {
        private Long id;
        private String numeroRecepcao;
        private String pacienteNome;
        private String pacienteDocumento;
        private String dataRecepcao;
        private String status;
        private boolean urgente;
        private Integer quantidadeExames;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SadtInfo {
        private Long id;
        private String numeroSadt;
        private Long pacienteId;
        private Long agendamentoId;
        private String dataEmissao;
        private String tipoSadt;
        private String status;
        private Integer quantidadeProcedimentos;
    }

    @Data
    public static class RecepcaoBarCodeRequest {
        private String codigoBarras;
        private String observacoes;
    }

    // ========== Mappers ==========

    private AgendamentoInfo mapAgendamento(Agendamento agendamento) {
        String pacienteNome = "";
        String pacienteDoc = "";
        if (agendamento.getPaciente() != null) {
            pacienteNome = agendamento.getPaciente().getNomeCompleto();
            pacienteDoc = agendamento.getPaciente().getCpf() != null ?
                    agendamento.getPaciente().getCpf() :
                    agendamento.getPaciente().getCns();
        }

        return AgendamentoInfo.builder()
                .id(agendamento.getId())
                .pacienteNome(pacienteNome)
                .pacienteDocumento(pacienteDoc)
                .dataHora(agendamento.getDataHora() != null ? agendamento.getDataHora().toString() : null)
                .especialidade(agendamento.getEspecialidade())
                .tipoConsulta(agendamento.getTipoConsulta() != null ? agendamento.getTipoConsulta().name() : null)
                .status(agendamento.getStatus() != null ? agendamento.getStatus().name() : null)
                .observacoes(agendamento.getObservacoes())
                .build();
    }

    private RecepcaoLaboratorioInfo mapRecepcaoExame(RecepcaoExame recepcao) {
        String pacienteNome = "";
        String pacienteDoc = "";
        if (recepcao.getPaciente() != null) {
            pacienteNome = recepcao.getPaciente().getNomeCompleto();
            pacienteDoc = recepcao.getPaciente().getCpf() != null ?
                    recepcao.getPaciente().getCpf() :
                    recepcao.getPaciente().getCns();
        }

        return RecepcaoLaboratorioInfo.builder()
                .id(recepcao.getId())
                .numeroRecepcao(recepcao.getNumeroRecepcao())
                .pacienteNome(pacienteNome)
                .pacienteDocumento(pacienteDoc)
                .dataRecepcao(recepcao.getDataRecepcao() != null ? recepcao.getDataRecepcao().toString() : null)
                .status(recepcao.getStatus() != null ? recepcao.getStatus().name() : null)
                .urgente(recepcao.getUrgente() != null && recepcao.getUrgente())
                .quantidadeExames(recepcao.getExames() != null ? recepcao.getExames().size() : 0)
                .build();
    }

    private SadtInfo mapSadt(Sadt sadt) {
        return SadtInfo.builder()
                .id(sadt.getId())
                .numeroSadt(sadt.getNumeroSadt())
                .pacienteId(sadt.getPacienteId())
                .agendamentoId(sadt.getAgendamentoId())
                .dataEmissao(sadt.getDataEmissao() != null ? sadt.getDataEmissao().toString() : null)
                .tipoSadt(sadt.getTipoSadt() != null ? sadt.getTipoSadt().name() : null)
                .status(sadt.getStatus() != null ? sadt.getStatus().name() : null)
                .quantidadeProcedimentos(sadt.getProcedimentos() != null ? sadt.getProcedimentos().size() : 0)
                .build();
    }
}
