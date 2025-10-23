package com.sistemadesaude.backend.assistenciasocial.service;

import com.sistemadesaude.backend.assistenciasocial.entity.ConfiguracaoAssistenciaSocial;
import com.sistemadesaude.backend.assistenciasocial.entity.TipoVulnerabilidade;
import com.sistemadesaude.backend.assistenciasocial.entity.UnidadeAssistencial;
import com.sistemadesaude.backend.assistenciasocial.entity.VinculoUnidadeVulnerabilidade;
import com.sistemadesaude.backend.assistenciasocial.repository.VinculoUnidadeVulnerabilidadeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * Serviço para gerenciar os vínculos entre unidades assistenciais e tipos de vulnerabilidades.
 */
@Service
public class VinculoUnidadeVulnerabilidadeService {

    private final VinculoUnidadeVulnerabilidadeRepository vinculoRepository;
    private final ConfiguracaoAssistenciaSocialService configuracaoService;

    @Autowired
    public VinculoUnidadeVulnerabilidadeService(
            VinculoUnidadeVulnerabilidadeRepository vinculoRepository,
            ConfiguracaoAssistenciaSocialService configuracaoService) {
        this.vinculoRepository = vinculoRepository;
        this.configuracaoService = configuracaoService;
    }

    /**
     * Busca um vínculo pelo ID.
     * @param id O ID do vínculo.
     * @return O vínculo encontrado ou vazio.
     */
    @Transactional(readOnly = true)
    public Optional<VinculoUnidadeVulnerabilidade> buscarPorId(Long id) {
        return vinculoRepository.findById(id);
    }

    /**
     * Busca todos os vínculos.
     * @return Lista de vínculos.
     */
    @Transactional(readOnly = true)
    public List<VinculoUnidadeVulnerabilidade> buscarTodos() {
        return vinculoRepository.findAll();
    }

    /**
     * Busca todos os vínculos para a configuração atual.
     * @return Lista de vínculos.
     */
    @Transactional(readOnly = true)
    public List<VinculoUnidadeVulnerabilidade> buscarPorConfiguracaoAtual() {
        ConfiguracaoAssistenciaSocial configuracao = configuracaoService.getConfiguracao();
        return vinculoRepository.findByConfiguracao(configuracao);
    }

    /**
     * Busca todos os vínculos para uma unidade assistencial específica.
     * @param unidade A unidade assistencial.
     * @return Lista de vínculos.
     */
    @Transactional(readOnly = true)
    public List<VinculoUnidadeVulnerabilidade> buscarPorUnidade(UnidadeAssistencial unidade) {
        return vinculoRepository.findByUnidade(unidade);
    }

    /**
     * Busca todos os vínculos para um tipo de vulnerabilidade específico.
     * @param tipoVulnerabilidade O tipo de vulnerabilidade.
     * @return Lista de vínculos.
     */
    @Transactional(readOnly = true)
    public List<VinculoUnidadeVulnerabilidade> buscarPorTipoVulnerabilidade(TipoVulnerabilidade tipoVulnerabilidade) {
        return vinculoRepository.findByTipoVulnerabilidade(tipoVulnerabilidade);
    }

    /**
     * Busca um vínculo específico por unidade e tipo de vulnerabilidade.
     * @param unidade A unidade assistencial.
     * @param tipoVulnerabilidade O tipo de vulnerabilidade.
     * @return O vínculo encontrado ou null.
     */
    @Transactional(readOnly = true)
    public VinculoUnidadeVulnerabilidade buscarPorUnidadeETipoVulnerabilidade(
            UnidadeAssistencial unidade, TipoVulnerabilidade tipoVulnerabilidade) {
        return vinculoRepository.findByUnidadeAndTipoVulnerabilidade(unidade, tipoVulnerabilidade);
    }

    /**
     * Verifica se existe um vínculo para a unidade e tipo de vulnerabilidade.
     * @param unidade A unidade assistencial.
     * @param tipoVulnerabilidade O tipo de vulnerabilidade.
     * @return true se existe, false caso contrário.
     */
    @Transactional(readOnly = true)
    public boolean existeVinculoPorUnidadeETipoVulnerabilidade(
            UnidadeAssistencial unidade, TipoVulnerabilidade tipoVulnerabilidade) {
        return vinculoRepository.existsByUnidadeAndTipoVulnerabilidade(unidade, tipoVulnerabilidade);
    }

    /**
     * Cria um novo vínculo entre uma unidade assistencial e um tipo de vulnerabilidade.
     * @param unidade A unidade assistencial.
     * @param tipoVulnerabilidade O tipo de vulnerabilidade.
     * @param usuarioCadastro O usuário que está realizando o cadastro.
     * @return O vínculo criado.
     */
    @Transactional
    public VinculoUnidadeVulnerabilidade criar(
            UnidadeAssistencial unidade, 
            TipoVulnerabilidade tipoVulnerabilidade, 
            String usuarioCadastro) {
        
        // Verifica se já existe um vínculo para esta unidade e tipo de vulnerabilidade
        if (existeVinculoPorUnidadeETipoVulnerabilidade(unidade, tipoVulnerabilidade)) {
            throw new IllegalArgumentException("Já existe um vínculo para esta unidade e tipo de vulnerabilidade.");
        }
        
        ConfiguracaoAssistenciaSocial configuracao = configuracaoService.getConfiguracao();
        
        VinculoUnidadeVulnerabilidade vinculo = new VinculoUnidadeVulnerabilidade();
        vinculo.setUnidade(unidade);
        vinculo.setTipoVulnerabilidade(tipoVulnerabilidade);
        vinculo.setConfiguracao(configuracao);
        vinculo.setDataCadastro(LocalDateTime.now());
        vinculo.setUsuarioCadastro(usuarioCadastro);
        
        return vinculoRepository.save(vinculo);
    }

    /**
     * Atualiza um vínculo existente.
     * @param id O ID do vínculo a ser atualizado.
     * @param unidade A nova unidade assistencial.
     * @param tipoVulnerabilidade O novo tipo de vulnerabilidade.
     * @param usuarioCadastro O usuário que está realizando a atualização.
     * @return O vínculo atualizado.
     */
    @Transactional
    public VinculoUnidadeVulnerabilidade atualizar(
            Long id,
            UnidadeAssistencial unidade, 
            TipoVulnerabilidade tipoVulnerabilidade, 
            String usuarioCadastro) {
        
        VinculoUnidadeVulnerabilidade vinculo = vinculoRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Vínculo não encontrado."));
        
        // Verifica se já existe outro vínculo para esta unidade e tipo de vulnerabilidade
        VinculoUnidadeVulnerabilidade existente = buscarPorUnidadeETipoVulnerabilidade(unidade, tipoVulnerabilidade);
        if (existente != null && !existente.getId().equals(id)) {
            throw new IllegalArgumentException("Já existe um vínculo para esta unidade e tipo de vulnerabilidade.");
        }
        
        vinculo.setUnidade(unidade);
        vinculo.setTipoVulnerabilidade(tipoVulnerabilidade);
        vinculo.setDataCadastro(LocalDateTime.now());
        vinculo.setUsuarioCadastro(usuarioCadastro);
        
        return vinculoRepository.save(vinculo);
    }

    /**
     * Remove um vínculo.
     * @param id O ID do vínculo a ser removido.
     */
    @Transactional
    public void remover(Long id) {
        if (!vinculoRepository.existsById(id)) {
            throw new IllegalArgumentException("Vínculo não encontrado.");
        }
        vinculoRepository.deleteById(id);
    }
}
