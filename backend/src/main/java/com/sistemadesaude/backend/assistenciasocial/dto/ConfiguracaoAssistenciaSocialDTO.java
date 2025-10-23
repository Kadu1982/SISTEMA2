package com.sistemadesaude.backend.assistenciasocial.dto;

import com.sistemadesaude.backend.assistenciasocial.entity.ConfiguracaoAssistenciaSocial;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * DTO para transferência de dados de configuração do módulo de Assistência Social.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ConfiguracaoAssistenciaSocialDTO {

    private Long id;
    private Integer tempoAtualizacaoTelas;
    private BigDecimal valorSalarioMinimo;
    private BigDecimal valorLinhaPobreza;
    private BigDecimal valorLinhaExtremaPobreza;
    private Integer tempoAtendimentoProfissionais;
    private Integer tempoAlteracaoAtendimentoIndividual;
    private BigDecimal valorBeneficioFamiliaAcolhedora;
    private BigDecimal valorBeneficioFamiliaAcolhedoraEspecial;
    private Integer tempoAlteracaoContrareferencia;
    private Integer tempoAlteracaoDispensacaoBeneficios;
    private Boolean desligarIntegranteGrupoServico;
    private Boolean alertarDispensacaoBeneficioDuplicado;
    private Boolean permitirTransferenciaIntegrantes;
    private Boolean campoValorBaseObrigatorio;
    private Boolean somenteIntegrantesFamiliaAtendimentoColetivo;
    private Boolean controleAutomaticoPobreza;
    private LocalDateTime dataAtualizacao;
    private String usuarioAtualizacao;

    /**
     * Converte uma entidade ConfiguracaoAssistenciaSocial para DTO.
     * @param configuracao A entidade a ser convertida.
     * @return O DTO correspondente.
     */
    public static ConfiguracaoAssistenciaSocialDTO fromEntity(ConfiguracaoAssistenciaSocial configuracao) {
        if (configuracao == null) {
            return null;
        }
        
        return ConfiguracaoAssistenciaSocialDTO.builder()
                .id(configuracao.getId())
                .tempoAtualizacaoTelas(configuracao.getTempoAtualizacaoTelas())
                .valorSalarioMinimo(configuracao.getValorSalarioMinimo())
                .valorLinhaPobreza(configuracao.getValorLinhaPobreza())
                .valorLinhaExtremaPobreza(configuracao.getValorLinhaExtremaPobreza())
                .tempoAtendimentoProfissionais(configuracao.getTempoAtendimentoProfissionais())
                .tempoAlteracaoAtendimentoIndividual(configuracao.getTempoAlteracaoAtendimentoIndividual())
                .valorBeneficioFamiliaAcolhedora(configuracao.getValorBeneficioFamiliaAcolhedora())
                .valorBeneficioFamiliaAcolhedoraEspecial(configuracao.getValorBeneficioFamiliaAcolhedoraEspecial())
                .tempoAlteracaoContrareferencia(configuracao.getTempoAlteracaoContrareferencia())
                .tempoAlteracaoDispensacaoBeneficios(configuracao.getTempoAlteracaoDispensacaoBeneficios())
                .desligarIntegranteGrupoServico(configuracao.getDesligarIntegranteGrupoServico())
                .alertarDispensacaoBeneficioDuplicado(configuracao.getAlertarDispensacaoBeneficioDuplicado())
                .permitirTransferenciaIntegrantes(configuracao.getPermitirTransferenciaIntegrantes())
                .campoValorBaseObrigatorio(configuracao.getCampoValorBaseObrigatorio())
                .somenteIntegrantesFamiliaAtendimentoColetivo(configuracao.getSomenteIntegrantesFamiliaAtendimentoColetivo())
                .controleAutomaticoPobreza(configuracao.getControleAutomaticoPobreza())
                .dataAtualizacao(configuracao.getDataAtualizacao())
                .usuarioAtualizacao(configuracao.getUsuarioAtualizacao())
                .build();
    }

    /**
     * Converte o DTO para uma entidade ConfiguracaoAssistenciaSocial.
     * @return A entidade correspondente.
     */
    public ConfiguracaoAssistenciaSocial toEntity() {
        ConfiguracaoAssistenciaSocial configuracao = new ConfiguracaoAssistenciaSocial();
        configuracao.setId(this.id);
        configuracao.setTempoAtualizacaoTelas(this.tempoAtualizacaoTelas);
        configuracao.setValorSalarioMinimo(this.valorSalarioMinimo);
        configuracao.setValorLinhaPobreza(this.valorLinhaPobreza);
        configuracao.setValorLinhaExtremaPobreza(this.valorLinhaExtremaPobreza);
        configuracao.setTempoAtendimentoProfissionais(this.tempoAtendimentoProfissionais);
        configuracao.setTempoAlteracaoAtendimentoIndividual(this.tempoAlteracaoAtendimentoIndividual);
        configuracao.setValorBeneficioFamiliaAcolhedora(this.valorBeneficioFamiliaAcolhedora);
        configuracao.setValorBeneficioFamiliaAcolhedoraEspecial(this.valorBeneficioFamiliaAcolhedoraEspecial);
        configuracao.setTempoAlteracaoContrareferencia(this.tempoAlteracaoContrareferencia);
        configuracao.setTempoAlteracaoDispensacaoBeneficios(this.tempoAlteracaoDispensacaoBeneficios);
        configuracao.setDesligarIntegranteGrupoServico(this.desligarIntegranteGrupoServico);
        configuracao.setAlertarDispensacaoBeneficioDuplicado(this.alertarDispensacaoBeneficioDuplicado);
        configuracao.setPermitirTransferenciaIntegrantes(this.permitirTransferenciaIntegrantes);
        configuracao.setCampoValorBaseObrigatorio(this.campoValorBaseObrigatorio);
        configuracao.setSomenteIntegrantesFamiliaAtendimentoColetivo(this.somenteIntegrantesFamiliaAtendimentoColetivo);
        configuracao.setControleAutomaticoPobreza(this.controleAutomaticoPobreza);
        configuracao.setDataAtualizacao(this.dataAtualizacao);
        configuracao.setUsuarioAtualizacao(this.usuarioAtualizacao);
        return configuracao;
    }
}
