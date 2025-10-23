package com.sistemadesaude.backend.assistenciasocial.service;

import com.sistemadesaude.backend.paciente.entity.Paciente;
import com.sistemadesaude.backend.assistenciasocial.entity.Familia;
import com.sistemadesaude.backend.assistenciasocial.entity.MembroFamilia;
import com.sistemadesaude.backend.assistenciasocial.repository.FamiliaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Optional;

/**
 * Serviço para gerenciar as famílias no módulo de Assistência Social.
 */
@Service
public class FamiliaService {

    private final FamiliaRepository familiaRepository;

    @Autowired
    public FamiliaService(FamiliaRepository familiaRepository) {
        this.familiaRepository = familiaRepository;
    }

    /**
     * Busca todas as famílias cadastradas.
     * @param pageable Paginação.
     * @return As famílias encontradas.
     */
    @Transactional(readOnly = true)
    public Page<Familia> buscarTodas(Pageable pageable) {
        return familiaRepository.findAll(pageable);
    }

    /**
     * Busca uma família pelo ID.
     * @param id O ID da família.
     * @return A família encontrada.
     */
    @Transactional(readOnly = true)
    public Optional<Familia> buscarPorId(Long id) {
        return familiaRepository.findById(id);
    }

    /**
     * Busca uma família pelo código familiar.
     * @param codigoFamiliar O código familiar.
     * @return A família encontrada.
     */
    @Transactional(readOnly = true)
    public Optional<Familia> buscarPorCodigoFamiliar(String codigoFamiliar) {
        return familiaRepository.findByCodigoFamiliar(codigoFamiliar);
    }

    /**
     * Busca uma família pelo responsável.
     * @param responsavel O responsável pela família.
     * @return A família encontrada.
     */
    @Transactional(readOnly = true)
    public Optional<Familia> buscarPorResponsavel(Paciente responsavel) {
        return familiaRepository.findByResponsavel(responsavel);
    }

    /**
     * Busca famílias pelo bairro.
     * @param bairro O bairro.
     * @param pageable Paginação.
     * @return As famílias encontradas.
     */
    @Transactional(readOnly = true)
    public Page<Familia> buscarPorBairro(String bairro, Pageable pageable) {
        return familiaRepository.findByBairro(bairro, pageable);
    }

    /**
     * Busca famílias por faixa de renda per capita.
     * @param rendaPerCapitaMin A renda per capita mínima.
     * @param rendaPerCapitaMax A renda per capita máxima.
     * @param pageable Paginação.
     * @return As famílias encontradas.
     */
    @Transactional(readOnly = true)
    public Page<Familia> buscarPorRendaPerCapita(BigDecimal rendaPerCapitaMin, BigDecimal rendaPerCapitaMax, Pageable pageable) {
        return familiaRepository.findByRendaPerCapitaBetween(rendaPerCapitaMin, rendaPerCapitaMax, pageable);
    }

    /**
     * Busca famílias por nome do responsável.
     * @param nome O nome do responsável.
     * @param pageable Paginação.
     * @return As famílias encontradas.
     */
    @Transactional(readOnly = true)
    public Page<Familia> buscarPorNomeResponsavel(String nome, Pageable pageable) {
        return familiaRepository.findByResponsavelNomeContainingIgnoreCase(nome, pageable);
    }

    /**
     * Busca famílias por tipo de família.
     * @param tipoFamilia O tipo de família.
     * @param pageable Paginação.
     * @return As famílias encontradas.
     */
    @Transactional(readOnly = true)
    public Page<Familia> buscarPorTipoFamilia(Familia.TipoFamilia tipoFamilia, Pageable pageable) {
        return familiaRepository.findByTipoFamilia(tipoFamilia, pageable);
    }

    /**
     * Salva uma família.
     * @param familia A família a ser salva.
     * @param usuarioCadastro O usuário que está realizando o cadastro.
     * @return A família salva.
     */
    @Transactional
    public Familia salvar(Familia familia, String usuarioCadastro) {
        boolean isNovo = familia.getId() == null;
        
        if (isNovo) {
            familia.setDataCadastro(LocalDateTime.now());
            familia.setUsuarioCadastro(usuarioCadastro);
        }
        
        familia.setDataAtualizacao(LocalDateTime.now());
        familia.setUsuarioAtualizacao(usuarioCadastro);
        
        return familiaRepository.save(familia);
    }

    /**
     * Adiciona um membro à família.
     * @param familia A família.
     * @param paciente O paciente a ser adicionado como membro.
     * @param parentesco O parentesco do membro com o responsável pela família.
     * @param usuarioCadastro O usuário que está realizando o cadastro.
     * @return A família atualizada.
     */
    @Transactional
    public Familia adicionarMembro(Familia familia, Paciente paciente, String parentesco, String usuarioCadastro) {
        // Verifica se o paciente já é membro da família
        boolean jaMembro = familia.getMembros().stream()
                .anyMatch(m -> m.getPaciente().getId().equals(paciente.getId()) && m.getDataSaida() == null);
        
        if (jaMembro) {
            throw new IllegalArgumentException("O paciente já é membro da família.");
        }
        
        MembroFamilia membro = new MembroFamilia();
        membro.setFamilia(familia);
        membro.setPaciente(paciente);
        membro.setParentesco(parentesco);
        membro.setDataEntrada(LocalDateTime.now());
        membro.setResponsavelFamilia(false);
        membro.setDataCadastro(LocalDateTime.now());
        membro.setUsuarioCadastro(usuarioCadastro);
        
        familia.getMembros().add(membro);
        
        return familiaRepository.save(familia);
    }

    /**
     * Remove um membro da família.
     * @param familia A família.
     * @param paciente O paciente a ser removido.
     * @param motivoSaida O motivo da saída do membro.
     * @param usuarioAtualizacao O usuário que está realizando a atualização.
     * @return A família atualizada.
     */
    @Transactional
    public Familia removerMembro(Familia familia, Paciente paciente, String motivoSaida, String usuarioAtualizacao) {
        // Verifica se o paciente é o responsável pela família
        if (familia.getResponsavel().getId().equals(paciente.getId())) {
            throw new IllegalArgumentException("Não é possível remover o responsável pela família. Utilize a função de troca de responsável.");
        }
        
        // Busca o membro ativo na família
        Optional<MembroFamilia> membroOpt = familia.getMembros().stream()
                .filter(m -> m.getPaciente().getId().equals(paciente.getId()) && m.getDataSaida() == null)
                .findFirst();
        
        if (membroOpt.isEmpty()) {
            throw new IllegalArgumentException("O paciente não é membro ativo da família.");
        }
        
        MembroFamilia membro = membroOpt.get();
        membro.setDataSaida(LocalDateTime.now());
        membro.setMotivoSaida(motivoSaida);
        membro.setDataAtualizacao(LocalDateTime.now());
        membro.setUsuarioAtualizacao(usuarioAtualizacao);
        
        return familiaRepository.save(familia);
    }

    /**
     * Troca o responsável pela família.
     * @param familia A família.
     * @param novoResponsavel O novo responsável pela família.
     * @param usuarioAtualizacao O usuário que está realizando a atualização.
     * @return A família atualizada.
     */
    @Transactional
    public Familia trocarResponsavel(Familia familia, Paciente novoResponsavel, String usuarioAtualizacao) {
        // Verifica se o novo responsável é membro da família
        boolean isMembro = familia.getMembros().stream()
                .anyMatch(m -> m.getPaciente().getId().equals(novoResponsavel.getId()) && m.getDataSaida() == null);
        
        if (!isMembro) {
            throw new IllegalArgumentException("O novo responsável deve ser membro da família.");
        }
        
        // Atualiza o responsável anterior
        familia.getMembros().stream()
                .filter(m -> m.getPaciente().getId().equals(familia.getResponsavel().getId()) && m.getDataSaida() == null)
                .findFirst()
                .ifPresent(m -> {
                    m.setResponsavelFamilia(false);
                    m.setDataAtualizacao(LocalDateTime.now());
                    m.setUsuarioAtualizacao(usuarioAtualizacao);
                });
        
        // Atualiza o novo responsável
        familia.getMembros().stream()
                .filter(m -> m.getPaciente().getId().equals(novoResponsavel.getId()) && m.getDataSaida() == null)
                .findFirst()
                .ifPresent(m -> {
                    m.setResponsavelFamilia(true);
                    m.setDataAtualizacao(LocalDateTime.now());
                    m.setUsuarioAtualizacao(usuarioAtualizacao);
                });
        
        // Atualiza o responsável na família
        familia.setResponsavel(novoResponsavel);
        familia.setDataAtualizacao(LocalDateTime.now());
        familia.setUsuarioAtualizacao(usuarioAtualizacao);
        
        return familiaRepository.save(familia);
    }

    /**
     * Calcula a renda per capita da família.
     * @param familia A família.
     * @return A renda per capita da família.
     */
    @Transactional(readOnly = true)
    public BigDecimal calcularRendaPerCapita(Familia familia) {
        // Calcula a renda total da família
        BigDecimal rendaTotal = familia.getRendas().stream()
                .map(r -> r.getValor())
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        // Conta o número de membros ativos da família
        long numeroMembros = familia.getMembros().stream()
                .filter(m -> m.getDataSaida() == null)
                .count();
        
        if (numeroMembros == 0) {
            return BigDecimal.ZERO;
        }
        
        // Calcula a renda per capita
        return rendaTotal.divide(new BigDecimal(numeroMembros), 2, BigDecimal.ROUND_HALF_UP);
    }
}
