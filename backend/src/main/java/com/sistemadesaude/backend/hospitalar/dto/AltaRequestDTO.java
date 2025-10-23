package com.sistemadesaude.backend.hospitalar.dto;

import jakarta.validation.constraints.NotBlank;

public class AltaRequestDTO {

    @NotBlank(message = "Motivo da alta é obrigatório")
    private String motivoAlta;

    private String cidAlta;

    private String observacoes;

    // Construtores
    public AltaRequestDTO() {}

    public AltaRequestDTO(String motivoAlta, String cidAlta, String observacoes) {
        this.motivoAlta = motivoAlta;
        this.cidAlta = cidAlta;
        this.observacoes = observacoes;
    }

    // Getters e Setters
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
}