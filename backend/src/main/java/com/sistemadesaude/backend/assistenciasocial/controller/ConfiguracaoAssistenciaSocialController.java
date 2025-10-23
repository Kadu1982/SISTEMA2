package com.sistemadesaude.backend.assistenciasocial.controller;

import com.sistemadesaude.backend.assistenciasocial.entity.ConfiguracaoAssistenciaSocial;
import com.sistemadesaude.backend.assistenciasocial.service.ConfiguracaoAssistenciaSocialService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;

/**
 * Controller para gerenciar as configurações do módulo de Assistência Social.
 */
@RestController
@RequestMapping("/api/assistencia-social/configuracoes")
public class ConfiguracaoAssistenciaSocialController {

    private final ConfiguracaoAssistenciaSocialService configuracaoService;

    @Autowired
    public ConfiguracaoAssistenciaSocialController(ConfiguracaoAssistenciaSocialService configuracaoService) {
        this.configuracaoService = configuracaoService;
    }

    /**
     * Obtém a configuração atual do módulo de Assistência Social.
     * @return A configuração atual.
     */
    @GetMapping
    public ResponseEntity<ConfiguracaoAssistenciaSocial> getConfiguracao() {
        return ResponseEntity.ok(configuracaoService.getConfiguracao());
    }

    /**
     * Salva uma nova configuração do módulo de Assistência Social.
     * @param configuracao A configuração a ser salva.
     * @param authentication Informações de autenticação do usuário.
     * @return A configuração salva.
     */
    @PostMapping
    public ResponseEntity<ConfiguracaoAssistenciaSocial> salvarConfiguracao(
            @RequestBody ConfiguracaoAssistenciaSocial configuracao,
            Authentication authentication) {

        String usuarioAtualizacao = authentication.getName();
        ConfiguracaoAssistenciaSocial configuracaoSalva = configuracaoService.salvarConfiguracao(configuracao, usuarioAtualizacao);
        return ResponseEntity.ok(configuracaoSalva);
    }

    /**
     * Atualiza o valor do salário mínimo.
     * @param valorSalarioMinimo O novo valor do salário mínimo.
     * @param authentication Informações de autenticação do usuário.
     * @return A configuração atualizada.
     */
    @PatchMapping("/salario-minimo")
    public ResponseEntity<ConfiguracaoAssistenciaSocial> atualizarValorSalarioMinimo(
            @RequestParam BigDecimal valorSalarioMinimo,
            Authentication authentication) {

        String usuarioAtualizacao = authentication.getName();
        ConfiguracaoAssistenciaSocial configuracaoAtualizada = 
                configuracaoService.atualizarValorSalarioMinimo(valorSalarioMinimo, usuarioAtualizacao);
        return ResponseEntity.ok(configuracaoAtualizada);
    }

    /**
     * Atualiza o valor da linha de pobreza.
     * @param valorLinhaPobreza O novo valor da linha de pobreza.
     * @param authentication Informações de autenticação do usuário.
     * @return A configuração atualizada.
     */
    @PatchMapping("/linha-pobreza")
    public ResponseEntity<ConfiguracaoAssistenciaSocial> atualizarValorLinhaPobreza(
            @RequestParam BigDecimal valorLinhaPobreza,
            Authentication authentication) {

        String usuarioAtualizacao = authentication.getName();
        ConfiguracaoAssistenciaSocial configuracaoAtualizada = 
                configuracaoService.atualizarValorLinhaPobreza(valorLinhaPobreza, usuarioAtualizacao);
        return ResponseEntity.ok(configuracaoAtualizada);
    }

    /**
     * Atualiza o valor da linha de extrema pobreza.
     * @param valorLinhaExtremaPobreza O novo valor da linha de extrema pobreza.
     * @param authentication Informações de autenticação do usuário.
     * @return A configuração atualizada.
     */
    @PatchMapping("/linha-extrema-pobreza")
    public ResponseEntity<ConfiguracaoAssistenciaSocial> atualizarValorLinhaExtremaPobreza(
            @RequestParam BigDecimal valorLinhaExtremaPobreza,
            Authentication authentication) {

        String usuarioAtualizacao = authentication.getName();
        ConfiguracaoAssistenciaSocial configuracaoAtualizada = 
                configuracaoService.atualizarValorLinhaExtremaPobreza(valorLinhaExtremaPobreza, usuarioAtualizacao);
        return ResponseEntity.ok(configuracaoAtualizada);
    }

    /**
     * Atualiza o valor do benefício para o Programa Família Acolhedora.
     * @param valorBeneficioFamiliaAcolhedora O novo valor do benefício.
     * @param authentication Informações de autenticação do usuário.
     * @return A configuração atualizada.
     */
    @PatchMapping("/beneficio-familia-acolhedora")
    public ResponseEntity<ConfiguracaoAssistenciaSocial> atualizarValorBeneficioFamiliaAcolhedora(
            @RequestParam BigDecimal valorBeneficioFamiliaAcolhedora,
            Authentication authentication) {

        String usuarioAtualizacao = authentication.getName();
        ConfiguracaoAssistenciaSocial configuracaoAtualizada = 
                configuracaoService.atualizarValorBeneficioFamiliaAcolhedora(valorBeneficioFamiliaAcolhedora, usuarioAtualizacao);
        return ResponseEntity.ok(configuracaoAtualizada);
    }

    /**
     * Atualiza o valor do benefício para o Programa Família Acolhedora para pessoas com necessidades especiais.
     * @param valorBeneficioFamiliaAcolhedoraEspecial O novo valor do benefício.
     * @param authentication Informações de autenticação do usuário.
     * @return A configuração atualizada.
     */
    @PatchMapping("/beneficio-familia-acolhedora-especial")
    public ResponseEntity<ConfiguracaoAssistenciaSocial> atualizarValorBeneficioFamiliaAcolhedoraEspecial(
            @RequestParam BigDecimal valorBeneficioFamiliaAcolhedoraEspecial,
            Authentication authentication) {

        String usuarioAtualizacao = authentication.getName();
        ConfiguracaoAssistenciaSocial configuracaoAtualizada = 
                configuracaoService.atualizarValorBeneficioFamiliaAcolhedoraEspecial(valorBeneficioFamiliaAcolhedoraEspecial, usuarioAtualizacao);
        return ResponseEntity.ok(configuracaoAtualizada);
    }

    /**
     * Atualiza a configuração de profissionais para indicadores RMA.
     * @param profissionaisIndicadoresRma O novo valor da configuração.
     * @param authentication Informações de autenticação do usuário.
     * @return A configuração atualizada.
     */
    @PatchMapping("/profissionais-indicadores-rma")
    public ResponseEntity<ConfiguracaoAssistenciaSocial> atualizarProfissionaisIndicadoresRma(
            @RequestParam Boolean profissionaisIndicadoresRma,
            Authentication authentication) {

        String usuarioAtualizacao = authentication.getName();
        ConfiguracaoAssistenciaSocial configuracaoAtualizada = 
                configuracaoService.atualizarProfissionaisIndicadoresRma(profissionaisIndicadoresRma, usuarioAtualizacao);
        return ResponseEntity.ok(configuracaoAtualizada);
    }

    /**
     * Atualiza a configuração de controle separado de família acolhedora.
     * @param controleSeparadoFamiliaAcolhedora O novo valor da configuração.
     * @param authentication Informações de autenticação do usuário.
     * @return A configuração atualizada.
     */
    @PatchMapping("/controle-separado-familia-acolhedora")
    public ResponseEntity<ConfiguracaoAssistenciaSocial> atualizarControleSeparadoFamiliaAcolhedora(
            @RequestParam Boolean controleSeparadoFamiliaAcolhedora,
            Authentication authentication) {

        String usuarioAtualizacao = authentication.getName();
        ConfiguracaoAssistenciaSocial configuracaoAtualizada = 
                configuracaoService.atualizarControleSeparadoFamiliaAcolhedora(controleSeparadoFamiliaAcolhedora, usuarioAtualizacao);
        return ResponseEntity.ok(configuracaoAtualizada);
    }

    /**
     * Atualiza a configuração de evitar unificação ou exclusão de famílias acolhedoras.
     * @param evitarUnificacaoExclusaoFamiliasAcolhedoras O novo valor da configuração.
     * @param authentication Informações de autenticação do usuário.
     * @return A configuração atualizada.
     */
    @PatchMapping("/evitar-unificacao-exclusao-familias-acolhedoras")
    public ResponseEntity<ConfiguracaoAssistenciaSocial> atualizarEvitarUnificacaoExclusaoFamiliasAcolhedoras(
            @RequestParam Boolean evitarUnificacaoExclusaoFamiliasAcolhedoras,
            Authentication authentication) {

        String usuarioAtualizacao = authentication.getName();
        ConfiguracaoAssistenciaSocial configuracaoAtualizada = 
                configuracaoService.atualizarEvitarUnificacaoExclusaoFamiliasAcolhedoras(evitarUnificacaoExclusaoFamiliasAcolhedoras, usuarioAtualizacao);
        return ResponseEntity.ok(configuracaoAtualizada);
    }

    /**
     * Atualiza a configuração de portal de solicitação de acesso.
     * @param portalSolicitacaoAcesso O novo valor da configuração.
     * @param authentication Informações de autenticação do usuário.
     * @return A configuração atualizada.
     */
    @PatchMapping("/portal-solicitacao-acesso")
    public ResponseEntity<ConfiguracaoAssistenciaSocial> atualizarPortalSolicitacaoAcesso(
            @RequestParam Boolean portalSolicitacaoAcesso,
            Authentication authentication) {

        String usuarioAtualizacao = authentication.getName();
        ConfiguracaoAssistenciaSocial configuracaoAtualizada = 
                configuracaoService.atualizarPortalSolicitacaoAcesso(portalSolicitacaoAcesso, usuarioAtualizacao);
        return ResponseEntity.ok(configuracaoAtualizada);
    }
}
