package com.sistemadesaude.backend.operador.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

/**
 * DTO simplificado para listagem de operadores.
 * Contém apenas informações essenciais para exibição em listas.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OperadorListDTO {

    private Long id;
    private String login;
    private String nome;
    private String cargo;
    private Boolean ativo;
    private List<String> perfis;
    private Boolean isMaster;

    // Campos da unidade de lotação
    private Long unidadeId;
    private String nomeUnidade;

    // Informações da unidade atual (onde o operador está logado)
    private Long unidadeAtualId;
    private String nomeUnidadeAtual;

    private LocalDateTime ultimoLogin;

    // ✅ CORREÇÃO: O campo 'statusAcesso' foi readicionado.
    // Este campo é preenchido pelo OperadorMapper e sua ausência causava o erro de compilação.
    private String statusAcesso;

    /**
     * Calcula o status de acesso baseado no último login.
     * Este método pode ser usado caso o campo 'statusAcesso' não tenha sido preenchido.
     */
    public String getStatusAcesso() {
        // Se o campo já foi preenchido pelo mapper, retorna o valor existente.
        if (this.statusAcesso != null && !this.statusAcesso.isEmpty()) {
            return this.statusAcesso;
        }
        // Lógica de fallback caso o campo não tenha sido preenchido
        if (ultimoLogin == null) {
            return "Nunca logou";
        }
        if (ultimoLogin.isAfter(LocalDateTime.now().minusMinutes(30))) {
            return "Online";
        }
        return "Offline";
    }

    /**
     * Verifica se o operador está ativo e pode fazer login.
     */
    public boolean podeLogar() {
        return ativo != null && ativo;
    }

    /**
     * Verifica se é um operador master/administrador.
     */
    public boolean isAdministrador() {
        return isMaster != null && isMaster;
    }

    /**
     * Retorna os perfis como string formatada.
     */
    public String getPerfisFormatados() {
        if (perfis == null || perfis.isEmpty()) {
            return "Nenhum perfil";
        }
        return String.join(", ", perfis);
    }

    /**
     * Retorna o nome de exibição do operador.
     */
    public String getNomeExibicao() {
        return nome != null ? nome : login;
    }

    /**
     * Verifica se possui perfil específico.
     */
    public boolean temPerfil(String perfil) {
        return perfis != null && perfis.contains(perfil);
    }

    /**
     * Retorna indicador visual do status.
     */
    public String getIndicadorStatus() {
        if (!podeLogar()) {
            return "🔴"; // Inativo
        }
        return switch (getStatusAcesso()) {
            case "Online" -> "🟢";
            case "Offline" -> "🟡";
            default -> "⚪";
        };
    }
}
