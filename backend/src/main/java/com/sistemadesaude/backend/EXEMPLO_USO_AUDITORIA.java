package com.sistemadesaude.backend;

/**
 * =============================================================================
 * EXEMPLO DE USO DO SISTEMA DE AUDITORIA
 * =============================================================================
 *
 * O sistema de auditoria foi implementado para rastreamento de operações
 * críticas, conformidade LGPD e segurança. Veja exemplos de uso:
 */

// ============= EXEMPLO 1: Auditar método de serviço =============

/*
@Service
@RequiredArgsConstructor
public class PacienteService {

    private final PacienteRepository repository;

    @Audited(
        tipoOperacao = AuditLog.TipoOperacao.READ,
        entidadeTipo = "Paciente",
        descricao = "Consulta de prontuário do paciente"
    )
    public PacienteDTO buscarPorId(Long id) {
        return repository.findById(id)
            .map(this::converterParaDTO)
            .orElseThrow(() -> new ResourceNotFoundException("Paciente não encontrado"));
    }

    @Audited(
        tipoOperacao = AuditLog.TipoOperacao.UPDATE,
        entidadeTipo = "Paciente",
        descricao = "Atualização de dados do paciente"
    )
    public PacienteDTO atualizar(Long id, PacienteDTO dto) {
        Paciente paciente = repository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Paciente não encontrado"));

        // Atualiza dados
        paciente.setNome(dto.getNome());
        // ... outros campos

        return converterParaDTO(repository.save(paciente));
    }
}
*/

// ============= EXEMPLO 2: Auditar controller =============

/*
@RestController
@RequestMapping("/api/exames")
@RequiredArgsConstructor
public class ExameController {

    private final ExameService exameService;

    @GetMapping("/{id}/resultado")
    @Audited(
        tipoOperacao = AuditLog.TipoOperacao.ACESSO_DADOS_SENSIVEIS,
        entidadeTipo = "Exame",
        descricao = "Visualização de resultado de exame"
    )
    public ResponseEntity<ResultadoExameDTO> buscarResultado(@PathVariable Long id) {
        ResultadoExameDTO resultado = exameService.buscarResultado(id);
        return ResponseEntity.ok(resultado);
    }

    @DeleteMapping("/{id}")
    @Audited(
        tipoOperacao = AuditLog.TipoOperacao.DELETE,
        entidadeTipo = "Exame",
        descricao = "Exclusão de exame",
        auditarErros = true
    )
    public ResponseEntity<Void> excluir(@PathVariable Long id) {
        exameService.excluir(id);
        return ResponseEntity.noContent().build();
    }
}
*/

// ============= EXEMPLO 3: Auditoria manual via AuditService =============

/*
@Service
@RequiredArgsConstructor
public class AtendimentoService {

    private final AuditService auditService;
    private final HttpServletRequest request;

    public void realizarAtendimento(Long pacienteId, AtendimentoDTO dto) {
        // Lógica de atendimento...

        // Auditar manualmente operação específica
        auditService.registrarAcessoDadosSensiveis(
            getUserId(),
            getUserName(),
            "Prontuario",
            pacienteId,
            "Atendimento médico realizado",
            request
        );
    }
}
*/

// ============= EXEMPLO 4: Verificar tentativas de login falhas =============

/*
@Service
@RequiredArgsConstructor
public class AuthenticationService {

    private final AuditService auditService;

    public void verificarSeguranca(Long usuarioId) {
        // Verificar tentativas nos últimos 15 minutos
        Long tentativasFalhas = auditService.verificarTentativasFalhas(usuarioId, 15);

        if (tentativasFalhas >= 5) {
            throw new SecurityException("Muitas tentativas de login. Conta bloqueada temporariamente.");
        }
    }
}
*/

// ============= TIPOS DE OPERAÇÃO DISPONÍVEIS =============

/*
AuditLog.TipoOperacao:
- LOGIN                           → Login no sistema
- LOGOUT                          → Logout
- CREATE                          → Criação de registro
- READ                            → Leitura de dados
- UPDATE                          → Atualização
- DELETE                          → Exclusão
- EXPORT                          → Exportação de dados
- IMPORT                          → Importação de dados
- ACESSO_DADOS_SENSIVEIS          → Acesso a prontuário, exames, etc.
- ALTERACAO_PERMISSAO             → Mudança de perfil/permissões
- FALHA_AUTENTICACAO              → Login falhou
- TENTATIVA_ACESSO_NAO_AUTORIZADO → Tentativa de acesso sem permissão
*/

// ============= CONSULTAR LOGS DE AUDITORIA =============

/*
// Via Repository
@Autowired
private AuditLogRepository auditLogRepository;

// Buscar por usuário
Page<AuditLog> logs = auditLogRepository.findByUsuarioId(usuarioId, pageable);

// Buscar por período
LocalDateTime inicio = LocalDateTime.now().minusDays(7);
LocalDateTime fim = LocalDateTime.now();
Page<AuditLog> logs = auditLogRepository.findByDataHoraBetween(inicio, fim, pageable);

// Buscar tentativas recentes
List<AuditLog> tentativas = auditLogRepository.findTentativasRecentes(
    usuarioId,
    AuditLog.TipoOperacao.FALHA_AUTENTICACAO,
    LocalDateTime.now().minusMinutes(15)
);
*/

// ============= RATE LIMITING =============

/*
O sistema já implementa rate limiting automático:
- Limite: 100 requisições por minuto por IP
- Bloqueio temporário: após 150 requisições (15 minutos)
- Endpoints excluídos: /api/auth/login, /swagger-ui/**, /actuator/**

Para ajustar os limites, edite:
- backend/src/main/java/com/sistemadesaude/backend/config/RateLimitInterceptor.java
  * MAX_REQUESTS_PER_MINUTE
  * BLOCK_THRESHOLD
*/

public class EXEMPLO_USO_AUDITORIA {
    // Este é apenas um arquivo de documentação
    // Não precisa ser compilado
}
