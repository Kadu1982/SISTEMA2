package com.sistemadesaude.backend.operador.repository;

import com.sistemadesaude.backend.operador.entity.Operador;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface OperadorRepository extends JpaRepository<Operador, Long> {

    boolean existsByLogin(String login);
    
    boolean existsByCpf(String cpf);
    
    boolean existsByEmail(String email);

    /**
     * Busca por CPF (campo presente na entidade Operador)
     */
    Optional<Operador> findByCpf(String cpf);

    /**
     * Busca por login com fetch das coleções necessárias
     */
    @Query("SELECT o FROM Operador o " +
            "LEFT JOIN FETCH o.perfis " +
            "WHERE o.login = :login")
    Optional<Operador> findByLogin(@Param("login") String login);

    /**
     * Busca operadores por unidade (ID). Considera unidade principal e unidade atual.
     */
    @Query("SELECT o FROM Operador o " +
            "LEFT JOIN FETCH o.perfis " +
            "WHERE o.unidadeSaudeId = :unidadeId " +
            "OR o.unidadeAtualId = :unidadeId")
    List<Operador> findByUnidadeId(@Param("unidadeId") Long unidadeId);

    /**
     * Busca operadores ativos
     */
    @Query("SELECT o FROM Operador o " +
            "LEFT JOIN FETCH o.perfis " +
            "WHERE o.ativo = true")
    List<Operador> findByAtivoTrue();

    /**
     * Busca operadores master
     */
    @Query("SELECT o FROM Operador o " +
            "LEFT JOIN FETCH o.perfis " +
            "WHERE o.isMaster = true")
    List<Operador> findByIsMasterTrue();

    /**
     * Busca paginada por termo (nome ou login), ignorando maiúsculas/minúsculas.
     * Importante: não usar JOIN FETCH aqui para não quebrar a paginação.
     */
    Page<Operador> findByNomeContainingIgnoreCaseOrLoginContainingIgnoreCase(String nome, String login, Pageable pageable);
}
