package com.sistemadesaude.backend.operador.entity;

import com.sistemadesaude.backend.perfilacesso.entity.PerfilEntity;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Entity
@Table(name = "operador")
@Getter
@Setter
@ToString(exclude = {"perfis"})
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Operador implements UserDetails {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // SEUS CAMPOS ORIGINAIS MANTIDOS
    @Column(name = "login", nullable = false, unique = true)
    private String login;

    @Column(name = "senha", nullable = false)
    private String senha;

    @Column(name = "nome", nullable = false)
    private String nome;

    @Column(name = "cargo")
    private String cargo;

    @Column(name = "cpf", unique = true)
    private String cpf;

    @Column(name = "email", unique = true)
    private String email;

    @Column(name = "ativo", nullable = false)
    private Boolean ativo = true;

    @Column(name = "unidade_saude_id")
    private Long unidadeSaudeId;

    @Column(name = "unidade_atual_id")
    private Long unidadeAtualId;

    @Column(name = "is_master", nullable = false)
    private Boolean isMaster = false;

    @Column(name = "ultimo_login")
    private LocalDateTime ultimoLogin;

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


    // Mapeamento @ManyToMany com a tabela perfis
    // A tabela de junção operador_perfis tem (operador_id, perfil_id)
    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(
        name = "operador_perfis",
        joinColumns = @JoinColumn(name = "operador_id"),
        inverseJoinColumns = @JoinColumn(name = "perfil_id")
    )
    @Builder.Default
    private Set<PerfilEntity> perfis = new HashSet<>();


    // Converte os perfis para authorities do Spring Security
    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        if (perfis == null || perfis.isEmpty()) {
            return Collections.emptyList();
        }
        return this.perfis.stream()
                .filter(Objects::nonNull)
                .filter(p -> p.getTipo() != null)
                .map(perfil -> new SimpleGrantedAuthority("ROLE_" + perfil.getTipo().name()))
                .collect(Collectors.toList());
    }

    //
    // --- TODA A SUA LÓGICA DE NEGÓCIO ABAIXO FOI MANTIDA INTOCADA ---
    //
    @Override
    public String getPassword() {
        return this.senha;
    }

    @Override
    public String getUsername() {
        return this.login;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return this.ativo;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return this.ativo;
    }

    public boolean isMasterUser() {
        return this.isMaster != null && this.isMaster;
    }

    @Override
    public final boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Operador operador = (Operador) o;
        return id != null && Objects.equals(id, operador.id);
    }

    @Override
    public final int hashCode() {
        return getClass().hashCode();
    }

    public List<Long> getUnidadesComAcesso() {
        List<Long> unidades = new java.util.ArrayList<>();
        if (unidadeSaudeId != null) {
            unidades.add(unidadeSaudeId);
        }
        if (unidadeAtualId != null && !unidadeAtualId.equals(unidadeSaudeId)) {
            unidades.add(unidadeAtualId);
        }
        return unidades;
    }

    public String getStatusAcesso() {
        if (ultimoLogin == null) {
            return "Nunca logou";
        }
        LocalDateTime agora = LocalDateTime.now();
        if (ultimoLogin.isAfter(agora.minusMinutes(30))) {
            return "Online";
        }
        return "Offline";
    }

    public boolean temAcessoAUnidade(Long unidadeId) {
        if (unidadeId == null) {
            return false;
        }
        if (this.isMasterUser()) {
            return true;
        }
        if (this.unidadeSaudeId != null && this.unidadeSaudeId.equals(unidadeId)) {
            return true;
        }
        if (this.unidadeAtualId != null && this.unidadeAtualId.equals(unidadeId)) {
            return true;
        }
        return false;
    }
}
