package com.sistemadesaude.backend.samu.controller;

import com.sistemadesaude.backend.response.ApiResponse;
import com.sistemadesaude.backend.samu.dto.AtualizarStatusViaturaDTO;
import com.sistemadesaude.backend.samu.dto.ViaturaDTO;
import com.sistemadesaude.backend.samu.dto.ViaturaRequestDTO;
import com.sistemadesaude.backend.samu.enums.StatusViatura;
import com.sistemadesaude.backend.samu.enums.TipoViatura;
import com.sistemadesaude.backend.samu.service.ViaturaService;
import com.sistemadesaude.backend.samu.service.ViaturaService.ViaturaEstatisticasDTO;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Controller para gerenciar Viaturas
 */
@Slf4j
@RestController
@RequestMapping("/api/samu/viaturas")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ViaturaController {

    private final ViaturaService viaturaService;

    @GetMapping
    @PreAuthorize("hasRole('SAMU_OPERADOR') or hasRole('SAMU_REGULADOR') or hasRole('ADMIN') or hasRole('ADMINISTRADOR_DO_SISTEMA')")
    public ResponseEntity<ApiResponse<List<ViaturaDTO>>> listarAtivas() {
        try {
            log.info("Listando viaturas ativas");
            List<ViaturaDTO> viaturas = viaturaService.listarAtivas();

            ApiResponse<List<ViaturaDTO>> response = new ApiResponse<>();
            response.setSuccess(true);
            response.setMessage("Viaturas listadas com sucesso");
            response.setData(viaturas);

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("Erro ao listar viaturas", e);
            ApiResponse<List<ViaturaDTO>> errorResponse = new ApiResponse<>();
            errorResponse.setSuccess(false);
            errorResponse.setMessage("Erro ao listar viaturas: " + e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    @GetMapping("/disponiveis")
    @PreAuthorize("hasRole('SAMU_OPERADOR') or hasRole('SAMU_REGULADOR') or hasRole('ADMIN') or hasRole('ADMINISTRADOR_DO_SISTEMA')")
    public ResponseEntity<ApiResponse<List<ViaturaDTO>>> listarDisponiveis(
            @RequestParam(required = false) TipoViatura tipo) {
        try {
            log.info("Listando viaturas disponíveis{}", tipo != null ? " tipo: " + tipo : "");

            List<ViaturaDTO> viaturas = tipo != null ?
                    viaturaService.listarDisponiveisPorTipo(tipo) :
                    viaturaService.listarDisponiveis();

            ApiResponse<List<ViaturaDTO>> response = new ApiResponse<>();
            response.setSuccess(true);
            response.setMessage("Viaturas disponíveis listadas com sucesso");
            response.setData(viaturas);

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("Erro ao listar viaturas disponíveis", e);
            ApiResponse<List<ViaturaDTO>> errorResponse = new ApiResponse<>();
            errorResponse.setSuccess(false);
            errorResponse.setMessage("Erro ao listar viaturas disponíveis: " + e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    @GetMapping("/status/{status}")
    @PreAuthorize("hasRole('SAMU_OPERADOR') or hasRole('SAMU_REGULADOR') or hasRole('ADMIN') or hasRole('ADMINISTRADOR_DO_SISTEMA')")
    public ResponseEntity<ApiResponse<List<ViaturaDTO>>> listarPorStatus(@PathVariable StatusViatura status) {
        try {
            log.info("Listando viaturas com status: {}", status);
            List<ViaturaDTO> viaturas = viaturaService.listarPorStatus(status);

            ApiResponse<List<ViaturaDTO>> response = new ApiResponse<>();
            response.setSuccess(true);
            response.setMessage("Viaturas listadas com sucesso");
            response.setData(viaturas);

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("Erro ao listar viaturas por status", e);
            ApiResponse<List<ViaturaDTO>> errorResponse = new ApiResponse<>();
            errorResponse.setSuccess(false);
            errorResponse.setMessage("Erro ao listar viaturas: " + e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    @GetMapping("/tipo/{tipo}")
    @PreAuthorize("hasRole('SAMU_OPERADOR') or hasRole('SAMU_REGULADOR') or hasRole('ADMIN') or hasRole('ADMINISTRADOR_DO_SISTEMA')")
    public ResponseEntity<ApiResponse<List<ViaturaDTO>>> listarPorTipo(@PathVariable TipoViatura tipo) {
        try {
            log.info("Listando viaturas tipo: {}", tipo);
            List<ViaturaDTO> viaturas = viaturaService.listarPorTipo(tipo);

            ApiResponse<List<ViaturaDTO>> response = new ApiResponse<>();
            response.setSuccess(true);
            response.setMessage("Viaturas listadas com sucesso");
            response.setData(viaturas);

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("Erro ao listar viaturas por tipo", e);
            ApiResponse<List<ViaturaDTO>> errorResponse = new ApiResponse<>();
            errorResponse.setSuccess(false);
            errorResponse.setMessage("Erro ao listar viaturas: " + e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    @GetMapping("/estatisticas")
    @PreAuthorize("hasRole('SAMU_OPERADOR') or hasRole('SAMU_REGULADOR') or hasRole('ADMIN') or hasRole('ADMINISTRADOR_DO_SISTEMA')")
    public ResponseEntity<ApiResponse<ViaturaEstatisticasDTO>> obterEstatisticas() {
        try {
            log.info("Obtendo estatísticas de viaturas");
            ViaturaEstatisticasDTO estatisticas = viaturaService.obterEstatisticas();

            ApiResponse<ViaturaEstatisticasDTO> response = new ApiResponse<>();
            response.setSuccess(true);
            response.setMessage("Estatísticas obtidas com sucesso");
            response.setData(estatisticas);

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("Erro ao obter estatísticas", e);
            ApiResponse<ViaturaEstatisticasDTO> errorResponse = new ApiResponse<>();
            errorResponse.setSuccess(false);
            errorResponse.setMessage("Erro ao obter estatísticas: " + e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('SAMU_OPERADOR') or hasRole('SAMU_REGULADOR') or hasRole('ADMIN') or hasRole('ADMINISTRADOR_DO_SISTEMA')")
    public ResponseEntity<ApiResponse<ViaturaDTO>> buscarPorId(@PathVariable Long id) {
        try {
            log.info("Buscando viatura por ID: {}", id);
            ViaturaDTO viatura = viaturaService.buscarPorId(id);

            ApiResponse<ViaturaDTO> response = new ApiResponse<>();
            response.setSuccess(true);
            response.setMessage("Viatura encontrada");
            response.setData(viatura);

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("Erro ao buscar viatura", e);
            ApiResponse<ViaturaDTO> errorResponse = new ApiResponse<>();
            errorResponse.setSuccess(false);
            errorResponse.setMessage("Erro ao buscar viatura: " + e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    @GetMapping("/identificacao/{identificacao}")
    @PreAuthorize("hasRole('SAMU_OPERADOR') or hasRole('SAMU_REGULADOR') or hasRole('ADMIN') or hasRole('ADMINISTRADOR_DO_SISTEMA')")
    public ResponseEntity<ApiResponse<ViaturaDTO>> buscarPorIdentificacao(@PathVariable String identificacao) {
        try {
            log.info("Buscando viatura por identificação: {}", identificacao);
            ViaturaDTO viatura = viaturaService.buscarPorIdentificacao(identificacao);

            ApiResponse<ViaturaDTO> response = new ApiResponse<>();
            response.setSuccess(true);
            response.setMessage("Viatura encontrada");
            response.setData(viatura);

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("Erro ao buscar viatura", e);
            ApiResponse<ViaturaDTO> errorResponse = new ApiResponse<>();
            errorResponse.setSuccess(false);
            errorResponse.setMessage("Erro ao buscar viatura: " + e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('ADMINISTRADOR_DO_SISTEMA')")
    public ResponseEntity<ApiResponse<ViaturaDTO>> criar(@Valid @RequestBody ViaturaRequestDTO request) {
        try {
            log.info("Criando nova viatura: {}", request.getIdentificacao());
            ViaturaDTO viatura = viaturaService.criar(request);

            ApiResponse<ViaturaDTO> response = new ApiResponse<>();
            response.setSuccess(true);
            response.setMessage("Viatura criada com sucesso");
            response.setData(viatura);

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("Erro ao criar viatura", e);
            ApiResponse<ViaturaDTO> errorResponse = new ApiResponse<>();
            errorResponse.setSuccess(false);
            errorResponse.setMessage("Erro ao criar viatura: " + e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('ADMINISTRADOR_DO_SISTEMA')")
    public ResponseEntity<ApiResponse<ViaturaDTO>> atualizar(
            @PathVariable Long id,
            @Valid @RequestBody ViaturaRequestDTO request) {
        try {
            log.info("Atualizando viatura ID: {}", id);
            ViaturaDTO viatura = viaturaService.atualizar(id, request);

            ApiResponse<ViaturaDTO> response = new ApiResponse<>();
            response.setSuccess(true);
            response.setMessage("Viatura atualizada com sucesso");
            response.setData(viatura);

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("Erro ao atualizar viatura", e);
            ApiResponse<ViaturaDTO> errorResponse = new ApiResponse<>();
            errorResponse.setSuccess(false);
            errorResponse.setMessage("Erro ao atualizar viatura: " + e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasRole('SAMU_OPERADOR') or hasRole('SAMU_REGULADOR') or hasRole('ADMIN') or hasRole('ADMINISTRADOR_DO_SISTEMA')")
    public ResponseEntity<ApiResponse<ViaturaDTO>> atualizarStatus(
            @PathVariable Long id,
            @Valid @RequestBody AtualizarStatusViaturaDTO request) {
        try {
            log.info("Atualizando status da viatura ID: {}", id);
            ViaturaDTO viatura = viaturaService.atualizarStatus(id, request);

            ApiResponse<ViaturaDTO> response = new ApiResponse<>();
            response.setSuccess(true);
            response.setMessage("Status atualizado com sucesso");
            response.setData(viatura);

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("Erro ao atualizar status", e);
            ApiResponse<ViaturaDTO> errorResponse = new ApiResponse<>();
            errorResponse.setSuccess(false);
            errorResponse.setMessage("Erro ao atualizar status: " + e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    @DeleteMapping("/{id}/inativar")
    @PreAuthorize("hasRole('ADMIN') or hasRole('ADMINISTRADOR_DO_SISTEMA')")
    public ResponseEntity<ApiResponse<Void>> inativar(@PathVariable Long id) {
        try {
            log.info("Inativando viatura ID: {}", id);
            viaturaService.inativar(id);

            ApiResponse<Void> response = new ApiResponse<>();
            response.setSuccess(true);
            response.setMessage("Viatura inativada com sucesso");

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("Erro ao inativar viatura", e);
            ApiResponse<Void> errorResponse = new ApiResponse<>();
            errorResponse.setSuccess(false);
            errorResponse.setMessage("Erro ao inativar viatura: " + e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    @PutMapping("/{id}/reativar")
    @PreAuthorize("hasRole('ADMIN') or hasRole('ADMINISTRADOR_DO_SISTEMA')")
    public ResponseEntity<ApiResponse<ViaturaDTO>> reativar(@PathVariable Long id) {
        try {
            log.info("Reativando viatura ID: {}", id);
            ViaturaDTO viatura = viaturaService.reativar(id);

            ApiResponse<ViaturaDTO> response = new ApiResponse<>();
            response.setSuccess(true);
            response.setMessage("Viatura reativada com sucesso");
            response.setData(viatura);

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("Erro ao reativar viatura", e);
            ApiResponse<ViaturaDTO> errorResponse = new ApiResponse<>();
            errorResponse.setSuccess(false);
            errorResponse.setMessage("Erro ao reativar viatura: " + e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('ADMINISTRADOR_DO_SISTEMA')")
    public ResponseEntity<ApiResponse<Void>> deletar(@PathVariable Long id) {
        try {
            log.info("Deletando viatura ID: {}", id);
            viaturaService.deletar(id);

            ApiResponse<Void> response = new ApiResponse<>();
            response.setSuccess(true);
            response.setMessage("Viatura deletada com sucesso");

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("Erro ao deletar viatura", e);
            ApiResponse<Void> errorResponse = new ApiResponse<>();
            errorResponse.setSuccess(false);
            errorResponse.setMessage("Erro ao deletar viatura: " + e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }
}
