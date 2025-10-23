package com.sistemadesaude.backend.assistenciasocial.service;

import com.sistemadesaude.backend.operador.entity.Operador;
import com.sistemadesaude.backend.paciente.entity.Paciente;
import com.sistemadesaude.backend.assistenciasocial.entity.Encaminhamento;
import com.sistemadesaude.backend.assistenciasocial.entity.Familia;
import com.sistemadesaude.backend.assistenciasocial.entity.OrgaoRedeAssistencial;
import com.sistemadesaude.backend.assistenciasocial.entity.TipoEncaminhamento;
import com.sistemadesaude.backend.assistenciasocial.entity.UnidadeAssistencial;
import com.sistemadesaude.backend.assistenciasocial.repository.EncaminhamentoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Optional;

/**
 * Serviço para gerenciar os encaminhamentos no módulo de Assistência Social.
 */
@Service
public class EncaminhamentoService {

    private final EncaminhamentoRepository encaminhamentoRepository;

    @Autowired
    public EncaminhamentoService(EncaminhamentoRepository encaminhamentoRepository) {
        this.encaminhamentoRepository = encaminhamentoRepository;
    }

    /**
     * Busca todos os encaminhamentos.
     * @param pageable Informações de paginação.
     * @return Página de encaminhamentos.
     */
    @Transactional(readOnly = true)
    public Page<Encaminhamento> buscarTodos(Pageable pageable) {
        return encaminhamentoRepository.findAll(pageable);
    }

    /**
     * Busca um encaminhamento pelo ID.
     * @param id ID do encaminhamento.
     * @return O encaminhamento encontrado.
     */
    @Transactional(readOnly = true)
    public Optional<Encaminhamento> buscarPorId(Long id) {
        return encaminhamentoRepository.findById(id);
    }

    /**
     * Busca encaminhamentos por unidade assistencial.
     * @param unidade A unidade assistencial.
     * @param pageable Paginação.
     * @return Os encaminhamentos encontrados.
     */
    @Transactional(readOnly = true)
    public Page<Encaminhamento> buscarPorUnidade(UnidadeAssistencial unidade, Pageable pageable) {
        return encaminhamentoRepository.findByUnidade(unidade, pageable);
    }

    /**
     * Busca encaminhamentos por paciente.
     * @param paciente O paciente.
     * @param pageable Paginação.
     * @return Os encaminhamentos encontrados.
     */
    @Transactional(readOnly = true)
    public Page<Encaminhamento> buscarPorPaciente(Paciente paciente, Pageable pageable) {
        return encaminhamentoRepository.findByPaciente(paciente, pageable);
    }

    /**
     * Busca encaminhamentos por família.
     * @param familia A família.
     * @param pageable Paginação.
     * @return Os encaminhamentos encontrados.
     */
    @Transactional(readOnly = true)
    public Page<Encaminhamento> buscarPorFamilia(Familia familia, Pageable pageable) {
        return encaminhamentoRepository.findByFamilia(familia, pageable);
    }

    /**
     * Busca encaminhamentos por profissional.
     * @param profissional O profissional.
     * @param pageable Paginação.
     * @return Os encaminhamentos encontrados.
     */
    @Transactional(readOnly = true)
    public Page<Encaminhamento> buscarPorProfissional(Operador profissional, Pageable pageable) {
        return encaminhamentoRepository.findByProfissional(profissional, pageable);
    }

    /**
     * Busca encaminhamentos por tipo de encaminhamento.
     * @param tipoEncaminhamento O tipo de encaminhamento.
     * @param pageable Paginação.
     * @return Os encaminhamentos encontrados.
     */
    @Transactional(readOnly = true)
    public Page<Encaminhamento> buscarPorTipoEncaminhamento(TipoEncaminhamento tipoEncaminhamento, Pageable pageable) {
        return encaminhamentoRepository.findByTipoEncaminhamento(tipoEncaminhamento, pageable);
    }

    /**
     * Busca encaminhamentos por destino.
     * @param destino O destino do encaminhamento.
     * @param pageable Paginação.
     * @return Os encaminhamentos encontrados.
     */
    @Transactional(readOnly = true)
    public Page<Encaminhamento> buscarPorDestino(OrgaoRedeAssistencial destino, Pageable pageable) {
        return encaminhamentoRepository.findByDestino(destino, pageable);
    }

    /**
     * Busca encaminhamentos por período.
     * @param dataInicio A data de início do período.
     * @param dataFim A data de fim do período.
     * @param pageable Paginação.
     * @return Os encaminhamentos encontrados.
     */
    @Transactional(readOnly = true)
    public Page<Encaminhamento> buscarPorPeriodo(LocalDate dataInicio, LocalDate dataFim, Pageable pageable) {
        return encaminhamentoRepository.findByDataEncaminhamentoBetween(dataInicio, dataFim, pageable);
    }

    /**
     * Busca encaminhamentos pendentes de contra-referência.
     * @param dataLimite Data limite para considerar um encaminhamento como pendente.
     * @param pageable Paginação.
     * @return Os encaminhamentos encontrados.
     */
    @Transactional(readOnly = true)
    public Page<Encaminhamento> buscarPendentes(LocalDate dataLimite, Pageable pageable) {
        return encaminhamentoRepository.findByDataContrareferenciaNullAndDataEncaminhamentoLessThanEqual(dataLimite, pageable);
    }

    /**
     * Conta o número de encaminhamentos por unidade assistencial e período.
     * @param unidade A unidade assistencial.
     * @param dataInicio A data de início do período.
     * @param dataFim A data de fim do período.
     * @return O número de encaminhamentos.
     */
    @Transactional(readOnly = true)
    public long contarPorUnidadeEPeriodo(UnidadeAssistencial unidade, LocalDate dataInicio, LocalDate dataFim) {
        return encaminhamentoRepository.countByUnidadeAndDataEncaminhamentoBetween(unidade, dataInicio, dataFim);
    }

    /**
     * Conta o número de encaminhamentos por tipo de encaminhamento e período.
     * @param tipoEncaminhamento O tipo de encaminhamento.
     * @param dataInicio A data de início do período.
     * @param dataFim A data de fim do período.
     * @return O número de encaminhamentos.
     */
    @Transactional(readOnly = true)
    public long contarPorTipoEPeriodo(TipoEncaminhamento tipoEncaminhamento, LocalDate dataInicio, LocalDate dataFim) {
        return encaminhamentoRepository.countByTipoEncaminhamentoAndDataEncaminhamentoBetween(tipoEncaminhamento, dataInicio, dataFim);
    }

    /**
     * Salva um encaminhamento.
     * @param encaminhamento O encaminhamento a ser salvo.
     * @param usuarioCadastro O usuário que está realizando o cadastro.
     * @return O encaminhamento salvo.
     */
    @Transactional
    public Encaminhamento salvar(Encaminhamento encaminhamento, String usuarioCadastro) {
        boolean isNovo = encaminhamento.getId() == null;
        
        if (isNovo) {
            encaminhamento.setDataCadastro(LocalDateTime.now());
            encaminhamento.setUsuarioCadastro(usuarioCadastro);
        }
        
        encaminhamento.setDataAtualizacao(LocalDateTime.now());
        encaminhamento.setUsuarioAtualizacao(usuarioCadastro);
        
        return encaminhamentoRepository.save(encaminhamento);
    }

    /**
     * Registra a contra-referência de um encaminhamento.
     * @param id ID do encaminhamento.
     * @param dataContrareferencia Data da contra-referência.
     * @param profissionalContrareferencia Profissional que atendeu o encaminhamento.
     * @param telefoneContrareferencia Telefone de contato do profissional.
     * @param anotacoesContrareferencia Anotações da contra-referência.
     * @param usuarioAtualizacao O usuário que está realizando a atualização.
     * @return O encaminhamento atualizado.
     */
    @Transactional
    public Encaminhamento registrarContrareferencia(
            Long id, 
            LocalDate dataContrareferencia, 
            String profissionalContrareferencia, 
            String telefoneContrareferencia, 
            String anotacoesContrareferencia, 
            String usuarioAtualizacao) {
        
        Encaminhamento encaminhamento = encaminhamentoRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Encaminhamento não encontrado"));
        
        // Verifica se já existe contra-referência
        if (encaminhamento.getDataContrareferencia() != null) {
            throw new IllegalStateException("Este encaminhamento já possui contra-referência registrada");
        }
        
        // Valida os dados da contra-referência
        if (dataContrareferencia == null) {
            throw new IllegalArgumentException("A data da contra-referência é obrigatória");
        }
        
        if (profissionalContrareferencia == null || profissionalContrareferencia.trim().isEmpty()) {
            throw new IllegalArgumentException("O profissional da contra-referência é obrigatório");
        }
        
        // Registra a contra-referência
        encaminhamento.setDataContrareferencia(dataContrareferencia);
        encaminhamento.setProfissionalContrareferencia(profissionalContrareferencia);
        encaminhamento.setTelefoneContrareferencia(telefoneContrareferencia);
        encaminhamento.setAnotacoesContrareferencia(anotacoesContrareferencia);
        encaminhamento.setDataAtualizacao(LocalDateTime.now());
        encaminhamento.setUsuarioAtualizacao(usuarioAtualizacao);
        
        return encaminhamentoRepository.save(encaminhamento);
    }
}
