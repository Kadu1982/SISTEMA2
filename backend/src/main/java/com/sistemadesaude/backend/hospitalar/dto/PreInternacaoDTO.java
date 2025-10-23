package com.sistemadesaude.backend.hospitalar.dto;

import com.sistemadesaude.backend.hospitalar.entity.PreInternacao;
import com.sistemadesaude.backend.paciente.dto.PacienteDTO;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

public class PreInternacaoDTO {
    private Long id;
    private String numeroPreInternacao;
    private PacienteDTO paciente;
    private LeitoDTO leitoReservado;
    private Long unidadeId;
    private String nomeUnidade;
    private Long medicoResponsavelId;
    private String nomeMedicoResponsavel;

    private LocalDate dataPrevisaoInternacao;
    private LocalTime horaPrevisaoInternacao;

    private PreInternacao.StatusPreInternacao statusPreInternacao;
    private PreInternacao.TipoPreInternacao tipoInternacao;
    private PreInternacao.RegimeInternacao regimeInternacao;
    private PreInternacao.CaraterInternacao caraterInternacao;
    private PreInternacao.OrigemPreInternacao origem;

    private String cidPrincipal;
    private String diagnostico;
    private String observacoes;

    private Long convenioId;
    private String nomeConvenio;

    private Long servicoId;
    private String nomeServico;

    private String enfermariaPreferida;
    private PreInternacao.TipoAcomodacao tipoAcomodacao;
    private boolean precisaIsolamento;
    private boolean permiteAcompanhante;

    private boolean solicitouReservaLeito;
    private LocalDateTime dataReservaLeito;

    private boolean temPendencias;
    private String pendencias;

    private LocalDate dataCirurgia;
    private LocalTime horaCirurgia;
    private Long agendamentoCirurgiaId;
    private Long atendimentoUrgenciaId;

    private LocalDateTime dataCriacao;
    private String nomeOperadorCriacao;
    private LocalDateTime dataEfetivacao;
    private String nomeOperadorEfetivacao;
    private LocalDateTime dataCancelamento;
    private String nomeOperadorCancelamento;
    private String motivoCancelamento;

    // Construtores
    public PreInternacaoDTO() {}

    // Getters e Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getNumeroPreInternacao() {
        return numeroPreInternacao;
    }

    public void setNumeroPreInternacao(String numeroPreInternacao) {
        this.numeroPreInternacao = numeroPreInternacao;
    }

    public PacienteDTO getPaciente() {
        return paciente;
    }

    public void setPaciente(PacienteDTO paciente) {
        this.paciente = paciente;
    }

    public LeitoDTO getLeitoReservado() {
        return leitoReservado;
    }

    public void setLeitoReservado(LeitoDTO leitoReservado) {
        this.leitoReservado = leitoReservado;
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

    public PreInternacao.StatusPreInternacao getStatusPreInternacao() {
        return statusPreInternacao;
    }

    public void setStatusPreInternacao(PreInternacao.StatusPreInternacao statusPreInternacao) {
        this.statusPreInternacao = statusPreInternacao;
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

    public String getNomeConvenio() {
        return nomeConvenio;
    }

    public void setNomeConvenio(String nomeConvenio) {
        this.nomeConvenio = nomeConvenio;
    }

    public Long getServicoId() {
        return servicoId;
    }

    public void setServicoId(Long servicoId) {
        this.servicoId = servicoId;
    }

    public String getNomeServico() {
        return nomeServico;
    }

    public void setNomeServico(String nomeServico) {
        this.nomeServico = nomeServico;
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

    public LocalDateTime getDataReservaLeito() {
        return dataReservaLeito;
    }

    public void setDataReservaLeito(LocalDateTime dataReservaLeito) {
        this.dataReservaLeito = dataReservaLeito;
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

    public LocalDateTime getDataCriacao() {
        return dataCriacao;
    }

    public void setDataCriacao(LocalDateTime dataCriacao) {
        this.dataCriacao = dataCriacao;
    }

    public String getNomeOperadorCriacao() {
        return nomeOperadorCriacao;
    }

    public void setNomeOperadorCriacao(String nomeOperadorCriacao) {
        this.nomeOperadorCriacao = nomeOperadorCriacao;
    }

    public LocalDateTime getDataEfetivacao() {
        return dataEfetivacao;
    }

    public void setDataEfetivacao(LocalDateTime dataEfetivacao) {
        this.dataEfetivacao = dataEfetivacao;
    }

    public String getNomeOperadorEfetivacao() {
        return nomeOperadorEfetivacao;
    }

    public void setNomeOperadorEfetivacao(String nomeOperadorEfetivacao) {
        this.nomeOperadorEfetivacao = nomeOperadorEfetivacao;
    }

    public LocalDateTime getDataCancelamento() {
        return dataCancelamento;
    }

    public void setDataCancelamento(LocalDateTime dataCancelamento) {
        this.dataCancelamento = dataCancelamento;
    }

    public String getNomeOperadorCancelamento() {
        return nomeOperadorCancelamento;
    }

    public void setNomeOperadorCancelamento(String nomeOperadorCancelamento) {
        this.nomeOperadorCancelamento = nomeOperadorCancelamento;
    }

    public String getMotivoCancelamento() {
        return motivoCancelamento;
    }

    public void setMotivoCancelamento(String motivoCancelamento) {
        this.motivoCancelamento = motivoCancelamento;
    }
}