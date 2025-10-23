package com.sistemadesaude.backend.profissional.dto;

import lombok.*;

import java.time.LocalDate;

@Getter @Setter @Builder
@AllArgsConstructor @NoArgsConstructor
public class DocumentosDTO {
    public String cpf;
    public String rgNumero;
    public String rgOrgaoEmissor;
    public String rgUf;
    public LocalDate rgDataEmissao;
    public String pisPasep;
    public String ctpsNumero;
    public String ctpsSerie;
    public String ctpsUf;
    public String tituloEleitor;
}
