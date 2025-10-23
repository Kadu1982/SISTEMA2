package com.sistemadesaude.backend.biometria.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

/**
 * Entidade de Biometria.
 * Campos mínimos para atender o service existente:
 *  - operadorId (usado no findByOperadorIdOrderByDataCapturaDesc)
 *  - dataCaptura (ordenar por data)
 *
 * Campos opcionais (podem ser ignorados por agora):
 *  - template (byte[]) : dados biométricos
 *  - formato (String)  : ex. "WSQ", "ISO", etc.
 *  - observacoes (String)
 */
@Entity
@Table(name = "biometrias")
public class Biometria {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY) // BigSerial no Postgres
    private Long id;

    @Column(name = "operador_id", nullable = false)
    private Long operadorId;

    @Column(name = "data_captura", nullable = false)
    private LocalDateTime dataCaptura = LocalDateTime.now();

    @Lob
    @Column(name = "template")
    private byte[] template;

    @Column(name = "formato", length = 20)
    private String formato;

    @Column(name = "observacoes", columnDefinition = "TEXT")
    private String observacoes;

    // --- getters/setters ---

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getOperadorId() { return operadorId; }
    public void setOperadorId(Long operadorId) { this.operadorId = operadorId; }

    public LocalDateTime getDataCaptura() { return dataCaptura; }
    public void setDataCaptura(LocalDateTime dataCaptura) { this.dataCaptura = dataCaptura; }

    public byte[] getTemplate() { return template; }
    public void setTemplate(byte[] template) { this.template = template; }

    public String getFormato() { return formato; }
    public void setFormato(String formato) { this.formato = formato; }

    public String getObservacoes() { return observacoes; }
    public void setObservacoes(String observacoes) { this.observacoes = observacoes; }
}
