package com.sistemadesaude.backend.assistenciasocial.dto;

import com.sistemadesaude.backend.assistenciasocial.entity.Familia;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

/**
 * DTO para transferência de dados de família do módulo de Assistência Social.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FamiliaDTO {

    private Long id;
    private String codigoFamiliar;
    private Long responsavelId;
    private String responsavelNome;
    private Familia.TipoFamilia tipoFamilia;
    private String classeSocial;
    private LocalDateTime dataCadastro;
    private LocalDateTime dataAtualizacao;
    private String usuarioCadastro;
    private String usuarioAtualizacao;

    // Endereço
    private String municipio;
    private String cep;
    private String logradouro;
    private String numero;
    private String bairro;
    private String complemento;

    // Informações adicionais
    private Integer quantidadeDependentes;
    private Integer quantidadePNE;
    private Integer quantidadeMulheresGravidas;
    private Integer quantidadeMaesAmamentando;
    private LocalDate dataChegadaMunicipio;

    // Informações sobre o domicílio
    private String tipoLocalidade;
    private String tipoDomicilio;
    private String situacaoDomicilio;
    private Integer numeroComodos;
    private Integer numeroDormitorios;
    private Integer pessoasPorDormitorio;
    private String tipoPiso;
    private String tipoParede;
    private Boolean aguaCanalizada;
    private String abastecimentoAgua;
    private String tratamentoAgua;
    private Boolean possuiBanheiro;
    private String destinoFezesUrina;
    private String destinoLixo;
    private String tipoIluminacao;
    private String acessoDomicilio;
    private Boolean acessibilidadePNE;
    private Boolean areaDesabamentoAlagamento;
    private Boolean areaDificilAcesso;
    private Boolean areaConflitoViolencia;

    // Plano de saúde
    private Boolean possuiPlanoSaude;
    private String nomePlanoSaude;
    private Integer pessoasCobertas;
    private String observacoes;

    // Relacionamentos
    private List<MembroFamiliaDTO> membros = new ArrayList<>();
    private List<VulnerabilidadeFamiliaDTO> vulnerabilidades = new ArrayList<>();
    private List<RendaFamiliaDTO> rendas = new ArrayList<>();
    private List<DespesaFamiliaDTO> despesas = new ArrayList<>();
    private List<ProgramaTransferenciaRendaFamiliaDTO> programasTransferenciaRenda = new ArrayList<>();
    //private List<PessoaAcolhidaDTO> pessoasAcolhidas = new ArrayList<>();

    /**
     * Converte uma entidade Familia para DTO.
     * @param familia A entidade a ser convertida.
     * @return O DTO correspondente.
     */
    public static FamiliaDTO fromEntity(Familia familia) {
        if (familia == null) {
            return null;
        }
        
        FamiliaDTO dto = FamiliaDTO.builder()
                .id(familia.getId())
                .codigoFamiliar(familia.getCodigoFamiliar())
                .responsavelId(familia.getResponsavel() != null ? familia.getResponsavel().getId() : null)
                .responsavelNome(familia.getResponsavel() != null ? familia.getResponsavel().getNomeCompleto() : null)
                .tipoFamilia(familia.getTipoFamilia())
                .classeSocial(familia.getClasseSocial())
                .dataCadastro(familia.getDataCadastro())
                .dataAtualizacao(familia.getDataAtualizacao())
                .usuarioCadastro(familia.getUsuarioCadastro())
                .usuarioAtualizacao(familia.getUsuarioAtualizacao())
                .municipio(familia.getMunicipio())
                .cep(familia.getCep())
                .logradouro(familia.getLogradouro())
                .numero(familia.getNumero())
                .bairro(familia.getBairro())
                .complemento(familia.getComplemento())
                .quantidadeDependentes(familia.getQuantidadeDependentes())
                .quantidadePNE(familia.getQuantidadePNE())
                .quantidadeMulheresGravidas(familia.getQuantidadeMulheresGravidas())
                .quantidadeMaesAmamentando(familia.getQuantidadeMaesAmamentando())
                .dataChegadaMunicipio(familia.getDataChegadaMunicipio())
                .tipoLocalidade(familia.getTipoLocalidade())
                .tipoDomicilio(familia.getTipoDomicilio())
                .situacaoDomicilio(familia.getSituacaoDomicilio())
                .numeroComodos(familia.getNumeroComodos())
                .numeroDormitorios(familia.getNumeroDormitorios())
                .pessoasPorDormitorio(familia.getPessoasPorDormitorio())
                .tipoPiso(familia.getTipoPiso())
                .tipoParede(familia.getTipoParede())
                .aguaCanalizada(familia.getAguaCanalizada())
                .abastecimentoAgua(familia.getAbastecimentoAgua())
                .tratamentoAgua(familia.getTratamentoAgua())
                .possuiBanheiro(familia.getPossuiBanheiro())
                .destinoFezesUrina(familia.getDestinoFezesUrina())
                .destinoLixo(familia.getDestinoLixo())
                .tipoIluminacao(familia.getTipoIluminacao())
                .acessoDomicilio(familia.getAcessoDomicilio())
                .acessibilidadePNE(familia.getAcessibilidadePNE())
                .areaDesabamentoAlagamento(familia.getAreaDesabamentoAlagamento())
                .areaDificilAcesso(familia.getAreaDificilAcesso())
                .areaConflitoViolencia(familia.getAreaConflitoViolencia())
                .possuiPlanoSaude(familia.getPossuiPlanoSaude())
                .nomePlanoSaude(familia.getNomePlanoSaude())
                .pessoasCobertas(familia.getPessoasCobertas())
                .observacoes(familia.getObservacoes())
                .build();
        
        // Converter relacionamentos
        if (familia.getMembros() != null) {
            dto.setMembros(familia.getMembros().stream()
                    .map(MembroFamiliaDTO::fromEntity)
                    .collect(Collectors.toList()));
        }
        
        if (familia.getVulnerabilidades() != null) {
            dto.setVulnerabilidades(familia.getVulnerabilidades().stream()
                    .map(VulnerabilidadeFamiliaDTO::fromEntity)
                    .collect(Collectors.toList()));
        }
        
        if (familia.getRendas() != null) {
            dto.setRendas(familia.getRendas().stream()
                    .map(RendaFamiliaDTO::fromEntity)
                    .collect(Collectors.toList()));
        }
        
        if (familia.getDespesas() != null) {
            dto.setDespesas(familia.getDespesas().stream()
                    .map(DespesaFamiliaDTO::fromEntity)
                    .collect(Collectors.toList()));
        }
        
        if (familia.getProgramasTransferenciaRenda() != null) {
            dto.setProgramasTransferenciaRenda(familia.getProgramasTransferenciaRenda().stream()
                    .map(ProgramaTransferenciaRendaFamiliaDTO::fromEntity)
                    .collect(Collectors.toList()));
        }
        
        //if (familia.getPessoasAcolhidas() != null) {
                //dto.setPessoasAcolhidas(familia.getPessoasAcolhidas().stream()
                   // .map(PessoaAcolhidaDTO::fromEntity)
                 //   .collect(Collectors.toList()));
       // }
        
        return dto;
    }

    /**
     * Converte o DTO para uma entidade Familia.
     * Este método não converte os relacionamentos, que devem ser tratados separadamente.
     * @return A entidade correspondente.
     */
    public Familia toEntity() {
        Familia familia = new Familia();
        familia.setId(this.id);
        familia.setCodigoFamiliar(this.codigoFamiliar);
        familia.setTipoFamilia(this.tipoFamilia);
        familia.setClasseSocial(this.classeSocial);
        familia.setDataCadastro(this.dataCadastro);
        familia.setDataAtualizacao(this.dataAtualizacao);
        familia.setUsuarioCadastro(this.usuarioCadastro);
        familia.setUsuarioAtualizacao(this.usuarioAtualizacao);
        familia.setMunicipio(this.municipio);
        familia.setCep(this.cep);
        familia.setLogradouro(this.logradouro);
        familia.setNumero(this.numero);
        familia.setBairro(this.bairro);
        familia.setComplemento(this.complemento);
        familia.setQuantidadeDependentes(this.quantidadeDependentes);
        familia.setQuantidadePNE(this.quantidadePNE);
        familia.setQuantidadeMulheresGravidas(this.quantidadeMulheresGravidas);
        familia.setQuantidadeMaesAmamentando(this.quantidadeMaesAmamentando);
        familia.setDataChegadaMunicipio(this.dataChegadaMunicipio);
        familia.setTipoLocalidade(this.tipoLocalidade);
        familia.setTipoDomicilio(this.tipoDomicilio);
        familia.setSituacaoDomicilio(this.situacaoDomicilio);
        familia.setNumeroComodos(this.numeroComodos);
        familia.setNumeroDormitorios(this.numeroDormitorios);
        familia.setPessoasPorDormitorio(this.pessoasPorDormitorio);
        familia.setTipoPiso(this.tipoPiso);
        familia.setTipoParede(this.tipoParede);
        familia.setAguaCanalizada(this.aguaCanalizada);
        familia.setAbastecimentoAgua(this.abastecimentoAgua);
        familia.setTratamentoAgua(this.tratamentoAgua);
        familia.setPossuiBanheiro(this.possuiBanheiro);
        familia.setDestinoFezesUrina(this.destinoFezesUrina);
        familia.setDestinoLixo(this.destinoLixo);
        familia.setTipoIluminacao(this.tipoIluminacao);
        familia.setAcessoDomicilio(this.acessoDomicilio);
        familia.setAcessibilidadePNE(this.acessibilidadePNE);
        familia.setAreaDesabamentoAlagamento(this.areaDesabamentoAlagamento);
        familia.setAreaDificilAcesso(this.areaDificilAcesso);
        familia.setAreaConflitoViolencia(this.areaConflitoViolencia);
        familia.setPossuiPlanoSaude(this.possuiPlanoSaude);
        familia.setNomePlanoSaude(this.nomePlanoSaude);
        familia.setPessoasCobertas(this.pessoasCobertas);
        familia.setObservacoes(this.observacoes);
        
        // Nota: Os relacionamentos (membros, vulnerabilidades, etc.) devem ser tratados separadamente
        
        return familia;
    }
}
