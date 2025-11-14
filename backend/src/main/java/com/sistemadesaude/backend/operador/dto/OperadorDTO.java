package com.sistemadesaude.backend.operador.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
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
    
    @NotBlank(message = "Login é obrigatório")
    @Size(min = 4, message = "Login deve ter no mínimo 4 caracteres")
    private String login;
    
    @Size(min = 6, message = "Senha deve ter no mínimo 6 caracteres")
    private String senha; // Usado apenas para criação/atualização
    
    @NotBlank(message = "Nome é obrigatório")
    @Size(min = 3, message = "Nome deve ter no mínimo 3 caracteres")
    private String nome;
    
    private String cargo;
    
    @NotBlank(message = "CPF é obrigatório")
    @Size(min = 11, max = 11, message = "CPF deve ter exatamente 11 caracteres")
    private String cpf;
    
    private String cns; // opcional
    
    @Email(message = "Email deve ter um formato válido")
    private String email;
    
    private Boolean ativo;
    private List<String> perfis;
    private List<String> modulos; // Módulos aos quais o operador tem acesso
    private java.util.Map<String, java.util.List<Long>> modulosUnidades; // Módulos vinculados a unidades específicas
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
