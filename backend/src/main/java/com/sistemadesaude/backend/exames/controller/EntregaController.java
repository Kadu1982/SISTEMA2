package com.sistemadesaude.backend.exames.controller;

import com.sistemadesaude.backend.exames.dto.EntregaExameDTO;
import com.sistemadesaude.backend.exames.entity.RecepcaoExame;
import com.sistemadesaude.backend.exames.service.EntregaService;
import com.sistemadesaude.backend.operador.entity.Operador;
import com.sistemadesaude.backend.operador.security.UserDetailsImpl;
import com.sistemadesaude.backend.response.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/laboratorio/entrega")
@RequiredArgsConstructor
public class EntregaController {

    private final EntregaService entregaService;

    @GetMapping("/prontos")
    public ResponseEntity<ApiResponse<List<RecepcaoExame>>> listarExamesParaEntrega(
            @RequestParam(required = false) Long unidadeId
    ) {
        List<RecepcaoExame> exames = entregaService.listarExamesParaEntrega(unidadeId);
        return ResponseEntity.ok(ApiResponse.success(exames));
    }

    @GetMapping("/recepcao/{numeroRecepcao}")
    public ResponseEntity<ApiResponse<RecepcaoExame>> buscarRecepcaoParaEntrega(
            @PathVariable String numeroRecepcao
    ) {
        RecepcaoExame recepcao = entregaService.buscarRecepcaoParaEntrega(numeroRecepcao);
        return ResponseEntity.ok(ApiResponse.success(recepcao));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<EntregaExameDTO>> buscarEntregaPorId(@PathVariable Long id) {
        EntregaExameDTO entrega = entregaService.buscarEntregaPorId(id);
        return ResponseEntity.ok(ApiResponse.success(entrega));
    }

    @GetMapping("/periodo")
    public ResponseEntity<ApiResponse<List<EntregaExameDTO>>> listarEntregasPorPeriodo(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime dataInicio,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime dataFim
    ) {
        List<EntregaExameDTO> entregas = entregaService.listarEntregasPorPeriodo(dataInicio, dataFim);
        return ResponseEntity.ok(ApiResponse.success(entregas));
    }

    @PostMapping("/realizar")
    public ResponseEntity<ApiResponse<EntregaExameDTO>> realizarEntrega(
            @RequestBody RealizarEntregaRequest request,
            @AuthenticationPrincipal UserDetailsImpl userDetails
    ) {
        Operador operador = userDetails.getOperador();
        EntregaExameDTO entrega = entregaService.realizarEntrega(
                request.getRecepcaoId(),
                request.getNomeRetirou(),
                request.getDocumentoRetirou(),
                request.getParentescoRetirou(),
                request.getBiometriaTemplate(),
                request.getAssinaturaRetirada(),
                request.getExamesEntreguesIds(),
                operador
        );
        return ResponseEntity.ok(ApiResponse.success(entrega, "Entrega realizada com sucesso"));
    }

    @GetMapping("/buscar-por-nome")
    public ResponseEntity<ApiResponse<List<EntregaExameDTO>>> buscarEntregasPorNome(
            @RequestParam String nomeRetirou
    ) {
        List<EntregaExameDTO> entregas = entregaService.buscarEntregasPorNome(nomeRetirou);
        return ResponseEntity.ok(ApiResponse.success(entregas));
    }

    @GetMapping("/buscar-por-documento")
    public ResponseEntity<ApiResponse<List<EntregaExameDTO>>> buscarEntregasPorDocumento(
            @RequestParam String documentoRetirou
    ) {
        List<EntregaExameDTO> entregas = entregaService.buscarEntregasPorDocumento(documentoRetirou);
        return ResponseEntity.ok(ApiResponse.success(entregas));
    }

    // DTO para request de entrega
    public static class RealizarEntregaRequest {
        private Long recepcaoId;
        private String nomeRetirou;
        private String documentoRetirou;
        private String parentescoRetirou;
        private String biometriaTemplate;
        private String assinaturaRetirada;
        private List<Long> examesEntreguesIds;

        // Getters e Setters
        public Long getRecepcaoId() {
            return recepcaoId;
        }

        public void setRecepcaoId(Long recepcaoId) {
            this.recepcaoId = recepcaoId;
        }

        public String getNomeRetirou() {
            return nomeRetirou;
        }

        public void setNomeRetirou(String nomeRetirou) {
            this.nomeRetirou = nomeRetirou;
        }

        public String getDocumentoRetirou() {
            return documentoRetirou;
        }

        public void setDocumentoRetirou(String documentoRetirou) {
            this.documentoRetirou = documentoRetirou;
        }

        public String getParentescoRetirou() {
            return parentescoRetirou;
        }

        public void setParentescoRetirou(String parentescoRetirou) {
            this.parentescoRetirou = parentescoRetirou;
        }

        public String getBiometriaTemplate() {
            return biometriaTemplate;
        }

        public void setBiometriaTemplate(String biometriaTemplate) {
            this.biometriaTemplate = biometriaTemplate;
        }

        public String getAssinaturaRetirada() {
            return assinaturaRetirada;
        }

        public void setAssinaturaRetirada(String assinaturaRetirada) {
            this.assinaturaRetirada = assinaturaRetirada;
        }

        public List<Long> getExamesEntreguesIds() {
            return examesEntreguesIds;
        }

        public void setExamesEntreguesIds(List<Long> examesEntreguesIds) {
            this.examesEntreguesIds = examesEntreguesIds;
        }
    }
}