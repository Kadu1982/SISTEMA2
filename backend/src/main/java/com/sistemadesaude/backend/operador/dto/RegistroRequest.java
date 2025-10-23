package com.sistemadesaude.backend.operador.dto;

import jakarta.validation.constraints.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class RegistroRequest {

    @NotBlank
    private String nome;

    @Email
    @NotBlank
    private String email;

    @NotBlank
    @Size(min = 11, max = 11)
    private String cpf;

    @NotBlank
    @Size(min = 7, max = 12)
    @Pattern(regexp = "^[a-zA-Z]+\\.[a-zA-Z]+$", message = "Login inválido (ex: nome.sobrenome)")
    private String login;

    @NotBlank
    @Size(min = 8, max = 32)
    @Pattern(
            regexp = "^(?=.*[A-Z])(?=.*\\d)(?=.*[!@#$%^&*()_+\\-=\\[\\]{};':\"\\\\|,.<>\\/?]).{8,32}$",
            message = "Senha inválida. Requisitos: 1 letra maiúscula, 1 número e 1 caractere especial."
    )
    private String senha;

    @NotBlank
    private String perfil;
}
