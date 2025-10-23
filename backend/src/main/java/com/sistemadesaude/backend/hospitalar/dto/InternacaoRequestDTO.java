package com.sistemadesaude.backend.hospitalar.dto;

import com.sistemadesaude.backend.hospitalar.entity.Internacao;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;
import java.time.LocalTime;

public class InternacaoRequestDTO {

    @NotNull(message = "Paciente é obrigatório")
    private Long pacienteId;

    private Long leitoId;

    @NotNull(message = "Unidade é obrigatória")
    private Long unidadeId;

    @NotNull(message = "Médico responsável é obrigatório")
    private Long medicoResponsavelId;

    @NotNull(message = "Data de internação é obrigatória")
    private LocalDate dataInternacao;

    private LocalTime horaInternacao;
    private LocalDate dataPrevistaAlta;

    @NotNull(message = "Tipo de internação é obrigatório")
    private Internacao.TipoInternacao tipoInternacao;

    @NotNull(message = "Regime de internação é obrigatório")
    private Internacao.RegimeInternacao regimeInternacao;

    private String cidPrincipal;
    private String diagnosticoInternacao;
    private String observacoes;

    private Long convenioId;
    private String numeroCarteira;

    private boolean permiteAcompanhante = true;

    // Campos para efetivar pré-internação
    private Long preInternacaoId;

    // Construtores
    public InternacaoRequestDTO() {}

    // Getters e Setters
    public Long getPacienteId() {
        return pacienteId;
    }

    public void setPacienteId(Long pacienteId) {
        this.pacienteId = pacienteId;
    }

    public Long getLeitoId() {
        return leitoId;
    }

    public void setLeitoId(Long leitoId) {
        this.leitoId = leitoId;
    }

    public Long getUnidadeId() {
        return unidadeId;
    }

    public void setUnidadeId(Long unidadeId) {
        this.unidadeId = unidadeId;
    }

    public Long getMedicoResponsavelId() {
        return medicoResponsavelId;
    }

    public void setMedicoResponsavelId(Long medicoResponsavelId) {
        this.medicoResponsavelId = medicoResponsavelId;
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

    public Long getPreInternacaoId() {
        return preInternacaoId;
    }

    public void setPreInternacaoId(Long preInternacaoId) {
        this.preInternacaoId = preInternacaoId;
    }
}