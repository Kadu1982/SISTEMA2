package com.sistemadesaude.backend.configuracoes.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * DTO para transferência de dados de configuração
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ConfiguracaoDTO {

    /**
     * Chave única da configuração
     */
    @NotBlank(message = "A chave é obrigatória")
    @Size(max = 100, message = "A chave deve ter no máximo 100 caracteres")
    private String chave;

    /**
     * Valor da configuração
     */
    @NotBlank(message = "O valor é obrigatório")
    private String valor;

    /**
     * Descrição da configuração
     */
    private String descricao;

    /**
     * Grupo da configuração (para organização)
     */
    @Size(max = 50, message = "O grupo deve ter no máximo 50 caracteres")
    private String grupo;

    /**
     * Tipo de dado da configuração (string, number, boolean, json, etc.)
     */
    @Size(max = 20, message = "O tipo deve ter no máximo 20 caracteres")
    private String tipo;

    /**
     * Indica se a configuração é editável pela interface
     */
    private Boolean editavel;

    /**
     * Valores possíveis para a configuração (para campos de seleção)
     */
    private String valoresPossiveis;

    /**
     * Data de criação do registro
     */
    private LocalDateTime dataCriacao;

    /**
     * Data da última atualização do registro
     */
    private LocalDateTime dataAtualizacao;

    /**
     * Usuário que criou o registro
     */
    private String criadoPor;

    /**
     * Usuário que atualizou o registro pela última vez
     */
    private String atualizadoPor;
}
