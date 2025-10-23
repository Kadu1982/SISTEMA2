package com.sistemadesaude.backend.unidadesaude.dto;

import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DocumentoUnidadeDTO {
    private Long id;

    @Size(max = 100)
    private String tipoConvenio;

    private Boolean retencaoTributos;

    @Size(max = 100)
    private String alvaraNumero;

    @FutureOrPresent(message = "Validade do alvará deve ser hoje ou futura")
    private LocalDate alvaraValidade;

    @Size(max = 100)
    private String banco;

    @Size(max = 20)
    private String agencia;

    @Size(max = 30)
    private String conta;

    @Size(max = 200)
    private String pix;
}
