package com.sistemadesaude.backend.hospitalar.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ConfiguracaoHospitalarDTO {

    private Long id;

    @NotBlank(message = "Parâmetro é obrigatório")
    @Size(max = 100, message = "Parâmetro não pode exceder 100 caracteres")
    private String parametro;

    @NotBlank(message = "Valor é obrigatório")
    @Size(max = 500, message = "Valor não pode exceder 500 caracteres")
    private String valor;

    @Size(max = 255, message = "Descrição não pode exceder 255 caracteres")
    private String descricao;

    @NotNull(message = "Tipo é obrigatório")
    private String tipo;

    private Boolean ativo = true;

    private Long unidadeId;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    // Campos auxiliares para exibição
    private String nomeUnidade;
    private String tipoDescricao;
    private String valorFormatado;
    private String createdAtFormatado;
    private String updatedAtFormatado;
}