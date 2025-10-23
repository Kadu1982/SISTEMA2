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
            log.info("✅ Paciente encontrado: {}", paciente.getNomeCompleto());
            return ResponseEntity.ok(paciente);
        } catch (ResourceNotFoundException e) {
            log.warn("⚠️ Paciente não encontrado com ID: {}", id);
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            log.error("❌ Erro interno ao buscar paciente por ID {}: {}", id, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
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
     */
    @GetMapping("/search")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<PacienteListDTO>> searchPacientes(
            @RequestParam String term,
            @RequestParam(required = false, defaultValue = "20") Integer limit) {
        try {
            log.info("🔍 Busca unificada (search) - termo: {}, limite: {}", term, limit);

            String termoBusca = term.trim();
            if (termoBusca.isEmpty()) {
                log.warn("⚠️ Termo de busca vazio");
                return ResponseEntity.ok(Collections.emptyList());
            }

            // Busca por nome (principal)
            List<PacienteListDTO> pacientes = pacienteService.buscarPacientesPorNome(termoBusca);

            // Se não encontrou por nome, tenta por CPF ou CNS
            if (pacientes.isEmpty()) {
                // Tenta CPF
                PacienteDTO porCpf = pacienteService.buscarPorCpf(termoBusca);
                if (porCpf != null) {
                    return ResponseEntity.ok(Collections.singletonList(convertToListDTO(porCpf)));
                }

                // Tenta CNS
                PacienteDTO porCns = pacienteService.buscarPorCns(termoBusca);
                if (porCns != null) {
                    return ResponseEntity.ok(Collections.singletonList(convertToListDTO(porCns)));
                }
            }

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
     */
    @GetMapping("/buscar")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<PacienteListDTO>> buscarPacientes(
            @RequestParam(required = false) String nome,
            @RequestParam(required = false) String cpf,
            @RequestParam(required = false) String cns) {

        try {
            log.info("🔍 Busca unificada - nome: {}, cpf: {}, cns: {}", nome, cpf, cns);
            if (nome != null && !nome.trim().isEmpty()) {
                List<PacienteListDTO> pacientes = pacienteService.buscarPacientesPorNome(nome.trim());
                log.info("✅ Encontrados {} paciente(s) por nome", pacientes.size());
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
