package com.sistemadesaude.backend.assistenciasocial.service;

import com.sistemadesaude.backend.operador.entity.Operador;
import com.sistemadesaude.backend.paciente.entity.Paciente;
import com.sistemadesaude.backend.assistenciasocial.entity.AtendimentoAssistencial;
import com.sistemadesaude.backend.assistenciasocial.entity.Familia;
import com.sistemadesaude.backend.assistenciasocial.entity.MotivoAtendimento;
import com.sistemadesaude.backend.assistenciasocial.entity.ServicoSocioassistencial;
import com.sistemadesaude.backend.assistenciasocial.entity.UnidadeAssistencial;
import com.sistemadesaude.backend.assistenciasocial.repository.AtendimentoAssistencialRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;

/**
 * Serviço para gerenciar os atendimentos assistenciais no módulo de Assistência Social.
 */
@Service
public class AtendimentoAssistencialService {

    private final AtendimentoAssistencialRepository atendimentoRepository;
    private final ConfiguracaoAssistenciaSocialService configuracaoService;

    @Autowired
    public AtendimentoAssistencialService(
            AtendimentoAssistencialRepository atendimentoRepository,
            ConfiguracaoAssistenciaSocialService configuracaoService) {
        this.atendimentoRepository = atendimentoRepository;
        this.configuracaoService = configuracaoService;
    }

    /**
     * Busca todos os atendimentos assistenciais.
     * @param pageable Informações de paginação.
     * @return Página de atendimentos assistenciais.
     */
    @Transactional(readOnly = true)
    public Page<AtendimentoAssistencial> buscarTodos(Pageable pageable) {
        return atendimentoRepository.findAll(pageable);
    }

    /**
     * Busca um atendimentover assistencial pelo ID.
     * @param id ID do atendimentover assistencial.
     * @return O atendimentover assistencial encontrado.
     */
    @Transactional(readOnly = true)
    public Optional<AtendimentoAssistencial> buscarPorId(Long id) {
        return atendimentoRepository.findById(id);
    }

    /**
     * Busca atendimentos por unidade assistencial.
     * @param unidade A unidade assistencial.
     * @param pageable Paginação.
     * @return Os atendimentos encontrados.
     */
    @Transactional(readOnly = true)
    public Page<AtendimentoAssistencial> buscarPorUnidade(UnidadeAssistencial unidade, Pageable pageable) {
        return atendimentoRepository.findByUnidade(unidade, pageable);
    }

    /**
     * Busca atendimentos por paciente.
     * @param paciente O paciente.
     * @param pageable Paginação.
     * @return Os atendimentos encontrados.
     */
    @Transactional(readOnly = true)
    public Page<AtendimentoAssistencial> buscarPorPaciente(Paciente paciente, Pageable pageable) {
        return atendimentoRepository.findByPaciente(paciente, pageable);
    }

    /**
     * Busca atendimentos por família.
     * @param familia A família.
     * @param pageable Paginação.
     * @return Os atendimentos encontrados.
     */
    @Transactional(readOnly = true)
    public Page<AtendimentoAssistencial> buscarPorFamilia(Familia familia, Pageable pageable) {
        return atendimentoRepository.findByFamilia(familia, pageable);
    }

    /**
     * Busca atendimentos por profissional.
     * @param profissional O profissional.
     * @param pageable Paginação.
     * @return Os atendimentos encontrados.
     */
    @Transactional(readOnly = true)
    public Page<AtendimentoAssistencial> buscarPorProfissional(Operador profissional, Pageable pageable) {
        return atendimentoRepository.findByProfissional(profissional, pageable);
    }

    /**
     * Busca atendimentos por serviço socioassistencial.
     * @param servico O serviço socioassistencial.
     * @param pageable Paginação.
     * @return Os atendimentos encontrados.
     */
    @Transactional(readOnly = true)
    public Page<AtendimentoAssistencial> buscarPorServico(ServicoSocioassistencial servico, Pageable pageable) {
        return atendimentoRepository.findByServico(servico, pageable);
    }

    /**
     * Busca atendimentos por período.
     * @param dataInicio A data de início do período.
     * @param dataFim A data de fim do período.
     * @param pageable Paginação.
     * @return Os atendimentos encontrados.
     */
    @Transactional(readOnly = true)
    public Page<AtendimentoAssistencial> buscarPorPeriodo(LocalDateTime dataInicio, LocalDateTime dataFim, Pageable pageable) {
        return atendimentoRepository.findByDataHoraBetween(dataInicio, dataFim, pageable);
    }

    /**
     * Busca atendimentos por tipo de atendimentover.
     * @param tipoAtendimento O tipo de atendimentover.
     * @param pageable Paginação.
     * @return Os atendimentos encontrados.
     */
    @Transactional(readOnly = true)
    public Page<AtendimentoAssistencial> buscarPorTipoAtendimento(AtendimentoAssistencial.TipoAtendimento tipoAtendimento, Pageable pageable) {
        return atendimentoRepository.findByTipoAtendimento(tipoAtendimento, pageable);
    }

    /**
     * Busca atendimentos por unidade assistencial e período.
     * @param unidade A unidade assistencial.
     * @param dataInicio A data de início do período.
     * @param dataFim A data de fim do período.
     * @param pageable Paginação.
     * @return Os atendimentos encontrados.
     */
    @Transactional(readOnly = true)
    public Page<AtendimentoAssistencial> buscarPorUnidadeEPeriodo(UnidadeAssistencial unidade, LocalDateTime dataInicio, LocalDateTime dataFim, Pageable pageable) {
        return atendimentoRepository.findByUnidadeAndDataHoraBetween(unidade, dataInicio, dataFim, pageable);
    }

    /**
     * Conta o número de atendimentos por unidade assistencial e período.
     * @param unidade A unidade assistencial.
     * @param dataInicio A data de início do período.
     * @param dataFim A data de fim do período.
     * @return O número de atendimentos.
     */
    @Transactional(readOnly = true)
    public long contarPorUnidadeEPeriodo(UnidadeAssistencial unidade, LocalDateTime dataInicio, LocalDateTime dataFim) {
        return atendimentoRepository.countByUnidadeAndDataHoraBetween(unidade, dataInicio, dataFim);
    }

    /**
     * Salva um atendimentover assistencial.
     * @param atendimento Atendimento assistencial a ser salvo.
     * @param usuarioCadastro O usuário que está realizando o cadastro.
     * @return O atendimentover assistencial salvo.
     */
    @Transactional
    public AtendimentoAssistencial salvar(AtendimentoAssistencial atendimento, String usuarioCadastro) {
        boolean isNovo = atendimento.getId() == null;
        
        // Validações específicas para cada tipo de atendimentover
        validarAtendimento(atendimento);
        
        if (isNovo) {
            atendimento.setDataCadastro(LocalDateTime.now());
            atendimento.setUsuarioCadastro(usuarioCadastro);
        } else {
            // Verifica se o tempo para alteração do atendimentover individual já expirou
            if (atendimento.getTipoAtendimento() == AtendimentoAssistencial.TipoAtendimento.INDIVIDUAL) {
                AtendimentoAssistencial atendimentoExistente = atendimentoRepository.findById(atendimento.getId())
                        .orElseThrow(() -> new IllegalArgumentException("Atendimento não encontrado."));
                
                LocalDateTime dataLimiteAlteracao = atendimentoExistente.getDataCadastro().plusHours(
                        configuracaoService.getConfiguracao().getTempoAlteracaoAtendimentoIndividual());
                
                if (LocalDateTime.now().isAfter(dataLimiteAlteracao)) {
                    throw new IllegalStateException("O prazo para alteração deste atendimentover individual já expirou.");
                }
            }
        }
        
        atendimento.setDataAtualizacao(LocalDateTime.now());
        atendimento.setUsuarioAtualizacao(usuarioCadastro);
        
        return atendimentoRepository.save(atendimento);
    }

    /**
     * Adiciona um paciente ao atendimentover.
     * @param atendimentoId ID do atendimentover.
     * @param paciente Paciente a ser adicionado.
     * @param usuarioAtualizacao O usuário que está realizando a atualização.
     * @return O atendimentover atualizado.
     */
    @Transactional
    public AtendimentoAssistencial adicionarPaciente(Long atendimentoId, Paciente paciente, String usuarioAtualizacao) {
        AtendimentoAssistencial atendimento = atendimentoRepository.findById(atendimentoId)
                .orElseThrow(() -> new IllegalArgumentException("Atendimento não encontrado."));
        
        // Verifica se o paciente já está no atendimentover
        boolean pacienteJaAdicionado = atendimento.getPacientes().stream()
                .anyMatch(p -> p.getId().equals(paciente.getId()));
        
        if (pacienteJaAdicionado) {
            throw new IllegalArgumentException("O paciente já está incluído neste atendimentover.");
        }
        
        // Verifica se o atendimentover é do tipo INDIVIDUAL e já possui um paciente
        if (atendimento.getTipoAtendimento() == AtendimentoAssistencial.TipoAtendimento.INDIVIDUAL 
                && !atendimento.getPacientes().isEmpty()) {
            throw new IllegalArgumentException("Atendimentos individuais só podem ter um paciente.");
        }
        
        // Verifica se o atendimentover é do tipo FAMILIAR e o paciente não pertence à família
        if (atendimento.getTipoAtendimento() == AtendimentoAssistencial.TipoAtendimento.FAMILIAR 
                && atendimento.getFamilia() != null) {
            // Aqui seria necessário verificar se o paciente pertence à família
            // Esta verificação depende da implementação específica do relacionamento entre Paciente e Familia
        }
        
        // Verifica se o atendimentover é do tipo COLETIVO e está configurado para aceitar apenas membros da família
        if (atendimento.getTipoAtendimento() == AtendimentoAssistencial.TipoAtendimento.COLETIVO 
                && configuracaoService.getConfiguracao().getSomenteIntegrantesFamiliaAtendimentoColetivo()
                && atendimento.getFamilia() != null) {
            // Aqui seria necessário verificar se o paciente pertence à família
            // Esta verificação depende da implementação específica do relacionamento entre Paciente e Familia
        }
        
        atendimento.getPacientes().add(paciente);
        atendimento.setDataAtualizacao(LocalDateTime.now());
        atendimento.setUsuarioAtualizacao(usuarioAtualizacao);
        
        return atendimentoRepository.save(atendimento);
    }

    /**
     * Adiciona um profissional ao atendimentover.
     * @param atendimentoId ID do atendimentover.
     * @param profissional Profissional a ser adicionado.
     * @param usuarioAtualizacao O usuário que está realizando a atualização.
     * @return O atendimentover atualizado.
     */
    @Transactional
    public AtendimentoAssistencial adicionarProfissional(Long atendimentoId, Operador profissional, String usuarioAtualizacao) {
        AtendimentoAssistencial atendimento = atendimentoRepository.findById(atendimentoId)
                .orElseThrow(() -> new IllegalArgumentException("Atendimento não encontrado."));
        
        // Verifica se o profissional já está no atendimentover
        boolean profissionalJaAdicionado = atendimento.getProfissionais().stream()
                .anyMatch(p -> p.getId().equals(profissional.getId()));
        
        if (profissionalJaAdicionado) {
            throw new IllegalArgumentException("O profissional já está incluído neste atendimentover.");
        }
        
        atendimento.getProfissionais().add(profissional);
        atendimento.setDataAtualizacao(LocalDateTime.now());
        atendimento.setUsuarioAtualizacao(usuarioAtualizacao);
        
        return atendimentoRepository.save(atendimento);
    }

    /**
     * Adiciona um motivo ao atendimentover.
     * @param atendimentoId ID do atendimentover.
     * @param motivo Motivo a ser adicionado.
     * @param usuarioAtualizacao O usuário que está realizando a atualização.
     * @return O atendimentover atualizado.
     */
    @Transactional
    public AtendimentoAssistencial adicionarMotivo(Long atendimentoId, MotivoAtendimento motivo, String usuarioAtualizacao) {
        AtendimentoAssistencial atendimento = atendimentoRepository.findById(atendimentoId)
                .orElseThrow(() -> new IllegalArgumentException("Atendimento não encontrado."));
        
        // Verifica se o motivo já está no atendimentover
        boolean motivoJaAdicionado = atendimento.getMotivos().stream()
                .anyMatch(m -> m.getId().equals(motivo.getId()));
        
        if (motivoJaAdicionado) {
            throw new IllegalArgumentException("O motivo já está incluído neste atendimentover.");
        }
        
        atendimento.getMotivos().add(motivo);
        atendimento.setDataAtualizacao(LocalDateTime.now());
        atendimento.setUsuarioAtualizacao(usuarioAtualizacao);
        
        return atendimentoRepository.save(atendimento);
    }

    /**
     * Valida um atendimentover assistencial de acordo com seu tipo.
     * @param atendimento Atendimento a ser validado.
     */
    private void validarAtendimento(AtendimentoAssistencial atendimento) {
        // Validações comuns a todos os tipos de atendimentover
        if (atendimento.getUnidade() == null) {
            throw new IllegalArgumentException("A unidade assistencial é obrigatória.");
        }
        
        if (atendimento.getDataHora() == null) {
            throw new IllegalArgumentException("A data e hora do atendimentover são obrigatórias.");
        }
        
        if (atendimento.getProfissionais() == null || atendimento.getProfissionais().isEmpty()) {
            throw new IllegalArgumentException("Pelo menos um profissional deve ser informado.");
        }
        
        // Validações específicas por tipo de atendimentover
        switch (atendimento.getTipoAtendimento()) {
            case INDIVIDUAL:
                if (atendimento.getPacientes() == null || atendimento.getPacientes().size() != 1) {
                    throw new IllegalArgumentException("Atendimentos individuais devem ter exatamente um paciente.");
                }
                break;
                
            case FAMILIAR:
                if (atendimento.getFamilia() == null) {
                    throw new IllegalArgumentException("A família é obrigatória para atendimentos familiares.");
                }
                break;
                
            case GRUPO:
                if (atendimento.getGrupo() == null) {
                    throw new IllegalArgumentException("O grupo é obrigatório para atendimentos de grupo.");
                }
                break;
                
            case COLETIVO:
                if (atendimento.getPacientes() == null || atendimento.getPacientes().isEmpty()) {
                    throw new IllegalArgumentException("Atendimentos coletivos devem ter pelo menos um paciente.");
                }
                break;
        }
    }
}
