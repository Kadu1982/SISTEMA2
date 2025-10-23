package com.sistemadesaude.backend.hospitalar.dto;

import com.sistemadesaude.backend.hospitalar.entity.TransferenciaLeito;
import jakarta.validation.constraints.NotNull;

public class TransferenciaLeitoRequestDTO {

    @NotNull(message = "Leito de destino é obrigatório")
    private Long leitoDestinoId;

    @NotNull(message = "Tipo de transferência é obrigatório")
    private TransferenciaLeito.TipoTransferencia tipoTransferencia;

    private String justificativa;

    // Construtores
    public TransferenciaLeitoRequestDTO() {}

    public TransferenciaLeitoRequestDTO(Long leitoDestinoId, TransferenciaLeito.TipoTransferencia tipoTransferencia, String justificativa) {
        this.leitoDestinoId = leitoDestinoId;
        this.tipoTransferencia = tipoTransferencia;
        this.justificativa = justificativa;
    }

    // Getters e Setters
    public Long getLeitoDestinoId() {
        return leitoDestinoId;
    }

    public void setLeitoDestinoId(Long leitoDestinoId) {
        this.leitoDestinoId = leitoDestinoId;
    }

    public TransferenciaLeito.TipoTransferencia getTipoTransferencia() {
        return tipoTransferencia;
    }

    public void setTipoTransferencia(TransferenciaLeito.TipoTransferencia tipoTransferencia) {
        this.tipoTransferencia = tipoTransferencia;
    }

    public String getJustificativa() {
        return justificativa;
    }

    public void setJustificativa(String justificativa) {
        this.justificativa = justificativa;
    }
}