package com.sistemadesaude.backend.paciente.entity;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Value Object que representa um endereço no sistema.
 * Classe imutável que encapsula dados de endereço.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Endereco {

    /**
     * Município/Cidade
     */
    @NotBlank(message = "Município é obrigatório")
    @Size(max = 100, message = "Município deve ter no máximo 100 caracteres")
    private String municipio;

    /**
     * CEP (Código de Endereçamento Postal)
     */
    @Pattern(regexp = "\\d{8}", message = "CEP deve conter 8 dígitos")
    private String cep;

    /**
     * Logradouro (rua, avenida, etc.)
     */
    @Size(max = 200, message = "Logradouro deve ter no máximo 200 caracteres")
    private String logradouro;

    /**
     * Número da residência/estabelecimento
     */
    @Size(max = 10, message = "Número deve ter no máximo 10 caracteres")
    private String numero;

    /**
     * Bairro
     */
    @Size(max = 100, message = "Bairro deve ter no máximo 100 caracteres")
    private String bairro;

    /**
     * Complemento (apartamento, bloco, etc.)
     */
    @Size(max = 100, message = "Complemento deve ter no máximo 100 caracteres")
    private String complemento;

    /**
     * Constrói um endereço básico com município, CEP e logradouro
     */
    public Endereco(String municipio, String cep, String logradouro) {
        this.municipio = municipio;
        this.cep = cep;
        this.logradouro = logradouro;
    }

    /**
     * Retorna o endereço formatado para exibição
     */
    public String getEnderecoCompleto() {
        StringBuilder sb = new StringBuilder();

        if (logradouro != null && !logradouro.trim().isEmpty()) {
            sb.append(logradouro);
        }

        if (numero != null && !numero.trim().isEmpty()) {
            if (sb.length() > 0) sb.append(", ");
            sb.append(numero);
        }

        if (complemento != null && !complemento.trim().isEmpty()) {
            if (sb.length() > 0) sb.append(", ");
            sb.append(complemento);
        }

        if (bairro != null && !bairro.trim().isEmpty()) {
            if (sb.length() > 0) sb.append(" - ");
            sb.append(bairro);
        }

        if (municipio != null && !municipio.trim().isEmpty()) {
            if (sb.length() > 0) sb.append(" - ");
            sb.append(municipio);
        }

        if (cep != null && !cep.trim().isEmpty()) {
            if (sb.length() > 0) sb.append(" - CEP: ");
            // Formata CEP: 12345678 -> 12345-678
            String cepFormatted = formatarCep(cep);
            sb.append(cepFormatted);
        }

        return sb.toString();
    }

    /**
     * Retorna apenas a linha do endereço (logradouro + número)
     */
    public String getLinhaEndereco() {
        StringBuilder sb = new StringBuilder();

        if (logradouro != null && !logradouro.trim().isEmpty()) {
            sb.append(logradouro);
        }

        if (numero != null && !numero.trim().isEmpty()) {
            if (sb.length() > 0) sb.append(", ");
            sb.append(numero);
        }

        return sb.toString();
    }

    /**
     * Retorna a localização (bairro + município)
     */
    public String getLocalizacao() {
        StringBuilder sb = new StringBuilder();

        if (bairro != null && !bairro.trim().isEmpty()) {
            sb.append(bairro);
        }

        if (municipio != null && !municipio.trim().isEmpty()) {
            if (sb.length() > 0) sb.append(" - ");
            sb.append(municipio);
        }

        return sb.toString();
    }

    /**
     * Formata o CEP no padrão 12345-678
     */
    private String formatarCep(String cep) {
        if (cep == null || cep.trim().isEmpty()) {
            return cep;
        }

        String cepLimpo = cep.replaceAll("\\D", "");
        if (cepLimpo.length() == 8) {
            return cepLimpo.substring(0, 5) + "-" + cepLimpo.substring(5);
        }

        return cep;
    }

    /**
     * Valida se o endereço tem dados mínimos necessários
     */
    public boolean isValido() {
        return municipio != null && !municipio.trim().isEmpty();
    }

    /**
     * Verifica se o endereço está completo (todos os campos principais preenchidos)
     */
    public boolean isCompleto() {
        return isValido() &&
                cep != null && !cep.trim().isEmpty() &&
                logradouro != null && !logradouro.trim().isEmpty() &&
                bairro != null && !bairro.trim().isEmpty();
    }

    /**
     * Cria uma cópia do endereço com município alterado
     */
    public Endereco comMunicipio(String novoMunicipio) {
        return Endereco.builder()
                .municipio(novoMunicipio)
                .cep(this.cep)
                .logradouro(this.logradouro)
                .numero(this.numero)
                .bairro(this.bairro)
                .complemento(this.complemento)
                .build();
    }

    /**
     * Cria uma cópia do endereço com CEP alterado
     */
    public Endereco comCep(String novoCep) {
        return Endereco.builder()
                .municipio(this.municipio)
                .cep(novoCep)
                .logradouro(this.logradouro)
                .numero(this.numero)
                .bairro(this.bairro)
                .complemento(this.complemento)
                .build();
    }

    @Override
    public String toString() {
        return getEnderecoCompleto();
    }
}
