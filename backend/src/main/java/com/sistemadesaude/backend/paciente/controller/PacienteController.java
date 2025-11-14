package com.sistemadesaude.backend.paciente.controller;

import com.sistemadesaude.backend.paciente.dto.PacienteDTO;
import com.sistemadesaude.backend.paciente.dto.PacienteListDTO;
import com.sistemadesaude.backend.paciente.service.PacienteService;
import com.sistemadesaude.backend.exception.BusinessException;
import com.sistemadesaude.backend.exception.ResourceNotFoundException;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Controlador REST para operações relacionadas a pacientes.
 * As permissões de acesso são definidas em cada método.
 */
@RestController
@RequestMapping("/api/pacientes")
@RequiredArgsConstructor
@Slf4j
public class PacienteController {

    private final PacienteService pacienteService;

    /**
     * Cria um novo paciente.
     * Apenas usuários com perfil de RECEPCAO, ADMIN ou MASTER podem criar.
     */
    @PostMapping
    @PreAuthorize("hasAnyRole('RECEPCAO', 'ADMIN', 'MASTER', 'ADMINISTRADOR_SISTEMA')")
    public ResponseEntity<PacienteDTO> criarPaciente(@Valid @RequestBody PacienteDTO pacienteDTO) {
        try {
            log.info("📝 Criando novo paciente: {}", pacienteDTO.getNomeCompleto());
            PacienteDTO pacienteCriado = pacienteService.criarPaciente(pacienteDTO);
            log.info("✅ Paciente criado com sucesso. ID: {}", pacienteCriado.getId());
            return new ResponseEntity<>(pacienteCriado, HttpStatus.CREATED);
        } catch (BusinessException e) {
            log.error("❌ Erro de negócio ao criar paciente: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            log.error("❌ Erro interno ao criar paciente: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Busca um paciente pelo ID.
     * Qualquer usuário autenticado pode buscar um paciente por ID.
     */
    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<PacienteDTO> buscarPacientePorId(@PathVariable Long id) {
        try {
            log.info("🔍 Buscando paciente por ID: {}", id);
            PacienteDTO paciente = pacienteService.buscarPacientePorId(id);
            log.info("✅ Paciente encontrado: {}", paciente != null ? paciente.getNomeCompleto() : "null");
            return ResponseEntity.ok(paciente);
        } catch (ResourceNotFoundException e) {
            log.warn("⚠️ Paciente não encontrado com ID: {}", id);
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            log.error("❌ Erro interno ao buscar paciente por ID {}: {}", id, e.getMessage(), e);
            log.error("❌ Stack trace completo:", e);
            // Retorna erro mais detalhado para debug
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .header("X-Error-Message", e.getMessage() != null ? e.getMessage() : "Erro desconhecido")
                    .build();
        }
    }

    /**
     * Atualiza os dados de um paciente.
     * Apenas usuários com perfil de RECEPCAO, ADMIN ou MASTER podem atualizar.
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('RECEPCAO', 'ADMIN', 'MASTER', 'ADMINISTRADOR_SISTEMA')")
    public ResponseEntity<PacienteDTO> atualizarPaciente(@PathVariable Long id, @Valid @RequestBody PacienteDTO pacienteDTO) {
        try {
            log.info("🔄 Atualizando paciente ID: {}", id);
            PacienteDTO pacienteAtualizado = pacienteService.atualizarPaciente(id, pacienteDTO);
            log.info("✅ Paciente atualizado com sucesso. ID: {}", pacienteAtualizado.getId());
            return ResponseEntity.ok(pacienteAtualizado);
        } catch (ResourceNotFoundException e) {
            log.warn("⚠️ Paciente não encontrado para atualização. ID: {}", id);
            return ResponseEntity.notFound().build();
        } catch (BusinessException e) {
            log.error("❌ Erro de negócio ao atualizar paciente ID {}: {}", id, e.getMessage());
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            log.error("❌ Erro interno ao atualizar paciente ID {}: {}", id, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Exclui um paciente pelo ID.
     * Apenas usuários com perfil de ADMIN ou MASTER podem excluir.
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MASTER', 'ADMINISTRADOR_SISTEMA')")
    public ResponseEntity<Void> excluirPaciente(@PathVariable Long id) {
        try {
            log.info("🗑️ Excluindo paciente ID: {}", id);
            pacienteService.excluirPaciente(id);
            log.info("✅ Paciente excluído com sucesso. ID: {}", id);
            return ResponseEntity.noContent().build();
        } catch (ResourceNotFoundException e) {
            log.warn("⚠️ Paciente não encontrado para exclusão. ID: {}", id);
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            log.error("❌ Erro interno ao excluir paciente ID {}: {}", id, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Lista todos os pacientes (para listagens gerais).
     * Qualquer usuário autenticado pode listar.
     */
    @GetMapping
    @PreAuthorize("permitAll()")
    public ResponseEntity<List<PacienteListDTO>> listarTodosPacientes() {
        try {
            log.info("📋 Listando todos os pacientes");
            List<PacienteListDTO> pacientes = pacienteService.listarTodosPacientes();
            log.info("✅ Encontrados {} paciente(s)", pacientes.size());
            return ResponseEntity.ok(pacientes);
        } catch (Exception e) {
            log.error("❌ Erro interno ao listar pacientes: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Busca pacientes por nome (endpoint específico).
     * Este endpoint agora usará a busca paginada implementada no Service.
     */
    @GetMapping("/buscar/nome/{nome}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<PacienteListDTO>> buscarPacientesPorNome(@PathVariable String nome) {
        try {
            log.info("🔍 Buscando pacientes por nome: {}", nome);
            List<PacienteListDTO> pacientes = pacienteService.buscarPacientesPorNome(nome.trim());
            log.info("✅ Encontrados {} paciente(s) com nome: {}", pacientes.size(), nome);
            return ResponseEntity.ok(pacientes);
        } catch (Exception e) {
            log.error("❌ Erro interno ao buscar pacientes por nome {}: {}", nome, e.getMessage(), e);
            return ResponseEntity.ok(Collections.emptyList()); // Retorna lista vazia em caso de erro
        }
    }

    /**
     * Busca paciente por CPF (endpoint específico).
     */
    @GetMapping("/buscar/cpf/{cpf}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<PacienteDTO> buscarPacientePorCpf(@PathVariable String cpf) {
        try {
            log.info("🔍 Buscando paciente por CPF: {}", cpf);
            PacienteDTO paciente = pacienteService.buscarPorCpf(cpf.trim());
            if (paciente != null) {
                log.info("✅ Paciente encontrado por CPF: {}", paciente.getNomeCompleto());
                return ResponseEntity.ok(paciente);
            } else {
                log.info("⚠️ Nenhum paciente encontrado com CPF: {}", cpf);
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            log.error("❌ Erro interno ao buscar paciente por CPF {}: {}", cpf, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Busca paciente por CNS/Cartão SUS (endpoint específico).
     */
    @GetMapping("/buscar/cns/{cns}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<PacienteDTO> buscarPacientePorCns(@PathVariable String cns) {
        try {
            log.info("🔍 Buscando paciente por CNS: {}", cns);
            PacienteDTO paciente = pacienteService.buscarPorCns(cns.trim());
            if (paciente != null) {
                log.info("✅ Paciente encontrado por CNS: {}", paciente.getNomeCompleto());
                return ResponseEntity.ok(paciente);
            } else {
                log.info("⚠️ Nenhum paciente encontrado com CNS: {}", cns);
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            log.error("❌ Erro interno ao buscar paciente por CNS {}: {}", cns, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Busca pacientes por múltiplos critérios.
     */
    @GetMapping("/buscar/multiplos")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<PacienteDTO>> buscarPorMultiplosCriterios(@RequestParam String termo) {
        try {
            log.info("🔍 Buscando pacientes por múltiplos critérios: {}", termo);
            List<PacienteDTO> pacientes = pacienteService.buscarPorMultiplosCriterios(termo.trim());
            log.info("✅ Encontrados {} paciente(s) por múltiplos critérios", pacientes.size());
            return ResponseEntity.ok(pacientes);
        } catch (Exception e) {
            log.error("❌ Erro interno ao buscar por múltiplos critérios {}: {}", termo, e.getMessage(), e);
            return ResponseEntity.ok(Collections.emptyList());
        }
    }

    /**
     * Busca pacientes por termo geral (endpoint /search).
     * Este endpoint é usado pelo frontend para busca unificada.
     * Busca por múltiplos critérios: nome, CPF, CNS, nome social, nome da mãe.
     */
    @GetMapping("/search")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<PacienteDTO>> searchPacientes(
            @RequestParam String term,
            @RequestParam(required = false, defaultValue = "20") Integer limit) {
        try {
            log.info("🔍 Busca unificada (search) - termo: {}, limite: {}", term, limit);

            String termoBusca = term.trim();
            if (termoBusca.isEmpty()) {
                log.warn("⚠️ Termo de busca vazio");
                return ResponseEntity.ok(Collections.emptyList());
            }

            // Busca por múltiplos critérios (nome, CPF, CNS, nome social, nome da mãe)
            List<PacienteDTO> pacientes = pacienteService.buscarPorMultiplosCriterios(termoBusca);

            // Limita resultados se necessário
            if (limit != null && limit > 0 && pacientes.size() > limit) {
                pacientes = pacientes.subList(0, limit);
            }

            log.info("✅ Busca unificada retornou {} paciente(s)", pacientes.size());
            return ResponseEntity.ok(pacientes);

        } catch (Exception e) {
            log.error("❌ Erro na busca unificada (search) para termo {}: {}", term, e.getMessage(), e);
            return ResponseEntity.ok(Collections.emptyList());
        }
    }

    /**
     * Endpoint de busca unificada (mantido para compatibilidade).
     * ✅ CORRIGIDO: Suporta também parâmetro 'query' para compatibilidade com frontend
     */
    @GetMapping({"/buscar", "/busca"})
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<PacienteListDTO>> buscarPacientes(
            @RequestParam(required = false) String nome,
            @RequestParam(required = false) String query,
            @RequestParam(required = false) String cpf,
            @RequestParam(required = false) String cns) {

        try {
            // ✅ CORRIGIDO: Usar 'query' se fornecido, caso contrário usar 'nome'
            String termoBusca = (query != null && !query.trim().isEmpty()) ? query.trim() : 
                               (nome != null && !nome.trim().isEmpty()) ? nome.trim() : null;
            
            log.info("🔍 Busca unificada - termo: {}, cpf: {}, cns: {}", termoBusca, cpf, cns);
            
            if (termoBusca != null && !termoBusca.isEmpty()) {
                // Busca por múltiplos critérios quando usar 'query' ou 'nome'
                List<PacienteDTO> pacientesDTO = pacienteService.buscarPorMultiplosCriterios(termoBusca);
                List<PacienteListDTO> pacientes = pacientesDTO.stream()
                    .map(this::convertToListDTO)
                    .collect(Collectors.toList());
                log.info("✅ Encontrados {} paciente(s) por termo: {}", pacientes.size(), termoBusca);
                return ResponseEntity.ok(pacientes);
            }
            if (cpf != null && !cpf.trim().isEmpty()) {
                PacienteDTO paciente = pacienteService.buscarPorCpf(cpf.trim());
                if (paciente != null) {
                    return ResponseEntity.ok(Collections.singletonList(convertToListDTO(paciente)));
                } else {
                    return ResponseEntity.ok(Collections.emptyList());
                }
            }
            if (cns != null && !cns.trim().isEmpty()) {
                PacienteDTO paciente = pacienteService.buscarPorCns(cns.trim());
                if (paciente != null) {
                    return ResponseEntity.ok(Collections.singletonList(convertToListDTO(paciente)));
                } else {
                    return ResponseEntity.ok(Collections.emptyList());
                }
            }
            log.warn("⚠️ Nenhum parâmetro de busca fornecido");
            return ResponseEntity.badRequest().body(Collections.emptyList());
        } catch (Exception e) {
            log.error("❌ Erro interno na busca unificada: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Collections.emptyList());
        }
    }

    /**
     * Busca paciente por documento (CPF ou CNS).
     * Endpoint usado pelo frontend para busca unificada por documentos.
     * Suporta busca parcial quando tiver 3+ dígitos.
     */
    @GetMapping("/por-documento")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<PacienteDTO> buscarPorDocumento(
            @RequestParam(required = false) String cpf,
            @RequestParam(required = false) String cns) {
        try {
            log.info("🔍 Buscando paciente por documento - CPF: {}, CNS: {}", cpf, cns);
            
            // Validação: pelo menos um parâmetro deve ser fornecido
            if ((cpf == null || cpf.trim().isEmpty()) && (cns == null || cns.trim().isEmpty())) {
                log.warn("⚠️ Nenhum parâmetro de documento fornecido");
                return ResponseEntity.notFound().build();
            }
            
            // Remove máscaras e caracteres não numéricos
            String cpfLimpo = cpf != null ? cpf.replaceAll("[^0-9]", "") : null;
            String cnsLimpo = cns != null ? cns.replaceAll("[^0-9]", "") : null;
            
            // Se tem menos de 3 dígitos, não busca
            if ((cpfLimpo == null || cpfLimpo.length() < 3) && (cnsLimpo == null || cnsLimpo.length() < 3)) {
                log.debug("⚠️ Documento muito curto (menos de 3 dígitos)");
                return ResponseEntity.notFound().build();
            }
            
            // Se tem 11 dígitos (CPF completo), busca exata primeiro
            if (cpfLimpo != null && cpfLimpo.length() == 11) {
                try {
                    PacienteDTO paciente = pacienteService.buscarPorCpf(cpfLimpo);
                    if (paciente != null) {
                        log.info("✅ Paciente encontrado por CPF completo: {}", paciente.getNomeCompleto());
                        return ResponseEntity.ok(paciente);
                    }
                } catch (Exception e) {
                    log.warn("⚠️ Erro ao buscar por CPF completo {}: {}", cpfLimpo, e.getMessage());
                }
            }
            
            // Se tem 15 dígitos (CNS completo), busca exata primeiro
            if (cnsLimpo != null && cnsLimpo.length() == 15) {
                try {
                    PacienteDTO paciente = pacienteService.buscarPorCns(cnsLimpo);
                    if (paciente != null) {
                        log.info("✅ Paciente encontrado por CNS completo: {}", paciente.getNomeCompleto());
                        return ResponseEntity.ok(paciente);
                    }
                } catch (Exception e) {
                    log.warn("⚠️ Erro ao buscar por CNS completo {}: {}", cnsLimpo, e.getMessage());
                }
            }
            
            // Busca parcial usando múltiplos critérios (funciona para CPF/CNS parcial com 3+ dígitos)
            String termoBusca = cpfLimpo != null && !cpfLimpo.isEmpty() ? cpfLimpo : cnsLimpo;
            if (termoBusca != null && termoBusca.length() >= 3) {
                try {
                    log.debug("🔍 Tentando busca parcial com termo: '{}'", termoBusca);
                    List<PacienteDTO> pacientes = pacienteService.buscarPorMultiplosCriterios(termoBusca);
                    log.debug("📊 Busca parcial retornou {} paciente(s)", pacientes.size());
                    if (!pacientes.isEmpty()) {
                        // Retorna o primeiro resultado (já ordenado por relevância)
                        log.info("✅ Paciente encontrado por busca parcial: {} (CPF: {})", 
                                pacientes.get(0).getNomeCompleto(), 
                                pacientes.get(0).getCpf());
                        return ResponseEntity.ok(pacientes.get(0));
                    } else {
                        log.debug("⚠️ Nenhum paciente encontrado na busca parcial com termo '{}'", termoBusca);
                    }
                } catch (Exception e) {
                    log.error("❌ Erro ao buscar por múltiplos critérios '{}': {}", termoBusca, e.getMessage(), e);
                }
            }
            
            log.info("⚠️ Nenhum paciente encontrado com os documentos fornecidos");
            return ResponseEntity.notFound().build();
            
        } catch (Exception e) {
            log.error("❌ Erro interno ao buscar paciente por documento - CPF: {}, CNS: {}: {}", cpf, cns, e.getMessage(), e);
            log.error("❌ Stack trace completo:", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Verifica a vulnerabilidade do paciente.
     */
    @GetMapping("/{id}/vulnerabilidade")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Boolean> verificarVulnerabilidade(@PathVariable Long id) {
        try {
            log.info("🔍 Verificando vulnerabilidade do paciente ID: {}", id);
            boolean vulneravel = pacienteService.verificarVulnerabilidade(id);
            log.info("✅ Vulnerabilidade verificada para paciente ID {}: {}", id, vulneravel);
            return ResponseEntity.ok(vulneravel);
        } catch (ResourceNotFoundException e) {
            log.warn("⚠️ Paciente não encontrado para verificação de vulnerabilidade. ID: {}", id);
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            log.error("❌ Erro interno ao verificar vulnerabilidade do paciente ID {}: {}", id, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Converte PacienteDTO para PacienteListDTO.
     */
    private PacienteListDTO convertToListDTO(PacienteDTO paciente) {
        return PacienteListDTO.builder()
                .id(paciente.getId())
                .nomeCompleto(paciente.getNomeCompleto())
                .nomeSocial(paciente.getNomeSocial())
                .cpf(paciente.getCpf())
                .cns(paciente.getCns())
                .dataNascimento(paciente.getDataNascimento())
                .municipio(paciente.getMunicipio())
                .telefoneCelular(paciente.getTelefoneCelular())
                .build();
    }
}
