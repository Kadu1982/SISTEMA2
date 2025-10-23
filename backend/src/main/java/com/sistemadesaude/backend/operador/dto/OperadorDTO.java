package com.sistemadesaude.backend.operador.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OperadorDTO {

    private Long id;
    private String login;
    private String senha; // Usado apenas para criação/atualização
    private String nome;
    private String cargo;
    @NotBlank(message = "CPF é obrigatório")
    private String cpf;
    private String cns; // opcional
    private String email;
    private Boolean ativo;
    private List<String> perfis;
    private Boolean isMaster;

    // Informações da unidade
    private Long unidadeId;
    private String nomeUnidade;

    // Informações da unidade atual
    private Long unidadeAtualId;
    private String nomeUnidadeAtual;

    // Informações de auditoria
    private LocalDateTime ultimoLogin;
    private LocalDateTime dataCriacao;
    private LocalDateTime dataAtualizacao;
    private String criadoPor;
    private String atualizadoPor;

    /**
     * Retorna o nome de exibição do operador
     */
    public String getNomeExibicao() {
        return nome != null ? nome : login;
    }

    /**
     * Verifica se o operador está ativo
     */
    public boolean isAtivo() {
        return ativo != null && ativo;
    }

    /**
     * Verifica se é um operador master/administrador
     */
    public boolean isAdministrador() {
        return isMaster != null && isMaster;
    }

    /**
     * Retorna os perfis como string formatada
     */
    public String getPerfisFormatados() {
        if (perfis == null || perfis.isEmpty()) {
            return "Nenhum perfil";
        }
        return String.join(", ", perfis);
    }

    /**
     * Verifica se possui perfil específico
     */
    public boolean temPerfil(String perfil) {
        return perfis != null && perfis.contains(perfil);
    }

    /**
     * Retorna o status de acesso baseado no último login
     */
    public String getStatusAcesso() {
        if (ultimoLogin == null) {
            return "Nunca logou";
        }

        // Considera online se logou nas últimas 30 minutos
        LocalDateTime agora = LocalDateTime.now();
        if (ultimoLogin.isAfter(agora.minusMinutes(30))) {
            return "Online";
        }

        return "Offline";
    }

    /**
     * Verifica se tem permissão para acessar unidade específica
     */
    public boolean podeAcessarUnidade(Long unidadeId) {
        return isAdministrador() ||
                (this.unidadeId != null && this.unidadeId.equals(unidadeId)) ||
                (this.unidadeAtualId != null && this.unidadeAtualId.equals(unidadeId));
    }
}
