package com.sistemadesaude.backend.operador.dto;


import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor; // Adicionado para consistência, embora não estritamente necessário aqui

@Getter
@Setter
@NoArgsConstructor // Adicionado para consistência
public class LoginRequest { // Nome alterado para consistência com outros DTOs

    @NotBlank(message = "Login não pode ser vazio")
    private String login;

    @NotBlank(message = "Senha não pode ser vazia")
    private String senha;

    // Construtor com argumentos pode ser útil para testes ou criação programática
    public LoginRequest(String login, String senha) {
        this.login = login;
        this.senha = senha;
    }
}
