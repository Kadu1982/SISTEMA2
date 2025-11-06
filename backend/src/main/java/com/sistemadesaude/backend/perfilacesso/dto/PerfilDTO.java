package com.sistemadesaude.backend.perfilacesso.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.sistemadesaude.backend.perfilacesso.entity.Perfil;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Set;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PerfilDTO {
    private Long id;
    private Perfil tipo;
    private String codigo;
    private String nomeExibicao;
    private String nomeCustomizado;
    private String descricao;
    private Boolean ativo;
    private Integer nivel;
    private Integer nivelCustomizado;
    private Set<String> permissoes;
    private Set<String> modulos;
    private Boolean sistemaPerfil;
    private LocalDateTime dataCriacao;
    private LocalDateTime dataAtualizacao;
    private String criadoPor;
    private String atualizadoPor;

    // Flags de conveniência
    private Boolean isAdmin;
    private Boolean isProfissionalSaude;

    // Método de compatibilidade para o service atual
    public String getNome() {
        return nomeExibicao;
    }

    public void setNome(String nome) {
        this.nomeCustomizado = nome;
    }
    
    /**
     * Retorna o tipo como string para serialização JSON
     * Garante que o enum seja serializado como string no JSON
     */
    @JsonProperty("tipo")
    public String getTipoAsString() {
        return tipo != null ? tipo.name() : null;
    }
    
    /**
     * Setter para compatibilidade - aceita string e converte para enum
     */
    public void setTipoAsString(String tipoString) {
        if (tipoString != null) {
            try {
                this.tipo = Perfil.valueOf(tipoString);
            } catch (IllegalArgumentException e) {
                // Se não conseguir converter, mantém null
                this.tipo = null;
            }
        } else {
            this.tipo = null;
        }
    }
}
