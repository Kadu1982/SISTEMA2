package com.sistemadesaude.backend.imunizacao.service;

import com.sistemadesaude.backend.exception.BusinessException;
import com.sistemadesaude.backend.imunizacao.dto.AplicacaoVacinaDTO;
import com.sistemadesaude.backend.imunizacao.entity.AplicacaoVacina;
import com.sistemadesaude.backend.imunizacao.entity.ConfiguracaoImunizacao;
import com.sistemadesaude.backend.imunizacao.entity.Vacina;
import com.sistemadesaude.backend.imunizacao.enums.LocalAtendimento;
import com.sistemadesaude.backend.imunizacao.mapper.AplicacaoVacinaMapper;
import com.sistemadesaude.backend.imunizacao.repository.AplicacaoVacinaRepository;
import com.sistemadesaude.backend.imunizacao.repository.ConfiguracaoImunizacaoRepository;
import com.sistemadesaude.backend.imunizacao.repository.VacinaRepository;
import com.sistemadesaude.backend.operador.entity.Operador;
import com.sistemadesaude.backend.operador.repository.OperadorRepository;
import com.sistemadesaude.backend.paciente.entity.Paciente;
import com.sistemadesaude.backend.paciente.repository.PacienteRepository;
import com.sistemadesaude.backend.profissional.entity.Profissional;
import com.sistemadesaude.backend.profissional.repository.ProfissionalRepository;
import com.sistemadesaude.backend.unidadesaude.entity.UnidadeSaude;
import com.sistemadesaude.backend.unidadesaude.repository.UnidadeSaudeRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class AplicacaoVacinaService {

    private final AplicacaoVacinaRepository aplicacaoVacinaRepository;
    private final VacinaRepository vacinaRepository;
    private final PacienteRepository pacienteRepository;
    private final UnidadeSaudeRepository unidadeSaudeRepository;
    private final ProfissionalRepository profissionalRepository;
    private final OperadorRepository operadorRepository;
    private final ConfiguracaoImunizacaoRepository configuracaoRepository;
    private final AplicacaoVacinaMapper mapper;

    @Transactional
    public AplicacaoVacinaDTO registrarAplicacao(AplicacaoVacinaDTO dto) {
        log.info("💉 Registrando aplicação de vacina para paciente ID: {}", dto.getPacienteId());

        // 1. Validações básicas
        validarDadosAplicacao(dto);

        // 2. Buscar entidades relacionadas
        Paciente paciente = buscarPaciente(dto.getPacienteId());
        Vacina vacina = buscarVacina(dto.getVacinaId());
        UnidadeSaude unidade = buscarUnidade(dto.getUnidadeId());
        Profissional profissional = dto.getProfissionalId() != null
            ? buscarProfissional(dto.getProfissionalId()) : null;

        // 3. Aplicar regras de negócio conforme PDF
        aplicarRegrasDeNegocio(dto, unidade);

        // 4. Criar entidade
        AplicacaoVacina aplicacao = AplicacaoVacina.builder()
            .paciente(paciente)
            .vacina(vacina)
            .unidade(unidade)
            .profissional(profissional)
            .operador(getOperadorLogado())
            .dataAplicacao(dto.getDataAplicacao())
            .horaAplicacao(dto.getHoraAplicacao())
            .estrategiaVacinacao(dto.getEstrategiaVacinacao())
            .localAtendimento(dto.getLocalAtendimento())
            .dose(dto.getDose())
            .lote(dto.getLote())
            .fabricante(dto.getFabricante())
            .dataValidade(dto.getDataValidade())
            .viaAdministracao(dto.getViaAdministracao())
            .localAplicacao(dto.getLocalAplicacao())
            .observacoes(dto.getObservacoes())
            .build();

        // 5. Salvar
        aplicacao = aplicacaoVacinaRepository.save(aplicacao);
        log.info("✅ Aplicação de vacina registrada com ID: {}", aplicacao.getId());

        return mapper.toDTO(aplicacao);
    }

    /**
     * Aplicar regras de negócio conforme PDF SAUDE-89155
     */
    private void aplicarRegrasDeNegocio(AplicacaoVacinaDTO dto, UnidadeSaude unidade) {
        ConfiguracaoImunizacao config = configuracaoRepository.findByUnidadeId(unidade.getId())
            .orElse(null);

        if (config != null) {
            // REGRA: Local de Atendimento = "Nenhum" quando:
            // 1. Configurado para exportar para RNDS
            // 2. NÃO exporta para e-SUS AB
            if (config.getExportarRnds() && !config.getExportarEsusAb()) {
                dto.setLocalAtendimento(LocalAtendimento.NENHUM);
                log.info("🔧 Local de atendimento configurado como 'NENHUM' conforme regra SAUDE-89155");
            }
        }
    }

    @Transactional(readOnly = true)
    public List<AplicacaoVacinaDTO> buscarPorPaciente(Long pacienteId) {
        List<AplicacaoVacina> aplicacoes = aplicacaoVacinaRepository
            .findByPacienteIdOrderByDataAplicacaoDesc(pacienteId);
        return aplicacoes.stream()
            .map(mapper::toDTO)
            .toList();
    }

    @Transactional(readOnly = true)
    public Page<AplicacaoVacinaDTO> buscarComFiltros(
            Long pacienteId, Long vacinaId, Long unidadeId,
            LocalDate dataInicio, LocalDate dataFim,
            Pageable pageable) {

        Page<AplicacaoVacina> aplicacoes = aplicacaoVacinaRepository
            .buscarComFiltros(pacienteId, vacinaId, unidadeId, dataInicio, dataFim, null, pageable);

        return aplicacoes.map(mapper::toDTO);
    }

    @Transactional
    public void marcarComoExportadoRnds(Long aplicacaoId) {
        AplicacaoVacina aplicacao = aplicacaoVacinaRepository.findById(aplicacaoId)
            .orElseThrow(() -> new BusinessException("Aplicação não encontrada"));

        aplicacao.setExportadoRnds(true);
        aplicacao.setDataExportacaoRnds(LocalDateTime.now());
        aplicacaoVacinaRepository.save(aplicacao);

        log.info("📤 Aplicação {} marcada como exportada para RNDS", aplicacaoId);
    }

    @Transactional
    public void marcarComoExportadoEsus(Long aplicacaoId) {
        AplicacaoVacina aplicacao = aplicacaoVacinaRepository.findById(aplicacaoId)
            .orElseThrow(() -> new BusinessException("Aplicação não encontrada"));

        aplicacao.setExportadoEsus(true);
        aplicacao.setDataExportacaoEsus(LocalDateTime.now());
        aplicacaoVacinaRepository.save(aplicacao);

        log.info("📤 Aplicação {} marcada como exportada para e-SUS", aplicacaoId);
    }

    // ============= MÉTODOS AUXILIARES =============

    private void validarDadosAplicacao(AplicacaoVacinaDTO dto) {
        if (dto.getDataAplicacao().isAfter(LocalDate.now())) {
            throw new BusinessException("Data de aplicação não pode ser futura");
        }

        if (dto.getDataValidade() != null && dto.getDataValidade().isBefore(dto.getDataAplicacao())) {
            throw new BusinessException("Data de validade da vacina não pode ser anterior à data de aplicação");
        }
    }

    private Paciente buscarPaciente(Long id) {
        return pacienteRepository.findById(id)
            .orElseThrow(() -> new BusinessException("Paciente não encontrado"));
    }

    private Vacina buscarVacina(Long id) {
        Vacina vacina = vacinaRepository.findById(id)
            .orElseThrow(() -> new BusinessException("Vacina não encontrada"));

        if (!vacina.getAtiva()) {
            throw new BusinessException("Vacina não está ativa");
        }

        return vacina;
    }

    private UnidadeSaude buscarUnidade(Long id) {
        return unidadeSaudeRepository.findById(id)
            .orElseThrow(() -> new BusinessException("Unidade de saúde não encontrada"));
    }

    private Profissional buscarProfissional(Long id) {
        return profissionalRepository.findById(id)
            .orElseThrow(() -> new BusinessException("Profissional não encontrado"));
    }

    private Operador getOperadorLogado() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return operadorRepository.findByLogin(username)
            .orElseThrow(() -> new BusinessException("Operador não encontrado"));
    }
}