package com.sistemadesaude.backend.exames.controller;

import com.sistemadesaude.backend.exames.dto.ColetaMaterialDTO;
import com.sistemadesaude.backend.exames.dto.MaterialColetadoDTO;
import com.sistemadesaude.backend.exames.entity.MotivoNovaColeta;
import com.sistemadesaude.backend.exames.entity.RecepcaoExame;
import com.sistemadesaude.backend.exames.service.ColetaService;
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
@RequestMapping("/api/laboratorio/coleta")
@RequiredArgsConstructor
public class ColetaController {

    private final ColetaService coletaService;

    @GetMapping("/aguardando")
    public ResponseEntity<ApiResponse<List<RecepcaoExame>>> listarPacientesAguardandoColeta(
            @RequestParam(required = false) Long unidadeId
    ) {
        try {
            List<RecepcaoExame> pacientes = coletaService.listarPacientesAguardandoColeta(unidadeId);
            return ResponseEntity.ok(ApiResponse.success(pacientes));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.ok(ApiResponse.success(List.of(), "Erro: " + e.getMessage()));
        }
    }

    @GetMapping("/periodo")
    public ResponseEntity<ApiResponse<List<ColetaMaterialDTO>>> listarColetasPorPeriodo(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime dataInicio,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime dataFim
    ) {
        List<ColetaMaterialDTO> coletas = coletaService.listarColetasPorPeriodo(dataInicio, dataFim);
        return ResponseEntity.ok(ApiResponse.success(coletas));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ColetaMaterialDTO>> buscarColetaPorId(@PathVariable Long id) {
        ColetaMaterialDTO coleta = coletaService.buscarColetaPorId(id);
        return ResponseEntity.ok(ApiResponse.success(coleta));
    }

    @PostMapping("/realizar")
    public ResponseEntity<ApiResponse<ColetaMaterialDTO>> realizarColeta(
            @RequestBody RealizarColetaRequest request,
            @AuthenticationPrincipal UserDetailsImpl userDetails
    ) {
        Operador operador = userDetails.getOperador();
        ColetaMaterialDTO coleta = coletaService.realizarColeta(
            request.getRecepcaoId(),
            request.getMateriaisColetados(),
            operador
        );
        return ResponseEntity.ok(ApiResponse.success(coleta, "Coleta realizada com sucesso"));
    }

    @PostMapping("/{coletaId}/nova-coleta")
    public ResponseEntity<ApiResponse<ColetaMaterialDTO>> registrarNovaColeta(
            @PathVariable Long coletaId,
            @RequestBody NovaColetaRequest request,
            @AuthenticationPrincipal UserDetailsImpl userDetails
    ) {
        Operador operador = userDetails.getOperador();
        ColetaMaterialDTO coleta = coletaService.registrarNovaColeta(
            coletaId,
            request.getMaterialId(),
            request.getMotivoNovaColetaId(),
            request.getObservacoes(),
            operador
        );
        return ResponseEntity.ok(ApiResponse.success(coleta, "Nova coleta registrada com sucesso"));
    }

    @PostMapping("/{coletaId}/imprimir-etiquetas")
    public ResponseEntity<ApiResponse<Void>> imprimirEtiquetas(@PathVariable Long coletaId) {
        coletaService.imprimirEtiquetas(coletaId);
        return ResponseEntity.ok(ApiResponse.success(null, "Etiquetas marcadas para impressão"));
    }

    @GetMapping("/motivos-nova-coleta")
    public ResponseEntity<ApiResponse<List<MotivoNovaColeta>>> listarMotivosNovaColeta() {
        List<MotivoNovaColeta> motivos = coletaService.listarMotivosNovaColeta();
        return ResponseEntity.ok(ApiResponse.success(motivos));
    }

    // DTOs para requests
    public static class RealizarColetaRequest {
        private Long recepcaoId;
        private List<MaterialColetadoDTO> materiaisColetados;

        // Getters e Setters
        public Long getRecepcaoId() {
            return recepcaoId;
        }

        public void setRecepcaoId(Long recepcaoId) {
            this.recepcaoId = recepcaoId;
        }

        public List<MaterialColetadoDTO> getMateriaisColetados() {
            return materiaisColetados;
        }

        public void setMateriaisColetados(List<MaterialColetadoDTO> materiaisColetados) {
            this.materiaisColetados = materiaisColetados;
        }
    }

    public static class NovaColetaRequest {
        private Long materialId;
        private Long motivoNovaColetaId;
        private String observacoes;

        // Getters e Setters
        public Long getMaterialId() {
            return materialId;
        }

        public void setMaterialId(Long materialId) {
            this.materialId = materialId;
        }

        public Long getMotivoNovaColetaId() {
            return motivoNovaColetaId;
        }

        public void setMotivoNovaColetaId(Long motivoNovaColetaId) {
            this.motivoNovaColetaId = motivoNovaColetaId;
        }

        public String getObservacoes() {
            return observacoes;
        }

        public void setObservacoes(String observacoes) {
            this.observacoes = observacoes;
        }
    }
}