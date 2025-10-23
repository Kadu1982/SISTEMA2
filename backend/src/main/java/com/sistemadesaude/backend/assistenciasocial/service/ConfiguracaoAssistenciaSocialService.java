package com.sistemadesaude.backend.assistenciasocial.service;

import com.sistemadesaude.backend.assistenciasocial.entity.ConfiguracaoAssistenciaSocial;
import com.sistemadesaude.backend.assistenciasocial.entity.TipoVulnerabilidade;
import com.sistemadesaude.backend.assistenciasocial.entity.UnidadeAssistencial;
import com.sistemadesaude.backend.assistenciasocial.entity.VinculoUnidadeVulnerabilidade;
import com.sistemadesaude.backend.assistenciasocial.repository.ConfiguracaoAssistenciaSocialRepository;
import com.sistemadesaude.backend.assistenciasocial.repository.VinculoUnidadeVulnerabilidadeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

/**
 * Serviço para gerenciar as configurações do módulo de Assistência Social.
 */
@Service
public class ConfiguracaoAssistenciaSocialService {

    private final ConfiguracaoAssistenciaSocialRepository configuracaoRepository;
    private final VinculoUnidadeVulnerabilidadeRepository vinculoRepository;

    @Autowired
    public ConfiguracaoAssistenciaSocialService(
            ConfiguracaoAssistenciaSocialRepository configuracaoRepository,
            VinculoUnidadeVulnerabilidadeRepository vinculoRepository) {
        this.configuracaoRepository = configuracaoRepository;
        this.vinculoRepository = vinculoRepository;
    }

    /**
     * Busca a configuração atual do módulo de Assistência Social.
     * Se não existir nenhuma configuração, cria uma configuração padrão.
     * @return A configuração atual.
     */
    @Transactional(readOnly = true)
    public ConfiguracaoAssistenciaSocial getConfiguracao() {
        ConfiguracaoAssistenciaSocial configuracao = configuracaoRepository.findTopByOrderByDataAtualizacaoDesc();
        if (configuracao == null) {
            configuracao = criarConfiguracaoPadrao();
        }
        return configuracao;
    }

    /**
     * Salva uma nova configuração do módulo de Assistência Social.
     * @param configuracao A configuração a ser salva.
     * @param usuarioAtualizacao O usuário que está realizando a atualização.
     * @return A configuração salva.
     */
    @Transactional
    public ConfiguracaoAssistenciaSocial salvarConfiguracao(ConfiguracaoAssistenciaSocial configuracao, String usuarioAtualizacao) {
        configuracao.setDataAtualizacao(LocalDateTime.now());
        configuracao.setUsuarioAtualizacao(usuarioAtualizacao);
        return configuracaoRepository.save(configuracao);
    }

    /**
     * Atualiza o valor do salário mínimo.
     * @param valorSalarioMinimo O novo valor do salário mínimo.
     * @param usuarioAtualizacao O usuário que está realizando a atualização.
     * @return A configuração atualizada.
     */
    @Transactional
    public ConfiguracaoAssistenciaSocial atualizarValorSalarioMinimo(BigDecimal valorSalarioMinimo, String usuarioAtualizacao) {
        ConfiguracaoAssistenciaSocial configuracao = getConfiguracao();
        configuracao.setValorSalarioMinimo(valorSalarioMinimo);
        return salvarConfiguracao(configuracao, usuarioAtualizacao);
    }

    /**
     * Atualiza o valor da linha de pobreza.
     * @param valorLinhaPobreza O novo valor da linha de pobreza.
     * @param usuarioAtualizacao O usuário que está realizando a atualização.
     * @return A configuração atualizada.
     */
    @Transactional
    public ConfiguracaoAssistenciaSocial atualizarValorLinhaPobreza(BigDecimal valorLinhaPobreza, String usuarioAtualizacao) {
        ConfiguracaoAssistenciaSocial configuracao = getConfiguracao();
        configuracao.setValorLinhaPobreza(valorLinhaPobreza);
        return salvarConfiguracao(configuracao, usuarioAtualizacao);
    }

    /**
     * Atualiza o valor da linha de extrema pobreza.
     * @param valorLinhaExtremaPobreza O novo valor da linha de extrema pobreza.
     * @param usuarioAtualizacao O usuário que está realizando a atualização.
     * @return A configuração atualizada.
     */
    @Transactional
    public ConfiguracaoAssistenciaSocial atualizarValorLinhaExtremaPobreza(BigDecimal valorLinhaExtremaPobreza, String usuarioAtualizacao) {
        ConfiguracaoAssistenciaSocial configuracao = getConfiguracao();
        configuracao.setValorLinhaExtremaPobreza(valorLinhaExtremaPobreza);
        return salvarConfiguracao(configuracao, usuarioAtualizacao);
    }

    /**
     * Atualiza o valor do benefício para o Programa Família Acolhedora.
     * @param valorBeneficioFamiliaAcolhedora O novo valor do benefício.
     * @param usuarioAtualizacao O usuário que está realizando a atualização.
     * @return A configuração atualizada.
     */
    @Transactional
    public ConfiguracaoAssistenciaSocial atualizarValorBeneficioFamiliaAcolhedora(BigDecimal valorBeneficioFamiliaAcolhedora, String usuarioAtualizacao) {
        ConfiguracaoAssistenciaSocial configuracao = getConfiguracao();
        configuracao.setValorBeneficioFamiliaAcolhedora(valorBeneficioFamiliaAcolhedora);
        return salvarConfiguracao(configuracao, usuarioAtualizacao);
    }

    /**
     * Atualiza o valor do benefício para o Programa Família Acolhedora para pessoas com necessidades especiais.
     * @param valorBeneficioFamiliaAcolhedoraEspecial O novo valor do benefício.
     * @param usuarioAtualizacao O usuário que está realizando a atualização.
     * @return A configuração atualizada.
     */
    @Transactional
    public ConfiguracaoAssistenciaSocial atualizarValorBeneficioFamiliaAcolhedoraEspecial(BigDecimal valorBeneficioFamiliaAcolhedoraEspecial, String usuarioAtualizacao) {
        ConfiguracaoAssistenciaSocial configuracao = getConfiguracao();
        configuracao.setValorBeneficioFamiliaAcolhedoraEspecial(valorBeneficioFamiliaAcolhedoraEspecial);
        return salvarConfiguracao(configuracao, usuarioAtualizacao);
    }

    /**
     * Atualiza a configuração de profissionais para indicadores RMA.
     * @param profissionaisIndicadoresRma O novo valor da configuração.
     * @param usuarioAtualizacao O usuário que está realizando a atualização.
     * @return A configuração atualizada.
     */
    @Transactional
    public ConfiguracaoAssistenciaSocial atualizarProfissionaisIndicadoresRma(Boolean profissionaisIndicadoresRma, String usuarioAtualizacao) {
        ConfiguracaoAssistenciaSocial configuracao = getConfiguracao();
        configuracao.setProfissionaisIndicadoresRma(profissionaisIndicadoresRma);
        return salvarConfiguracao(configuracao, usuarioAtualizacao);
    }

    /**
     * Atualiza a configuração de controle separado de família acolhedora.
     * @param controleSeparadoFamiliaAcolhedora O novo valor da configuração.
     * @param usuarioAtualizacao O usuário que está realizando a atualização.
     * @return A configuração atualizada.
     */
    @Transactional
    public ConfiguracaoAssistenciaSocial atualizarControleSeparadoFamiliaAcolhedora(Boolean controleSeparadoFamiliaAcolhedora, String usuarioAtualizacao) {
        ConfiguracaoAssistenciaSocial configuracao = getConfiguracao();
        configuracao.setControleSeparadoFamiliaAcolhedora(controleSeparadoFamiliaAcolhedora);
        return salvarConfiguracao(configuracao, usuarioAtualizacao);
    }

    /**
     * Atualiza a configuração de evitar unificação ou exclusão de famílias acolhedoras.
     * @param evitarUnificacaoExclusaoFamiliasAcolhedoras O novo valor da configuração.
     * @param usuarioAtualizacao O usuário que está realizando a atualização.
     * @return A configuração atualizada.
     */
    @Transactional
    public ConfiguracaoAssistenciaSocial atualizarEvitarUnificacaoExclusaoFamiliasAcolhedoras(Boolean evitarUnificacaoExclusaoFamiliasAcolhedoras, String usuarioAtualizacao) {
        ConfiguracaoAssistenciaSocial configuracao = getConfiguracao();
        configuracao.setEvitarUnificacaoExclusaoFamiliasAcolhedoras(evitarUnificacaoExclusaoFamiliasAcolhedoras);
        return salvarConfiguracao(configuracao, usuarioAtualizacao);
    }

    /**
     * Atualiza a configuração de portal de solicitação de acesso.
     * @param portalSolicitacaoAcesso O novo valor da configuração.
     * @param usuarioAtualizacao O usuário que está realizando a atualização.
     * @return A configuração atualizada.
     */
    @Transactional
    public ConfiguracaoAssistenciaSocial atualizarPortalSolicitacaoAcesso(Boolean portalSolicitacaoAcesso, String usuarioAtualizacao) {
        ConfiguracaoAssistenciaSocial configuracao = getConfiguracao();
        configuracao.setPortalSolicitacaoAcesso(portalSolicitacaoAcesso);
        return salvarConfiguracao(configuracao, usuarioAtualizacao);
    }

    /**
     * Adiciona um vínculo entre uma unidade assistencial e um tipo de vulnerabilidade.
     * @param unidade A unidade assistencial.
     * @param tipoVulnerabilidade O tipo de vulnerabilidade.
     * @param usuarioCadastro O usuário que está realizando o cadastro.
     * @return O vínculo criado.
     */
    @Transactional
    public VinculoUnidadeVulnerabilidade adicionarVinculoUnidadeVulnerabilidade(
            UnidadeAssistencial unidade, 
            TipoVulnerabilidade tipoVulnerabilidade, 
            String usuarioCadastro) {

        // Verifica se já existe um vínculo para esta unidade e tipo de vulnerabilidade
        if (vinculoRepository.existsByUnidadeAndTipoVulnerabilidade(unidade, tipoVulnerabilidade)) {
            throw new IllegalArgumentException("Já existe um vínculo para esta unidade e tipo de vulnerabilidade.");
        }

        ConfiguracaoAssistenciaSocial configuracao = getConfiguracao();

        VinculoUnidadeVulnerabilidade vinculo = new VinculoUnidadeVulnerabilidade();
        vinculo.setUnidade(unidade);
        vinculo.setTipoVulnerabilidade(tipoVulnerabilidade);
        vinculo.setConfiguracao(configuracao);
        vinculo.setDataCadastro(LocalDateTime.now());
        vinculo.setUsuarioCadastro(usuarioCadastro);

        return vinculoRepository.save(vinculo);
    }

    /**
     * Remove um vínculo entre uma unidade assistencial e um tipo de vulnerabilidade.
     * @param id O ID do vínculo a ser removido.
     */
    @Transactional
    public void removerVinculoUnidadeVulnerabilidade(Long id) {
        if (!vinculoRepository.existsById(id)) {
            throw new IllegalArgumentException("Vínculo não encontrado.");
        }
        vinculoRepository.deleteById(id);
    }

    /**
     * Busca todos os vínculos entre unidades assistenciais e tipos de vulnerabilidades.
     * @return Lista de vínculos.
     */
    @Transactional(readOnly = true)
    public List<VinculoUnidadeVulnerabilidade> buscarTodosVinculosUnidadeVulnerabilidade() {
        ConfiguracaoAssistenciaSocial configuracao = getConfiguracao();
        return vinculoRepository.findByConfiguracao(configuracao);
    }

    /**
     * Busca todos os vínculos para uma unidade assistencial específica.
     * @param unidade A unidade assistencial.
     * @return Lista de vínculos.
     */
    @Transactional(readOnly = true)
    public List<VinculoUnidadeVulnerabilidade> buscarVinculosPorUnidade(UnidadeAssistencial unidade) {
        return vinculoRepository.findByUnidade(unidade);
    }

    /**
     * Busca todos os vínculos para um tipo de vulnerabilidade específico.
     * @param tipoVulnerabilidade O tipo de vulnerabilidade.
     * @return Lista de vínculos.
     */
    @Transactional(readOnly = true)
    public List<VinculoUnidadeVulnerabilidade> buscarVinculosPorTipoVulnerabilidade(TipoVulnerabilidade tipoVulnerabilidade) {
        return vinculoRepository.findByTipoVulnerabilidade(tipoVulnerabilidade);
    }

    /**
     * Cria uma configuração padrão para o módulo de Assistência Social.
     * @return A configuração padrão.
     */
    private ConfiguracaoAssistenciaSocial criarConfiguracaoPadrao() {
        ConfiguracaoAssistenciaSocial configuracao = new ConfiguracaoAssistenciaSocial();
        configuracao.setTempoAtualizacaoTelas(5); // 5 minutos
        configuracao.setValorSalarioMinimo(new BigDecimal("1320.00")); // Valor do salário mínimo em 2023
        configuracao.setValorLinhaPobreza(new BigDecimal("218.00")); // Valor da linha de pobreza em 2023
        configuracao.setValorLinhaExtremaPobreza(new BigDecimal("109.00")); // Valor da linha de extrema pobreza em 2023
        configuracao.setTempoAtendimentoProfissionais(30); // 30 minutos
        configuracao.setTempoAlteracaoAtendimentoIndividual(24); // 24 horas
        configuracao.setTempoAlteracaoContrareferencia(48); // 48 horas
        configuracao.setTempoAlteracaoDispensacaoBeneficios(24); // 24 horas
        configuracao.setDesligarIntegranteGrupoServico(true);
        configuracao.setAlertarDispensacaoBeneficioDuplicado(true);
        configuracao.setPermitirTransferenciaIntegrantes(false);
        configuracao.setCampoValorBaseObrigatorio(true);
        configuracao.setSomenteIntegrantesFamiliaAtendimentoColetivo(false);
        configuracao.setControleAutomaticoPobreza(true);
        configuracao.setProfissionaisIndicadoresRma(true);
        configuracao.setControleSeparadoFamiliaAcolhedora(true);
        configuracao.setEvitarUnificacaoExclusaoFamiliasAcolhedoras(true);
        configuracao.setPortalSolicitacaoAcesso(false);
        configuracao.setDataAtualizacao(LocalDateTime.now());
        configuracao.setUsuarioAtualizacao("SISTEMA");
        return configuracaoRepository.save(configuracao);
    }
}
