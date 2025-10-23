package com.sistemadesaude.backend.hospitalar.dto;

import com.sistemadesaude.backend.hospitalar.entity.Internacao;
import com.sistemadesaude.backend.paciente.dto.PacienteDTO;
import com.sistemadesaude.backend.hospitalar.dto.LeitoDTO;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

public class InternacaoDTO {
    private Long id;
    private String numeroInternacao;
    private PacienteDTO paciente;
    private LeitoDTO leito;
    private Long unidadeId;
    private String nomeUnidade;
    private Long medicoResponsavelId;
    private String nomeMedicoResponsavel;

    private LocalDate dataInternacao;
    private LocalTime horaInternacao;
    private LocalDate dataPrevistaAlta;
    private LocalDate dataAlta;
    private LocalTime horaAlta;

    private Internacao.StatusInternacao statusInternacao;
    private Internacao.TipoInternacao tipoInternacao;
    private Internacao.RegimeInternacao regimeInternacao;
    private Internacao.TipoAlta tipoAlta;

    private String cidPrincipal;
    private String diagnosticoInternacao;
    private String motivoAlta;
    private String cidAlta;
    private String observacoes;

    private Long convenioId;
    private String nomeConvenio;
    private String numeroCarteira;

    private boolean permiteAcompanhante;
    private Integer diasInternacao;

    private LocalDateTime dataRegistro;
    private String nomeOperadorRegistro;

    // Construtores
    public InternacaoDTO() {}

    // Getters e Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getNumeroInternacao() {
        return numeroInternacao;
    }

    public void setNumeroInternacao(String numeroInternacao) {
        this.numeroInternacao = numeroInternacao;
    }

    public PacienteDTO getPaciente() {
        return paciente;
    }

    public void setPaciente(PacienteDTO paciente) {
        this.paciente = paciente;
    }

    public LeitoDTO getLeito() {
        return leito;
    }

    public void setLeito(LeitoDTO leito) {
        this.leito = leito;
    }

    public Long getUnidadeId() {
        return unidadeId;
    }

    public void setUnidadeId(Long unidadeId) {
        this.unidadeId = unidadeId;
    }

    public String getNomeUnidade() {
        return nomeUnidade;
    }

    public void setNomeUnidade(String nomeUnidade) {
        this.nomeUnidade = nomeUnidade;
    }

    public Long getMedicoResponsavelId() {
        return medicoResponsavelId;
    }

    public void setMedicoResponsavelId(Long medicoResponsavelId) {
        this.medicoResponsavelId = medicoResponsavelId;
    }

    public String getNomeMedicoResponsavel() {
        return nomeMedicoResponsavel;
    }

    public void setNomeMedicoResponsavel(String nomeMedicoResponsavel) {
        this.nomeMedicoResponsavel = nomeMedicoResponsavel;
    }

    public LocalDate getDataInternacao() {
        return dataInternacao;
    }

    public void setDataInternacao(LocalDate dataInternacao) {
        this.dataInternacao = dataInternacao;
    }

    public LocalTime getHoraInternacao() {
        return horaInternacao;
    }

    public void setHoraInternacao(LocalTime horaInternacao) {
        this.horaInternacao = horaInternacao;
    }

    public LocalDate getDataPrevistaAlta() {
        return dataPrevistaAlta;
    }

    public void setDataPrevistaAlta(LocalDate dataPrevistaAlta) {
        this.dataPrevistaAlta = dataPrevistaAlta;
    }

    public LocalDate getDataAlta() {
        return dataAlta;
    }

    public void setDataAlta(LocalDate dataAlta) {
        this.dataAlta = dataAlta;
    }

    public LocalTime getHoraAlta() {
        return horaAlta;
    }

    public void setHoraAlta(LocalTime horaAlta) {
        this.horaAlta = horaAlta;
    }

    public Internacao.StatusInternacao getStatusInternacao() {
        return statusInternacao;
    }

    public void setStatusInternacao(Internacao.StatusInternacao statusInternacao) {
        this.statusInternacao = statusInternacao;
    }

    public Internacao.TipoInternacao getTipoInternacao() {
        return tipoInternacao;
    }

    public void setTipoInternacao(Internacao.TipoInternacao tipoInternacao) {
        this.tipoInternacao = tipoInternacao;
    }

    public Internacao.RegimeInternacao getRegimeInternacao() {
        return regimeInternacao;
    }

    public void setRegimeInternacao(Internacao.RegimeInternacao regimeInternacao) {
        this.regimeInternacao = regimeInternacao;
    }

    public Internacao.TipoAlta getTipoAlta() {
        return tipoAlta;
    }

    public void setTipoAlta(Internacao.TipoAlta tipoAlta) {
        this.tipoAlta = tipoAlta;
    }

    public String getCidPrincipal() {
        return cidPrincipal;
    }

    public void setCidPrincipal(String cidPrincipal) {
        this.cidPrincipal = cidPrincipal;
    }

    public String getDiagnosticoInternacao() {
        return diagnosticoInternacao;
    }

    public void setDiagnosticoInternacao(String diagnosticoInternacao) {
        this.diagnosticoInternacao = diagnosticoInternacao;
    }

    public String getMotivoAlta() {
        return motivoAlta;
    }

    public void setMotivoAlta(String motivoAlta) {
        this.motivoAlta = motivoAlta;
    }

    public String getCidAlta() {
        return cidAlta;
    }

    public void setCidAlta(String cidAlta) {
        this.cidAlta = cidAlta;
    }

    public String getObservacoes() {
        return observacoes;
    }

    public void setObservacoes(String observacoes) {
        this.observacoes = observacoes;
    }

    public Long getConvenioId() {
        return convenioId;
    }

    public void setConvenioId(Long convenioId) {
        this.convenioId = convenioId;
    }

    public String getNomeConvenio() {
        return nomeConvenio;
    }

    public void setNomeConvenio(String nomeConvenio) {
        this.nomeConvenio = nomeConvenio;
    }

    public String getNumeroCarteira() {
        return numeroCarteira;
    }

    public void setNumeroCarteira(String numeroCarteira) {
        this.numeroCarteira = numeroCarteira;
    }

    public boolean isPermiteAcompanhante() {
        return permiteAcompanhante;
    }

    public void setPermiteAcompanhante(boolean permiteAcompanhante) {
        this.permiteAcompanhante = permiteAcompanhante;
    }

    public Integer getDiasInternacao() {
        return diasInternacao;
    }

    public void setDiasInternacao(Integer diasInternacao) {
        this.diasInternacao = diasInternacao;
    }

    public LocalDateTime getDataRegistro() {
        return dataRegistro;
    }

    public void setDataRegistro(LocalDateTime dataRegistro) {
        this.dataRegistro = dataRegistro;
    }

    public String getNomeOperadorRegistro() {
        return nomeOperadorRegistro;
    }

    public void setNomeOperadorRegistro(String nomeOperadorRegistro) {
        this.nomeOperadorRegistro = nomeOperadorRegistro;
    }
}