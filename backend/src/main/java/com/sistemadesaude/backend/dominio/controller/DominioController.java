package com.sistemadesaude.backend.dominio.controller;

import com.sistemadesaude.backend.operador.dto.SetorDTO;
import com.sistemadesaude.backend.operador.entity.SetorAtendimento;
import com.sistemadesaude.backend.operador.repository.SetorAtendimentoRepository;
import com.sistemadesaude.backend.response.ApiResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Controller para endpoints de domínios (listas de referência)
 */
@RestController
@RequestMapping("/api/dominios")
@RequiredArgsConstructor
@Slf4j
public class DominioController {

    private final SetorAtendimentoRepository setorRepository;

    /**
     * Lista todos os setores de atendimento ativos
     * @return Lista de setores
     */
    @GetMapping("/setores")
    public ResponseEntity<ApiResponse<List<SetorDTO>>> listarSetores() {
        try {
            log.info("📋 Listando setores de atendimento");
            List<SetorAtendimento> setores = setorRepository.findByAtivoTrueOrderByNomeAsc();
            
            List<SetorDTO> setoresDTO = setores.stream()
                    .map(setor -> SetorDTO.builder()
                            .id(setor.getId())
                            .nome(setor.getNome())
                            .ativo(setor.getAtivo())
                            .build())
                    .collect(Collectors.toList());
            
            log.info("✅ Encontrados {} setor(es) ativo(s)", setoresDTO.size());
            return ResponseEntity.ok(new ApiResponse<>(true, "Setores listados com sucesso", setoresDTO));
        } catch (Exception e) {
            log.error("❌ Erro ao listar setores: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse<>(false, "Erro ao listar setores: " + e.getMessage(), null));
        }
    }
}

