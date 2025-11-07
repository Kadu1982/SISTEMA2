package com.sistemadesaude.backend.perfilacesso.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

/**
 * Entidade que representa um perfil de acesso no sistema
 */
@Entity
@Table(name = "perfis")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PerfilEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * Tipo do perfil baseado no enum
     *
     * Observação: há bancos legados com tipo = null. Os getters abaixo
     * tratam null-safety para evitar NPE em getNomeExibicao(), getCodigo() e getNivel().
     */
    @Convert(converter = com.sistemadesaude.backend.perfilacesso.converter.PerfilTypeConverter.class)
    @Column(name = "tipo", nullable = false)
    private Perfil tipo;

    /**
     * Nome "oficial" do perfil (coluna exigida como NOT NULL em alguns bancos)
     * Mantemos sincronizado com nomeCustomizado ou com a descrição do enum.
     */
    @Column(name = "nome", nullable = false, length = 100)
    private String nome;

    /**
     * Nome customizado do perfil (opcional)
     */
    @Column(name = "nome_customizado", length = 100)
    private String nomeCustomizado;

    /**
     * Descrição específica desta instância do perfil
     */
    @Column(name = "descricao", columnDefinition = "TEXT")
    private String descricao;

    /**
     * Se o perfil está ativo
     */
    @Column(name = "ativo", nullable = false)
    @Builder.Default
    private Boolean ativo = true;

    /**
     * Nível hierárquico customizado (senão usa do enum)
     */
    @Column(name = "nivel_customizado")
    private Integer nivelCustomizado;

    /**
     * Lista de permissões específicas deste perfil
     */
    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(
            name = "perfil_acesso_permissoes",
            joinColumns = @JoinColumn(name = "perfil_id")
    )
    @Column(name = "permissao")
    @Builder.Default
    private Set<String> permissoes = new HashSet<>();

    /**
     * Módulos que o perfil pode acessar
     */
    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(
            name = "perfil_acesso_modulos",
            joinColumns = @JoinColumn(name = "perfil_id")
    )
    @Column(name = "modulo")
    @Builder.Default
    private Set<String> modulos = new HashSet<>();

    /**
     * Indica se o perfil é um perfil de sistema (não pode ser excluído)
     */
    @Column(name = "sistema_perfil", nullable = false)
    @Builder.Default
    private Boolean sistemaPerfil = false;

    @CreationTimestamp
    @Column(name = "data_criacao", nullable = false, updatable = false)
    private LocalDateTime dataCriacao;

    @UpdateTimestamp
    @Column(name = "data_atualizacao")
    private LocalDateTime dataAtualizacao;

    @Column(name = "criado_por", length = 50)
    private String criadoPor;

    @Column(name = "atualizado_por", length = 50)
    private String atualizadoPor;

    // Callbacks para garantir defaults e normalização

    @PrePersist
    public void prePersist() {
        if (ativo == null) {
            ativo = true;
        }
        if (sistemaPerfil == null) {
            sistemaPerfil = false;
        }
        if (permissoes == null) {
            permissoes = new HashSet<>();
        }
        if (modulos == null) {
            modulos = new HashSet<>();
        }
        normalizarColecoes();
        syncNome();
    }

    @PreUpdate
    public void preUpdate() {
        // ✅ NÃO mexe em permissões/módulos no PreUpdate
        // Apenas sincroniza o nome
        syncNome();
    }

    private void normalizarColecoes() {
        if (permissoes != null) {
            permissoes = permissoes.stream()
                    .filter(s -> s != null && !s.isBlank())
                    .map(s -> s.trim().toUpperCase())
                    .collect(java.util.stream.Collectors.toCollection(HashSet::new));
        }
        if (modulos != null) {
            modulos = modulos.stream()
                    .filter(s -> s != null && !s.isBlank())
                    .map(s -> s.trim().toUpperCase())
                    .collect(java.util.stream.Collectors.toCollection(HashSet::new));
        }
    }

    /**
     * Garante que a coluna 'nome' (NOT NULL) seja sempre preenchida.
     * Prioridade:
     * 1) nomeCustomizado não-vazio
     * 2) descrição do enum (tipo) se disponível
     * 3) "Perfil"
     */
    private void syncNome() {
        String base = null;
        if (nomeCustomizado != null && !nomeCustomizado.isBlank()) {
            base = nomeCustomizado.trim();
        } else if (tipo != null && tipo.getDescricao() != null && !tipo.getDescricao().isBlank()) {
            base = tipo.getDescricao().trim();
        } else {
            base = "Perfil";
        }
        this.nome = base;
    }

    // Métodos de conveniência

    /**
     * Retorna o nome a ser exibido (customizado ou do enum)
     * Null-safe: se tipo for null, retorna fallback.
     */
    public String getNomeExibicao() {
        if (nomeCustomizado != null && !nomeCustomizado.isBlank()) {
            return nomeCustomizado;
        }
        if (tipo != null) {
            return tipo.getDescricao();
        }
        return "Perfil sem tipo";
    }

    /**
     * Retorna o código do perfil
     * Null-safe: se tipo for null, deriva do nomeCustomizado ou retorna "DESCONHECIDO".
     */
    public String getCodigo() {
        if (tipo != null) {
            return tipo.getCodigo();
        }
        if (nomeCustomizado != null && !nomeCustomizado.isBlank()) {
            return nomeCustomizado.trim().toUpperCase().replace(' ', '_');
        }
        return "DESCONHECIDO";
    }

    /**
     * Retorna o nível hierárquico (customizado ou do enum)
     * Null-safe: se tudo for null, retorna 999 para manter ordenação previsível.
     */
    public Integer getNivel() {
        if (nivelCustomizado != null) {
            return nivelCustomizado;
        }
        if (tipo != null) {
            return tipo.getNivel();
        }
        return 999;
    }

    /**
     * Verifica se tem uma permissão específica
     */
    public boolean temPermissao(String permissao) {
        return permissoes != null && permissao != null && permissoes.contains(permissao.toUpperCase());
    }

    /**
     * Verifica se pode acessar um módulo
     */
    public boolean podeAcessarModulo(String modulo) {
        return modulos != null && modulo != null && modulos.contains(modulo.toUpperCase());
    }

    /**
     * Adiciona uma permissão
     */
    public void adicionarPermissao(String permissao) {
        if (permissoes == null) permissoes = new HashSet<>();
        if (permissao != null) {
            permissoes.add(permissao.toUpperCase());
        }
    }

    /**
     * Adiciona um módulo
     */
    public void adicionarModulo(String modulo) {
        if (modulos == null) modulos = new HashSet<>();
        if (modulo != null) {
            modulos.add(modulo.toUpperCase());
        }
    }

    /**
     * Remove uma permissão
     */
    public void removerPermissao(String permissao) {
        if (permissoes != null && permissao != null) {
            permissoes.remove(permissao.toUpperCase());
        }
    }

    /**
     * Remove um módulo
     */
    public void removerModulo(String modulo) {
        if (modulos != null && modulo != null) {
            modulos.remove(modulo.toUpperCase());
        }
    }

    /**
     * Verifica se é perfil administrativo
     * Null-safe.
     */
    public boolean isAdmin() {
        return tipo != null && tipo.isAdmin();
    }

    /**
     * Verifica se é profissional de saúde
     * Null-safe.
     */
    public boolean isProfissionalSaude() {
        return tipo != null && tipo.isProfissionalSaude();
    }
}
