package com.sistemadesaude.backend.hospitalar.dto;

import com.sistemadesaude.backend.hospitalar.entity.PreInternacao;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;
import java.time.LocalTime;

public class PreInternacaoRequestDTO {

    @NotNull(message = "Paciente é obrigatório")
    private Long pacienteId;

    @NotNull(message = "Unidade é obrigatória")
    private Long unidadeId;

    @NotNull(message = "Médico responsável é obrigatório")
    private Long medicoResponsavelId;

    @NotNull(message = "Data de previsão de internação é obrigatória")
    private LocalDate dataPrevisaoInternacao;

    private LocalTime horaPrevisaoInternacao;

    @NotNull(message = "Tipo de internação é obrigatório")
    private PreInternacao.TipoPreInternacao tipoInternacao;

    @NotNull(message = "Regime de internação é obrigatório")
    private PreInternacao.RegimeInternacao regimeInternacao;

    @NotNull(message = "Caráter da internação é obrigatório")
    private PreInternacao.CaraterInternacao caraterInternacao;

    @NotNull(message = "Origem da pré-internação é obrigatória")
    private PreInternacao.OrigemPreInternacao origem;

    private String cidPrincipal;
    private String diagnostico;
    private String observacoes;

    private Long convenioId;
    private Long servicoId;

    private String enfermariaPreferida;
    private PreInternacao.TipoAcomodacao tipoAcomodacao;
    private boolean precisaIsolamento = false;
    private boolean permiteAcompanhante = true;

    private boolean solicitouReservaLeito = false;

    private boolean temPendencias = false;
    private String pendencias;

    // Campos para integração com cirurgia
    private LocalDate dataCirurgia;
    private LocalTime horaCirurgia;
    private Long agendamentoCirurgiaId;

    // Campos para integração com urgência
    private Long atendimentoUrgenciaId;

    // Construtores
    public PreInternacaoRequestDTO() {}

    // Getters e Setters
    public Long getPacienteId() {
        return pacienteId;
    }

    public void setPacienteId(Long pacienteId) {
        this.pacienteId = pacienteId;
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

    public LocalDate getDataPrevisaoInternacao() {
        return dataPrevisaoInternacao;
    }

    public void setDataPrevisaoInternacao(LocalDate dataPrevisaoInternacao) {
        this.dataPrevisaoInternacao = dataPrevisaoInternacao;
    }

    public LocalTime getHoraPrevisaoInternacao() {
        return horaPrevisaoInternacao;
    }

    public void setHoraPrevisaoInternacao(LocalTime horaPrevisaoInternacao) {
        this.horaPrevisaoInternacao = horaPrevisaoInternacao;
    }

    public PreInternacao.TipoPreInternacao getTipoInternacao() {
        return tipoInternacao;
    }

    public void setTipoInternacao(PreInternacao.TipoPreInternacao tipoInternacao) {
        this.tipoInternacao = tipoInternacao;
    }

    public PreInternacao.RegimeInternacao getRegimeInternacao() {
        return regimeInternacao;
    }

    public void setRegimeInternacao(PreInternacao.RegimeInternacao regimeInternacao) {
        this.regimeInternacao = regimeInternacao;
    }

    public PreInternacao.CaraterInternacao getCaraterInternacao() {
        return caraterInternacao;
    }

    public void setCaraterInternacao(PreInternacao.CaraterInternacao caraterInternacao) {
        this.caraterInternacao = caraterInternacao;
    }

    public PreInternacao.OrigemPreInternacao getOrigem() {
        return origem;
    }

    public void setOrigem(PreInternacao.OrigemPreInternacao origem) {
        this.origem = origem;
    }

    public String getCidPrincipal() {
        return cidPrincipal;
    }

    public void setCidPrincipal(String cidPrincipal) {
        this.cidPrincipal = cidPrincipal;
    }

    public String getDiagnostico() {
        return diagnostico;
    }

    public void setDiagnostico(String diagnostico) {
        this.diagnostico = diagnostico;
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

    public Long getServicoId() {
        return servicoId;
    }

    public void setServicoId(Long servicoId) {
        this.servicoId = servicoId;
    }

    public String getEnfermariaPreferida() {
        return enfermariaPreferida;
    }

    public void setEnfermariaPreferida(String enfermariaPreferida) {
        this.enfermariaPreferida = enfermariaPreferida;
    }

    public PreInternacao.TipoAcomodacao getTipoAcomodacao() {
        return tipoAcomodacao;
    }

    public void setTipoAcomodacao(PreInternacao.TipoAcomodacao tipoAcomodacao) {
        this.tipoAcomodacao = tipoAcomodacao;
    }

    public boolean isPrecisaIsolamento() {
        return precisaIsolamento;
    }

    public void setPrecisaIsolamento(boolean precisaIsolamento) {
        this.precisaIsolamento = precisaIsolamento;
    }

    public boolean isPermiteAcompanhante() {
        return permiteAcompanhante;
    }

    public void setPermiteAcompanhante(boolean permiteAcompanhante) {
        this.permiteAcompanhante = permiteAcompanhante;
    }

    public boolean isSolicitouReservaLeito() {
        return solicitouReservaLeito;
    }

    public void setSolicitouReservaLeito(boolean solicitouReservaLeito) {
        this.solicitouReservaLeito = solicitouReservaLeito;
    }

    public boolean isTemPendencias() {
        return temPendencias;
    }

    public void setTemPendencias(boolean temPendencias) {
        this.temPendencias = temPendencias;
    }

    public String getPendencias() {
        return pendencias;
    }

    public void setPendencias(String pendencias) {
        this.pendencias = pendencias;
    }

    public LocalDate getDataCirurgia() {
        return dataCirurgia;
    }

    public void setDataCirurgia(LocalDate dataCirurgia) {
        this.dataCirurgia = dataCirurgia;
    }

    public LocalTime getHoraCirurgia() {
        return horaCirurgia;
    }

    public void setHoraCirurgia(LocalTime horaCirurgia) {
        this.horaCirurgia = horaCirurgia;
    }

    public Long getAgendamentoCirurgiaId() {
        return agendamentoCirurgiaId;
    }

    public void setAgendamentoCirurgiaId(Long agendamentoCirurgiaId) {
        this.agendamentoCirurgiaId = agendamentoCirurgiaId;
    }

    public Long getAtendimentoUrgenciaId() {
        return atendimentoUrgenciaId;
    }

    public void setAtendimentoUrgenciaId(Long atendimentoUrgenciaId) {
        this.atendimentoUrgenciaId = atendimentoUrgenciaId;
    }
}