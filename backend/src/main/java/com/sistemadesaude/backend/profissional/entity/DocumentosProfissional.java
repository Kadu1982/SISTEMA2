package com.sistemadesaude.backend.profissional.entity;

import jakarta.persistence.Embeddable;
import lombok.*;

import java.time.LocalDate;

/**
 * Documentos do profissional (estrutura simplificada e suficiente para 1ª entrega).
 * Se desejar, você pode normalizar cada documento em tabela própria futuramente.
 */
@Embeddable
@Getter @Setter @Builder
@AllArgsConstructor @NoArgsConstructor
public class DocumentosProfissional {
    // CPF validado na camada de serviço
    private String cpf;

    // RG
    private String rgNumero;
    private String rgOrgaoEmissor;
    private String rgUf;
    private LocalDate rgDataEmissao;

    // PIS/PASEP
    private String pisPasep;

    // CTPS
    private String ctpsNumero;
    private String ctpsSerie;
    private String ctpsUf;

    // Título de eleitor
    private String tituloEleitor;
}
